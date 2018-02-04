
if (window) {   //兼容性,兼容普通浏览器和wx
    window.module = { exports: {} };
    window.require = function () { };
}

var _map = new Object();

function _inherited(args) {
    var list = _map[this.constructor.prototype.className];
    var caller = args.callee;
    var fname = caller.nom;
    var f = list[1];
    if (f && fname) {
        f.prototype[fname].apply(this, args);
    }
}

function createNew() {
    return function (args) {
        if (args != null)
            for (var i in args) {
                this[i] = args[i];
            }
        //设置调用子类同名方法(实现父类调用子类)
        this.inherited = _inherited;
    };
};

function declare(className, superClass, props) {
    superClass = superClass || createNew();

    //定义新建类的构造函数,带有一个参数,该参数用于设置指定新的属性
    var realCtor = props.constructor || createNew();


    var thisClass = function (args) {

        superClass.call(this, args);
        realCtor.call(this, args);
    };


    //拷贝子类的原型的属性
    var sp = superClass.prototype;
    var tp = thisClass.prototype;
    for (var i in sp) {
        if (i === "constructor")
            continue;
        var sv = sp[i];
        tp[i] = sp[i];
        if (sv && (typeof sv) === "function") {
            sv.nom = i;
        }
    }

    //设置子类的构造函数指向.如果没有指定构造函数,创建一个空的
    sp.constructor = thisClass;

    //设置新的原型默认属性,同时为在方法上的nom属性上设置方法名称,用于调用基类方法时候的查找方法
    for (var i in props) {
        var sv = props[i];
        tp[i] = props[i];
        if (sv && (typeof sv) === "function") {
            sv.nom = i;
        }
    }


    //设置类名
    tp.className = className;

    //设置继承链,用于调用子类的方法
    var list = _map[className] = [thisClass];
    _map[className] = list.concat(_map[sp.className] || []);

    //window[className] = thisClass;
    return thisClass;
}


module.exports = declare;



// var A = declare("A", null,
//   {
//     constructor: function (args) {
//       console.info("A 构造函数", args);
//     },
//     va: null
//   });

// var B = declare("B", A,
//   {
//     constructor: function (args) {
//       console.info("B 构造函数", args);

//     },
//     vb: null
//   });

// var C = declare("C", B,
//   {
//     constructor: function (args) {
//       console.info("C 构造函数", args);

//     },
//     vc: null
//   });

// var c = new C({ v1: 100, vb: 200 });