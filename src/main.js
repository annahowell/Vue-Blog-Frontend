import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import moment from 'moment'
import invert from 'invert-color'
import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import 'tiptap-vuetify/dist/main.css'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
Vue.config.silent = false

// -----------------------------------------------------------------------------
Vue.filter('invert', function (value) {
  return invert(value, true) // true amplify to black or white
})

Vue.filter('friendlyDateTime', function (value) {
  return moment(value).format('MMMM Do, YYYY')
})

Vue.filter('abs', function (value) {
  return Math.abs(value)
})

Vue.filter('stripHtmlMarkup', function (value) {
  let div = document.createElement('div')
  div.innerHTML = value

  return div.textContent || div.innerText || ''
})


// -----------------------------------------------------------------------------
Vue.prototype.$scrollToTop = function() {
  window.scrollTo(0,0)
}

Vue.prototype.$safeRouterPush = function(data) {
  //console.log('Received request for ' + data.name + 'with: ' + JSON.stringify(data.params))
  //console.log('Current this.$route.params are: ' + JSON.stringify(this.$route.params))

  if (this.$route && this.$route.name !== data.name || (data.params && JSON.stringify(this.$route.params) != JSON.stringify(data.params))) {
    this.$router.push(data)
  } else {
    console.info('Router push ignored for ' + data.name + ' with params: ' + JSON.stringify(data.params))
  }
}


// -----------------------------------------------------------------------------
Vue.use(vuetify)

Vue.use(TiptapVuetifyPlugin, {
  vuetify,
  iconsGroup: 'mdiSvg'
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
