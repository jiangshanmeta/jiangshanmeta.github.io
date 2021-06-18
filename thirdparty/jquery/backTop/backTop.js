$(document).ready(function(){
	$(window).on("scroll",function(){
	if($(document).scrollTop()>$(window).height()){
		$("#backTop").removeClass("hidden");
	}else{
		$("#backTop").addClass("hidden");
	}
	})

	var backTopTimer;
	$("#backTop").on("click",function(){
		$('html,body').animate({scrollTop:0},1000);
	})
})