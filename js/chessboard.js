var cb = cb || {};

cb.init = function()
{
    cb.canvas = document.getElementById("board");
    cb.canvas.width = 455;
    cb.canvas.height = 565;
    cb.ctx = cb.canvas.getContext("2d");
    cb.images = ["r_c", "r_m", "r_p", "r_s", "r_x", "r_j", "r_z",
                "b_c", "b_m", "b_p", "b_s", "b_x", "b_j", "b_z",
                "r_box", "dot"];
    cb.preLoadedimages = {};
    cb.lastR_box = null;
    cb.chosen = null;
    //预加载图片
    cb.preLoadImages(cb.images);
}

cb.preLoadImages = function(images)
{
    let loadedCount = 0;
    const totalCount = images.length;

    function imageLoaded() {
        loadedCount++;
        if (loadedCount === totalCount) {
            console.log("图片加载成功");
        }
    }

    for (let i = 0; i < totalCount; i++) {
        const image = new Image();
        image.src = "./images/" + images[i] + ".png";
        cb.preLoadedimages[images[i]] = image;
        image.onload = imageLoaded;
    }
}

cb.clear = function()
{
    cb.ctx.clearRect(0, 0, cb.canvas.width, cb.canvas.height);
}

cb.chessClear = function(row, col)
{
    cb.ctx.clearRect(pos_x(col), pos_y(row), 52, 52);
}

cb.loadAllChess = function()
{
    cb.clear();
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
        {
            if(game.chessBoard[i][j].length === 1) continue;
            cb.draw(game.chessBoard[i][j], i, j);
        }
}

cb.load = function()
{
    cb.loadAllChess();
    cb.canvas.addEventListener('click', cb.clickEvent);
}

cb.disload = function()
{
    cb.clear();
    cb.canvas.removeEventListener('click', cb.clickEvent);
}

cb.draw = function(image, line, col)
{
    if(image === "dot") cb.drawDot(image, line, col);
    else cb.drawChess(image, line, col);
}

cb.drawDot = function(image, line, col)
{
    let img = cb.preLoadedimages[image];
    let x = pos_x(col) + 16 + col, y = pos_y(line) + 20;
    cb.ctx.drawImage(img, x, y, 13, 13);
    //console.log("draw " + cb[line][col]);
}

cb.drawChess = function(image, line, col)
{
    let img = cb.preLoadedimages[image];
    let x = pos_x(col), y = pos_y(line);
    cb.ctx.drawImage(img, x, y, 52, 52);
    //console.log("draw " + cb[line][col]);
}

cb.drawMove = function(x, y, row, col)
{
    // 清除上一次的move痕迹
    if(cb.lastR_box !== null)
    {
        let x0 = cb.lastR_box[0], y0 = cb.lastR_box[1];
        let row0 = cb.lastR_box[2], col0 = cb.lastR_box[3];
        cb.chessClear(x0, y0);
        cb.chessClear(row0, col0);
        // 恢复棋子
        if(game.chessBoard[x0][y0].length === 3)
            cb.draw(game.chessBoard[x0][y0], x0, y0);
        if(game.chessBoard[row0][col0].length === 3)
            cb.draw(game.chessBoard[row0][col0], row0, col0);
    }

    cb.chessClear(x, y);
    cb.chessClear(row, col);
    cb.draw(game.chessBoard[x][y], row, col);

    cb.lastR_box = [x, y, row, col];
    cb.draw("r_box", x, y);
    cb.draw("r_box", row, col);
}

cb.showTips = function(row, col)
{
    list = game.destinations(row, col);
    for(let tar of list)
    {
        let x = tar[0], y = tar[1];
        if(game.chessBoard[x][y] === 's')
        {
            game.chessBoard[x][y] = 't';
            cb.draw("dot", x, y);
        }
    }
}

cb.clearTips = function()
{
    for(let i = 0; i <= 9; i++)
        for(let j = 0; j <= 8; j++)
            if(game.chessBoard[i][j] === 't')
            {
                game.chessBoard[i][j] = 's';
                cb.chessClear(i, j);
            }
}

cb.clickEvent = function(e)
{
    let row = parseInt((e.layerY - 86) / 50), col = parseInt((e.layerX - 10) / 48);

    //console.log(row, col, e.layerX, e.layerY);
    if(distance(e.layerX, e.layerY, row, col) < 24)
    {
        console.log("点击" + game.chessBoard[row][col]);
        //选子
        if(cb.chosen === null)
        {
            if(game.validateChoose(row, col))
            {
                xq.playSound('select');
                cb.chosen = [row, col];
                cb.showTips(row, col);
            }
        }
        else
        {
            //重新选子
            if(game.validateChoose(row, col))
            {   
                xq.playSound('select');
                cb.chosen = [row, col];
                cb.clearTips();
                cb.showTips(row, col);
            }
            //移动
            else
            {
                cb.clearTips();
                let x = cb.chosen[0], y = cb.chosen[1];
                if(game.validateMove(x, y, row ,col))
                    sendMoveEvent(x, y, row, col);
                else
                    console.log("非法落子", x, y, row, col);
                cb.chosen = null;
            }
        }
    }
}

cb.init();