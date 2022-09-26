import debug from 'debug';
import ky from 'ky';
import template from '../template.js';

const trace = debug('runtime:in'),
    updateLocale = async(appName, locale) => {
        return await ky.post('/api/locale/current/set', {
            json: {
                app: appName,
                locale: locale
            }
        }).json();
    };

/**
 * 对组件的事件进行解析和处理
 * @class
 */
class InteractHandler {
    constructor(app, fcViewManager) {
        this.app = app;
        this.fcViewManager = fcViewManager;

        this.fpMethods = {};
        // fcViewManager.updateAppContext(this.app);
        fcViewManager.setInteractHandler(app.fpIdentifier, this);
    }

    /**
     * 获取/计算打开页面的参数
     * @param {*} params 页面参数对象
     * @param {*} variableValues 页面变量
     * @param {*} payload 事件负载
     * @returns String 计算后的页面名称
     */
    getOpenLinkParamsValue(params, variableValues, payload) {
        const paramsValues = {};

        for (const key in params) {
            paramsValues[params[key].target] = this.getParamValue(params[key], variableValues, payload);
        }
        return paramsValues;
    }

    getInvokeMethodParamsValue(params, variableValues, payload) {
        return (params || []).map(p => this.getParamValue(p, variableValues, payload));
    }

    /**
     * 获取/计算参数的值
     * @param {*} paramConfig 参数配置信息
     * @param {*} variableValues 页面变量
     * @param {*} payload 事件负载
     * @returns String 计算后的页面名称
     */
    getParamValue(paramConfig, variableValues, payload) {
        if (paramConfig) {
            if (paramConfig.setTo === 'set') {
                return paramConfig.source;
            } else if (paramConfig.setTo === 'payloadMapping') {
                if (paramConfig.source === '@payloadMapping') {
                    return payload;
                } else {
                    return payload[paramConfig.source];
                }
            } else if (paramConfig.setTo === 'evaluate') {
                return template(paramConfig.source, Object.assign({}, variableValues, {
                    payload
                }));
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    attachInteractToPage(el, interpreter, fpIdentifier) {
        const interactives = interpreter.pageConfig.a.interactive;

        if (interactives) {
            // 页面点击事件捕获
            el.onclick = event => {
                for (const interact of interactives) {
                    if (interact.event.name === 'onPageClick') {
                        this.handler({
                            payload: event,
                            actions: interact.actions,
                            app: this.app,
                            event: interact.event
                        });
                    }
                }
            };
            // 页面双击事件捕获
            el.ondblclick = event => {
                for (const interact of interactives) {
                    if (interact.event.name === 'onPageDoubleClick') {
                        this.handler({
                            payload: event,
                            actions: interact.actions,
                            app: this.app,
                            event: interact.event
                        });
                    }
                }
            };

            // 页面右键事件捕获
            el.oncontextmenu = event => {
                for (const interact of interactives) {
                    if (interact.event.name === 'onPageRightClick') {
                        this.handler({
                            payload: event,
                            actions: interact.actions,
                            app: this.app,
                            event: interact.event
                        });
                    }
                }
                return false;
            };

            // 页面加载事件捕获： attach调用时本身页面就加载了
            for (const interact of interactives) {
                if (interact.event.name === 'onPageLoaded') {
                    this.handler({
                        payload: {},
                        actions: interact.actions,
                        app: this.app,
                        pageIdentifier: fpIdentifier,
                        event: interact.event
                    });
                }
            }
        }
    }

    /**
     * 页面切换入时触发
     * @param {*} pageInterpreter
     */
    onPageTabIn(pageInterpreter, fpIdentifier) {
        const interactives = pageInterpreter.pageConfig.a.interactive;

        if (interactives) {
            for (const interact of interactives) {
                if (interact.event.name === 'onTabIn') {
                    queueMicrotask(() => {
                        this.handler({
                            payload: {
                                fpIdentifier,
                                fpID: pageInterpreter.pageConfig.a._id,
                                fpQuery: pageInterpreter.queryVariableValues
                            },
                            actions: interact.actions,
                            app: this.app,
                            event: interact.event
                        });
                    });
                }
            }
        }
    }

    /**
     * 页面关闭、切换出时触发
     * @param {*} pageInterpreter
     */
    onPageDetach(pageInterpreter) {
        const interactives = pageInterpreter.pageConfig.a.interactive;

        if (interactives) {
            for (const interact of interactives) {
                if (interact.event.name === 'onPageClosed') {
                    this.handler({
                        payload: {},
                        actions: interact.actions,
                        app: this.app,
                        event: interact.event
                    });
                }
            }
        }
    }

    /**
     * 处理组件的交互行为
     */
    handler({ payload, fcView, actions, app, event, pageIdentifier }) {
        trace('Event Fired: ' + event.name, fcView, payload);

        // 设置页面变量的操作，如果有多个Action都做了设置操作，这里进行合并，最后再调用set
        let pageVarUpdate = {},
            // 设置App变量操作，同样要最合并
            appVarUpdate = {},
            variableContext = {};

        if (fcView) {
            variableContext = fcView.getVariableContext();
        } else if (pageIdentifier) {
            variableContext = this.fcViewManager.variableHandlers[pageIdentifier].variableValues;
        }

        // 首先进行变量更新的操作
        for (const action of actions) {
            // 执行条件判断 不满足不做后面的动作
            if (action.condition) {
                try {
                    const result = template(action.condition, Object.assign({}, variableContext, {
                        payload: payload
                    }));

                    if (result === 'false') {
                        if (trace.enabled) {
                            trace('条件不满足', action.condition);
                        }
                        continue;
                    }
                } catch (e) {
                    trace('交互条件配置执行异常', action.condition, e);
                    continue;
                }
            }
            if (action.who === 'system') {
                // 对于更新页面变量数据的处理
                if (action.name === 'updatePageVariable') {
                    Object.assign(pageVarUpdate, this.getVariableActionResult(action, payload, variableContext, Object.assign({}, pageVarUpdate, appVarUpdate)));
                }

                if (action.name === 'updateAppVariable') {
                    Object.assign(appVarUpdate, this.getVariableActionResult(action, payload, variableContext, Object.assign({}, pageVarUpdate, appVarUpdate)));
                }
                // 处理切换显隐动作
                if (action.name === 'setShowOrHide') {
                    for (const sete of action.configures || []) {
                        const targetFcView = this.fcViewManager.getComponentView(sete.target, fcView.pageId);

                        if (targetFcView) {
                            trace('设置组件可见性', sete.target, sete.display);
                            if (sete.display === 'hide') {
                                targetFcView.setVisible(false);
                            } else if (sete.display === 'toggle') {
                                targetFcView.setVisible(!targetFcView.getVisible());
                            } else if (sete.display === 'show') {
                                targetFcView.setVisible(true);
                            }
                        } else {
                            trace('组件未找到', sete.target);
                        }
                    }
                }
            }
        }

        // 服务暂时未支持合并发送数据， 这里循环调用设置
        if (Object.keys(pageVarUpdate).length) {
            trace('设置页面变量', pageVarUpdate);
            for (const key of Object.keys(pageVarUpdate)) {
                app.setPageVariable(key, pageVarUpdate[key]);
            }
            this.dispatchDocumentEvent({
                name: 'setPageVar',
                object: pageVarUpdate
            });

            Object.assign(variableContext, pageVarUpdate);
        }

        // 服务暂时未支持合并发送数据， 这里循环调用设置
        if (Object.keys(appVarUpdate).length) {
            trace('设置应用变量', appVarUpdate);
            this.fcViewManager.updateAppVariables(appVarUpdate);
            for (const key of Object.keys(appVarUpdate)) {
                app.setAppVariable(key, appVarUpdate[key]);
            }
            this.dispatchDocumentEvent({
                name: 'setAppVar',
                object: appVarUpdate
            });
        }

        // 调用方法和打开链接的操作在后面进行处理
        for (const action of actions) {
            // 执行条件判断 不满足不做后面的动作
            if (action.condition) {
                const result = template(action.condition, Object.assign({}, variableContext, {
                    payload: payload
                }));

                if (result === 'false') {
                    continue;
                }
            }
            if (action.who === 'system') {
                // 处理方法调用的交互
                if (action.name === 'invoke') {
                    for (const invocation of action.configures || []) {
                        if (invocation.method === 'askRequest@invoke') {
                            // 配置的关键字： 发出问答式请求
                            let fpIdentifier = null;

                            if (payload) {
                                fpIdentifier = payload.fpIdentifier;
                            }

                            if (!fpIdentifier && fcView) {
                                fpIdentifier = fcView.pageId;
                            }
                            if (fpIdentifier) {
                                if (this.fpMethods[fpIdentifier] && this.fpMethods[fpIdentifier].sendRequest) {
                                    this.fpMethods[fpIdentifier].sendRequest(invocation.target);
                                } else {
                                    // 页面初始化时，初始数据请求通道可能未加载好,这时把请求缓存起来，等待通道建立后执行
                                    if (!this.fpMethods[fpIdentifier]) {
                                        this.fpMethods[fpIdentifier] = {
                                            requestQueue: []
                                        };
                                    }
                                    this.fpMethods[fpIdentifier].requestQueue.push(invocation.target);
                                }
                            } else {
                                console.error('调用方法未提供 fpIdentifier', fcView, invocation);
                            }
                            // app.sendRequest({
                            //     fcID: invocation.target,
                            //     fpID: payload.fpID,
                            //     fpQuery: payload.fpQuery
                            // });
                        } else {
                            const fcViewToInvoke = this.fcViewManager.getComponentView(invocation.target, fcView ? fcView.pageId : pageIdentifier),

                                params = this.getInvokeMethodParamsValue(invocation.params, variableContext, payload);

                            if (fcViewToInvoke) {
                                // 调用方法
                                fcViewToInvoke.invoke(invocation.method, params);
                            } else {
                                console.error('目标组件未找到 pageId=', fcView ? fcView.pageId : pageIdentifier, ',fcid=', invocation.target);
                            }
                        }
                    }
                }

                // 处理下钻、页面跳转
                if (action.name === 'openLink') {
                    if (action.configures && action.configures.length) {
                        for (const configure of action.configures) {
                            trace('event open link');
                            app.openLink({
                                linkTo: configure.linkTo,
                                openIn: configure.openIn,
                                pageName: this.getParamValue(configure.pageName, variableContext, payload),
                                params: this.getOpenLinkParamsValue(configure.params, variableContext, payload),
                                linkType: configure.linkType
                            });
                        }
                    }
                }
                // 进入屏保动作
                if (action.name === 'enterFullScreen') {
                    app.enterFullScreen();
                }
                // 进入屏保动作
                if (action.name === 'exitFullScreen') {
                    app.exitFullScreen();
                }
                // 进入屏保动作
                if (action.name === 'openScreenSaverPage') {
                    for (const configure of action.configures) {
                        app.openScreenSaverPage(configure.linkTo, this.getOpenLinkParamsValue(configure.params, variableContext, payload));
                    }
                }

                // 关闭当前页
                if (action.name === 'closeCurrentPage') {
                    setTimeout(() => {
                        app.closePageByParams(app.fpQuery);
                    }, 100);
                }

                // 退出屏保动作
                if (action.name === 'closeScreenSaverPage') {
                    for (const configure of action.configures) {
                        app.closeScreenSaverPage(configure.linkTo, this.getOpenLinkParamsValue(configure.params, variableContext, payload));
                    }
                }
                // 切换动态面板
                if (action.name === 'setPanelState') {
                    this.handleStateChange(action.configures, fcView, variableContext, payload);
                }

                // 切换多语言
                if (action.name === 'setLang') {
                    this.handleSetLocale(action, variableContext, payload);
                }
            }
        }
    }

    /**
     * 解析comonent.in对象，获取组件定义的交互事件，
     * 同时附加交互事件到组件之上
     * @param fcView
     */
    attachInteractTo(fcView) {
        const { app } = this;

        fcView.interactHandler = this;

        if (fcView.fcInstanceConfig) {
            for (const interaction of (fcView.fcInstanceConfig.in || [])) {
                const { event, actions, handler } = interaction;

                // 先进行属性判断
                if (event && actions && actions.length) {
                    // 调用系统方法的事件

                    // 增加事件处理
                    fcView.on(event.name, payload => {
                        this.handler({
                            event,
                            payload,
                            fcView,
                            actions,
                            app
                        });
                    });
                }

                // 110版本情况下 定义为handler
                if (event && handler) {
                    // 调用系统方法的事件
                    if (handler.action.who === 'system') {
                        if (handler.action.name === 'updatePageVariable') {
                            // 对于更新页面变量数据的处理
                            fcView.on(event.name, payload => {
                                // 按event的payload对象进行映射写入对应页面变量
                                if (handler.action.payloadMapping) {
                                    if (typeof handler.action.payloadMapping === 'string') {
                                        app.setPageVariable(handler.action.payloadMapping, payload);
                                    } else {
                                        for (const key of Object.keys(handler.action.payloadMapping)) {
                                            // 映射配置了后如果根本没传值就不做更新、 传值为null也要更新为null值
                                            if (typeof payload[key] !== 'undefined') {
                                                const targetVariable = handler.action.payloadMapping[key];

                                                if (typeof targetVariable === 'string') {
                                                    app.setPageVariable(targetVariable, payload[key]);
                                                } else if (Array.isArray(targetVariable)) {
                                                    for (const variable of targetVariable) {
                                                        app.setPageVariable(variable, payload[key]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (handler.action.set) {
                                    // 直接修改页面变量值
                                    for (const key of Object.keys(handler.action.set)) {
                                        app.setPageVariable(key, handler.action.set[key]);
                                    }
                                }
                                if (handler.action.evaluate) {
                                    // 直接修改页面变量值 支持使用模版形式
                                    for (const key of Object.keys(handler.action.evaluate)) {
                                        app.setPageVariable(key, template(handler.action.evaluate[key],
                                            Object.assign({}, app.variableHandler.variableValues, {
                                                payload: payload
                                            })
                                        ));
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }

        this.attachWriteBackEvents(fcView);

        if (fcView.childrenFcViews) {
            for (const childView of fcView.childrenFcViews) {
                // childView.initPropsAndEvents(fcView.contextVariables);
                this.attachInteractTo(childView);
            }
        }
    }

    /**
     * 处理切换动态面板值
     * @param {Array} configures
     */
    handleStateChange(configures, fcView, variables, payload) {
        for (const configure of configures || []) {
            const targetFcView = this.fcViewManager.getComponentView(configure.target, fcView.pageId);

            if (targetFcView && targetFcView.instancePropConfig.currentState) {
                const allStates = targetFcView.instancePropConfig.states,
                    currentIndex = allStates.indexOf(targetFcView.instancePropConfig.currentState),
                    totalStat = allStates.length;

                trace('设置动态面板状态为', configure.setTo, '当前状态', targetFcView.instancePropConfig.currentState, configure);
                if (configure.setTo === '@NEXT') { // 下一个
                    if (currentIndex < totalStat - 1) {
                        targetFcView.updateProps({
                            currentState: allStates[currentIndex + 1]
                        });
                    } else if (configure.option && configure.option.loop) {
                        targetFcView.updateProps({
                            currentState: allStates[0]
                        });
                    }
                } else if (configure.setTo === '@PREV') {
                    if (currentIndex > 0) {
                        targetFcView.updateProps({
                            currentState: targetFcView.instancePropConfig.states[currentIndex - 1]
                        });
                    } else if (configure.option && configure.option.loop) {
                        targetFcView.updateProps({
                            currentState: targetFcView.instancePropConfig.states[totalStat - 1]
                        });
                    }
                } else if (configure.setTo === '@CUSTOM') {
                    const stateValue = this.getParamValue(configure.option, variables, payload);

                    if (allStates.indexOf(stateValue) > -1) {
                        targetFcView.updateProps({
                            currentState: stateValue
                        });
                    } else {
                        trace('计算的状态不在面板状态之中', stateValue);
                    }
                } else if (allStates.indexOf(configure.setTo) > -1) {
                    targetFcView.updateProps({
                        currentState: configure.setTo
                    });
                }
            }
        }
    }

    /**
     * 设置修改主题
     * @param {*} action
     * @param {*} variableContext
     * @param {*} payload
     */
    handleSetLocale(action, variableContext, payload) {
        if (variableContext.app.appSetting.enableI18n === true) {
            if (action.payloadMapping) {
                const keys = Object.keys(action.payloadMapping);

                this.setLocale(variableContext.app.appSetting.name, payload[keys[0]]);
            } else if (action.set) {
                this.setLocale(variableContext.app.appSetting.name, action.set.lang);
            } else if (action.evaluate) {
                try {
                    const calcResult = template(action.evaluate.lang, variableContext);

                    this.setLocale(variableContext.app.appSetting.name, calcResult);
                } catch (e) {
                    trace('页面变量模板计算出错', action.evaluate.lang);
                }
            }
        }
    }

    setLocale(appName, locale) {
        trace('set Locale', locale);

        updateLocale(appName, locale).then(() => {
            location.reload(true);
        });
    }

    dispatchDocumentEvent(payload) {
        const event = new CustomEvent('interact', {
            detail: payload
        });

        document.body.dispatchEvent(event);
    }

    /**
     * 给页面附加可调用方法
     * - 目前主要附加 sendRequest 方法，因为这个方法是ws通道建立打开后才能调用，可能会延后于组件初始化、交互等相关事件
     * - 如果附加方法前，组件事件已经发出 sendRequest 调用请求，则会缓存这些请求直到通道可用
     * @param args 请求参数
     * @param args.fpId 页面id
     * @param args.sendRequest 附加的发送ws查询的方法
     */
    attachMethod({
        fpId,
        sendRequest
    }) {
        if (!this.fpMethods[fpId]) {
            this.fpMethods[fpId] = {};
        }
        this.fpMethods[fpId].sendRequest = sendRequest;

        // 如果附加方法前，组件事件已经发出 sendRequest 调用请求，则会缓存这些请求直到通道可用
        if (this.fpMethods[fpId].requestQueue && this.fpMethods[fpId].requestQueue.length) {
            // 执行通道建立前的请求
            for (const target of this.fpMethods[fpId].requestQueue) {
                sendRequest(target);
            }
            this.fpMethods[fpId].requestQueue = [];
        }

        // this.fpMethods[fpId] = {
        //     sendRequest
        // };
    }

    /**
     * 操作为设置属性变量时处理设置变量值信息， 包括：
     * set: 设置直接值
     * evaluate: 表达式计算值
     * payloadMapping: 负载映射值
     * @param {*} action 操作对象信息
     * @param {*} payload 负载数据
     * @param {*} contextVariables 上下文变量信息
     */
    getVariableActionResult(action, payload, contextVariables, previousResult) {
        const doSet = {};

        if (action.set) {
            // 直接修改页面变量值
            for (const key of Object.keys(action.set)) {
                doSet[key] = action.set[key];
            }
        }
        if (action.evaluate) {
            // 直接修改页面变量值 支持使用模版形式
            for (const key of Object.keys(action.evaluate)) {
                try {
                    doSet[key] = template(action.evaluate[key],
                        Object.assign({}, contextVariables, {
                            payload: payload
                        }, previousResult)
                    );
                } catch (e) {
                    trace('页面变量模板计算出错', action.evaluate[key]);
                }
            }
        }

        if (action.payloadMapping) {
            for (const key of Object.keys(action.payloadMapping)) {
                // 整体负载的数据映射
                if (key === '@payloadMapping') {
                    doSet[action.payloadMapping[key]] = payload;
                } else {
                    // const payloadKey = key.substr('@payloadMapping'.length + 1);
                    doSet[action.payloadMapping[key]] = payload[key];
                }
            }
        }
        return doSet;
    }

    attachWriteBackEvents(fcView) {
        const { app } = this;

        // 处理所有双向绑定的情形：  propertyWriteBackEvents格式为 { event : propName }
        if (fcView.propertyWriteBackEvents && Object.keys(fcView.propertyWriteBackEvents).length) {
            for (const eventName of Object.keys(fcView.propertyWriteBackEvents)) {
                const propName = fcView.propertyWriteBackEvents[eventName];

                if (fcView.fcInstanceConfig.reactiveProps[propName]) {
                    const propertyExpression = fcView.fcInstanceConfig.reactiveProps[propName];

                    // 含有绑定信息， 确认是否是绑定了变量
                    // 变量中含有 p.name = 'variable'的情况
                    if (Object.prototype.hasOwnProperty.call(app.variableHandler.variableValues, propertyExpression) === true) {
                        fcView.updateProps({
                            [propName]: app.variableHandler.variableValues[propertyExpression]
                        });
                        fcView.on(eventName, val => {
                            fcView.updateProps({
                                [propName]: val
                            });
                            app.setPageVariable(propertyExpression, val);
                        });
                    }
                }
            }
        }
    }

    getFCViewContextVariables(fcView) {

    }
}

export default InteractHandler;
