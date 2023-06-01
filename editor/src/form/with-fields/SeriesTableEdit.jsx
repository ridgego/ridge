import { Popover, Button, withField } from '@douyinfe/semi-ui'
import { IconMinusCircleStroked } from '@douyinfe/semi-icons'
const SeriesTableEdit = ({
  value,
  onChange
}) => {
  const v = value || {}

  const categories = v.categories || ['分类1']
  const series = v.series || [{
    name: '系列1',
    data: [10]
  }]

  const addCategory = () => {
    onChange({
      categories: [...categories, '分类'],
      series: series.map(serie => {
        return {
          name: serie.name,
          data: [...serie.data, 0]
        }
      })
    })
  }

  const deleteCategory = index => {
    categories.splice(index, 1)
    onChange({
      categories,
      series: series.map(serie => {
        serie.data.splice(index, 1)
        return {
          name: serie.name,
          data: serie.data
        }
      })
    })
  }

  const categoryChange = (ci, evt) => {
    onChange({
      categories: categories.map((c, index) => {
        if (index === ci) {
          return evt.target.textContent
        } else {
          return c
        }
      }),
      series
    })
  }

  const addSerie = () => {
    onChange({
      categories,
      series: [...series, {
        name: '系列',
        data: []
      }]
    })
  }

  const deleteSerie = index => {
    onChange({
      categories,
      series: series.filter((serie, i) => {
        return i !== index
      })
    })
  }

  const seriesValueChange = (ci, si, evt) => {
    onChange({
      categories,
      series: series.map((serie, i) => {
        if (i === si) {
          serie.data[ci] = parseFloat(evt.target.textContent) || 0
          return serie
        } else {
          return serie
        }
      })
    })
  }

  const serieNameChange = (si, evt) => {
    onChange({
      categories,
      series: series.map((serie, index) => {
        if (index === si) {
          return {
            name: evt.target.textContent,
            data: serie.data
          }
        } else {
          return serie
        }
      })
    })
  }

  const pasteOnCategory = (evt, ci) => {
    evt.stopPropagation()
    evt.preventDefault()
    const clipboardData = evt.clipboardData || window.clipboardData
    const pastedData = clipboardData.getData('text/plain')

    const lines = pastedData.split('\r\n')

    for (let i = 0; i < lines.length; i++) {
      const lineDataArray = lines[i].split(/ +|\t|,/).filter(n => n)
      categories[ci + i] = lineDataArray[0]

      for (let v = 1; v < lineDataArray.length; v++) {
        if (series[v - 1]) {
          series[v - 1].data[ci + i] = parseFloat(lineDataArray[v]) || 0
        }
      }
    }

    onChange({
      categories,
      series
    })
  }

  const pasteOnSerie = (evt, ci, si) => {
    evt.stopPropagation()
    evt.preventDefault()
    const clipboardData = evt.clipboardData || window.clipboardData
    const pastedData = clipboardData.getData('text/plain')

    const lines = pastedData.split('\r\n')

    for (let i = 0; i < lines.length; i++) {
      const lineDataArray = lines[i].split(/ +|\t|,/).filter(n => n)

      for (let v = 0; v < lineDataArray.length; v++) {
        if (series[si + v]) {
          series[si + v].data[ci + i] = parseFloat(lineDataArray[v]) || 0
        }
      }
    }

    onChange({
      categories,
      series
    })
  }

  return (
    <>
      <Popover
        trigger='click'
        content={
          <table className='series-table-edit'>
            <tr>
              <th />
              <th>分类</th>
              {series.map((serie, i) => <th key={i} onBlur={(evt) => serieNameChange(i, evt)} contentEditable>{serie.name}</th>)}
              <th className='column-plus' placeholder='增加一个数据系列' onClick={addSerie}>+</th>
            </tr>
            {categories.map((ct, i) =>
              <tr key={i}>
                <td>{i}</td>
                <td contentEditable onBlur={(evt) => categoryChange(i, evt)} onPaste={evt => pasteOnCategory(evt, i)}>{ct}</td>
                {series.map((serie, k) => <td key={k} contentEditable onBlur={(evt) => seriesValueChange(i, k, evt)} onPaste={evt => pasteOnSerie(evt, i, k)}>{serie.data[i]}</td>)}
                <td className='row-delete' onClick={() => deleteCategory(i)}><IconMinusCircleStroked /></td>
              </tr>)}
            <tr>
              <td className='row-plus' placeholder='增加一个' onClick={addCategory}>+</td>
              <td />
              {series.map((serie, k) => <td key={k} className='column-delete' onClick={() => deleteSerie(k)}><IconMinusCircleStroked /></td>)}
            </tr>
          </table>
      }
      >
        <Button size='small' type='primary'>编辑</Button>
      </Popover>

    </>
  )
}

export default withField(SeriesTableEdit)
