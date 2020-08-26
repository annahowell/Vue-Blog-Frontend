<template>
  <v-dialog
    v-model="visible"
    @click:outside="resetFormAndCloseDialog()"
    @keydown:esc="resetFormAndCloseDialog()"
    max-width="400px"
  >
    <v-card>
      <v-toolbar
        color="primary"
        class="px-1 mb-4"
        flat dark
      >
        <v-toolbar-title  color="white">Register</v-toolbar-title>

        <v-spacer/>

        <v-btn
          @click="resetFormAndCloseDialog()"
          fab outlined x-small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <ValidationObserver ref="observer" v-slot="{ invalid }">
        <v-form class="pa-4 pt-0" ref="form" @submit.prevent="submitRegistration">
          <v-card-text>
            <ValidationProvider v-slot="{ errors }" name="displayName" rules="required|min:2">
              <v-row class="mb-3">
                <v-text-field
                  v-model="form.displayname"
                  :error-messages="errors"
                  label="Display name"
                  required
                />
              </v-row>
            </ValidationProvider>

            <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
              <v-row class="mb-3">
                <v-text-field
                  v-model="form.email"
                  :error-messages="errors"
                  label="E-mail"
                  required
                />
              </v-row>
            </ValidationProvider>

            <ValidationObserver>
              <ValidationProvider v-slot="{ errors }" name="password" rules="required|min:10|oneLowercase|oneUppercase|oneNumber|oneSpecial">
                <v-row class="mb-3">
                  <v-text-field
                    v-model="form.password"
                    @click:append="showPassword = !showPassword"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    :error-messages="errors[0]"
                    label="Password"
                    required
                  />
                </v-row>
              </ValidationProvider>

              <ValidationProvider v-slot="{ errors }" name="passConfirmation" rules="required|passwordConfirmation:@password">
                <v-row class="mb-4">
                  <v-text-field
                    v-model="form.passwordConfirmation"
                    @click:append="showPasswordConfirmation = !showPasswordConfirmation"
                    :append-icon="showPasswordConfirmation ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPasswordConfirmation ? 'text' : 'password'"
                    :error-messages="errors[0]"
                    label="Password confirmation"
                    required
                  />
                </v-row>
              </ValidationProvider>
            </ValidationObserver>

            <v-row class="mb-3">
              <v-alert
                v-model="signupErrorVisible"
                transition="fade-transition"
                class="caption mb-0"
                width="100%"
                type="error"
                dense text
              >{{signupErrorMessage}}</v-alert>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-1">
            <v-btn @click="resetFormAndOpenLogin()" color="accent" text>Login</v-btn>

            <v-spacer/>

            <v-btn
              :disabled="invalid"
              color="primary"
              type="submit"
              text
            >Register</v-btn>
          </v-card-actions>
        </v-form>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>

<script>
import { required, email, min } from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'

setInteractionMode('aggressive')

extend('required', {
  ...required,
  message: 'Required',
})

extend('min', {
  ...min,
  message: 'Must have {length} or more characters',
})

extend('email', {
  ...email,
  message: 'Invalid',
})

// Splitting these up for better user feedback / readability
extend('oneLowercase', {
  validate: value => value.match(/[a-z]/g) !== null,
  message: 'Requires one lowercase character'
})

extend('oneUppercase', {
  validate: value => value.match(/[A-Z]/g) !== null,
  message: 'Requires one uppercase character'
})

extend('oneNumber', {
  validate: value => value.match(/[0-9]/g) !== null,
  message: 'Requires one number'
})

extend('oneSpecial', {
  validate: value => value.match(/[*.!@#$%^&(){}[\]:;<>,.?/~_+\-=\\|]/g) !== null,
  message: 'Requires one special *.!@#$%^&(){}[]:;<>,.?/~_+-=\\| special character'
})

extend('passwordConfirmation', {
  params: ['target'],
  validate(value, { target }) {
    return value === target
  },
  message: 'Password confirmation does not match'
})

export default {
  name: 'RegisterDialog',

  props: ['showRegisterDialog'],

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  data () {
    return {
      showPassword: false,
      showPasswordConfirmation: false,
      signupErrorMessage: '',
      signupErrorVisible: false,
      submitClicked: false,

      form: {
        displayname: '',
        email: '',
        password: '',
        passwordConfirmation: ''
      },
    }
  },

  computed: {
    visible: {
      get () {return this.showRegisterDialog},
      set (value) {this.$emit('toggleRegisterDialog', value)}
    },
  },

  methods: {
    resetFormAndCloseDialog () {
      this.$refs.form.reset()
      this.$refs.observer.reset()
      this.signupErrorMessage = ''
      this.signupErrorVisible = false

      this.visible = false
    },

    resetFormAndOpenLogin () {
      this.$refs.form.reset()
      this.$refs.observer.reset()

      this.visible = false

      this.$emit('toggleLoginDialog', true)
    },

    submitRegistration () {
      if (this.$refs.observer.flags.valid && !this.submitClicked) {
        this.submitClicked = true

        let postData = {
          displayname: this.form.displayname,
          email: this.form.email,
          password: this.form.password,
          password_confirmation: this.form.passwordConfirmation
        }

        this.$store.dispatch("postSignup", postData)
        .then(() => {
          setTimeout(() => this.resetFormAndCloseDialog(), 500)
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.signupErrorMessage = Object.values(error.response.data.errors)[0][0]
            this.signupErrorVisible = true
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
