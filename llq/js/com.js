var com = com||{};
var inturn = false;
com.init = function (){
	com.local = 0;
	com.nowStype= "stype";
	var stype = com.stype[com.nowStype];
	com.width			=	stype.width;		//画布宽度
	com.height			=	stype.height; 		//画布高度
	com.spaceX			=	stype.spaceX;		//着点X跨度
	com.spaceY			=	stype.spaceY;		//着点Y跨度
	com.pointStartX		=	stype.pointStartX;	//第一个着点X坐标;
	com.pointStartY		=	stype.pointStartY;	//第一个着点Y坐标;
	com.page			=	stype.page;			//图片目录

	com.canvas			=	document.getElementById("board"); //画布
	com.ct				=	com.canvas.getContext("2d") ;
	com.canvas.width	=	com.width;
	com.canvas.height	=	com.height;

	com.childList		=	com.childList||[];

	com.loadImages(com.page);					//载入图片/图片目录
	com.restart = 0;
}
com.stype = {
	stype:{
		width:620,			//画布宽度
		height:570, 		//画布高度
		spaceX:36,			//着点X跨度
		spaceY:36,			//着点Y跨度
		pointStartX:26,		//第一个着点X坐标;
		pointStartY:2,		//第一个着点Y坐标;
		page:"stype"		//图片目录
	}
}

//获取ID
com.get = function (id){
	return document.getElementById(id)
}

com.initroom = function(level){
    chatbar.writeSystem("游戏开始");
	if(level == 0)
		com.local = 1;
	ingame = true;
	com.pane=new com.class.Pane();
	com.pane.isShow=false;
	console.log(com.local);
	com.childList = [com.pane];
	// com.bg.show();
	if(level>0)
	{
		var val = level;
		play.depth = 1;
		play.arg = [
			{ random:-60, timer:100 ,pur:5 ,rank:"菜鸟水平"},
			{ random:3,  timer:300 ,pur:5,rank:"中级水平"},
			{ random:2,  timer:1000 ,pur:14,rank:"高手水平"},
		][val-1]
	}
    play.init();
	inturn = true;
	llq.countTime(90, in_turn());
	com.get("regretBtn").addEventListener("click", function(e) {
		play.regret();
	})
}


com.close = function()
{
	com.clear();
	play.init();
	ingame = false;
	com.canvas.removeEventListener("click",play.clickCanvas);
    llq.clickWorld();
    chatbar.roomReset();
}

com.clear = function()
{
	com.local = 0;
	com.ct.clearRect(0, 0,com.width,com.height );
}



com.loadImages = function(stype){

	//棋子
	com.AImg = new Image();
	com.AImg.src = "images/A.png";

	com.BImg = new Image();
	com.BImg.src = "images/B.png";

	//棋子外框
	com.paneImg = new Image();
	com.paneImg.src  = "images/pane.png";

}
//显示列表
com.show = function (){
	com.ct.clearRect(0, 0, com.width, com.height);
    for (var i=0; i<com.childList.length ; i++){
		com.childList[i].show();
	}
}


//显示移动的棋子外框
com.showPane  = function (x,y){
	com.pane.isShow=true;
	com.pane.x= x ;
	com.pane.y= y ;
}

com.class = com.class || {} //类
com.class.Man = function ( x, y ,my ,isOffense){
	this.x = x||0;
    this.y = y||0;
	this.mans=[];
	this.my = my || 1;
	this.show = function (){
			com.ct.save();
			var img= (isOffense) ? com.AImg :com.BImg;
			com.ct.drawImage(img, com.spaceX * this.x + com.pointStartX+10 , com.spaceY *  this.y +com.pointStartY+10);
			com.ct.restore();
	}

	// this.value = function (map){
	// 	var map = map || play.map
	// 	return com.value(this.x,this.y,map,this.my)
	// }
}
com.class.Pane = function (img, x, y){
	this.x = x||0;
    this.y = y||0;
	this.isShow = true;

	this.show = function (){
		if (this.isShow) {
			com.ct.drawImage(com.paneImg, com.spaceX * this.x + com.pointStartX+9, com.spaceY *  this.y + com.pointStartY+9)
		}
	}
}

