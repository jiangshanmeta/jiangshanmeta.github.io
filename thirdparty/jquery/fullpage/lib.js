if (!String.prototype.str_supplant) {
    String.prototype.str_supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
    };
}
function isset() {

  var a = arguments,
    l = a.length,
    i = 0,
    undef;

  if (l === 0) {
    throw new Error('Empty isset');
  }

  while (i !== l) {
    if (a[i] === undef || a[i] === null) {
      return false;
    }
    i++;
  }
  return true;
}

//记不清有没有用过了，放在noJquery命名空间下了
function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (Object.prototype.toString.call(value) == '[object Array]') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}
//http://phpjs.org/functions/in_array/
function in_array(needle, haystack, argStrict) {
  var key = '',
    strict = !! argStrict;
  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true;
      }
    }
  }
  return false;
}
  //  discuss at: http://phpjs.org/functions/ucfirst/
function ucfirst (str) {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}
//require jquery and jquery-blockui
function ajax_post(opts){
    var dft_opt = {
        m: 'index',
        a: 'index',
        plus: '',
        data: {},
        callback: function(json){
           console.log(json);
        }
    };
    opts = $.extend({},dft_opt,opts);
    $.blockUI();
    var url = req_url_template.str_supplant({ctrller:opts.m,action:opts.a})+'/'+opts.plus;
    $.ajax(
        {type: "POST",
        url: url,
        dataType:"json",
        data: opts.data}
    ).done(function(json) {
        opts.callback(json);
    }).fail(function() {
        alert( "error" );
    }).always(function() {
        $.unblockUI();
    });
}

function ajax_get(opts){
    var dft_opt = {
        m: 'index',
        a: 'index',
        id: '',
        data: {},
        callback: function(json){
            console.log(json);
        }
    };
    opts = $.extend({},dft_opt,opts);
    $.blockUI();
    var url = req_url_template.str_supplant({ctrller:opts.m,action:opts.a});
    url = url + '/'+opts.id;
    $.each(opts.data,function(k,v){
        url = url + '&'+k+'='+v;
    });
    $.ajax(
        {type: "GET",
        url: url,
        dataType:"json"}
    ).done(function(json) {
        opts.callback(json);
    }).fail(function() {
        alert( "error" );
    }).always(function() {
        $.unblockUI();
    });
}
function lightbox(opts) {
    var default_opts = {
        size:'m',
        url:''
    };

    var width = 720;
    var height = 500;
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    if (opts.size=="xl"){
        width = windowWidth - 300;
        height = windowHeight - 100;
    } else if (opts.size=="l"){
        width = 960;
        height = 700;

    } else if (opts.size=="s"){
        width=600;
        height = 400;
    }


    opts = $.extend(default_opts,opts);
    $.fancybox.open({href : opts.url,type:'ajax',autoSize:false,autoHeight:false,autoWidth:false,width:width,height:height});
    return;
}

//form 序列化 https://github.com/macek/jquery-serialize-object
(function(root, factory) {

  // AMD
  if (typeof define === "function" && define.amd) {
    define(["exports", "jquery"], function(exports, $) {
      return factory(exports, $);
    });
  }

  // CommonJS
  else if (typeof exports !== "undefined") {
    var $ = require("jquery");
    factory(exports, $);
  }

  // Browser
  else {
    factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(exports, $) {

  var patterns = {
    validate: /^[a-z_][a-z0-9_]*(?:\[(?:\d*|[a-z0-9_]+)\])*$/i,
    key:      /[a-z0-9_]+|(?=\[\])/gi,
    push:     /^$/,
    fixed:    /^\d+$/,
    named:    /^[a-z0-9_]+$/i
  };

  function FormSerializer(helper, $form) {

    // private variables
    var data     = {},
        pushes   = {};

    // private API
    function build(base, key, value) {
      base[key] = value;
      return base;
    }

    function makeObject(root, value) {

      var keys = root.match(patterns.key), k;

      // nest, nest, ..., nest
      while ((k = keys.pop()) !== undefined) {
        // foo[]
        if (patterns.push.test(k)) {
          var idx = incrementPush(root.replace(/\[\]$/, ''));
          value = build([], idx, value);
        }

        // foo[n]
        else if (patterns.fixed.test(k)) {
          value = build([], k, value);
        }

        // foo; foo[bar]
        else if (patterns.named.test(k)) {
          value = build({}, k, value);
        }
      }

      return value;
    }

    function incrementPush(key) {
      if (pushes[key] === undefined) {
        pushes[key] = 0;
      }
      return pushes[key]++;
    }

    function encode(pair) {
      switch ($('[name="' + pair.name + '"]', $form).attr("type")) {
        case "checkbox":
          return pair.value === "on" ? true : pair.value;
        default:
          return pair.value;
      }
    }

    function addPair(pair) {
      if (!patterns.validate.test(pair.name)) return this;
      var obj = makeObject(pair.name, encode(pair));
      data = helper.extend(true, data, obj);
      return this;
    }

    function addPairs(pairs) {
      if (!helper.isArray(pairs)) {
        throw new Error("formSerializer.addPairs expects an Array");
      }
      for (var i=0, len=pairs.length; i<len; i++) {
        this.addPair(pairs[i]);
      }
      return this;
    }

    function serialize() {
      return data;
    }

    function serializeJSON() {
      return JSON.stringify(serialize());
    }

    // public API
    this.addPair = addPair;
    this.addPairs = addPairs;
    this.serialize = serialize;
    this.serializeJSON = serializeJSON;
  }

  FormSerializer.patterns = patterns;

  FormSerializer.serializeObject = function serializeObject() {
    return new FormSerializer($, this).
      addPairs(this.serializeArray()).
      serialize();
  };

  FormSerializer.serializeJSON = function serializeJSON() {
    return new FormSerializer($, this).
      addPairs(this.serializeArray()).
      serializeJSON();
  };

  if (typeof $.fn !== "undefined") {
    $.fn.serializeObject = FormSerializer.serializeObject;
    $.fn.serializeJSON   = FormSerializer.serializeJSON;
  }

  exports.FormSerializer = FormSerializer;

  return FormSerializer;
}));

function refresh(){
    window.location.reload(true);
}
function gotoUrl(url){
    window.location.href = url;
}
function gotoPage(m,a){
    window.location.href = req_url_template.str_supplant({ctrller:m,action:a});;
}
function gotoPrev(){
  window.history.go(-1);
}
var alertPlug = {
  //modal 先留着吧
    modal : function(opts){
        var dft_opt = {
            m: 'index',
            a: 'index',
            id: '',
            data: {},
        };
        opts = $.extend({},dft_opt,opts);
        $.blockUI({ css: {
                border: 'none',
                padding: '15px',
                backgroundColor: '#000',
                'border-radius': '5px',
                opacity: .7,
                color: '#fff'
            },
            message:  '<h3>请稍候</h3>'  });
        var url = req_url_template.str_supplant({ctrller:opts.m,action:opts.a});
        url = url + '/'+opts.id;
        $.each(opts.data,function(k,v){
            url = url + '&'+k+'='+v;
        });
        $("#common_modal").html('').load(url,function(){
            $.unblockUI();
            $(this).modal('show').css({
                'top': function () { //vertical centering
                    return (($(this).height() - $('#common_modal .modal-dialog').height())/ 2);
                }
            });
        });
    },

    alert: function(msg,type){
        if(type == 's'){
            title = "成功了";
        } else {
            title = "出错了";
        }
        var _html = '<div class="modal" id="popAlertbox" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
  '<div class="modal-dialog"><div class="modal-content"><div class="modal-header">'+
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
        '<h4 class="modal-title" id="myModalLabel">{title}</h4>'+
      '</div><div class="modal-body">{msg}</div>'+
      '<div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">关闭</button></div>'+
    '</div></div></div>';
        _html = _html.str_supplant({title:title,msg:msg});
        $("#popAlertbox").remove();
        $('.page').append(_html);
        //based on bootstrap modal.js
        $('#popAlertbox').modal('show').css({
            'top': function () { //vertical centering
                return (($(this).height() - $('#popAlertbox .modal-dialog').outerHeight(true))/ 2);
            }
        });
    },
    close:function(){
        $.unblockUI();
    }
}
function tab_load(module,menu){
    $("#nav-"+module+" li").removeClass("active");
    $("#nav-"+module+"-"+menu).addClass("active");
    $(".info-"+module).addClass("hidden");
    $("#info-"+module+"-"+menu).removeClass("hidden");  
}

//baseon pageswipe
function openPhotoSwipe(id,allPic){
    var gallery = new PhotoSwipe(
        $(".pswp")[0],
        PhotoSwipeUI_Default,
        allPic,
         {index:id-1,bgOpacity:0.9,shareEl:false,fullscreenEl:false}
        );
    gallery.init();
}


//由于万恶的浏览器兼容性，在监听transitionend的时候需要判断那个transitionend，这还不是重点，重点是trigger的时候只能如果trigger了多个transitionend，都会执行。。要保证只能trigger一个
//以后监听transitionend和animationend就不用做兼容了，直接根据返回的结果绑定时间就好了
//主要用于h5页面
function whichTransitionEvent(){  
    var t;  
    var el = document.createElement('p');  
    var transitions = {  
      'transition':'transitionend',  
      'OTransition':'oTransitionEnd',  
      'MozTransition':'mozTransitionEnd',  
      'WebkitTransition':'webkitTransitionEnd',  
      'MsTransition':'msTransitionEnd'  
    }  
    for(t in transitions){  
        if( el.style[t] !== undefined ){  
            return transitions[t];  
        }  
    }  
}

//这个函数可以被扔掉了，因为有一个更通用的函数，然而还不能删因为有地方在用。。。。
function whichTransition(){  
    var t;  
    var el = document.createElement('p');  
    var transitions = {  
      'transition':'transition',  
      'OTransition':'OTransition',  
      'MozTransition':'MozTransition',  
      'WebkitTransition':'WebkitTransition',  
      'MsTransition':'MsTransition'  
    }  
    for(t in transitions){  
        if( el.style[t] !== undefined ){  
            return transitions[t];  
        }  
    }  
}
//这个函数也可以被删了，确实可以被删了，绝对没有地方再用这个函数，以后也不要用
function whichAnimation(){  
    var t;  
    var el = document.createElement('p');  
    var animations = {  
      'animation':'animation',  
      'OAnimation':'OAnimation',  
      'MozAnimation':'MozAnimation',  
      'WebkitAnimation':'WebkitAnimation',  
      'MsAnimation':'MsAnimation'  
    }  
    for(t in animations){  
        if( el.style[t] !== undefined ){  
            return animations[t];  
        }  
    }  
}

//顺便还有animationend的监听
function whichAnimationEvent(){  
    var t;  
    var el = document.createElement('p');  
    var animations = {  
      'animation':'animationend',  
      'OAnimation':'oAnimationEnd',  
      'MozAnimation':'mozAnimationEnd',  
      'WebkitAnimation':'webkitAnimationEnd',  
      'MsAnimation':'msAnimationEnd'  
    }  
    for(t in animations){  
        if( el.style[t] !== undefined ){  
            return animations[t];  
        }  
    }  
}








//自定义事件
var triggerEvent = function (el, eventName, detail) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, detail);
    el.dispatchEvent(event);
};


var noJquery = (function(document,window){
    //import from https://github.com/impress/impress.js
    //利用闭包存储前缀化的结果，判断要加哪个前缀使用的方法 和上面的差不多，只是属性名是传入的，而不是写死在代码里
    //然而基本上就css3的几个属性需要加前缀了

    var pfxMemory = {};
    var dummyEl  = document.createElement('dummy');
    var pfxStyle = dummyEl.style;
    var prefixes = 'Webkit Moz O ms Khtml'.split(' ');


    var pfx = function ( prop ) {
            if ( typeof pfxMemory[ prop ] === "undefined" ) {
                //实现一个ucfirst
                var ucProp  = ucfirst(prop),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                
                pfxMemory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        pfxMemory[ prop ] = props[i];
                        break;
                    }
                }
            
            }
            
            return pfxMemory[ prop ];
    };


    //因为选择元素所得到的结果是一个类数组而不是数组
    var arrayify = function ( a ) {
        return [].slice.call( a );
    };

    var toNumber = function(numeric,fallback){
        return isNaN(numeric)? (fallback|| 0) : Number(numeric);
    };
    var toPercentage = function(numeric){
      return toNumber(numeric) +'%';
    };
    var toPixel = function(numeric){
        return toNumber(numeric) + 'px';
    };
    var translate = function ( t,mode ) {
        if(mode == 'pix'){
          var x = toPixel(t.x);
          var y = toPixel(t.y);
          var z = toPixel(t.z);
        }else{
          var x = toPercentage(t.x);
          var y = toPercentage(t.y);
          var z = toPercentage(t.z);
        }
        return " translate3d(" + x + "," + y + "," + z + ") ";
    };    
    var rotate = function ( r) {
        var rX = " rotateX(" + toNumber(r.x) + "deg) ",
            rY = " rotateY(" + toNumber(r.y) + "deg) ",
            rZ = " rotateZ(" + toNumber(r.z) + "deg) ";
        
        return rX+rY+rZ;
    };
    var scale = function ( s ) {
        return " scale(" + toNumber(s) + ") ";
    };    

    return {
          css:function(el,props){
            var key, pkey;
            for ( key in props ) {
                if ( props.hasOwnProperty(key) ) {
                    pkey = pfx(key);
                    if ( pkey !== null ) {
                        el.style[pkey] = props[key];
                    }
                }
            }
            return el;          
          },
          getCSS:function(el,prop){
              if(prop){
                return window.getComputedStyle(el)[pfx(prop)];
              }
              return window.getComputedStyle(el);
          },
          byId:function(id){
              return document.getElementById(id);
          },
          getOne:function(selector,context){
              context = context || document;
              return context.querySelector(selector);            
          },
          getAll:function(selector,context){
              context = context || document;
              return arrayify(context.querySelectorAll(selector));            
          },
          getData:function(el,dataName){
              if(dataName){
                return el.dataset[dataName];
              }
              return el.dataset;
          },  
          addClass:function(el,className){
              el.classList.add(className);
          },
          removeClass:function(el,className){
              el.classList.remove(className);
          },
          hasClass:function(el,className){
              return el.classList.contains(className);
          },
          toggleClass:function(el,className){
              el.classList.toggle(className);
          },
          typeOf:function(value){
              var s = typeof value;
              if (s === 'object') {
                  if (value) {
                      if (Object.prototype.toString.call(value) == '[object Array]') {
                          s = 'array';
                      }
                  } else {
                      s = 'null';
                  }
              }
              return s;              
          },
          pfxTransitionEvent:function(){
              if(!pfxMemory['transitionend']){
                  var transitions = {  
                    'transition':'transitionend',  
                    'OTransition':'oTransitionEnd',  
                    'MozTransition':'mozTransitionEnd',  
                    'WebkitTransition':'webkitTransitionEnd',  
                    'MsTransition':'msTransitionEnd'  
                  }
                  for(t in transitions){  
                    if( pfxStyle[t] !== undefined ){  
                        pfxMemory['transitionend'] = transitions[t];
                        break;  
                    }  
                  }                                      
              }
              return pfxMemory['transitionend'];
          },
          pfxAnimationEvent:function(){
              if(!pfxMemory['animationend']){
                  var animations = {  
                   'animation':'animationend',  
                    'OAnimation':'oAnimationEnd',  
                    'MozAnimation':'mozAnimationEnd',  
                    'WebkitAnimation':'webkitAnimationEnd',  
                    'MsAnimation':'msAnimationEnd'  
                  }
                  for(t in animations){  
                    if( pfxStyle[t] !== undefined ){  
                        pfxMemory['animationend'] = animations[t];
                        break;  
                    }  
                  }                                      
              }
              return pfxMemory['animationend'];
          },












    }
})(document,window);