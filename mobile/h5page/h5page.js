//php.js
function ucfirst (str) {
  str += ''
  var f = str.charAt(0)
    .toUpperCase()
  return f + str.substr(1)
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

var triggerEvent = function (el, eventName, detail) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, detail);
    //触发eventName后，回调里的event就是上面的event，下面的操作是将detail的的信息挂到event上，否则读取信息要通过event.detail
    if(typeof detail == "object"){
    	for( k in detail){
    		if(detail.hasOwnProperty(k)){
    			event[k]=detail[k]
    		}
    	}
    }
    el.dispatchEvent(event);
};
function getCSS(el,prop){
	  if(prop){
	    return window.getComputedStyle(el)[pfx(prop)];
	  }
	  return window.getComputedStyle(el);
}

(function(root,factory){
	if(typeof define === 'function' && (define.amd || define.cmd )){
		define(factory);
	}else{
		root.myTouch = factory();
	}
})(this,function(){
	var startTouchX,startTouchY,endTouchX,endTouchY,startTS,endTS;
	//简单地支持一下pc端吧
	var is_Mobile = "ontouchstart" in window;
	var startEvent = is_Mobile?"touchstart":"mousedown";
	var moveEvent = is_Mobile?"touchmove":"mousemove";
	var endEvent = is_Mobile?"touchend":"mouseup";
	console.log(is_Mobile,startEvent,moveEvent,endEvent);
	var _opts = {
		swipe:true,
	}
	var _touchHandler = {
			touchstartHandler:function(event){
				startTouchX = event.clientX?event.clientX:event.touches[0].clientX;
				startTouchY = event.clientY?event.clientY:event.touches[0].clientY;
				startTS = Date.now();		
			},
			touchmoveHandler:function(event){
				var curTouchX = event.clientX?event.clientX:event.changedTouches[0].clientX;
				var curTouchY = event.clientY?event.clientY:event.changedTouches[0].clientY;
				event.deltaX = curTouchX - startTouchX;
				event.deltaY = curTouchY - startTouchY;			
			},
			touchendHandler:function(event){
				endTouchX = event.clientX?event.clientX:event.changedTouches[0].clientX;
				endTouchY = event.clientY?event.clientY:event.changedTouches[0].clientY;
				endTS = Date.now();
				var deltaX = endTouchX - startTouchX;
				var deltaY = endTouchY - startTouchY;
				var absY = Math.abs(deltaY);
				var absX = Math.abs(deltaX);
				if(_opts.swipe){
					if(absX>50 || absY>50){
						var detail = {};
						detail.originalEvent = event;
						detail.deltaX = deltaX;
						detail.deltaY = deltaY;
						detail.duration =  (endTS-startTS)/1000;
						var eventName = absX>absY? (deltaX == absX? 'swipeRight':'swipeLeft'):(deltaY==absY? 'swipeDown':'swipeUp');
						detail.type = eventName;
						triggerEvent(event.target,eventName,detail);
						detail.type = "swipe";
						triggerEvent(event.target,"swipe");
					}								
				}

			}
	}


	var myTouch = {
		config:function(obj){
			_opts = Object.assign(_opts,obj || {});
		},
		on:function(selector,type,fn){
			var ele = typeof selector == 'object'?selector:document.querySelector(selector);
			ele.addEventListener(startEvent,_touchHandler.touchstartHandler,false);
			ele.addEventListener(moveEvent,_touchHandler.touchmoveHandler,false);
			ele.addEventListener(endEvent,_touchHandler.touchendHandler,false);
			ele.addEventListener(type,fn,false);
		},
		off:function(selector,type,fn){
			var ele = typeof selector == 'object'?selector:document.querySelector(selector);
		
			ele.removeEventListener(type,fn,false);			
		},
		trigger:function(selector,type){
			var ele = typeof selector == 'object'?selector:document.querySelector(selector);
			triggerEvent(ele,type);
		}
	};
	var exports = {};
	exports.config = myTouch.config;
	exports.on = myTouch.on;
	exports.off = myTouch.off;
	exports.off = myTouch.off;
	return exports;


});

//deal with pfx of transitionent event
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
var arrayify = function ( a ) {
    return [].slice.call( a );
};
//option 
//将添加动画效果和页面切换效果分离
function H5page(option){

	var defaults = {
		wrapSelector:'.h5page-wrap',
		arrow:true,
		mode:'',
		beforeLeave:function(curPage,nextPage,pageNum,pages){

		},
		afterLoad:function(nextPage,curPage,pageNum,pages){

		},
		init:function(pages){

		}

	}

	option = Object.assign(defaults,option || {});
	var h5pageWrap = document.querySelector(option.wrapSelector);
	var pages = arrayify(h5pageWrap.children);
	var pageNum = pages.length;
	var h5method = option.role || h5pageWrap.dataset.role;
	h5pageWrap.classList.add('h5page-' + h5method);
	var transition = pfx('transition');
	var transitionendEvent = whichTransitionEvent();
	var animation = pfx('animation');
	var curPage = 1;
	var nextPage = 1;
	var pageSwitch = false;
	var jsMethod,arrow;
	// var progressBar = document.querySelector('.progress-bar');
	option.arrow &&  (arrow = document.getElementById("arrow"));
	
	var cfgMethod = {
		'alltogether':{
			goto:function(num){
				if(pageSwitch){
					return;
				}
				nextPage = num;
				if(nextPage<1){
					nextPage = 1;
				}else if(nextPage>pageNum){
					nextPage = pageNum;
				}
				if(nextPage == curPage){
					return;
				}
				h5pageWrap.style[pfx('transform')] = 'translateY(' + (-(nextPage-1)*100 +'%') +')';
				pageSwitch = true;
				option.beforeLeave&&option.beforeLeave(curPage,nextPage,pageNum,pages);
				toggleArrow()
			},
			pageTransitionEndEvent:function(event){
				if(event.target != h5pageWrap){
					return;
				}
				option.afterLoad&&option.afterLoad(nextPage,curPage,pageNum,pages);
				curPage = nextPage;
				pageSwitch = false;
			//	updateProgressBar();				
			}
		},
		'step':{
			goto:function(num){
				if(pageSwitch){
					return;
				}
				nextPage = num;
				if(nextPage<1){
					nextPage = 1;
				}else if(nextPage>pageNum){
					nextPage = pageNum;
				}
				if(nextPage == curPage){
					return;
				}
				pages[curPage-1].classList.remove("top");

				var needTransEle = pages[nextPage-1];
				needTransEle.classList.remove("h5page-notShow");
				needTransEle.classList.remove("h5page-hasShown");
				needTransEle.classList.add("h5page-showing");
				needTransEle.classList.add("top");
				pageSwitch = true;
				option.beforeLeave&&option.beforeLeave(curPage,nextPage,pageNum,pages);
				toggleArrow();		
			},
			pageTransitionEndEvent:function(event){
				var index = pages.indexOf(event.target);
				if(index != nextPage-1){
					return;
				}
				if(nextPage>curPage){
					var start = curPage;
					var end = nextPage;
					var cls = 'h5page-hasShown';
				}else{
					var start = nextPage+1;
					var end = curPage+1;
					var cls = 'h5page-notShow';
				}
				for(var i=start;i<end;i++){
					var needTransEle = pages[i-1];
					needTransEle.classList.remove("h5page-showing");
					needTransEle.classList.remove("h5page-notShow");
					needTransEle.classList.remove("h5page-hasShown");
					needTransEle.classList.add(cls);
				}
				curPage != nextPage && option.afterLoad&&option.afterLoad(nextPage,curPage,pageNum,pages);
				curPage = nextPage;
				pageSwitch = false;
			//	updateProgressBar();				

			}
		},
		'twotogether':{
			goto:function(num){
				if(pageSwitch){
					return;
				}
				nextPage = num;
				if(nextPage<1){
					nextPage = 1;
				}else if(nextPage>pageNum){
					nextPage = pageNum;
				}
				if(nextPage == curPage){
					return;
				}
				if(nextPage>curPage){
					var start = curPage;
					var end = nextPage;
					var cls = "h5page-hasShown";
				}else{
					var start = nextPage+1;
					var end = curPage+1;
					var cls = "h5page-notShow";
				}
				for(var i=start;i<end;i++){
					var needTransEle = pages[i-1];
					needTransEle.classList.remove("h5page-showing");
					needTransEle.classList.remove("h5page-notShow");
					needTransEle.classList.remove("h5page-hasShown");
					needTransEle.classList.add(cls);
				}
			 	var needTransEle = pages[nextPage-1];
			 	needTransEle.classList.remove("h5page-notShow");
			 	needTransEle.classList.remove("h5page-hasShown");
			 	needTransEle.classList.add("h5page-showing");

			 	pageSwitch = true;
			 	option.beforeLeave&&option.beforeLeave(curPage,nextPage,pageNum,pages);
			 	toggleArrow();
			},
			pageTransitionEndEvent:function(event){
				var index = pages.indexOf(event.target);
				if(index != nextPage-1){
					return;
				}
				//bug 并不是bug，如果过渡的时候有多个属性发生了改变，则会多次触发transitionend事件
				curPage!=nextPage && option.afterLoad&&option.afterLoad(nextPage,curPage,pageNum,pages);
				curPage = nextPage;
				pageSwitch = false;
			//	updateProgressBar();
			}
		},
		'oneonly':{
			goto:function(num){
				if(pageSwitch){
					return;
				}
				nextPage = num;
				if(nextPage<1){
					nextPage = 1;
				}else if(nextPage>pageNum){
					nextPage = pageNum;
				}
				if(nextPage == curPage){
					return;
				}				
				if(nextPage>curPage){
					var start = curPage+1;
					var end = nextPage;
					var removeCls = "h5page-notShow";
					var addCls = "h5page-showing";
				}else{
					var start = nextPage+1;
					var end = curPage;
					var removeCls = "h5page-showing";
					var addCls = "h5page-notShow";
				}
				for(var i = start;i<=end;i++){
					var needTransEle = pages[i-1];
					needTransEle.classList.remove(removeCls);	
					needTransEle.classList.add(addCls);						
				}		

				pageSwitch = true;
				option.beforeLeave&&option.beforeLeave(curPage,nextPage,pageNum,pages);			
				toggleArrow();
			},
			pageTransitionEndEvent:function(event){
				var index = pages.indexOf(event.target);
				if( index == -1 ){
					return;
				}

				if(nextPage>curPage){
					curPage != nextPage && index == nextPage-1 && option.afterLoad&&option.afterLoad(nextPage,curPage,pageNum,pages);
				}else{
					curPage != nextPage && index == curPage-1 && option.afterLoad&&option.afterLoad(nextPage,curPage,pageNum,pages);
				}
				curPage = nextPage;
				pageSwitch = false;
			//	updateProgressBar();
			}			
		}
	};

	//整体思路是css控制页面切换效果，但是对应的js就那么几个,以后css控制的页面切换多了，就在这里添加cfg,或者直接在option里传入用哪个js
	var cfgPageRole = {
		alltogether:["unite"],//整体动
		step:["seperate"],//下一页先动，动完上一页再动
		twotogether:["threeD",'unite2'],//上下两页一起动
		oneonly:["notMove"]//仅仅动下一页
	}
	if(option.mode){
		jsMethod = option.mode;
	}else{
		for(k in cfgPageRole){
			if(cfgPageRole.hasOwnProperty(k)){
				var arr = cfgPageRole[k];
				if(arr.indexOf(h5method)>-1){
					jsMethod = k;
					break;
				}
			}
		}		
	}

	var mode = cfgMethod[jsMethod];


	function toggleArrow(){
		option.arrow && (arrow.style.display = (nextPage == pageNum? 'none':'block'));
	}



	var fixAndInit = {
		realInit:function(){
			option.init&&option.init(pages);
			mode['pageTransitionEndEvent']&&h5pageWrap.addEventListener(transitionendEvent,mode['pageTransitionEndEvent'],false);
		},
		checkEnvironment:function(){
			//移动设备横屏要等待竖过来再继续
			//横屏的移动设备和pc直接继续fix
			var that = this;
			if(window.orientation === 90 || window.orientation === -90){
				alert("请在竖屏下浏览此页");
				document.addEventListener("orientationchange",function(){
					if(window.orientation === 180 || window.orientation===0){
						//终于是竖屏了
						that.afterCheckEnvironment();
					}
				},false);
			}else{
				this.afterCheckEnvironment();
			}
		},
		afterCheckEnvironment:function(){
			//此时已经是竖屏或者pc
			var clientW = document.documentElement.clientWidth;
			//平板或pc给个最大宽度
			if(clientW>640){
				h5pageWrap.classList.add("h5page-widthFix");
			}
			this.realInit();			
		}
	}

	return {
		init:function(pages){
			fixAndInit.checkEnvironment();
		},
		prev:function(){
			mode['goto'](curPage-1);
		},
		next:function(){
			mode['goto'](curPage+1);
		},
		goto:function(num){
			mode['goto'](num);
		},
		top:function(){
			mode['goto'](1);
		},
		bottom:function(){
			mode['goto'](pageNum);
		},
	}
}

//这里是与animation结合
var animationHandler = {
	animation:pfx('animation'),
	addAnimation:function(pageNum,pages){
		var curPageAnimationEle = pages[pageNum].querySelectorAll("[data-role='animation']");
		for(var i = 0;i<curPageAnimationEle.length;i++){
			var thisEle = curPageAnimationEle[i];
			thisEle.style[this.animation] = thisEle.dataset.method;
		}
	},
	removeAnimation:function(cur,pages){
		//这样写略暴力，但是为了将动画效果和页面切换分离，先这样吧,然而既然我可以知道是从那个页面切过来的，把那一个页面的动画效果去掉就好了，所以有了下面的removeOne
		var pageNum = pages.length;
		for(var i = 0;i<pageNum;i++){
			if(i == cur){
				continue;
			}
			var curPageAnimationEle = pages[i].querySelectorAll("[data-role='animation']");
			for(var j = 0;j<curPageAnimationEle.length;j++){
				var thisEle = curPageAnimationEle[j];
				thisEle.style[this.animation] = '';
			}
		}						
	},
	removeOne:function(num,pages){
		var curPageAnimationEle = pages[num].querySelectorAll("[data-role='animation']");
		for(var j = 0;j<curPageAnimationEle.length;j++){
			var thisEle = curPageAnimationEle[j];
			thisEle.style[this.animation] = '';
		}		
	}
}
var h5pageDefaultCallbacks = {
	alltogether:{
		beforeLeave:function(cur,next,total,pages){
			animationHandler.addAnimation(next-1,pages);
		},
		afterLoad:function(cur,prev,total,pages){
			animationHandler.removeOne(prev-1,pages);
		},
		init:function(pages){
			animationHandler.addAnimation(0,pages);
		},
	},
	step:{
		beforeLeave:function(cur,next,total,pages){
			animationHandler.addAnimation(next-1,pages);
		},
		afterLoad:function(cur,prev,total,pages){
			animationHandler.removeOne(prev-1,pages);
		},
		init:function(pages){
			animationHandler.addAnimation(0,pages);
		},		
	},
	twotogether:{
		beforeLeave:function(cur,next,total,pages){
			animationHandler.addAnimation(next-1,pages);
		},
		afterLoad:function(cur,prev,total,pages){
			animationHandler.removeOne(prev-1,pages);
		},
		init:function(pages){
			animationHandler.addAnimation(0,pages);
		},		
	},
	oneonly:{
		beforeLeave:function(cur,next,total,pages){
			animationHandler.addAnimation(next-1,pages);
		},
		afterLoad:function(cur,prev,total,pages){
			animationHandler.removeAnimation(cur-1,pages);
		},
		init:function(pages){
			animationHandler.addAnimation(0,pages);
		},		
	}
}
var h5pageDefaultInit = {
	threeD:function(){
		var winH = getCSS(document.documentElement,"height");
		var styleEle = document.createElement("style");
		//是一个很笨的方法，这里的前缀也不能用上面的pfx，浏览器不认
		styleEle.innerHTML = ".h5page-threeD .h5page-notShow{ -webkit-transform: translate3d(0," + winH + ", 0) rotate3d(1, 0, 0, -90deg); transform: translate3d(0, " + winH +", 0) rotate3d(1, 0, 0, -90deg);";
		document.head.appendChild(styleEle);
	}
}