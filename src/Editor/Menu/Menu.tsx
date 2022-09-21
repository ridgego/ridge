import * as React from "react";
import { prefix } from "../utils/utils";
import Icon from "../Icons/Icon";
import MoveToolIcon from "../Icons/MoveToolIcon";
import TextIcon from "../Icons/TextIcon";
import ZoomIn from "../Icons/ZoomInIcon";
import ZoomOut from "../Icons/ZoomOutIcon";
import MenuZoomOptions from "./MenuZoomOptions";
import styled from "react-css-styled";

const MenuElement = styled("div", `
{
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 42px;
    border-bottom: 1px solid var(--line-border-card);
    box-shadow: 0 2px 8px 0 rgb(31 35 41 / 6%);
    background: #fff;
    box-sizing: border-box;
    padding: 5px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

svg, .scena-i {
    pointer-events: none;
}

.scena-icon {
    display: inline-block;
    width: 30px;
    height: 30px;
    padding: 3px;
    box-sizing: border-box;
    cursor: pointer;
    border: 1px solid transparent;
    margin-bottom: 5px;
    border-radius: 3px;
    transition: all ease 0.2s;
    stroke: var(--icon-border);
}

.scena-icon svg path,
.scena-icon svg ellipse {
    stroke: var(--icon-border);
    fill: var(--icon-fill);
}

.scena-selected {
    background: var(--mainColor);
}

.scena-icon.scena-selected>svg path,
.scena-icon.scena-selected>svg ellipse,
.scena-sub-icon.scena-selected path,
.scena-sub-icon.scena-selected ellipse {
    stroke: var(--icon-border);
    fill: var(--icon-fill);
}

.scena-icon .scena-extends-icon {
    position: absolute;
    right: 2px;
    bottom: 2px;
    border-bottom: 5px solid var(--icon-fill);
    border-right: 0;
    border-left: 5px solid transparent;
}

.scena-extends-container {
    position: absolute;
    left: 110%;
    top: -30px;
    background: var(--back2);
    /* width: 200px;
    height: 200px; */
    border-radius: 5px;
    z-index: 1;
    transform: translate(10px) translateZ(2px);
    box-shadow: 1px 1px 2px var(--back1);
    display: none;
}

.scena-sub-icon {
    white-space: nowrap;
    padding: 0px 7px;
    margin: 7px 10px;
}

.scena-sub-icon .scena-icon {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: 25px;
    height: 25px;
    margin: 0;
}

.scena-sub-icon-label {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    color: white;
    font-size: 14px;
    font-weight: bold;
    padding: 0;
    margin: 0;
    margin-left: 5px;
}


.scena-keyboard {
    background: #fff;
    border-radius: 3px;
    width: 90%;
    height: 15px;
    margin: 3px 0px 7px;
    text-align: center;
    box-sizing: border-box;
    padding: 2px;
}

.scena-key {
    display: inline-block;
    width: 2px;
    height: 2px;
    background: var(--back2);
    margin: 1px;
}
.scena-space {
    display: inline-block;
    width: 12px;
    height: 2px;
    background: var(--back2);
    margin: 1px;
    border-radius: 1px;
}
`);
const MENUS: Array<typeof Icon> = [
    MoveToolIcon,
    ZoomIn,
    MenuZoomOptions,
    ZoomOut,
    TextIcon
];
export default class Menu extends React.PureComponent<{
    onSelect: (id: string) => any
}> {
    public state = {
        selected: "MoveTool",
    };
    public menuRefs: Array<React.RefObject<Icon>> = [];
    public render() {
        return (
            <MenuElement className={prefix("menu")}>
                {this.renderMenus()}
            </MenuElement>
        );
    }
    public renderMenus() {
        const selected = this.state.selected;
        const menuRefs = this.menuRefs;

        return MENUS.map((MenuClass, i) => {
            const id = MenuClass.id;
            if (!menuRefs[i]) {
                menuRefs[i] = React.createRef();
            }
            return <MenuClass ref={menuRefs[i]} key={id} selected={selected === id} onSelect={this.select} />;
        });
    }
    public select = (id: string) => {
        this.setState({
            selected: id,
        });
        this.props.onSelect(id);
    }
    public getSelected(): typeof Icon | undefined {
        const selected = this.state.selected;
        return MENUS.filter(m => m.id === selected)[0];
    }
    public blur() {
        this.menuRefs.forEach(ref => {
            if (!ref.current) {
                return;
            }
            ref.current.blur();
        });
    }
}
