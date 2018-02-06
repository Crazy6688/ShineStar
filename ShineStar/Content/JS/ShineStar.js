/// <reference path="declare.js" />
/// <reference path="Draw.js" />

var declare = declare || require('./declare.js');
var drawLight = drawLight || require('./Draw.js')


function RGB(r, g, b) {
    return (r << 16) + (g << 8) + b;
};

function ToColor(number) {
    return '#' + ('' + number.toString(16)).padStart(6, '0');
}

//获取盒模型的外部尺寸: left,top,right,bottom,width,height
function GetBounds(element) {
    return element.getBoundingClientRect();
}

var SSType =
  {
      //无
      None: 0,         //无
      //光源
      Light: 1,
      //平面镜:90度反射光
      MPlane: 2,
      //斜面镜:45/135度反射光
      MBeveled: 3,
      //透镜:   透过,或者斜面垂直的时候透过并且折射一次
      MLens: 4,
      //棱镜:   正确的角度能够将颜色均分
      MPrism: 5,
      //管道:   能够单个方向通过指定属性的颜色
      PFilter: 6,
      //石头: 障碍物
      Stock: 7,
      //星星
      Star: 8
  };

//定义灯光的进入或者输出的位置
var SSDirect =
  {
      //左上
      LU: 0,
      //中上
      MU: 1,
      //右上
      RU: 2,
      //右中
      RM: 3,
      //右下
      RD: 4,
      //下中
      DM: 5,
      //左下
      LD: 6,
      //左中
      LM: 7,
  };

var SSColor =
  {
      None: RGB(0, 0, 0),
      Red: RGB(255, 0, 0),
      Green: RGB(0, 255, 0),
      Blue: RGB(0, 0, 255),
      Yellow: RGB(255, 255, 0),
      Pink: RGB(255, 0, 255),
      Cyan: RGB(0, 255, 255),
      White: RGB(255, 255, 255)
  };



//定义对象基类
var SSItem = declare("SSItem", null,
  {
      constructor: function () { },
      type: SSType.None,
      direct: SSDirect.LU,
      name: 'no name',
      //数值,颜色,通过颜色等,根据类型不同,有不同的作用
      value: RGB(222, 222, 222),
      //对象所在的位置信息
      position: null,
      //是否可以移动
      moveable: true,
      //是否可以转动
      roateable: true,
      roate: function (idir) { console.log('roate:', this.name, this.type, idir); },
      draw: function (map) {
          var ctx = map.ctx;

          //ctx.strokeStyle = ToColor(this.value);
      }
  });

//定义游戏的描述信息
var SSGame = declare("SSGame", null,
  {
      constructor: function (args) {
          console.info("正在创建游戏");
          var map = this.map0 = new SSMap(args.map0);
          var ctx = map.ctx;


          var star = new SSStar({ position: new SSPosition(map.getPosition(30)) });
          map.items.push(star);

          var cs = [SSColor.Red
              , SSColor.Blue, SSColor.Yellow, SSColor.Green, SSColor.Pink, SSColor.Cyan
          ];
          for (var i = 0; i < 3; i++) {
              for (var j = 0; j < cs.length; j++) {

                  var light = new SSLight({ value: cs[j], position: new SSPosition(map.getPosition(j + i * cs.length*2)) });
                  map.items.push(light);

              }
          }

          //var light = new SSLight({ value: SSColor.Red, position: new SSPosition(map.getPosition(10)) });
          //map.items.push(light);

          //light = new SSLight({ value: SSColor.Green, position: new SSPosition(map.getPosition(15)) });
          //map.items.push(light);

          //light = new SSLight({ value: SSColor.Blue, position: new SSPosition(map.getPosition(20)) });
          //map.items.push(light);

          //light = new SSLight({ value: SSColor.Pink, position: new SSPosition(map.getPosition(33)) });
          //map.items.push(light);

          var g = this;
          g.draw();
          setInterval(function () { g.draw(); }, 300);
      },

      map0: null,
      //光线
      shines: [],
      draw: function () {
          var g = this;
          var map = this.map0;
          var ctx = map.ctx;
          ctx.save();
          ctx.fillStyle = "#EEEEEE";
          ctx.fillRect(0, 0, 10000, 10000);
          

          ctx.translate(map.offsetX, map.offsetY);



          map.draw();

          ctx.restore();
      }

  });

module.exports = SSGame;
//exports.SSGame=SSGame;

//定义地图区域
var SSMap = declare("SSMap", null,
  {
      constructor: function (args) {
          var e = this.canvas = args.canvas;
          var ctx = this.ctx = e.getContext("2d");

          //计算块数
          var size = this.size;
          var rows = this.rows = Math.floor(e.height / size);
          var cols = this.cols = Math.floor(e.width / size);

          var count = this.count = rows * cols;

          //设置偏移量
          var offsetX = this.offsetX = (e.width - cols * size) / 2;
          var offsetY = this.offsetY = (e.height - rows * size) / 2;



          console.info('canvas', e.width, e.height, size, rows, cols);

      },
      items: [],
      composes: [],
      canvas: null,
      ctx: null,

      offsetX: 0,
      offsetY: 0,
      //单元格大小
      size: 0,
      rows: 0,
      cols: 0,
      count: 0,
      //间隙
      gap: 0,

      getPosition: function (idx) {
          //-1
          var map = this;
          if (idx >= map.cols * map.rows || idx < 0)
              return new SSPosition({ index: -1, row: -1, col: -1, x: -10000, y: -10000, w: 0, h: 0 });
          var row = Math.floor(idx / map.cols), col = idx % map.cols;

          //console.info(row, map.size, row * map.size);
          return new SSPosition({ index: idx, row: row, col: col, x: col * map.size, y: row * map.size, w: map.size, h: map.size });
      },
      //获取某个方向上相对于方格的坐标
      getDirectAxis: function (dir) {
          var u = this.size / 2;
          var targets = [[-u, -u], [0, -u], [u, -u], [u, 0], [u, u], [0, u], [-u, u], [-u, 0]];
          var t = targets[dir % 8];
          return { x: t[0], y: t[1] };
      },
      //获取指定索引位置的组合对象
      getNextCompose: function (curIndex, direct) {
          if (curIndex < 0 || curIndex >= this.count || direct < 0 || direct >= 8)
              return null;//返回0,表示无法找到

          var cols = this.cols, rows = this.rows;
          var x = curIndex % cols, y = Math.floor(curIndex / cols);
          if (direct <= 2)
              y--;
          if (direct >= 4 && direct <= 6)
              y++;
          if (direct == 0 || direct == 6 || direct == 7)
              x--;
          if (direct == 2 || direct == 3 || direct == 4)
              x++;
          if (x < 0 || y < 0 || x >= cols || y >= rows)
              return null;
          var next = x + y * cols;
          //console.info('cur', curIndex, 'dir', direct, 'next', next);
          return this.composes[next];
      },
      draw: function (map) {
          var ctx = this.ctx;
          //ctx.translate(offsetX, offsetY);

          //计算块数
          var size = this.size;
          var rows = this.rows;
          var cols = this.cols;

          var maxX = cols * size;
          var maxY = rows * size;

          ctx.save();
          ctx.strokeStyle = "red";

          //draw grid
          ctx.beginPath();
          for (var i = 0; i <= rows; i++) {
              ctx.moveTo(0, i * size);
              ctx.lineTo(maxX, i * size);

              //ctx.strokeText(i, offsetX + i * size, offsetY + 0);
          }
          for (var i = 0; i <= cols; i++) {
              ctx.moveTo(i * size, 0);
              ctx.lineTo(i * size, maxY);
          }
          ctx.stroke();
          ctx.restore();

          var map = this;

          this.allDirect = this.allDirect || SSDirect.LU;
          var ddd = this.allDirect++ % 8;



          this.items.forEach(function (item) {
              var pos = item.position;
              ctx.save();


              ctx.translate(pos.x + map.size / 2, pos.y + 1 + map.size / 2);

              item.direct = (item.direct + 1) % 8;

              //旋转起来看看是否对称
              //ctx.strokeRect(-5, -5, 10, 10);
              //ctx.rotate(Math.PI / 4 * ddd);

              item.draw(map);
              ctx.restore();
          }, this);

          this.calculate();

          //绘制光线
          this.composes.forEach(function (c) {
              ctx.save();
              c.draw(map);
              ctx.restore();
          });




      },

      calculate: function () {
          var g = this;
          var shines = g.shines = [];

          //初始化光线组合层
          var composes = g.composes = [];
          for (var i = 0; i < g.count; i++) {
              var c = new SSCompose({ colorIn: [0, 0, 0, 0, 0, 0, 0, 0], colorOut: [0, 0, 0, 0, 0, 0, 0, 0], index: i });
              this.composes.push(c);
          }

          //初始化光源
          g.items.forEach(function (item) {
              if (item.type != SSType.Light)
                  return;
              var shine = new SSShine({
                  directIn: -1, directOut: item.direct,
                  colorOut: item.value,
                  index: item.position.index
              });
              shines.push(shine);
          });
          //计算光
          shines.forEach(function (shine) {
              var c = composes[shine.index];
              var color = shine.colorOut;
              //模拟直线传输
              do {
                  var dir = (shine.directOut + 4) % 8;
                  c.colorOut[shine.directOut] |= color;
                  c.colorIn[dir] |= color;
                  c = g.getNextCompose(c.index, dir);
              }
              while (c != null);
          });


      }


  });


//定义位置索引
var SSPosition = declare("LPosition", null, {
    //索引位置,0开始
    index: 0,
    //行,0开始
    row: 0,
    //列,0开始
    col: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0
});

//定义光线计算结果的组合,每个小格一个
var SSCompose = declare("SSCompose", null, {
    //八个方向的输入光源颜色
    colorIn: [],
    //八个方向的输出光源颜色
    colorOut: [],
    //索引位置
    index: -1,
    draw: function (map) {

        var ctx = map.ctx;

        var pos = map.getPosition(this.index);
        ctx.save();
        ctx.translate(pos.x + map.size / 2, pos.y + 1 + map.size / 2);

        this.colorIn.forEach(function (c, i) {
            if (c == 0)
                return;
            ctx.beginPath();
            ctx.strokeStyle = ToColor(c);
            ctx.moveTo(0, 0);
            var pt = map.getDirectAxis(i);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
        });

        this.colorOut.forEach(function (c, i) {
            if (c == 0)
                return;
            ctx.beginPath();
            ctx.strokeStyle = ToColor(c);
            ctx.moveTo(0, 0);
            var pt = map.getDirectAxis(i);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
        });


        ctx.restore();
    }
});

//定义光线传输路径
var SSShine = declare("SSShine", null,
  {
      colorIn: SSColor.None,
      colorOut: SSColor.None,
      directIn: SSDirect.LU,
      directOut: SSDirect.LU,
      index: -1,
      //下一个光线的位置
      nexts: []
  });

var SSStar = declare("SSStar", SSItem, {
    type: SSType.Star,
    draw: function (map) {
        this.inherited(arguments);

        var ctx = map.ctx;

        var pos = this.position;
        // ctx.strokeText("A", 0, 0);
        //移动到物体中心点
        var pi = Math.PI;
        ctx.rotate(pi * 36 / 180);

        var s = map.size / 2 - 2;
        //创建路径  
        ctx.beginPath();
        ctx.fillStyle = ToColor(this.value);

        var dig = pi * 144 / 180;
        for (var i = 0; i < 5; i++) {
            var x = Math.sin(i * dig);
            var y = Math.cos(i * dig);
            ctx.lineTo(x * s, y * s);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
});

var SSLight = declare("SSLight", SSItem, {
    type: SSType.Light,
    draw: function (map) {
        this.inherited(arguments);


        var ctx = map.ctx;
        ctx.strokeStyle = ToColor(this.value);
        ctx.fillStyle = ToColor(this.value);

        ctx.rotate(Math.PI / 4 * this.direct);

        drawLight(map);

    }

});



module.exports = SSGame;
