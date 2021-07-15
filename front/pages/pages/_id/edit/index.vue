<template>
  <div>
    <v-app>
      <!-- header -->
      <v-app-bar color="secondary" dark app clipped-left dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title @click="$router.push('/')">Test Project</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text v-if="hasLoggedIn === false" @click="$router.push('/login')">ログイン</v-btn>
          <v-btn text v-if="hasLoggedIn === true" @click="$auth.logout()">ログアウト</v-btn>
        </v-toolbar-items>
      </v-app-bar>

      <!-- main -->
      <v-main v-if="hasMounted && hasLoggedIn === true">
        <v-app-bar color="purple" dark dense clipped-left>
          <v-icon>mdi-pencil</v-icon>
          <v-toolbar-title>
            <form>
              <input v-model="pageTitle" type="text" class="title-edit">
            </form>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn text @click="save()">保存</v-btn>
            <v-btn text @click="cancel()">キャンセル</v-btn>
          </v-toolbar-items>
        </v-app-bar>
        <div v-if="hasMounted === false">Loading...</div>
        <editor
          v-if="hasMounted"
          id="wysiwyg"
          api-key="no-api-key"
          :init="initTiny()"
          @onInit="setContent()"
        />
      </v-main>
    </v-app>

    <Modal v-if="modal.flag.image === true">
      <h1>画像の挿入</h1>
      <form>
        <p>
          <label for="image_upload" class="upload-button">アップロードする</label>
          <input ref="file" type="file" id="image_upload" @change="uploadImage($event)">
        </p>
      </form>
      <form class="image-container">
        <div v-for="fetchedImage in fetchedImages" :key="fetchedImage.id">
          <input :id="fetchedImage.id" type="radio" name="fetchedImage" @change="selectImage(fetchedImage)">
          <label :for="fetchedImage.id">
            <img :src="fetchedImage.url">
          </label>
        </div>
      </form>
      <p><button @click="insertImage()">挿入</button></p>
      <p><button @click="closeModal('image')">キャンセル</button></p>
      <p v-if="modal.image.errorMessage" class="error-message">{{ modal.image.errorMessage }}</p>
    </Modal>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import Modal from '~/components/Modal.vue'

export default {
  name: 'app',
  components: {
    editor: Editor,
    Modal,
  },
  data() {
    return {
      // ログイン状態
      hasLoggedIn: false,
      // mounted完了
      hasMounted: false,
      // 当ページ
      pageId: '',
      pagePath: '',
      pageTitle: '',
      content: '',
      // モーダル関連
      modal: {
        flag: {
          image: false,
        },
        image: {
          selected: '',
          errorMessage: '',
        },
      },
      fetchedImages: [],
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
    // 当ページの取得
    await this.$axios
    .$get(`/api/page/${this.pageId}`)
    .then((res) => {
      if (res) {
        this.pagePath = res.pagePath
        this.pageTitle = res.pageTitle
        this.content = res.content || ''
      }
    })
    .catch((err) => {
      console.log(err)
    })
    // アップロード画像の取得
    await this.$axios
    .$get(`/api/image/${this.$route.params.id}`)
    .then((res) => {
      for (let i = 0; i < res.length; i++) {
        this.fetchedImages.push({ id: res[i].imageId, url: '/images/' + res[i].name })
      }
    })
    .catch((err) => {
      console.log(err)
    })

    this.hasMounted = true
  },
  methods: {
    // モーダル初期化
    initModal(type) {
      if (type === 'image') {
        this.modal.image.selected = ''
        this.modal.image.errorMessage = ''
      }
    },
    // モーダルを開く
    openModal(type) {
      this.initModal(type)
      this.modal.flag[type] = true
    },
    // モーダルを閉じる
    closeModal(type) {
      this.modal.flag[type] = false
    },
    // 画像のアップロード
    async uploadImage(event) {
      const files = event.target.files || event.dataTransfer.files
      const file = files[0]
      const LIMIT_SIZE_BYTE = 1024 * 1024 // 1MB
      // キャンセル時
      if (!file) {
        return
      }
      // タイプチェック
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.modal.image.errorMessage = 'jpeg画像ファイルまたはpng画像ファイルを選択してください。'
        return
      }
      // サイズチェック
      if (file.size > LIMIT_SIZE_BYTE) {
        this.modal.image.errorMessage = 'サイズが1MB以下の画像ファイルを選択してください。'
        return
      }
      const form = new FormData()
      form.append('pageId', this.pageId)
      form.append('image', file)
      // サーバーに送信
      await this.$axios
      .$post('/api/image/upload', form, {
        headers: {
          'content-type': 'multipart/form-data',
        }
      })
      .then((res) => {
        this.fetchedImages.push({ id: res.imageId, url: '/images/' + res.name })
      })
      .catch((err) => {
        console.log(err)
      })
    },
    // 画像の選択
    selectImage(selectedImage) {
      this.modal.image.selected = selectedImage
    },
    // 画像の挿入
    insertImage() {
      if (!this.modal.image.selected) {
        this.modal.image.errorMessage = '画像を選択してください。'
        return
      }
      const image = tinymce.activeEditor.dom.createHTML('img', { src: this.modal.image.selected.url }, '')
      tinymce.activeEditor.insertContent(image)
      this.closeModal('image')
    },
    // 保存
    async save() {
      const content = tinymce.activeEditor.getContent()
      await this.$axios
      .$put('/api/page/save', {
        pageId: this.pageId,
        pageTitle: this.pageTitle,
        content: content,
      })
      .then((res) => {
        if (res.hasOwnProperty('msg')) {
          console.log(res)
          return
        }
        this.$router.push({ path: `/pages/${this.pageId}` })
      })
      .catch((err) => {
        console.log(err)
      })
    },
    // 編集キャンセル
    cancel() {
      this.$router.push({ path: `/pages/${this.pageId}` })
    },
    // コンテントをセット
    setContent() {
      tinymce.activeEditor.setContent(this.content)
    },
    // TinyMCEの設定
    initTiny() {
      const self = this
      return {
        selector: '#wysiwyg',
        language: 'ja',
        elementpath: false,
        height: window.innerHeight - 96,
        menubar: false,
        statusbar: false,
        plugins: 'image link table preview',
        toolbar: ['formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | customInsertImage link table | preview',
                  'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol'],
        contextmenu: '',
        table_toolbar: '',
        table_default_styles: { width: '20%' },
        table_responsive_width: false,
        table_column_resizing: 'resizetable',
        imagetools_toolbar: false,
        image_uploadtab: false,
        automatic_uploads: false,
        relative_urls: false,
        setup: function(editor) {
          const isAnchorElement = function(node) {
            return node.nodeName.toLowerCase() === 'img'
          }
          const getAnchorElement = function() {
            const node = editor.selection.getNode()
            return isAnchorElement(node) ? node : null
          }
          editor.ui.registry.addToggleButton('customInsertImage', {
            icon: 'image',
            tooltip: 'Insert image',
            onAction: () => self.openModal('image'),
            onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('img:not([data-mce-object],[data-mce-placeholder]),figure.image', buttonApi.setActive).unbind
          }),
          editor.ui.registry.addContextForm('customInsertImage', {
            launch: {
              type: 'contextformbutton',
              icon: 'image'
            },
            predicate: isAnchorElement,
            position: 'node',
            initValue: function() {
              const elm = getAnchorElement()
              return !!elm ? elm.href : ''
            },
            commands: [
              {
                type: 'contextformbutton',
                text: '削除',
                onAction: function() {
                  const targetNode = tinymce.activeEditor.selection.getNode()
                  tinymce.activeEditor.dom.remove(targetNode)
                  tinymce.activeEditor.insertContent('')
                }
              },
            ]
          })
        }
      }
    },
  }
}
</script>

<style scoped>
.title-edit {
  width: 100%;
  color: white;
  border: none;
  outline: none;
}

.modal__content h1 {
  color: #333;
  margin-bottom: 20px;
}

.modal__content p {
  margin-bottom: 12px;
}

.upload-button:hover {
  background: #ccc;
  cursor: pointer;
}

#image_upload {
  display: none;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
}

.image-container input[type="radio"] {
  display: none;
}

.image-container input[type="radio"]:checked + label img {
  background: red;
}

.image-container img {
  width: 80px;
  margin: 2px;
  padding: 2px;
}

.error-message {
  color: red;
}
</style>
