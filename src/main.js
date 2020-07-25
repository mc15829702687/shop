import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import ElementUI from 'element-ui'
import VueQuillEditor from 'vue-quill-editor'


import 'element-ui/lib/theme-chalk/index.css'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

// 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

// 格式化日期
Vue.filter('dateFormat', (val) => {
  const dt = new Date(val)

  const year = dt.getFullYear()
  const month = dt.getMonth() + 1
  const days = dt.getDate()
  
  const hour = dt.getHours()
  const minutes = dt.getMinutes()
  const seconds = dt.getSeconds();

  return `${year}-${String(month).padStart(2, '0')}-${String(days).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

Vue.use(ElementUI)
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
