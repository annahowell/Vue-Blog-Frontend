<template>
  <v-container>
    <div v-if="loaded">
      <v-row>
        <h4 class="display-1 mb-9">All posts</h4>
      </v-row>

      <v-row v-for="blogPost in blogPosts" :key="blogPost.id">
        <single-post :blogPost="blogPost"/>
      </v-row>
    </div>

    <div v-else-if="loadedNoPosts">
      <v-row>
        <h4 class="display-1 mb-9">The blog has no posts</h4>
      </v-row>

      <v-row>
        <v-btn
          v-if="loginData.userid && (loginData.role.name === 'editor' || loginData.isAdmin)"
          @click="$safeRouterPush({name: 'CreatePost'})"
          text
        >Create first post</v-btn>
      </v-row>
    </div>

    <div v-else>
      <v-skeleton-loader
        v-for="index in 3"
        :key="index"
        type="image"
        max-height="200px"
        class="mt-2 mb-16"
      />
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

import SinglePost from '@/components/SinglePost'

export default {
  name: 'App',

  components: {
    SinglePost,
  },

  created () {
    if (this.blogPosts === null || this.blogPosts.author) {
      this.$store.dispatch("getAllBlogPosts")
    }
  },

  computed: {
    loaded () {
      return this.blogPosts !== null && this.blogPosts.length !== 0
    },

    loadedNoPosts () {
      return this.blogPosts !== null && this.blogPosts.length === 0
    },

    ...mapState([
      'loginData',
      'blogPosts',
    ])
  },

  watch: {
    blogPosts () {
      if (this.blogPosts === null) {
        this.$store.dispatch("getAllBlogPosts")
      }
    }
  }
}
</script>
