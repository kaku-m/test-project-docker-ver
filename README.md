# test-project-docker-ver

## ローカル開発環境構築例（Windows）

### 事前準備
VirtualBoxのインストール  
https://www.virtualbox.org/  
Vagrantのインストール  
https://www.vagrantup.com/  
PuTTYのインストール  
https://www.putty.org/  

### 環境構築手順
PowerShellまたはコマンドプロンプトを起動  
```
> mkdir MyVagrant/MyCentOS/
> cd MyVagrant/MyCentOS/
> vagrant init bento/centos-8.2
> vim ./Vagrantfile
```
Vagrantfileの以下のコメントアウトを外す  
```
# config.vm.network "private_network", ip: "192.168.33.33"
```
VMを起動  
```
> vagrant up
```
PuTTYを起動  
Host Name「192.168.33.33」  
Port「22」  
Connection type:「SSH」  
「Open」  
PuTTY Security Alert「はい」  
```
# login as:「vagrant」
# password:「vagrant」

# Dockerのインストール
$ sudo dnf install -y yum-utils
$ sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
$ sudo dnf install -y docker-ce docker-ce-cli containerd.io
$ docker --version
$ sudo systemctl start docker
$ systemctl status docker
# 参考）https://docs.docker.com/engine/install/centos/

# rootユーザー以外でDockerを管理する
$ sudo groupadd docker
$ sudo usermod -aG docker $USER
$ newgrp docker
$ docker run hello-world

# 起動時にDockerを起動する
$ sudo systemctl enable docker.service
$ sudo systemctl enable containerd.service
# 参考）https://docs.docker.com/engine/install/linux-postinstall/

# Docker Composeのインストール
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker-compose --version
# 参考）https://docs.docker.com/compose/install/#install-compose-on-linux-systems

# gitのインストール
$ sudo dnf install -y git
```

### 動作確認
```
$ git clone https://github.com/kaku-m/test-project-docker-ver.git
$ cd test-project-docker-ver
$ docker-compose up
```
http://192.168.33.33:8000/ にアクセス  
確認できたらターミナルでCtrl+Cを押下  

### テーブルの作成
```
$ docker-compose up -d
$ docker exec -it db-container bash
# mysql -uroot -pPassword@9
> SHOW DATABASES;
> USE test_db;

# ページ管理テーブルの作成
> CREATE TABLE pages (
>   id INT NOT NULL PRIMARY KEY,
>   path TEXT NOT NULL,
>   title VARCHAR(255) NOT NULL UNIQUE,
>   content TEXT,
>   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
>   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
> );

# 採番テーブルの作成
> CREATE TABLE sequence (
>   id INT NOT NULL PRIMARY KEY AUTO_INCREMENT
> ) engine = InnoDB;

# ユーザー管理テーブルの作成
> CREATE TABLE users (
>   id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
>   name VARCHAR(255) NOT NULL UNIQUE,
>   password VARCHAR(255) NOT NULL,
>   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
>   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
> );

# 画像管理テーブルの作成
> CREATE TABLE images (
>   id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
>   page_id INT NOT NULL,
>   name VARCHAR(255) NOT NULL UNIQUE,
>   path TEXT NOT NULL,
>   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
>   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
> );
> SHOW TABLES;
> quit
# exit
```

### 画面操作
画面右上の「ログイン」を押下  
画面右上の「新規登録」を押下  
ユーザー名に「aaa」を入力  
パスワードに「aaa」を入力  
「登録する」を押下  
「ページ一覧へ」を押下  
画面右上の「新規」を押下  
「親ページのID」には何も入力しない  
「ページのタイトル」に「ページ1」を入力  
「作成」を押下  
画像マークを押下  
「アップロードする」を押下  
1MB以下のjpegまたはpng画像を選択  
アップロードした画像を選択して「挿入」を押下  
画面右上の「保存」を押下  

編集　・・・編集ページに移動する  
作成　・・・ページのタイトルを入力して子ページを作成する　※エラーチェック無し  
移動　・・・親ページのIDを入力してページを移動する（子ページも全て）　※エラーチェック無し  
削除　・・・子ページも全て削除する　※物理削除  

### Dockerコマンド
```
# コンテナの一覧
$ docker-compose ps
# コンテナの作成と起動
$ docker-compose up
# コンテナの停止
$ docker-compose stop
# サービスの開始
$ docker-compose start
# コンテナの削除
$ docker-compose down
# コンテナとイメージの削除
$ docker-compose down --rmi all

# コンテナの一覧
$ docker ps
# コンテナの削除
$ docker rm <CONTAINER ID> <CONTAINER ID> ...
# イメージの一覧
$ docker images
# イメージの削除
$ docker rmi <IMAGE ID> <IMAGE ID> ...
```
参考）https://docs.docker.jp/compose/reference/toc.html

### VMの停止
```
> vagrant suspend
```

## 参考

### create-nuxt-app
```
$ npm init nuxt-app test-project
# Project name:「そのままEnter押下」
# Programming language:「JavaScript」
# Package manager:「Npm」
# UI framework:「None」
# Nuxt.js modules:「Axios」
# Linting tools:「そのままEnter押下」
# Testing framework:「None」
# Rendering mode:「Universal（SSR / SSG）」
# Deployment target:「Server（Node.js hosting）」
# Development tools:「そのままEnter押下」
# Development tools:「そのままEnter押下」
# What is your GitHub username?「任意」
# Version control system:「Git」
```

### ホスト設定
nuxt.config.jsのaxiosに下記を追加  
```
baseURL: 'https://192.168.33.33:8000/'
```

### ログイン機能の為
```
$ npm install --save @nuxtjs/auth
# npm install --save jsonwebtoken
```
nuxt.config.jsのmodulesに下記を追加  
```
'@nuxtjs/auth',
```
storeフォルダにindex.jsを作成  

### 画面デザインの為
```
$ npm install @nuxtjs/vuetify -D
```
nuxt.config.jsのbuildModulesに下記を追加  
```
'@nuxtjs/vuetify',
```

### APIの実装とDB接続の為
```
$ npm install --save express
$ npm install --save mysql2
$ npm install --save multer
```
staticフォルダにimagesフォルダを作成  

### WYSIWYGエディタの導入
```
npm install --save "@tinymce/tinymce-vue@^3"
```
