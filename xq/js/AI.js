var AI = AI || {};

AI.AIop = false;//挑战AI
AI.totSearch = 0;
AI.hitCache = 0;
AI.missCache = 0;
AI.his = [];
AI.setDepth = 4;
AI.setSpeed = 1000;
AI.offend = 10;//先手系数
AI.defend = 7;//后手系数


AI.AI = function(level)
{
    if(game.isInGame())
    {
        alert("你已经在游戏中！")
        return;
    }
    AI.setDepth = level + 1;
    game.setTurn(true);
    game.setLocal(true);
    AI.setAIop(true);
    xq.clickSystem();
    game.start();
}

AI.setAIop = function(flag)
{
    AI.AIop = flag;
}

AI.cache = [[null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null]];


AI.AIAct = function(color)
{
    sleep(AI.setSpeed).then(()=>{
        AI._AIAct(color);
    })
}

AI._AIAct = function(color)
{
    // TODO: 计算最佳移动
    
    // change
   /*while(true)
   {
        let i = random(0, 10), j = random(0, 9);
        while(game.chessBoard[i][j][0] != color)
        {
            i = random(0, 10), j = random(0, 9);
        }
        let list = game.destinations(i, j);
        
        if(list.length === 0) continue;

        let len = list.length, key = random(0, len);
        k = list[key][0];
        l = list[key][1];
        
        sendMoveEvent(i, j, k, l);
        return;
    }*/

    AI.totSearch = 0;
    AI.hitCache = 0;
    AI.missCache = 0;
    AI.his = [];

    let myChoices = 0, opChoices = 0, opColor = color === 'r' ? 'b' : 'r';

    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        {
            this.clearCache(i, j);
            if(game.chessBoard[i][j][0] === color)
                myChoices += this.findCache(i, j).length;
            else if(game.chessBoard[i][j][0] === opColor)
                opChoices += this.findCache(i, j).length;
        }

    // if(myChoices * opChoices >= 1000) AI.setDepth = 4;
    // else AI.setDepth = 6;


    console.log('搜索深度 ' + AI.setDepth + ' 层');

    let ret = AI.gameTree(color, AI.setDepth, -5e10, 5e10);
    


    let i = ret[1][0][0], j = ret[1][0][1], k = ret[1][0][2], l = ret[1][0][3], cut = ret[2];
    sendMoveEvent(i, j, k, l);
    console.log('共计搜索 ' + AI.totSearch + ' 次');
    console.log('cache命中 ' + AI.hitCache + ' 次');
    console.log('cache失效 ' + AI.missCache + ' 次');
    console.log('剪枝比例 ' + (100 - 100 * cut).toFixed(2) + '%');
    console.log(ret[0], ret[1][0], ret[1].slice(1));
    console.assert(AI.his.length === 0, "bad history!", AI.his);
}

AI.logInfo = function(color)
{
    AI.gameTree(color, AI.setDepth, -5e10, 5e10, true);
}

//返回格式:[score, path, idx]
AI.gameTree = function(color, depth, alpha, beta, setLog)
{
    if(depth === 0)
    {
        AI.totSearch += 1;
        //返回局面评估函数
        return [AI.evalScore(color), [], 1];
    }

    //计算着法
    let trial = [];
    for(let i = 0; i <= 9; i++)
        for(let j = 0;  j <= 8; j++)
        if(game.chessBoard[i][j][0] === color)
        {
            for(let target of AI.findCache(i, j))
            {
                console.assert(target.length === 2, "cache error!");
                trial.push([i, j, target[0], target[1]]);
            }
        }
    

    //搜索
    let opColor = color === 'r' ? 'b' : 'r', idx = 0;
    let best = null;
    for(let target of trial)
    {
        let i = target[0], j = target[1], x = target[2], y = target[3];
        //console.assert(game.validateMove(i, j, x, y), "cache失败" + i + j + x + y, game.destinations(i, j));

        //绝杀
        if(game.chessBoard[x][y].length === 3 && game.chessBoard[x][y][2] === 'j')
        {
            //console.log("发现绝杀", AI.his[0], AI.his[1], AI.his[2], [i, j, x, y]);
            return [10000 * (10 ** depth), [[i, j, x, y]], idx / trial.length];
        }


        AI.his.push([i, j, x, y]);
        let tmp = game.chessBoard[x][y];
        game.chessBoard[x][y] = game.chessBoard[i][j];
        game.chessBoard[i][j] = 's';
        AI.modifyCache(i, j);
        AI.modifyCache(x, y);

        let ret = AI.gameTree(opColor, depth - 1, -5e10, -alpha);


        game.chessBoard[i][j] = game.chessBoard[x][y];
        game.chessBoard[x][y] = tmp;
        AI.modifyCache(i, j);
        AI.modifyCache(x, y);
        AI.his.pop();


        idx += ret[2];
        console.assert(ret[1] !== null, "error return value");

        let score = -ret[0];
        if(setLog && depth === AI.setDepth) console.log([i, j, x, y], ret[1], score);
        if(score > alpha)
        {
            alpha = score;
            ret[1].unshift([i, j, x, y]);
            best = ret[1];
        }
        if(score >= beta) break;
    }
    return [alpha, best, idx / trial.length];
}

AI.modifyCache = function(x, y)
{
    let i, j;
    for(i = 0; i <= 9; i++)
        this.clearCache(i, y);
    for(i = 0; i <= 8; i++)
        this.clearCache(x, i);
    
    let l0 = Math.max(x - 2, 0), r0 = Math.max(y - 2, 0);
    let l1 = Math.min(x + 2, 9), r1 = Math.min(y + 2, 8);
    for(i = l0; i <= l1; i++)
        for(j = r0; j <= r1; j++)
            this.clearCache(i, j);
}

AI.clearCache = function(i, j)
{
    AI.cache[i][j] = null;
}

AI.findCache = function(i, j, isAll)
{
    if(isAll) return game.destinations(i, j, isAll);

    if(AI.cache[i][j] === null)
    {
        AI.missCache++;
        AI.cache[i][j] = game.destinations(i, j);
    }
    else
        AI.hitCache++;

    return AI.cache[i][j];
}

AI.chessInDanger = [[null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null], 
                    [null, null, null, null, null, null, null, null, null]];

AI.evalScore = function(color, needLog)
{
    let res = 0, score1, score2, score3, score4;

    //棋子子力得分
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        {
            AI.chessInDanger[i][j] = false;
            if(game.chessBoard[i][j].length === 3)
            {
                let score = AI.getScore(i, j) * 100;
                console.assert(score !== 0, "bad score evaluation!");
                if(game.chessBoard[i][j][0] === color)
                    res += score;
                else res -= score;
            }
        }
    
    score1 = res;

    //棋子保护与压制得分
    let list = [];
    for(let i = 0; i <= 9; i++)
    for(let j = 0; j <= 8; j++)
    if(game.chessBoard[i][j].length === 3)
    {
        for(let tar of AI.findCache(i, j, true))
        {
            let x = tar[0], y = tar[1];
            if(game.chessBoard[x][y].length === 3)
            {
                list.push([i, j, x, y]);
                //吃子
                if(game.chessBoard[x][y][0] !== game.chessBoard[i][j][0])
                {
                    //将军另外考虑
                    if(game.chessBoard[x][y][2] === 'j') continue;
                    AI.chessInDanger[x][y] = true;
                    if(game.chessBoard[i][j][0] === color)
                    {
                        res += AI.getScore(x, y) * AI.offend;
                    }
                    else
                        res -= AI.getScore(x, y) * AI.defend;
                }
            }
        }
    }

    score2 = res - score1;

    for(let tar of list)
    {
        let i = tar[0], j = tar[1], x = tar[2], y = tar[3];
        //护子
        if(game.chessBoard[x][y][0] === game.chessBoard[i][j][0]);
        {
            let coe = 0.05;
            if(AI.chessInDanger[x][y]) coe = 1;
            //不用护将
            if(game.chessBoard[x][y][2] === 'j') continue;

            if(game.chessBoard[i][j][0] === color)
                res += AI.getScore(x, y) * AI.defend * coe;
            else
                res -= AI.getScore(x, y) * AI.defend * AI.defend / AI.offend * coe;
        }
    }

    score3 = res - score1 - score2;

    /*let controlScore = 0;
    //力量投送 
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        if(game.chessBoard[i][j].length === 3)
        {
            let curColor = game.chessBoard[i][j][0], score = AI.getScore(i, j);
            for(let tar of AI.findCache(i, j, true))
            {
                let x = tar[0], y = tar[1];
                
                if(curColor === 'r')
                    AI.value[x][y][0].push([score, i, j]);
                else
                    AI.value[x][y][1].push([score, i, j]);
            }
        }
    
    //分值估计
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        {
            let cur = AI.value[i][j], first = game.chessBoard[i][j][0] === 'r' ? 1 : 0;
            let curScore = 0, locate = 0, init = first;
            locate = AI.getScore(i, j);
            cur[0].sort();
            cur[1].sort();
            while(cur[first].length)
            {
                if(first === init)
                    curScore += locate;
                else
                    curScore -= locate;
                locate = cur[first][0][0];
                cur[first] = cur[first].slice(1);
                first = 1 - first;
            }
        }*/

    //棋盘空间得分
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        if(game.chessBoard[i][j].length === 3)
        {
            //忽略将的自由度
            if(game.chessBoard[i][j][2] === 'j') continue;
            if(game.chessBoard[i][j][0] === color)
                res += AI.getFreeDegree(i, j) * AI.offend;
            else
                res -= AI.getFreeDegree(i, j) * AI.defend;
        }

    score4 = res - score3 - score2 - score1;
    if(needLog) console.log(score1, score2, score3, score4);
    //console.assert(Math.abs(res) < 10000, "value evaluation error", res);
    return res;
}

AI.getScore = function(x, y)
{
    if(game.chessBoard[x][y] === 's')
        return 0;
    else
    {
        let dest = game.chessBoard[x][y][2];
        if(dest === 'c') return 9;
        else if(dest === 'p') return 4.5;
        else if(dest === 'm') return 4;
        else if(dest === 'x' || dest === 's') return 2;
        else if(dest === 'z')
        {
            if(game.chessBoard[x][y][0] === 'r' && x <= 4)
                return 2 - (Math.abs(4 - y)) / 10;
            if(game.chessBoard[x][y][0] === 'b' && x >= 5)
                return 2 - (Math.abs(4 - y)) / 10;
            return 1 - (Math.abs(4 - y)) / 10;
        }
        else if(dest === 'j') return 1000;
        else
        {
            console.assert(false, "棋盘异常");
            return 0;
        }
    }
}

AI.getFreeDegree = function(x, y)
{
    let tot = AI.findCache(x, y).length, ret;
    let base, dest = game.chessBoard[x][y][2];
    if(dest === 'c') base = game.tot_c;
    else if(dest === 'm') base = game.tot_m;
    else if(dest === 'p') base = game.tot_p;
    else if(dest === 'x') base = game.tot_x;
    else if(dest === 's') base = game.tot_s;
    else if(dest === 'z') base = game.tot_z;
    else if(dest === 'j') base = game.tot_j;
    else
    {
        console.assert(false, "棋盘异常");
        return 0;
    }
    ret = tot / base;
    console.assert(tot / base <= 1, "error free degree!", [x, y], tot, base);
    ret *= AI.getScore(x, y) * (AI.offend - AI.defend) / AI.offend / AI.offend;
    //console.log(ret);
    ret += (4 - Math.abs(x - 4)) / 40;
    return ret;
}