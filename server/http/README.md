# wind-core-http
 
 基于koa的模块化应用下，系统级通用HTTP相关中间件注册模块、实现HTTP请求解析、路由、静态资源服务及HTTP相关异常及响应的封装等功能

## 基本功能

![img1](http://10.10.247.1:4877/api/unpkg/@gw/wind-core-http@latest/http.png)
这其中
CORS： 跨域响应相关功能 (kcors)
BodyParser：请求体解析，包括上传文件的请求 (koa-body)
Router: 路由服务初始化，后续模块可以使用路由服务进行路由注册，模块在启动结束时进行路由的挂载 (@koa/router)
Serve: 静态资源托管服务 (koa-static)
Compress: 内容压缩 (koa-compress)
HTTPError：Http异常处理，对业务模块抛出的Http异常进行直接的封装返回
ResponseWrap：按照接口规约对接口返回数据进行封装

## 模块服务

加入模块后，通过 

- app.router
- app.context.router

即可获取路由对象, 路由挂载后， 接口地址是 /api/{设置的路由地址} ，通过api参数配置统一接口前缀

## 相关配置参数

```javascript
const config = {
  cors: {
    credentials: true
  },
  uploadStorage: '../upload_storage',
  uploadQuota: 50 * 1024 * 1024,
  public: './public',
  api: '/api'
}
```

| 左对齐 | 右对齐 | 居中对齐 |
| :-----| :---- | :---- |
| uploadStorage  | 上传文件位置 | ../upload_storage |
| uploadQuota | 上传文件大小限额 | 50 * 1024 * 1024 (50M) |
| public | 静态资源托管 | 无 |
| api | 接口的统一前缀 | 默认为/api 设置为 '' 则表示不加前缀 |

## Http异常处理

异常处理包括2方面功能：

1. 对于一些通用的处理异常能进行通用的异常码返回。
2. 对于一些未知的异常情况进行相关返回和提示，并屏蔽其错误对其他正常业务的处理。

异常处理参照ES的异常类继承结构进行定义，异常类分为3个主要类型：ES标准异常、HTTP异常及业务系统异常

![img1](http://10.10.247.1:4877/api/unpkg/@gw/wind-core-http@latest/errors.png)

异常处理的整体思想是“谁声明、谁捕获”

- 对于ES标准异常，由全局中间件进行捕获，并报出相关错误。
- 对于HTTP异常，由HTTP模块进行定义并捕获，其他业务模块要使用这些通用状态码，可以从HTTP模块引入这些异常根据处理情况进行直接抛出
- 如果业务模块自己定义了异常(非HTTP异常子类)，需要创建一个中间件对这些异常进行统一捕获处理。



### 可使用异常列表

```javascript
app.HttpError = HttpError;
app.BadRequestError = BadRequestError;
app.ConflictError = ConflictError;
app.NotFoundError = NotFoundError;
app.ServiceUnavailableError = ServiceUnavailableError;
```

应用只需要抛出异常即可， 后续http模块会捕获并给用于以格式化的返回

 **示例**
 
业务模块中抛出这个异常

```javascript
throw new app.HttpError(429, '错误信息')
```
不进行捕获处理，前端页面会收到以下信息

```json
{
    code: 429,
    msg: '错误信息'
};
```


 
 ## 挂载源代码
 
```javascript

        if (app.config.cors) {
            // CORS跨域支持
            app.use(cors(app.config.cors));
        } else {
            app.use(
                cors({
                    credentials: true
                })
            );
        }

        app.use(compress({
            br: false // disable brotli
        }));
        // 请求体解析，包括文件上传处理
        app.use(bodyParser({
            multipart: true,
            formidable: {
                uploadDir: app.config.uploadStorage || '../upload_storage',
                maxFileSize: app.config.uploadQuota || 50 * 1024 * 1024 // 设置上传文件大小最大限制，默认50M
            }
        }));

        // 初始化路由实例
        app.router = app.context.router = new Router();

        // 静态资源托管
        if (app.config.public) {
            app.use(serve(app.config.public, {
                directorySlash: true,
                maxage: 30 * 24 * 60 * 60 * 1000
            }));
        }
        app.middlewares = {};

```
 


[http://10.10.247.1:4877/api/unpkg/@gw/demo-page-run@latest/redux-data-flow.png]: http://10.10.247.1:4877/api/unpkg/@gw/demo-page-run@latest/redux-data-flow.png
