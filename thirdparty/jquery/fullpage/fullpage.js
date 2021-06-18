(function($){
	$.fn.fullpage = function(opts){
		var defaults = {
			speed:800,   //滚动速度
			navigation:true,	  //是否有导航
			navpos:"right",	//导航的位置
		//	navigationTooltips:["section1"],//导航的内容
			continuous:false,		//是否在垂直方向上连续
			keyboard : true,				//是否支持键盘上下键切换
			mobile : true,					//是否支持移动端的touch事件 //如果设定为false，则在手机上无法正常使用
			method : "swing",				//jQuery动画切换效果，然而默认的只有linear 和swing
			horizontal : false		
		}

		var opts = $.extend({},defaults,opts || {});
		return this.each(function(){
			var selector = $(this);
			var dataset = {};

			if(selector.data("speed")){
				dataset.speed = selector.data("speed");
			}
			if(selector.data("navpos")){
				dataset.navpos = selector.data("navpos");
			}
			if(selector.data("method")){
				dataset.method = selector.data("method");
			}

			var opt = $.extend({},opts,dataset);
			var size = selector.find(".section").size();
			var pageH = $("body").height();
			var pageW = $("body").width();
			var index = 0;
			var direction ;
	
			var navigationWrap;
			var moving = false;
			var navigationTooltipWrap;
			//导航条有关设置
			var setNavbar = function(){
			    navigationWrap = $("<div class='navigationWrap '></div>");
			    var navClass = "";
				switch(opt.navpos){
					case "right":
						navClass = "right-nav vertical-nav";
						break;
					case "left":
						navClass = "left-nav vertical-nav";
						break;
					case "bottom":
						navClass = "bottom-nav horizontal-nav";	
						break;
					default:
						navClass = "right-nav vertical-nav";										
				}
				navigationWrap.addClass(navClass);
				var navHTML = "";
				var template = "<div class='nav {isActive}' data-index='{i}'></div>";
				for(var i =0;i<size;i++){
					navHTML += template.str_supplant({isActive:(i==0)?"active":"",i:i});
				}
				navigationWrap.html(navHTML);
				$("body").append(navigationWrap);
				navigationWrap.delegate(".nav","click",function(){
					var index = $(this).data("index");
					goto(index);
				});	
				//导航条tooltip设置
				if($.type(opt.navigationTooltips).toLowerCase() == "array"){
					navigationTooltipWrap = $("<div class='navigationTooltipWrap translataY50'></div>");
					if(opt.navpos =="right" || opt.navpos =="left"){
						navigationTooltipWrap.addClass("translataY50");
					}else{
						navigationTooltipWrap.addClass("translataX50");
					}
					$('body').append(navigationTooltipWrap);

					navigationWrap.delegate(".nav","mouseover mouseenter",function(event){
						var index = $(this).data("index");
						var y = $(this).offset().top;
						var x = $(this).offset().left;
						var w = $(this).width();
						//计算求得导航点中心位置
						var centerX = x+w/2;
						var centerY = y+w/2;
						var text = opt.navigationTooltips[index];
						navigationTooltipWrap.text(text);
		
						switch(opt.navpos){
							case "right":
								navigationTooltipWrap.css({right:(pageW-centerX+15),top:(centerY)})
								break;
							case "left":
								navigationTooltipWrap.css({left:(centerX+15),top:(centerY)})
								break;
							case "bottom":
								navigationTooltipWrap.css({bottom:(pageH-centerY+15),left:(centerX)})
								break;
							default:
								navigationTooltipWrap.css({right:(pageW-centerX+15),top:(centerY)})								
						}

						if(navigationTooltipWrap.is(":animated")){
							navigationTooltipWrap.stop(true,true);
						}
						navigationTooltipWrap.fadeIn("200");
					});
					navigationWrap.delegate(".nav","mouseout mouseleave",function(event){
						navigationTooltipWrap.fadeOut("200");
					})
				}
			}
			//goto函数负责对要进行的页码进行预处理
			var goto = function(num){
				if(num<0){
					if(opt.continuous){
						moveTo(size-1);
					}
					return;
				}
				if(num<size ){
					moveTo(num);
					return;
				}
				if(num==size){
					if(opt.continuous){
						moveTo(0);
					}
				}					
			}
			//moveTo函数负责真正的运动
			var moveTo = function(num){
				if(opt.navigation){
					activeNav(num);
				}
				moving = true;
				//onLeave的执行
				if(opt.onLeave){
					opt.onLeave(index)
				}
				var moveCallback = function(){
					moving = false;
					index = num;
					//afterLoad的执行
					if(opt.afterLoad){
						opt.afterLoad(index);
					}					
				}
				if(!opt.horizontal){
					selector.animate({top:-num*pageH},opt.speed,opt.method,moveCallback);		
				}else{
					selector.animate({left:-num*pageW},opt.speed,opt.method,moveCallback);
				}				
			}
			var mousewheelHandler = function(event){
				if(moving){return;}
				direction = event.originalEvent.wheelDelta? -event.originalEvent.wheelDelta : event.originalEvent.detail;
				goByDirection();
			}
			var keyboardHandler = function(event){
				if(moving){return;}
				//in_array
				var which = event.which;
				if(!in_array(which,[37,38,39,40])){return;}
				if(in_array(which,[37,38])){
					direction = -1;
				}else{
					direction = 1;
				}
				goByDirection();				
			}
			var activeNav = function(num){
				navigationWrap.find(".nav").eq(num).addClass("active").siblings().removeClass("active");
			}
			var goByDirection = function(){
				if(direction>0){
					goto(index + 1);
				}else{
					goto(index - 1);
				}	
			}

			var initHorizontal = function(){
				selector.css({width:size*100+"%"});
				selector.find(".section").addClass("pull-left").css({width:(100/size).toFixed(2)+"%"});
			}
			selector.addClass("sectionWrap");
			if(opt.horizontal){
				initHorizontal();
			}
			if(opt.navigation){
				setNavbar();
			}
			$(document).on("mousewheel DOMMouseScroll",mousewheelHandler);
			if(opt.keyboard){
				$(document).on("keyup",keyboardHandler);
			}
			if(opt.mobile){
				$(document).on("swipeDown swipeRight",function(event){
					direction = -1;
					goByDirection();
				})
				$(document).on("swipeUp  swipeLeft",function(event){
					direction = 1;
					goByDirection();
				})		

			}
			var resize;
			$(window).on("resize",function(){
				if(resize){clearTimeout(resize);}
				resize = setTimeout(function(){
					 pageH = $("body").height();
					 pageW = $("body").width();
					 goto(index);
				},500)

			})
			goto(0);

		})
	}


})(jQuery)