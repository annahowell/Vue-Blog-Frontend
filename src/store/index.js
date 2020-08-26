import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import moment from 'moment'
import router from '@/router'

Vue.use(Vuex)

function setAxiosAuthHeaders (loginData) {
  axios.defaults.headers.authorization = loginData.tokenType + ' ' + loginData.accessToken
}

function tokenExpirationIsValid (expirationDate) {
  return (expirationDate ? moment().isBefore(expirationDate, moment.ISO_8601) : false);
}

axios.interceptors.response.use((response) => {
    return response;
}, function(error) {
  if (error.response.status == 401) {
    if (error.response.config.url !== 'user/login') {
      store.commit('setLogout')
      
      router.replace({name: 'FourZeroOne'})
    }
  } else if (error.response.status == 403) {
    router.replace({name: 'FourZeroThree'})
  } else if (error.response.status == 404) {
    router.replace({name: 'FourZeroFour'})
  } else {
    !Vue.config.silent ? console.error('Got ' + error.response.status + ' when attempting to access ' + axios.defaults.baseURL + error.response.config.url) : null
  }

  return Promise.reject(error);
});


const store = new Vuex.Store({
  state: {
    showConfirmDialog: false,
    showRegisterDialog: false,
    snackbar: {},

    loginData: {
      userid: null,
      displayname: '',
      role: {},
      accessToken: '',
      tokenType: '',
      expiresAt: '',
      isAdmin: false,
    },

    users: null,
    roles: null,
    tags: null,
    blogPosts: null,
    blogPostsByTag: null,
    blogPost: null,
  },

  mutations: {
    initialiseStore(state) {
			if(localStorage.getItem('store')) {
				let storeData = JSON.parse(localStorage.getItem('store'))

        if (tokenExpirationIsValid(storeData.expiresAt)) {
          setAxiosAuthHeaders(storeData)

          state.loginData = storeData
        }
			}
		},

    setLogin (state, loginData) {
      state.loginData.expiresAt = moment(loginData.expires_at, moment.ISO_8601).subtract(60, 'seconds').format()

      if (tokenExpirationIsValid(state.loginData.expiresAt)) {
        state.loginData.userid      = loginData.userid
        state.loginData.displayname = loginData.displayname
        state.loginData.role        = loginData.roles[0] // Handling a single role per user right now
        state.loginData.accessToken = loginData.access_token
        state.loginData.tokenType   = loginData.token_type
        state.loginData.isAdmin     = loginData.roles[0].name === 'admin'

        setAxiosAuthHeaders(state.loginData)

        localStorage.setItem('store', JSON.stringify(state.loginData))
      }
    },

    setLogout (state) {
      console.log('logging out')
      state.loginData.userid      = null
      state.loginData.displayname = ''
      state.loginData.role        = ''
      state.loginData.accessToken = ''
      state.loginData.tokenType   = ''
      state.loginData.expiresAt   = ''
      state.loginData.isAdmin     = false

      axios.defaults.headers.Authorization = ''

      localStorage.clear()
    },

    setSnackbar (state, snackbar) {
      state.snackbar = snackbar
    },

    setUsers (state, users) {
      state.users = users
    },

    updateUser (state, data) {
      if (state.loginData.isAdmin) {
        for (const [key, value] of Object.entries(this.state.users)) {
          if (value.id == data.user.id) {
            this.state.users[key].displayname = data.user.displayname
            this.state.users[key].enabled     = data.user.enabled
            this.state.users[key].roles       = data.user.roles
          }
        }
      }

      if (data.displaynameChanged) {
        state.loginData.displayname = data.user.displayname

        localStorage.clear()
        localStorage.setItem('store', JSON.stringify(state.loginData))
      }
    },

    setRoles (state, roles) {
      state.roles = roles
    },

    setTags (state, tags) {
      state.tags = tags
    },

    setBlogPosts (state, blogPosts) {
      state.blogPosts = blogPosts
    },

    setBlogPostsByTag (state, blogPosts) {
      state.blogPostsByTag = blogPosts
    },

    setBlogPost (state, blogPost) {
      state.blogPost = blogPost
    },

    deleteComment(state, commentId) {
      for (const [key, value] of Object.entries(this.state.blogPost.comments)) {
        if (value.id == commentId) {
          this.state.blogPost.comments.splice(key, 1)
        }
      }
    },

    deleteTag(state, tagId) {
      for (const [key, value] of Object.entries(this.state.tags)) {
        if (value.id == tagId) {
          state.tags.splice(key, 1)
        }
      }
    }
  },

  actions: {
    async postSignup ({commit}, postData) {
      return axios
        .post('user', postData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Account created successfully'})

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async postLogin ({commit}, postData) {
      return axios
        .post('user/login', postData)
        .then(response => {
          commit('setLogin', response.data, true)
          commit('setSnackbar', {show: true, color: 'success', message: 'Successfully logged in'})

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async postPost ({commit}, {vm, postData}) {
      return axios
        .post('posts', postData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Post created successfully'})

          // Set all stored posts to null so they're refreshed from the API when needed
          commit('setBlogPosts', null)
          commit('setBlogPostsByTag', null)
          commit('setBlogPost', null)

          vm.$safeRouterPush({ name: 'PostById', params: { postId: response.data.id } })
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async postComment ({commit, dispatch}, postData) {
      return axios
        .post('comments', postData)
        .then(() => {
          dispatch('getSingleBlogPost', postData.post_id)
          .then(response => {
            commit('setSnackbar', {show: true, color: 'success', message: 'Comment added successfully'})

            return response
          })
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async postTag ({commit, dispatch}, postData) {
      return axios
        .post('tags', postData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Tag created successfully'})

          dispatch('getAllTags')

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // =========================================================================

    async putUser ({commit}, {userId, putData}) {
      return axios
        .put('user/' + userId, putData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Account updated successfully'})

          if (store.state.loginData.displayname != putData.displayname) {
            // Users updating their displayname should be infrequent, so we'll
            // invalidate the blog data and let the relevant pages get the data
            // again with the updated displayname when they're next visited
            commit('setBlogPosts', null)
            commit('setBlogPostsByTag', null)
            commit('setBlogPost', null)

            commit('updateUser', {user: response.data, displaynameChanged: true})
          } else {
            commit('updateUser', {user: response.data, displaynameChanged: false})
          }

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async putPost ({commit, dispatch}, {vm, postId, putData}) {
      return axios
        .put('posts/' + postId, putData)
        .then(() => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Post updated successfully'})

          // Set all stored posts to null so they're refreshed from the API when needed
          commit('setBlogPosts', null)
          commit('setBlogPostsByTag', null)

          dispatch('getSingleBlogPost', postId)
          .then(response => {
            vm.$safeRouterPush({ name: 'PostById', params: { postId: response.data.id } })
          })
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async putComment ({commit}, {commentId, putData}) {
      return axios
        .put('comments/' + commentId, putData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Comment updated successfully'})

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // -------------------------------------------------------------------------

    async putTag ({commit, dispatch}, {tagId, putData}) {
      return axios
        .put('tags/' + tagId, putData)
        .then(response => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Tag updated successfully'})

          dispatch('getAllTags')

          return response
        })
        .catch(error => {
          throw error
        })
    },

    // =========================================================================

    // There's no delete for user; user is put with enabled: false

    async deletePost ({commit}, postId) {
      return axios
        .delete('posts/' + postId)
        .then(() => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Post deleted successfully'})

          // Set all stored posts to null so they're refreshed from the API when needed
          commit('setBlogPosts', null)
          commit('setBlogPostsByTag', null)
          commit('setBlogPost', null)

          router.replace({name: 'Home'})
        })
        .catch(() => {
          commit('setSnackbar', {show: true, color: 'error', message: 'Error deleting post'})
        })
    },

    // -------------------------------------------------------------------------

    async deleteComment ({commit}, commentId) {
      return axios
        .delete('comments/' + commentId)
        .then(() => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Comment deleted successfully'})

          // We can live with slightly outdated comment_counts but we will update
          // the comments in state.blogPost
          commit('deleteComment', commentId)
        })
        .catch(() => {
          commit('setSnackbar', {show: true, color: 'error', message: 'Error deleting comment'})
        })
    },

    // -------------------------------------------------------------------------

    async deleteTag ({commit, dispatch}, tagId) {
      return axios
        .delete('tags/' + tagId)
        .then(() => {
          commit('setSnackbar', {show: true, color: 'success', message: 'Tag deleted successfully'})

          // Prune the deleted tag from the store, set blogPosts and blogPostsByTag
          // to null so they're refreshed from the API when needed and refresh the current
          commit('deleteTag', tagId)
          commit('setBlogPosts', null)
          commit('setBlogPostsByTag', null)

          if (this.state.blogPost !== null) {
            dispatch('getSingleBlogPost', this.state.blogPost.id)
          }
        })
        .catch(() => {
          commit('setSnackbar', {show: true, color: 'error', message: 'Error deleting tag'})
        })
    },

    // =========================================================================

    async getLogout ({commit}) {
      return axios
        .get('user/logout')
        .then(response => {
          commit('setLogout')
          commit('setSnackbar', {show: true, color: 'success', message: 'Successfully logged out'})

          return response
        })
        .catch(() => {
          commit('setSnackbar', {show: true, color: 'error', message: 'Error logging out'})
        })
    },

    // -------------------------------------------------------------------------

    async getAllUsers ({commit}) {
      return axios
        .get('user')
        .then(response => {
          commit('setUsers', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },

    // -------------------------------------------------------------------------

    async getAllRoles ({commit}) {
      return axios
        .get('user/roles')
        .then(response => {
          commit('setRoles', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },

    // -------------------------------------------------------------------------

    async getAllBlogPosts ({commit}) {
      return axios
        .get('posts')
        .then(response => {
          commit('setBlogPosts', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },

    // -------------------------------------------------------------------------

    async getSingleBlogPost ({commit}, postId) {
      return axios
        .get('posts/' + postId + '/comments')
        .then(response => {
          commit('setBlogPost', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },

    // -------------------------------------------------------------------------

    async getAllTags ({commit}) {
      return axios
        .get('tags')
        .then(response => {
          commit('setTags', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },

    // -------------------------------------------------------------------------

    async getPostsByTag ({commit}, tagId) {
      return axios
        .get('tags/' + tagId + '/posts')
        .then(response => {
          commit('setBlogPostsByTag', response.data)

          return response
        })
        .catch(() => {
          // axios.interceptors handles this
        })
    },
  },
  getters: {
    loginData: (state) => {
      return state.loginData
    }
  },
  modules: {
  }
})

axios.defaults.baseURL = 'http://localhost:8000/api/v1/'
axios.defaults.withCredentials = false,
axios.defaults.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

export default store
