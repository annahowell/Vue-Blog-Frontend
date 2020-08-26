<template>
  <div>
    <v-row v-if="loginData.isAdmin" class="pt-0 pb-1" justify="center">
      <v-chip
        @click="toggleManageTagDialog(true)"
        color="primary"
        class="white--text"
        style="border: 1px solid #EAEAEA"
        medium
      >
        <v-avatar left>
          <v-icon>mdi-plus</v-icon>
        </v-avatar>
        Manage Tags
      </v-chip>
    </v-row>

    <v-row class="mb-8">
      <v-chip-group multiple show-arrows v-model="selectedTags">
        <v-chip
          v-for="tag in tags"
          :key="tag.id"
          :value="tag.id"
          :color="tag.color"
          :text-color="tag.color | invert"
          style="border: 1px solid #EAEAEA"
          class="text-capitalize"
          filter-icon="mdi-check-circle"
          filter medium
        >{{tag.title}}</v-chip>
      </v-chip-group>
    </v-row>

    <manage-tag-dialog :showManageTagDialog="showManageTagDialog" @toggleManageTagDialog="toggleManageTagDialog"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ManageTagDialog from '@/components/dialogs/ManageTagDialog'

export default {
  name: 'Tags',

  props: ['tags', 'postTags'],

  components: {
    ManageTagDialog
  },

  data () {
    return {
      showManageTagDialog: false,

      selectedTags: []
    }
  },

  created () {
    this.selectedTags = this.postTags
  },

  computed: {
    ...mapState([
      'loginData',
    ])
  },

  methods: {
    toggleManageTagDialog (value) {
      this.showManageTagDialog = value
    }
  },

  watch: {
    selectedTags () {
      this.$emit('setFormtags', this.selectedTags)
    }
  }
}
</script>

<style scoped>
.v-card--link::before { background-color: transparent!important}
</style>
