# Web-chess

本项目是南京大学计算机科学与技术系选修课程网络应用开发技术的课程项目，项目内容为中国象棋的Web网页游戏，前端使用html5、JavaScript与css开发，后端使用php。

## Install

项目前端使用任意现代浏览器打开即可，推荐使用Edge

项目后端部署在服务器上，推荐使用Apache2

## Usage

运行项目时修改js/websocket.js中的下列代码：
>const ws = new WebSocket('ws://172.24.69.149:12345');

以及server.php中的下列代码：
>socket_bind($server, '10.0.2.15', 12345);

修改后改为
>const ws = new WebSocket('ws://server_ip:socket_port');
>socket_bind($server, 'server_ip', server_port);

修改ip(或者端口)保证客户端访问server_ip可以联络服务器。如果服务器在内网socket_bind使用服务器内网ip。

## Contributing

PRs accepted.

## License

© 2023 unknown-Tartaglia
