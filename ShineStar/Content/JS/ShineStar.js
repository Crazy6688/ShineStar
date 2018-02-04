
function RGB(r, g, b) {
    return (r << 16) + (g << 8) + b;
};

//获取盒模型的外部尺寸: left,top,right,bottom,width,height
function GetBounds(element) {
    return element.getBoundingClientRect();
}

var SSType =
  {
      //无
      None: 0,         //无
      //光源
      LSource: 1,
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

//定义方向,上右下左
var SSDirect =
  {
      U: 0, R: 1, D: 2, L: 3
  }

//定义灯光的进入或者输出的位置
var SSAngle =
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
      direct: SSDirect.U,
      name: 'no name',
      //数值,颜色,通过颜色等,根据类型不同,有不同的作用
      value: 0,
      //对象所在的位置信息
      position: null,
      //是否可以移动
      moveable: true,
      //是否可以转动
      roateable: true,
      roate: function (idir) { console.log('roate:', this.name, this.type, idir); },
      draw: function (map) {
          //var ctx = map.ctx;

          //var pos = this.position;
          ////移动到当前物体的位置索引的基准点
          //ctx.translate(pos.x, pos.y);
      }
  });

//定义游戏的描述信息
var SSGame = declare("SSGame", null,
  {
      constructor: function (args) {
          console.info("正在创建游戏");
          var map = this.WorkMap = new SSMap(args.map0);
          var ctx = this.WorkMap.ctx;

          for (var i = 0; i < 200; i++) {
              var start = new SSStar({ type: SSType.Star, position: new SSPosition(map.getPosition(i)) });
              this.Items.push(start);
          }
          map.draw();

          this.Items.forEach(function (item) {
              item.draw(map);
          }, this);
      },

      WorkMap: null,
      Items: []

  });

module.exports = SSGame;
//exports.SSGame=SSGame;

//定义地图区域
var SSMap = declare("SSMap", null,
  {
      constructor: function (args) {
          var e = this.canvas = args.canvas;
          var ctx = this.ctx = e.getContext("2d");

          ctx.strokeStyle = "red";
          e.style.backgroundColor = 'gray';

          //计算块数
          var size = this.size;
          var rows = this.rows = Math.floor(e.height / size);
          var cols = this.cols = Math.floor(e.width / size);

          //设置偏移量
          var offsetX = this.offsetX = (e.width - cols * size) / 2;
          var offsetY = this.offsetY = (e.height - rows * size) / 2;


          console.info('canvas', e.width, e.height, size, rows, cols);

      },
      getPosition: function (idx) {
          //-1
          var map = this;
          if (idx >= map.cols * map.rows)
              return new SSPosition({ row: -1, col: -1, x: -10000, y: -10000 });
          var row = Math.floor(idx / map.cols), col = idx % map.cols;

          console.info(row, map.size, row * map.size);
          return new SSPosition({ row: row, col: col, x: col * map.size, y: row * map.size });
      },
      draw: function (map) {
          var ctx = this.ctx;
          ctx.translate(offsetX, offsetY);

          //计算块数
          var size = this.size;
          var rows = this.rows;
          var cols = this.cols;

          //设置偏移量
          var offsetX = this.offsetX;
          var offsetY = this.offsetY;

          var maxX = cols * size;
          var maxY = rows * size;

          ctx.translate(offsetX, offsetY);

          ctx.font = "30px 黑体";
          ctx.textBaseline = "top";
          //draw line
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
      },
      canvas: null,
      ctx: null,

      offsetX: 0,
      offsetY: 0,
      //单元格大小
      size: 0,
      rows: 0,
      cols: 0,
      //间隙
      gap: 0
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
    y: 0
});

//定义光线传输路径
var SSLighting = declare("SSLighting", null,
  {
      colorIn: SSColor.None,
      colorOut: SSColor.None,
      angleIn: SSAngle.LU,
      angleOut: SSAngle.LU,
      position: null,
      //下一个光线的位置
      nexts: []
  });

var SSStar = declare("SSStar", SSItem, {
    draw: function (map) {
        this.inherited(arguments);




        //console.info('SSSTar draw.');
        var ctx = map.ctx;
        ctx.save();


        var pos = this.position;
        ctx.translate(pos.x, pos.y);

        // ctx.strokeText("A", 0, 0);

        //移动到物体中心点
        var pi = Math.PI;

        ctx.translate(map.size / 2, map.size / 2);
        ctx.rotate(pi * 36 / 180);


        var s = map.size / 2 - 2;
        //创建路径  

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,0,0,0.5)';

        var dig = pi * 144 / 180;
        for (var i = 0; i < 5; i++) {
            var x = Math.sin(i * dig);
            var y = Math.cos(i * dig);
            ctx.lineTo(x * s, y * s);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
});






