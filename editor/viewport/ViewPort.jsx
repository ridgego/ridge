import React from "react";
import RidgeNode from './RidgeNode.jsx';

export default class Viewport extends React.Component {
    constructor (props) {
        super(props);
    }

    render () {
        const style = this.props.style;
        const { nodes } = this.props;

        return <div className="viewport-container" onBlur={this.props.onBlur} style={style}>
            {this.props.children}
            <div className={"viewport"} ref={this.viewportRef}>
                {
                    nodes && nodes.map(node => {
                        return <RidgeNode key={node.id} {...node} />;
                    })
                }
            </div>
        </div>;
    }
}