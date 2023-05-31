import { Select, Space, withField, Button, InputNumber, Collapsible, Typography } from '@douyinfe/semi-ui'

const SeriesTableEdit = ({
  value,
  onChange
}) => {
  const v = value || {}

  const categories = v.categories || []
  const series = v.series || [{
    name: '系列1',
    data: []
  }]

  const addCategory = () => {
    
  }
  return (
    <>
      <table className='series-table-edit'>
        <tr>
          <th />
          <th>分类</th>
          {series.map((serie, i) => <th key={i} contentEditable>{serie.name}</th>)}
          <th className='column-plus'>+</th>
        </tr>
        {categories.map((ct, i) =>
          <tr key={i}>
            <td>{i}</td>
            <td contentEditable>{ct}</td>
            {series.map((serie, k) => <td key={k} contentEditable>{serie.data[i]}</td>)}
          </tr>)}
        <tr>
          <td className='row-plus' onClick={addCategory}>+</td>
        </tr>
      </table>

    </>
  )
}

export default withField(SeriesTableEdit)
