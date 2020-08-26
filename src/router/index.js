import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'


Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/AllPosts.vue')
    },
    {
      path: '/post/create',
      name: 'CreatePost',
      component: () => import('../views/CreatePost.vue'),
      meta: {
        requiresEditorOrGreater: true,
      }
    },
    {
      path: '/post/:postId/edit',
      name: 'EditPost',
      props: true,
      component: () => import('../views/EditPost.vue'),
      meta: {
        requiresEditorOrGreater: true,
        requiresPostOwner: true,
      }
    },
    {
      path: '/post/:postId',
      name: 'PostById',
      props: true,
      component: () => import('../views/PostById.vue')
    },
    {
      path: '/tag/:tagId/posts',
      name: 'PostsByTag',
      props: true,
      component: () => import('../views/PostsByTag.vue')
    },
    {
      path: '/401',
      name: 'FourZeroOne',
      component: () => import('../views/FourZeroOne.vue')
    },
    {
      path: '/403',
      name: 'FourZeroThree',
      component: () => import('../views/FourZeroThree.vue')
    },
    {
      path: '/404',
      name: 'FourZeroFour',
      component: () => import('../views/FourZeroFour.vue')
    },
    {
      path: '*',
      name: 'CatchAll',
      required: true,
      component: () => import('../views/FourZeroFour.vue')
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresEditorOrGreater)) {
    let loginData = localStorage.getItem('store') ? JSON.parse(localStorage.getItem('store')) : null

    if (loginData === null || (loginData.role.name != 'editor' && loginData.role.name != 'admin')) {
      !Vue.config.silent ? console.info('ROUTER: requiresEditorOrGreater required and failed') : null

      next({
        name: 'FourZeroThree',
        replace: true
      })
    }

    if (to.matched.some(record => record.meta.requiresPostOwner)) {
      if (store.state.blogPost === null) {
        !Vue.config.silent ? console.info('ROUTER: requiresPostOwner required and failed due to nonexistent store.blogPost') : null

        next({
          name: 'PostById',
          params: {postId: to.params.postId}
        })
      } else if (loginData.userid != store.state.blogPost.author.id) {
        !Vue.config.silent ? console.info('ROUTER: requiresPostOwner required and failed due to wrong author') : null

        next({
          name: 'FourZeroThree',
          replace: true
        })
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
