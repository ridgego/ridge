
let i18nProps = {};
// 如果i18n: '+name$,+version$,+time$', 这样的 
// 存为   "aboutComponentMess.+name$",
//       "aboutComponentMess.+version$",
//       "aboutComponentMess.+time$"
module.exports = function ({ types: t }) {
  return {
    visitor: {
      ObjectProperty(path, source) {
        if (path.node.key.name === 'i18n' && path.inList) {
          const nameNode = path.container.find(t => t.key.name === 'name');
          const i18nValue = path.node.value.value || path.node.value.elements;
          const filename = 'build/' + source.filename.match(/src\\(.*)/)[1].replace('\\', '-');
          // console.log('i18n', nameNode.value.value, path.node.value);
          if (Array.isArray(i18nValue)) {
            i18nValue.forEach((node) => {
              if (i18nProps[filename]) {
                i18nProps[filename].push(`${nameNode.value.value}.${node.value}`);
              } else {
                i18nProps[filename] = [`${nameNode.value.value}.${node.value}`];
              }
            })
          } else {
            const i18nValueStr = typeof i18nValue === 'boolean' ? '' : `.${i18nValue}`;
            if (i18nProps[filename]) {
              i18nProps[filename].push(`${nameNode.value.value}${i18nValueStr}`);
            } else {
              i18nProps[filename] = [`${nameNode.value.value}${i18nValueStr}`];
            }
          }
        }
      }
    }
  }
}

module.exports.GET_I18nProps = i18nProps;