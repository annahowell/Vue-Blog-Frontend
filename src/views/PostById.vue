<template>
  <v-container>
    <div v-if="loaded">
      <v-row>
        <h4 class="display-1 mb-9">{{blogPost.title}}</h4>
      </v-row>

      <v-row class="text-uppercase font-weight-light mb-8" style="line-height:30px">
        UPDATED {{blogPost.updated_at | friendlyDateTime}}
        <v-icon color="accent" size="8" class="mr-2 ml-2">mdi-circle</v-icon>
        BY {{blogPost.author.displayname}}
        <v-icon color="accent" size="8" class="mr-2 ml-2">mdi-circle</v-icon>
        {{blogPost.comments.length}} COMMENTS

        <v-spacer/>

        <div v-if="true">
          <v-btn
            v-if="loginData.userid == blogPost.author.id"
            @click="$safeRouterPush({name: 'EditPost', params: {postId: blogPost.id.toString()}})"
            color="primary"
            small text
          >Edit</v-btn>

          <v-btn
            v-if="loginData.userid == blogPost.author.id || loginData.isAdmin"
            @click="deletePost()"
            color="primary"
            small text
          >Delete</v-btn>
        </div>
      </v-row>

      <v-row>
        <p v-html="blogPost.body"/>
      </v-row>

      <v-row class="mb-16">
        <v-chip
          v-for="tag in blogPost.tags"
          :key="tag.id"
          :color="tag.color"
          :text-color="tag.color | invert"
          @click="$safeRouterPush({name: 'PostsByTag', params: {tagId: tag.id.toString()}})"
          style="border: 1px solid #EAEAEA"
          class="mr-2 text-capitalize"
          small
        >{{tag.title}}</v-chip>
      </v-row>

      <v-row class="mb-16" justify="center">
        <v-card v-if="loginData.userid" flat width="100%">

          <v-form class="pa-0 pt-0" ref="form" @submit.prevent="submitComment">
            <v-card-text class="pt-0 pb-0 py-2">
              <v-row class="mb-4 mx-n4">
                <tiptap-vuetify
                  v-model="form.comment"
                  :extensions="extensions"
                  :card-props="{ outlined: true, color: 'grey lighten-5' }"
                  :toolbar-attributes="{ color: 'grey lighten-4' }"
                  rows="10"
                  style="width:100%"
                  placeholder="Add a comment..."
                  outlined
                />
              </v-row>

              <v-row class="mb-3 mx-n4">
                <v-alert
                  v-model="commentErrorVisible"
                  transition="fade-transition"
                  type="error"
                  class="caption mb-0"
                  width="100%"
                  dense text
                >Error adding comment</v-alert>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-0 pl-2">
              <span v-if="charsRemaining >= 0" class="body-2">{{charsRemaining}} characters remaining</span>
              <span v-else class="error--text body-2">{{charsRemaining | abs}} too many characters</span>

              <v-spacer/>

              <v-btn text @click="resetAddComment()">
                Cancel
              </v-btn>

              <v-btn
                :disabled="form.comment == '<p></p>' || charsRemaining < 0"
                type="submit"
                color="primary"
                text
              >Comment</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>

        <v-btn
          v-else
          @click="$store.commit('toggleLoginDialog')"
          color="primary"
          class="mt-5"
          text
        >Login to comment</v-btn>
      </v-row>

      <v-row>
        <h5 class="headline mb-10 px-4">{{blogPost.title}} has {{blogPost.comments.length}} comments:</h5>
      </v-row>

      <v-row v-for="(comment, index) in blogPost.comments" :key="index">
        <single-comment :comment="comment" :index="index" :extensions="extensions"/>

        <v-divider
          v-if="index != blogPost.comments.length - 1"
          :style="{borderBottom: '2px solid ' + $vuetify.theme.themes.light.accentLight}"
          class="mx-8 mt-8 mb-10"
        />
      </v-row>
    </div>

    <div v-else>
      <v-skeleton-loader type="heading" class="mt-2 mb-12"/>

      <v-skeleton-loader type="text" class="mb-10" max-width="70%"/>

      <v-skeleton-loader type="text@5, paragraph" class="mb-14"/>

      <v-skeleton-loader type="image" max-height="120px" class="mb-2"/>
    </div>
  </v-container>
</template>


<script>
import { mapState } from 'vuex'
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, History } from 'tiptap-vuetify'
import SingleComment from '@/components/SingleComment'

export default {
  name: 'PostById',

  props: ['postId'],

  components: {
    TiptapVuetify,
    SingleComment,
  },

  data () {
    return {
      commentErrorVisible: false,

      form: {
        comment: '<p></p>'
      },

      extensions: [
        History,
        Bold,
        Underline,
        Italic,
        Strike,
        BulletList,
        ListItem,
        OrderedList,
        [Heading, {
          options: {
            levels: [1, 2, 3]
          }
        }],
        Blockquote,
        Code,
        Link,
        Paragraph,
        HardBreak,
      ],

      tiptapCardProps: {
        flat: true,
      }
    }
  },

  created () {
    if (this.blogPost === null || this.blogPost.id !== this.postId) {
      this.$store.dispatch("getSingleBlogPost", this.postId)
    }
  },

  computed: {
    loaded () {
      return this.blogPost !== null && this.blogPost.length != 0 && this.blogPost.id == this.postId
    },

    charsRemaining () {
      return 1000 - this.$options.filters.stripHtmlMarkup(this.form.comment).length
    },

    ...mapState([
      'loginData',
      'blogPost',
    ])
  },

  methods: {
    deletePost () {
      this.$root.$confirm('Confirm', 'Are you sure wish to delete this post and all associated comments?', 'warning')
      .then((confirmed) => {
        if (confirmed) {
          this.$store.dispatch("deletePost", this.postId)
        }
      })
    },

    submitComment () {
      if (this.form.comment != '') {

        let postData = {
          'body': this.form.comment,
          'post_id': this.postId
        }

        this.$store.dispatch("postComment", postData)
        .then(() => {
          this.resetAddComment()
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.commentErrorVisible = true
          }
        })
      }
    },

    resetAddComment() {
      this.commentErrorVisible = false
      this.form.comment = '<p></p>'
    }
  },

  watch: {
    'loginData.userid' () {
      if (!this.loginData.userid) {
        this.resetAddComment()
      }
    },
    blogPost () {
      if (this.blogPost === null) {
        this.$store.dispatch("getSingleBlogPost", this.postId)
      }
    }
  }
}
</script>


<style>
blockquote {
  padding-left: 10px!important;
  border-left: 2px solid lightgrey!important;
}

.tiptap-vuetify-editor__content {
  height: 100%;
}
</style>
