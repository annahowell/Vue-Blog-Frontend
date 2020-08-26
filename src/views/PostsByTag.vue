<template>
  <v-container>
    <div v-if="loaded">
      <v-row>
        <h4 class="display-1 mb-9">Posts tagged with <span class="font-italic">{{blogPostsByTag.title}}</span></h4>
      </v-row>

      <v-row v-for="blogPost in blogPostsByTag.posts" :key="blogPost.id">
        <single-post :blogPost="blogPost" width="100%"/>
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
      <v-skeleton-loader class="mt-2 mb-12" type="heading"/>

      <v-skeleton-loader
        v-for="index in 3"
        :key="index"
        class="mt-2 mb-16"
        max-height="200px"
        type="image"
      />
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import SinglePost from '@/components/SinglePost'

export default {
  name: 'App',

  props: ['tagId'],

  components: {
    SinglePost,
  },

  created () {
    if (this.blogPostsByTag === null || this.blogPostsByTag.id != this.tagId) {
      this.$store.dispatch("getPostsByTag", this.tagId)
    }
  },

  computed: {
    loaded () {
       return this.blogPostsByTag !== null && this.blogPostsByTag.length != 0 && this.blogPostsByTag.id == this.tagId
    },

    loadedNoPosts () {
       return this.blogPostsByTag !== null && this.blogPostsByTag.length === 0 && this.blogPostsByTag.id == this.tagId
    },

    ...mapState([
      'blogPostsByTag',
    ])
  },

  watch: {
    tagId () {
      this.$store.dispatch("getPostsByTag", this.tagId)
    },
    blogPostsByTag () {
      if (this.blogPostsByTag === null) {
        this.$store.dispatch("getPostsByTag", this.tagId)
      }
    }
  }
}
</script>
