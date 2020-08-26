# Vue blog frontend

VueJS frontend intended to be used with my [Laravel blog API](https://github.com/annahowell/laravel-blog-api). Utilises [VueX](https://github.com/vuejs/vuex) for state management, [Axios](https://github.com/axios/axios) for API calls and the [Vuetify](https://github.com/vuetifyjs/vuetify) material design library with [tiptap-vuetify](https://github.com/iliyaZelenko/tiptap-vuetify) for post and comment markdown editing.



## Table of Contents
  * [Installation](#installation)
    * [Setup and compile with Yarn](#setup-and-compile-with-yarn)
    * [Setup and compile with NPM](#setup-and-compile-with-npm)
  * [Folder Contents](#folder-contents)
  * [Screenshots](#screenshots)


## Installation

First configure the `/src/store/index.js` file to reflect the base blog API url, e.g:  
`axios.defaults.baseURL = 'http://localhost:8000/api/v1/'`


### Setup and compile with Yarn

#### Setup project

```
yarn install
```

#### Compile for development with hot reloading
```
yarn serve
```

#### Compile and minify for production
```
yarn build
```


### Setup and compile with NPM

#### Setup project
```
npm install
```

#### Compile for development with hot reloading
```
npm run serve
```

#### Compile and minify for production
```
npm run build
```



## Folder Contents

- `src/main.js` - Initialises application
- `src/App.vue` - Application root
- `src/assets` -  Logo image
- `src/components` -  Reusable components, such as single posts and comments
- `src/components/dialogs` -  Reusable modals, such as the confirmation dialog
- `src/plugins` - Vuetify setup
- `src/router` - Vue router file
- `src/store` - Vuex store file
- `src/views` - Main page files, such as all posts, edit posts, etc



## Screenshots

##### All posts:
![All posts](https://github.com/annahowell/vue-blog-frontend/blob/master/screenshots/01-all-posts.png)


##### Single post (logged in as Admin):
![Single post](https://github.com/annahowell/vue-blog-frontend/blob/master/screenshots/02-single-post.png)


##### Edit post with manage tags modal open (logged in as Admin):
![Edit post and manage tags](https://github.com/annahowell/vue-blog-frontend/blob/master/screenshots/03-edit-post-manage-tags.png)


##### Managing users (logged in as Admin):
![Admin manage users](https://github.com/annahowell/vue-blog-frontend/blob/master/screenshots/04-manage-users.png)
