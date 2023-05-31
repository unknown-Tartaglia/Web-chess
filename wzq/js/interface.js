var wzq = wzq || {};

wzq.bgmSound = new Audio("./sound/bgm.mp3");
wzq.bgmSound.loop = true;
wzq.alertSound = new Audio("./sound/alert.mp3");
wzq.eatSound = new Audio("./sound/eat.mp3");
wzq.moveSound = new Audio("./sound/move.mp3");
wzq.selectSound = new Audio("./sound/select.mp3");
wzq.isPlayingBgm = false;
wzq.online = false;
wzq.inMatch = false;
wzq.matchTime = 0;
wzq.text = document.getElementById('text');


wzq.tipsAppear = function()
{
    document.getElementById("change").style.visibility = "visible";
}
wzq.tipsDisappear = function()
{
    document.getElementById("change").style.visibility = "hidden";
}

wzq.changeOnline = function(flag)
{
    wzq.online = flag;
}
wzq.isOnline = function()
{
    return wzq.online;
}

wzq.match = function()
{
    if(in_game())
    {
        alert("你已经在比赛中了！");
        return;
    }
    //console.log("start matching");
    if(wzq.isOnline())
    {
        wzq.inMatch = true;
        document.getElementById("matching").style.visibility = "visible";
        wzq.matchTime = 0;
        ws.send("11");
        wzq.timingForward();
    }
    else
        alert("无法连接到服务器！");
}

//匹配计时
wzq.timingForward = function()
{
    if(!wzq.inMatch)
        return;
    if(wzq.matchTime < 60)
    {
        document.getElementById("timing").innerHTML = wzq.matchTime + 's';
        wzq.matchTime++;
        setTimeout("wzq.timingForward()", 1000);
    }
    else
    {
        //自动匹配人机
        wzq.cancelMatch(true);
        AI(1);
    }
}

//send {true: 主动结束匹配，通知系统 false:匹配成功，系统结束匹配，不用通知}
wzq.cancelMatch = function(send)
{
    wzq.inMatch = false;
    document.getElementById("matching").style.visibility = "hidden";
    if(send)
    {
        ws.send("10");
        console.log("cancel match");
    }
}

wzq.matchSuccess = function()
{
    if(in_turn())
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是先手";
    else
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是后手";
    document.getElementById("matchingSuccessBar").style.visibility = "visible";
    wzq.timingBackward(1);
}

wzq.timingBackward = function(time)
{
    if(time > 0)
    {
        time--;
        setTimeout("wzq.timingBackward(" + time + ")", 1000);
    }
    else
    {
        document.getElementById("matchingSuccessBar").style.visibility = "hidden";
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

wzq.AI1 = function()
{
    AI(1);
}
wzq.AI2 = function()
{
    AI(2);
}
wzq.AI3 = function()
{
    AI(3);
}
wzq.local = function()
{
    AI(0);
}



// wzq.playSound = function(str)
// {
//     console.log("play " + str);
//     if(str === 'alert')
//         wzq.alertSound.play();
//     else if(str === 'eat')
//         wzq.eatSound.play();
//     else if(str === 'move')
//         wzq.moveSound.play();
//     else if(str === 'select')
//         wzq.selectSound.play();
//     else
//         console.assert(false, "bad sound play!");
// }
wzq.toggleBgm = function()
{
    wzq.isPlayingBgm = !wzq.isPlayingBgm;
    if(wzq.isPlayingBgm)
    {
        document.getElementById("music").innerHTML = "关闭BGM";
        wzq.bgmSound.play();
    }
    else
    {
        document.getElementById("music").innerHTML = "开启BGM";
        wzq.bgmSound.pause();
    }
}
wzq.changeVolume = function()
{
    let value = document.getElementById("volume").value;
    document.getElementById("volumeText").innerHTML = value;
    wzq.bgmSound.volume = value / 100;
}


wzq.clickSystem = function()
{
    chatbar.showSystem();
    chatbar.disShowRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(2);
}
wzq.clickRoom = function()
{
    chatbar.disShowSystem();
    chatbar.showRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(1);
}
wzq.clickWorld = function()
{
    chatbar.disShowSystem();
    chatbar.disShowRoom();
    chatbar.showWorld();
    chatbar.setSendFlag(0);
}

wzq.updateOnlineNum = function(msg)
{
    let info = "建议使用最新版Edge浏览器访问 <br> 当前在线人数：" + msg + "人";
    document.getElementById("onlineNum").innerHTML = info;
}

wzq.sendMessage = function()
{
    const message = wzq.text.value;
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
			wzq.text.value = '';
			return;
		}
		else if(message === 'noAI')
		{
			if(game.isInAIMode())
				game.exitAIMode();
			else
                chatbar.writeSystem("请在进入AI模式后退出AI模式");
            wzq.text.value = '';
			return;
		}
        else
        {
            chatbar.writeSystem("错误指令：" + wzq.text.value);
            wzq.text.value = '';
            return;
        }
	}
    if(wzq.isOnline())
        chatbar.sendMessage(message);
    else
    {
        alert("无法连接到服务器");
    }
}

wzq.text.addEventListener("keydown", function(e){
    if(e.keyCode === 13)
    {
        wzq.sendMessage();
        e.preventDefault(); // 阻止默认的回车键行为
    }
});

wzq.exit = function()
{
    if(in_game())
    {
        var ret = confirm("正在游戏中，是否要退出？");
        if(ret === false)
            return;
    }
    location='../index.html';
}

wzq.countTime = function(time, isMyCount)
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
        setTimeout("wzq.countTime(" + time + ", " + isMyCount + ")", 1000);
    }
    else
    {
        //TODO:超时
        if(wzq.online == true)
            ws.send("40");
        else
        {
            alert("很遗憾，你输了！");
            com.close();
        }
    }
}