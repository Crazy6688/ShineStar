/// <reference path="declare.js" />
/// <reference path="light.js" />


window.onload = function () {

    var canvas =
        window ? document.getElementById("LCanvas") :
        wx.createCanvas();
    var game = new SSGame({ map0: { canvas: canvas, size: 35 } });

    console.info(game);



    ////取得绘图上下文对象的引用，“2d”是取得2D上下文对象
    //var context = canvas.getContext("2d");
    ////绘制红色矩形
    //context.fillStyle = "red";
    //context.fillRect(10, 10, 50, 50);
    ////绘制半透明的蓝色矩形
    //context.fillStyle = "rgba(0,0,255,0.5)";
    //context.fillRect(30, 30, 50, 50);
    ////绘制红色描边矩形
    //context.strokeStyle = "red";
    //context.strokeRect(10, 90, 50, 50);
    ////绘制半透明的蓝色描边矩形
    //context.strokeStyle = "rgba(0,0,255,0.5)";
    //context.strokeRect(30, 120, 50, 50);
    ////在两个矩形重叠的地方清除一个小矩形
    //context.clearRect(30, 30, 30, 30);

}

