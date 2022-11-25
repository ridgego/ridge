# wind-boot

基于koa的web框架的模块化应用加载器

## 基本用法

在服务端应用中，一个应用会包含多个模块，包括底层模块、通用功能模块、通用业务模块、业务模块等。
从开发和验证角度，各种模块应该能被独立开发、测试、验证及替换（功能），从业务整合角度，这些模块又需要能被自由组合、包装成一个个具体应用。
要满足以上要求需要一个最小化的服务加载框架，基于koa的洋葱圈开发模型将各个模块组合到一起

加载框架的职责就是加载、初始化每个模块。而各个模块都是独立的，排除一些公共依赖可以进行独立部署。

## 默认配置

| 参数       | 说明 | 默认值  |
| :-----    | ----: | :---- |
| port      | http服务端口 | 无，不配置则不启动http服务 |
| httpsPort     | https服务端口 | httpsPort Key Cert 三个都配置才能启动https服务  |
| httpsKey     | https KEY | 无 |
| httpsCert     | https CERT | 无 |
| proxy     | 代理服务配置 | 无，具体可见下面的示例 |

既没有配置http、https服务，则boot框架启动后自动停止

### 样例

- 示例1： 仅启动80端口http服务

```javascript
const BootStrap = require('@gw/wind-boot');
const boot = new BootStrap({
  port: 80        
});
boot.start();
```

- 示例2： 同时启动http及https服务

```javascript
const BootStrap = require('@gw/wind-boot');
const boot = new BootStrap({
  port: 8082,  // http服务端口， 不写则不提供http服务
  httpsPort: 4099,  // https服务端口， port/key/cert 必须都提供才能提供https服务
  httpsKey: './key/server.key',
  httpsCert: './key/server.crt'
});
boot.start();
```


- 示例3： 加载一个简单的模块

```javascript
const BootStrap = require('@gw/wind-boot');
const boot = new BootStrap({
  port: 8082,  // http服务端口， 不写则不提供http服务
  packages: [async app => {
    await sleep(500);
    console.log('Hello Module')
  }]
});
boot.start();
```
上述模块启动时延迟500毫秒、并在控制台输出 Hello Module


- 示例3： 加载系统服务

```javascript
process.env.DEBUG = 'wind:*';
const Boostrap = require('@gw/wind-boot'),
    bootCtrl = require('@gw/wind-boot-control'),
    // 核心基础服务
    coreHttp = require('@gw/wind-core-http'), // http相关中间件 router
    coreLog = require('@gw/wind-core-log'), // 日志
    coreDAO = require('@gw/wind-core-dao'), // 数据存取
    nedbDAO = require('@gw/wind-dao-nedb'), // Nedb的数据存储实现
    assetService = require('@gw/wind-assets-service'), // 资源管理服务
    configurationService = require('@gw/configuration-project'), // 组态工程及应用管理服务
    config = require('./config');

const bootApp = new Boostrap(Object.assign(
    config, {
        packages: [coreHttp, coreLog, coreDAO, nedbDAO, assetService, configurationService]
    })
);

bootApp.start();
```

- 实例4：使用反向代理功能

```javascript
process.env.DEBUG = 'wind:*';
const BootStrap = require('@gw/wind-boot');

async function testProxy() {
    const config = {
            port: 8082,
            debug: 'wind:boot',
            proxy: {
                '/portal': {
                    target: 'https://10.10.2.67:9090',
                    bodyLog: true,
                    secure: false
                },
                '/api': {
                    target: 'http://10.10.247.1:4877'
                }
            },
            httpsPort: 4099,
            httpsKey: './key/server.key',
            httpsCert: './key/server.crt',
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

    boot.start();
}

testProxy();


```

### proxy 配置

加入proxy配置后， 对于指定的url前缀会发送到后端服务器，此时， node服务作为反向代理来使用。 此时，整个请求不过koa洋葱圈处理，反向代理使用http-proxy实现

可以通过booter的proxy对象获取node-proxy反向代理的回调。

```javascript
    boot.app.proxy.on('proxyReq', async function(proxyRes, req, res) {
        console.log('headers', req.ctx.headers);
        console.log('originalUrl', req.ctx.originalUrl);
        console.log('ip', req.ctx.ip);
        console.log('query', JSON.stringify(req.ctx.query));
        console.log('body', JSON.stringify(req.body));
    });
    
    boot.app.proxy.on('proxyRes', async function(proxyRes, req, res) {
        console.log('headers', req.ctx.headers);
        console.log('originalUrl', req.ctx.originalUrl);
        console.log('ip', req.ctx.ip);
        console.log('query', JSON.stringify(req.ctx.query));
        console.log('body', JSON.stringify(req.body));
    });
```

#### 反向代理时请求体的获取

当node服务作为反向代理时，实际整个req的body是直接以留形式pipe到实际http服务的，代理中无法获取body内容。 为了监控、排错等需要，对于具体某个转发的地址，可以加入配置

>   bodyLog: true

这种情况下，通过req.body可以获取请求体，相关的反向代理中解析、重串行化会产生一系列性能损失


```json
{
    port: 8082,
    debug: 'wind:boot',
    proxy: {
        '/portal': {
            target: 'https://10.10.2.67:9090',
            bodyLog: true,
            secure: false
        },
        '/api': {
            target: 'http://10.10.247.1:4877'
        }
    },
    httpsPort: 4099,
    httpsKey: './key/server.key',
    httpsCert: './key/server.crt'
}
```

在这个例子中， 向  http://10.10.247.1:4877/api 转发的请求不会处理请求体， proxyReq时也拿不到body 而/portal的请求则可以

## 模块规约

BootStrap 启动的packages参数可以设置0到n个模块， 这其中模块可以为以下格式

```javascript
module.exports = {
  name: 'moduleName',
  description: '模块名称',
  
  // 模块初始化动作，对于核心模块可以进行koa相关插件注册
  // 业务模块可以进行服务创建
  async created (app) {
    // 例如 app.context.moduleService = new ModuleService()
  },
  
  // 模块路由注册，对外提供API可在此写api相关地址
  async ready (app) {
    // 示例  
    // const router = app.context.router
    // router.get('/flaticon/search', async (ctx, next) => {
    //    ctx.moduleService.hello()
    // })
  },
  
  // 启动收尾工作，可以在此执行建库、建索引等一些全局的具体业务操作
  async bootComplete (app) {
    
  }
}
```
这其中 以上所有参数都是可选。另外对于只定义ready事件的模块，也可以写作纯函数

```javascript
async app => {
    await sleep(500);
    app.module3 = true;
}
```
等同于
```javascript
module.exports = {
  // 模块路由注册，对外提供API可在此写api相关地址
  async ready (app) {
    await sleep(500);
    app.module3 = true;
  },
}
```


