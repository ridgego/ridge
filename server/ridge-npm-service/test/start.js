process.env.DEBUG = 'wind:*';
const Boostrap = require('@gw/wind-boot'),
    httpCore = require('@gw/wind-core-http'),
    daoCore = require('@gw/wind-core-dao'),
    logCore = require('@gw/wind-core-log'),
    unpkg = require('@gw/wind-unpkg'),
    daoNedb = require('@gw/dao-nedb'),

    // 模块引用、加入
    moduleCurrent = require('../src');

const bootApp = new Boostrap(Object.assign({
    assetsPackageStorage: './npmStorage',
    verdaccioStorage: './npmStorage',
    npmServer: 'http://10.10.247.1:4873'
}, {
    packages: [httpCore, daoCore, logCore, daoNedb, moduleCurrent, unpkg]
})
);

bootApp.start();
