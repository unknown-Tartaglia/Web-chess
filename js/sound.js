var bgm = false;
var bgmSound = new Audio("../sound/bgm.mp3");
var alertSound = new Audio("../sound/alert.mp3");
var eatSound = new Audio("../sound/eat.mp3");
var moveSound = new Audio("../sound/move.mp3");
var selectSound = new Audio("../sound/select.mp3");

bgmSound.loop = true;

function playSound(str)
{
    if(str === 'alert')
        alertSound.play();
    else if(str === 'eat')
        eatSound.play();
    else if(str === 'move')
        moveSound.play();
    else if(str === 'select')
        selectSound.play();
    else
        console.log("bad sound play!");
}

function bgmReset()
{
    bgm = !bgm;
    if(bgm)
    {
        document.getElementById("music").innerHTML = "关闭BGM";
        bgmSound.play();
    }
    else
    {
        document.getElementById("music").innerHTML = "开启BGM";
        bgmSound.pause();
    }
}

function changeVolume()
{
    let value = document.getElementById("volume").value;
    document.getElementById("volumeText").innerHTML = value;
    bgmSound.volume = value / 100;
}