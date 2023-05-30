<?php
require 'login_db_connect.php';

$name = $_COOKIE['username'];

$sql = "SELECT user1, user2, type FROM record where user1='$name' or user2='$name' limit 6";
$result = $con->query($sql);

if ($result->num_rows > 0) {
    $rankingData = array();
    while ($row = $result->fetch_assoc()) {
        // 将每行数据添加到排名数据数组中
        $data = [];
        if($row['user1'] === $_COOKIE['username'])
        {
            $data[] = $row['user1'];
            $data[] = $row['user2'];
            $data[] = "胜";
            $data[] = $row['type'];
        }
        else
        {
            $data[] = $row['user2'];
            $data[] = $row['user1'];
            $data[] = "败";
            $data[] = $row['type'];
        }
        $rankingData[] =  $data;
    }

    // 将排名数据作为 JSON 格式返回给前端
    $response = array(
        'success' => true,
        'data' => $rankingData
    );
} else {
    $response = array(
        'success' => false,
        'message' => 'No ranking data found.'
    );
}

// 设置响应的 Content-Type 为 JSON
header('Content-Type: application/json');

// 将响应以 JSON 格式输出
echo json_encode($response);

// 关闭数据库连接
$con->close();
?> 