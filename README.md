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

# 準備中

```

### インストールと動作確認
```
$ git clone https://github.com/kaku-m/test-project-docker-ver.git
$ cd test-project-docker-ver
$ docker-compose up
```
http://192.168.33.33:8000/ にアクセス  
確認できたらターミナルでCtrl+Cを押下  

### MySQLの設定
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
https://docs.docker.jp/compose/reference/toc.html

### VMの停止
```
> vagrant suspend
```

## 参考
以下参照
https://github.com/kaku-m/test-project/blob/master/README.md#%E5%8F%82%E8%80%83
※HTTPS通信の設定は行っていません
