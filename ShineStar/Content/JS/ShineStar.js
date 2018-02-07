/// <reference path="declare.js" />
/// <reference path="Draw.js" />

var iswx = typeof (wx) != 'undefined';

var declare = declare || require('./declare.js');
var funcs = iswx ? require('./Draw.js') : [drawLight, drawStar, drawPMirror];
var drawLight = funcs[0];
var drawStar = funcs[1];
var drawPMirror = funcs[2];

function RGB(r, g, b) {
    return (r << 16) + (g << 8) + b;
};

function ToColor(number) {
    return '#' + ('' + number.toString(16)).padStart(6, '0');
}

//将方向标准化
function NormolDirect(direct) {
    return (direct + 8) % 8;
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
      MD: 5,
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




//定义游戏的描述信息
var SSGame = declare("SSGame", null,
  {
      constructor: function (args) {
          console.info("正在创建游戏");
          var map = this.map0 = new SSMap(args.map0);
          var ctx = map.ctx;


          //var star = new SSStar({ position: new SSPosition(map.getPosition(30)) });
          //map.items.push(star);

          var cs = [SSColor.Red
              , SSColor.Blue, SSColor.Yellow, SSColor.Green, SSColor.Pink, SSColor.Cyan
          ];

          var light = new SSLight({
              value: SSColor.White, direct: SSDirect.RD,
              position: new SSPosition(map.getPosition(map.cols * Math.floor(map.rows / 2) + Math.floor(map.cols / 2)))
          });
          map.items.push(light);

          //var mplane = new SSMPlane({ direct: SSDirect.RU, position: new SSPosition(map.getPosition(light.position.index + (1 + map.cols) * 5)) });
          //map.items.push(mplane);
          //for (var i = 0; i < 3; i++) {
          //    for (var j = 0; j < cs.length; j++) {

          //        var light = new SSLight({ value: cs[j], direct: NormolDirect(j + i), position: new SSPosition(map.getPosition((j + i * cs.length) * 3)) });
          //        map.items.push(light);

          //    }
          //}


          for (var i = 0; i < map.count; i++) {
              var row = Math.floor(i / map.cols);
              var col = i % map.cols;
              if (row == 0) {
                  var mplane = new SSMPlane({ direct: SSDirect.MD, position: new SSPosition(map.getPosition(i)) });
                  map.items.push(mplane);
              }
              else if (row == map.rows - 1) {
                  var mplane = new SSMPlane({ direct: SSDirect.MU, position: new SSPosition(map.getPosition(i)) });
                  map.items.push(mplane);
              }
              else if (col == 0) {
                  var mplane = new SSMPlane({ direct: SSDirect.RM, position: new SSPosition(map.getPosition(i)) });
                  map.items.push(mplane);
              }
              else if (col == map.cols - 1) {
                  var mplane = new SSMPlane({ direct: SSDirect.LM, position: new SSPosition(map.getPosition(i)) });
                  map.items.push(mplane);
              }


          }

          var g = this;
          g.draw();
          setInterval(function () { g.draw(); }, 1000 * 0.5);
      },

      map0: null,
      //光线
      shines: [],
      draw: function () {
          var g = this;
          var map = this.map0;
          var ctx = map.ctx;

          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 10000, 10000);
          ctx.save();

          ctx.translate(map.offsetX, map.offsetY);



          map.draw();

          ctx.restore();
      },
      touchstart: function (e) {
          console.log('game.touchstart', e);

      },
      touchmove: function (e) {
          console.log('game.touchmove', e);
      },
      touchend: function (e) {
          console.log('game.touchend', e);
      }
  });

module.exports = SSGame;
//exports.SSGame=SSGame;

var SSMouseAction = {
    None: 0,
    Down: 1,
    Move: 2,
};

var SSMouseState = declare("SSMouseState", null, {
    downIndex: -1,
    upIndex: -1,
    clickIndex: -1,
    action: SSMouseAction.None
});

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

          var map = this;
          var mouse = map.mouse = new SSMouseState({});
          return;
          //为画布添加事件处理
          e.addEventListener('click', function (ev) {
              var x = ev.x || ev.clientX, y = ev.y || ev.clientY;

              //计算位置
              var c = Math.floor(x / map.size);
              var r = Math.floor(y / map.size);


              var idx = mouse.clickIndex = map.cols * r + c;
              console.info('click', x, y, c, r, idx);
          }, false);

          e.addEventListener('mousedown', function (ev) {
              var x = ev.x || ev.clientX, y = ev.y || ev.clientY;
              var c = Math.floor(x / map.size);
              var r = Math.floor(y / map.size);

              mouse.downIndex = map.cols * r + c;

              var idx = mouse.clickIndex = map.cols * r + c;
              console.info('mousedown', x, y, c, r, idx);
          });

          e.addEventListener('mouseup', function (ev) {
              var x = ev.x || ev.clientX, y = ev.y || ev.clientY;
              var c = Math.floor(x / map.size);
              var r = Math.floor(y / map.size);

              mouse.downIndex = map.cols * r + c;

              var idx = mouse.clickIndex = map.cols * r + c;
              console.info('mouseup', x, y, c, r, idx);
          });
      },
      mouse: null,
      items: [],
      //保存索引位置存储的物体
      itemHash: {},
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
      //验证索引是否合法
      validIndex: function (idx) {
          var map = this;
          return !(idx >= map.cols * map.rows || idx < 0);
      },
      //获取某个索引的位置参数
      getPosition: function (idx) {
          //-1
          var map = this;
          if (!this.validIndex(idx))
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
      //获取下一个直线传播的位置索引,如果不合法,返回-1
      getNextIndex: function (curIndex, direct) {
          direct = (direct) % 8;
          if (!this.validIndex(curIndex))
              return -1;//表示无法找到

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
              return -1;
          var next = x + y * cols;
          return next;
      },
      //获取指定索引位置的组合对象
      getNextCompose: function (curIndex, direct) {
          var next = this.getNextIndex(curIndex, direct);
          return next >= 0 ? this.composes[next] : null;
      },
      //获取索引位置存在的物体,如果没有物体或索引不存在,返回null
      getItem: function (idx) {
          if (!this.validIndex(idx))
              return null;
          return this.itemHash[idx];
      },
      //获取光组合
      getCompose: function (idx) {
          if (!this.validIndex(idx)) return null;
          return this.composes[idx];
      },
      draw: function (map) {
          var ctx = this.ctx;

          //计算块数
          var size = this.size, rows = this.rows, cols = this.cols;
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

          this.items.forEach(function (item) {
              var pos = item.position;
              ctx.save();


              ctx.translate(pos.x + map.size / 2, pos.y + 1 + map.size / 2);

              if (item.type == SSType.Light)
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

          //初始化光源和物品站位
          g.items.forEach(function (item) {
              g.itemHash[item.position.index] = item;
              if (item.type != SSType.Light)
                  return;

              //灯源的下一个位置开始计算
              var shine = new SSShine({
                  direct: NormolDirect(item.direct + 4),
                  color: item.value,
                  index: g.getNextIndex(item.position.index, item.direct)
              });
              shines.push(shine);
          });

          //var funShine = null;
          //funShine = function (inShine) {
          //    var c = g.getCompose(inShine.index);
          //    if (c == null)
          //        return;       //无效

          //    var color = inShine.color;
          //    var dir = NormolDirect(inShine.direct);       //传入光线的方向

          //    var item = g.getItem(inShine.index);      //当前是否存在物体
          //    if (item == null) {       //没有物体,直接向下传输

          //        var nextIndex = g.getNextIndex(inShine.index, NormolDirect(dir + 4));

          //        //标记当前颜色
          //        c.colorIn[dir] = c.colorOut[NormolDirect(dir + 4)] |= color;

          //        var nextShine = new SSShine({ index: nextIndex, color: color, direct: dir });
          //        funShine(nextShine);
          //    }
          //    else {
          //        var nextShines = item.shine(inShine);

          //        c.colorIn[dir] |= color;

          //        //当前颜色如何标记?
          //        nextShines.forEach(function (s) {
          //            c.colorOut[s.direct] |= color;

          //            var ndir = NormolDirect(s.direct + 4), nindex = g.getNextIndex(s.index, s.direct);
          //            var ns = new SSShine({ index: nindex, color: s.color, direct: ndir });
          //            funShine(ns);
          //        });
          //    }
          //};

          var headerShines = [];
          var getNextShines = function (inShine) {

              var c = g.getCompose(inShine.index);
              if (c == null)
                  return [];       //无效

              var color = inShine.color;
              var dir = NormolDirect(inShine.direct);       //传入光线的方向

              var item = g.getItem(inShine.index);      //当前是否存在物体
              if (item == null) {       //没有物体,直接向下传输

                  var nextIndex = g.getNextIndex(inShine.index, NormolDirect(dir + 4));

                  //标记当前颜色
                  c.colorIn[dir] = c.colorOut[NormolDirect(dir + 4)] |= color;

                  var nextShine = new SSShine({ index: nextIndex, color: color, direct: dir });
                  //funShine(nextShine);
                  //allshines.push(nextShine);
                  return nextIndex != -1 ? [nextShine] : [];
              }
              else {
                  var nextShines = item.shine(inShine);

                  c.colorIn[dir] |= color;

                  var nexts = [];
                  //当前颜色如何标记?
                  nextShines.forEach(function (s) {
                      c.colorOut[s.direct] |= color;

                      var ndir = NormolDirect(s.direct + 4), nindex = g.getNextIndex(s.index, s.direct);
                      var ns = new SSShine({ index: nindex, color: s.color, direct: ndir });
                      //funShine(ns);
                      //allshines.push(nextShine);

                      if (nindex != -1)
                          nexts.push(ns);
                  });
                  return nexts;
              }
          };

          //计算光
          for (var i = 0; i < shines.length; i++) {
              var c = shines[i];
              c.nexts = getNextShines(c);
              // c.nexts.
              c.nexts.forEach(function (n) { shines.push(n); });
              //if (shines.length > 333) {
              //    break;
              //}
          }

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

        //ctx.lineCap = 'square';
        ctx.lineWidth = 3;

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

//定义光线信息
var SSShine = declare("SSShine", null,
  {
      color: SSColor.None,
      direct: SSDirect.LU,
      index: -1
  });


//定义实物基类
var SSItem = declare("SSItem", null,
  {
      constructor: function () { },
      type: SSType.None,
      direct: SSDirect.MU,
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
      ToColor: function () { return ToColor(this.value); },

      draw: function (map) {
          var ctx = map.ctx;

          ctx.save();
          ctx.strokeStyle = "white";
          ctx.strokeText(this.direct, map.size / 2, 0);
          ctx.restore();
          //ctx.strokeStyle = ToColor(this.value);
          ctx.rotate(Math.PI / 4 * this.direct);
      },
      //当光束照射到物体,调用此方法实现调整光线传输路径,返回光线数组
      shine: function (s) {

          return [];
      }
  });

var SSStar = declare("SSStar", SSItem, {
    type: SSType.Star,
    draw: function (map) {
        // this.inherited(arguments);
        drawStar(map, this);
    }
});

var SSLight = declare("SSLight", SSItem, {
    type: SSType.Light,
    draw: function (map) {
        this.inherited(arguments);


        var ctx = map.ctx;

        drawLight(map, this);

    }

});

var SSMPlane = declare("SSMPlane", SSItem, {
    type: SSType.MPlane,
    draw: function (map) {
        this.inherited(arguments);

        drawPMirror(map, this);
    },
    shine: function (s) {
        var sub = NormolDirect(this.direct - s.direct);
        var color = s.color ^ 0xFF0000;
        //Math.abs(this.direct - s.direct);
        if (sub == 0) {
            var color = s.color ^ 0xFF0000;
            var ns = new SSShine({ index: s.index, color: color, direct: this.direct });
            return [ns];
        }
        if (sub == 1) {
            var color = s.color ^ 0x00FF00;
            var ns = new SSShine({
                index: s.index, color: color,
                direct: NormolDirect(s.direct + 2)
            });
            return [ns];
        }
        if (sub == 7) {
            var color = s.color ^ 0x0000FF;
            var ns = new SSShine({
                index: s.index, color: color,
                direct: NormolDirect(s.direct - 2)
            });
            return [ns];
        }
        //if (sub == 7 || sub == 6) {
        //    var ns = new SSShine({
        //        index: s.index, color: color,
        //        direct: NormolDirect(s.direct + 2)
        //    });
        //    return [ns];
        //}
        //if (sub == 4)
        //{
        //    var ns = new SSShine({ index: s.index, color: s.color, direct: NormolDirect(s.direct + 4) });
        //    return [ns];
        //}
        //if (sub == 7)        //为什么是3,需要根据光线角度和镜面绘制情况处理
        //{
        //    var ns = new SSShine({ index: s.index, color: s.color, direct: NormolDirect(s.direct + 2) });
        //    return [ns];
        //}
        //else {
        //    return [];
        //}
        return [];
    }
});



module.exports = SSGame;
