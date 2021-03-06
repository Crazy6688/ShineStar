﻿/// <reference path="declare.js" />
/// <reference path="Draw.js" />

var iswx = typeof (wx) != 'undefined';

var declare = declare || require('./declare.js');
var drawFuncs = iswx ? require('./Draw.js') : [null, drawLight, drawMPlane, drawMBeveled, drawMLens, drawMPrism, drawPFilter, drawStock, drawStar];

function RGB(r, g, b) {
    return (r << 16) + (g << 8) + b;
};

function ToColor(number) {
    return '#' + ('' + number.toString(16)).padStart(6, '0');
}

//将方向标准化
function NormalDirect(direct) {
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
var SSColors = [SSColor.None, SSColor.Red, SSColor.Green, SSColor.Blue, SSColor.Yellow, SSColor.Pink, SSColor.Cyan, SSColor.White];


var SSMouseAction = {
    None: 0,
    Down: 1,
    Move: 2,
};

var SSMouseState = declare("SSMouseState", null, {
    valid: 0,
    clientX: -1,
    clientY: -1,
    downX: -1,
    downY: -1,
    downIndex: -1,
    upIndex: -1,
    moveIndex: -1,
    clickIndex: -1,
    action: SSMouseAction.None
});

//定义游戏的描述信息
var SSGame = declare("SSGame", null,
  {
      constructor: function (args) {
          console.info("正在创建游戏");
          var canvas = this.canvas = args.canvas;
          var rate = args.rate;
          //根据游戏划分区域,先将map0画满整个区域
          var w = canvas.width * 1, h = canvas.height * 0.8;
          var debug = args.debug || false;
          var map = this.map0 = new SSMap({ debug: debug, canvas: canvas, rows: 13, cols: 9, x: 1 * rate, y: 50 * rate, w: w, h: h });
          var map1 = this.map1 = new SSMap({ debug: debug, canvas: canvas, rows: 2, cols: 9, x: 1 * rate, y: map.rows * map.size + 10 * rate + map.offsetY, w: w, h: h });
          var ctx = this.ctx = map.ctx;

          var cs = [SSColor.Red
            , SSColor.Blue, SSColor.Yellow, SSColor.Green, SSColor.Pink, SSColor.Cyan
          ];

          var lightIndex = Math.floor(0);


          for (var i = 1; i < SSColors.length; i++) {
              var light = new SSLight({ value: SSColors[i], direct: SSDirect.MU, position: map.getPosition(lightIndex++) });
              map.items.push(light);

          }



          var mplane = new SSMPlane({ direct: SSDirect.MD, position: new SSPosition(map.getPosition(lightIndex++)) });
          map.items.push(mplane);

          var mbeveled = new SSMBeveled({
              direct: SSDirect.MU,
              position: new SSPosition(map.getPosition(lightIndex++))
          });
          map.items.push(mbeveled);

          var mlens = new SSMLens({
              direct: SSDirect.MU,
              position: new SSPosition(map.getPosition(lightIndex++))
          });
          map.items.push(mlens);

          for (var i = 0; i < SSColors.length; i++) {
              if (SSColors[i] == SSColor.None)
                  continue;
              var pfilter = new SSPFilter({
                  direct: SSDirect.MU,
                  value: SSColors[i],
                  position: new SSPosition(map.getPosition(lightIndex++))
              });
              map.items.push(pfilter);


              var star = new SSStar({
                  direct: SSDirect.MU,
                  value: SSColors[i],
                  position: new SSPosition(map.getPosition(lightIndex++))
              });
              map.items.push(star);

          }

          var mprism = new SSMPrism({
              direct: SSDirect.MU,
              position: new SSPosition(map.getPosition(lightIndex++))
          });
          map.items.push(mprism);

          var stock = new SSStock({
              direct: SSDirect.MU,
              position: new SSPosition(map.getPosition(lightIndex++))
          });
          map.items.push(stock);



          var g = this;
          g.draw();
          setInterval(function () { g.draw(); }, 16);
      },

      map0: null,
      map1: null,

      draw: function () {
          var g = this;

          var ctx = this.ctx;
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 10000, 10000);

          var maps = [this.map0, this.map1];
          maps.forEach(function (map) {
              ctx.save();
              map.draw();
              ctx.restore();
          });


          //计算游戏结果
          var workItems = g.map0.items;
          //var waitItems = map1.items;

          var stars = [];
          var brightCount = 0, totalCount = 0;
          workItems.forEach(function (item) {
              if (item.type == SSType.Star) {
                  stars.push(item);
                  totalCount++;
                  // var c = g.map0.getCompose(item.position.index);
                  if (item.value == item.passColor) {
                      brightCount++;
                  }
              }
          });

          ctx.font = Math.floor(20 * this.rate) + "px 微软雅黑";
          ctx.textBaseline = "top";
          ctx.strokeStyle = "white";
          ctx.strokeText('star: ' + totalCount + ' bright: ' + brightCount, 0, 0);

      },
      touchstart: function (e) {
          this.action(e);
      },
      touchmove: function (e) {
          this.action(e);
      },
      touchend: function (e) {
          this.action(e);
      },
      action: function (e) {

          var xx = e.xx = this.rate * (iswx ? e.clientX : e.offsetX);

          var yy = e.yy = this.rate * (iswx ? e.clientY : e.offsetY);

          var maps = [this.map0
            , this.map1
          ];
          maps.forEach(function (map) {
              var m = map.normalTouchEvent(e);
              m.event = e;
              if (e.type != 'touchmove' && e.type != 'mousemove')
                  console.log(e.type, m);
              map.action();
          });
      }
  });

var SSMapBase = declare("SSMapBase", null, {
    constructor: function (args) {
        var e = this.canvas = args.canvas;
        var ctx = this.ctx = e.getContext("2d");

        //计算块数
        //var size = this.size;
        //var rows = this.rows = Math.floor(e.height / size);
        //var cols = this.cols = Math.floor(e.width / size);

        var w = args.w, h = args.h;

        //设置偏移量
        var offsetX = this.offsetX = args.x;// + (e.width - cols * size) / 2;
        var offsetY = this.offsetY = args.y;// + (e.height - rows * size) / 2;

        //计算块数
        var rows = this.rows = args.rows;
        var cols = this.cols = args.cols;
        var xsize = Math.floor((w) / cols);
        var ysize = Math.floor((h) / rows);
        var size = this.size = Math.min(xsize, ysize);


        var count = this.count = rows * cols;



        console.info('canvas', e.width, e.height, size, rows, cols);

        var map = this;
        var mouse = map.mouse = new SSMouseState({});
        var items = map.items = [];
        var itemHash = map.itemHash = {};

    },
    //指明工作区,将计算游戏结果
    work: false,
    mouse: null,
    items: null,
    //保存索引位置存储的物体
    itemHash: {},
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

    //判断坐标点是否在地图区域内,pt已经偏移计算进入canvas的画布的相对位置
    isPointInClient: function (pt) {
        var rect = this.getClientRect();
        var c = this.canvas;
        var x = pt.x //- this.offsetX //- c.offsetLeft;
        var y = pt.y //- this.offsetY //- c.offsetTop;
        var at = (x >= 0 && y >= 0 && x <= rect.w && y <= rect.h);
        // console.info(at);
        return at;
    },
    //获取当前map的位置区域,相对于canvas
    getClientRect: function () {
        return { x: this.offsetX, y: this.offsetY, w: this.size * this.cols, h: this.size * this.rows };
    },
    //返回一个标准化的鼠标状态
    normalTouchEvent: function (e) {
        var mx = e.xx - this.offsetX;

        var my = e.yy - this.offsetY;

        var isinmap = this.isPointInClient({ x: mx, y: my });

        var m = this.mouse, c = this.canvas;
        var x = mx //- this.offsetX //- c.offsetLeft;
        var y = my //- this.offsetY //- c.offsetTop;
        m.clientX = x;
        m.clientY = y;

        if (isinmap) {

            var index = this.getIndex(x, y);

            m.clickIndex = -1;
            m.valid = 0;
            if (e.type == 'touchstart' || (e.type == 'mousedown' && e.buttons == 1)) {
                m.action = SSMouseAction.Down;
                m.downIndex = index;
                m.downX = x;
                m.downY = y;
                m.valid = 1;
            }
            else if ((e.type == 'touchmove' || (e.type == 'mousemove' && e.buttons == 1))) {
                var isLarge = ((Math.abs(m.downX - x) > this.size / 3)) || (Math.abs(m.downY - y) > this.size / 3);
                if (!isLarge) {
                    console.error(m.downX, m.downY, 'cur', x, y);
                }
                if (m.action == SSMouseAction.Down && isLarge) {
                    m.action = SSMouseAction.Move;
                    m.valid = 1;
                }
                else if (m.action == SSMouseAction.Move) {
                    m.action = SSMouseAction.Move;
                    m.valid = 1;
                    m.moveIndex = index;
                }
                else {
                    m.valid = 1;
                    m.moveIndex = -1;
                    console.info("not move ??", x, y, m);
                }
            }
            else if (e.type == 'touchend' || (e.type == 'mouseup')) {
                m.action = SSMouseAction.None;
                m.upIndex = index;
                m.valid = 1;
                m.moveIndex = -1;
                if (m.downIndex == m.upIndex) {
                    m.clickIndex = index;
                }
            }
            else {
                m.action = SSMouseAction.None;
                m.upIndex = m.downIndex = m.clickIndex = m.moveIndex = -1;
                m.valid = 0;
            }
            return this.mouse;
        }
        else {
            //不在范围内,立即取消移动和点击
            m.action = SSMouseAction.None;
            m.upIndex = m.downIndex = m.clickIndex = m.moveIndex = -1;
            m.valid = 0;
        }
        return this.mouse;
    },
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
    //获取相对坐标所在的索引位置
    getIndex: function (p, p2) {
        var x = p.x || p.offsetX || p;
        var y = p2 || p.y;
        var col = Math.floor(x / this.size);
        var row = Math.floor(y / this.size);
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows)
            return row * this.cols + col;
        else
            return -1;
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
    //获取索引位置存在的物体,如果没有物体或索引不存在,返回null
    getItem: function (idx) {
        if (!this.validIndex(idx))
            return null;
        return this.itemHash[idx];
    },
    action: function () {
        var m = this.mouse;
        if (m.downIndex != -1) {
            //绘制
            var item = this.getItem(m.downIndex);
            this.moveItem = item;
        }
        if (m.moveIndex != -1 && this.moveItem != null) {
            this.moveItem.moving = true;
            this.moveItem.moveX = m.clientX;
            this.moveItem.moveY = m.clientY;

        }
        if (m.clickIndex != -1) {
            var item = this.getItem(m.clickIndex);
            if (item != null) {
                item.rotate();
            }
        }

        if (m.upIndex != m.downIndex && m.upIndex != -1) {
            var dItem = this.getItem(m.downIndex);
            var uItem = this.getItem(m.upIndex);
            if (uItem == null && dItem != null) {
                console.warn('move ', m.downIndex, '->', m.upIndex, dItem.type);
                dItem.position = this.getPosition(m.upIndex);
            }
        }

        if (m.action == SSMouseAction.None) {
            if (this.moveItem != null)
                this.moveItem.moving = false;
            this.moveItem = null;
            m.upIndex = m.downIndex = m.clickIndex = -1;
        }
    }
});

//定义地图区域
var SSMap = declare("SSMap", SSMapBase,
  {
      constructor: function (args) {

      },

      composes: [],

      //获取指定索引位置的组合对象
      getNextCompose: function (curIndex, direct) {
          var next = this.getNextIndex(curIndex, direct);
          return next >= 0 ? this.composes[next] : null;
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


          ctx.strokeStyle = "green";
          ctx.translate(this.offsetX, this.offsetY);

          ctx.strokeRect(1, 1, this.w - 2, this.h - 2);

          //draw offset area
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

          this.calculate();



          map.ddd = map.ddd || 0;
          this.items.forEach(function (item) {
              //旋转起来看看是否对称
              //item.direct = NormalDirect(item.direct + 1);
          }, this);


          //鼠标调试
          if (map.debug) {
              ctx.fillStyle = "white";
              ctx.font = "20px Arial";
              ctx.fillText(" pt:" + this.mouse.clientX + "," + this.mouse.clientY + " di:" + this.mouse.downIndex + " ui:" + this.mouse.upIndex + " mi:" + this.mouse.moveIndex, 0, 20);

              var e = this.mouse.event;
              if (e)
                  ctx.fillText(" ept:" + e.offsetX + "," + e.offsetY, 0, 50);

          }


          //绘制光线
          this.composes.forEach(function (c) {
              ctx.save();
              c.draw(map);
              ctx.restore();
          });

          this.items.forEach(function (item) {
              ctx.save();
              item.draw(map);
              ctx.restore();
          }, this);


      },

      calculate: function () {
          var g = this;
          var shines = g.shines = [];
          var itemHash = g.itemHash = {};
          //初始化光线组合层
          var composes = g.composes = [];
          for (var i = 0; i < g.count; i++) {
              var c = new SSCompose({ colorIn: [0, 0, 0, 0, 0, 0, 0, 0], colorOut: [0, 0, 0, 0, 0, 0, 0, 0], index: i });
              this.composes.push(c);
          }

          //初始化光源和物品站位,以及星星颜色状态
          g.items.forEach(function (item) {
              itemHash[item.position.index] = item;
              if (item.type == SSType.Star) {
                  item.passColor = SSColor.None;
              }

              if (item.type == SSType.Light) {
                  //灯源本地的输出光
                  var c = g.getCompose(item.position.index);
                  if (c != null)
                      c.colorOut[item.direct] = item.value;

                  //灯源的下一个位置开始计算
                  var shine = new SSShine({
                      direct: NormalDirect(item.direct + 4),
                      color: item.value,
                      index: g.getNextIndex(item.position.index, item.direct)
                  });
                  shines.push(shine);
              }

          });


          var headerShines = [];
          var getNextShines = function (inShine) {

              var c = g.getCompose(inShine.index);
              if (c == null)
                  return [];       //无效

              var color = inShine.color;
              var dir = NormalDirect(inShine.direct);       //传入光线的方向

              //标记当前总体颜色
              c.value |= color;


              var item = g.getItem(inShine.index);      //当前是否存在物体
              if (item == null) {       //没有物体,直接向下传输

                  var nextIndex = g.getNextIndex(inShine.index, NormalDirect(dir + 4));

                  //标记当前颜色
                  c.colorIn[dir] = c.colorOut[NormalDirect(dir + 4)] |= color;

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
                      c.colorOut[s.direct] |= s.color;

                      var ndir = NormalDirect(s.direct + 4), nindex = g.getNextIndex(s.index, s.direct);
                      var ns = new SSShine({ index: nindex, color: s.color, direct: ndir });
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
              if (shines.length > 333) {
                  break;
              }
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
    //光线经过此小格的组合
    value: SSColor.None,
    //索引位置
    index: -1,
    draw: function (map) {

        var ctx = map.ctx;

        var pos = map.getPosition(this.index);
        ctx.save();

        ctx.miterLimit = 2;
        ctx.lineCap = 'round';
        //  ctx.lineJoin = "round";
        ctx.lineWidth = 3;

        ctx.translate(pos.x + map.size / 2, pos.y + 1 + map.size / 2);

        for (var i = 0; i < 8; i++) {
            var color = this.colorIn[i] | this.colorOut[i];
            if (color == SSColor.None)
                continue;
            ctx.beginPath();
            ctx.strokeStyle = ToColor(color);
            ctx.moveTo(0, 0);
            var pt = map.getDirectAxis(i);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
        }

        //this.colorIn.forEach(function (c, i) {
        //    if (c == 0)
        //        return;
        //    ctx.beginPath();
        //    ctx.strokeStyle = ToColor(c);
        //    ctx.moveTo(0, 0);
        //    var pt = map.getDirectAxis(i);
        //    ctx.lineTo(pt.x, pt.y);
        //    ctx.stroke();
        //});

        //this.colorOut.forEach(function (c, i) {
        //    if (c == 0)
        //        return;
        //    ctx.beginPath();
        //    ctx.strokeStyle = ToColor(c);
        //    ctx.moveTo(0, 0);
        //    var pt = map.getDirectAxis(i);
        //    ctx.lineTo(pt.x, pt.y);
        //    ctx.stroke();
        //});


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
      toString: function () { return this.className; },
      type: SSType.None,
      direct: SSDirect.MU,
      name: 'no name',
      //数值,颜色,通过颜色等,根据类型不同,有不同的作用
      value: RGB(222, 222, 222),
      //对象所在的位置信息
      position: null,
      moving: false,
      //是否可以移动
      moveable: true,
      //是否可以转动
      roateable: true,
      rotate: function () {
          this.direct = NormalDirect(this.direct + 1);
          console.log('roate:', this.name, this.type, this.direct);
      },
      ToColor: function (c) { return ToColor(c || this.value); },

      draw: function (map) {
          var ctx = map.ctx;

          if (this.moving) {
              //高亮目标方格框
              var p = this.position;
              var pIndex = map.getIndex(this.moveX, this.moveY);
              if (pIndex >= 0) {
                  var pos = map.getPosition(pIndex);

                  ctx.save();
                  ctx.strokeStyle = "white";
                  ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
                  ctx.restore();
              }

              //设置偏移到物体中心
              ctx.translate(this.moveX, this.moveY - map.size / 3);
              ctx.beginPath();
              ctx.strokeStyle = "white";
              ctx.stroke();



          }
          else {
              var pos = this.position;
              ctx.translate(pos.x + map.size / 2, pos.y + 1 + map.size / 2);
          }


          ctx.save();
          if (map.debug) {
              ctx.strokeStyle = "white";
              ctx.strokeText(this.direct, map.size / 2, 0);
          }

          ctx.restore();
          //ctx.strokeStyle = ToColor(this.value);
          ctx.rotate(Math.PI / 4 * this.direct);
      },
      //当光束照射到物体,调用此方法实现调整光线传输路径,返回光线数组
      shine: function (s) {

          return [];
      }
  });



//石头
var SSStock = declare("SSStock", SSItem, {
    type: SSType.Stock,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    rotate: function () { },
    shine: function (s) {
        return [];
    }
});


var SSStar = declare("SSStar", SSItem, {
    type: SSType.Star,
    passColor: SSColor.None,
    rotate: function () { },
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },

    shine: function (s) {
        this.passColor |= s.color;
        var ns1 = new SSShine({ index: s.index, color: s.color, direct: NormalDirect(s.direct + 4) });
        return [ns1];
    }
});

var SSLight = declare("SSLight", SSItem, {
    type: SSType.Light,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    }
});

var SSMPlane = declare("SSMPlane", SSItem, {
    type: SSType.MPlane,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    shine: function (s) {
        var sub = NormalDirect(this.direct - s.direct);
        var color = s.color// ^ 0xFF0000;
        //Math.abs(this.direct - s.direct);
        if (sub == 0) {
            //var color = s.color ^ 0xFF0000;
            var ns = new SSShine({ index: s.index, color: color, direct: this.direct });
            return [ns];
        }
        if (sub == 1) {
            // var color = s.color ^ 0x00FF00;
            var ns = new SSShine({
                index: s.index, color: color,
                direct: NormalDirect(s.direct + 2)
            });
            return [ns];
        }
        if (sub == 7) {
            //   var color = s.color ^ 0x0000FF;
            var ns = new SSShine({
                index: s.index, color: color,
                direct: NormalDirect(s.direct - 2)
            });
            return [ns];
        }
        return [];
    }
});

var SSMBeveled = declare("SSMBeveled", SSItem, {
    type: SSType.MBeveled,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    shine: function (s) {
        var sub = NormalDirect(this.direct - s.direct);
        if (sub == 0) {
            var ns = new SSShine({
                index: s.index, color: s.color,
                direct: NormalDirect(s.direct - 1)
            });
            return [ns];
        }
        if (sub == 1) {
            var ns = new SSShine({
                index: s.index, color: s.color,
                direct: NormalDirect(s.direct + 1)
            });
            return [ns];
        }
        if (sub == 2) {
            var ns = new SSShine({
                index: s.index, color: s.color,
                direct: NormalDirect(s.direct + 3)
            });
            return [ns];
        }
        if (sub == 7) {
            var ns = new SSShine({
                index: s.index, color: s.color,
                direct: NormalDirect(s.direct - 3)
            });
            return [ns];
        }
        return [];
    }
});

//透镜
var SSMLens = declare("SSMLens", SSItem, {
    type: SSType.MLens,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    shine: function (s) {
        var sub = NormalDirect(this.direct - s.direct);
        var color = s.color ^ 0xFF0000;
        //Math.abs(this.direct - s.direct);
        if (sub == 2 || sub == 6) {
            return [];
        }
        var ns1 = new SSShine({ index: s.index, color: s.color, direct: NormalDirect(s.direct + 4) });

        if (sub == 1 || sub == 5) {
            var ns2 = new SSShine({ index: s.index, color: s.color, direct: NormalDirect(s.direct + 2) });
            return [ns1, ns2];
        }
        if (sub == 3 || sub == 7) {
            var ns2 = new SSShine({ index: s.index, color: s.color, direct: NormalDirect(s.direct - 2) });
            return [ns1, ns2];
        }


        return [ns1];
    }
});

//管道
var SSPFilter = declare("SSPFilter", SSItem, {
    type: SSType.PFilter,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    shine: function (s) {
        var sub = NormalDirect(this.direct - s.direct);


        var color = s.color & this.value;
        if (color == 0)
            return [];
        //Math.abs(this.direct - s.direct);
        if (sub == 7 || sub == 3) {
            var ns1 = new SSShine({ index: s.index, color: color, direct: NormalDirect(s.direct + 4) });

            return [ns1];
        }
        return [];
    }
});


//棱镜
var SSMPrism = declare("SSMPrism", SSItem, {
    type: SSType.MPrism,
    draw: function (map) {
        this.inherited(arguments);
        drawFuncs[this.type](map, this);
    },
    shine: function (s) {
        var sub = NormalDirect(this.direct - s.direct);

        //规定:  入射位置和朝向相同,不会出去任何颜色!
        //      白色从0入射,棱镜朝向为1, 将会依次均分成为rgb三个颜色:3,4,5
        //      光线可逆
        //分析结果如下:
        /*
        差	入射	R	G	B
        1	0	3	4	5
        0	1	n	n	n
        7	2	5	6	n
        6	3	0	n	n
        5	4	n	0	7
        4	5	2	n	0
        3	6	n	2	n
        2	7	n	n	4
        */
        var r = s.color & 0xFF0000;
        var g = s.color & 0x00FF00;
        var b = s.color & 0x0000FF;

        var ret = [];

        if (sub == 0)
            return [];
        if (sub == 1) {
            var nsr = new SSShine({ index: s.index, color: r, direct: NormalDirect(s.direct + 3) });
            var nsg = new SSShine({ index: s.index, color: g, direct: NormalDirect(s.direct + 4) });
            var nsb = new SSShine({ index: s.index, color: b, direct: NormalDirect(s.direct + 5) });
            ret = ret.concat([nsr, nsg, nsb]);
        }

        //////////////////////////////
        if (sub == 7) {
            var nsr = new SSShine({ index: s.index, color: r, direct: NormalDirect(s.direct + 3) });
            var nsg = new SSShine({ index: s.index, color: g, direct: NormalDirect(s.direct + 4) });
            ret = ret.concat([nsr, nsg]);
        }

        /////////////////////////////////////
        //
        if (sub == 6) {
            var nsr = new SSShine({ index: s.index, color: r, direct: NormalDirect(s.direct + 5) });
            ret = ret.concat([nsr]);
        }

        //////////////////////////////////
        if (sub == 5) {
            var nsg = new SSShine({ index: s.index, color: g, direct: NormalDirect(s.direct + 4) });
            var nsb = new SSShine({ index: s.index, color: b, direct: NormalDirect(s.direct + 3) });
            ret = ret.concat([nsg, nsb]);
        }

        /////////////////////////////////
        if (sub == 4) {
            var nsr = new SSShine({ index: s.index, color: r, direct: NormalDirect(s.direct + 5) });
            var nsb = new SSShine({ index: s.index, color: b, direct: NormalDirect(s.direct + 3) });
            ret = ret.concat([nsr, nsb]);
        }

        //////////////////////////////////
        if (sub == 3) {
            var nsg = new SSShine({ index: s.index, color: g, direct: NormalDirect(s.direct + 4) });

            ret = ret.concat([nsg]);
        }
        /////////////////////////////////
        if (sub == 2) {
            var nsb = new SSShine({ index: s.index, color: b, direct: NormalDirect(s.direct + 5) });

            ret = ret.concat([nsb]);
        }
        return ret;
    }
});



module.exports = SSGame;
