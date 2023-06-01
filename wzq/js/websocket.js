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

// const ws = new WebSocket('ws://192.168.43.221:12346');
const ws = new WebSocket('ws://' + ip_addr + ':12346');
console.log("WebSocket request sent");

// 监听 WebSocket 的 onmessage 事件
ws.onmessage = function(event) {
	let type = event.data.slice(0, 2), msg = event.data.slice(2);
	//世界聊天
	if(type === '01')
	{
        let name = msg.split(" ")[0], content = msg.split(" ")[1];
        chatbar.writeWorldName(name);
        chatbar.writeWorldContent(content);
	}
	//房间聊天
	else if(type === '02')
	{
        let name = msg.split(" ")[0], content = msg.split(" ")[1];
		chatbar.writeRoomName(name);
        chatbar.writeRoomContent(content);
	}
	//系统消息
	else if(type === '03')
	{
		chatbar.writeSystem(msg);
	}
	//更新在线人数
	else if(type === '00')
	{
		wzq.updateOnlineNum(msg);
	}
	//匹配成功
	else if(type === '10')
	{
		wzq.cancelMatch(false);
		if(msg[0] === '0')
			set_turn(true);
		else
			set_turn(false);
		document.getElementById('b_usr').textContent = msg.slice(1);
		wzq.matchSuccess();
		//进入房间
		/*initRoom();
		clickRoom();
		matchSuccess();*/
	}
	//对方断线，比赛终止
	else if(type === '11')
	{
		//console.log(event.data);
		alert("对方掉线，比赛已终止");
		com1.close();
		//回到世界并关闭房间
	}
	//棋子移动
	else if(type === '20')
	{
        let color = -play1.my
		play1.clickPoint(msg.split(" ")[0], msg.split(" ")[1], color);
		let x = msg.split(" ")[0];
		let y = msg.split(" ")[1];
		play1.opx = x;
		play1.opy = y;
		turn_exchange();
	}
	//游戏结束
	else if(type === '21')
	{
		if(msg[0] === '1')
		{
			if(msg.length === 1)
				alert("你赢了！");
			else
				alert("对方投降，你赢了！");
		}
		else if(msg[0] === '0')
			alert("你输了！")
		com1.close();
		//回到世界并关闭房间
	}
};

// 监听 WebSocket 的 onopen 事件
ws.onopen = function(event) {
    // WebSocket 连接建立成功，发送自己的ip
    console.log("WebSocket connection established");

	function getCookieValue(cookieName)
    {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++)
        {
            var cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName + '='))
                return cookie.substring(cookieName.length + 1);
        }
        return null;
    }

	ws.send("30" + getCookieValue('username'));
	wzq.changeOnline(true);
    //ws.send(getIPAddress());
};

// 监听 WebSocket 的 onerror 事件
ws.onerror = function(event) {
    // 发生错误，可以在这里进行相应的处理
    console.log("WebSocket error:", event);
	wzq.changeOnline(false);
};

// 监听 WebSocket 的 onclose 事件
ws.onclose = function(event) {
    // WebSocket 连接关闭，可以在这里进行相应的处理
    console.log("WebSocket closed:", event);
	wzq.changeOnline(false);
};

// 获取公网ip
function getIPAddress() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ipify.org", false);
    xhr.send();
    return xhr.responseText;
}