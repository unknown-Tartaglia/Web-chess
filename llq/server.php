<?php

/*
header("Content-Type:text/html;charset=utf-8");
$ip=$_SERVER['REMOTE_ADDR'];
$text=$_GET["text"];
$response="$ip $text";
echo $response;

*/

require '/var/www/html/db/login_db_connect.php';


// 握手
function handshaking($newClient, $line){
    $headers = array();
    $lines = preg_split("/\r\n/", $line);
    foreach($lines as $line)
    {
        $line = chop($line);
        if(preg_match('/\A(\S+): (.*)\z/', $line, $matches))
        {
            $headers[$matches[1]] = $matches[2];
        }
    }
    $secKey = $headers['Sec-WebSocket-Key'];
    $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
    $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "WebSocket-Origin: 0.0.0.0\r\n" .
        "WebSocket-Location: ws://0.0.0.0:12345/server.php\r\n".
        "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
    socket_write($newClient, $upgrade, strlen($upgrade));
}

// 对要发送的内容进行栈帧封装
function frame($s) {
    $a = str_split($s, 125);
    if (count($a) == 1) {
        return "\x81" . chr(strlen($a[0])) . $a[0];
    }
    $ns = "";
    foreach ($a as $o) {
        $ns .= "\x81" . chr(strlen($o)) . $o;
    }
    return $ns;
}

// 解码客户端发送的内容
function decode($buffer){
    $len = $masks = $data = $decoded = null;
    $len = ord($buffer[1]) & 127;
    if ($len === 126)  {
        $masks = substr($buffer, 4, 4);
        $data = substr($buffer, 8);
    } else if ($len === 127)  {
        $masks = substr($buffer, 10, 4);
        $data = substr($buffer, 14);
    } else  {
        $masks = substr($buffer, 2, 4);
        $data = substr($buffer, 6);
    }
    for ($index = 0; $index < strlen($data); $index++) {
        $decoded .= $data[$index] ^ $masks[$index % 4];
    }
    return $decoded;
}

// 识别关闭帧
function isCloseFrame($data) {
    $length = strlen($data);

    if ($length < 2) {
        return false;
    }

    // 获取关闭码
    $closeCode = unpack('n', substr($data, 0, 2))[1];

    // 关闭码 1000-1011 是正常的关闭
    if (($closeCode >= 1000 && $closeCode <= 1011) || $closeCode === 3000 || $closeCode === 4000) {
        return true;
    }

    return false;
}

// 更新在线人数
function updateOnlineNum($clients)
{
    $num = count($clients);
    foreach ($clients as $client) {
        socket_write($client['socket'], frame("00$num"));
    }
}

function checkwin($room)
{
    // 检查水平方向
    for ($i = 0; $i < 15; $i++) {
        for ($j = 0; $j <= 9; $j++) {
            $sum = 0;
            for ($k = 0; $k < 6; $k++) {
                $sum += $room['chess_board'][$i][$j + $k];
            }
            if ($sum === 6 || $sum === -6) {
                return true;
            }
        }
    }
    // 检查垂直方向
    for ($i = 0; $i <= 9; $i++) {
        for ($j = 0; $j < 15; $j++) {
            $sum = 0;
            for ($k = 0; $k < 6; $k++) {
                $sum += $room['chess_board'][$i + $k][$j];
            }
            if ($sum === 6 || $sum === -6) {
                return true;
            }
        }
    }

    // 检查主对角线方向
    for ($i = 0; $i <= 9; $i++) {
        for ($j = 0; $j <= 9; $j++) {
            $sum = 0;
            for ($k = 0; $k < 6; $k++) {
                $sum += $room['chess_board'][$i + $k][$j + $k];
            }
            if ($sum === 6 || $sum === -6) {
                return true;
            }
        }
    }

    // 检查副对角线方向
    for ($i = 0; $i <= 9; $i++) {
        for ($j = 5; $j < 15; $j++) {
            $sum = 0;
            for ($k = 0; $k < 6; $k++) {
                $sum += $room['chess_board'][$i + $k][$j - $k];
            }
            if ($sum === 6 || $sum === -6) {
                return true;
            }
        }
    }
    return false;
}


// 发送移动信号
function send_move_msg($x, $y, $row, $col, $room)
{
    $player = $room['turn'];
    $op_player = substr($player, 0, 6) . (3 - $player[6]);
    //socket_write($room[$player]['socket'], frame("20$x$y$row$col"));
    socket_write($room['player1']['socket'], frame("20$x$y$row$col"));
    $op_x = 9 - $x;
    $op_y = 8 - $y;
    $op_row = 9 - $row;
    $op_col = 8 - $col;
    //socket_write($room[$op_player]['socket'], frame("20$op_x$op_y$op_row$op_col"));
    socket_write($room['player2']['socket'], frame("20$op_x$op_y$op_row$op_col"));
}

//胜利
function game_over(&$cur_client, &$room, &$room_list, &$r_key, $giveup)
{
    global $con;
    echo "{$cur_client['name']} win!\n";
    $winner = "";
    $loser = "";

    if($cur_client === $room['player1'])
    {
        if($giveup)
            socket_write($room['player1']['socket'], frame("21" . '11'));
        else
            socket_write($room['player1']['socket'], frame("21" . '1'));

        socket_write($room['player2']['socket'], frame("21" . '0'));
        $winner = $room['player1']['name'];
        $loser = $room['player2']['name'];
    }
    else
    {
        if($giveup)
        {
            socket_write($room['player1']['socket'], frame("21" . '01'));
            socket_write($room['player2']['socket'], frame("21" . '11'));
        }
        else
        {
            socket_write($room['player1']['socket'], frame("21" . '0'));
            socket_write($room['player2']['socket'], frame("21" . '1'));
        }
        $winner = $room['player2']['name'];
        $loser = $room['player1']['name'];
    }
    //存战绩
    $sql = "insert into record (user1, user2, type) values ('$winner', '$loser', '连六棋')";
    $con->query($sql);
    $sql = "update llqRanking set score=score+20, wins=wins+1 where username='$winner'";
    $con->query($sql);
    $sql = "update llqRanking set score=score-20, loses=loses+1 where username='$loser'";
    $con->query($sql);
    echo "disband room{$room['room_id']}: {{$room['player1']['name']}, {$room['player2']['name']}}\n";
    unset($room_list[$r_key]);
}

// 创建WebSocket服务器
$server = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($server, SOL_SOCKET, SO_REUSEADDR, 1);
socket_bind($server, '10.0.2.15', 12347);
socket_listen($server);

$wuziBoard = [];
for($i=0;$i<15;$i++)
{
    $wuziBoard[$i] = array_fill(0,15,0);
}


// 客户端列表
$clients = [];
$waiting_list = null;
$room_list = [];

// 客户端ID
$room_id = 0;
$online_num = 0;

$log_user_list = true;

echo "启动成功\n";


while (true) {
    $read = [$server];
    $write = null;
    $except = null;

    // 从所有客户端和服务器读取数据
    if($log_user_list) echo "user list : { ";
    foreach ($clients as $client) {
        $read[] = $client['socket'];
        if($log_user_list && isset($client['name'])) echo "{$client['name']} ";
    }
    if($log_user_list) echo "}\n";
    $log_user_list = false;
    unset($client);

    socket_select($read, $write, $except, null);

    foreach ($read as $socket) {
        //echo "processing $socket\n";
        if ($socket === $server) {
            // 新客户端连接
            $new_client = socket_accept($server);
            $clients[] = [
                'socket' => $new_client,
            ];

            $online_num++;

            $data = socket_read($new_client, 1024);
            handshaking($new_client, $data);
            updateOnlineNum($clients);
        } else {
            // 客户端发送数据
            $bytes = socket_recv($socket, $data, 1024, MSG_DONTWAIT);
            assert($bytes);
            $data = decode($data);
            if (isCloseFrame($data)) {
                // 客户端断开连接

                
                foreach ($clients as $key => $client)
                if($client['socket'] === $socket)
                {
                    echo "Client {{$client['socket']} : {$client['name']}} disconnected.\n";
                    // 取消匹配
                    if($waiting_list !== null && $waiting_list['socket'] === $socket)
                    {
                        echo "{$waiting_list['name']} cancel match\n";
                        $waiting_list = null;
                    }

                    // 比赛断连
                    foreach($room_list as $room_key => $room)
                    {
                        if($room['player1'] === $client)
                        {
                            echo "{$room['player1']['socket']}";
                            socket_write($room['player2']['socket'], frame("11"));
                            echo "room{$room['room_id']} disbanded\n";
                            unset($room_list[$room_key]);
                            break;
                        }
                        else if($room['player2'] === $client)
                        {
                            echo "{$room['player1']['socket']}";
                            socket_write($room['player1']['socket'], frame("11"));
                            echo "room{$room['room_id']} disbanded\n";
                            unset($room_list[$room_key]);
                            break;
                        }
                    }

                    unset($clients[$key]);
                    $log_user_list = true;
                }
                unset($client);
                if(!$log_user_list) echo "failed to delete the session\n";
                updateOnlineNum($clients);

                // 下面是一次失败的断连代码
                /**$index = array_search($socket, array_column($clients, 'socket'));
                *echo "index = $index socket = $socket\n";
                *echo "Client {{$clients[$index]['socket']} : {$clients[$index]['name']}} disconnected.\n";
                *unset($clients[$index]);*/
            } elseif ($bytes > 0) {
                // 处理客户端发送的消息
                foreach ($clients as $key => $client)
                if($client['socket'] === $socket)
                {
                    $cur_client = &$clients[$key];
                }
                unset($client);

                $request_type = substr($data, 0, 2);
                $request_msg = substr($data, 2);

                // 处理广播请求
                if($request_type === '00')
                {
                    $message = "{$cur_client['name']}: {$request_msg}";
                    echo "Broadcasting: {$message}\n";
                    foreach ($clients as $other) {
                        socket_write($other['socket'], frame("01" . $message));
                    }
                }
                // 处理私聊请求
                else if($request_type === '01')
                {
                    $message = "{$cur_client['name']}: {$request_msg}";
                    $succ = false;

                    foreach($room_list as $room)
                    {
                        if($cur_client === $room['player1'] || $cur_client === $room['player2'])
                        {
                            $succ = true;
                            echo "room{room['room_id']}: {{$message}}\n";
                            socket_write($room['player1']['socket'], frame("02" . $message));
                            socket_write($room['player2']['socket'], frame("02" . $message));
                        }
                    }

                    if($succ === false)
                        socket_write($cur_client['socket'], frame("02" . $message . "[发送失败，请先匹配进入房间]"));
                }
                // 处理cheatmode
                else if($request_type === '02')
                {
                    //TODO: cheatmode
                }
                // 处理匹配请求
                else if($request_type === '11')
                {
                    echo "{$cur_client['name']} request match\n";
                    if($waiting_list === null)
                        $waiting_list = $cur_client;
                    else
                    {
                        $new_chessBoard = $wuziBoard;
                        $room_list[] = [
                            'player1' => $waiting_list,
                            'player2' => $cur_client,
                            'room_id' => $room_id,
                            'chess_board' => $new_chessBoard,
                            'turn' => "player1",
                            'chosen' => null
                        ];
                        echo "{$waiting_list['name']} VS {$cur_client['name']} in room $room_id\n";
                        $room_id++;
                        
                        socket_write($waiting_list['socket'], frame("10" . '0' . $cur_client['name']));
                        socket_write($cur_client['socket'], frame("10" . '1' . $waiting_list['name']));
                        $waiting_list = null;
                    }
                }
                // 处理取消匹配
                else if($request_type === '10')
                {
                    echo "{$cur_client['name']} cancel match\n";
                    assert($waiting_list === $cur_client);
                    $waiting_list = null;
                }
                // 处理用户移动事件
                else if($request_type === '20')
                {
                    $msg = explode(" ",$request_msg);
                    $row = $msg[0];
                    $col = $msg[1];

                    foreach($room_list as $r_key => &$room)
                    if($room[$room['turn']] === $cur_client)
                    {
                        // 选子
                        if($room['chosen'] === null)
                        {
                            $room['chosen'] = "$row $col";
                            echo "{$cur_client['name']} choose ($row, $col)\n";
                        }
                        $x = $row;
                        $y = $col;
                        if($room['turn'] == 'player2')
                            $room['chess_board'][$y][$x] = -1;
                        if($room['turn'] == 'player1')
                            $room['chess_board'][$y][$x] = 1;
                            // for($i = 0; $i < 15; $i++)
                            // {
                            //     for($j = 0; $j < 15; $j++)
                            //     {
                            //         $tmp = $room['chess_board'][$i][$j];
                            //         echo "$tmp ";
                            //     }
                            //     echo  "\n";
                            // }
                        if(checkwin($room))
                        {
                            echo "{$cur_client['name']} win!\n";
                            game_over($cur_client, $room, $room_list, $r_key, false);
                            continue;
                        }
                        //发送给对手
                        if($room['turn'] == 'player2')
                            socket_write($room['player1']['socket'], frame("20$x $y"));
                        if($room['turn'] == 'player1')
                            socket_write($room['player2']['socket'], frame("20$x $y"));
                        $room['chosen'] = null;
                        $room['times']--;
                        if($room['times']==0)
                        {
                            $room['turn'] = "player" . (3 - $room['turn'][6]);
                            $room['times']=2;
                        }
                    }
                    unset($room);
                    
                }
                else if($request_type === '30')
                {
                    $cur_client['name'] = $request_msg;
                    echo "new client {" . "$new_client : $request_msg} added\n";
                    $log_user_list = true;
                }
                else if($request_type === '40')
                {
                    foreach($room_list as $r_key => &$room)
                    if($cur_client === $room['player1'] || $cur_client === $room['player2'])
                    {
                        if($cur_client === $room['player1'])
                            game_over($room['player2'], $room, $room_list, $r_key, true);
                        else
                            game_over($room['player1'], $room, $room_list, $r_key, true);
                    }
                    
                }
            }
        }
    }
}

// 关闭WebSocket服务器
socket_close($server);
?>