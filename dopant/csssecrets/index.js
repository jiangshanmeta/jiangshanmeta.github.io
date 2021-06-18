function testProperty(property){
	var ele = document.createElement("p");
	return property in ele.style;
}
function testValue(property,value){
	var ele = document.createElement("p");
	ele.style[property] = value;
	return ele.style[property]?true:false;
}