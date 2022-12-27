export default class ConfigService {
  constructor () {
    const env = window.localStorage.getItem('ridge-env')
    if (env == null) {
      this.env = {
        debug: false,
        debugUrl: 'http://localhost:5191'
      }
      window.localStorage.setItem('ridge-env', JSON.stringify(this.env))
    } else {
      this.env = JSON.parse(env)
    }
  }

  getConfig () {
    return this.env
  }

  updateConfig (update) {
    Object.assign(this.env, update)
    window.localStorage.setItem('ridge-env', JSON.stringify(this.env))
  }
}
