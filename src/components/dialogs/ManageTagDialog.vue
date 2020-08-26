<template>
  <v-dialog
    v-model="visible"
    @click:outside="resetFormAndCloseDialog()"
    @keydown:esc="resetFormAndCloseDialog()"
    max-width="340px"
  >
    <v-card>
      <v-toolbar
        color="primary"
        class="px-1 mb-2"
        dark flat
      >
        <v-toolbar-title color="white">Manage tags</v-toolbar-title>

        <v-spacer/>

        <v-btn
          @click="resetFormAndCloseDialog()"
          fab outlined x-small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-form
        v-model="manageTagAppearsValid"
        @submit.prevent="creatingNew ? submitNewTag() : submitExistingTag()"
        ref="form"
        class="pa-4 pt-0"
      >
        <v-card-text class="pb-0">
          <v-row class="mb-5">
            <v-select
              v-model="form.tag"
              :items="tags"
              :placeholder="creatingNew ? 'Create new' : ' '"
              :menu-props="{closeOnContentClick: true}"
              label="Select"
              item-text="title"
              item-value="id"
            >
              <template v-slot:prepend-item>
                <v-list-item ripple @click="form.tag = null">
                  <v-list-item-content>Create new</v-list-item-content>
                </v-list-item>
                <v-divider class="mt-2"/>
              </template>
            </v-select>
          </v-row>

          <v-row class="mb-5">
            <v-text-field
              v-model="form.title"
              :rules='[rules.required, rules.min2, rules.max32]'
              @keydown="tagErrorVisible = false"
              label="Title"
              placeholder=" "
            />
          </v-row>

          <v-row>
            <div class="v-messages theme--light mb-1">Color</div>

            <v-color-picker
              v-model="form.color"
              mode="hexa"
              canvas-height="100px"
              hide-mode-switch
            />
          </v-row>

          <v-row class="mb-5" v-if="tagErrorVisible">
            <v-alert
              transition="fade-transition"
              type="error"
              class="caption mb-0"
              width="100%"
              dense text
            >Unable to manage tag</v-alert>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-1 py-0">
          <v-btn
            v-if="!creatingNew"
            @click="deleteTag()"
            color="warning"
            text
          >Delete</v-btn>

          <v-spacer/>

          <v-btn
            :disabled="!manageTagAppearsValid"
            color="primary"
            type="submit"
            text
          >{{this.creatingNew ? 'Create' : 'Update'}}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ManageTagDialog',

  props: ['showManageTagDialog'],

  data () {
    return {
      creatingNew: true,
      manageTagAppearsValid: false,
      tagErrorVisible: false,
      submitClicked: false,

      rules: {
        required: val => !!val || 'Required',
        min2: val => val.length > 1 || 'Minumum of 2 charcters',
        max32: val => val.length < 33 || 'Maximum of 32 characters'
      },

      form: {
        title: '',
        color: '#009688',
        tag: null
      },

      hex: '#009688',
    }
  },

  computed: {
    selectedTag () {
      return this.tags.filter(tag => tag.id == this.form.tag)[0]
    },

    visible: {
      get () {return this.showManageTagDialog},
      set (value) {this.$emit('toggleManageTagDialog', value)}
    },

    ...mapState([
      'loginData',
      'tags'
    ])
  },

  methods: {
    resetFormAndCloseDialog () {
      if (this.form.tag != null) {
        this.$refs.form.reset()
      }

      this.visible = false
    },
    deleteTag () {
      this.$root.$confirm('Confirm', 'Are you sure wish to delete the \'' + this.form.title + '\' tag? This will remove it from all associated posts.', 'warning')
      .then((confirmed) => {
        if (confirmed) {
          this.$store.dispatch("deleteTag", this.form.tag)
          .then(() => {
            setTimeout(() => this.resetFormAndCloseDialog(), 500)
          })
        }
      })
    },

    submitExistingTag () {
      if (this.manageTagAppearsValid && !this.submitClicked) {
        this.submitClicked = true

        let putData = {
          color: this.form.color
        }

        if (this.form.title != this.selectedTag.title) {
          putData.title = this.form.title
        }

        this.$store.dispatch("putTag", {tagId: this.form.tag, putData: putData})
        .then(() => {
          setTimeout(() => this.resetFormAndCloseDialog(), 500)
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.tagErrorVisible = true
          }
        })
        .finally(() => {
          this.submitClicked = false
        })
      }
    },

    submitNewTag () {
      if (this.manageTagAppearsValid && !this.submitClicked) {
        this.submitClicked = true

        let postData = {
          'title': this.form.title,
          'color': this.form.color
        }

        this.$store.dispatch("postTag", postData)
        .then(() => {
          setTimeout(() => this.resetFormAndCloseDialog(), 500)
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.tagErrorVisible = true
          }
        })
        .finally(() => {
          this.submitClicked = false
        })
      }
    }
  },

  watch: {
    'form.tag' () {
      if (this.form.tag) {
        this.creatingNew = false

        this.form.title = this.selectedTag.title
        this.form.color = this.selectedTag.color

      } else {
        this.creatingNew = true

        this.form.title = ''
        this.form.color = '#009688'
      }
    }
  }
}
</script>
