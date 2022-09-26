# wind-pack-externals
图元编译期间标识为external的组件包列表
目前以下引用会在wind-cli编译期间忽略， 通过设置图元 externals属性指定加载

- react
- vue
- echarts
- bizcharts
- @antv/data-set
- hightcharts

## 统一发布打包 

```shell script
npm run build
```

将所有第三方库下载到本地 unpkg目录以便发布
