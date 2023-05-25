//初始棋盘
initChessBoard = [
    ["b_c", "b_m", "b_x", "b_s", "b_j", "b_s", "b_x", "b_m", "b_c"],
    ["s", "s", "s", "s", "s", "s", "s", "s", "s"],
    ["s", "b_p", "s", "s", "s", "s", "s", "b_p", "s"],
    ["b_z", "s", "b_z", "s", "b_z", "s", "b_z", "s", "b_z"],
    ["s", "s", "s", "s", "s", "s", "s", "s", "s"],
    ["s", "s", "s", "s", "s", "s", "s", "s", "s"],
    ["r_z", "s", "r_z", "s", "r_z", "s", "r_z", "s", "r_z"],
    ["s", "r_p", "s", "s", "s", "s", "s", "r_p", "s"],
    ["s", "s", "s", "s", "s", "s", "s", "s", "s"],
    ["r_c", "r_m", "r_x", "r_s", "r_j", "r_s", "r_x", "r_m", "r_c"]
];

function pos_x(column)
{
    return column * 48 + 10;
}

function pos_y(row)
{
    return row * 50 + 68;
}

function distance(x, y, row, col)
{
    rx = col * 48 + 38;
    ry = row * 50 + 110;
    dis2 = (rx - x) * (rx - x) + (ry - y) * (ry - y);
    return Math.sqrt(dis2);
}

//非阻塞的执行任务
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

//l到r随机数
function random(l, r)
{
    console.assert(l < r, "使用随机数请保证l < r!");
    let array = new Uint32Array(1), rd = window.crypto.getRandomValues(array) % (r - l) + l;
    //console.log("random:" + rd);
    return rd;
}

function sendMoveEvent(x, y, row, col)
{
	if(game.isLocal())
	{
        let msg = "(" + x + "," + y + ") -> (" + row + "," + col +")";
        if(game.chessBoard[row][col] === 'r_j')
        {
            game.chessMove(x, y, row, col);
            chatbar.writeSystem(msg);
            sleep(200).then(()=>{
                alert("你输了");
                game.stop();
            })
        }
        else if(game.chessBoard[row][col] === 'b_j')
        {
            game.chessMove(x, y, row, col);
            chatbar.writeSystem(msg);
            sleep(200).then(()=>{
                alert("你赢了");
                game.stop();
            })
        }
        else
        {
            if(game.validateMove(x, y, row, col))
            {
                game.chessMove(x, y, row, col);
                chatbar.writeSystem(msg);
                game.exchangeTurn();
                if(!game.isInTurn())
                {
                    if(AI.AIop)
                        AI.AIAct('b');
                }

            }
            else console.assert(false, "bad move request!");
        }
	}
	else
	{
		ws.send("20" + x + y + row + col);
		//setTimeout('ws.send("20" + ' + row + col + ')', 10);
	}
}