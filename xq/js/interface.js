var xq = xq || {};

xq.bgmSound = new Audio("./sound/bgm.mp3");
xq.bgmSound.loop = true;
xq.alertSound = new Audio("./sound/alert.mp3");
xq.eatSound = new Audio("./sound/eat.mp3");
xq.moveSound = new Audio("./sound/move.mp3");
xq.selectSound = new Audio("./sound/select.mp3");
xq.isPlayingBgm = false;
xq.online = false;
xq.inMatch = false;
xq.matchTime = 0;
xq.text = document.getElementById('text');


xq.tipsAppear = function()
{
    document.getElementById("change").style.visibility = "visible";
}
xq.tipsDisappear = function()
{
    document.getElementById("change").style.visibility = "hidden";
}

xq.changeOnline = function(flag)
{
    xq.online = flag;
}
xq.isOnline = function()
{
    return xq.online;
}

xq.match = function()
{
    if(game.isInGame())
    {
        alert("你已经在比赛中了！");
        return;
    }
    //console.log("start matching");
    if(xq.isOnline())
    {
        xq.inMatch = true;
        document.getElementById("matching").style.visibility = "visible";
        xq.matchTime = 0;
        ws.send("11");
        xq.timingForward();
    }
    else
        alert("无法连接到服务器！");
}

//匹配计时
xq.timingForward = function()
{
    if(!xq.inMatch)
        return;
    if(xq.matchTime < 60)
    {
        document.getElementById("timing").innerHTML = xq.matchTime + 's';
        xq.matchTime++;
        setTimeout("xq.timingForward()", 1000);
    }
    else
    {
        //自动匹配人机
        xq.cancelMatch(true);
        AI.AI(1);
    }
}

//send {true: 主动结束匹配，通知系统 false:匹配成功，系统结束匹配，不用通知}
xq.cancelMatch = function(send)
{
    xq.inMatch = false;
    document.getElementById("matching").style.visibility = "hidden";
    if(send)
    {
        ws.send("10");
        console.log("cancel match");
    }
}

xq.matchSuccess = function()
{
    if(game.isInTurn())
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是先手";
    else
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是后手";
    document.getElementById("matchingSuccessBar").style.visibility = "visible";
    xq.timingBackward(1);
}

xq.timingBackward = function(time)
{
    if(time > 0)
    {
        time--;
        setTimeout("xq.timingBackward(" + time + ")", 1000);
    }
    else
    {
        document.getElementById("matchingSuccessBar").style.visibility = "hidden";
        game.setLocal(false);
        xq.clickRoom();
        game.start();
    }
}

xq.AI1 = function()
{
    AI.AI(1);
}
xq.AI2 = function()
{
    AI.AI(2);
}
xq.AI3 = function()
{
    AI.AI(3);
}
xq.local = function()
{
    if(game.isInGame())
    {
        alert("你已经在游戏中！")
        return;
    }
    game.setLocal(true);
    game.setTurn(true);
    AI.setAIop(false);
    xq.clickSystem();
    game.start();
}
xq.regret = function()
{
    if(!game.isInGame())
    {
        alert("你只能在游戏中悔棋！");
        return;
    }
    if(game.isLocal())
    {
        if(AI.AIop)
        {
            if(!game.isInTurn())
            {
                alert("你只能在你的回合悔棋！");
                return;
            }
            else
                game.steps.pop();
        }
        game.steps.pop();

        cb.clear();

        for(let i = 0; i <= 9; i++)
            for(let j = 0; j <= 8; j++)
            {
                game.chessBoard[i][j] = initChessBoard[i][j];
                AI.clearCache(i, j);
            }
        for(let step of game.steps)
        {
            let i = step[1], j = step[2], x = step[3], y = step[4];
            game.chessBoard[x][y] = game.chessBoard[i][j];
            game.chessBoard[i][j] = 's';
        }

        cb.loadAllChess();
        if(game.steps.length)
        {
            let lastStep = game.steps.pop();
            let i = lastStep[1], j = lastStep[2], x = lastStep[3], y = lastStep[4];
            cb.draw('r_box', i, j);
            cb.draw('r_box', x, y);
            cb.lastR_box = [i, j, x, y];
            game.steps.push(lastStep);
        }

        if(game.steps.length % 2 === 0) game.setTurn(true);
        else game.setTurn(false);
    }
    else
        alert("联机模式暂不支持悔棋！");
}

xq.exit = function()
{
    if(game.isInGame())
    {
        var ret = confirm("正在游戏中，是否要退出？");
        if(ret === false)
            return;
    }
    location='../index.html';
}


xq.playSound = function(str)
{
    console.log("play " + str);
    if(str === 'alert')
        xq.alertSound.play();
    else if(str === 'eat')
        xq.eatSound.play();
    else if(str === 'move')
        xq.moveSound.play();
    else if(str === 'select')
        xq.selectSound.play();
    else
        console.assert(false, "bad sound play!");
}
xq.toggleBgm = function()
{
    xq.isPlayingBgm = !xq.isPlayingBgm;
    if(xq.isPlayingBgm)
    {
        document.getElementById("music").innerHTML = "关闭BGM";
        xq.bgmSound.play();
    }
    else
    {
        document.getElementById("music").innerHTML = "开启BGM";
        xq.bgmSound.pause();
    }
}
xq.changeVolume = function()
{
    let value = document.getElementById("volume").value;
    document.getElementById("volumeText").innerHTML = value;
    xq.bgmSound.volume = value / 100;
}


xq.clickSystem = function()
{
    chatbar.showSystem();
    chatbar.disShowRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(2);
}
xq.clickRoom = function()
{
    chatbar.disShowSystem();
    chatbar.showRoom();
    chatbar.disShowWorld();
    chatbar.setSendFlag(1);
}
xq.clickWorld = function()
{
    chatbar.disShowSystem();
    chatbar.disShowRoom();
    chatbar.showWorld();
    chatbar.setSendFlag(0);
}

xq.updateOnlineNum = function(msg)
{
    let info = "建议使用最新版Edge浏览器访问 <br> 当前在线人数：" + msg + "人";
    document.getElementById("onlineNum").innerHTML = info;
}

xq.sendMessage = function()
{
    const message = xq.text.value;
	//process AI cheat Mode in system bar
	if(chatbar.sendFlag === 2)
	{
        //TODO : CHANGE
		if(message === 'AI')
		{
			if(!game.isInAIMode())
				game.enterAIMode();
			else
                chatbar.writeSystem("请勿重复开启AI模式");
			xq.text.value = '';
			return;
		}
		else if(message === 'noAI')
		{
			if(game.isInAIMode())
				game.exitAIMode();
			else
                chatbar.writeSystem("请在进入AI模式后退出AI模式");
            xq.text.value = '';
			return;
		}
        else
        {
            chatbar.writeSystem("错误指令：" + xq.text.value);
            xq.text.value = '';
            return;
        }
	}
    if(xq.isOnline())
        chatbar.sendMessage(message);
    else
    {
        alert("无法连接到服务器");
    }
}

xq.text.addEventListener("keydown", function(e){
    if(e.keyCode === 13)
    {
        xq.sendMessage();
        e.preventDefault(); // 阻止默认的回车键行为
    }
});