var Observer = (function(){
	var _message = {};
	return {
		register:function(typ,fn){
			if(!_message[typ]){
				_message[typ] = [];
			}
			_message[typ].push(fn);
			return this;
		},
		publish:function(typ,data){
			if(_message[typ]){
				for(var i=0,len=_message[typ].length;i<len;i++){
					_message[typ][i](data);
				}
			}
			return this;
		},
		remove:function(typ,fn){
			if(_message[typ]){
				for(var i=0,len=_message[typ].length;i<len;i++){
					_message[typ][i] ==fn && _message[typ].splice(i,1);
				}
			}

			return this;
		}
	}
})();