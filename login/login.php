<?php
header('content-type:text/html;charset=utf-8');
//登录界面
require 'db/login_db_connect.php';//连接数据库


//判断表单是否提交,用户名密码是否提交
if (isset($_POST['username'])&&isset($_POST['password'])){//登录表单已提交
    
    //获取用户输入的验证码
    $captcha = isset($_POST['captcha']) ? trim($_POST['captcha']) : '';
    //获取Session中的验证码
    session_start();
    // if(empty($_SESSION['captcha'])){  //如果Session中不存在验证码，则退出
    //     exit('验证码已经过期，请返回并刷新页面重试。');
    // }
    //获取验证码并清除Session中的验证码
    $true_captcha = $_SESSION['captcha'];
    unset($_SESSION['captcha']); //限制验证码只能验证一次，防止重复利用
    //忽略字符串的大小写，进行比较
    if(strtolower($captcha) !== strtolower($true_captcha)){
        echo "<script>alert('验证码错误');location='login.html'</script>";
    }
    //验证码验证通过，继续判断用户名和密码
    //获取用户输入的用户名密码
    $username=$_POST["username"];
    $pwd=$_POST["password"];
    $sql="select uid,username,password from user where username='$username' and password='$pwd';";
    $result=mysqli_query($con, $sql);//执行sql语句
    $row=mysqli_num_rows($result);//返回值条目
    if (!$row){//若返回条目不存在则证明该账号不存在或者密码输入错误
        echo "<script>alert('账号不存在或密码错误');location='login.html'</script>";
        //exit('账号或密码错误');
    }else{//存在返回条目证明用户账号密码匹配，进入主页面
        session_start();
        $_SESSION['username']=$_POST['username'];
        setcookie('username', $username, time() + 60 * 60 * 24, '/');
        echo "<script>location='../index.html';</script>";
    }   
}


require 'login.html';