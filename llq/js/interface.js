var llq = llq || {};

llq.bgmSound = new Audio("./sound/bgm.mp3");
llq.bgmSound.loop = true;
llq.alertSound = new Audio("./sound/alert.mp3");
llq.eatSound = new Audio("./sound/eat.mp3");
llq.moveSound = new Audio("./sound/move.mp3");
llq.selectSound = new Audio("./sound/select.mp3");
llq.isPlayingBgm = false;
llq.online = false;
llq.inMatch = false;
llq.matchTime = 0;
llq.text = document.getElementById('text');
llq.inmatchgame=false;

llq.get = function (id){
	return document.getElementById(id)
}

llq.tipsAppear = function()
{
    document.getElementById("change").style.visibility = "visible";
}
llq.tipsDisappear = function()
{
    document.getElementById("change").style.visibility = "hidden";
}

llq.changeOnline = function(flag)
{
    llq.online = flag;
}
llq.isOnline = function()
{
    return llq.online;
}

llq.match = function()
{
    if(in_game())
    {
        alert("你已经在比赛中了！");
        return;
    }
    //console.log("start matching");
    if(llq.isOnline())
    {
        llq.inMatch = true;
        document.getElementById("matching").style.visibility = "visible";
        llq.matchTime = 0;
        ws.send("11");
        llq.timingForward();
    }
    else
        alert("无法连接到服务器！");
}

//匹配计时
llq.timingForward = function()
{
    if(!llq.inMatch)
        return;
    if(llq.matchTime < 60)
    {
        document.getElementById("timing").innerHTML = llq.matchTime + 's';
        llq.matchTime++;
        setTimeout("llq.timingForward()", 1000);
    }
    else
    {
        //自动匹配人机
        llq.cancelMatch(true);
        AI(1);
    }
}

//send {true: 主动结束匹配，通知系统 false:匹配成功，系统结束匹配，不用通知}
llq.cancelMatch = function(send)
{
    llq.inMatch = false;
    document.getElementById("matching").style.visibility = "hidden";
    if(send)
    {
        ws.send("10");
        console.log("cancel match");
    }
}

llq.matchSuccess = function()
{
    if(in_turn())
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是先手";
    else
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是后手";
    document.getElementById("matchingSuccessBar").style.visibility = "visible";
    llq.timingBackward(1);
}

llq.timingBackward = function(time)
{
    if(time > 0)
    {
        time--;
        setTimeout("llq.timingBackward(" + time + ")", 1000);
    }
    else
    {
        document.getElementById("matchingSuccessBar").style.visibility = "hidden";
        llq.inmatchgame = true;
        com1.init();
        com1.initroom();
    }
}

function AI(level)
{
    if(in_game())
    {
        alert("你已经在比赛中了！");
        return;
    }
    com.init();
	com.initroom(level);
    // AIop = true;
}

llq.AI1 = function()
{
    AI(1);
}
llq.AI2 = function()
{
    AI(2);
}
llq.AI3 = function()
{
    AI(3);
}
llq.local = function()
{
    AI(0);
}



// llq.playSound = function(str)
// {
//     console.log("play " + str);
//     if(str === 'alert')
//         llq.alertSound.play();
//     else if(str === 'eat')
//         llq.eatSound.play();
//     else if(str === 'move')
//         llq.moveSound.play();
//     else if(str === 'select')
//         llq.selectSound.play();
//     else
//         console.assert(false, "bad sound play!");
// }
llq.toggleBgm = function()
{
    llq.isPlayingBgm = !llq.isPlayingBgm;
    if(llq.isPlayingBgm)
    {
        document.getElementById("music").innerHTML = "关闭BGM";
        llq.bgmSound.play();
    }
    else
    {
        document.getElementById("music").innerHTML = "开启BGM";
        llq.bgmSound.pause();
    }
}
llq.changeVolume = function()
{
    let value = document.getElementById("volume").value;
    document.getElementById("volumeText").innerHTML = value;
    llq.bgmSound.volume = value / 100;
}


llq.clickSystem = function()
{
    chatbar.showSystem();
    chatbar.disShowRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(2);
}
llq.clickRoom = function()
{
    chatbar.disShowSystem();
    chatbar.showRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(1);
}
llq.clickWorld = function()
{
    chatbar.disShowSystem();
    chatbar.disShowRoom();
    chatbar.showWorld();
    chatbar.setSendFlag(0);
}

llq.updateOnlineNum = function(msg)
{
    let info = "建议使用最新版Edge浏览器访问 <br> 当前在线人数：" + msg + "人";
    document.getElementById("onlineNum").innerHTML = info;
}

llq.sendMessage = function()
{
    const message = llq.text.value;
	//process AI cheat Mode in system bar
	if(chatbar.sendFlag === 2)
	{
        //TODO : CHANGE
		if(message === 'AI')
		{
			if(!com1.AIMode)
				com1.enterAIMode();
			else
                chatbar.writeSystem("请勿重复开启AI模式");
			llq.text.value = '';
			return;
		}
		else if(message === 'noAI')
		{
			if(game.isInAIMode())
				game.exitAIMode();
			else
                chatbar.writeSystem("请在进入AI模式后退出AI模式");
            llq.text.value = '';
			return;
		}
        else
        {
            chatbar.writeSystem("错误指令：" + llq.text.value);
            llq.text.value = '';
            return;
        }
	}
    if(llq.isOnline())
        chatbar.sendMessage(message);
    else
    {
        alert("无法连接到服务器");
    }
}

llq.text.addEventListener("keydown", function(e){
    if(e.keyCode === 13)
    {
        llq.sendMessage();
        e.preventDefault(); // 阻止默认的回车键行为
    }
});

llq.exit = function()
{
    if(in_game())
    {
        var ret = confirm("正在游戏中，是否要退出？");
        if(ret === false)
            return;
    }
    location='../index.html';
}

llq.countTime = function(time, isMyCount)
{
    if(isMyCount !== in_turn() || !in_game())
        return;
    if(time > 0)
    {
        if(in_turn())
            document.getElementById('r_time').textContent = time + 's';
        else
            document.getElementById('b_time').textContent = time + 's';
        time--;
        setTimeout("llq.countTime(" + time + ", " + isMyCount + ")", 1000);
    }
    else
    {
        if(llq.online == true)
            ws.send("40");
        else
        {
            alert("很遗憾，你输了！");
            com.close();
        }
    }
}

llq.get("restartBtn").addEventListener("click", function(e) {
	if (!llq.inmatchgame && confirm("是否确定要投降？")){
		com.clear();
		play.init();
		ingame = false;
		com.canvas.removeEventListener("click",play.clickCanvas);
	}
    if(llq.inmatchgame && in_game())
    {
        var ret = confirm("你确定要投降吗？");
        if(ret === true)
            ws.send("40");
    }
})
