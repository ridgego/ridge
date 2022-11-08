import React from 'react'
import Editor from './Editor.jsx'

class App extends React.Component {
  constructor (props) {
    super(props)

    this.pageConfig = {
      properties: {
        name: '新增页面',
        type: 'fixed',
        width: 800,
        height: 640
      },
      nodes: [{
        id: 'dkjerk',
        name: '按钮1',
        componentPath: 'ridge-antd/build/button-button.fcp.js',
        componentConfig: {
          props: {},
          position: {
            x: 20,
            y: 55,
            width: 80,
            height: 35
          }
        }
      }, {
        id: 'fewlrkj',
        name: '按钮2',
        componentPath: 'ridge-antd/build/button-button.fcp.js',
        componentConfig: {
          props: {},
          position: {
            x: 20,
            y: 355,
            width: 80,
            height: 35
          }
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

    this.editorRef = React.createRef()

    this.state = {}
  }

  componentDidMount () {
    this.editorRef.current.loadPage(this.pageConfig)
  }

  render () {
    return (
      <div className='app'>
        <Editor
          ref={this.editorRef}
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
