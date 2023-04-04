function clickSystem()
{
    document.getElementById('system').style.background = 'white';
    document.getElementById('world').style.background = 'gray';
    document.getElementById('room').style.background = 'gray';
    document.getElementById('systemwindow').style.visibility = 'visible';
    document.getElementById('worldwindow').style.visibility = 'hidden';
    document.getElementById('roomwindow').style.visibility = 'hidden';
    setSendFlag(2);
}

function clickWorld()
{
    document.getElementById('system').style.background = 'gray';
    document.getElementById('world').style.background = 'white';
    document.getElementById('room').style.background = 'gray';
    document.getElementById('systemwindow').style.visibility = 'hidden';
    document.getElementById('worldwindow').style.visibility = 'visible';
    document.getElementById('roomwindow').style.visibility = 'hidden';
    setSendFlag(0);
}

function clickRoom()
{
    document.getElementById('system').style.background = 'gray';
    document.getElementById('world').style.background = 'gray';
    document.getElementById('room').style.background = 'white';
    document.getElementById('systemwindow').style.visibility = 'hidden';
    document.getElementById('worldwindow').style.visibility = 'hidden';
    document.getElementById('roomwindow').style.visibility = 'visible';
    setSendFlag(1);
}

//关闭房间
function initRoom()
{
    document.getElementById('roomwindow').innerHTML = '<h2 class="chatbartitle"> 房间频道 </h2>';
}

function chatRoomWrite(className, str, pos)
{
    const window = document.getElementById(pos + 'window');
    window.innerHTML += '<p class="' + className + '">' + str + '</p>';
    window.scrollTop = window.scrollHeight;
}