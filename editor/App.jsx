import React from 'react'
import Editor from './Editor.jsx'
import { Map, List } from 'immutable'

class App extends React.Component {
  constructor (props) {
    super(props)

    this.pageConfig = {
      properties: {
        width: 800,
        height: 640
      },
      nodes: [{
        id: 'dkjerk',
        nameProp: '',
        component: {
          packageName: 'ridge-antd',
          path: 'build/button-button.fcp.js'
        },
        props: {

        },
        style: {
          position: 'absolute',
          width: '80px',
          height: '40px'
        }
      }, {
        id: 'fewlrkj',
        name: '按钮2',
        component: {
          packageName: 'ridge-antd',
          path: 'build/button-button.fcp.js'
        },
        props: {

        },
        style: {
          position: 'absolute',
          width: '80px',
          height: '50px'
        }
      }]
    }

    // for (let i = 0; i < 10; i++) {
    //   this.pageConfig.nodes.push({
    //     id: i + 1,
    //     name: 'button',
    //     component: {
    //       packageName: 'ridge-component-antd',
    //       path: 'build/button-button.fcp.js'
    //     },
    //     props: {

    //     },
    //     style: {
    //       position: 'absolute',
    //       transform: `translate(${Math.random() * 1900}px, ${Math.random() * 960}px)`,
    //       width: '80px',
    //       height: '50px'
    //     }
    //   })
    // }

    this.pageProperties = Map(this.pageConfig.properties)
    this.pageNodes = List(this.pageConfig.nodes)
    this.editorRef = React.createRef()

    this.state = {
      pageConfig: JSON.parse(JSON.stringify(this.pageConfig))
    }
  }

  render () {
    return (
      <div className='app'>
        <Editor
          pageConfig={this.state.pageConfig}
          styleChange={this.styleChange.bind(this)}
          ref={this.editor}
          debug
        />
      </div>
    )
  }

  styleChange (changed) {
    const node = this.pageConfig.nodes.filter(n => n.id === changed.targetNode.id)[0]

    Object.assign(node.style, changed.style)
    this.setState({
      pageConfig: JSON.parse(JSON.stringify(this.pageConfig))
    })
  }
}

export default App
