import React, { useEffect, useState } from 'react'
import { Button, Upload, Modal, Input, Table, Toast } from '@douyinfe/semi-ui'
import { IconDelete, IconUndo } from '@douyinfe/semi-icons'
import { emit, ridge } from '../../service/RidgeEditorService'
import { EVENT_WORKSPACE_RESET, EVENT_APP_OPEN } from '../../constant'
const { Column } = Table

export default () => {
  const [tag, setTag] = useState('')
  const [tagShow, setTagShow] = useState(false)
  const [data, setData] = useState([])
  const [toastId, setToastId] = useState()

  const exportApp = async () => {
    if (toastId) {
      return
    }
    const id = Toast.info({
      content: '正在导出应用，请稍侯...',
      duration: 0,
      onClose: () => {
        setToastId(null)
      }
    })
    setToastId(id)
    await ridge.appService.exportAppArchive()
    Toast.close(id)
    setToastId(null)
  }

  useEffect(() => {
    updateHistoryTable()
  }, [true])
  const updateHistoryTable = async () => {
    setData(await ridge.appService.getAllBackups())
  }
  const newHistory = async () => {
    await ridge.appService.backUpAppArchive(tag)
    setTag('')
    setTagShow(false)
    await updateHistoryTable()
  }
  const removeHistory = async id => {
    await ridge.appService.removeBackup(id)
    await updateHistoryTable()
  }
  const recoverHistory = async id => {
    Modal.confirm({
      zIndex: 10001,
      title: '还原本地备份',
      content: '还原本地备份会清空现有应用所有配置，您可以考虑先将现有应用备份或导出。是否继续操作?',
      onOk: async () => {
        await ridge.appService.recoverBackUpAppArchive(id)
        await updateHistoryTable()
      }
    })
  }
  return (
    <div className='app-backup'>
      <div className='button-bar'>
        <div className='create'>
          {tagShow &&
            <Input
              width={120}
              size='small'
              value={tag} onChange={val => {
                setTag(val)
              }}
            />}
          {!tagShow &&
            <Button
              size='small' theme='solid' type='primary' onClick={() => {
                setTagShow(true)
              }}
            >新增备份
            </Button>}
          {tagShow &&
            <Button
              size='small' theme='solid' type='primary' onClick={() => {
                newHistory()
              }}
            >保存
            </Button>}
        </div>

        <Button size='small' onClick={exportApp}>导出应用</Button>
        <Upload
          showUploadList={false} uploadTrigger='custom' onFileChange={files => {
            Modal.confirm({
              zIndex: 10001,
              title: '确认导入应用',
              content: '导入应用会首先覆盖现有应用，如果有需要的工作，建议您首先导出备份。 是否继续?',
              onOk: async () => {
                const result = await ridge.backUpService.importAppArchive(files[0])
                Toast.info('成功导入应用，共' + result.length + '个文件')
                emit(EVENT_WORKSPACE_RESET)
                emit(EVENT_APP_OPEN)
              }
            })
          }} accept='.zip'
        >
          <Button size='small'>导入应用</Button>
        </Upload>
      </div>
      <div className='backup-history'>
        <Table size='small' dataSource={data} pagination>
          <Column title='备份时间' dataIndex='created' key='created' />
          <Column title='页面数量' dataIndex='pageCount' key='pageCount' />
          <Column title='标签' dataIndex='name' key='name' />
          <Column
            title='-' dataIndex='operate' key='operate'
            render={(text, record) => {
              return (
                <>
                  <Button icon={<IconUndo />} onClick={() => recoverHistory(record._id)} />
                  <Button type='danger' icon={<IconDelete />} onClick={() => removeHistory(record._id)} />
                </>
              )
            }}
          />
        </Table>
      </div>
    </div>
  )
}
