import ReactPelFactory from '../factory/ReactPelFactory';
import VuePelFactory from '../factory/VuePelFactory';
import webpackExternals from '@gw/wind-pack-externals';
import ky from 'ky';
import debug from 'debug';
import loadjs from 'loadjs';

const BASE_SERVICE_URL = (window.top.fdreConfig && window.top.fdreConfig.baseServiceUrl) ? window.top.fdreConfig.baseServiceUrl : '/api',
    // 组态化组件资源服务地址
    log = debug('editor:fc-loader'),
    important = debug('important'),
    loadProjectDepenecies = async(appName, projectId) => {
        if (appName && projectId) {
            const jsonLoaded = await ky.get(`${BASE_SERVICE_URL}/project/packages?app=${appName}&id=${projectId}`).json();

            return jsonLoaded;
        } else if (appName) {
            const jsonLoaded = await ky.get(`${BASE_SERVICE_URL}/app/packages?name=${appName}`).json();

            return jsonLoaded;
        }
    },
    /**
     * 合并组件包列表，按项目->应用->平台的次序。
     * @param {Array} projects 项目组件包
     * @param {Array} apps 应用组件包
     * @param {Array} platforms 平台组件包 不为空
     * @returns {Array} 合并后的组件包列表
     */
    mergeMarkPackages = (projects, apps, platforms) => {
        const result = projects || apps || platforms;

        projects && projects.forEach(pkg => {
            pkg.from = 'project';
        });

        if (apps) {
            for (const pkg of apps) {
                if (result.filter(one => one.name === pkg.name).length === 0) {
                    pkg.from = 'app';
                    result.push(pkg);
                }
            }
        }
        if (platforms) {
            for (const pkg of platforms) {
                if (result.filter(one => one.name === pkg.name).length === 0) {
                    pkg.from = 'platform';
                    result.push(pkg);
                }
            }
        }
        return result.filter(pkg => pkg.name.startsWith('@gw'));
    },
    getConcatPath = async(paths) => {
        const jsonLoaded = await ky.post(`${BASE_SERVICE_URL}/assets/concat`, {
            json: { files: paths }
        }).json();

        return '/npm_packages' + jsonLoaded.data.concatPath;
    };

if (window.top.globalExternalConfig) {
    webpackExternals.externals.push(...window.top.globalExternalConfig);
}
/**
 * 组件定义（js及其依赖）加载服务类
 * @class
 */
class FCLoader {
    /**
   * 构造器
   * @param {string} baseUrl  图元下载基础地址
   * @param {object} opts 第三方依赖定义信息，这个配置会覆盖 @gw/wind-pack-externals 中webpackExternals 定义
   */
    constructor(baseUrl, opts) {
        this.baseUrl = baseUrl || '';
        important('组件加载器地址配置为： ' + this.baseUrl);

        /** @property 前端组件加载缓存 key: 组件lib名称或加载地址  value: 组件fcp */
        this.fcCache = {};
        /** @property 加载的前端npm包描述缓存 */
        this.packageJSONCache = {};
        // 未安装的组件包列表
        this.packageNotInstalled = [];
        // 加载的字体列表
        this.loadedFonts = [];
        // 支持打包形式为amd的组件包的加载
        window.define = this.define;
        // 已经加载的前端组件的第三方依赖库
        window.fcExternalLoaded = [];

        // 调试服务的地址
        this.debugUrl = null;
        // 调试组件包名称
        this.debugPackageName = null;

        this.packageLoadingPromises = {};

        this.externalOptions = opts || {};

        if (window.top.fdreConfig && window.top.fdreConfig.loaderOptions) {
            Object.assign(this.externalOptions, window.top.fdreConfig.loaderOptions);
        }

        this.scriptLoadingPromises = {};

        // 组件加载器回调事件
        this.eventCallbacks = [];

        // 脚本地址对应的lib名称
        this.scriptUrlLibName = {};

        this.pelCacheByLibName = {};

        // 组件加载中的Map
        this.fcLoadingMap = new Map();
    }

    /**
     * 设置第三方库的加载额外定义信息
     * @param {object} opts 这个配置会覆盖 webpackExternals 定义
     */
    setExternalOptions(opts) {
        this.externalOptions = opts;
    }

    setAppName(appName) {
        if (appName) {
            this.appName = appName;
        }
    }

    setProjectId(projectId) {
        if (projectId) {
            this.projectId = projectId;
        }
    }

    setDebugUrl(debugUrl) {
        this.debugUrl = debugUrl;
    }

    setDebugPackageName(debugPackageName) {
        this.debugPackageName = debugPackageName;
    }

    getServePath(isProject) {
        if (isProject && this.projectId) {
            return this.baseUrl + '/' + this.appName + '/' + this.projectId;
        } else if (this.appName) {
            return this.baseUrl + '/' + this.appName;
        } else {
            return this.baseUrl;
        }
    }

    /**
   * 获取图元的url地址， 图元url将作为图元的唯一标识，此方法根据图元定义->图元url进行统一转换
   * @param {object} pel 图元定义 {packageName, version, path} 键值对象
   * @returns {string}
   */
    getPelUrl(pel) {
        if (pel.packageName === this.debugPackageName && this.debugUrl) {
            return `${this.debugUrl}${pel.path}`;
        } else {
            return `${pel.packageName}/${pel.path}`;
        }
    }

    /**
   * 获取图元的服务对象的名称
   * @param {object} pel 图元定义
   * @returns {string}
   */
    getComponentLibName(pel) {
        return new URL(pel.path, `http://any.com/${pel.packageName}/`).pathname.substr(1);
    }

    /**
     * 获取或者加载（图元js文件已经load）图元的fcp对象
     */
    async getInitComponent(pel) {
        try {
            // 拼接组件url（加版本号）
            const componentUrl = this.getPelUrl(pel);

            if (this.fcCache[componentUrl]) {
                return this.fcCache[componentUrl];
            } else {
                // 组件库更新了，保证之前绘制的组件版本仍然可用
                const pelLibName = this.getComponentLibName(pel),
                    esModule = window[pelLibName];

                if (esModule && esModule.default) {
                    const fcp = esModule && esModule.default;

                    await this.initFcp(fcp, pel);
                    this.fcCache[componentUrl] = fcp;
                    this.setPelLoaded(componentUrl, fcp);
                    return fcp;
                }
                return null;
            }
        } catch (e) {
            console.log(`There is no ${pel} component`);
            return null;
        }
    }

    /**
     * 获取组件
     * 优先从fcCache 中获取（依赖版本）；再从window下获取（不依赖版本）
     * @param {*} pel
     */
    getComponent(pel) {
        // 拼接组件url（加版本号）
        const componentUrl = this.getPelUrl(pel);

        if (this.fcCache[componentUrl]) {
            return this.fcCache[componentUrl];
        } else {
            return null;
        }
    }

    /**
    * 加载图元对外部的代码依赖
    * @param {Array} externals 外部依赖库列表
    */
    async loadPelExternals(externals) {
        const webpackExternalsMerged = Object.assign(webpackExternals, window.globalExternalConfig);

        for (const external of externals) {
            // 获取外部依赖库的下载地址 external为图元中声明的依赖库名称 例如 'echarts'
            const externalModule = webpackExternalsMerged.externals.filter(ex => external === ex.module)[0];

            // 有声明则下载，否则忽略
            if (externalModule) {
                // 判断第三方库如果已经在全局加载，则直接使用全局的库
                if (externalModule.root && window[externalModule.root]) {
                    continue;
                }

                // 首先递归下载依赖的依赖
                if (externalModule.dependencies) {
                    await this.loadPelExternals(externalModule.dependencies);
                }

                const externalLibPath = externalModule.dist
                    ? `${this.getServePath()}/npm_packages/${externalModule.dist}`
                    : `${this.getServePath()}/npm_packages/${externalModule.prod}`;

                if (externalModule.style) {
                    // 外界定义的样式加载地址
                    if (this.externalOptions[externalModule.module] != null) {
                        if (Array.isArray(this.externalOptions[externalModule.module])) {
                            try {
                                for (const externalCssPath of this.externalOptions[externalModule.module]) {
                                    await this.loadScript(externalCssPath);
                                }
                            } catch (e) {
                                console.warn('加载应用定义的样式失败 地址是:' + this.externalOptions[externalModule.module]);
                            }
                        } else if (typeof this.externalOptions[externalModule.module] === 'string') {
                            try {
                                await this.loadScript(this.externalOptions[externalModule.module]);
                            } catch (e) {
                                console.warn('加载应用定义的样式失败 地址是:' + this.externalOptions[externalModule.module]);
                            }
                        }
                    } else if (typeof externalModule.style === 'string') {
                        await this.loadScript(`${this.getServePath()}/npm_packages/${externalModule.style}`);
                        // await this.loadCss(`${this.getServePath()}/npm_packages/${externalModule.style}`);
                    }
                }

                if (!this.scriptLoadingPromises[externalLibPath]) {
                    // loadjs会自动处理重复加载的问题，因此此处无需做额外处理
                    this.scriptLoadingPromises[externalLibPath] = (async() => {
                        try {
                            log('加载第三方库:' + externalLibPath);

                            await loadjs(externalLibPath, {
                                returnPromise: true,
                                before: function(scriptPath, scriptEl) {
                                    scriptEl.crossOrigin = true;
                                }
                            });
                        } catch (e) {
                            console.error('第三方库加载异常 ', `${this.baseUrl}/${externalModule.module}@latest/${externalModule.dist}`);
                        }
                    })();
                }

                await this.scriptLoadingPromises[externalLibPath];
                // 这里必须加载完成才标志为loaded。否则外部可能请求并发下载，那么后面的并发判断成功但加载未完成
                window.fcExternalLoaded.push(externalModule.module);
            } else {
                log('忽略库:' + external);
            }
        }
    }

    /**
     * 加载指定的字体（按名称）
     * @param name 字体名称
     * @param pkg 字体所在的图元包,包括名称和版本默认为@gw/web-font-assets@latest
     */
    async loadFont(pkg, name, url) {
        if (!name || this.loadedFonts.indexOf(name) > -1) {
            return;
        }
        if (name === 'default') {
            // 默认字体不需要加载
            return;
        }
        try {
            const fontFaceName = pkg ? (pkg + '/' + url) : name;
            let fontUrl = this.getServePath() + '/npm_packages/' + (pkg ? (pkg + '/' + url) : name);

            // 这是对110的字体加载的兼容， 110图纸中，字体是直接按名称保存到图元中的 例如 groteskia，没有直接提供字体地址的url。 所以需要根据字体包中JSON的定义获取具体的字体url
            // 进行进一步的加载
            if (!pkg && !url && name.indexOf('.woff') === -1) {
                await this.confirmPackageDependencies('@gw/web-font-assets');
                if (this.packageJSONCache['@gw/web-font-assets']) {
                    if (this.packageJSONCache['@gw/web-font-assets'].fonts[name]) {
                        fontUrl = this.getServePath() + '/npm_packages/@gw/web-font-assets/' + this.packageJSONCache['@gw/web-font-assets'].fonts[name].url;
                    }
                } else {
                    console.error('加载字体地址未找到', name);
                }

                // https://localhost:3001/scada/npm_packages/@gw/web-font-assets/package.json
            }

            // name 直接提供完整地址的情况
            const ff = new FontFace(fontFaceName, `url(${fontUrl})`);

            await ff.load();
            document.fonts.add(ff);

            this.loadedFonts.push(name);
        } catch (e) {
            console.error('加载字体异常', name, pkg, e);
        }
    }

    async loadCss(href) {
        // Create new link Element
        const link = document.createElement('link');

        // set the attributes for link element
        link.rel = 'stylesheet';

        link.type = 'text/css';

        link.href = href;

        // Get HTML head element to append
        // link element to it
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    }

    async loadScript(url) {
        if (!this.scriptLoadingPromises[url]) {
            // loadjs会自动处理重复加载的问题，因此此处无需做额外处理
            this.scriptLoadingPromises[url] = (async() => {
                try {
                    log('加载库:' + url);
                    await loadjs(url, {
                        returnPromise: true,
                        before: function(scriptPath, scriptEl) {
                            scriptEl.crossOrigin = true;
                        }
                    });
                } catch (e) {
                    console.error('第三方库加载异常 ', `${url}`);
                }
            })();
        }
        await this.scriptLoadingPromises[url];
    }

    /**
     * 加载前端组件的代码，支持2种方式 globalThis 及 amd
     */
    async loadFCScript(url, pelLibName, packageName) {
        const packageInfo = this.packageJSONCache[packageName];

        if (!packageInfo) {
            throw new Error('加载前端组件：组件包未安装', url);
        }

        let scriptUrl = `${this.getServePath(packageInfo._appName == null)}/npm_packages/${url}`;

        // 从本地调试加载组件代码
        if (this.debugUrl && this.debugPackageName === packageName) {
            scriptUrl = `${this.debugUrl}${url}`;
        }

        if (url.startsWith('http')) {
            scriptUrl = url;
        }

        // 加载图元脚本，其中每个图元在编译时都已经设置到了window根上，以图元url为可以key
        await this.loadScript(scriptUrl);

        this.scriptUrlLibName[scriptUrl] = pelLibName;
        // globalThis方式
        if (window[pelLibName]) {
            return window[pelLibName];
        } else {
            if (window.fcLoadCallback) {
                // amd方式， 再后面的define方法中加载完成后会进行回调
                return new Promise((resolve, reject) => {
                    window.fcLoadCallbacks[pelLibName] = resolve;
                });
            } else {
                return null;
            }
        }
    }

    /**
     * 额外编写的支持amd方式加载的加载器
     * @param {*} name
     * @param {*} dependencies
     * @param {*} callback
     * @deprecated 废弃
     */
    define = function(name, dependencies, callback) {
        const loadings = [],
            requiredLibNames = [];

        window.fcLoadCallbacks = {};

        for (const libName of dependencies) {
            const dist = webpackExternals.externals.filter(ex => libName === ex.root);

            if (dist.length === 1) {
                if (window.fcExternalLoaded.indexOf(dist[0].prod) === -1) {
                    loadings.push(loadjs([dist[0].prod], {
                        returnPromise: true,
                        before: function(scriptPath, scriptEl) {
                            scriptEl.crossOrigin = true;
                        }
                    }));
                    requiredLibNames.push(dist[0].prod);
                }
            }
        }

        Promise.all(loadings).then(() => {
            window[name] = callback.apply(window, dependencies.map(libName => window[libName]));
            requiredLibNames.forEach(libName => {
                window.fcExternalLoaded.push(libName);
            });
            if (window.fcLoadCallbacks[name]) {
                window.fcLoadCallbacks[name].apply();
            }
        });
    };

    /**
     * 一次性加载多个组件
     * @param {Array} pelList 组件列表
     */
    async loadPels(pelList) {
        const pels = pelList.filter(each => each.packageName).map(each => {
                return {
                    packageName: each.packageName,
                    path: each.path
                };
            }),
            packagesToLoad = Array.from(new Set(pels.map(each => each.packageName))).filter(name => name);

        for (const packageName of packagesToLoad) {
            await this.confirmPackageDependencies(packageName);
        }
        const pelsPath = Array.from(new Set(pels.map(each => {
                if (this.appName) {
                    return `${this.appName}/npm_packages/${each.packageName}/${each.path}`;
                } else {
                    return `/npm_packages/${each.packageName}/${each.path}`;
                }
            }))).filter(name => name),
            concatPath = await getConcatPath(pelsPath);

        await this.loadScript(concatPath);
    }

    /**
   * 按照图元定义加载图元
   * 图元定义基本如下：
   * {
   *   packageName: '@gw/wind-pels-standard',
   *   version: '1.0.1',   //
   *   name: 'Container',  // 这是图元在包内唯一Name
   *   path: './build/container1.pel.js'
   * }
   * @param {Object} pel 图元定义
   * @param {Boolean} latest 是否使用最新版本，如果是则使用最新版本
   */
    async loadPel(pel, latest) {
        const componentUrl = this.getPelUrl(pel),
            cache = await this.getInitComponent(pel);

        if (cache) {
            return cache;
        }

        // 对于正在加载中的， 监听成功、失败的回调
        if (this.fcLoadingMap.get(this.getPelUrl(pel)) === 'loading') {
            return new Promise((resolve, reject) => {
                this.on('component-ready', (url, fcp) => {
                    if (url === componentUrl) {
                        resolve(fcp);
                    }
                });
                this.on('component-fail', url => {
                    if (url === componentUrl) {
                        resolve(null);
                    }
                });
            });
        } else if (this.fcLoadingMap.get(this.getPelUrl(pel)) === 'fail') {
            return null;
        }
        this.setPelLoading(componentUrl);

        try {
            // 先检查React 基础库的加载
            await this.loadPelExternals(['react', 'react-dom']);

            // 加载组件的依赖包
            await this.confirmPackageDependencies(pel.packageName);

            const pelLibName = this.getComponentLibName(pel);

            await this.loadFCScript(componentUrl, pelLibName, pel.packageName);

            this.pelCacheByLibName[pelLibName] = pel;

            // 打包过程中要求将图元包以  `${pel.packageName}/${pel.version}/${pel.path}`方式统一命名图元的名称， 并作为window对象的属性进行挂载，这里就按照这个path来获取
            // path的规则是 包名/版本名/图元名 或者 包名/图元名 版本名同一图元2个版本在一个页面情况下才会用到
            let esModule = window[pelLibName];

            if (!esModule && latest) {
                await this.loadFCScript(this.getPelUrl({
                    name: pel.name,
                    version: 'latest'
                }), pelLibName);
            }
            esModule = window[pelLibName];

            if (!esModule) {
                log('前端组件无法加载' + pelLibName);
                this.setPelLoadFail(componentUrl);
                return null;
            }
            const fcp = esModule.default;

            await this.initFcp(fcp, pel);

            this.fcCache[componentUrl] = fcp;
            this.setPelLoaded(componentUrl, fcp);
            return fcp;
        } catch (e) {
            this.setPelLoadFail(componentUrl);
            log('组件加载异常', e);
            return null;
        }
    }

    async initFcp(fcp, pel) {
        // 补充控件基础信息到图元定义
        fcp.pel = pel;

        fcp.path = pel.path;

        // 对于icon定义中含有图片名后缀，认为是预览图元，设置previewUrl
        const imageNameRegex = /\.(jpg|gif|png|jpeg|svg)$/i;

        if (fcp.externals && fcp.externals.length) {
            await this.loadPelExternals(fcp.externals);
        }

        if (fcp.icon && imageNameRegex.test(fcp.icon)) {
            if (this.debugPackageName === pel.packageName && this.debugUrl) {
                fcp.previewUrl = `${this.debugUrl}${fcp.icon}`;
            } else {
                fcp.previewUrl = `${this.getServePath(pel.loadFromProject)}/npm_packages/${pel.packageName}/${fcp.icon}`;
            }
        }

        // 处理渲染器，加载渲染器依赖
        if (fcp.component) {
            let fc = fcp.component;

            // 支持异步的加载情况
            if (typeof fc === 'function' && fc.constructor.name === 'AsyncFunction') {
                fc = (await fc()).default;
            }
            if (fc.props) {
                // vue 图元
                this.loadPelExternals(['vue']);
                fcp.factory = new VuePelFactory(fc);
            } else {
                fcp.factory = new ReactPelFactory(fc);
            }
        }
        if (fcp.factory) {
            // 加载渲染器依赖
            await fcp.factory.loadDependencies();
        } else {
            log('组件 Component定义未加载到', fcp);
        }
    }

    setPelLoading(url) {
        this.fcLoadingMap.set(url, 'loading');
    }

    setPelLoaded(url, fcp) {
        this.fcLoadingMap.set(url, 'loaded');
        try {
            this.eventCallbacks.filter(item => item.eventName === 'component-ready').forEach(item => {
                item.callback(url, fcp);
            });
        } catch (e) {
            // callback error ignored
        }
    }

    setPelLoadFail(url) {
        this.fcLoadingMap.set(url, 'fail');
        try {
            this.eventCallbacks.filter(item => item.eventName === 'component-fail').forEach(item => {
                item.callback(url);
            });
        } catch (e) {
            // callback error ignored
        }
    }

    on(eventName, callback) {
        this.eventCallbacks.push({
            eventName,
            callback
        });
    }

    getPackageJSONUrl(packageName) {
        return `${this.getServePath()}/npm_packages/${packageName}/package.json`;
    }

    setPackageCache(packageName, packageObject) {
        this.packageJSONCache[packageName] = packageObject;
    }

    async loadPackageCache() {
        const jsonLoaded = await loadProjectDepenecies(this.appName, this.projectId);

        if (jsonLoaded && jsonLoaded.data) {
            const fcpPackages = mergeMarkPackages(jsonLoaded.data.project, jsonLoaded.data.app, jsonLoaded.data.platform);

            log('应用依赖包信息已经加载', fcpPackages);
            for (const packageInfo of fcpPackages) {
                this.setPackageCache(packageInfo.name, packageInfo);
            }
        }
    }

    /**
     * 刷新Debug模式下从本地开发服务加载的组件
     */
    async reloadDebugCache() {
        for (const cacheKey of Object.keys(this.fcCache)) {
            if (cacheKey.startsWith('https://')) {
                delete this.scriptLoadingPromises[cacheKey];
                await this.loadScript(cacheKey);

                if (window[this.scriptUrlLibName[cacheKey]]) {
                    const fcp = window[this.scriptUrlLibName[cacheKey]].default;

                    await this.initFcp(fcp, this.pelCacheByLibName[this.scriptUrlLibName[cacheKey]]);
                    this.fcCache[cacheKey] = fcp;
                }
            }
        }
    }

    async confirmPackageDependencies(packageName) {
        if (this.packageJSONCache[packageName]) {
            if (this.packageJSONCache[packageName].dependencies) {
                log('加载库依赖', packageName, Object.keys(this.packageJSONCache[packageName].dependencies));
                await this.loadPelExternals(Object.keys(this.packageJSONCache[packageName].dependencies));
            }
            if (this.confirmI18n) {
                await this.confirmI18n(this.packageJSONCache[packageName]);
            }
        } else {
            // 包无法加载，说明未安装，后续组件也就无法加载了
            throw new Error('组件包未安装:' + packageName);
        }
    }

    /**
     * 加载前端组件包的package.json中的dependencies
     * @param pel
     * @returns {Promise<void>}
     */
    async confirmPackageDependenciesIndividual(packageName) {
        // 直接使用unpkg方式获取package.json
        if (this.packageNotInstalled.indexOf(packageName) > -1) {
            // 包无法加载，说明未安装，后续组件也就无法加载了
            throw new Error('组件包未安装:' + packageName);
        } else if (!this.packageJSONCache[packageName]) {
            if (this.packageLoadingPromises[packageName]) {
                await this.packageLoadingPromises[packageName];
            } else {
                this.packageLoadingPromises[packageName] = (async() => {
                    const packageJSONUrl = this.getPackageJSONUrl(packageName),
                        jsonLoaded = await ky.get(packageJSONUrl).json();

                    if (jsonLoaded.name === packageName) {
                        // 可以加载到包
                        if (jsonLoaded.dependencies) {
                            log('加载库依赖', jsonLoaded.name, Object.keys(jsonLoaded.dependencies));
                            await this.loadPelExternals(Object.keys(jsonLoaded.dependencies));
                        }
                        this.packageJSONCache[packageName] = jsonLoaded;
                    } else {
                        this.packageNotInstalled.push(packageName);
                        // 包无法加载，说明未安装，后续组件也就无法加载了
                        throw new Error('组件包未安装:' + packageName);
                    }
                })();
            }
            await this.packageLoadingPromises[packageName];
        }
    }
}

export default FCLoader;
