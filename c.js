(()=>{
    var o = {
        440: e=>{
            e.exports = function() {
                return this.React
            }()
        }
        ,
        900: e=>{
            e.exports = function() {
                return this._
            }()
        }
    }
      , n = {};
    function y(e) {
        var t = n[e];
        return void 0 !== t || (t = n[e] = {
            exports: {}
        },
        o[e](t, t.exports, y)),
        t.exports
    }
    y.n = e=>{
        var t = e && e.__esModule ? ()=>e.default : ()=>e;
        return y.d(t, {
            a: t
        }),
        t
    }
    ,
    y.d = (e,t)=>{
        for (var o in t)
            y.o(t, o) && !y.o(e, o) && Object.defineProperty(e, o, {
                enumerable: !0,
                get: t[o]
            })
    }
    ,
    y.o = (e,t)=>Object.prototype.hasOwnProperty.call(e, t),
    y.r = e=>{
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ;
    var h = {};
    (()=>{
        "use strict";
        y.r(h),
        y.d(h, {
            default: ()=>u
        });
        var e = y(440)
          , n = y.n(e);
        const g = {
            styleBackgroundImage(e) {
                return e ? `url(${e})` : ""
            },
            styleFontFamily(e) {
                return "'" + e + "'"
            },
            styleToPx(e) {
                return -1 < (e + "").indexOf("px") ? e : e + "px"
            }
        };
        const o = new MutationObserver(e=>{
            for (const t of e)
                if (t.oldValue && -1 < t.oldValue.indexOf("display") && t.target && t.target.style && null != t.target.style.display && null == t.oldValue.match("display *: *" + t.target.style.display)) {
                    t.target.vislbleCallback && t.target.vislbleCallback();
                    break
                }
        }
        );
        function c(e, t) {
            e.vislbleCallback = t,
            o.observe(e, {
                childList: !1,
                subtree: !1,
                attributeOldValue: !0,
                attributeFilter: ["style"]
            })
        }
        var t, l, e = y(900);
        const d = ()=>{
            var e = document.querySelectorAll(".flexed-node");
            for (const o of e)
                null == o.oldStyle && (o.oldStyle = o.style.overflow),
                o.style.overflow = "hidden";
            for (const n of e)
                if (!n.view || !n.view.componentDefinition || "FlexBoxContainer" !== n.view.componentDefinition.type) {
                    var t = n.getBoundingClientRect();
                    if (t.width && t.height && (t.width !== n.view.instancePropConfig.width || t.height !== n.view.instancePropConfig.height))
                        try {
                            n.view && n.view.updateProps && n.view.updateProps({
                                width: t.width,
                                height: t.height
                            })
                        } catch (e) {}
                }
            for (const l of e)
                l.style.overflow = l.oldStyle
        }
        ;
        const r = (0,
        e.debounce)(d, 200);
        document.body.addEventListener("interact", e=>{
            e && e.detail && e.detail.object && null != e.detail.object.layoutType && (e.detail.object.debounced ? r : d)()
        }
        ),
        t = r,
        l = window.onresize,
        window.onresize = function() {
            l && l(),
            t()
        }
        ;
        class i extends n().Component {
            constructor(e) {
                super(),
                this.props = e,
                this.$el = n().createRef()
            }
            componentDidMount() {
                var {childrenViews: e, currentFcView: t, direction: o, alignItems: n, containerAutoStrech: l} = this.props;
                Object.assign(this.$el.current.style, this.getContainerStyle(this.props)),
                this.initFlexContent(e, t, o, n, l),
                "overlay" === this.props.flexContainerOverflow && (this.$el.current.style.overflow = "hidden",
                this.$el.current.onmouseover = ()=>{
                    this.$el.current.style.overflow = "overlay"
                }
                ,
                this.$el.current.onmouseout = ()=>{
                    this.$el.current.style.overflow = "hidden"
                }
                )
            }
            async updateProps(e) {
                const {currentFcView: t, childrenViews: o, direction: n="row", alignItems: l="stretch", containerAutoStrech: r} = e;
                this.$el.current && Object.assign(this.$el.current.style, this.getContainerStyle(e)),
                await this.initFlexContent(o, t, n, l, r)
            }
            async initFlexContent(n, e, l, r, i) {
                const a = [];
                if (n && n.length) {
                    n.sort((e,t)=>(e.fcInstanceConfig.flexIndex || 0) - (t.fcInstanceConfig.flexIndex || 0));
                    for (let e = 0; e < n.length; e++) {
                        const s = n[e];
                        let t = this.$el.current.children[e]
                          , o = !1;
                        if (null == t && (o = !0,
                        t = document.createElement("div"),
                        this.$el.current.appendChild(t)),
                        t.className = "flexed-node",
                        t.view = s,
                        t.setAttribute("fcid", s.fcInstanceConfig.guid),
                        null != s.instancePropConfig.flex && (t.style.flex = parseInt(s.instancePropConfig.flex)),
                        "row" === l ? (t.style.flex || i || (t.style.width = s.fcInstanceConfig.width + "px",
                        s.instancePropConfig.width = s.fcInstanceConfig.width),
                        "stretch" === r || i || (t.style.height = s.fcInstanceConfig.height + "px",
                        s.instancePropConfig.height = s.fcInstanceConfig.height)) : (t.style.flex || i || (t.style.height = s.fcInstanceConfig.height + "px",
                        s.instancePropConfig.height = s.fcInstanceConfig.height),
                        "stretch" === r || i || (t.style.width = s.fcInstanceConfig.width + "px",
                        s.instancePropConfig.width = s.fcInstanceConfig.width)),
                        s.instancePropConfig.styleMargin && (s.instancePropConfig.styleFlexMargin = s.instancePropConfig.styleMargin,
                        delete s.instancePropConfig.styleMargin),
                        null != s.instancePropConfig.flexNodeSize && ("row" === l && (t.style.width = s.instancePropConfig.flexNodeSize + "px"),
                        "column" === l && (t.style.height = s.instancePropConfig.flexNodeSize + "px")),
                        null != s.instancePropConfig.styleFlexMargin) {
                            t.style.margin = s.instancePropConfig.styleFlexMargin;
                            let e = t.children[0];
                            null == e && (o = !0,
                            (e = document.createElement("div")).__isInnerWrapper = !0,
                            t.appendChild(e)),
                            e.style.height = "100%",
                            e.style.width = "100%",
                            e.style.boxSizing = "border-box",
                            o ? (e.style.background = "rgba(255, 255, 255, .05)",
                            s.el = e,
                            this.props.flexNodeHiddenSpace || c(e, ()=>{
                                t.style.display = s.el.style.display,
                                d()
                            }
                            ),
                            a.push(s)) : s.renderer && s.updateProps()
                        } else
                            o ? (t.style.background = "rgba(255, 255, 255, .05)",
                            s.el = t,
                            this.props.flexNodeHiddenSpace || c(t, d),
                            a.push(s)) : s.renderer && s.updateProps()
                    }
                }
                if (a.length)
                    for (const t of a)
                        if (t.loadComponentDefinition) {
                            for (await t.loadComponentDefinition(); !t.componentDefinition; )
                                await (async t=>new Promise(e=>{
                                    setTimeout(e, t)
                                }
                                ))(100),
                                await t.loadComponentDefinition();
                            if (t.interactHandler = e.interactHandler,
                            t.initPropsAndEvents(),
                            0 < Object.keys(t.slotFcViews).length)
                                for (const o of Object.keys(t.slotFcViews))
                                    t.componentDefinition.slots && t.componentDefinition.slots.filter(e=>e.name === o && "connect" === e.type) && (t.apolloApp.viewManager.componentViews[t.pageId][t.slotFcViews[o].fcId] = t.slotFcViews[o]);
                            Object.assign(t.contextVariables, {
                                $scope: t.scopeVariables
                            }),
                            t.instancePropConfig && t.instancePropConfig.flexNodeOverflow && (null != t.instancePropConfig.styleMargin ? t.el.parentElement.style.overflow = t.instancePropConfig.flexNodeOverflow : t.el.style.overflow = t.instancePropConfig.flexNodeOverflow),
                            t.mount(),
                            delete t.contextVariables.$scope
                        } else
                            t.el.style.backgroundColor = "#bcd",
                            t.el.style.border = "1px solid green";
                if (this.loadMountViews = a,
                !this.props.flexNodeHiddenSpace)
                    for (const p of a)
                        p.el.__isInnerWrapper && p.el.parentElement.style.display !== p.el.style.display && (p.el.parentElement.style.display = p.el.style.display);
                d()
            }
            getContainerStyle(e) {
                const {isRuntime: t, currentFcView: o, childrenViews: n, apolloApp: l, direction: r="row", alignItems: i="stretch", justify: a="flex-start", width: s, height: p, refCallback: c, ...d} = e
                  , u = {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: r,
                    justifyContent: a,
                    alignItems: i
                };
                return d.nodePadding && (u.padding = d.nodePadding + "px"),
                Object.assign(u, function(n) {
                    if (!n || "object" != typeof n)
                        return null;
                    const e = Object.keys(n);
                    if (!e || !e.length)
                        return null;
                    const l = {};
                    return e.forEach(function(e, t) {
                        var o;
                        "style" === e.substring(0, 5) && (o = e.substring(5, 6).toLowerCase() + e.substring(6)) && (-1 < ["styleLetterSpacing", "styleLineHeight", "styleBorderWidth", "styleBorderRadius"].indexOf(e) ? l[o] = g.styleToPx(n[e]) : l[o] = g[e] ? g[e](n[e]) : n[e]),
                        "width" !== e && "height" !== e || (l[e] = n[e]),
                        "booleanStyleFontWeight" === e && (l.fontWeight = n[e] ? "bold" : "normal"),
                        "booleanStyleFontStyle" === e && (l.fontStyle = n[e] ? "oblique" : "normal")
                    }),
                    n.enableTextShadow && Object.assign(l, {
                        textShadow: `${n.textShadowX || 0}px ${n.textShadowY || 0}px ${n.textShadowBlur || 0}px ` + (n.textShadowColor || "#fff")
                    }),
                    n.enableBoxShadow && Object.assign(l, {
                        boxShadow: `${n.boxShadowX || 0}px ${n.boxShadowY || 0}px ${n.boxShadowBlur || 0}px ` + (n.boxShadowColor || "#fff")
                    }),
                    n.isFlex && Object.assign(l, {
                        display: "flex",
                        flexDirection: n.direction,
                        justifyContent: n.justify,
                        alignItems: n.alignItems
                    }),
                    "" === (null == n ? void 0 : n.styleColor) && (l.color = "#fff"),
                    l
                }(d)),
                delete u.margin,
                u
            }
            render() {
                const e = this.props["refCallback"];
                e && e(this);
                let t = "";
                this.currentFcView && this.currentFcView.fcInstanceConfig && this.currentFcView.fcInstanceConfig.guid && (t = this.currentFcView.fcInstanceConfig.guid);
                const o = this.getContainerStyle(this.props);
                return isNaN(this.props.styleBorderWidth) && (o.borderWidth = "1px"),
                this.props.flexContainerOverflow && (o.overflow = this.props.flexContainerOverflow),
                n().createElement("div", {
                    id: this.props.domId,
                    fcid: t,
                    ref: this.$el,
                    style: o,
                    className: "flex-container"
                })
            }
        }
        const a = [{
            name: "data",
            label: "数据",
            type: "object",
            group: "基础",
            control: "jsoneditor"
        }, {
            name: "textShowType",
            label: "布局",
            type: "string",
            control: "radio",
            group: "基础/全局",
            options: {
                options: {
                    "适应宽度": "autoWidth",
                    "适应高度": "autoHeight",
                    "固定尺寸": "size"
                }
            },
            value: "size",
            valueChange: (e,t,o)=>{
                let n = e["newVal"];
                return new Promise((e,t)=>{
                    setTimeout(()=>{
                        "autoWidth" === n ? e({
                            width: document.querySelector(`[fcid=${o}]`).children[0].children[1].clientWidth
                        }) : "autoHeight" === n ? e({
                            height: document.querySelector(`[fcid=${o}]`).children[0].children[0].clientHeight
                        }) : e({})
                    }
                    , 200)
                }
                )
            }
            ,
            hidden: (e,t)=>{
                const o = t.getParent();
                if (o && o.a("containerId")) {
                    const n = o.getParent();
                    if (n && "flex-container" === n.a("containerType") && n.a("guid") === o.a("containerId") && !n.getPropsData().containerAutoStrech) {
                        const e = t.getPropsData();
                        return t.setPropsData({
                            ...e,
                            textShowType: "size"
                        }),
                        !0
                    }
                }
                return !1
            }
        }, {
            name: "overFlowType",
            label: "内容溢出",
            type: "string",
            control: "radio",
            group: "基础/全局",
            options: {
                options: {
                    "隐藏": "hidden",
                    "自动换行": "wrap",
                    "横向滚动": "XScroll"
                }
            },
            value: "hidden",
            hidden: e=>"size" !== (null == e ? void 0 : e.textShowType)
        }, {
            name: "styleWordBreak",
            label: "单词截断",
            type: "string",
            control: "radio",
            group: "基础/全局",
            options: {
                options: {
                    "按词": "break-word",
                    "按字符": "break-all"
                }
            },
            value: "break-word",
            hidden: e=>"wrap" !== (null == e ? void 0 : e.overFlowType) || "size" !== (null == e ? void 0 : e.textShowType)
        }, {
            name: "styleWhiteSpace",
            label: "空格换行",
            type: "string",
            control: "radio",
            group: "基础/全局",
            options: {
                options: {
                    "合并为空格": "normal",
                    "合并空格、手动换行": "pre-line",
                    "保留空格、手动换行": "pre-wrap"
                }
            },
            value: "normal",
            hidden: e=>"wrap" !== (null == e ? void 0 : e.overFlowType) || "size" !== (null == e ? void 0 : e.textShowType)
        }, {
            name: "isShowScroll",
            label: "是否显示滚动条",
            type: "boolean",
            control: "boolean",
            group: "基础/全局",
            value: !1,
            hidden: e=>"wrap" !== (null == e ? void 0 : e.overFlowType)
        }, {
            name: "styleWritingMode",
            label: "排版方向",
            type: "string",
            control: "radio",
            group: "基础/全局",
            options: {
                options: {
                    "横向": "horizontal-tb",
                    "纵向": "vertical-lr"
                }
            },
            value: "horizontal-tb",
            hidden: e=>"XScroll" === (null == e ? void 0 : e.overFlowType) && "size" === (null == e ? void 0 : e.textShowType)
        }, {
            name: "text",
            label: "文本内容",
            type: "string",
            i18n: !0,
            group: "基础/全局",
            control: "text",
            value: "文本",
            valueChange: (e,o,n)=>{
                var {} = e;
                return new Promise((e,t)=>{
                    setTimeout(()=>{
                        "autoWidth" === (null == o ? void 0 : o.textShowType) ? e({
                            width: document.querySelector(`[fcid=${n}]`).children[0].children[1].clientWidth
                        }) : "autoHeight" === (null == o ? void 0 : o.textShowType) ? e({
                            height: document.querySelector(`[fcid=${n}]`).children[0].children[0].clientHeight
                        }) : e({})
                    }
                    , 200)
                }
                )
            }
        }, {
            name: "stylePadding",
            label: "内边距",
            type: "string",
            group: "基础/全局",
            control: "padding",
            value: "0px 0px 0px 0px"
        }, {
            name: "styleMargin",
            label: "外边距",
            type: "string",
            group: "基础",
            control: "text",
            value: "0px"
        }, {
            name: "styleFontSize",
            label: "字号",
            type: "number",
            options: {
                min: 12
            },
            control: "number",
            group: "基础/字符",
            value: 12
        }, {
            name: "styleColor",
            label: "颜色",
            type: "color",
            control: "colorpicker",
            group: "基础/字符",
            value: "var(--fgGray, #fff)"
        }, {
            name: "booleanStyleFontWeight",
            label: "是否加粗",
            type: "boolean",
            control: "boolean",
            group: "基础/字符",
            value: !1
        }, {
            name: "booleanStyleFontStyle",
            label: "是否斜体",
            type: "boolean",
            control: "boolean",
            group: "基础/字符",
            value: !1
        }, {
            name: "styleFontWeight",
            label: "字体类型",
            type: "string",
            control: "radio",
            group: "基础/字符",
            options: {
                options: {
                    "常规": "normal",
                    "加粗": "bold"
                }
            },
            value: "normal"
        }, {
            name: "styleFontFamily",
            label: "字体",
            type: "string",
            control: "font-dropdown",
            group: "基础/字符",
            value: "default"
        }, {
            name: "styleAlignItems",
            label: "垂直对齐方式",
            type: "string",
            control: "radio",
            group: "基础/字符",
            options: {
                options: {
                    "居上": "start",
                    "居中": "center",
                    "居下": "end"
                }
            },
            value: "start"
        }, {
            name: "styleJustifyContent",
            label: "水平对齐方式",
            type: "string",
            control: "radio",
            group: "基础/字符",
            options: {
                options: {
                    "居左": "start",
                    "居中": "center",
                    "居右": "end"
                }
            },
            value: "start"
        }, {
            name: "styleLetterSpacing",
            label: "字间距",
            type: "number",
            options: {
                min: 0
            },
            control: "number",
            group: "基础/字符",
            value: 1
        }, {
            name: "styleLineHeight",
            label: "行间距",
            type: "number",
            options: {
                min: 1
            },
            control: "number",
            group: "基础/字符",
            value: 24
        }, {
            name: "styleOutlineWidth",
            label: "粗细",
            type: "number",
            options: {
                min: 0
            },
            control: "number",
            group: "基础/描边",
            value: 0
        }, {
            name: "styleOutlineColor",
            label: "颜色",
            type: "color",
            group: "基础/描边",
            control: "colorpicker",
            value: "transparent"
        }, {
            name: "styleOutlineStyle",
            label: "类型",
            type: "string",
            control: "radio",
            group: "基础/描边",
            options: {
                options: {
                    "实线": "solid",
                    "虚线": "dashed"
                }
            },
            value: "solid"
        }, {
            name: "styleBorderWidth",
            label: "粗细",
            type: "string",
            group: "基础/描边",
            control: "text",
            value: "1px"
        }, {
            name: "styleBorderColor",
            label: "颜色",
            type: "color",
            group: "基础/描边",
            control: "colorpicker",
            value: "var(--ucBgC2,#00274D)"
        }, {
            name: "styleBorderStyle",
            label: "类型",
            type: "string",
            control: "radio",
            group: "基础/描边",
            options: {
                options: {
                    "实线": "solid",
                    "虚线": "dashed"
                }
            },
            value: "solid"
        }, {
            name: "styleBorderRadius",
            label: "圆角",
            options: {
                min: 0
            },
            type: "number",
            group: "基础/全局",
            control: "number",
            value: 0
        }, {
            name: "styleTextAlign",
            label: "文字对齐方式",
            type: "string",
            control: "radio",
            group: "基础/文本布局",
            options: {
                options: {
                    "左对齐": "left",
                    "右对齐": "right",
                    "居中对齐": "center"
                }
            },
            value: "left"
        }, {
            name: "styleTextOverflow",
            label: "文字超出",
            type: "string",
            control: "radio",
            group: "基础/文本布局",
            options: {
                options: {
                    "省略符号": "ellipsis",
                    "截断": "clip"
                }
            },
            value: "ellipsis"
        }, {
            name: "styleOverflow",
            label: "超出内容",
            type: "string",
            control: "radio",
            group: "基础/文本布局",
            options: {
                options: {
                    "隐藏": "hidden",
                    "显示": "visible",
                    "滚动条": "overlay"
                }
            },
            value: "hidden"
        }, {
            name: "backgroundType",
            label: "填充类型",
            type: "string",
            control: "radio",
            group: "基础/背景",
            options: {
                options: {
                    "纯色": "color",
                    "渐变": "gradient",
                    "图形": "image"
                }
            },
            value: "color"
        }, {
            name: "styleBackgroundColor",
            label: "填充颜色",
            type: "color",
            group: "基础/背景",
            control: "colorpicker",
            value: "transparent",
            hidden: e=>"color" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "backgroundColorStart",
            label: "起始颜色",
            type: "color",
            group: "基础/背景",
            control: "colorpicker",
            value: "transparent",
            hidden: e=>"gradient" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "backgroundColorEnd",
            label: "结束颜色",
            type: "color",
            group: "基础/背景",
            control: "colorpicker",
            value: "transparent",
            hidden: e=>"gradient" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "backgroundColorRange",
            label: "渐变角度",
            type: "number",
            group: "基础/背景",
            control: "number",
            options: {
                min: 0,
                max: 360
            },
            value: 0,
            hidden: e=>"gradient" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "styleBackgroundImage",
            label: "图片",
            type: "string",
            group: "基础/背景",
            value: "",
            control: "uploader",
            hidden: e=>"image" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "styleBackgroundPosition",
            label: "图片位置",
            type: "string",
            group: "基础/背景",
            control: "text",
            value: "0px 0px",
            hidden: e=>"image" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "styleBackgroundSize",
            label: "图片尺寸",
            type: "string",
            group: "基础/背景",
            control: "text",
            value: "auto",
            hidden: e=>"image" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "styleBackgroundRepeat",
            label: "图片重复",
            type: "string",
            group: "基础/背景",
            control: "radio",
            options: {
                options: {
                    "重复": "repeat",
                    "水平重复": "repeat-x",
                    "垂直重复": "repeat-y",
                    "不重复": "no-repeat"
                }
            },
            value: "repeat",
            hidden: e=>"image" !== (null == e ? void 0 : e.backgroundType)
        }, {
            name: "enableTextShadow",
            label: "是否开启",
            type: "boolean",
            group: "基础/投影",
            value: !1
        }, {
            name: "textShadowX",
            label: "横向偏移",
            type: "number",
            group: "基础/投影",
            control: "number",
            value: 0
        }, {
            name: "textShadowY",
            label: "纵向偏移",
            type: "number",
            group: "基础/投影",
            control: "number",
            value: 2
        }, {
            name: "textShadowBlur",
            label: "模糊大小",
            type: "number",
            group: "基础/投影",
            options: {
                min: 0
            },
            control: "number",
            value: 4
        }, {
            name: "textShadowColor",
            label: "颜色",
            type: "color",
            group: "基础/投影",
            control: "colorpicker",
            value: "var(--bgGrayT_100A_60, rgba(0,0,0,0.4))"
        }, {
            name: "enableBoxShadow",
            label: "是否开启",
            type: "boolean",
            group: "基础/投影",
            value: !1
        }, {
            name: "boxShadowX",
            label: "横向偏移",
            type: "number",
            group: "基础/投影",
            control: "number",
            value: 0
        }, {
            name: "boxShadowY",
            label: "纵向偏移",
            type: "number",
            group: "基础/投影",
            control: "number",
            value: 2
        }, {
            name: "boxShadowBlur",
            label: "模糊大小",
            type: "number",
            group: "基础/投影",
            options: {
                min: 0
            },
            control: "number",
            value: 4
        }, {
            name: "boxShadowColor",
            label: "颜色",
            type: "color",
            group: "基础/投影",
            control: "colorpicker",
            value: "var(--bgGrayT_100A_60, rgba(0,0,0,0.4))"
        }, {
            name: "styleCursor",
            label: "鼠标",
            type: "string",
            group: "基础",
            control: "select",
            options: {
                options: {
                    default: "默认光标",
                    crosshair: "十字线",
                    pointer: "手",
                    move: "可被移动",
                    "e-resize": "左右移动",
                    "ne-resize": "右上移动",
                    "nw-resize": "左上移动",
                    text: "文本",
                    wait: "程序忙",
                    help: "帮助"
                }
            },
            value: "default"
        }, {
            name: "isFlex",
            label: "启用",
            type: "boolean",
            group: "基础/弹性布局",
            value: !0
        }, {
            name: "direction",
            label: "排列方向",
            type: "string",
            control: "select",
            options: {
                options: {
                    row: "横向",
                    column: "纵向"
                }
            },
            value: "row",
            group: "基础/弹性布局"
        }, {
            name: "justify",
            label: "主轴对齐",
            type: "string",
            control: "select",
            options: {
                options: {
                    "flex-start": "靠左/靠上",
                    "flex-end": "靠右/靠下",
                    center: "居中",
                    "space-around": "空白两侧平分",
                    "space-between": "空白间隔平分"
                }
            },
            value: "flex-start",
            group: "基础/弹性布局"
        }, {
            name: "alignItems",
            label: "交叉对齐",
            type: "string",
            control: "select",
            options: {
                options: {
                    "flex-start": "顶部/左侧",
                    "flex-end": "底部/右侧",
                    center: "居中",
                    stretch: "拉伸"
                }
            },
            value: "stretch",
            group: "基础/弹性布局"
        }, {
            name: "flexWrap",
            label: "换行",
            type: "string",
            control: "select",
            options: {
                options: {
                    nowrap: "不换行",
                    wrap: "换行"
                }
            },
            value: "wrap",
            group: "基础/弹性布局"
        }];
        var s, p;
        const u = {
            title: "弹性容器",
            name: "FlexBoxContainer",
            icon: "icons/flex.svg",
            component: i,
            type: "FlexBoxContainer",
            props: [{
                name: "direction",
                label: "排列方向",
                type: "string",
                control: "select",
                options: {
                    options: {
                        row: "横向",
                        column: "纵向"
                    }
                },
                value: "row",
                group: "基础"
            }, {
                name: "justify",
                label: "主轴对齐",
                type: "string",
                control: "select",
                options: {
                    options: {
                        "flex-start": "靠左/靠上",
                        "flex-end": "靠右/靠下",
                        center: "居中",
                        "space-around": "空白两侧平分",
                        "space-between": "空白间隔平分"
                    }
                },
                value: "flex-start",
                group: "基础"
            }, {
                name: "alignItems",
                label: "交叉对齐",
                type: "string",
                control: "select",
                options: {
                    options: {
                        "flex-start": "顶部/左侧",
                        "flex-end": "底部/右侧",
                        center: "居中",
                        stretch: "拉伸"
                    }
                },
                value: "stretch",
                group: "基础"
            }, {
                name: "domId",
                label: "元素ID",
                type: "string",
                group: "基础",
                value: ""
            }, {
                name: "fillUpBody",
                label: "填充容器",
                type: "boolean",
                group: "基础",
                value: !1
            }, {
                name: "nodePadding",
                label: "内边距",
                type: "number",
                group: "基础",
                value: 0
            }, {
                name: "childSpacing",
                label: "节点间距",
                type: "number",
                group: "基础",
                value: 10
            }, {
                name: "flexNodeHiddenSpace",
                label: "隐藏占位",
                type: "boolean",
                group: "基础",
                value: !0
            }, {
                name: "containerAutoStrech",
                label: "按内容放大",
                type: "boolean",
                group: "基础",
                value: !1
            }, {
                name: "flexNodeSize",
                label: "防止撑开长度",
                type: "number",
                group: "基础",
                nullable: !0
            }, {
                label: "溢出滚动条",
                type: "string",
                group: "基础",
                name: "flexContainerOverflow",
                value: ""
            }, ...(s = ["styleBorderWidth", "styleBorderColor", "styleBorderStyle", "styleBorderRadius", "backgroundType", "styleBackgroundColor", "styleBackgroundImage", "styleBackgroundPosition", "styleBackgroundSize", "styleBackgroundRepeat", "enableBoxShadow", "boxShadowX", "boxShadowY", "boxShadowBlur", "boxShadowColor"],
            p = {
                styleBorderWidth: 0,
                styleBorderColor: "transparent"
            },
            a.filter(e=>-1 < s.indexOf(e.name)).map(e=>(p && null != p[e.name] && (e.value = p[e.name]),
            e)))],
            events: [],
            size: {
                width: 300,
                height: 200
            }
        }
    }
    )(),
    this["@gw/apollo-standard-containers/build/flex-container-index.fcp.js"] = h
}
)();
