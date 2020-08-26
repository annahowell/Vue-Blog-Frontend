<template>
    <v-dialog
      v-model="visible"
      @click:outside="resetFormAndCloseDialog()"
      @keydown:esc="resetFormAndCloseDialog()"
      max-width="500px"
    >
    <v-card>
      <v-toolbar
        color="primary"
        class="px-1 mb-4"
        flat dark
      >
        <v-toolbar-title color="white">
          Manage {{loginData.isAdmin ? 'Users' : 'Account'}}
        </v-toolbar-title>

        <v-spacer/>

        <v-btn
          @click="resetFormAndCloseDialog()"
          fab outlined x-small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <ValidationObserver ref="observer" v-slot="{ invalid }">
        <v-form @submit.prevent="submitUpdate()" class="pt-0" ref="form">
          <v-card-text class="pb-0">
            <v-row v-if="loginData.isAdmin">
              <v-col cols="6">
                <ValidationProvider v-slot="{ errors }" name="user" rules="required">
                  <v-select
                    v-model="form.userid"
                    @change="choseUser()"
                    :items="users"
                    :error-messages="errors"
                    item-value="id"
                    label="User"
                    placeholder=" "
                  >
                    <template :slot="slot" v-for="slot in ['selection', 'item']" slot-scope="data">
                      {{ loginData.userid == data.item.id ? data.item.displayname + ' (me)' : data.item.displayname}}
                    </template>
                  </v-select>
                </ValidationProvider>
              </v-col>

              <v-col cols="6">
                <ValidationProvider
                  v-if="loginData.isAdmin"
                  v-slot="{ errors }"
                  name="role"
                  rules="required"
                >
                  <v-select
                    v-model="form.role"
                    :items="roles"
                    :error-messages="errors"
                    item-value="id"
                    label="Role"
                    placeholder=" "
                  >
                    <template :slot="slot" v-for="slot in ['selection', 'item']" slot-scope="data">
                      {{ selectedUser.roles[0].id == data.item.id ? data.item.name + ' (current role)' : data.item.name}}
                    </template>
                  </v-select>
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <ValidationProvider v-slot="{ errors }" name="displayName" rules="min:2">
                  <v-text-field
                    v-model="form.displayname"
                    :error-messages="errors"
                    label="Display name"
                    placeholder=" "
                    required
                  />
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <ValidationProvider v-slot="{ errors }" name="email" rules="email">
                  <v-text-field
                    v-model="form.email"
                    :error-messages="errors"
                    label="E-mail"
                    placeholder=" "
                    required
                  />
                </ValidationProvider>
              </v-col>
            </v-row>

            <ValidationObserver>
              <v-row>
                <v-col cols="12">
                  <ValidationProvider v-slot="{ errors }" name="password" rules="min:10|oneLowercase|oneUppercase|oneNumber|oneSpecial">

                    <v-text-field
                      v-model="form.password"
                      @click:append="showPassword = !showPassword"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPassword ? 'text' : 'password'"
                      :error-messages="errors[0]"
                      label="Password"
                      placeholder=" "
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <ValidationProvider v-slot="{ errors }" name="passConfirmation" :rules="passwordConfirmationRequired">
                    <v-text-field
                      v-model="form.passwordConfirmation"
                      @click:append="showPasswordConfirmation = !showPasswordConfirmation"
                      :append-icon="showPasswordConfirmation ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPasswordConfirmation ? 'text' : 'password'"
                      :error-messages="errors[0]"
                      label="Password confirmation"
                      placeholder=" "
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
            </ValidationObserver>

            <v-row class="mb-2" v-if="userErrorVisible">
              <v-col cols="12">
                <v-alert
                  transition="fade-transition"
                  class="caption mb-0"
                  width="100%"
                  type="error"
                  dense text
                >{{userErrorMessage}}</v-alert>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn
              v-if="selectedUser.enabled"
              @click="toggleUser(false)"
              color="warning"
              text
            >Disable account</v-btn>

            <v-btn
              v-else
              @click="toggleUser(true)"
              color="success"
              text
            >Enable account</v-btn>

            <v-spacer/>

            <v-btn
              :disabled="updateEnabled || invalid"
              color="primary"
              type="submit"
              text
            >Update</v-btn>
          </v-card-actions>
        </v-form>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
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

  props: ['showManageUserDialog'],

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  data () {
    return {
      userToManage: {},
      changedSelectedUser: false,
      showPassword: false,
      showPasswordConfirmation: false,
      userErrorMessage: '',
      userErrorVisible: false,
      submitClicked: false,

      form: {
        userid: null,
        displayname: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        role: null
      },
    }
  },

  mounted () {
    if (this.loginData.isAdmin) {
      this.$store.dispatch("getAllUsers")
      this.$store.dispatch("getAllRoles")
    }

    this.setModalState(false) // false selected user has not been changed
  },

  computed: {
    visible: {
      get () {return this.showManageUserDialog},
      set (value) {this.$emit('toggleManageUserModal', value)}
    },

    passwordConfirmationRequired () {
      return this.form.password ? 'required|passwordConfirmation:@password' : ''
    },

    selectedUser () {
      return this.users !== null ? this.users.filter(user => user.id == this.form.userid)[0] : this.loginData
    },

    updateEnabled () {
      return this.form.displayname == this.userToManage.displayname &&
                   this.form.email == ''                            &&
                this.form.password == ''                            &&
                    this.form.role == this.userToManage.role.id
    },

    ...mapState([
      'loginData',
      'users',
      'roles'
    ])
  },

  methods: {
    setModalState(changedSelectedUser) {
      this.changedSelectedUser = changedSelectedUser

      this.userToManage.userid      = this.changedSelectedUser ? this.selectedUser.id          : this.loginData.userid
      this.userToManage.role        = this.changedSelectedUser ? this.selectedUser.roles[0]    : this.loginData.role
      this.userToManage.displayname = this.changedSelectedUser ? this.selectedUser.displayname : this.loginData.displayname

      this.form.userid               = this.userToManage.userid
      this.form.role                 = this.userToManage.role.id
      this.form.displayname          = this.userToManage.displayname
      this.form.email                = ''
      this.form.password             = ''
      this.form.passwordConfirmation = ''
    },

    choseUser () {
      this.setModalState(true)
    },

    resetFormAndCloseDialog () {
      this.setModalState(false)

      this.userErrorMessage = ''
      this.userErrorVisible = false

      this.visible = false
    },

    submitUpdate () {
      if (this.$refs.observer.flags.valid && !this.submitClicked) {
        this.submitClicked = true

        if (this.loginData.isAdmin && this.loginData.userid === this.form.userid && this.form.role !== this.loginData.role.id) {
          this.$root.$confirm('Confirm', 'Are you sure wish to remove the admin role from yourself?', 'warning')
          .then((confirmed) => {
            if (confirmed) {
              this.calculatePutData()
            } else {
              this.submitClicked = false

              this.form.role = this.userToManage.role.id
            }
          })
        } else {
          this.calculatePutData()
        }
      }
    },

    toggleUser (enabled) {
      let putData = {
        enabled: enabled
      }

      if (!enabled) {
        this.$root.$confirm('Confirm', 'Are you sure wish to disable the account?', 'warning')
        .then((confirmed) => {
          if (confirmed) {
            this.doUpdate(putData)
          }
        })
      } else {
        this.doUpdate(putData)
      }
    },

    calculatePutData () {
      let putData = {}

      // This method is called within an if observer.flags.valid so if the
      // email/passwords aren't empty they should be valid
      if (this.form.displayname != this.userToManage.displayname) {
        putData.displayname = this.form.displayname
      }

      if (this.form.email != '') {
        putData.email = this.form.email
      }

      if (this.form.password != '') {
        putData.password              = this.form.password
        putData.password_confirmation = this.form.passwordConfirmation
      }

      if (this.form.role != this.userToManage.role.id) {
        putData.roles = [this.form.role]
      }

      this.doUpdate(putData)
    },

    doUpdate (putData) {
      this.$store.dispatch("putUser", {userId: this.userToManage.userid, putData: putData})
      .then(() => {
        this.resetFormAndCloseDialog()
      })
      .catch(error => {
        if (error.response.status === 422) {
          this.userErrorMessage = Object.values(error.response.data.errors)[0][0]
          this.userErrorVisible = true
        }
      })
      .finally(() => {
        this.submitClicked = false
      })
    }
  }
}
</script>

<style>
.validation-provider-parent > span {
  width: 100%;
}
