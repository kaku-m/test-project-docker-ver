<template>
  <div>
    <v-app>
      <!-- navigation -->
      <v-navigation-drawer app v-model="drawer" clipped>
        <v-container>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title grey--text text--darken-2">
                Page List
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-treeview v-if="hasMounted" open-all hoverable :items="pageList">
            <template v-slot:label="{ item }">
              <div @click="$router.push(`/pages/${item.pageId}`)">{{ item.pageTitle }}</div>
            </template>
          </v-treeview>
        </v-container>
      </v-navigation-drawer>

      <!-- header -->
      <v-app-bar color="secondary" dark app clipped-left dense>
        <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
        <v-toolbar-title @click="$router.push('/')">Test Project</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="openModal('new')">新規</v-btn>
          <v-btn text v-if="hasLoggedIn === false" @click="$router.push('/login')">ログイン</v-btn>
          <v-btn text v-if="hasLoggedIn === true" @click="$auth.logout()">ログアウト</v-btn>
        </v-toolbar-items>
      </v-app-bar>

      <!-- main -->
      <v-main v-if="hasMounted && hasLoggedIn === true">
        <div class="main-container">
          <h1>ページ一覧（仮）</h1>
        </div>
      </v-main>
    </v-app>

    <Modal v-if="modal.flag.new === true">
      <h1>ページの新規作成</h1>
      <form>
        <p><input v-model="modal.form.parentPageId" type="text" placeholder="親ページのID"></p>
        <p><input v-model="modal.form.pageTitle" type="text" placeholder="ページのタイトル"></p>
      </form>
      <p><button @click="createNewPage()">作成</button></p>
      <p><button @click="closeModal('new')">キャンセル</button></p>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue'

export default {
  components: {
    Modal
  },
  data() {
    return {
      // ログイン状態
      hasLoggedIn: false,
      // mounted完了
      hasMounted: false,
      // ページ一覧
      pageList: [],
      // モーダル関連
      modal: {
        flag: {
          new: false,
        },
        form: {
          parentPageId: '',
          pageTitle: '',
        }
      },
      // ナビゲーション
      drawer: true,
    }
  },
  created() {

  },
  computed: {

  },
  async mounted() {
    // ログインチェック
    this.hasLoggedIn = this.$auth.loggedIn
    if (this.hasLoggedIn === false) {
      this.$router.push({ path: '/login' })
    }
    // ページ一覧の取得
    await this.$axios
    .$get('/api/page/list')
    .then((res) => {
      this.pageList = res
    })
    .catch((err) => {
      console.log(err)
    })

    this.hasMounted = true
  },
  methods: {
    // モーダルを開く
    openModal(type) {
      this.modal.flag[type] = true
    },
    // モーダルを閉じる
    closeModal(type) {
      this.modal.flag[type] = false
    },
    // ページの新規作成
    async createNewPage() {
      const parentPageId = this.modal.form.parentPageId
      const pageTitle = this.modal.form.pageTitle
      // エラーチェックが必要
      await this.$axios
      .$post('/api/page/create/new', {
        pageTitle: pageTitle,
        parentPageId: parentPageId
      })
      .then((res) => {
        const createdPageId = res.createdPageId
        this.$router.push({ path: `/pages/${createdPageId}/edit` })
      })
      .catch((err) => {
        console.log(err)
      })
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

.modal__content p {
  margin-bottom: 12px;
}
</style>
