/**实现匹配界面动态变化 */
var inMatch, time, online = false;
function onlineState()
{
    return online;
}

function changeOnline(state)
{
    online = state;
}

function match()
{
    if(in_game())
    {
        alert("你已经在比赛中了！");
        return;
    }
    //console.log("start matching");
    if(online)
    {
        inMatch = true;
        document.getElementById("matching").style.visibility = "visible";
        time = 0;
        ws.send("11");
        timingForward();
    }
    else
        alert("无法连接到服务器！");
}

//send {true: 主动结束匹配，通知系统 false:匹配成功，系统结束匹配，不用通知}
function cancelMatch(send)
{
    inMatch = false;
    document.getElementById("matching").style.visibility = "hidden";
    if(send)
    {
        ws.send("10");
        console.log("cancel match");
    }
}

function matchSuccess()
{
    if(in_turn())
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是先手";
    else
        document.getElementById("matchSuccess").innerHTML = "匹配成功 <br> 你是后手";
    chatRoomWrite("sysinfo", '[系统]游戏开始', 'system');
    document.getElementById("matchingSuccessBar").style.visibility = "visible";
    timingBackward(1);
}

//匹配计时
function timingForward()
{
    if(!inMatch)
        return;
    if(time < 100)
    {
        document.getElementById("timing").innerHTML = time + 's';
        time++;
        setTimeout("timingForward()", 1000);
    }
    else
    {
        //TODO:自动匹配人机
    }
}

//倒计时，结束开始游戏
function timingBackward(time)
{
    if(time > 0)
    {
        time--;
        setTimeout("timingBackward(" + time + ")", 1000);
    }
    else
    {
        document.getElementById("matchingSuccessBar").style.visibility = "hidden";
        gameStart();
    }
}

/**实现匹配界面动态变化 */

/**实现允许拖拽匹配界面 */
var isMouseDown, initX, initY;

matching.addEventListener('mousedown', function(e) {
    isMouseDown = true;
    document.body.classList.add('no-select');
    initX = e.offsetX;
    initY = e.offsetY;
})

document.addEventListener('mousemove', function(e) {
  if (isMouseDown) {
    let left = e.clientX - initX;
    let top = e.clientY - initY;
    if(left > 972) left = 972;
    else if(left < 0) left = 0;
    if(top > 529) top = 529;
    else if(top < 0) top = 0;
    matching.style.left = left + 'px';
    matching.style.top = top + 'px';
  }
})

matching.addEventListener('mouseup', function() {
  isMouseDown = false;
  document.body.classList.remove('no-select');
})

/**实现允许拖拽匹配界面 */