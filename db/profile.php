<?php
require 'login_db_connect.php';

$name = $_COOKIE['username'];
$data[] = $name;

$sql = "SELECT username, score, wins, loses FROM xqRanking where username='$name'";
$result = $con->query($sql);
assert($result->num_rows > 0);
$row = $result->fetch_assoc();
$data[] = $row['score'];
$data[] = $row['wins'];
$data[] = $row['loses'];

$sql = "SELECT score, wins, loses FROM wzqRanking where username='$name'";
$result = $con->query($sql);
assert($result->num_rows > 0);
$row = $result->fetch_assoc();
$data[] = $row['score'];
$data[] = $row['wins'];
$data[] = $row['loses'];

$sql = "SELECT score, wins, loses FROM llqRanking where username='$name'";
$result = $con->query($sql);
assert($result->num_rows > 0);
$row = $result->fetch_assoc();
$data[] = $row['score'];
$data[] = $row['wins'];
$data[] = $row['loses'];


// 将排名数据作为 JSON 格式返回给前端
$response = array(
    'success' => true,
    'data' => $data
);

// 设置响应的 Content-Type 为 JSON
header('Content-Type: application/json');

// 将响应以 JSON 格式输出
echo json_encode($response);

// 关闭数据库连接
$con->close();
?> 