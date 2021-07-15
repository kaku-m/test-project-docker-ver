<template>
  <div>
    <v-app>
      <!-- navigation -->
      <v-navigation-drawer app v-model="drawer" clipped>
        <v-container>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title grey--text text--darken-2">
                None
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </v-container>
      </v-navigation-drawer>

      <!-- header -->
      <v-app-bar color="secondary" dark app clipped-left dense>
        <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
        <v-toolbar-title @click="$router.push('/')">Test Project</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text v-if="hasLoggedIn === false" @click="$router.push('/login')">ログイン</v-btn>
          <v-btn text v-if="hasLoggedIn === true" @click="userLogout()">ログアウト</v-btn>
        </v-toolbar-items>
      </v-app-bar>

      <!-- main -->
      <v-main>
        <div class="main-container">
          <h1>トップページ</h1>
          <p>ログイン状態：{{ $auth.loggedIn }}</p>
          <p>ユーザー情報：{{ $auth.user }}</p>
          <p>
            <nuxtLink to="/pages">ページ一覧へ</nuxtLink>
          </p>
        </div>
      </v-main>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {

  },
  data() {
    return {
      // ログイン状態
      hasLoggedIn: false,
      // ナビゲーション
      drawer: true,
    }
  },
  created() {

  },
  computed: {

  },
  mounted() {
    // ログインチェック
    this.hasLoggedIn = this.$auth.loggedIn
  },
  methods: {
    // ログアウト
    userLogout() {
      this.hasLoggedIn = false
      this.$auth.logout()
    },
  }
}
</script>

<style scoped>
.main-container {
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>
