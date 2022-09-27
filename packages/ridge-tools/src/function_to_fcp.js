
import functionToFc from './function_to_fc.js'

export function getFunctionFcp ({
  func,
  title,
  name,
  icon,
  props
}) {
  const FCP = {
    title,
    name,
    icon: icon || 'BarsOutlined',
    props: (props || []).concat([{
      name: 'title',
      label: '标题',
      type: 'string',
      control: 'text',
      group: '基础'
    }, {
      name: 'color',
      label: '颜色',
      type: 'color',
      control: 'colorpicker',
      group: '基础'
    }]),
    events: [{
      name: 'output'
    }],
    // 图元推荐大小
    size: {
      width: 80,
      height: 40
    }
  }

  FCP.component = functionToFc(func, title)
  return FCP
}
