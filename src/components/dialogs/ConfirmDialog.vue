<template>
  <v-dialog
    v-model="show"
    @keydown.esc="cancel"
    max-width="350px"
    style="z-index:999"
  >
    <v-card>
      <v-toolbar
        :color="color"
        dark dense flat
      >
        <v-toolbar-title color="white">{{title}}</v-toolbar-title>
      </v-toolbar>

      <v-card-text v-if="!!text" class="pa-4">{{text}}</v-card-text>

      <v-card-actions>
        <v-spacer/>

        <v-btn @click="cancel" text>Cancel</v-btn>

        <v-btn @click="agree" color="primary" text>{{title}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      showDialog: false,
      resolve: null,
      text: 'null',
      title: 'null',
      color: 'primary'
    }
  },

  computed: {
    show: {
      get() {
        return this.showDialog
      },

      set(value) {
        this.showDialog = value

        if (value === false) {
          this.cancel()
        }
      }
    }
  },

  methods: {
    open(title, text, color) {
      this.showDialog = true
      this.title = title
      this.text = text
      this.color = color

      return new Promise((resolve) => {
        this.resolve = resolve
      })
    },

    agree() {
      this.showDialog = false
      this.resolve(true)
    },

    cancel() {
      this.showDialog = false
      this.resolve(false)
    }
  }
}
</script>
