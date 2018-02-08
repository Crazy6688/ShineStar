/// <reference path="declare.js" />
/// <reference path="light.js" />


window.onload = function () {

    var iswx = typeof (wx) != 'undefined';
    var canvas = !iswx ? document.getElementById("LCanvas") :
        wx.createCanvas();

    var game = new SSGame({ canvas: canvas });

    if (iswx) {
        wx.onTouchStart(function (e) {
            var t = e.touches[0];
            //console.log(e.type, t.clientX, t.clientY);
            t.type = 'touchstart';
            game.touchstart(t);
        });

        wx.onTouchMove(function (e) {
            var t = e.touches[0];
            //console.log(e.type, t.clientX, t.clientY);
            t.type = 'touchmove';
            game.touchmove(t);
        });

        wx.onTouchEnd(function (e) {
            var t = e.changedTouches[0];
            //console.log(e.type, t.clientX, t.clientY);
            t.type = 'touchend';
            game.touchend(t);
        });
    }
    else {
        //canvas.addEventListener('touchstart', game.touchstart, false);
        //canvas.addEventListener('touchmove', game.touchmove, false);
        //canvas.addEventListener('touchend', game.touchend, false);

        canvas.addEventListener('mousedown', function (ev) {
            //  console.info('mousedown');
            game.touchstart(ev);

        });
        canvas.addEventListener('mousemove', function (ev) {
            //   console.info('mousemove');
            game.touchmove(ev);
        });
        canvas.addEventListener('mouseup', function (ev) {
            //   console.info('mouseup');
            game.touchend(ev);
        });
        canvas.addEventListener('mouseout', function (ev) {
            console.info('mouseout');
            game.touchend(ev);
        });
    }

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

