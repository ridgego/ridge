/* eslint-disable no-undef */
const getPort = require('get-port'),
    path = require('path'),
    BootStrap = require('../src/bootstrap');

test('Proxy test', async() => {
    const config = {
            port: await getPort(),
            debug: 'wind:boot',
            proxy: {
                '/portal': {
                    target: 'https://10.10.2.68:8102',
                    secure: false
                },
                '/api': {
                    target: 'http://10.10.247.1:4877'
                }
            },
            packages: [async app => {}]
        },
        boot = new BootStrap(config);

    try {
        await boot.start();

        expect(boot.app.proxy !== null).toBeTruthy();
        expect(typeof boot.app.proxy.on).toBe('function');
        expect(typeof boot.app.proxy.web).toBe('function');
    } catch (e) {
        console.log(e);
    }
    await boot.stop();
});

test('Proxy Log test', async() => {
    const config = {
            port: 8082,
            debug: 'wind:boot',
            proxy: {
                '/portal': {
                    target: 'https://10.10.2.67:9090',
                    writeLog: true,
                    secure: false
                },
                '/api': {
                    target: 'http://10.10.247.1:4877'
                }
            },
            httpsPort: 4099,
            httpsKey: path.resolve(__dirname, './key/server.key'),
            httpsCert: path.resolve(__dirname, './key/server.crt'),
            packages: [async app => {
                app.proxy.on('proxyReq', async function(proxyRes, req, res) {
                    console.log('headers', req.ctx.headers);
                    console.log('originalUrl', req.ctx.originalUrl);
                    console.log('ip', req.ctx.ip);
                    console.log('query', JSON.stringify(req.ctx.query));
                    console.log('body', JSON.stringify(req.body));
                });

                app.proxy.on('proxyRes', async function(proxyRes, req, res) {
                    console.log('headers', req.ctx.headers);
                    console.log('originalUrl', req.ctx.originalUrl);
                    console.log('ip', req.ctx.ip);
                    console.log('query', JSON.stringify(req.ctx.query));
                    console.log('body', JSON.stringify(req.body));
                });
            }]
        },
        boot = new BootStrap(config);

    await boot.start();
    await boot.stop();
});

test('Apply Proxy Test', async() => {
    const config = {
            port: await getPort(),
            debug: 'wind:boot',
            proxy: {},
            packages: []
        },
        boot = new BootStrap(config);

    await boot.start();

    boot.app.applyProxy({
        '/api': {
            target: 'http://10.10.247.1:4877'
        }
    });
    await boot.stop();
});
