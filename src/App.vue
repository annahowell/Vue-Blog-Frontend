<template>
  <v-app>
    <v-app-bar
      color="primary" app dark >
      <div class="d-flex align-center">
        <v-btn
          @click="$safeRouterPush({name: 'Home'})"
          color="black"
          large text icon
        >
          <v-icon color="white" large>mdi-fire</v-icon>
        </v-btn>
      </div>

      <v-spacer/>

      <v-btn
        v-if="loginData.userid && (loginData.role.name === 'editor' || loginData.isAdmin)"
        @click="$safeRouterPush({name: 'CreatePost'})"
        text
      >Create Post</v-btn>

      <v-btn
        v-if="!loginData.userid"
        @click="toggleLoginDialog(true)"
        text
      >Login</v-btn>

      <v-menu v-else bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-on="on"
            v-bind="attrs"
            dark icon
          >
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="toggleManageUserModal(true)">
            Manage {{loginData.isAdmin ? 'Users' : 'Account'}}
          </v-list-item>

          <v-list-item @click="confirmLogout()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="mt-12 mx-4">
      <router-view/>
    </v-main>

    <confirm-dialog ref="confirm"/>

    <register-dialog :showRegisterDialog="showRegisterDialog" @toggleRegisterDialog="toggleRegisterDialog" @toggleLoginDialog="toggleLoginDialog"/>

    <login-dialog :showLoginDialog="showLoginDialog" @toggleLoginDialog="toggleLoginDialog" @toggleRegisterDialog="toggleRegisterDialog"/>

    <manage-user-dialog v-if="loginData.userid" :showManageUserDialog="showManageUserDialog" @toggleManageUserModal="toggleManageUserModal"/>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.color == 'success' ? '2500' : '3500'"
    >
      {{snackbar.message}}

      <template v-slot:action="{ attrs }">
        <v-btn
          @click="$store.commit('setSnackbar', {show: false})"
          v-bind="attrs"
          outlined fab x-small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-footer color="grey lighten-3" class="mt-4 px-4 py-2">
      <v-row cols="12" justify="center">
        <v-btn href="https://github.com/annahowell" target="_blank" medium icon>
          <v-icon color="grey" large>mdi-github</v-icon>
        </v-btn>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import RegisterDialog from '@/components/dialogs/RegisterDialog'
import LoginDialog from '@/components/dialogs/LoginDialog'
import ManageUserDialog from '@/components/dialogs/ManageUserDialog'

export default {
  name: 'App',

  components: {
    ConfirmDialog,
    RegisterDialog,
    LoginDialog,
    ManageUserDialog
  },

  data () {
    return {
      confirmed: false,
      showConfirmDialog: false,
      showRegisterDialog: false,
      showLoginDialog: false,
      showManageUserDialog: false
    }
  },

  created () {
    this.$store.commit('initialiseStore')
  },

  mounted () {
    this.$root.$confirm = this.$refs.confirm.open
  },

  computed: {
    ...mapState([
      'loginData',
      'snackbar',
    ])
  },

  methods: {
    toggleConfirmDialog () {
      this.showConfirmDialog = !this.showConfirmDialog
    },

    toggleRegisterDialog (value) {
      this.showRegisterDialog = value
    },

    toggleLoginDialog (value) {
      this.showLoginDialog = value
    },

    toggleManageUserModal (value) {
      this.showManageUserDialog = value
    },

    confirmLogout () {
      this.$refs.confirm.open('Logout', 'Are you sure you want to logout?', 'warning')
      .then((confirmed) => {
        if (confirmed) {
          this.$store.dispatch("getLogout")
          .then(() => {
            this.$safeRouterPush({name: 'Home'})
          })
        }
      })
    }
  }
}
</script>
