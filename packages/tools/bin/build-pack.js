const path = require('path'),
    webpack = require('webpack'),
    fs = require('fs-extra'),
    glob = require('glob'),
    { CleanWebpackPlugin } = require('clean-webpack-plugin'),
    { merge } = require('webpack-merge'),
    ProgressPlugin = require('webpack/lib/ProgressPlugin'),
    webpackExternals = require('ridge-externals'),
    TerserPlugin = require("terser-webpack-plugin"),
    webpackCommonBase = require('./webpack.common.js'),
    args = require('args'),
    chalk = require('chalk');

args.option('dir', 'The Front Component Project Root Path', './')
    .option('src', "No Minimize")
    .option('watch', 'Build with Watch')
    .option('remote', 'Enable Remote Debug')
    .option('port', 'Package Provider Host Port')
    .option('concat', 'Concat all components in one file')
    .option('external', 'Bundle with external libs')
    .option('analyse', 'Start Bundle Analyse Service');

    const log = console.log,
    BUILD_PATH = 'build',
    signals = {
        timestamp: new Date().getTime()
    },
    flags = args.parse(process.argv),
    buildResult = {},

    promiseGlob = async (pattern, opts) => {
        return new Promise((resolve, reject) => {
            glob(pattern, opts, (er, files) => {
                if (er) {
                    reject(er);
                } else {
                    resolve(files);
                }
            });
        });
    },

    /**
     * 打包npm模块中的所有图元
     * @param packagePath npm模块路径
     * @returns {Promise<void>}
     */
    build = async function (packagePath) {
        log(chalk.green('工程目录：', path.resolve(packagePath, './package.json')));

        const packageJson = require(path.resolve(packagePath, './package.json'));

        let ridgeConfig = {};

        if (fs.existsSync(path.resolve(packagePath, './ridge.config.js'))) {
            try {
                ridgeConfig = require(path.resolve(packagePath, './ridge.config.js'));
                log(chalk.green('配置文件 ' + path.resolve(packagePath, './ridge.config.js')))
            } catch (e) {
                log(chalk.green('配置文件未找到或无效' + path.resolve(packagePath, './ridge.config.js')));
            }
        }

        const targetFiles = await promiseGlob(ridgeConfig.pattern ?? './src/**/*.d.js');
        if (targetFiles.length === 0) {
            log(chalk.green('未找到图元 ' + ridgeConfig.pattern ?? './src/**/*.d.js'));
        }
        
        log(chalk.green('编译打包以下图元文件:'));
        
        let entry = null;
        let output = null;
        if (ridgeConfig.concat || flags.concat) {
            const imports = []
            const names = []
            for (let i = 0; i < targetFiles.length; i++) {
                const file = targetFiles[i];
                const folderName = path.basename(path.dirname(file))
                log(chalk.green(file));
                imports.push(`import ${folderName} from '${file}'`)
                names.push(folderName)
            }
            let concatJsContent = ''
            if (ridgeConfig.bundleExternal || flags.bundleExternal) {
                if (packageJson.externals) {
                    for (const external of packageJson.externals) {
                        concatJsContent += `import './${external}'\n`
                    }
                }
            }
            
            concatJsContent += `${imports.join('\n')}\n`
            concatJsContent += `export { ${names.join(', ')} }`

            fs.writeFileSync(path.resolve(packagePath, './concat.js'), concatJsContent)
            
            entry = './concat.js'

            output = {
                filename:  'ridge.js',
                // filename: '[name].js',
                // 图元的全局唯一ID (pelUId) 也是图元的下载地址
                library: `${packageJson.name}/Main`,
                // 代码输出格式，amd方式将依赖也输出到define上，未来在运行时需要针对amd加载做相关处理
                libraryTarget: 'this',
                // 如果代码中有import() 异步引入的部分，打包后会自动增加server地址前缀
                // publicPath: `${NPM_SERVER}/${packageJson.name}/${packageJson.version}/${BUILD_PATH}/`,
                publicPath: './',
                // 编译输出到项目BUILD_PATH目录下
                // path: path.resolve(packagePath, './' + BUILD_PATH)
            }

        } else {
            entry = {}
            const elementPaths = []
            for (let i = 0; i < targetFiles.length; i++) {
                const file = targetFiles[i];
    
                log(chalk.green(file));
                const jsName = path.basename(path.resolve(file, '../')) + '-' + path.basename(file, '.js')
                elementPaths.push(BUILD_PATH + '/' + jsName + '.js');
                entry[path.basename(path.resolve(file, '../')) + '-' + path.basename(file, '.js')] = file;
            }
    
            packageJson.components = elementPaths
    
            output = {
                filename: '[name].js',
                // chunkData => {
                //     return chunkData.chunk.name.substring(0, chunkData.chunk.name.indexOf('.')) + '.js';
                // },
                // filename: '[name].js',
                // 图元的全局唯一ID (pelUId) 也是图元的下载地址
                library: `${packageJson.name}/[name]`,
                // 代码输出格式，amd方式将依赖也输出到define上，未来在运行时需要针对amd加载做相关处理
                libraryTarget: 'this',
                // 如果代码中有import() 异步引入的部分，打包后会自动增加server地址前缀
                // publicPath: `${NPM_SERVER}/${packageJson.name}/${packageJson.version}/${BUILD_PATH}/`,
                publicPath: './',
                // 编译输出到项目BUILD_PATH目录下
                path: path.resolve(packagePath, './' + BUILD_PATH)
            }
            fs.writeFileSync(path.resolve(packagePath, './package.json'), JSON.stringify(packageJson, null, 2))
        }

        // 读取配置好的external目录
        const externals = {};

        // 这里依赖到 ridge-externals， 这就需要编译前端组件的项目能随时更新到最新的external配置。
        // 另外的办法是在此获取web api的配置，但是缺点是无版本追踪
        log(chalk.green('以下依赖不加入组件包'));
        for (const external of webpackExternals.externals) {
            log(chalk.green(external.module));
            externals[external.module] = external.root || external.module;
        }

        const argsConfig = { plugins: [] };

        if (flags.analyse) {
            const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
            argsConfig.plugins.push(new BundleAnalyzerPlugin({
                openAnalyzer: false
            }));
        }
        // 不压缩代码
        if (flags.src) {
            argsConfig.mode = 'development';
            argsConfig.devtool = 'eval-source-map';

            argsConfig.optimization = {
                // We no not want to minimize our code.
                minimize: false
            };
        } else {
            argsConfig.mode = 'production'
        } 

        // 创建webpack 编译器  这里使用webpack api方式进行编译
        const compiler = webpack(merge({
            entry,
            output,
            plugins: [
                new CleanWebpackPlugin()
            ]
        }, webpackCommonBase, {
            externals
        }, argsConfig, ridgeConfig.configureWebpack || {})),
            // 引用 ProgressPlugin 打印编译过程进度详情
            // eslint-disable-next-line no-shadow-restricted-names
            progressPlugin = new ProgressPlugin(function (percentage, msg, ...arguments) {
                let info = arguments ? arguments.join(' ') : '';

                if (msg === 'building modules' && arguments[2]) {
                    const splits = arguments[2].split('!');

                    info = splits[splits.length - 1];
                }
                console.log(Math.floor(percentage * 100) + '%', msg, info);
            });

        progressPlugin.apply(compiler);

        if (flags.watch) {
            compiler.watch({
                aggregateTimeout: 300,
                ignored: /package.json/
            }, (err, stats) => {
                if (err) {
                    throw err;
                }

                const info = stats.toJson();

                buildResult.statObject = stats.toJson({
                    chunkModules: false
                });

                if (stats.hasErrors()) {
                    console.error(info.errors);
                }

                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }

                signals.timestamp = new Date().getTime();

                setTimeout(() => {
                    // 打印编译结果及编译异常
                    process.stdout.write(stats.toString({
                        colors: true,
                        modules: true,
                        children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
                        chunks: false,
                        chunkModules: true
                    }) + '\n\n');
                    console.log('  Build Complete.\n');
                }, 100)
            });
        } else {
            compiler.run((err, stats) => {
                if (err) {
                    throw err;
                }
                // 打印编译结果及编译异常
                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
                    chunks: false,
                    chunkModules: true
                }) + '\n\n');
                if (stats.hasErrors()) {
                    console.log('  Build failed with errors.\n');
                    process.exit(1);
                }

                if (ridgeConfig && ridgeConfig.copy) {
                    fs.copySync(packagePath, path.resolve(packagePath, ridgeConfig.copy));
                }

                if (ridgeConfig.concat || flags.concat) {
                    fs.unlinkSync(path.resolve(packagePath, './concat.js'))
                }
                console.log('Build complete.\n');
            })
        }
    };

build(flags.dir);

if (flags.port) {
    const servePack = require('./serve-pack');
    servePack(flags.port, signals, buildResult);
}
