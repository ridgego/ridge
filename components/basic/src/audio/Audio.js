export default class Audio {
  constructor (props) {
    this.props = props
  }

  mount (el) {
    this.el = el
    this.audio = document.createElement('audio')

    this.audioDiv = document.createElement('div')

    this.audioDiv.style.width = '100%'
    this.audioDiv.style.height = '100%'
    this.audioDiv.style.fontSize = '22px'
    this.audioDiv.style.display = 'flex'
    this.audioDiv.style.justifyContent = 'center'
    this.audioDiv.style.alignItems = 'center'
    this.audioDiv.style.color = '#999'
    this.audioDiv.style.border = '1px solid #ccc'

    this.audioDiv.className = 'bi bi-volume-up'

    this.el.append(this.audio)
    this.el.append(this.audioDiv)
    this.render()
  }

  render () {
    const { autoPlay, src, playing, onLoaded, onTimeUpdated, currentTime, __mode } = this.props
    this.audio.className = 'ridge-audio'
    this.audio.preload = 'auto'
    this.audio.autoPlay = autoPlay

    this.audio.src = src

    if (src) {
      this.audio.addEventListener('loadeddata', () => {
        onLoaded({
          duration: this.audio.duration
        })
        // duration 变量现在存放音频的播放时长（单位秒）
      })

      this.audio.addEventListener('timeupdate', (event) => {
        onTimeUpdated && onTimeUpdated({
          currentTime: this.audio.currentTime
        })
      })
    }

    if (currentTime) {
      this.audio.currentTime = currentTime
      console.log('currentTime', currentTime)
      onTimeUpdated && onTimeUpdated({
        currentTime
      })
    }
    if (playing && src && __mode !== 'edit') {
      this.audio.play()
    } else {
      this.audio.pause()
    }
  }

  setCurrentTime (time) {
    this.audio.currentTime = time
  }

  update (props) {
    this.props = props
    this.render()
  }
}
