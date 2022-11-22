# Front Component View Manager

应用运行时前端组件管理器

## 基本使用

```javascript
    import { InterpreteManager } from '@gw/fp-interpreter-manager';
    // 初始化解析器
    const im = new InterpreteManager()

    // 解析页面JSON数据
    const interpreter = im.interprete(pageJSONObject)
    
    const fcViewManager = new FCViewManager({
        // 初始化参数： 相关资源加载地址
        baseUrl: FC_BASE_URL,
        // 应用名称，通常参数从请求URL获取
        app: appID,
        // 前端运行时实例，提供各种框架运行时服务
        apolloApp: {
            sendRequest,
            openLink: handlers?.openLink,
            setAppState: handlers?.setAppState,
            appSetting,
            openScreenSaverPage: handlers?.openScreenSaverPage,
            dispatchCustomEvent: handlers?.dispatchCustomEvent
        }
    });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    await fcViewManager.createComponentViews(interpreter.getAllElements(), {
        // Tab页面ID， 每次打开一个新Tab传入不同
        pageId: 'default'
    });

    // 更新一个特定fc的属性
    fcViewManager.getComponentView('7zM7MO').updateProps({
        statistics: {
            label: '总发电量',
            unit: 'KW',
            value: total
        }
    });

    fcViewManager.getRootComponentViews('${pageid=default}').forEach(fcView => {
        fcView.unmount();
    });

    // 对于一般事件的捕获、处理
    fcViewManager.getComponentView('7zM7MO').on('input', val => {

    })

    // 对于特殊事件： input的监听 这个写法和上面的作用相同`
    fcViewManager.getComponentView('7zM7MO').input(val => {

    });

    // 获取所有的fcview
    fcViewManager.getComponentViews()


    // 对所有input类型属性的组件增加input监听,INPUT组件示例见下
    fcViewManager.getComponentViews().filter(fcView => fcView.inputPropKey).forEach(fcView => {
        fcView.input(val => {
            fcView.val(val);
        });
    });

    // mount 整体DIV 到 DOM
    interpreter.mount(el);
}

```

INPUT组件示例

```jsx

export default {
    title: '输入测试',
    component: ({ val, input }) => {
        return <input value={val} onChange= {e => {
            input(e.currentTarget.value);
        }}></input>;
    },
    props: [{
        name: 'val',
        type: 'string',
        input: true
    }]
};

```
