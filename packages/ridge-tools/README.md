# Ridge Component Build & Debug Tool

## 参数

```
build-fc --help
 
 Usage: build.js [options] [command]
  
 Commands:
   help     Display help
   version  Display version
  
 Options:
   -d, --dir [value]  The Front Component Project Root Path (defaults to "./")
   -h, --help         Output usage information
   -p, --port         Package Provider Host Port
   -r, --remote       Enable Remote Debug
   -s, --src          No Minimize
   -v, --version      Output the version number
   -w, --watch        Build with Watch
```

```
-d 指定组件包所在目录。 默认在组件包目录执行此命令无需提供

-p 本地调试服务端口

-r 启动远程调试

-s 源代码方式构建 （组件调试需要）

-w 代码变动重新编译
```

可以将以下常用命令加入 package.json 

```
{
    "name": "@gw/apollo-standard-containers",
    "version": "2.100.0-dev-11",
    "description": "容器组件",
    "releaseNote": "新增弹出层",
    "releaseTime": "2022-05-01",
    "apolloVersion": "V8.0.415.0",
    "scripts": {
        "storybook": "start-storybook -p 9003",
        "build": "build-fc",
        "watch": "build-fc -w",
        "help": "build-fc --help",
        "debug": "build-fc -w -s -p 8700",
        "bs": "build-fc -s",
        "pd": "npm publish --tag dev"
    },
    "keywords": [
        "Container"
    ],
    ....
}
```


## Webpack配置修改

工具使用webpack对组件进行配置，如果需要对配置进行进一步修改，可以在组件项目根目录放置  apollo.config.js 进行配置覆盖 

例如：
```javascript
const path = require('path');

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                '@common': path.resolve(__dirname, './src')
            }
        }
    }
}
```

这时，如果用storybook构建，也要同步补充修改story的配置保持一致

```js
// .storybook/main.js
const path = require('path'),
{ merge } = require('webpack-merge'),
apolloConfig = require('../apollo.config');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "core": {
    "builder": "webpack5"
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    return merge(config, apolloConfig.configureWebpack);
  }
}

```

## 变更记录
- 2.1.6 支持组件根目录下 apollo.config.js 文件，在其中配置configWebpack进行webpack属性合并修改
- 2.1.5 支持用字符串替换的方式将所有JS文件中ACN(E)编译转换为CCV
- 2.1.4 watch/debug模式忽略 package.json变化
- 2.1.3 增加对主题ccvlist处理