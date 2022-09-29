import React from 'react'
import Editor from "./Editor.jsx";

import { FCViewManager } from 'ridge-view-manager';

const fcViewManager = new FCViewManager({
    baseUrl: '/npm_packages'
});

class App extends React.Component {
    constructor (props) {
        super(props);

        this.editorRef = React.createRef();

        this.state = {
            pageConfig: {
                nodes: [{
                    name: 'button',
                    
                    props: {

                    },
                    frame: {
                        position: "absolute",
                        left: "50%",
                        top: "30%",
                        width: "250px",
                        height: "200px",
                    }
                }]
            }
        }
    }

    render() {
        return <div className="app">
            <Editor
                pageConfig={this.state.pageConfig}
                ref={this.editor}
                debug={true}
            />
        </div>;
    }
}

export default App;
