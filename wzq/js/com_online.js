var inturn = false;
var ingame = false;

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
	if(in_turn())
		document.getElementById('r_time').textContent = 90 + 's';
	else
		document.getElementById('b_time').textContent = 90 + 's';
	inturn = !inturn;
	wzq.countTime(90, in_turn());
    
}

var com1 = com1||{};
com1.init = function (){

	com1.nowStype= "stype";
	var stype = com1.stype[com1.nowStype];
	com1.width			=	stype.width;		//画布宽度
	com1.height			=	stype.height; 		//画布高度
	com1.spaceX			=	stype.spaceX;		//着点X跨度
	com1.spaceY			=	stype.spaceY;		//着点Y跨度
	com1.pointStartX		=	stype.pointStartX;	//第一个着点X坐标;
	com1.pointStartY		=	stype.pointStartY;	//第一个着点Y坐标;
	com1.page			=	stype.page;			//图片目录

	com1.canvas			=	document.getElementById("board"); //画布
	com1.ct				=	com1.canvas.getContext("2d") ;
	com1.canvas.width	=	com1.width;
	com1.canvas.height	=	com1.height;

	com1.childList		=	com1.childList||[];

	com1.loadImages(com1.page);					//载入图片/图片目录
	com1.restart = 0;
	com1.AIMode = false;
}
com1.stype = {
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
com1.get = function (id){
	return document.getElementById(id)
}

com1.initroom = function(){
	// com1.bg=new com1.class.Bg();
	chatbar.writeSystem("游戏开始");
	wzq.online = true;
    ingame=true;
	com1.pane=new com1.class.Pane();
	com1.pane.isShow=false;
 
	com1.childList = [com1.pane];
    play1.init();
    if(inturn == 1)
    {
        play1.my = 1;
    }
    else
    {
        play1.my = -1;
    }
	wzq.countTime(90, in_turn());
	play1.depth = 1;
	play1.arg = [
		{ random:-60, timer:100 ,pur:5 ,rank:"菜鸟水平"},
		{ random:3,  timer:300 ,pur:5,rank:"中级水平"},
		{ random:2,  timer:1000 ,pur:14,rank:"高手水平"},
	][1]

}

com1.get("restartBtn").addEventListener("click", function(e) {
	if(wzq.inmatchgame && in_game())
    {
        var ret = confirm("你确定要投降吗？");
        if(ret === true)
            ws.send("40");
    }
})

com1.close = function()
{
	wzq.inmatchgame = false;
	com1.clear();
	play1.init();
	ingame = false;
	com1.canvas.removeEventListener("click",play1.clickCanvas);
	wzq.clickWorld();
    chatbar.roomReset();
}

com1.clear = function()
{
	com1.ct.clearRect(0, 0,com1.width,com1.height);
}



com1.loadImages = function(stype){

	//棋子
	com1.AImg = new Image();
	com1.AImg.src = "images/A.png";

	com1.BImg = new Image();
	com1.BImg.src = "images/B.png";

	//棋子外框
	com1.paneImg = new Image();
	com1.paneImg.src  = "images/pane.png";

}
//显示列表
com1.show = function (){
	com1.ct.clearRect(0, 0, com1.width, com1.height);
    for (var i=0; i<com1.childList.length ; i++){
		com1.childList[i].show();
	}
}


//显示移动的棋子外框
com1.showPane  = function (x,y){
	com1.pane.isShow=true;
	com1.pane.x= x ;
	com1.pane.y= y ;
}

com1.class = com1.class || {} //类
com1.class.Man = function ( x, y ,my){
	this.x = x||0;
    this.y = y||0;
	this.mans=[];
	this.my = my || 1;

	this.show = function (){
			com1.ct.save();
			var img= my==1 ? com1.AImg :com1.BImg;
			com1.ct.drawImage(img, com1.spaceX * this.x + com1.pointStartX+10 , com1.spaceY *  this.y +com1.pointStartY+10);
			com1.ct.restore();
	}

	// this.value = function (map){
	// 	var map = map || play.map
	// 	return com1.value(this.x,this.y,map,this.my)
	// }
}
com1.class.Pane = function (img, x, y){
	this.x = x||0;
    this.y = y||0;
	this.isShow = true;

	this.show = function (){
		if (this.isShow) {
			com1.ct.drawImage(com1.paneImg, com1.spaceX * this.x + com1.pointStartX+9, com1.spaceY *  this.y + com1.pointStartY+9)
		}
	}
}

com1.enterAIMode = function()
{
    com1.AIMode = true;
    chatbar.writeSystem("进入AI模式");
}

com1.exitAIMode = function()
{
    game.AIMode = false;
    chatbar.writeSystem("退出AI模式");
}