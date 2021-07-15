<template>
  <div>
    <v-app>
      <!-- header -->
      <v-app-bar color="secondary" dark app clipped-left dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title @click="$router.push('/')">Test Project</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="$router.push('/register')">新規登録</v-btn>
        </v-toolbar-items>
      </v-app-bar>

      <!-- main -->
      <v-main v-if="hasMounted && hasLoggedIn === false">
        <div class="main-container">
          <h1>ログインページ</h1>
          <form @submit.prevent="userLogin()">
            <p>
              <label for="username">ユーザー名：</label>
              <input v-model="form.username" type="text" id="username">
            </p>
            <p>
              <label for="password">パスワード：</label>
              <input v-model="form.password" type="password" id="password">
            </p>
            <p>
              <button type="submit">ログイン</button>
            </p>
          </form>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
      // mounted完了
      hasMounted: false,
      // ログイン情報
      form: {
        username: '',
        password: '',
      },
      errorMessage: '',
    }
  },
  created() {

  },
  computed: {

  },
  mounted() {
    // ログインチェック
    this.hasLoggedIn = this.$auth.loggedIn
    if (this.$auth.loggedIn === true) {
      this.$router.push({ path: '/' })
    }

    this.hasMounted = true
  },
  methods: {
    // ログイン
    async userLogin() {
      // 入力チェック
      if (this.form.username === '') {
        this.errorMessage = 'ユーザー名を入力してください。'
        return
      }
      if (this.form.password === '') {
        this.errorMessage = 'パスワードを入力してください。'
        return
      }
      // サーバーに送信
      try {
        await this.$auth.loginWith('local', {
          data: this.form
        })
      } catch (err) {
        this.errorMessage = 'ユーザー名またはパスワードが違います。'
      }
    },
  }
}
</script>

<style scoped>
.main-container {
  width: 900px;
  text-align: center;
  padding: 20px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin: 20px;
}

#username,
#password {
  border-bottom: 1px solid #ccc;
  outline: none;
}

.error-message {
  color: red;
}
</style>
