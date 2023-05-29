<?php

/*
header("Content-Type:text/html;charset=utf-8");
$ip=$_SERVER['REMOTE_ADDR'];
$text=$_GET["text"];
$response="$ip $text";
echo $response;

*/


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

// 选子正确性校验
function validate_choose($x, $y, $room)
{
    $cur_player = $room['turn'];
    $chess = $room['chess_board'][$x][$y];
    if($cur_player === 'player1' && $chess[0] === "r")
        return true;
    else if($cur_player === 'player2' && $chess[0] === 'b')
        return true;
    return false;
}

// 移动正确性校验
function validate_move($x, $y, $row, $col, $room)
{
    $player = $room['turn'];
    $color = $room['chess_board'][$x][$y][0];
    $chess = $room['chess_board'][$x][$y][2];

    // 判断是否吃自己的子
    if($color === $room['chess_board'][$row][$col][0])
        return false;

    // 车
    if($chess === 'c')
    {
        if($x == $row)
        {
            $start = min($y, $col) + 1;
            $end = max($y, $col) - 1;
            $cnt = 0;
            for($start; $start <= $end; $start++)
                if($room['chess_board'][$x][$start] !== 's')
                    $cnt++;
            if($cnt == 0)
                return true;
        }
        else if($y == $col)
        {
            $start = min($x, $row) + 1;
            $end = max($x, $row) - 1;
            $cnt = 0;
            for($start; $start <= $end; $start++)
                if($room['chess_board'][$start][$y] !== 's')
                    $cnt++;
            if($cnt == 0)
                return true;
        }
    }
    // 马
    else if($chess === 'm')
    {
        // 别马腿
        $block_x = ($x + $row) / 2;
        $block_y = ($y + $col) / 2;
        if(floor($block_x) != $block_x) $block_x = $x;
        if(floor($block_y) != $block_y) $block_y = $y;
        if(abs($x - $row) + abs($y - $col) == 3 && (abs($x - $row) == 1 || abs($x - $row) == 2) && $room['chess_board'][$block_x][$block_y] === 's')
            return true;
    }
    // 象
    else if($chess === 'x')
    {
        //别象腿
        $block_x = ($x + $row) / 2;
        $block_y = ($y + $col) / 2;
        if(abs($x- $row) == 2 && abs($y - $col) == 2 && $x + $row != 10 && $x + $row != 8 && $room['chess_board'][$block_x][$block_y] === 's')
            return true;
    }
    // 士
    else if($chess === 's')
    {
        if(abs($x - $row) == 1 && abs($y - $col) == 1 && $col >= 3 && $col <= 5 && ($row <= 2 || $row >= 7))
            return true;
    }
    // 将
    else if($chess === 'j')
    {
        if(abs($x - $row) + abs($y - $col) == 1 && $col >= 3 && $col <= 5 && ($row <= 2 || $row >= 7))
            return true;
        // 飞将
        if($y == $col && $room['chess_board'][$row][$col][2] === 'j')
        {
            $start = min($x, $row) + 1;
            $end = max($x, $row) - 1;
            $cnt = 0;
            for($start; $start <= $end; $start++)
                if($room['chess_board'][$start][$y] !== 's')
                    $cnt++;
            if($cnt == 0)
                return true;
        }
    }
    // 炮
    else if($chess === 'p')
    {
        if($x == $row)
        {
            $start = min($y, $col) + 1;
            $end = max($y, $col) - 1;
            $cnt = 0;
            for($start; $start <= $end; $start++)
                if($room['chess_board'][$x][$start] !== 's')
                    $cnt++;
            if($cnt == 0 && $room['chess_board'][$row][$col] === 's'|| $cnt == 1 && $room['chess_board'][$row][$col] !== 's')
                return true;
        }
        else if($y == $col)
        {
            $start = min($x, $row) + 1;
            $end = max($x, $row) - 1;
            $cnt = 0;
            for($start; $start <= $end; $start++)
                if($room['chess_board'][$start][$y] !== 's')
                    $cnt++;
            if($cnt == 0 && $room['chess_board'][$row][$col] === 's'|| $cnt == 1 && $room['chess_board'][$row][$col] !== 's')
                return true;
        }
    }
    // 卒
    else if($chess === 'z')
    {
        // 没过河
        if($color === 'r' && $x >= 5 || $color === 'b' && $x <= 4)
        {
            if($y == $col)
            {
                // 不能向后
                if($color === 'r' && $x - $row == 1)
                    return true;
                else if($color === 'b' && $row - $x == 1)
                    return true;
            }
        }
        // 过河
        else
        {
            if(abs($x - $row) + abs($y - $col) === 1)
            {
                // 不能向后
                if($color === 'b' && $x - $row != 1)
                    return true;
                else if($color === 'r' && $row - $x != 1)
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

// 创建WebSocket服务器
$server = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($server, SOL_SOCKET, SO_REUSEADDR, 1);
socket_bind($server, '10.0.2.15', 12345);
socket_listen($server);

$chessBoard = [
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

// 客户端列表
$clients = [];
$waiting_list = null;
$room_list = [];

// 客户端ID
$id = 0;
$room_id = 0;
$online_num = 0;

$log_user_list = true;

echo "启动成功\n";


while (true) {
    $read = [$server];
    $write = null;
    $except = null;

    //echo "monitor {0.0.0.0 : server}; ";

    // 从所有客户端和服务器读取数据
    if($log_user_list) echo "user list : { ";
    foreach ($clients as $client) {
        $read[] = $client['socket'];
        //echo "{{$client['socket']} : {$client['name']}}; ";
        if($log_user_list && isset($client['name'])) echo "{$client['name']} ";
    }
    if($log_user_list) echo "}\n";
    $log_user_list = false;
    unset($client);

    //echo "\n"; 

    socket_select($read, $write, $except, null);

    foreach ($read as $socket) {
        //echo "processing $socket\n";
        if ($socket === $server) {
            // 新客户端连接
            $new_client = socket_accept($server);
            $uni_name = $id;
            $id++;
            $clients[] = [
                'socket' => $new_client,
                // 'name' => "usr$uni_name",
            ];

            $online_num++;

            $data = socket_read($new_client, 1024);
            handshaking($new_client, $data);
            updateOnlineNum($clients);
        } else {
            // 客户端发送数据
            $bytes = socket_recv($socket, $data, 1024, MSG_DONTWAIT);
            //echo "raw material $data($bytes)\n";
            assert($bytes);
            $data = decode($data);
            //echo "processed data $data\n";
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
                        $new_chessBoard = $chessBoard;
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
                        
                        socket_write($waiting_list['socket'], frame("10" . '0'));
                        socket_write($cur_client['socket'], frame("10" . '1'));
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
                    $x = $request_msg[0];
                    $y = $request_msg[1];
                    $row = $request_msg[2];
                    $col = $request_msg[3];
                    // 输入校验
                    if($row < 0 || $row > 9 || $col < 0 || $col > 8 || floor($row) != $row || floor($col) != $col)
                    {
                        echo "bad input ($row, $col)\n";
                        continue;
                    }
                    if($x < 0 || $x > 9 || $y < 0 || $y > 8 || floor($x) != $x || floor($y) != $y)
                    {
                        echo "bad input ($x, $y)\n";
                        continue;
                    }
                    foreach($room_list as $r_key => &$room)
                    if($room[$room['turn']] === $cur_client)
                    {
                        // 翻转
                        if($room['turn'] == 'player2')
                        {
                            $x = 9 - $x;
                            $y = 8 - $y;
                            $row = 9 - $row;
                            $col = 8 - $col;
                        }

                        // 移动
                        if(validate_choose($x, $y, $room) && validate_move($x, $y, $row, $col, $room))
                        {
                            // 胜利
                            if($room['chess_board'][$row][$col] === "r_j" || $room['chess_board'][$row][$col] === "b_j" )
                            {
                                echo "{$cur_client['name']} move {$room['chess_board'][$row][$col]} from ($x,$y) to ($row,$col)\n";
                                echo "{$cur_client['name']} win!\n";
                                if($cur_client === $room['player1'])
                                {
                                    socket_write($room['player1']['socket'], frame("21" . '1'));
                                    socket_write($room['player2']['socket'], frame("21" . '0'));
                                }
                                else
                                {
                                    socket_write($room['player1']['socket'], frame("21" . '0'));
                                    socket_write($room['player2']['socket'], frame("21" . '1'));
                                }
                                echo "disband room{$room['room_id']}: {{$room['player1']['name']}, {$room['player2']['name']}}\n";
                                unset($room_list[$r_key]);
                                continue;
                            }

                            send_move_msg($x, $y, $row, $col, $room);
                            $room['turn'] = "player" . (3 - $room['turn'][6]);
                            $room['chess_board'][$row][$col] = $room['chess_board'][$x][$y];
                            $room['chess_board'][$x][$y] = 's';
                            echo "{$cur_client['name']} move {$room['chess_board'][$row][$col]} from ($x,$y) to ($row,$col)\n";
                            socket_write($room['player1']['socket'], frame("03" . "($x,$y) -> ($row,$col)"));
                            // player2翻转
                            $x = 9 - $x;
                            $y = 8 - $y;
                            $row = 9 - $row;
                            $col = 8 - $col;
                            socket_write($room['player2']['socket'], frame("03" . "($x,$y) -> ($row,$col)"));
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
            }
        }
    }
}

// 关闭WebSocket服务器
socket_close($server);
?>