<template>
  <v-card width="100%" flat>
    <v-card-title class="pt-0 subtitle-1">
      By {{comment.author.displayname}}

      <div class="ml-auto subtitle-1 text--secondary">
        <v-btn
          v-if="loginData.userid == comment.author.id && !commentEditVisible"
          @click="commentEditVisible = !commentEditVisible"
          color="primary"
          small text
        >Edit</v-btn>

        <v-btn
          v-if="loginData.isAdmin || loginData.userid == comment.author.id"
          @click="deleteComment()"
          color="primary"
          small text
        >Delete</v-btn>

        {{comment.created_at | friendlyDateTime}}
      </div>
    </v-card-title>

    <v-card-text v-if="!commentEditVisible" v-html="comment.body" class="pb-0"/>

    <v-slide-y-transition hide-on-leave>
      <v-card-actions v-if="commentEditVisible" class="px-3">
        <v-form  class="pa-0" ref="form" style="width:100%" @submit.prevent="editComment">
          <v-card-text class="pt-1 pb-0 py-2">
            <v-row class="mb-2">
              <tiptap-vuetify
                v-model="form.comment"
                :disabled="!loginData.userid"
                :extensions="extensions"
                :card-props="{ outlined: true, color: 'grey lighten-5' }"
                :toolbar-attributes="{ color: 'grey lighten-4' }"
                style="width:100%"
                placeholder="Amend your comment..."
              />
            </v-row>

            <v-row class="mt-4 mb-2">
              <v-alert
                v-model="commentEditErrorVisible"
                transition="fade-transition"
                type="error"
                class="caption mb-0"
                width="100%"
                dense text
              >Error updating comment</v-alert>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-1">
            <span v-if="charsRemaining >= 0" class="body-2">{{charsRemaining}} characters remaining</span>
            <span v-else class="error--text body-2">{{charsRemaining | abs}} too many characters</span>

            <v-spacer/>

            <v-btn small :disabled="!loginData.userid" text @click="resetEditComment()">
              Cancel
            </v-btn>

            <v-btn
              :disabled="!loginData.userid || form.comment == comment.body || form.comment == '<p></p>' || charsRemaining < 0"
              type="submit"
              color="primary"
              class="ml-3"
              small text
            >Update</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-actions>
    </v-slide-y-transition>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { TiptapVuetify } from 'tiptap-vuetify'

export default {
  name: 'SingleComment',

  props: ['comment', 'extensions'],

  components: {
    TiptapVuetify,
  },

  data () {
    return {
      commentEditVisible: false,
      commentEditErrorVisible: false,

      form: {
        comment: this.comment.body
      }
    }
  },

  computed: {
    charsRemaining () {
      return 1000 - this.$options.filters.stripHtmlMarkup(this.form.comment).length
    },

    ...mapState([
      'loginData',
    ])
  },

  methods: {
    deleteComment () {
      this.$root.$confirm('Delete', 'Are you sure you want to delete this comment?', 'warning')
      .then((confirmed) => {
        if (confirmed) {
          this.resetEditComment()

          this.$store.dispatch("deleteComment", this.comment.id)
        }
      })
    },

    editComment () {
      if (this.form.comment != this.comment.body) {
        let putData = {
          'body': this.form.comment,
        }

        this.$store.dispatch("putComment", {commentId: this.comment.id, putData: putData})
        .then(response => {
          this.comment.body = response.data.body

          this.resetEditComment()
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.commentEditErrorVisible = true
          }
        })
      }
    },

    resetEditComment() {
      this.commentEditVisible = false
      this.commentEditErrorVisible = false
      this.form.comment = this.comment.body
    }
  }
}
</script>
