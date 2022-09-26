
const path = require('path');
const fs = require('fs');
const ACNELoader = require('./acne-loader.js');
const I18nBabelPlugin = require('./i18n-babel-plugin.js');
class MyPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'CCVPlugin',
      (compilation, callback) => {
        const fullpath = process.cwd();
        if (!/standard-table/.test(fullpath)) {
          const pkgPath = path.join(fullpath, '/package.json');
          let pkg = fs.readFileSync(pkgPath);
          pkg = JSON.parse(pkg);
          pkg.ccv = {
            list: Array.from(new Set(ACNELoader.GET_CCVList))
          };
          pkg.i18nProps = I18nBabelPlugin.GET_I18nProps;
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        }
        callback();
      }
    )
  }
}
module.exports = MyPlugin;