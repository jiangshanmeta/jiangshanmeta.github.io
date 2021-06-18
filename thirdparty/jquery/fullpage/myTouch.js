(function($){
var startTouchX;
var startTouchY;
var endTouchX;
var endTouchY;
function touchstartHandler(event){
	startTouchX = event.originalEvent.touches[0].clientX;
	startTouchY = event.originalEvent.touches[0].clientY;
}
function touchmoveHandler(event){
	event.preventDefault();
}
function touchendhandler(event){
	endTouchX = event.originalEvent.changedTouches[0].clientX;
	endTouchY = event.originalEvent.changedTouches[0].clientY;
	var deltaY = endTouchY - startTouchY;
	var deltaX = endTouchX -startTouchX;
	var absY = Math.abs(deltaY);
	var absX = Math.abs(deltaX);
	if(absX>50 || absY>50){
		if(absX>absY){
		//水平
		if(deltaX == absX){
				$(event.target).trigger("swipeRight");
		}else{
			$(event.target).trigger("swipeLeft");
		}
	}else{
		//垂直
		if(deltaY==absY){
			$(event.target).trigger("swipeDown");
		}else{
			$(event.target).trigger("swipeUp");
		}
	}
	}

}
$(window).on("touchstart",touchstartHandler);
$(window).on("touchmove",touchmoveHandler);
$(window).on("touchend",touchendhandler);

})(jQuery)