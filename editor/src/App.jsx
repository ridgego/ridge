import React from 'react'
import Editor from './Editor.jsx'

class App extends React.Component {
  constructor (props) {
    super(props)

    this.pageConfig = `
      <head>
      </head>
      <datalist id="ridge-page-config">
        <option value="新增页面" key="title" />
        <option value="fixed" key="type" />
        <option value="800" key="width" />
        <option value="600" key="height" />
      </datalist>
      <datalist id="ridge-page-variables">
        <option value="Ridge" type="string" key="name" />
      </datalist>
      <body>
        <div ridge-id="dkjerk" component-path="ridge-antd/build/button-button.fcp.js" data-name="按钮1" 
          style="position: absolute; transform: translate(20px, 55px); width: 80px; height: 35px;">
        </div>
        <div ridge-id="dkjerk" component-path="ridge-antd/build/button-button.fcp.js" data-name="按钮2" data-props-text="请点击" data-event-click=""
          style="position: absolute; transform: translate(420px, 100px); width: 80px; height: 35px;">
        </div>
      </body>
    `
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
