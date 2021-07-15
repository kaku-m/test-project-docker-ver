<template>
  <div>
    <v-app>
      <!-- navigation -->
      <v-navigation-drawer app v-model="drawer" clipped>
        <v-container>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title grey--text text--darken-2">
                Page Tree
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-treeview v-if="hasMounted" open-all hoverable :items="pageTrees">
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
        <v-app-bar color="purple" dark dense clipped-left>
          <v-toolbar-items v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.pageId">
            <v-btn icon v-if="index !== 0" style="width: 0px">
              <v-icon>mdi-menu-right</v-icon>
            </v-btn>
            <v-btn text @click="$router.push(`/pages/${breadcrumb.pageId}`)">{{ breadcrumb.pageTitle }}</v-btn>
          </v-toolbar-items>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn text @click="$router.push(`/pages/${pageId}/edit`)">編集</v-btn>
            <v-btn text @click="openModal('child')">作成</v-btn>
            <v-btn text @click="openModal('move')">移動</v-btn>
            <v-btn text @click="openModal('delete')">削除</v-btn>
          </v-toolbar-items>
        </v-app-bar>
        <div v-html="content" class="main-container"></div>
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

    <Modal v-if="modal.flag.child === true">
      <h1>子ページの作成</h1>
      <form>
        <p><input v-model="modal.form.pageTitle" type="text" placeholder="ページのタイトル"></p>
      </form>
      <p><button @click="createChildPage()">作成</button></p>
      <p><button @click="closeModal('child')">キャンセル</button></p>
    </Modal>

    <Modal v-if="modal.flag.move === true">
      <h1>ページの移動</h1>
      <form>
        <p><input v-model="modal.form.parentPageId" type="text" placeholder="親ページのID"></p>
      </form>
      <p><button @click="movePage()">移動</button></p>
      <p><button @click="closeModal('move')">キャンセル</button></p>
    </Modal>

    <Modal v-if="modal.flag.delete === true">
      <h1>ページの削除</h1>
      <p>子ページも全て削除されます。</p>
      <p><button @click="deletePage()">削除</button></p>
      <p><button @click="closeModal('delete')">キャンセル</button></p>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue'

export default {
  name: 'app',
  components: {
    Modal,
  },
  data() {
    return {
      // ログイン状態
      hasLoggedIn: false,
      // mounted完了
      hasMounted: false,
      // 親ページ
      parent: {
        pageId: '',
        pageTitle: '',
      },
      // 当ページ
      pageId: '',
      pagePath: '',
      pageTitle: '',
      content: '',
      // 子ページ
      children: [],
      // ぱんくず
      breadcrumbs: [],
      // ページツリー
      pageTrees: [],
      // モーダル関連
      modal: {
        flag: {
          new: false,
          child: false,
          move: false,
          delete: false,
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
    // 当ページID
    this.pageId = this.$route.params.id
    // 親ページの取得
    await this.$axios
    .$get(`/api/page/parent/${this.pageId}`)
    .then((res) => {
      if (res) {
        this.parent.pageId = res.pageId
        this.parent.pageTitle = res.pageTitle
      }
    })
    .catch((err) => {
      console.log(err)
    })
    // 当ページの取得
    await this.$axios
    .$get(`/api/page/${this.pageId}`)
    .then((res) => {
      this.pagePath = res.pagePath
      this.pageTitle = res.pageTitle
      this.content = res.content
    })
    .catch((err) => {
      console.log(err)
    })
    // 子ページの取得
    await this.$axios
    .$get(`/api/page/children/${this.pageId}`)
    .then((res) => {
      this.children = res
    })
    .catch((err) => {
      console.log(err)
    })
    // パンくずの表示
    await this.$axios
    .$get(`/api/page/ancestors/${this.pageId}`)
    .then((res) => {
      const paths = this.pagePath.split('/')
      for (let i = 0; i < paths.length; i++) {
        if (!paths[i] || paths[i] === this.pageId) {
          continue
        }
        this.breadcrumbs.push(res.find(ancestor => {
          return ancestor.pageId === Number(paths[i])
        }))
      }
      // 当ページを追加
      this.breadcrumbs.push({ pageId: this.pageId, pageTitle: this.pageTitle })
    })
    .catch((err) => {
      console.log(err)
    })
    // ページツリーの組み立て（直近の親と子まで）
    let tree = {}
    let self = {}
    self.pageId = this.pageId
    self.pageTitle = this.pageTitle
    self.children = []
    for (let i = 0; i < this.children.length; i++) {
      self.children.push({ pageId: this.children[i].pageId, pageTitle: this.children[i].pageTitle })
    }
    if (this.parent.pageId) {
      tree.pageId = this.parent.pageId
      tree.pageTitle = this.parent.pageTitle
      tree.children = []
      tree.children.push(self)
    } else {
      tree = self
    }
    this.pageTrees.push(tree)

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
    createNewPage() {
      const parentPageId = this.modal.form.parentPageId
      const pageTitle = this.modal.form.pageTitle
      // エラーチェックが必要
      this.$axios
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
    // 子ページの作成
    createChildPage() {
      const pageTitle = this.modal.form.pageTitle
      // エラーチェックが必要
      this.$axios
      .$post('/api/page/create/child', {
        pageTitle: pageTitle,
        parentPageId: this.$route.params.id
      })
      .then((res) => {
        const createdPageId = res.createdPageId
        this.$router.push({ path: `/pages/${createdPageId}/edit` })
      })
      .catch((err) => {
        console.log(err)
      })
    },
    // ページの移動
    movePage() {
      const parentPageId = this.modal.form.parentPageId
      const pageId = this.$route.params.id
      // エラーチェックが必要
      this.$axios
      .$put('/api/page/move', {
        pageId: pageId,
        parentPageId: parentPageId
      })
      .then((res) => {
        location.reload()
      })
      .catch((err) => {
        console.log(err)
      })
    },
    // ページの削除
    deletePage() {
      const pageId = this.$route.params.id
      // 最終確認が必要
      this.$axios
      .$delete(`/api/page/delete/${pageId}`)
      .then((res) => {
        this.$router.push({ path: '/pages' })
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

.modal__content h1 {
  color: #333;
  margin-bottom: 20px;
}

.modal__content p {
  margin-bottom: 12px;
}
</style>
