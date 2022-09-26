export default {
  v: "7.0.1-dev24",
  p: { autoAdjustIndex: true, hierarchicalRendering: true },
  a: {
    rotateAsClock: false,
    connectActionType: null,
    pageId: "4jp0WtYkw2pZAhEM",
    name: "展示页面",
    width: 600,
    height: 300,
    background: "#fff",
    gridable: true,
    gridSplitX: 48,
    gridSplitY: 36,
    fileList: [],
    zoom: 0.70103,
    _id: "4jp0WtYkw2pZAhEM",
  },
  d: [
    {
      c: "ht.Node",
      i: 50,
      p: {
        image: "HTMLSymbol",
        position: { x: 200, y: 100 },
        width: 304.4953,
        height: 133.42164,
      },
      a: {
        pel: {
          packageName: "@gw/fc-view-test",
          version: "0.2.4",
          name: "./test/input.js",
          path: "./test/input.js",
          title: "soam_指标1",
        },
        guid: "7zMWEIR",
        propsData: {
          width: 304.4953,
          height: 133.42164
        },
        db: {
          val: {
            dynamicBind: {
              variable: "inputValue"
            }
          }
        },
        in: [{
          "event":{
            "name":"increase",
            "preset":false
          },
          "handler": {
            "action":{
              "who":"system",
              "name":"setPageVariable",
              "payloadMapping": "inputValue"
            }
          }
        }]
      }
    }
  ],
  modified: "Fri Aug 28 2020 13:47:05 GMT+0800 (中国标准时间)",
  contentRect: { x: 0, y: 0, width: 800, height: 600 }
};
