(function(window){
	// 想实现一个单例
	var instance = null;
	function Jumbotron(option){
	    if(!(this instanceof Jumbotron)){
	        return new Jumbotron(option);
	    }
	    if(!(instance instanceof Jumbotron)){
	    	// 初始化设置
	    	this._mergeOpt(option);
	    	this._init();
	    	instance = this;
	    }
	    return instance;
	}
	Jumbotron.defaults = {
		selector:"#jumbotron",
		openFunc:'linear',
		openDuration:800,
		closeFunc:'linear',
		closeDuration:500,
		doSthBeforeOpen:function(){

		},
		doSthAfterOpen:function(){

		},
		doSthBeforeClose:function(){

		},
		doSthAfterClose:function(){

		},
	};
	Jumbotron.prototype = Object.assign({},Widget.prototype,{
		constructor:Jumbotron,
		_transitionHandler:function(e){
			if(e.target !== this.container){
				return;
			}
			if(this.status===1){
				this.status = 2;
				this.container.style.height = "auto";
				this.$emit('afterOpen');
			}else if(this.status===3){
				this.status = 4;
				this.container.style.display = "none";
				this.$emit('afterClose');
			}
		},
		_init:function(){
			this.status = 0;
			this.counter = 0;
			this._initDOM();
			return this;
		},
		_initDOM:function(){
			this._bindContainer();
			if(!this.container){
				console.error('missing parameter');
				return;
			}
			this.oriDisplay = window.getComputedStyle(this.container)['display'];
			this.container.style.display = "none";
			
			this.container.addEventListener(whichTransitionEvent(),this._transitionHandler.bind(this));
			this._bindEvent({
				'beforeOpen':'doSthBeforeOpen',
				'afterOpen':'doSthAfterOpen',
				'beforeClose':'doSthBeforeClose',
				'afterClose':'doSthAfterClose',
			});
			return this;
		},
		open:function(){
			if(this.status!==0 && this.status!==4){
				return this;
			}
			this.$emit('beforeOpen');
			this.counter++;
			this.container.style[pfx('transition')] = "height " + this.options.openDuration + "ms "+ this.options.openFunc;
			this.container.style.cssText += "display:"+ this.oriDisplay + ";height:0;overflow:hidden;"
			this.container.style.height = this.container.scrollHeight + 'px';
			this.status = 1;

			return this;
		},
		close:function(){
			if(this.status!==2){
				return;
			}
			this.$emit('beforeClose');
			this.container.style.height = getComputedStyle(this.container)['height'];
			this.container.style[pfx('transition')] = "height " + this.options.closeDuration + "ms "+ this.options.closeFunc;
			this.status = 3;
			getComputedStyle(this.container)['height'];
			this.container.style.height = 0;
			return this;
		}
	});
	var _jumbotron = window.Jumbotron;
	Jumbotron.noConflict = function(){
		window.Jumbotron = _jumbotron;
		return Jumbotron;
	}
	
	window.Jumbotron = Jumbotron;
})(window);