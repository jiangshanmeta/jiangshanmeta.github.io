(function(window){
	function ucfirst (str) {
	  str += ''
	  var f = str.charAt(0)
	    .toUpperCase()
	  return f + str.substr(1)
	}
	var pfx = (function () {
	    var style = document.createElement('dummy').style,
	        prefixes = 'Webkit Moz O ms Khtml'.split(' '),
	        memory = {};
	    return function ( prop ) {
	        if ( typeof memory[ prop ] === "undefined" ) {
	            var ucProp  = ucfirst(prop),
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
	var transitionend = (function(){
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
	})();

	var defaults = {
		selector:'.horizontalMove',
		initialMove:0,
		transition:'ease 600ms',
	}

	var winW = parseInt(getComputedStyle(document.documentElement).width);

	function HorizontalMove(opt){
	    if(!(this instanceof HorizontalMove)){
	        return new HorizontalMove(opt);
	    }
	    this.options = Object.assign({},defaults,opt||{});
	    this.ele = document.querySelector(this.options.selector);
	    if(!this.ele){
	    	console.error('selector is wrong');
	    	return;
	    }
	    this.dx = 0;
	    var elemW = parseInt(getComputedStyle(this.ele).width);
		var offsetLeft = this.ele.getBoundingClientRect().left + document.body.scrollLeft;
		var minX = winW - offsetLeft - elemW;
		this.options.minX = minX;
		this.options.transition = "transform "+ this.options.transition;
		var initialMove = this.options.initialMove;
		if(initialMove<0 && initialMove>minX){
			this.dx = initialMove;
			this._setMove(initialMove);
		}

	    this._bindEvent();
	}

	HorizontalMove.prototype = {
		constructor:HorizontalMove,
		_bindEvent:function(){
			var _this = this;
			touch.on(this.ele,'drag',function(event){
				var offx = _this.dx + event.x;
				_this._setMove(offx);
			});
			touch.on(this.ele,"dragend",function(event){
				_this.dx += event.x;
				if(_this.dx>0){
					_this._setTransition(_this.options.transition);
					_this._setMove(0);
				}else if(_this.dx<_this.options.minX){
					_this._setTransition(_this.options.transition);
					_this._setMove(_this.options.minX);
				}
			});		
			this.ele.addEventListener(transitionend,function(event){
				_this._setTransition('');
				if(_this.dx>0){
					_this.dx = 0;
				}else{
					_this.dx = _this.options.minX;
				}
			},false);
		},
		_setMove:function(x){
			this.ele.style[pfx('transform')] = 'translate3d(' + x + 'px,0,0)';
		},
		_setTransition:function(str){
			this.ele.style[pfx('transition')] = str;
		}

	}
	window.HorizontalMove = HorizontalMove;
	window.horizontalMove = HorizontalMove;
})(window);