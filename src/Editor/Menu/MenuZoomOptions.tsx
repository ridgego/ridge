import * as React from "react";
import Icon from "../Icons/Icon";
import { prefix } from "../utils/utils";

export default class MenuZoomOptions extends Icon {
    public static id = "MenuZoom";
    public selectable = false;
    public renderIcon() {
        return (
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1528"><path d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667zM597.333333 437.333333H341.333333c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h256c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z" p-id="1529"></path></svg>
        );
    }
    public render() {
        return (
            <div className={prefix("icon", (this.props.selected && this.selectable) ? "selected" : "")}
                style={{
                    width: '95px',
                    padding: '1px',
                    verticalAlign: 'top'
                }}>
                <select style={{
                    borderRadius: '4px',
                    border: '1px solid var(--icon-border)',
                    padding: '4px 5px',
                    width: '90px'
                }}
                onChange={(event) => {
                    this.props.onSelect && this.props.onSelect(event.target.value)
                }}>
                    <option value="zoom-0.2">20%</option>
                    <option value="zoom-0.5">50%</option>
                    <option value="zoom-0.7">70%</option>
                    <option value="zoom-0.8">80%</option>
                    <option value="zoom-0.9">90%</option>
                    <option value="zoom-1">100%</option>
                    <option value="zoom-1.2">120%</option>
                    <option value="zoom-2">200%</option>
                    <option value="zoom-fit">自动适应大小</option>
                </select>
            </div>
        );
    }
}
