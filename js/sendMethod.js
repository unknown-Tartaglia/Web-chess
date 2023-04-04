var sendFlag = 0;
var chessChoose = [-1, -1];

function setSendFlag(flag)
{
	sendFlag = flag;
}

// 发送消息
function sendMessage() {
	const message = document.getElementById('text').value;
	//AI cheat Mode
	if(sendFlag === 2)
	{
		if(message === 'AI')
		{
			if(!inAIMode())
				enterAIMode();
			else
				chatRoomWrite("sysinfo", '[系统]' + '你已经开启了AI模式，请勿重复开启', 'system');
			document.getElementById('text').value = '';
			return;
		}
		else if(message === 'noAI')
		{
			if(inAIMode())
				exitAIMode();
			else
				chatRoomWrite("sysinfo", '[系统]' + '请在进入AI模式后退出AI模式', 'system');
			document.getElementById('text').value = '';
			return;
		}
	}
	ws.send('0' + sendFlag + message);
	document.getElementById('text').value = '';
}

// 发送鼠标点击事件
function sendClickEvent(x, y)
{
	if(localMatch())
	{
		if(chessChoose[0] === -1)
		{
			console.log("choose " + x + ', ' + y + '\n');
			chessChoose = [x, y];
		}
		else
		{
			if(in_turn() && validateChoose(x, y))
			{
				console.log("choose " + x + ', ' + y + '\n');
				chessChoose = [x, y];
				return;
			}
			if(!validate_move(chessChoose[0], chessChoose[1], x, y))
			{
				chessChoose = [-1, -1];
				return;
			}
			if(chessBoard[x][y] === 'r_j')
			{
				alert("你输了");
				canvasClear();
				return;
			}
			else if(chessBoard[x][y] === 'b_j')
			{
				alert("你赢了");
				canvasClear();
				return;
			}
			console.log("move " + x + ', ' + y + '\n');
			chessMove(chessChoose[0], chessChoose[1], x, y);
			chessChoose = [-1, -1];
			turn_exchange();
			//AI回合
			if(!in_turn())
				AIAct('b');
		}
		return;
	}
	ws.send('20' + x + y);
	console.log("send" + x + ", " + y);
}

// 发送AI请求
function sendAIRequest(level)
{
	// TODO: remote version

	// TODO: local version
	initRoom();
	gameStart();
	set_turn(true);
}