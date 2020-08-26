<template>
  <v-card
    @click="$safeRouterPush({name: 'PostById', params: {postId: blogPost.id.toString()}})"
    @click.native="$scrollToTop"
    class="mb-12"
    color="grey lighten-5"
    width="100%"
    outlined
  >
    <v-card-title class="headline pb-2">{{blogPost.title}}</v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="6" class="text-uppercase font-weight-light pt-0">
          BY {{blogPost.author.displayname}}
        </v-col>

        <v-spacer/>

        <v-col cols="6" class="text-right text-uppercase font-weight-light pt-0">
          {{blogPost.created_at | friendlyDateTime }}
        </v-col>
      </v-row>

      <v-row>
        <v-col class="pb-0" v-html="blogPost.body"/>
      </v-row>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-chip
        v-for="tag in blogPost.tags"
        :key="tag.id"
        :color="tag.color"
        :text-color="tag.color | invert"
        @click.stop
        @click="$safeRouterPush({name: 'PostsByTag', params: {tagId: tag.id.toString()}})"
        style="border: 1px solid #EAEAEA"
        class="mr-2 text-capitalize"
        small
      >{{tag.title}}</v-chip>

      <div class="ml-auto subtitle-1 text--secondary">
        <v-icon left small class="pl-1">mdi-comment-multiple</v-icon>
        {{blogPost.comment_count}} Comments
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SinglePost',

  props: ['blogPost'],
}
</script>

<style scoped>
.v-card--link::before { background-color: transparent!important}
</style>
