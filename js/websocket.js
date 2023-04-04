/*function loadXMLDoc(str)
{
	var xmlhttp;
	if (window.XMLHttpRequest)
	{
		// IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		// IE6, IE5 浏览器执行代码
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			let response = xmlhttp.responseText.split(" ");
			let name =response[0], content = response[1];
			let msg = document.createElement("p");
			let anchor = document.getElementById("anchor");
			let window = document.getElementById("window");
			msg.className = "name";
			msg.innerText = name;
			window.insertBefore(msg,anchor);
			msg = document.createElement("p");
			msg.className = "content";
			msg.innerText = content;
			window.insertBefore(msg,anchor);
			window.scrollTop = window.scrollHeight;
            document.getElementById("text").value = "";
		}
	}
	xmlhttp.open("GET","chat.php?text=" + str,true);
	xmlhttp.send();
}

*/

//const ws = new WebSocket('ws://172.27.133.139:12345');
const ws = new WebSocket('ws://172.24.69.149:12345');
console.log("WebSocket request sent");

// 监听 WebSocket 的 onmessage 事件
ws.onmessage = function(event) {
	let type = event.data.slice(0, 2), msg = event.data.slice(2);
	//世界聊天
	if(type === '01')
	{
		chatRoomWrite("name", msg.split(" ")[0], 'world');
		chatRoomWrite("content", msg.split(" ")[1], 'world');
	}
	//房间聊天
	else if(type === '02')
	{
		chatRoomWrite("name", msg.split(" ")[0], 'room');
		chatRoomWrite("content", msg.split(" ")[1], 'room');
	}
	//系统消息
	else if(type === '03')
	{
		chatRoomWrite("sysinfo", '[系统]' + msg, 'system');
	}
	//更新在线人数
	else if(type === '00')
	{
		document.getElementById("onlineNum").innerHTML = "建议使用最新版Edge浏览器访问 <br> 当前在线人数：" + msg + "人";
	}
	//匹配成功
	else if(type === '10')
	{
		cancelMatch(false);
		if(msg === '0')
			set_turn(true);
		else
			set_turn(false);
		//进入房间
		initRoom();
		clickRoom();
		matchSuccess();
	}
	//对方断线，比赛终止
	else if(type === '11')
	{
		//console.log(event.data);
		alert("对方掉线，比赛已终止");
		canvasClear();
		//回到世界并关闭房间
		clickWorld();
		initRoom();
	}
	//棋子移动
	else if(type === '20')
	{
		chessMove(msg[0], msg[1], msg[2], msg[3]);
		turn_exchange();
	}
	//游戏结束
	else if(type === '21')
	{
		if(msg === '1')
			alert("你赢了！");
		else if(msg === '0')
			alert("你输了！")
		canvasClear();
		//回到世界并关闭房间
		clickWorld();
		initRoom();
	}
};

// 监听 WebSocket 的 onopen 事件
ws.onopen = function(event) {
    // WebSocket 连接建立成功，发送自己的ip
    console.log("WebSocket connection established");
	changeOnline(true);
    //ws.send(getIPAddress());
};

// 监听 WebSocket 的 onerror 事件
ws.onerror = function(event) {
    // 发生错误，可以在这里进行相应的处理
    console.log("WebSocket error:", event);
	changeOnline(false);
};

// 监听 WebSocket 的 onclose 事件
ws.onclose = function(event) {
    // WebSocket 连接关闭，可以在这里进行相应的处理
    console.log("WebSocket closed:", event);
	changeOnline(false);
};

// 获取公网ip
function getIPAddress() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ipify.org", false);
    xhr.send();
    return xhr.responseText;
}