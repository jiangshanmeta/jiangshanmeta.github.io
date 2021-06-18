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
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (typeof Object.create != 'function') {
  Object.create = (function() {
    function Temp() {}
    var hasOwn = Object.prototype.hasOwnProperty;

    return function (O) {
      if (typeof O != 'object') {
        throw TypeError('Object prototype may only be an Object or null');
      }

      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null; 

      if (arguments.length > 1) {

        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }

      return obj;
    };
  })();
}
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      "use strict";
      if (target === undefined || target === null)
        throw new TypeError("Cannot convert first argument to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
  });
}
// https://gist.github.com/eligrey/384583
if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop, handler) {
      var
        oldval = this[prop]
      , newval = oldval
      , getter = function () {
        return newval;
      }
      , setter = function (val) {
        oldval = newval;
        return newval = handler.call(this, prop, oldval, val);
      }
      ;
      
      if (delete this[prop]) { // can't watch constants
        Object.defineProperty(this, prop, {
            get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}

// object.unwatch  https://gist.github.com/eligrey/384583
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}

function gettype(obj){
  return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}
function is_array(arr){
	return Array.isArray(arr);
}
function is_string(str){
	return (typeof str)==='string';
}
function is_int(num){
	return num===+num && !(num%1);
}
function is_float(num){
	return num===+num && !!(num%1);
}
function is_numeric(num){
	return (typeof num === 'number') || ( (typeof num === 'string') && num!=='' && !isNaN(+num)  );
}

function in_array (needle, haystack, argStrict) { 
	var key = ''
	var strict = !!argStrict
	if (strict) {
		for (key in haystack) {
  			if (haystack[key] === needle) {
				return true
			}
		}
	} else {
		for (key in haystack) {
			if (haystack[key] == needle) { 
				return true
			}
		}
	}
	return false
}

function array_sum(arr){
	var sum = 0;
	var key;
	if(!is_array(arr)){
		return 0;
	}
	for(key in arr){
		if(is_numeric(arr[key])){
			sum += (+arr[key]);
		}
	}
	return sum;
}

function ucfirst(str){
	str+='';
	var f = str.charAt(0).toUpperCase();
	return f + str.substr(1);
}

function camelize(str){
	return str[0].toLowerCase() + str.replace(/[\s_-]+([a-zA-Z])/g,function(all,letter){
		return letter.toUpperCase();
	}).substr(1);
}
function deg2rad(angle){
	return Math.PI*angle/180;
}

function rad2deg(angle){
	return angle*180/Math.PI;
}
// https://github.com/sindresorhus/deep-assign/blob/master/index.js
// deepAsign deepCopy 
(function(window){
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    return Object(val);
  }
  function assignKey(to, from, key) {
    var val = from[key];

    if (val === undefined || val === null) {
      return;
    }

    if (hasOwnProperty.call(to, key)) {
      if (to[key] === undefined || to[key] === null) {
        throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
      }
    }

    if(gettype(val)==='object' || gettype(val)==='array'){
      if(!hasOwnProperty.call(to, key)){
        if(gettype(val)==='array'){
          to[key] = [];
        }else{
          to[key] = {};
        }
      }
      to[key] = assign(to[key],from[key]);
    }else{
      to[key] = val;
    }

  }
  function assign(to, from) {
    if (to === from) {
      return to;
    }

    from = Object(from);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        assignKey(to, from, key);
      }
    }

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          assignKey(to, from, symbols[i]);
        }
      }
    }

    return to;
  }

  var deepAssign = function(target){
    target = toObject(target);

    for (var s = 1; s < arguments.length; s++) {
      assign(target, arguments[s]);
    }

    return target; 
  }

  window.deepAssign = deepAssign;

  var deepCopy = function(target){
    return assign({},target);
  }

  window.deepCopy = deepCopy;

  if (!Array.prototype.deepCopy) {
      Array.prototype.deepCopy = function() {
        return assign([],this);
      };
  }


})(window);

// ajax
(function(window){

  function buildParams(prefix,val,add){
    var typ = gettype(val);
    var name;
    if(typ=='array'){
      val.forEach(function(value,index){
        buildParams(prefix+'['+ (typeof value=='object'?index:'')+']',value,add);
      })
    }else if(typ=='object'){
      for(name in val){
        buildParams(prefix+'['+name+']',val[name],add);
      }
    }else{
      add(prefix,val)
    }
  }
  function params(obj){
    obj = toObject(obj);
    var prefix;
    var s = [];
    var add = function(key,value){
      value = value==null?'':value;
      s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
    for(prefix in obj){
      buildParams(prefix,obj[prefix],add);
    }
    return s.join("&");
  }  

  var ajax_post = (function(){
      var dft_opt = {
          m: 'index',
          a: 'index',
          url: null,
          plus: '',
          data: {},
          successCallback : null,
      };
      return function(opts){
          opts = Object.assign({},dft_opt,opts);
          if (opts.url==null){
              var url = req_url_template.str_supplant({ctrller:opts.m,action:opts.a})+'/'+opts.plus;
          } else {
              var url = opts.url+'/'+opts.plus;
          }

          var request = new XMLHttpRequest();
          request.open('POST', url, true);
          request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
          request.onreadystatechange = function(){
            if(request.readyState==4){
              if((request.status>=200 && request.status<300) || request.status==304){
                var json = JSON.parse(request.responseText);
                if(json.rstno>0){
                  opts.successCallback&&opts.successCallback(json);
                }else{
                  alert(json.data['err']['msg']);
                }
                
              }else{
                alert('网络故障');
              }
            }
          }

          request.send(params(opts.data));


      }



  })();

  window.ajax_post = ajax_post;
})(window);



//impress.js
var pfx = (function () {
    var style = document.createElement('dummy').style,
        prefixes = 'Webkit Moz O ms Khtml'.split(' '),
        memory = {};
    return function ( prop ) {
        if ( typeof memory[ prop ] === "undefined" ) {
            //实现一个ucfirst
            var ucProp  = ucfirst(prop),
            //拿到前缀化的属性名
                props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
            
            memory[ prop ] = null;
            for ( var i in props ) {
                if ( style[ props[i] ] !== undefined ) {
                    memory[ prop ] = props[i];
                    break;
                }
            }
        }
        
        return memory[ prop ];
    };
})();

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

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var localStorageUtil = {
  get:function(key){
    return JSON.parse(localStorage.getItem(key));
  },
  set:function(key,value){
    // set的时候处理成json这样就能存储数组和对象
    localStorage.setItem(key,JSON.stringify(value));
  },
  remove:function(key){
    if(arguments.length==0){
      localStorage.clear();
    }else{
      localStorage.removeItem(key);
    }
    
  }
};

var cookieUtil = {
    get: function (name){
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null,
            cookieEnd; 
        if (cookieStart > -1){
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1){
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue;
    },
    set: function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }
        if (path) {
            cookieText += "; path=" + path;
        }
        if (domain) {
            cookieText += "; domain=" + domain;
        }
        if (secure) {
            cookieText += "; secure";
        }
        document.cookie = cookieText;
    },
    unset: function (name, path, domain, secure){
        this.set(name, "", new Date(0), path, domain, secure);
    }
};