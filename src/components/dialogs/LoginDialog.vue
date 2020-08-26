<template>
  <v-dialog
    v-model="visible"
    @click:outside="resetFormAndCloseDialog()"
    @keydown.esc="resetFormAndCloseDialog()"
    max-width="400px"
  >
    <v-card>
      <v-toolbar
        color="primary"
        class="px-1 mb-4"
        flat dark
      >
        <v-toolbar-title color="white">Login</v-toolbar-title>

        <v-spacer/>

        <v-btn
          @click="resetFormAndCloseDialog()"
          fab outlined x-small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-form
        v-model="loginInputAppearsValid"
        @submit.prevent="submitLogin"
        ref="form"
        class="pa-4 pt-0"
      >
        <v-card-text>
          <v-row class="mb-3">
            <v-text-field
              :rules='[rules.required, rules.emailFormat]'
              v-model="form.email"
              label="E-mail"
              @keydown="loginErrorVisible = false"
            />
          </v-row>

          <v-row>
            <v-text-field
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules='[rules.required]'
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              label="Password"
              @keydown="loginErrorVisible = false"
              @click:append="showPassword = !showPassword"
            />
          </v-row>

          <v-row class="mb-3">
            <v-checkbox
              v-model="form.rememberMe"
              label="Remember me for 30 days"
              />
          </v-row>

          <v-row class="mb-3">
            <v-alert
              v-model="loginErrorVisible"
              transition="fade-transition"
              dense
              text
              type="error"
              class="caption mb-0"
              width="100%"
            >Invalid username or password</v-alert>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-1">
          <v-btn @click="resetFormAndOpenRegister()" color="accent" text>Register</v-btn>

          <v-spacer/>

          <v-btn
            :disabled="!loginInputAppearsValid"
            color="primary"
            type="submit"
            text
          >Login</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LoginDialog',

  props: ['showLoginDialog'],

  data () {
    return {
      loginInputAppearsValid: false,
      showPassword: false,
      loginErrorVisible: false,
      submitClicked: false,

      rules: {
        required: val => !!val || 'Required',
        emailFormat: val => /^\S+@\S+\.\S+$/.test(val) || 'Invalid'
      },

      form: {
        email: '',
        password: '',
        rememberMe: false
      },
    }
  },

  computed: {
    visible: {
      get () {return this.showLoginDialog},
      set (value) {this.$emit('toggleLoginDialog', value)}
    },
  },

  methods: {
    resetFormAndCloseDialog () {
      this.$refs.form.reset()

      this.visible = false
    },

    resetFormAndOpenRegister () {
      this.$refs.form.reset()


      this.visible = false
      this.$emit('toggleRegisterDialog', true)
    },

    submitLogin () {
      if (this.loginInputAppearsValid && !this.submitClicked) {
        this.submitClicked = true

        let postData = {
          'email': this.form.email,
          'password': this.form.password,
          'remember_me': this.form.rememberMe
        }

        this.$store.dispatch("postLogin", postData)
        .then(() => {
          setTimeout(() => this.resetFormAndCloseDialog(), 500)
        })
        .catch(error => {
          if (error.response.status === 401) {
            this.loginErrorVisible = true
          }
        })
        .finally(() => {
          this.submitClicked = false
        })
      }
    }
  }
}
</script>
