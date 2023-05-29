<?php
//用于登录界面数据库连接
//设置字符集
header('Content-type:text/html;charset=utf8');

//连接数据库
$con=mysqli_connect("localhost","user","password","chess");
if (mysqli_connect_errno($con))
{
    echo "连接 MySQL 失败: " . mysqli_connect_error();
} 



