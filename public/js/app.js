/* global io: falss, Vue: false */
const socket = io.connect()
const channel = location.hash.slice(1)
let guild

const messages = {
  UNAUTHORIZED: 'ログインしてください',
  INVAILD_CHANNEL: 'チャンネルが正しくありません',
  INVAILD_CHANNEL_TYPE: 'ボイスチャンネルを指定してください',
  CHANNEL_IS_FULL: 'ボイスチャンネルが満員です',
  MISSING_PERMISSION: 'ボイスチャンネルに参加できません',
  USER_NOT_JOINED: 'ボイスチャンネルに参加してください',
  ALREADY_JOINED: 'すでに参加しています',
  UNTREATED_CHANNEL: 'チャンネルが読み込まれていません',
  INVAILD_TYPE: 'タイプが正しくありません',
}

const app = new Vue({
  el: '#app',
  data: {
    name: 'WebMusicController',
    loading: false,
    query: '',
    type: 'api',
    result: [],
    list: [],
    volume: 100,
    error: '',
    repeat: false,
  },
  directives: {
    focus: {
      inserted: el => el.focus(),
    },
  },
  components: {
    movie: {
      props: ['item', 'result', 'index'],
      methods: {
        add() {
          const data = {
            url: this.item.url,
            thumbnail: this.item.thumbnail,
            title: this.item.title,
            type: this.item.type,
            guild,
          }
          console.log('socket', 'emit', 'add', data)
          socket.emit('add', data)
        },
        remove() {
          const data = { index: this.index, id: guild }
          console.log('socket', 'emit', 'remove', data)
          socket.emit('remove', data)
        },
        open() {
          window.open(this.item.url, '_blank')
        },
        handle(e) {
          if (e.ctrlKey) this.open()
          else this.add()
        },
      },
      template: `
        <li class="movie" @click="handle($event)" v-if="result === ''">
          <img :src="item.thumbnail" :alt="item.title">
          <div class="title">{{item.title}}</div>
        </li>
        <li class="movie" @click="handle($event)" v-else>
          <img :src="item.thumbnail" :alt="item.title">
          <div class="title">{{item.title}}</div>
          <div id="remove" @click="remove">X</div>
        </li>
      `,
    },
  },
  methods: {
    search() {
      const data = { q: this.query, type: this.type }
      console.log('socket', 'emit', 'q', data)
      socket.emit('q', data)
    },
    setVolume() {
      const data = { volume: this.volume, id: guild }
      // console.log('socket', 'emit', 'volume', data)
      socket.emit('volume', data)
    },
    skip() {
      console.log('socket', 'emit', 'skip', guild)
      socket.emit('skip', guild)
    },
    setRepeat() {
      const data = { repeat: this.repeat, id: guild }
      console.log('socket', 'emit', 'repeat', data)
      socket.emit('repeat', data)
    },
    showError(id) {
      this.error = `${messages[id] || messages.UNKNOWN_ERROR} (${id})`
    },
    warning() {
      if (this.type !== 'ytdl') return
      alert([
        'この機能は現在試験的に実装されているものです',
        '検索、再生ともに時間がかかります',
        'また処理開始時は負荷が高まる場合があり',
        '音楽の再生が止まる可能性があるので',
        '結果、またはエラーが帰ってくるまで',
        '同じ操作を行わないでください',
      ].join('\n'))
    },
  },
})

socket.on('connect', () => {
  console.log('socket', 'connect')
  console.log('socket', 'emit', 'init', channel)
  socket.emit('init', channel)
})

socket.on('ready', data => {
  console.log('socket', 'on', 'ready', data)
  app.loading = false
  app.name = data.guild + ' / ' + data.channel
  guild = data.id
})

socket.on('result', data => {
  console.log('socket', 'on', 'result', data)
  app.result = data
})

socket.on('list', data => {
  console.log('socket', 'on', 'list', data)
  app.list = data
})

socket.on('err', error => {
  console.log('socket', 'on', 'err', error)
  console.error(error)
  app.showError(error)
})

socket.on('volume', volume => {
  // console.log('socket', 'on', 'volume', volume)
  app.volume = volume
})

socket.on('repeat', repeat => {
  console.log('socket', 'on', 'repeat', repeat)
  app.repeat = repeat
})
