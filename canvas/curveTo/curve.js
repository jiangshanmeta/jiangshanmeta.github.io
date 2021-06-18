    (function(){
	  var canvas=document.getElementById('canvas');
	  var code=document.getElementById('code');
	  canvas.width=500;
	  canvas.height=500;
	  var context=canvas.getContext('2d');
	  var points={},drag=null,mouseP;
	  init(canvas.className=='quadratic');
	  function init(quadratic){
	    points.p1={x:100,y:250};
		points.p2={x:400,y:250};
		if(quadratic){
		  points.cp1={x:250,y:100};
		}else{
		  points.cp1={x:150,y:100};
		  points.cp2={x:350,y:100};
		}
	    canvas.onmousedown=dragStart;
		canvas.onmousemove=dragging;
		canvas.onmouseup=dragEnd;
	    
		draw();
	  
	  }
	  function draw(){
	    context.clearRect(0,0,canvas.width,canvas.height);
	  //画曲线
	  context.beginPath();
	  context.lineWidth=6;
	  context.stokeStyle='black';
	  context.lineCap='round';
	  context.moveTo(points.p1.x,points.p1.y);
	  if(points.cp2){
	    context.bezierCurveTo(points.cp1.x,points.cp1.y,points.cp2.x,points.cp2.y,points.p2.x,points.p2.y);
	  }else{
	    context.quadraticCurveTo(points.cp1.x,points.cp1.y,points.p2.x,points.p2.y);
	  }
	  context.stroke();
	  
	  //画控制线
	  context.beginPath();
	  context.lineWidth=1;
	  context.strokeStyle='red';
	  context.moveTo(points.p1.x,points.p1.y);
	  context.lineTo(points.cp1.x,points.cp1.y);
	  if(points.cp2){
	    context.moveTo(points.cp2.x,points.cp2.y);
	  }
	  context.lineTo(points.p2.x,points.p2.y);
	  context.stroke();
	  
	  //画圆
	  for(var p in points){
	    context.beginPath();
		context.lineWidth=2;
		context.fillStyle='rgba(33,33,33,0.2)';
		context.strokeStyle='black';
		context.arc(points[p].x,points[p].y,10,0,2*Math.PI,false);
		context.fill();
		context.stroke();
	  }
	  
	  //写出代码
	  showCode();
	  }
	 function showCode(){
	   code.firstChild.nodeValue=
	     "canvas = document.getElementById(\"canvas\");\n"+
		 "context = canvas.getContext(\"2d\")\n"+
	     "context.lineWidth = 6 ;\n" +
		 "context.strokeStyle = 'black'\n"  +
		 "context.beginPath();\n" +
		 "context.moveTo(" + points.p1.x + ", " + points.p1.y +");\n" +
				(points.cp2 ? 
					"context.bezierCurveTo("+points.cp1.x+", "+points.cp1.y+", "+points.cp2.x+", "+points.cp2.y+", "+points.p2.x+", "+points.p2.y+");" :
					"context.quadraticCurveTo("+points.cp1.x+", "+points.cp1.y+", "+points.p2.x+", "+points.p2.y+");"
				) +
				"\ncontext.stroke();"
	 }
	 
	 
	 
	 
	 
	 
	 
	 //鼠标按下时
	  function dragStart(event){
	    mouseP=getMousePos(event);
		for(p in points){
		  var xdis=mouseP.x-points[p].x;
		  var ydis=mouseP.y-points[p].y;
		  if(xdis*xdis+ydis*ydis<100){
		    drag=p;
		    return;//获取每个点到鼠标所在位置的距离，如果小于半径，确定拖拽对象，停止遍历
		  }
		
		
		}
	  
	  }
	  //鼠标拖拽时
	  function dragging(event){
	    if(drag){
		  var curP=getMousePos(event);
		  points[drag].x+=curP.x-mouseP.x;
		  points[drag].y+=curP.y-mouseP.y;
		  mouseP=curP;//获得现在鼠标所在位置，拖拽的点的位置加上鼠标位置的变化量
		  canvas.style.cursor='move';
		  draw();
		
		}
	  
	  }
	  //鼠标抬起时
	  function dragEnd(event){
	    if(drag){
		  drag=null;
		  canvas.style.cursor='default';
		  draw();
		}
	    
	  
	  }
	  
	  
	  //以对象形式获取鼠标在画布上的位置
	  function getMousePos(event){
	    return {
				x:event.clientX-canvas.getBoundingClientRect().left,
				y:event.clientY-canvas.getBoundingClientRect().top
				}
	  }

	
	
	
	
	
	})();