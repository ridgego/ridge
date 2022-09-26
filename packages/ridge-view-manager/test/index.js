import FCViewManager from '../src/fc_view_manager.js';
import { InterpreteManager } from '@gw/fp-interpreter-manager/src/index';
import sample from './single.sample.js';

import refPage from './ref.page.js';
import testInputFC from './input.fcp.js';
import { ReactPelFactory } from '@gw/fc-render';
window['@gw/fc-view-test/test/input.js'] = testInputFC;

testInputFC.factory = new ReactPelFactory(testInputFC.component);

localStorage.debug = 'runtime:*';

async function loadAndRender() {
    const im = new InterpreteManager(),

        // 解析页面JSON数据
        interpreter = im.interprete(refPage),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({});

    // fcViewManager.loader.fcCache['@gw/fc-view-test@0.2.4/test/input.js'] = testInputFC;
    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    await fcViewManager.createComponentViews(interpreter.getAllElements(), {
        // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
        useLatestFCVersion: false
    });

    let total = 1222.5;

    setInterval(() => {
        total += Math.floor(10 * Math.random());
        fcViewManager.getComponentView('7zM7MO').updateProps({
            statistics: {
                label: '总发电量',
                unit: 'KW',
                value: total
            }
        });
    }, 1000);

    fcViewManager.getComponentViews().filter(fcView => fcView.inputPropKey).forEach(fcView => {
        fcView.input(val => {
            fcView.val(val);
        });
    });

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
