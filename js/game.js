var startStateChessBoard = [
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

var chessBoard = [
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

var canvas=document.getElementById("board");
canvas.width = 455;
canvas.height = 565;
var ctx=canvas.getContext("2d");
/**
 * state flag
 */
var inturn = false;
var ingame = false;
var chosen = null;
var chess_m = [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0], [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]];
var chess_x = [[2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1]];
var chess_s = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
var chess_j = [[1, 0], [-1, 0], [0, 1], [0, -1]];
var chess_z = [[-1, 0], [0, 1], [0, -1]];
var last_move_from = null;
var last_move_to = null;

function in_game()
{
    return ingame;
}

function in_turn()
{
    return inturn;
}

function set_turn(flag)
{
    inturn = flag;
}

function turn_exchange()
{
    inturn = !inturn;
    if(inturn == true)
    {
        console.log("inturn!");
        if(inAIMode())
			AIAct('r');
    }
}

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

// 绘图
function draw(image, line, col, size = 52)
{
    let img = new Image();
    img.src = "../images/" + image + ".png";
    // 防止图片未加载出来导致显示失败
    img.onload = function()
    {
        let x = pos_x(col) + (52 - size) / 2, y = pos_y(line) + (52 - size) / 2, offset = 1;
        if(size !== 52) x += offset * (col - 4);
        ctx.drawImage(img, x, y, size, size);
    }
    //console.log("draw " + chessBoard[line][col]);
}

function chessClear(row, col)
{
    ctx.clearRect(pos_x(col), pos_y(row), 52, 52);
}

// 移动正确性校验
function validate_move(x, y, row, col)
{
    let color = chessBoard[x][y][0];
    let chess = chessBoard[x][y][2];
    let start, end, cnt, block_x, block_y;

    // 判断是否吃自己的子
    if(color === chessBoard[row][col][0])
        return false;

    // 车
    if(chess === 'c')
    {
        if(x == row)
        {
            start = Math.min(y, col) + 1;
            end = Math.max(y, col) - 1;
            cnt = 0;
            for(start; start <= end; start++)
                if(chessBoard[x][start] !== 's')
                    cnt++;
            if(cnt == 0)
                return true;
        }
        else if(y == col)
        {
            start = Math.min(x, row) + 1;
            end = Math.max(x, row) - 1;
            cnt = 0;
            for(start; start <= end; start++)
                if(chessBoard[start][y] !== 's')
                    cnt++;
            if(cnt == 0)
                return true;
        }
    }
    // 马
    else if(chess === 'm')
    {
        // 别马腿
        block_x = (x + row) / 2;
        block_y = (y + col) / 2;
        if(Math.floor(block_x) != block_x) block_x = x;
        if(Math.floor(block_y) != block_y) block_y = y;
        if(Math.abs(x - row) + Math.abs(y - col) == 3 && (Math.abs(x - row) == 1 || Math.abs(x - row) == 2) && chessBoard[block_x][block_y] === 's')
            return true;
    }
    // 象
    else if(chess === 'x')
    {
        //别象腿
        block_x = (x + row) / 2;
        block_y = (y + col) / 2;
        if(Math.abs(x- row) == 2 && Math.abs(y - col) == 2 && x + row != 10 && x + row != 8 && chessBoard[block_x][block_y] === 's')
            return true;
    }
    // 士
    else if(chess === 's')
    {
        if(Math.abs(x - row) == 1 && Math.abs(y - col) == 1 && col >= 3 && col <= 5 && (row <= 2 || row >= 7))
            return true;
    }
    // 将
    else if(chess === 'j')
    {
        if(Math.abs(x - row) + Math.abs(y - col) == 1 && col >= 3 && col <= 5 && (row <= 2 || row >= 7))
            return true;
        // 飞将
        if(y == col && chessBoard[row][col][2] === 'j')
        {
            start = Math.min(x, row) + 1;
            end = Math.max(x, row) - 1;
            cnt = 0;
            for(start; start <= end; start++)
                if(chessBoard[start][y] !== 's')
                    cnt++;
            if(cnt == 0)
                return true;
        }
    }
    // 炮
    else if(chess === 'p')
    {
        if(x == row)
        {
            start = Math.min(y, col) + 1;
            end = Math.max(y, col) - 1;
            cnt = 0;
            for(start; start <= end; start++)
                if(chessBoard[x][start] !== 's')
                    cnt++;
            if(cnt == 0 && chessBoard[row][col] === 's'|| cnt == 1 && chessBoard[row][col] !== 's')
                return true;
        }
        else if(y == col)
        {
            start = Math.min(x, row) + 1;
            end = Math.max(x, row) - 1;
            cnt = 0;
            for(start; start <= end; start++)
                if(chessBoard[start][y] !== 's')
                    cnt++;
            if(cnt == 0 && chessBoard[row][col] === 's'|| cnt == 1 && chessBoard[row][col] !== 's')
                return true;
        }
    }
    // 卒
    else if(chess === 'z')
    {
        // 没过河
        if(color === 'r' && x >= 5 || color === 'b' && x <= 4)
        {
            if(y == col)
            {
                // 不能向后
                if(color === 'r' && x - row == 1)
                    return true;
                else if(color === 'b' && row - x == 1)
                    return true;
            }
        }
        // 过河
        else
        {
            if(Math.abs(x - row) + Math.abs(y - col) === 1)
            {
                // 不能向后
                if(color === 'b' && x - row != 1)
                    return true;
                else if(color === 'r' && row - x != 1)
                    return true;
            }
        }
    }
    return false;
}

function chessMove(x, y, row, col)
{
    // 清除上一次的move痕迹
    if(last_move_from !== null && last_move_to !== null)
    {
        chessClear(last_move_from[0], last_move_from[1]);
        chessClear(last_move_to[0], last_move_to[1]);
        // 恢复棋子
        if(chessBoard[last_move_from[0]][last_move_from[1]][0] === 'b' || chessBoard[last_move_from[0]][last_move_from[1]][0] === 'r')
            draw(chessBoard[last_move_from[0]][last_move_from[1]], last_move_from[0], last_move_from[1]);
        if(chessBoard[last_move_to[0]][last_move_to[1]][0] === 'b' || chessBoard[last_move_to[0]][last_move_to[1]][0] === 'r')
            draw(chessBoard[last_move_to[0]][last_move_to[1]], last_move_to[0], last_move_to[1]);
    }

    if(chessBoard[row][col][0] === 'b')
        playSound('eat');
    else
        playSound('move');
    
    chessClear(x, y);
    draw(chessBoard[x][y], row, col);
    chessBoard[row][col] = chessBoard[x][y];
    chessBoard[x][y] = "s";
    last_move_from = x + '' + y;
    last_move_to = row + '' + col;
    draw("r_box", x, y);
    draw("r_box", row, col);

    //将军
	if(checkmate())
	{
		playSound('alert');
	}
}

// 检测将军
function checkmate($room)
{
    // 红色方
    let r_j = null;
    for(let i = 7; i <= 9; i++)
        for(let j = 3; j <= 5; j++)
            if(chessBoard[i][j] === 'r_j')
                r_j = i + '' + j;
    
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(chessBoard[i][j][0] === 'b')
            {
                if(validate_move(i , j, parseInt(r_j[0]), parseInt(r_j[1])))
                    return true;
            }
    
    // 黑色方
    let b_j = null;
    for(let i = 0; i <= 2; i++)
        for(let j = 3; j <= 5; j++)
            if(chessBoard[i][j] === 'b_j')
                b_j = i + '' + j;
    
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(chessBoard[i][j][0] === 'r')
            {
                if(validate_move(i, j, parseInt(b_j[0]), parseInt(b_j[1])))
                    return true;
            }

    return false;
}

function validateChoose(x, y)
{
    let chess = chessBoard[x][y];
    if(chess[0] === "r")
        return true;
    return false;
}

function chooseEvent(x, y)
{
    let chess = chessBoard[x][y][2];
    // 车，炮提示
    if(chess === 'c' || chess === 'p')
    {
        let i = x + 1;
        while(i <= 9 && chessBoard[i][y] === 's')
        {
            chessBoard[i][y] = 't';
            draw("dot", i, y, 13);
            i++;
        }
        i = x - 1;
        while(i >= 0 && chessBoard[i][y] === 's')
        {
            chessBoard[i][y] = 't';
            draw("dot", i, y, 13);
            i--;
        }
        i = y + 1;
        while(i <= 8 && chessBoard[x][i] === 's')
        {
            chessBoard[x][i] = 't';
            draw("dot", x, i, 13);
            i++;
        }
        i = y - 1;
        while(i >= 0 && chessBoard[x][i] === 's')
        {
            chessBoard[x][i] = 't';
            draw("dot", x, i, 13);
            i--;
        }
    }
    // 马提示
    else if(chess === 'm')
    {
        for(let i = 0; i < 8; i++)
        {
            let row = x + chess_m[i][0], col = y + chess_m[i][1], block_x = x + chess_m[i][2], block_y = y + chess_m[i][3];
            if(row >= 0 && row <= 9 && col >= 0 && col <= 8 && chessBoard[row][col] === 's' && chessBoard[block_x][block_y] === 's')
            {
                chessBoard[row][col] = 't';
                draw("dot", row, col, 13);
            }
        }
    }
    // 象提示
    else if(chess === 'x')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + chess_x[i][0], col = y + chess_x[i][1], block_x = x + chess_x[i][2], block_y = y + chess_x[i][3];
            if(row >= 5 && row <= 9 && col >= 0 && col <= 8 && chessBoard[row][col] === 's' && chessBoard[block_x][block_y] === 's')
            {
                chessBoard[row][col] = 't';
                draw("dot", row, col, 13);
            }
        }
    }
    // 士
    else if(chess === 's')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + chess_s[i][0], col = y + chess_s[i][1];
            if(row >= 7 && row <= 9 && col >= 3 && col <= 5 && chessBoard[row][col] === 's')
            {
                chessBoard[row][col] = 't';
                draw("dot", row, col, 13);
            }
        }
    }
    // 将
    else if(chess === 'j')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + chess_j[i][0], col = y + chess_j[i][1];
            if(row >= 7 && row <= 9 && col >= 3 && col <= 5 && chessBoard[row][col] === 's')
            {
                chessBoard[row][col] = 't';
                draw("dot", row, col, 13);
            }
        }
    }
    // 卒
    else if(chess === 'z')
    {
        // 没过河
        if(x >= 5)
        {
            if(chessBoard[x - 1][y] === 's')
            {
                chessBoard[x - 1][y] = 't';
                draw("dot", x - 1, y, 13);
            }
        }
        // 过河
        else
        {
            for(let i = 0; i < 3; i++)
            {
                let row = x + chess_z[i][0], col = y + chess_z[i][1];
                if(row >= 0 && col >= 0 && col <= 8 && chessBoard[row][col] === 's')
                {
                    chessBoard[row][col] = 't';
                    draw("dot", row, col, 13);
                }
            }
        }
    }
}

function clearTips()
{
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(chessBoard[i][j] === 't')
            {
                chessBoard[i][j] = 's';
                chessClear(i, j);
            }

}

function clickEvent(e)
{
    let row = parseInt((e.layerY - 86) / 50), col = parseInt((e.layerX - 10) / 48);

    //console.log(row, col, e.layerX, e.layerY);
    if(distance(e.layerX, e.layerY, row, col) < 24)
    {
        console.log("点击" + chessBoard[row][col]);
        if(inturn)
        {
            //选子
            if(chosen === null)
            {
                if(validateChoose(row, col))
                {
                    playSound('select');
                    chosen = row + '' + col;
                    chooseEvent(row, col);
                    sendClickEvent(row, col);
                }
            }
            else
            {
                //重新选子
                if(validateChoose(row, col))
                {   
                    playSound('select');
                    clearTips();
                    chosen = row + '' + col;
                    chooseEvent(row, col);
                    sendClickEvent(row, col);
                }
                //移动
                else
                {
                    chosen = null;
                    if(chessBoard[row][col] === 't' || chessBoard[row][col][0] === 'b')
                    {
                        clearTips();
                        sendClickEvent(row, col);
                    }
                    else clearTips();
                }
            }
                
        }
    }
}

function canvasClear()
{
    ingame = false;
    setAIop(false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(!inAIMode())
        canvas.removeEventListener('click', clickEvent);
}

function gameStart()
{
    //console.log("start");
    last_move_from = null;
    last_move_to = null;
    chosen = null;
    ingame = true;
    initChessBoard();
    //the first step in game
    if(inturn)
    {
        console.log("inturn!");
        if(inAIMode())
			AIAct('r');
    }
}

function initChessBoard()
{
    for(let i = 0; i < 10; i++)
        for(let j = 0; j < 9; j++)
        {
            chessBoard[i][j] = startStateChessBoard[i][j];
            //绘制
            if(chessBoard[i][j] === "s") continue;
            draw(chessBoard[i][j], i, j);
        }
    //console.log("draw job done");
    if(!inAIMode())
        canvas.addEventListener('click', clickEvent);
}