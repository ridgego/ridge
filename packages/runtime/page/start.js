import Ridge from '../src/Ridge'

function start () {
  const ridge = new Ridge()
  ridge.mountPage(document.querySelector('#app'), 'start', 'abc.json')
}

start()
