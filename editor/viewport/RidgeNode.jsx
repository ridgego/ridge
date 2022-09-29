import React from 'react'

export default class RidgeNode extends React.Component {
    constructor () {
        this.ref = React.createRef();
    }

    componentDidMount() {
        fcViewManager.createComponentView(this.props.fcp, this.ref.current, this.props.props);
        console.log('ReactFC props', props);
    }


    render() {
        const { frame, id } = this.props;
        return <div className="ridge-node" style={frame} ref={this.ref} ridge-componet-id={id}></div>;
    }
}
