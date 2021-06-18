function Slide(){
	var defaults = {
		sliderSelector:'#slider',
		handlerSelector:'.handler',
		bgSelector:'.slider_bg'
	};
	this.selectors = Object.assign(defaults,arguments[0]||{});
	this.init();
}
Slide.prototype.init = function(){
	this.getDOM();
	this.bindDrag();
}
Slide.prototype.getDOM = function(){
	this.slider = document.querySelector(this.selectors.sliderSelector);
	this.handler = document.querySelector(this.selectors.handlerSelector);
	this.bg = document.querySelector(this.selectors.bgSelector);
}
Slide.prototype.bindDrag = function(){
	var that = this;
	var mobile = 'ontouchstart' in window;
	var start = mobile?'touchstart':'mousedown';
	var move = mobile?'touchmove':'mousemove';
	var end = mobile?'touchend':'mouseup';
	var startDeltaX,lastX;
	var max = this.slider.offsetWidth - this.handler.offsetWidth;
	//之所以一开始只绑定start是因为要在mouseover时保证鼠标是按下的,对于手机其实可以一起绑定的
	var drag = {
		start:function(event){
			startDeltaX = (event.clientX || event.touches[0].clientX) - that.handler.offsetLeft;
			document.addEventListener(move,drag.move,false);
			document.addEventListener(end,drag.end,false);
		},
		move:function(){
			lastX = (event.clientX || event.changedTouches[0].clientX) - startDeltaX;
			lastX = Math.max(0,Math.min(max,lastX));
			if(lastX>=max){
				that.handler.classList.add("done");
				that.handler.removeEventListener(start,drag.start,false);
				drag.end();
			}
			that.handler.style.left = lastX + "px";
			that.bg.style.width = lastX + "px";
		},
		end:function(){
			if(lastX<max){
				that.handler.style.left = 0;
				that.bg.style.width = 0;
			}
			document.removeEventListener(move,drag.move,false);
			document.removeEventListener(end,drag.end,false);
		}
	}	
	this.handler.addEventListener(start,drag.start,false);



}