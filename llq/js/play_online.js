var play1 = play1||{};

play1.init = function (){
	
	// play1.my				=	1;				//玩家方	
	play1.nowManKey		=	false;			//现在要操作的棋子
	play1.pace 			=	[];				//记录每一步
	play1.isplay1 		=	true ;			//是否能走棋
	play1.bylaw 			= 	com1.bylaw;
	play1.show 			= 	com1.show;
	play1.showPane 		= 	com1.showPane;
	// play1.isOffensive	=	true;					//是否先手
	play1.depth			=	play1.depth || 2;		//搜索深度
	play1.random			=	play1.random || 2;		//评估的时候随机值大小	
	// play1.isOffense		=	play1.isOffense || true; //玩家先手还是后手
	play1.regretCount	=	3;
	play1.times = 0;
	play1.optimes = 0;
	play1.isFoul			=	false;	//是否犯规
	
	com1.pane.isShow		=	false;			//隐藏方块
	com1.childList.length		=	1		//删掉所有棋子显示
	play1.opx= 0;
	play1.opy= 0;
	
	//初始化棋盘
	play1.map =	(function(){
        var arr=[]
            for (var i=0; i<15; i++){
                arr[i]=[];
                for (var n=0; n<15; n++){
                    arr[i][n]=0
            }
        }
        return arr;
    })();
	
	play1.show();
	//绑定点击事件
	com1.canvas.addEventListener("click",play1.clickCanvas)	
}



//点击着点
play1.clickPoint = function (x,y,color){

	play1.map[y][x] = color;  //地图上加入该棋子
	play1.pace.push([x,y])		//棋谱上加入
	if(color!=play1.my)
		com1.showPane (x , y)
	var man = new com1.class.Man(x,y,color)
	com1.childList.push(man)
	com1.show();
	if(color==-1)
		var msg = "black("+x+","+y+")";
	if(color==1)
		var msg = "white("+x+","+y+")";
	chatbar.writeSystem(msg);

}

//点击棋盘事件
play1.clickCanvas = function (e){
	if (!inturn) return false;
	if(com1.AIMode)
	{
		console.log("aiai");
		var pace;
		pace=AImode( play1.map, play1.depth, -play1.my, play1.opx, play1.opy , play1.arg)
		play1.clickPoint(pace.x,pace.y,play1.my);
		ws.send('20' + pace.x + ' '+ pace.y);
		console.log("send" + x + ", " + y);
		pace=AImode( play1.map, play1.depth, -play1.my, play1.opx, play1.opy , play1.arg)
		play1.clickPoint(pace.x,pace.y,play1.my);
		ws.send('20' + pace.x + ' '+ pace.y);
		turn_exchange();
	}
	else
	{
		var point = play1.getClickPoint(e);
		var x = point.x;
		var y = point.y;
		// console.log(x,y);
		// com1.get("clickAudio").play1();
		if (!play1.map[y][x]){
			play1.times--;
			play1.clickPoint(x,y,play1.my);
			ws.send('20' + x + ' '+ y);
			console.log("send" + x + ", " + y);
		}
		if(play1.times==0)
		{
			turn_exchange();
			play1.times = 2;
		}
	}
}



//获得点击的着点
play1.getClickPoint = function (e){
	var domXY = play1.getDomXY(com1.canvas);
	var x=Math.round((e.pageX-domXY.x-com1.pointStartX-30)/com1.spaceX)
	var y=Math.round((e.pageY-domXY.y-com1.pointStartY-30)/com1.spaceY)
	if (x > 14) x = 14;
	if (y > 14) y = 14;
	if (x < 0) x = 0;
	if (y < 0 ) y = 0;

	return {"x":x,"y":y}
}

//获取元素距离页面左侧的距离
play1.getDomXY = function (dom){
	var left = dom.offsetLeft;
	var top = dom.offsetTop;
	var current = dom.offsetParent;
	while (current !== null){
		left += current.offsetLeft;
		top += current.offsetTop;
		current = current.offsetParent;
	}
	return {x:left,y:top};
}

