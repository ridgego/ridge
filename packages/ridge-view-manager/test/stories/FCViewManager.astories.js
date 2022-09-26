import React from 'react';
import FCViewManager from '../../src/fc_view_manager.js';
import InteractHandler from '../../src/interact/interact_handler';
import { InterpreteManager } from '@gw/fp-interpreter-manager/src/index';
import sample from '../single.sample.js';
import binchuan from '../大唐宾川.sample.js';
import gansudiantou from '../甘肃电投.sample.js';
import dtgx from '../大唐广西.sample.js';
import input from '../input.sample.js';
import testInputFC from '../input.fcp.js';
import demo1 from '../demo1.sample.js';
import { ReactPelFactory } from '@gw/fc-render';
const im = new InterpreteManager();

window['@gw/fc-view-test/test/input.js'] = testInputFC;

testInputFC.factory = new ReactPelFactory(testInputFC.component);

localStorage.debug = 'runtime:*';

export default {
    title: 'FCViewManger/FCView',
    component: FCViewManager
};

export const 基础解析 = () => {
    // 解析页面JSON数据
    const interpreter = im.interprete(sample),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
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
        interpreter.mount(document.getElementById('do-basic'));
    })();
    return <div id="do-basic" style={{
        background: '#333'
    }}></div>;
};

export const 输入事件 = () => {
    const app = {
            updatePageVariable: (value, mapping) => {
                console.log(value, mapping);
            }
        },
        interactHandler = new InteractHandler(app),
        // 解析页面JSON数据
        interpreter = im.interprete(input),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    fcViewManager.loader.fcCache['@gw/fc-view-test@0.2.4/test/input.js'] = testInputFC;
    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
        await fcViewManager.loader.loadPelExternals(['react', 'react-dom']);
        await fcViewManager.createComponentViews(interpreter.getAllElements(), {
            // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
            useLatestFCVersion: false
        });

        fcViewManager.getComponentViews().forEach(fcView => {
            interactHandler.attachInteractTo(fcView);
        });
        interpreter.mount(document.getElementById('do-input'));
    })();
    return <div id="do-input" style={{
        background: '#333'
    }}></div>;
};

export const 宾川大屏 = () => {
    // 解析页面JSON数据
    const interpreter = im.interprete(binchuan),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
        await fcViewManager.createComponentViews(interpreter.getAllElements(), {
            // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
            useLatestFCVersion: true
        });
        interpreter.mount(document.getElementById('do-binchuan'));
    })();
    return <div id="do-binchuan" style={{
        background: '#333'
    }}></div>;
};

export const 甘肃电投 = () => {
    // 解析页面JSON数据
    const interpreter = im.interprete(gansudiantou),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
        await fcViewManager.createComponentViews(interpreter.getAllElements(), {
            // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
            useLatestFCVersion: true
        });
        interpreter.mount(document.getElementById('do-gansu'));
    })();
    return <div id="do-gansu" style={{
        background: '#333'
    }}></div>;
};

export const 大唐广西 = () => {
    // 解析页面JSON数据
    const interpreter = im.interprete(dtgx),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
        await fcViewManager.createComponentViews(interpreter.getAllElements(), {
            // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
            useLatestFCVersion: true
        });
        interpreter.mount(document.getElementById('do-dtgx'));
    })();
    return <div id="do-dtgx" style={{
        background: '#333'
    }}></div>;
};

export const Demo1 = () => {
    // 解析页面JSON数据
    const interpreter = im.interprete(demo1),
        // 初始化参数： 相关资源加载地址
        fcViewManager = new FCViewManager({
            // 目前这2个地址已经合为一， 都使用unpkg的地址
            baseUrl: 'https://10.10.247.1:4899/api/unpkg',
            unpkgUrl: 'https://10.10.247.1:4899/api/unpkg'
        });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    (async() => {
        await fcViewManager.createComponentViews(interpreter.getAllElements(), {
            // 这个参数可以再无法获取旧的图元版本情况下，加载使用最新的版本
            useLatestFCVersion: true
        });
        interpreter.mount(document.getElementById('do-demo1'));
    })();
    return <div id="do-demo1" style={{
        background: '#333'
    }}></div>;
};
