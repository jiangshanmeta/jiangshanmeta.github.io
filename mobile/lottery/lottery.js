// 第一版转盘的具体动画是通过css3实现的，虽然实现了但有些小问题，所以准备具体的动画也采用canvas实现

//利用闭包，把defaults隐藏而不是每次都声明一次
(function(window){
  var easing = {
    linear:function(p){
      return p;
    },
    uniformDeceleration:function(p){
      return -p*p + 2*p;
    },
  }
  var wrapIdPool = [];

  function Lottery(option){
    if(!option || !option.lotteris || !option.ajaxUrl ){
      console.error('missing parameter');
      return;
    }

    //安全模式，保证是使用new关键字返回一个新的实例
    if(!(this instanceof Lottery)){
        return new Lottery(option);
    }
    this._mergeOpt(option);
    this._treatOptions();

    //状态 0表示没开始抽奖，1表示正在抽奖中，2表示抽奖完成


    this._init().cache().drawLottery().drawDecoration();

    //我希望把这些实例属性隐藏掉，而原型方法可以暴露
    var dummpConstructedFunc = function(){};
    dummpConstructedFunc.prototype = Object.create(Lottery.prototype);
    return new dummpConstructedFunc();
  }

  Lottery.defaults = {
    ajaxUrl:"http://jiangshanmeta.github.io",
    selector:"#lotteryWrap",
    DOM:{
      w:Math.min(document.documentElement.clientWidth*0.9,500),
      rings:[{color:'#ff6900','width':4},{color:'#ffa642',width:10,shadowColor:'rgba(0,0,0,0.5)',shadowBlur:8}],
      pointerColor:"#ffa642",
      startDeg:0,
    },
    animation:{
      timePerRound:1,
      rotateCountAfterAjax:3,  //animationTimePerRound是指在 抽奖动画中匀速转动时没转一圈所需要的时间
      area:'lottery',
      timeAfterAjax:7,
    },
    text:{
      color:"#fff",
      pos:2/3,
      fontSize:14,
      lineHeight:1.4,
      shadowColor:"rgba(0,0,0,0.5)",
      shadowBlur:8,
      separator:"\n",
    },
    msg:{
      ready:'开始抽奖',
      doing:'抽奖中',
      done:'抽奖结束',
      css:"box-shadow:0 0 5px rgba(0,0,0,0.5),inset 0 0 10px rgba(0,0,0,0.5);background:#fff;",
    },

    doSthAfterLottery:function(json){

    },
    checkCanLottery:function(){
        return true;
    },
    doSthAfterCannotLottery:function(){

    },
    doSthAfterAjaxError:function(json){

    },

  };
  Lottery.prototype = Object.assign({},Widget.prototype,{
    _treatOptions:function(){
      // 对合并之后的数据进行处理
      if(this.options.text.pos>=1 || this.options.text.pos<=0){
        this.options.text.pos = this.constructor.defaults.text.pos;
      }
      this.options.DOM.startDeg = deg2rad(this.options.DOM.startDeg);
    },
    _eventHandler:function(){
      if(this.status===0){
        this.ajaxGetLotteryRes();
      }else if(this.status===2){
        //此时抽奖结束,点击应该是重置
        this.reset();
      }
      //剩下的情况是抽奖中，当然什么也不做默默等待后端返回结果
    },
    _init:function(){
      this.status = 0;
      this.imgs = [];
      this._initDOM();
      return this;
    },
    _initDOM:function(){
      this._bindContainer();
      var options = this.options;
      var DOM = options.DOM;
      var wrapId = options.selector;
      var w = DOM.w;
      //外层盒子初始样式设置
      if(!this.container){
        this.container = document.createElement("div");
        document.body.appendChild(this.container);
      }else{
        if(wrapIdPool.indexOf(wrapId)>-1){
          console.error('Lottery wrapId repeated');
          return;
        }else{
          wrapIdPool.push(wrapId);
        }
      }

      this.container.addEventListener("click",this._eventHandler.bind(this),false);
      this.container.style.cssText += "position:relative;overflow:hidden;margin-left:auto;margin-right:auto;display:table;"

      //canvas1负责绘制具体的奖项
      this.canvas1 = document.createElement("canvas");
      this.canvas1.width = w;
      this.canvas1.height = w;
      this.context1 = this.canvas1.getContext('2d');

      //canvas2负责绘制装饰性的指针表盘
      this.canvas2 = document.createElement("canvas");
      this.canvas2.width = w;
      this.canvas2.height = w;
      this.canvas2.style.cssText="position:absolute;top:0;left:0;";
      this.context2 = this.canvas2.getContext('2d');

      // canvas3用来缓存具体的奖项
      this.canvas3 = document.createElement("canvas");
      this.canvas3.width = w;
      this.canvas3.height = w;
      this.canvas3.style.display = "none";

      // canvas4用来缓存那些装饰性的表盘指针
      this.canvas4 = document.createElement("canvas");
      this.canvas4.width = w;
      this.canvas4.height = w;
      this.canvas4.style.display = "none";      

      // 文字区域
      this.textArea = document.createElement("div");
      var textAreaPercent = 0.25;
      this.textArea.style.cssText = "position:absolute;border-radius:50%;width:"+textAreaPercent*w+"px;height:"+textAreaPercent*w+"px;line-height:"+ textAreaPercent*w +"px;left:" + (0.5-textAreaPercent/2)*100 + "%;top:"+(0.5-textAreaPercent/2)*100 +"%;text-align:center;white-space:nowrap;-webkit-user-select:none;" + options.msg.css;
      this.textArea.innerText = options.msg.ready;

      var fragment = document.createDocumentFragment();
      fragment.appendChild(this.canvas1);
      fragment.appendChild(this.canvas2);
      fragment.appendChild(this.textArea);
      this.container.appendChild(fragment);

      this._bindEvent('cannotLottery','doSthAfterCannotLottery');
      this._bindEvent('afterLottery','doSthAfterLottery');
      this._bindEvent('ajaxError','doSthAfterAjaxError');
      return this;
    },
    cache:function(){
      this.cacheLottery().cacheDecoration();
      return this;
    },
    cacheLottery:function(){
      // 将奖项的文字描述和其对应的背景缓存起来，避免requestAnmi的时候大量调用canvasAPI
      var context = this.canvas3.getContext('2d');
      // 缓存背景
      var options = this.options;
      var DOM = options.DOM;
      var lotteris = options.lotteris;
      var len=lotteris.length;
      var degPerPart = 2*Math.PI/len;
      var r = DOM.w/2;
      var startDeg = DOM.startDeg;

      context.save();
      context.translate(r,r);
      for(var i=0;i<len;i++){
        context.save();
        context.beginPath();
        context.moveTo(0,0);
        var finalDeg = i*degPerPart+startDeg;

        context.lineTo(Math.sin(finalDeg)*r,-Math.cos(finalDeg)*r);
        context.arc(0,0,r,finalDeg-Math.PI/2,finalDeg+degPerPart-Math.PI/2,false)
        context.closePath();
        context.fillStyle = lotteris[i].bgColor;
        context.fill();
        context.restore();
      }

      context.restore();      

      // 缓存文字
      var optionText = options.text;

      var animateArea = options.animation.area;
      context.save();
      context.translate(r,r);

      context.save();
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = optionText.color;
      var fontSize = optionText.fontSize;
      var lineHeight = optionText.lineHeight;
      var realLineHeight = fontSize*lineHeight;
      context.font = fontSize+"px bold sans-serif";
      context.shadowColor = optionText.shadowColor;
      context.shadowBlur = optionText.shadowBlur;
      var separator = optionText.separator;

      for(var i=0;i<len;i++){
        var text = lotteris[i].text;
        if(text===undefined){
          continue;
        }

        context.save();

        if(lotteris[i].textColor!==undefined){
          context.fillStyle = lotteris[i].textColor;
        }
        if(lotteris[i].textPos!==undefined){
          var textPos = lotteris[i].textPos;
          if(textPos>=1 || textPos<=0){
            textPos = optionText.pos;
          }
        }else{
          var textPos = optionText.pos;
        }
        
        if(animateArea=='decoration'){
          var finalDeg = degPerPart*(i+0.5)+startDeg;
        }else{
          var finalDeg = 0;
          context.rotate((i+0.5)*degPerPart+startDeg);
        }

        var textArr = text.split(separator);
        var centerPos = r*textPos;

        var startTextPos = centerPos + realLineHeight*(textArr.length-1)/(2*Math.cos(finalDeg));
        for(var j=0,textLen=textArr.length;j<textLen;j++){
            context.fillText(textArr[j],Math.sin(finalDeg)*centerPos,-Math.cos(finalDeg)*(startTextPos-j*realLineHeight/Math.cos(finalDeg)) );
        }

        context.restore();
      }
      context.restore(); 

      context.restore(); 

      return this;
    },
    cacheDecoration:function(){
      var context = this.canvas4.getContext('2d');

      var options = this.options;
      var DOM = options.DOM;
      var r = DOM.w/2;
      // 缓存绘制的环
      context.save();
      context.translate(r,r);

      var totalWidth = 0;
      var rings = DOM.rings;
      if(gettype(rings)!='array'){
        console.error('parameter for rings must be array');
        return this;
      }
      for(var i=0;i<rings.length;i++){
        var thisring = rings[i];
        context.save();
        context.beginPath();
        context.strokeStyle = thisring.color;
        context.lineWidth = thisring.width;
        if(thisring.shadowColor){
          context.shadowColor = thisring.shadowColor;
        }
        if(thisring.shadowBlur){
          context.shadowBlur = thisring.shadowBlur;
        }
        context.arc(0,0,r-(totalWidth+thisring.width/2),0,2*Math.PI,false);
        context.closePath();
        context.stroke();
        context.restore();
        totalWidth+= thisring.width;
      }

      context.restore();


      // 缓存绘制的指针
      context.save();
      context.translate(r,r);
       /* 外层指针 */
      context.save();
      context.beginPath();
      context.moveTo(-0.05*r,-r+9);
      context.lineTo(-0.05*r,-0.8*r);
      context.lineTo(-0.12*r,-0.8*r);
      context.lineTo(0,-0.7*r);   
      context.lineTo(0.12*r,-0.8*r);
      context.lineTo(0.05*r,-0.8*r);
      context.lineTo(0.05*r,-r+9);
      context.closePath();
      context.fillStyle = DOM.pointerColor;
      context.fill();
      context.restore();  

      // 内层指针 
      context.save();
      context.beginPath();
      context.moveTo(-0.05*r,-0.25*r);
      context.lineTo(-0.05*r,-0.40*r);
      context.lineTo(-0.12*r,-0.40*r);
      context.lineTo(0,-0.50*r);   
      context.lineTo(0.12*r,-0.40*r);
      context.lineTo(0.05*r,-0.40*r);
      context.lineTo(0.05*r,-0.25*r);    
      context.closePath();
      context.fillStyle = DOM.pointerColor;
      context.fill();
      context.restore();

      context.restore();

      return this;
    },
    drawLottery:function(deg){
      var context = this.context1;
      var image = this.canvas3;

      var options = this.options;
      var DOM = options.DOM;
      var r = DOM.w/2;

      deg = deg || 0;
      context.save();
      context.translate(r,r);
      context.rotate(deg);
      context.drawImage(image,-r,-r);
      context.restore();
      return this;
    },
    drawDecoration:function(deg){
      var options = this.options;
      var DOM = options.DOM;
      var r = DOM.w/2;

      var context = this.context2;
      var image = this.canvas4;
      deg = deg || 0;
      context.save();
      context.translate(r,r);
      context.rotate(deg);
      context.drawImage(image,-r,-r);
      context.restore();
      return this;
    },
    ajaxGetLotteryRes:function(){
       var options = this.options;
       var canLottery = options.checkCanLottery();

       if(canLottery){
        // 这里应该发起ajax请求然后后端返回结果根据结果展示，但是github pages只能放静态页面。这里就简单模拟一下吧
        this.status = 1;
        this.textArea.innerText = options.msg.doing;
        var animateArea = options.animation.area;
        if(animateArea=='decoration'){
          var context = this.context2;
        }else{
          var context = this.context1;
        }
        // 转换为毫秒
        var animationTimePerRound = options.animation.timePerRound*1000;
        var w = options.DOM.w;
        var hasAjaxRest = false;
        var ajaxRest;
        var startTS = Date.now();
        var render = function(){
          var curTS = Date.now();
          var progress = (curTS-startTS)/animationTimePerRound;
          if(progress>=1){
            progress = 1;
          }

          var curRotate = easing.linear(progress)*2*Math.PI;
          context.clearRect(0,0,w,w);

          if(animateArea=='decoration'){
            this.drawDecoration(curRotate);
          }else{
            this.drawLottery(curRotate);
          }
          if(hasAjaxRest && progress>=1){
            this.showLotteryRes(ajaxRest);
          }else{
            if(progress>=1){
              startTS = Date.now();
            }
            requestAnimFrame(render)
          }

        }.bind(this);
        requestAnimFrame(render);

        if(options.ajaxUrl=='http://jiangshanmeta.github.io'){
          // 模拟ajax返回值
          setTimeout(function(){
              var rst = Math.floor(Math.random()*this.options.lotteris.length);
              hasAjaxRest = true;
              //因为可能后端校验禁止参与抽奖
              if(Math.random()>0.5){
                ajaxRest = {data:{index:rst,err:{msg:'达成成就：+1s'}},rstno:1};
              }else{
                ajaxRest = {data:{err:{msg:'苟利国家生死以'}},rstno:2};
              }
              
          }.bind(this),1800)   
        }else{
          //真ajax
          var xhr = new XMLHttpRequest();
          xhr.open("POST",options.ajaxUrl,true);
          xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
          xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
              if(xhr.status == 200){
                hasAjaxRest = true;
                ajaxRest = JSON.parse(xhr.responseText);
              }else{
                this.reset();
              }
            }
          }.bind(this);
          xhr.send(null);

        }

        
       }else{
          this.$emit('cannotLottery');
       }
    },
    showLotteryRes:function(json){
      console.log(json);
      var options = this.options;
      var animateArea = options.animation.area;
      if(animateArea=='decoration'){
        var context = this.context2;
      }else{
        var context = this.context1;
      }

      var startDeg = rad2deg(options.DOM.startDeg);
      var w = options.DOM.w;
      if(json.rstno==1){
        // 角度
        if(animateArea=='decoration'){
          var finalRotate = (json.data.index+0.5)*360/options.lotteris.length+360*(options.animation.rotateCountAfterAjax)+startDeg;
        }else{
          var finalRotate = 360-(json.data.index+0.5)*360/options.lotteris.length+360*(options.animation.rotateCountAfterAjax+1)-startDeg;
        }
        // 转换成毫秒
        var duration = options.animation.timeAfterAjax*1000;

        var finalRotateRag = deg2rad(finalRotate);

        var startTS = Date.now();
        var render = function(){
          var curTS = Date.now();
          var progress = (curTS-startTS)/duration;
          curRotate = easing.uniformDeceleration(progress)*finalRotateRag;
          if(progress<1){
            context.clearRect(0,0,w,w);
            if(animateArea=='decoration'){
                this.drawDecoration(curRotate);
            }else{
                this.drawLottery(curRotate);
            }
            
            requestAnimFrame(render);
          }else{
            this.status = 2;
            this.textArea.innerText = options.msg.done;
            this.$emit('afterLottery',json);
          }
        }.bind(this);
        requestAnimFrame(render);
      }else{
        this.reset();
        setTimeout(function(){
          this.$emit('ajaxError',json);
        }.bind(this),0); 
      }



    },
    reset:function(){
      this.status = 0;
      this.textArea.innerText = this.options.msg.ready;
      var animateArea = this.options.animation.area;
      var w = this.options.DOM.w;
      if(animateArea=='decoration'){
        this.context2.clearRect(0,0,w,w);
        this.drawDecoration();
      }else{
        this.context1.clearRect(0,0,w,w);
        this.drawLottery();
      }
      


      return this;
    }

  });
  Object.defineProperty(Lottery.prototype,"constructor",{
    value:Lottery,
    writable:false,
    configurable:false,
    enumrable:false
  });
  var _lottery = window.Lottery;
  Lottery.noConflict = function(){
    window.Lottery = _lottery;
    return Lottery;
  }

  window.Lottery = Lottery;

})(window);









