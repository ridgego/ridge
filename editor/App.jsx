import React from 'react'
import Editor from "./Editor.jsx";
import { Map, List } from 'immutable';

import { FCViewManager } from 'ridge-view-manager';

const fcViewManager = new FCViewManager({
    baseUrl: '/npm_packages'
});

class App extends React.Component {
    constructor (props) {
        super(props);

        this.pageConfig = {
            properties: {
                width: 320,
                height: 640 
            },
            nodes: [{
                id: '1',
                name: 'button',
                component: {
                    packageName: 'ridge-component-antd',
                    path: 'build/button-button.fcp.js'
                },
                props: {

                },
                style: {
                    position: "absolute",
                    left: "100px",
                    top: "30px",
                    width: "80px",
                    height: "40px",
                }
            }, {
                id: '2',
                name: 'button',
                component: {
                    packageName: 'ridge-component-antd',
                    path: 'build/button-button.fcp.js'
                },
                props: {

                },
                style: {
                    position: "absolute",
                    left: "20px",
                    top: "22px",
                    width: "80px",
                    height: "50px",
                }
            }]
        };

        this.pageProperties =  Map(this.pageConfig.properties);
        this.pageNodes = List(this.pageConfig.nodes);
        this.editorRef = React.createRef();

        this.state = {
            pageConfig: JSON.parse(JSON.stringify(this.pageConfig))
        };
    }

    render() {
        return <div className="app">
            <Editor
                pageConfig={this.state.pageConfig}
                styleChange={this.styleChange.bind(this)}
                ref={this.editor}
                debug={true}
            />
        </div>;
    }

    styleChange(changed) {
        const node = this.pageConfig.nodes.filter(n => n.id === changed.targetNode.id)[0];

        Object.assign(node.style, changed.style);
        this.setState({
            pageConfig: JSON.parse(JSON.stringify(this.pageConfig))
        });

    }
}

export default App;
