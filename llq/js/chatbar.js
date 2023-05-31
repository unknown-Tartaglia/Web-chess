var chatbar = chatbar || {};

chatbar.sendFlag = 0;//0:世界频道, 1:房间频道, 2:系统频道


chatbar.showSystem = function()
{
    document.getElementById('system').style.background = 'white';
    document.getElementById('systemwindow').style.visibility = 'visible';
}
chatbar.disShowSystem =  function()
{
    document.getElementById('system').style.background = 'gray';
    document.getElementById('systemwindow').style.visibility = 'hidden';
}
chatbar.showRoom = function()
{
    document.getElementById('room').style.background = 'white';
    document.getElementById('roomwindow').style.visibility = 'visible';
}
chatbar.disShowRoom = function()
{
    document.getElementById('room').style.background = 'gray';
    document.getElementById('roomwindow').style.visibility = 'hidden';
}
chatbar.showWorld = function()
{
    document.getElementById('world').style.background = 'white';
    document.getElementById('worldwindow').style.visibility = 'visible';
}
chatbar.disShowWorld = function()
{
    document.getElementById('world').style.background = 'gray';
    document.getElementById('worldwindow').style.visibility = 'hidden';
}


//重置私聊
chatbar.roomReset = function()
{
    document.getElementById('roomwindow').innerHTML = '<h2 class="chatbartitle"> 房间频道 </h2>';
}


chatbar._Write = function(className, str, pos)
{
    const window = document.getElementById(pos + 'window');
    window.innerHTML += '<p class="' + className + '">' + str + '</p>';
    window.scrollTop = window.scrollHeight;
}
chatbar.writeSystem = function(str)
{
    this._Write("sysinfo", '[系统]' + str, "system");
}
chatbar.writeRoomName = function(str)
{
    this._Write("name", str, "room");
}
chatbar.writeRoomContent = function(str)
{
    this._Write("content", str, "room");
}
chatbar.writeWorldName = function(str)
{
    this._Write("name", str, "world");
}
chatbar.writeWorldContent = function(str)
{
    this._Write("content", str, "world");
}

chatbar.setSendFlag = function(flag)
{
    chatbar.sendFlag = flag;
}
chatbar.getSendFlag = function()
{
    return chatbar.sendFlag;
}
chatbar.sendMessage = function(str)
{
    ws.send("0" + chatbar.sendFlag + str);
    llq.text.value = '';
}

//chatbar.init();