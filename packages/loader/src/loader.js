/**
 * 脚本加载器
 * @class
 */
class ScriptLoader {
   /**
   * 构造器
   * @param {object} externalOptions 第三方依赖定义信息，这个配置会覆盖 wind-pack-externals 中webpackExternals 定义
   */
  constructor () {
    const usp = new URLSearchParams(location.search)

    this.baseUrl = usp.get('npm') || localStorage.npm || 'https://cdn.jsdelivr.net/npm'
  }

  loadScript(path) {
    const script = document.createElement('script')

    script.src = this.baseUrl + '/' + path

    script.onerror = e => {
      
    }
    document.head.append(script)
  }
 
}

window.scriptLoader = new ScriptLoader()
export default Loader
