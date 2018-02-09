//绘制五角星
function drawStar(map, item) {
    var ctx = map.ctx, size = map.size, half = size / 2;

    var pi = Math.PI;

    var isBright = item.value == item.passColor;
    ctx.save();
    ctx.rotate(-Math.PI / 4 * item.direct);
    ctx.rotate(pi * 36 / 180);
    var s = half - 2;
    //创建路径  


    ctx.beginPath();
    ctx.strokeStyle = item.ToColor() ;
    ctx.fillStyle = item.ToColor() ;

    ctx.globalAlpha = isBright ? 1 : 0.6;

    var dig = pi * 144 / 180;
    for (var i = 0; i < 5; i++) {
        var x = Math.sin(i * dig);
        var y = Math.cos(i * dig);
        ctx.lineTo(x * s, y * s);
    }
    ctx.closePath();
    //ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function drawStock(map, item) {
    var ctx = map.ctx, size = map.size, half = size / 2;


    var w = size / 1.4;
    var w2 = w / 2;
    var h = size * 0.8;
    var h2 = h / 2;
    ctx.save();
    //转回去
    ctx.rotate(-Math.PI / 4 * item.direct);

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(-w2, -w2, w, w);
    ctx.strokeRect(-w2, -w2, w, w);


    ctx.restore();
}

//绘制光源
function drawLight(map, item) {
    var ctx = map.ctx;

    ctx.rotate(-Math.PI / 2);
    var origin = 512;
    var rate = map.size * 0.8 / origin;

    ctx.save();
    ctx.strokeStyle = item.ToColor();
    ctx.fillStyle = item.ToColor();
    ctx.miterLimit = 4;
    ctx.font = "normal normal normal normal 15px / 21.4286px ''";
    ctx.font = "   15px ";
    ctx.scale(rate, rate);
    ctx.translate(-origin / 2, -origin / 2);

    ctx.save();
    ctx.font = "   15px ";
    ctx.restore();
    ctx.save();
    ctx.font = "   15px ";
    ctx.beginPath();
    ctx.moveTo(438.144, 73.831);
    ctx.bezierCurveTo(395.238, 30.951, 341.401, 15.258000000000003, 324.25, 32.410000000000004);
    ctx.lineTo(255.233, 101.453);
    ctx.bezierCurveTo(244.763, 111.924, 235.624, 146.97, 239.822, 182.426);
    ctx.lineTo(30.900000000000006, 391.373);
    ctx.bezierCurveTo(18.510000000000005, 403.738, 28.545000000000005, 433.86899999999997, 53.325, 458.65);
    ctx.bezierCurveTo(78.106, 483.457, 108.263, 493.466, 120.62700000000001, 481.101);
    ctx.lineTo(329.549, 272.179);
    ctx.bezierCurveTo(365.03, 276.378, 400.077, 267.238, 410.522, 256.768);
    ctx.lineTo(479.565, 187.72499999999997);
    ctx.bezierCurveTo(496.717, 170.57299999999998, 481.024, 116.73599999999996, 438.144, 73.83099999999996);
    ctx.closePath();

    //ctx.moveTo(208.41, 282.624);
    //ctx.bezierCurveTo(198.861, 273.101, 201.98499999999999, 254.54100000000003, 215.297, 241.20300000000003);
    //ctx.bezierCurveTo(228.609, 227.86500000000004, 247.16899999999998, 224.76800000000003, 256.718, 234.29100000000003);
    //ctx.bezierCurveTo(266.216, 243.81400000000002, 263.14300000000003, 262.374, 249.806, 275.71200000000005);
    //ctx.bezierCurveTo(236.46800000000002, 289.04900000000004, 217.93400000000003, 292.14700000000005, 208.411, 282.624);
    //ctx.closePath();

    //ctx.moveTo(381.209, 130.791);
    //ctx.bezierCurveTo(347.98, 97.562, 339.634, 53.735, 342.579, 50.76599999999999);
    //ctx.bezierCurveTo(345.548, 47.79699999999999, 387.661, 57.88299999999999, 420.915, 91.112);
    //ctx.bezierCurveTo(454.144, 124.341, 464.10200000000003, 166.555, 461.235, 169.423);
    //ctx.bezierCurveTo(458.368, 172.291, 414.413, 164.022, 381.21000000000004, 130.792);
    //ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();


}

//绘制平面镜,规定: 镜面朝上
function drawMPlane(map) {
    var ctx = map.ctx, size = map.size, half = size / 2;

    ctx.rotate(Math.PI / 4);
    var w = size / 6;
    var w2 = w / 2;
    var h = size * 0.8;
    var h2 = h / 2;
    ctx.save();

    ctx.beginPath();

    ctx.fillStyle = "gray";
    ctx.fillRect(-1, -h2 - 2, w2 + 3, h + 4);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fillRect(-1, -h2, w2, h);
    ctx.stroke();

    ctx.restore();
}


//绘制斜面镜,规定: 镜面朝上
function drawMBeveled(map) {
    var ctx = map.ctx, size = map.size, half = size / 2;

    ctx.rotate(Math.PI / 8);
    var w = size / 6;
    var w2 = w / 2;
    var h = size * 0.8;
    var h2 = h / 2;
    ctx.save();

    ctx.beginPath();

    ctx.fillStyle = "green";
    ctx.fillRect(-1, -h2 - 2, w2 + 3, h + 4);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fillRect(-1, -h2, w2, h);
    ctx.stroke();

    ctx.restore();
}


//绘制透镜,规定: 镜面朝上
function drawMLens(map) {
    var ctx = map.ctx, size = map.size, half = size / 2;

    ctx.rotate(Math.PI / 4);
    var w = size / 6;
    var w2 = w / 2;
    var h = size * 0.7;
    var h2 = h / 2;
    ctx.save();

    ctx.beginPath();

    ctx.fillStyle = "white";
    ctx.fillRect(-w2, -h2, w, h);

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";

    ctx.fillRect(-w2 - 3, -h2 - 2, w + 6, 2);
    ctx.fillRect(-w2 - 3, h2 - 2, w + 6, 2);
    ctx.stroke();

    ctx.restore();
}

//绘制管道,规定:竖着朝上
function drawPFilter(map, item) {
    var ctx = map.ctx, size = map.size, half = size / 2;


    var w = size / 4;
    var w2 = w / 2;
    var h = size * 0.8;
    var h2 = h / 2;
    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle = "gray";

    ctx.beginPath();
    ctx.moveTo(-w2, -h2);
    ctx.lineTo(-w2, h2);
    ctx.moveTo(w2, h2);
    ctx.lineTo(w2, -h2);
    ctx.stroke();
    //ctx.strokeRect(-w2, -h2, w, h);

    var color = item.ToColor();
    if (color != '#ffffff') {
        ctx.fillStyle = item.ToColor();
        ctx.fillRect(-w2 + 1, -h2, w - 2, h);
    }

    ctx.restore();

}

//绘制三棱镜,规定:正三角形的左半边,裁去下角
function drawMPrism(map, item) {
    var ctx = map.ctx, size = map.size, half = size / 2;


    var w = size / 4;
    var w2 = w / 2;
    var h = size * 0.6;
    var h2 = h / 2;
    ctx.save();

    ctx.translate(2, 0);
    ctx.beginPath();

    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(0, -h2);
    ctx.lineTo(-h / 2.3, h2);

    ctx.lineTo(0, h2 / 2);


    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}


module.exports = [null, drawLight, drawMPlane, drawMBeveled, drawMLens, drawMPrism, drawPFilter, drawStock, drawStar];