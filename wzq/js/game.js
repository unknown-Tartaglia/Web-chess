var game = game || {};

game.chessBoard =  [[null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null]];
game.chess_m = [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0], [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]];
game.chess_x = [[2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1]];
game.chess_s = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
game.chess_j = [[1, 0], [-1, 0], [0, 1], [0, -1]];
game.chess_z = [[-1, 0], [0, 1], [0, -1]];
game.tot_m = 8;
game.tot_x = 4;
game.tot_s = 4;
game.tot_j = 5;
game.tot_z = 3;
game.tot_c = 17;
game.tot_p = 17;
game.steps = [];

game.isPlaying = false;
game.isMyTurn = false;
game.localPlay = true;
game.AIMode = false;

game.enterAIMode = function()
{
    game.AIMode = true;
    chatbar.writeSystem("进入AI模式");
    if(game.isInTurn())
        AI.AIAct('r');
}

game.exitAIMode = function()
{
    game.AIMode = false;
    chatbar.writeSystem("退出AI模式");
}

game.checkMate = function()
{
    // 红色方
    let r_j = null;
    for(let i = 7; i <= 9; i++)
        for(let j = 3; j <= 5; j++)
            if(game.chessBoard[i][j] === 'r_j')
                r_j = [i, j];
    
    console.assert(r_j !== null, "红帅不存在");
    
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(game.chessBoard[i][j][0] === 'b')
            {
                if(game.validateMove(i , j, r_j[0], r_j[1]))
                    return true;
            }
    
    // 黑色方
    let b_j = null;
    for(let i = 0; i <= 2; i++)
        for(let j = 3; j <= 5; j++)
            if(game.chessBoard[i][j] === 'b_j')
                b_j = [i, j];
    
    console.assert(b_j !== null, "黑将不存在");
    
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(game.chessBoard[i][j][0] === 'r')
            {
                if(game.validateMove(i, j, b_j[0], b_j[1]))
                    return true;
            }

    return false;
}

game.isInAIMode = function()
{
    return game.AIMode;
}

game.isLocal = function()
{
    return game.localPlay;
}

game.setLocal = function(flag)
{
    game.localPlay = flag;
}

game.isInGame = function()
{
    return game.isPlaying;
}

game.isInTurn = function()
{
    return game.isMyTurn;
}

game.setTurn = function(turn)
{
    game.isMyTurn = turn;
}

game.exchangeTurn = function()
{
    game.isMyTurn = !game.isMyTurn;
    if(game.checkMate())
        xq.playSound('alert');

    if(game.isInTurn() && game.isInAIMode())
        AI.AIAct('r');
}

game.start = function()
{
    game.isPlaying = true;
    game.steps = [];
    game.initChessBoard();
    cb.load();
    chatbar.writeSystem("游戏开始");
    if(game.isInTurn() && game.isInAIMode())
        AI.AIAct('r');
}

game.initChessBoard = function()
{
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            game.chessBoard[i][j] = initChessBoard[i][j];
}

game.stop = function()
{
    game.isPlaying = false;
    cb.disload();
    //回到世界并关闭房间
    xq.clickWorld();
    chatbar.roomReset();
}

game.validateChoose = function(x, y)
{
    let color = game.chessBoard[x][y][0];
    if(game.isInTurn() && color === "r") return true;
    if(AI.AIop === false && !game.isInTurn() && color === 'b') return true;
    return false;
}

//返回(x, y)处棋子可到达的位置列表,isAll => true: 包括敌方友方位置; false: 仅敌方
game.destinations = function(x, y, isAll)
{
    if(game.chessBoard[x][y].length === 1) return [];
    let color = game.chessBoard[x][y][0];
    let chess = game.chessBoard[x][y][2];
    let dest = [];

    if(isAll) color = 'a';//it's tricky, please be careful.

    // 车，炮
    if(chess === 'c' || chess === 'p')
    {
        //下
        let i = x + 1;
        while(i <= 9 && game.chessBoard[i][y] === 's')
        {
            dest.push([i, y]);
            i++;
        }
        if(chess === 'p')
        {
            i++;
            while(i <= 9 && game.chessBoard[i][y] === 's') i++;
            if(i <= 9 && game.chessBoard[i][y][0] !== color) dest.push([i, y]);
        }
        else if(i <= 9 && game.chessBoard[i][y][0] !== color)
            dest.push([i, y]);

        //上
        i = x - 1;
        while(i >= 0 && game.chessBoard[i][y] === 's')
        {
            dest.push([i, y]);
            i--;
        }
        if(chess === 'p')
        {
            i--;
            while(i >= 0 && game.chessBoard[i][y] === 's') i--;
            if(i >= 0 && game.chessBoard[i][y][0] !== color) dest.push([i, y]);
        }
        else if(i >= 0 && game.chessBoard[i][y][0] !== color)
            dest.push([i, y]);

        //右
        i = y + 1;
        while(i <= 8 && game.chessBoard[x][i] === 's')
        {
            dest.push([x, i]);
            i++;
        }
        if(chess === 'p')
        {
            i++;
            while(i <= 8 && game.chessBoard[x][i] === 's') i++;
            if(i <= 8 && game.chessBoard[x][i][0] !== color) dest.push([x, i]);
        }
        else if(i <= 8 && game.chessBoard[x][i][0] !== color)
            dest.push([x, i]);


        //左
        i = y - 1;
        while(i >= 0 && game.chessBoard[x][i] === 's')
        {
            dest.push([x, i]);
            i--;
        }
        if(chess === 'p')
        {
            i--;
            while(i >= 0 && game.chessBoard[x][i] === 's') i--;
            if(i >= 0 && game.chessBoard[x][i][0] !== color) dest.push([x, i]);
        }
        else if(i >= 0 && game.chessBoard[x][i][0] !== color)
            dest.push([x, i]);
    }
    // 马
    else if(chess === 'm')
    {
        for(let i = 0; i < 8; i++)
        {
            let row = x + game.chess_m[i][0], col = y + game.chess_m[i][1], block_x = x + game.chess_m[i][2], block_y = y + game.chess_m[i][3];
            if(row >= 0 && row <= 9 && col >= 0 && col <= 8 && game.chessBoard[row][col][0] !== color && game.chessBoard[block_x][block_y] === 's')
                dest.push([row, col]);
        }
    }
    // 象
    else if(chess === 'x')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + game.chess_x[i][0], col = y + game.chess_x[i][1], block_x = x + game.chess_x[i][2], block_y = y + game.chess_x[i][3];
            if(x + row !== 10 && x + row !== 8 && row >= 0 && row <= 9 && col >= 0 && col <= 8 && game.chessBoard[row][col][0] !== color && game.chessBoard[block_x][block_y] === 's')
                dest.push([row, col]);
        }
    }
    // 士
    else if(chess === 's')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + game.chess_s[i][0], col = y + game.chess_s[i][1];
            if(row + x !== 5 && row + x !== 13 && row >= 0 && row <= 9 && col >= 3 && col <= 5 && game.chessBoard[row][col][0] !== color)
                dest.push([row, col]);
        }
    }
    // 将
    else if(chess === 'j')
    {
        for(let i = 0; i < 4; i++)
        {
            let row = x + game.chess_j[i][0], col = y + game.chess_j[i][1];
            if(row + x !== 5 && row + x !== 13 && row >= 0 && row <= 9 && col >= 3 && col <= 5 && game.chessBoard[row][col][0] !== color)
                dest.push([row, col]);
        }
        let i = x - 1;
        while(i >= 0 && game.chessBoard[i][y] === 's') i--;
        if(i >= 0 && game.chessBoard[i][y].length === 3 && game.chessBoard[i][y][2] === 'j') dest.push([i, y]);
        i = x + 1;
        while(i <= 9 && game.chessBoard[i][y] === 's') i++;
        if(i <= 9 && game.chessBoard[i][y].length === 3 && game.chessBoard[i][y][2] === 'j') dest.push([i, y]);
    }
    // 卒
    else if(chess === 'z')
    {
        // 没过河
        if(x >= 5 && game.chessBoard[x][y][0] === 'r' || x <= 4 && game.chessBoard[x][y][0] === 'b')
        {
            if(x >= 5)
            {
                if(x >= 1 && game.chessBoard[x - 1][y][0] !== color)
                    dest.push([x - 1, y]);
            }
            else
            {
                if(x <= 8 && game.chessBoard[x + 1][y][0] != color)
                    dest.push([x + 1, y]);
            }
        }
        // 过河
        else
        {
            if(game.chessBoard[x][y][0] === 'r')
            {
                for(let i = 0; i < 3; i++)
                {
                    let row = x + game.chess_z[i][0], col = y + game.chess_z[i][1];
                    if(row >= 0 && col >= 0 && col <= 8 && game.chessBoard[row][col] !== color)
                        dest.push([row, col]);
                }
            }
            else
            {
                for(let i = 0; i < 3; i++)
                {
                    let row = x - game.chess_z[i][0], col = y + game.chess_z[i][1];
                    if(row <= 9 && col >= 0 && col <= 8 && game.chessBoard[row][col] !== color)
                        dest.push([row, col]);
                }
            }
        }
    }
    return dest;
}

game.validateMove = function(x, y, row, col)
{
    let list = game.destinations(x, y);
    for(let tar of list)
    {
        if(tar[0] === row && tar[1] === col)
            return true;
    }
    return false;
}

game.chessMove = function(x, y, row, col)
{
    cb.drawMove(x, y, row, col);

    let color0 = game.chessBoard[x][y][0], color1 = game.chessBoard[row][col][0];

    if(color1 !== 's')
        xq.playSound('eat');
    else
        xq.playSound('move');
    
    game.chessBoard[row][col] = game.chessBoard[x][y];
    game.chessBoard[x][y] = "s";

    game.steps.push([color0, x, y, row, col]);
}