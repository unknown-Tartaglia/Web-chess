<?php
//用于生成验证码
//创建验证码画布
$img_w = 100;  //验证码的宽度
$img_h = 30;   //验证码的高度
$img = imagecreatetruecolor($img_w, $img_h);         //创建画布
$bg_color = imagecolorallocate($img,0xcc,0xcc,0xcc); //画布颜色
imagefill($img,0,0,$bg_color);                       //背景色


//生成验证码文本
$count = 4; //验证码位数
$charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; //随机因子
$charset_len = strlen($charset)-1; //计算随机因子长度（作为取出时的索引）
$code = ''; //保存生成的验证码
for($i=0; $i<$count; ++$i) {
//通过索引取出字符，mt_rand()用于获取指定范围内的随机数
    $code .= $charset[mt_rand(0,$charset_len)];
}

//将生成的文本保存到Session中
session_start();//启动session
$_SESSION['captcha'] = $code;

//在画布中绘制验证码文本
$fontSize = 16;    //文字大小
$fontStyle = './fonts/SourceCodePro-Bold.ttf'; //字体样式
//生成指定长度的验证码
for($i=0; $i<$count; ++$i){
    //随机生成字体颜色
    $fontColor = imagecolorallocate($img,mt_rand(0,100),mt_rand(0,50),mt_rand(0,255));
    imagettftext (
        $img,        //画布资源
        $fontSize,   //文字大小
        mt_rand(0,20) - mt_rand(0,25),            //随机设置文字倾斜角度
        $fontSize*$i+20,mt_rand($img_h/2,$img_h), //随机设置文字坐标，并自动计算间距
        $fontColor,  //文字颜色
        $fontStyle,  //文字字体
        $code[$i] 	 //文字内容
        );
}

//为验证码图片生成彩色噪点
for($i=0; $i<300; ++$i){
    //随机生成颜色
    $color = imagecolorallocate($img,mt_rand(0,255),mt_rand(0,255),mt_rand(0,255));
    //随机绘制干扰点
    imagesetpixel($img,mt_rand(0,$img_w),mt_rand(0,$img_h),$color);
}

//绘制干扰线
for($i=0; $i<10; ++$i){
    //随机生成干扰线颜色
    $color = imagecolorallocate($img,mt_rand(0,255),mt_rand(0,255),mt_rand(0,255));
    //随机绘制干扰线
    imageline($img,mt_rand(0,$img_w),0,mt_rand(0,$img_h*5),$img_h,$color);
}

header('Content-Type: image/gif'); //输出图像
imagegif($img);