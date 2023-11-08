# nju网络应用开发课程设计

本项目是南京大学计算机科学与技术系选修课程网络应用开发技术的课程项目，项目内容为Web网页棋类游戏，前端使用html5、JavaScript与css开发，后端使用php。

## Install

项目前端使用任意现代浏览器打开即可，推荐使用Edge

项目后端部署在服务器上，推荐使用Apache2

## Usage

运行项目时修改项目主目录的config.js使得ip_addr指向服务器

> ip_addr = "xxx"

象棋、五子棋、连六棋默认使用端口12345、12346、12347

同时后台创建数据库chess,并且创建数据表user、xqRanking、wzqRanking、llqRanking、record

表段结构如下

```
//user
+-----+----------+----------+
| uid | username | password |
+-----+----------+----------+
//xxRanking
+----------+-------+------+-------+
| username | score | wins | loses |
+----------+-------+------+-------+
//record
+----+--------+--------+-----------+
| id | user1  | user2  | type      |
+----+--------+--------+-----------+
```

其中uid和id为自增表段，id用作最近战绩倒计索引，uid暂无用处

启动服务器在主目录执行`./start_all.sh`即可

关闭服务器执行`./stop_all.sh`

## Contributing

PRs accepted.

## License

© 2023 unknown-Tartaglia
