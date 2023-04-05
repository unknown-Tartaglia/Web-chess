// AI代打
var AImode = false;
// 对抗AI
var AIop = false;

function localMatch()
{
    return AIop;
}

function setAIop(flag)
{
    AIop = flag;
}

function AI(level)
{
    if(in_game())
    {
        alert("你已经在比赛中了！");
        return;
    }
    sendAIRequest(level);
}
function AI1()
{
    AI(1);
}
function AI2()
{
    AI(2);
}
function AI3()
{
    AI(3);
}
function AI4()
{
    AI(4);
}

function inAIMode()
{
    return AImode;
}

function enterAIMode()
{
    chatRoomWrite("sysinfo", '[系统]' + '进入AI模式，AI接管游戏，输入"noAI"退出AI模式', 'system');
    canvas.removeEventListener('click', clickEvent);
    AImode = true;
    if(in_turn())
    {
        AIAct('r');
    }
}

function exitAIMode()
{
    chatRoomWrite("sysinfo", '[系统]' + '退出AI模式', 'system');
    canvas.addEventListener('click', clickEvent);
    AImode = false;
}

/** 测试方法：
 *  1.点击新手普通高手大师进行人机对战
 *  2.切换系统栏输入AI可以让AI替代你与AI对战
 */


/** 执行AI行动(一步)
 *  使用chessBoard[i][j]获取(i, j)坐标的棋子信息，AI执color色
 *  发送选子坐标(x1, y1), 移动坐标(x2, y2)
 *  sendClickEvent(x1, y1);
 *  sendClickEvent(x2, y2);
 */
function AIAct(color)
{
    // TODO: 计算最佳移动
    
    // change
    /*
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(chessBoard[i][j][0] === color)
            {
                for(let k = 0; k <= 9; k++)
                    for(let l = 0; l <= 8; l++)
                    if(validate_move(i, j, k, l))
                    {
                        sleep(200).then(() => {
                            sendClickEvent(i, j);
                        })
                        sleep(1000).then(() => {
                            sendClickEvent(k, l);
                        })
                        return;
                    }
            }
    */
   while(true)
   {
        let i = random(0, 10), j = random(0, 9);
        while(chessBoard[i][j][0] != color)
        {
            i = random(0, 10), j = random(0, 9);
        }
        let list = [];

        let k, l, len, key;
        for(k = 0; k <= 9; k++)
            for(l = 0; l <= 8; l++)
                if(validate_move(i, j, k, l))
                    list.push(k, l);
        
        if(list.length === 0) continue;

        len = list.length / 2;
        key = random(0, len);
        k = list[key * 2];
        l = list[key * 2 + 1];
        
        sleep(50).then(() => {
            sendClickEvent(i, j);
        })
        sleep(100).then(() => {
            sendClickEvent(k, l);
        })
        return;
    }
}


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

//l到r随机数
function random(l, r)
{
    console.assert(l < r, "随机数保证l < r!");
    //return Math.floor(Math.random() * (r - l) + l);
    let array = new Uint32Array(1), rd = window.crypto.getRandomValues(array) % (r - l) + l;
    //console.log("random:" + rd);
    return rd;
    
}