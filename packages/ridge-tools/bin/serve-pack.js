process.env.DEBUG = 'wind:*, apollo:*';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const Boostrap = require('@gw/wind-boot'), // 启动器
    path = require('path'),
    fs = require('fs'),
    coreHttp = require('@gw/wind-core-http');

    
function servePack (port, signals, buildResult) {
    const bootApp = new Boostrap(Object.assign(
        {
            httpsPort: port,
            // https key
            httpsKey: path.resolve(__dirname, './key/server_private.key'),
            // https cert
            httpsCert: path.resolve(__dirname, './key/server.crt'),
            public: [path.resolve('./')],
            cors: {
                credentials: true
            }
        }, {
            packages: [coreHttp, (app) => {
                app.router.get('/fc/list', async(ctx, next) => {
                    const buildPath = path.resolve('./build');
                    const files = fs.readdirSync(buildPath);
                    ctx.body = {
                        list: files
                    };
                    await next();
                });

                app.router.get('/t', async(ctx, next) => {
                    ctx.body = {
                        lastBuilt: signals.timestamp
                    }
                    await next();
                });
                app.router.get('/stats', async(ctx, next) => {
                    console.log('buildResult', buildResult);
                    buildResult.statObject.code = 200;
                    ctx.body = buildResult.statObject;
                    await next();
                })
            }]
        })
    );
    
    bootApp.start();
}    
module.exports = servePack

