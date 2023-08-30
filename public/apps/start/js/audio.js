window.audio = {
  state: () => {
    return {
      currentTime: 0,
      currentTimeSet: 0,
      audioDuration: 0
    }
  },
  getters: {
    formatTotalMin: (state) => {
      return Math.floor(state.audioDuration / 60) + ":" + Math.floor(state.audioDuration % 60)
    },
    formatCurrentMin: (state) => {
      const sec = Math.floor(state.currentTime % 60)
      return Math.floor(state.currentTime / 60) + ":" + ((sec < 10) ? ("0" + sec) : sec)
    },
    playPercent: (state) => {
      return 100 * state.currentTime / state.audioDuration
    }
  },
  actions: {
    setCurrentTime({ currentTime }) {
       this.currentTime = currentTime
    },
    setAudioDuration({ duration }) {
      this.audioDuration = duration
    },
    setNewCurrentTime(percent) {
      this.currentTimeSet = percent / 100 * this.audioDuration
    }
  },
  alias: {
    setAudioDuration: "设置音频时长",
    setCurrentTime: "设置播放进度",
    setNewCurrentTime: "拖拽新的进度",
    currentTimeSet: "拖拽进度",
    currentTime: "播放进度",
    playPercent: "播放百分比",
    audioDuration: "音频时长"
  }
}