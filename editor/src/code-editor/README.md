修改codemirror/ tooltip插件 默认position配置为absolute
```javascript
 createTooltip(tooltip) {
        let tooltipView = tooltip.create(this.view);
        tooltipView.dom.classList.add("cm-tooltip");
        if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
            let arrow = document.createElement("div");
            arrow.className = "cm-tooltip-arrow";
            tooltipView.dom.appendChild(arrow);
        }
        tooltipView.dom.style.position = 'absolute';
        tooltipView.dom.style.top = Outside;
        this.container.appendChild(tooltipView.dom);
        if (tooltipView.mount)
            tooltipView.mount(this.view);
        return tooltipView;
    }
```