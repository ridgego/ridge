import FCViewManager from '../src/fc_view_manager.js';
import { InterpreteManager } from '@gw/fp-interpreter-manager/src/index';

import refPage from './ref.page.js';

localStorage.debug = 'runtime:*';

async function loadAndRender() {
    const im = new InterpreteManager(),

        // 解析页面JSON数据
        interpreter = im.interprete(refPage),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            baseUrl: 'https://10.10.0.21:4899/api/unpkg',
            app: 'icms'
        });

    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    await fcViewManager.createComponentViews(interpreter.getAllElements(), {
        // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
        useLatestFCVersion: false
    });


    window.fcViewManager = fcViewManager;
    document.body.style.margin = 0;
    document.body.style.background = '#333';

    const el = document.createElement('div');

    el.style = {
        width: '100%',
        height: '100%'
    };
    // mount 整体DIV 到 DOM
    interpreter.mount(el);

    document.body.appendChild(el);
}

loadAndRender();
