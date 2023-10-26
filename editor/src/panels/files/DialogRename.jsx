import React, { useState } from 'react'
import context from '../../service/RidgeEditorContext.js'

export default ({
  treeData,
  show,
  // For Rename
  currentFileNode, 
  confirmRename,
  // For Create
  parentFileNode,
  createFileType,
  confirmCreate
}) => {
  const [nameValid, setNameValid] = useState(true)

  const getSiblings  = () => {
    if (currentFileKey) {
      if (this.state.currentSelectedNode && this.state.currentSelectedNode.parentNode) {
        return this.state.currentSelectedNode.parentNode.children
      } else {
        return this.state.treeData
      }
    } else {
      if (this.state.currentSelectedNode && this.state.currentSelectedNode.children) {
        return this.state.currentSelectedNode.children
      } else {
        return this.state.treeData
      }
    }
  }

  /**
   * 实时检查名称是否冲突
   */
  const checkFileName = (val, key) => {
    const trimVal = trim(val)
    setNameValid(true)
    if (trimVal === '') {
      setNameValid(false)
    } else {
      const siblings = this.getCurrentSiblings().filter(sbl => {
        return sbl.label === trimVal && sbl.key !== key
      })

      if (siblings.length === 0) {
        this.setState({
          currentEditValid: true
        })
      } else {
        this.setState({
          currentEditValid: false
        })
      }
    }
  }

    return (
      <Modal
        title={currentEditKey ? '重命名' : (isCreateFile ? '新增页面' : '新增目录')}
        visible={createDialogShow}
        onOk={() => {
          if (this.state.currentEditValid) {
            if (currentEditKey) {
              confirmRename()
            } else {
              confirmCreateFile()
            }
          }
        }}
        onCancel={() => {
          this.setState({
            createDialogShow: false
          })
        }}
      >
        <Form
          labelPosition='left'
          labelAlign='right'
          labelWidth={80}
        >
          <Form.Input disabled label='所在目录' initValue={parentPaths} />
          <Form.Input
            initValue={currentEditFileName}
            validateStatus={currentEditValid ? '' : 'error'}
            label='名称' onChange={val => {
              this.editLabelCheck(val, currentEditKey)
            }}
          />
        </Form>
      </Modal>
    )
  }
