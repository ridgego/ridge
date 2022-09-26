/*
 * @Author: XuQiang
 * @Date: 2022-01-18 09:45:28
 * @LastEditTime: 2022-02-21 14:51:36
 * @LastEditors: XuQiang
 */
import ViewDecorator from './view_decorator.js';
import './../tooltip.css';

export default class TooltipDecorator extends ViewDecorator {
    mounted(fcViewInstance) {
        this.handleTooltipConfig(fcViewInstance);
    }

    /**
   * 处理组件tooltip配置
   */
    handleTooltipConfig(fcViewInstance) {
        if (fcViewInstance.instancePropConfig.tooltipEnabled) {
            this.setTooltip(fcViewInstance);
        }
    }

    setTooltip(fcViewInstance) {
        const tipBox = document.createElement('div');

        tipBox.className = `apollo_tooltip apollo_tooltip_${
            fcViewInstance.instancePropConfig.tooltipPlacement
                ? fcViewInstance.instancePropConfig.tooltipPlacement
                : 'top'
        }`;
        tipBox.id = `tooltip_${fcViewInstance.fcId}`;
        const arrow = document.createElement('div');

        arrow.className = 'apollo_tooltip_arrow';
        const arrowContent = document.createElement('span');

        arrowContent.className = 'apollo_tooltip_arrow_content';
        arrow.appendChild(arrowContent);

        const tooltip = document.createElement('div');

        tooltip.className = 'apollo_tooltip_text';
        tooltip.innerHTML = fcViewInstance.instancePropConfig.tooltipContent;
        tipBox.appendChild(arrow);
        tipBox.appendChild(tooltip);
        tipBox.style.left = '-9999px';

        tipBox.style.transform = `translateX(${
            fcViewInstance.instancePropConfig.tooltipX
                ? fcViewInstance.instancePropConfig.tooltipX
                : 0
        }px) translateY(${
            fcViewInstance.instancePropConfig.tooltipY
                ? fcViewInstance.instancePropConfig.tooltipY
                : 0
        }px)`;
        if (fcViewInstance.instancePropConfig.tooltipTrigger === 'click') {
            fcViewInstance.el.addEventListener('click', () => {
                if (!document.body.querySelector(`#tooltip_${fcViewInstance.fcId}`)) {
                    document.body.appendChild(tipBox);
                } else {
                    tipBox.style.left = '-9999px';
                    tipBox.style.display = 'inline-block';
                }

                let parentRect = fcViewInstance.el.getBoundingClientRect(),
                    domRect = tipBox.getBoundingClientRect();

                Object.assign(
                    tipBox.style,
                    this.setPosition(
                        fcViewInstance.instancePropConfig.tooltipPlacement,
                        parentRect,
                        domRect
                    )
                );
            });
            document.documentElement.addEventListener('click', (e) => {
                const el = document.body.querySelector(`#tooltip_${fcViewInstance.fcId}`);

                if (el && !el.contains(e.target) && !fcViewInstance.el.contains(e.target)) {
                    el.style.display = 'none';
                }
            });
        } else {
            fcViewInstance.el.addEventListener('mouseenter', () => {
                if (!document.body.querySelector(`#tooltip_${fcViewInstance.fcId}`)) {
                    document.body.appendChild(tipBox);
                } else {
                    tipBox.style.left = '-9999px';
                    tipBox.style.display = 'inline-block';
                }
                let parentRect = fcViewInstance.el.getBoundingClientRect(),
                    domRect = tipBox.getBoundingClientRect();

                Object.assign(
                    tipBox.style,
                    this.setPosition(
                        fcViewInstance.instancePropConfig.tooltipPlacement,
                        parentRect,
                        domRect
                    )
                );
            });
            fcViewInstance.el.addEventListener('mouseleave', () => {
                const tip = document.body.querySelector(`#tooltip_${fcViewInstance.fcId}`);

                if (tip) {
                    tip.style.display = 'none';
                }
            });
        }
    }

    setPosition(placement, parentRect, domRect) {
        // 默认间距4px
        switch (placement) {
        case 'bottomLeft':
            return {
                left: `${parentRect.left}px`,
                top: `${parentRect.top + parentRect.height + 4}px`
            };
        case 'bottomRight':
            return {
                left: `${parentRect.left + parentRect.width - domRect.width}px`,
                top: `${parentRect.top + parentRect.height + 4}px`

            };
        case 'left':
            return {
                left: `${parentRect.left - domRect.width - 4}px`,
                top: `${parentRect.top + parentRect.height / 2 - domRect.height / 2}px`
            };
        case 'right':
            return {
                left: `${parentRect.left + parentRect.width + 4}px`,
                top: `${parentRect.top + parentRect.height / 2 - domRect.height / 2}px`
            };
        case 'topLeft':
            return {
                left: `${parentRect.left}px`,
                top: `${parentRect.top - domRect.height - 10}px`
            };
        case 'top':
            return {
                left: `${parentRect.left + parentRect.width / 2 - domRect.width / 2}px`,
                top: `${parentRect.top - domRect.height - 10}px`
            };
        case 'topRight':
            return {
                top: `${parentRect.top - domRect.height - 10}px`,
                left: `${parentRect.left + parentRect.width - domRect.width}px`
            };
        default:
            return {
                left: `${parentRect.left + parentRect.width / 2 - domRect.width / 2}px`,
                top: `${parentRect.top + parentRect.height + 4}px`
            };
        }
    }

    unmount(fcViewInstance) {
        const tooltipEle = document.querySelector(`#tooltip_${fcViewInstance.fcId}`);

        if (tooltipEle) {
            tooltipEle.parentNode.removeChild(tooltipEle);
        }
    }
}
