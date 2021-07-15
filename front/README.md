# test-project

## ローカル開発環境構築例（Windows）

### 事前準備
VirtualBoxのインストール  
https://www.virtualbox.org/  
Vagrantのインストール  
https://www.vagrantup.com/  
PuTTYのインストール  
https://www.putty.org/  

### 手順
PowerShellまたはコマンドプロンプトを起動  
```
> mkdir MyVagrant/MyCentOS/
> cd MyVagrant/MyCentOS/
> vagrant init bento/centos-8.1
> vim ./Vagrantfile
```
Vagrantfileの以下のコメントアウトを外す  
```
# config.vm.network "private_network", ip: "192.168.33.10"  
```
VMを起動  
```
> vagrant up
```
PuTTYを起動  
Host Name「192.168.33.10」  
Port「22」  
Connection type:「SSH」  
「Open」  
PuTTY Security Alert「はい」  
```
# login as:「vagrant」
# password:「vagrant」

# gitのインストール
$ su
# Password:「vagrant」
$ yum install -y git
$ exit

# Homebrewのインストール
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Enter押下
$ echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/vagrant/.bash_profile
$ eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
$ brew -v

# nodeのインストール
$ brew install gcc
$ brew install nodebrew
$ /home/linuxbrew/.linuxbrew/opt/nodebrew/bin/nodebrew setup_dirs
$ export PATH=$HOME/.nodebrew/current/bin:$PATH
$ nodebrew -v
$ nodebrew ls-remote
$ nodebrew install-binary v14.16.1
$ nodebrew ls
$ nodebrew use v14.16.1
$ echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> /home/vagrant/.bash_profile

# 設定の反映
$ source ~/.bash_profile

# MySQLのインストール
$ su
# Password:「vagrant」
$ dnf localinstall https://dev.mysql.com/get/mysql80-community-release-el8-1.noarch.rpm
# Is dhis ok:「y」
$ dnf module disable mysql
# Is dhis ok:「y」
$ dnf info mysql-community-server
$ dnf install mysql-community-server
# Is dhis ok:「y」
# Is dhis ok:「y」
$ mysqld --version

# MySQLを起動
$ systemctl start mysqld
$ systemctl status mysqld

# パスワードの確認
$ grep 'temporary password' /var/log/mysqld.log

# MySQLの設定
$ mysql_secure_installation
# Enter password for user root:「確認したパスワードを入力」
# New password:「Password@9」
# Re-enter new password:「Password@9」
# Change the password for root ?:「y」
# New password:「Password@9」
# Re-enter new password:「Password@9」
# Do you wish to continue with the password provided?:「y」
# Remove anonymous users?:「y」
# Disallow root login remotely?:「n」
# Remove test database and access to it?:「n」
# Reload privilege tables now?:「n」

# データベースの作成
$ mysql -uroot -pPassword@9
> CREATE DATABASE test_db;
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
$ exit
```

### インストールと画面操作
```
$ git clone https://github.com/kaku-m/test-project.git
$ cd test-project
$ npm install
$ npm run dev
```
https://192.168.33.10:3333/ にアクセス  
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
package.jsonのscripts.devを下記に変更  
```
NUXT_HOST=192.168.33.10 NUXT_PORT=3333 nuxt
```
nuxt.config.jsのaxiosに下記を追加  
```
baseURL: 'https://192.168.33.10:3333/'
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

### HTTPS通信の為
```
$ npm install --save mkcert
$ node_modules/mkcert/src/cli.js create-ca
$ node_modules/mkcert/src/cli.js create-cert
```
nuxt.config.jsに下記を追記  
```
import path from 'path'
import fs from 'fs'
```
さらに追記  
```
server: {
  https: {
    key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt'))
  }
},
```

### WYSIWYGエディタの導入
```
npm install --save "@tinymce/tinymce-vue@^3"
```
