if (document.body.style.perspective == '') { document.body.style.perspective = '5000px'};
make3DShapesDefinedinHTML();

function e3DShape(type, size, coor, orient, setClass)  {
	var newShape = document.createElement('div');
	document.body.appendChild(newShape);
	
	newShape.type = type;
	newShape.size = size;
	newShape.coor = coor;
	newShape.orient = orient;
	newShape.className= 'e3d_shape';
	
	addShapeStyleAndMethods.apply(newShape, []);	
	setUpFaces.apply(newShape, []);
	
	for (r=0; r<newShape.children.length; r++) {
		newShape.children[r].className= setClass;
	}
	
	newShape.plot3d();
	
	return newShape;
}

function make3DShapesDefinedinHTML() {
	var Shape = document.getElementsByClassName('e3d_shape');
	var coor,rota;
	
	function feedAtributefromHTML (atr, minimumNumberOfValues) {
		if (arguments.length < 2) {minimumNumberOfValues = 1};
		var string, value=[];
		string = Shape[loop].getAttribute(atr);
		if (string === null) { // not defined in HTML, set all values to 0
			for (c = 0; c<minimumNumberOfValues; c++) {value[c] = 0;};
		} else {
			value = string.split(" ");
			
			for (c=0; c<value.length; c++) {
				value[c] = isNaN(Number(value[c])) ? 0 : Number(value[c]);
			};		

			if (value.length < minimumNumberOfValues){
				for (c = value.length; c<minimumNumberOfValues; c++) {value[c] = 0;};
			}
			
		}
		return value;
	}
	
	for (loop=0; loop < Shape.length; loop++) {
		Shape[loop].type = Shape[loop].getAttribute('e3dType');	
		Shape[loop].size = feedAtributefromHTML('e3dSize');
		coor = feedAtributefromHTML('e3dCoor',3);
		Shape[loop].coor   = {x:coor[0], y:coor[1], z:coor[2]}
		rota = feedAtributefromHTML('e3dRota',3);
		Shape[loop].orient = {x:rota[0], y:rota[1], z:rota[2]}
				
		addShapeStyleAndMethods.apply(Shape[loop], []);	
		setUpFaces.apply(Shape[loop], []);
		Shape[loop].plot3d();
	}

}

function addShapeStyleAndMethods() {
	this.style.position = 'absolute';
	this.style.transformStyle = 'preserve-3d';
	this.style.top = '0px';
	this.style.left = '0px';
	this.style.visibility = 'hidden';
	this.style.width = this.size[0]+"px";
	this.style.height = this.size.length>1 ? this.size[1]+"px" : this.size[0]+"px";
	
	this.plot3d = function() { // set a Shape element's style.transform to match its coor and orient properties
		var string ="";
		string += "translateX("+this.coor.x+"px) ";
		string += "translateY("+this.coor.y+"px) ";
		string += "translateZ("+this.coor.z+"px) ";
		string += "rotateX("+this.orient.x+"deg) ";
		string += "rotateY("+this.orient.y+"deg) ";
		string += "rotateZ("+this.orient.z+"deg) ";
		this.style.transform = string;
	};
	
	this.spinBy = function (spinArr,time) {this.spinAndMoveBy(spinArr,[],time);}
	this.moveBy = function (moveArr,time) {this.spinAndMoveBy([],moveArr,time);}
	this.spinTo = function (spinArr,time) {this.spinAndMoveTo(spinArr,[],time);}
	this.moveTo = function (moveArr,time) {this.spinAndMoveTo([],moveArr,time);}
	
	this.spinAndMoveBy = function(spinArr, moveArr,time) {
		var that = this;
		if (arguments.length < 3  || time <= 0 ) {time=1};
		var V ={
			spinArr:[0,0,0],
			moveArr:[0,0,0]
		}
		if (spinArr != undefined) {	
			V.spinArr[0] = typeof(spinArr[0]) === "number" ? (spinArr[0])/time : 0;
			V.spinArr[1] = typeof(spinArr[1]) === "number" ? (spinArr[1])/time : 0;
			V.spinArr[2] = typeof(spinArr[2]) === "number" ? (spinArr[2])/time : 0;
		}	
		if (moveArr != undefined) {	
			V.moveArr[0] = typeof(moveArr[0]) === "number" ? (moveArr[0])/time : 0;
			V.moveArr[1] = typeof(moveArr[1]) === "number" ? (moveArr[1])/time : 0;
			V.moveArr[2] = typeof(moveArr[2]) === "number" ? (moveArr[2])/time : 0;
		}			
		stepMove(time);	
		
		function stepMove(n) {
			that.orient.x += V.spinArr[0];
			that.orient.y += V.spinArr[1];
			that.orient.z += V.spinArr[2];
			that.coor.x   += V.moveArr[0];
			that.coor.y   += V.moveArr[1];
			that.coor.z   += V.moveArr[2];
			that.plot3d();			
			if (n>1) {
				setTimeout(function(){stepMove(n-1)}, 10);
			}
		}
	}
	
	this.spinAndMoveTo = function (spinArr, moveArr,time) {
		var that = this;		
		if (arguments.length < 3  || time <= 0 ) {time=1};
		
		if (spinArr != undefined) {	
			spinArr[0] = typeof(spinArr[0]) === "number" ? spinArr[0] - that.orient.x : 0;
			spinArr[1] = typeof(spinArr[1]) === "number" ? spinArr[1] - that.orient.y : 0;
			spinArr[2] = typeof(spinArr[2]) === "number" ? spinArr[2] - that.orient.z : 0;
		} else {spinArr = [0,0,0]}
		
		if (moveArr != undefined) {	
			moveArr[0] = typeof(moveArr[0]) === "number" ? moveArr[0] - that.coor.x: 0;
			moveArr[1] = typeof(moveArr[1]) === "number" ? moveArr[1] - that.coor.y: 0;
			moveArr[2] = typeof(moveArr[2]) === "number" ? moveArr[2] - that.coor.z: 0;
		} else {spinArr = [0,0,0]}
		
		that.spinAndMoveBy (spinArr, moveArr, time);	
	}
	
	this.resize = function (sizeParameters, addParamentersToOldSize, time) {
		var that = this;
		var V = [];
		
		if (arguments.length < 3  || time <= 0 ) {time=1};
		
		for (r=0; r<this.size.length; r++ ) {
			if (typeof sizeParameters[r] != 'undefined') {
				if (addParamentersToOldSize == true) {
						V[r] = sizeParameters[r] / time;
				} else {
					V[r] = (sizeParameters[r]) / time
				}
			}
		}
		
		console.log(V);
		stepSize(time);	
		
		function stepSize(n) {
			for (r=0; r<V.length; r++ ) {
				that.size[r] += V[r];
			}	
			console.log(n+': '+that.size);
			setUpFaces.apply(that,[true]); 
			// isResizeCall == true for setUpFaces, to improve performance by not repeating steps only needed at the first set up
			if (n>1) {
				setTimeout(function(){stepSize(n-1)}, 10);
			}
		}
	}
	
}

function setUpFaces (isResizeCall) { // create and style 'Face' element children of shape elements
	var requiredFaces, node, hypoth, angle;
	var size = this.size;
	var Faces = this.children;
	Faces = [].slice.call(Faces);		//converts HTML Object collection to array
		
	
	if (isResizeCall != true) {
		switch (this.type) {
		case 'cube': requiredFaces = 6;
		break;
		case 'cuboid': requiredFaces = 6;
		break;
		case 'prism': requiredFaces = 5;
		break;
		case 'pyramid': requiredFaces = 5;
		break;
		default : requiredFaces = 0;
		}
		
		while (Faces.length > requiredFaces) {
			this.removeChild(this.lastChild);
			Faces.pop();
		}	

		for (f = 0; f<requiredFaces; f++) {
			if (Faces[f] === undefined) {
					node = document.createElement("div");
					this.appendChild(node);
					Faces[f] = this.lastChild;
			}
			Faces[f].style.position = "absolute";
			Faces[f].style.transformStyle = "preserve-3d";
			Faces[f].style.boxSizing = "border-box";
			Faces[f].style.backfaceVisibility = "hidden";				
			Faces[f].style.visibility = 'visible';
		}
	}
	
		switch (this.type) {
			case 'cube':			
			for (f = 0; f<6; f++) {
				Faces[f].style.height = size[0]+"px";
				Faces[f].style.width  = size[0]+"px";			
			}
			Faces[0].style.transform = "translateZ(" + size[0]/2 + "px)";
			Faces[1].style.transform = "rotateY(90deg)  translateZ(" + size[0]/2 + "px)";
			Faces[2].style.transform = "rotateX(90deg)  translateZ(" + size[0]/2 + "px)";
			Faces[3].style.transform = "rotateX(270deg) translateZ(" + size[0]/2 + "px)";
			Faces[4].style.transform = "rotateY(270deg) translateZ(" + size[0]/2 + "px)";
			Faces[5].style.transform = "rotateY(180deg) translateZ(" + size[0]/2 + "px)";	
			break;
			
			case 'cuboid':
			Faces[0].style.width  = size[0]+"px";		
			Faces[0].style.height = size[1]+"px";
			Faces[0].style.transform = "translateZ(" + size[2]/2 + "px)";
			Faces[1].style.width  = size[2]+"px";
			Faces[1].style.height = size[1]+"px";
			Faces[1].style.transform = "translateX(" + (size[0]-size[2])/2 + "px) rotateY(90deg) translateZ(" + size[0]*.5 + "px)";
			Faces[2].style.width  = size[0]+"px";
			Faces[2].style.height = size[2]+"px";
			Faces[2].style.transform = "rotateX(90deg) translateZ(" + size[2]/2 + "px)";
			Faces[3].style.width  = size[0]+"px";
			Faces[3].style.height = size[2]+"px";
			Faces[3].style.transform = "rotateX(270deg) translateZ(" + (size[1]-(size[2]/2)) + "px)";
			Faces[4].style.width  = size[2]+"px";
			Faces[4].style.height = size[1]+"px";
			Faces[4].style.transform = "rotateY(270deg) translateZ(" + size[2]/2 + "px)";
			Faces[5].style.width  = size[0]+"px";
			Faces[5].style.height = size[1]+"px";
			Faces[5].style.transform = "rotateY(180deg) translateZ(" + size[2]/2 + "px";						
			break;
			
			case 'prism':
			Faces[0].style.width  = size[0]+"px";		
			Faces[0].style.height = size[1]+"px";
			Faces[0].style.transform = "translateZ(" + size[2]/2 + "px)";
		
			Faces[1].style.width  = size[0]+"px";
			Faces[1].style.height = size[2]+"px";
			Faces[1].style.transform = "rotateX(270deg) translateZ(" + (size[1]-(size[2]/2)) + "px)";
			
			Faces[2].style.width  = size[0]+"px";
			Faces[2].style.height = pythag(size[1],size[2])+"px"; 
			Faces[2].style.transform = "";
			Faces[2].style.transform += "rotateY(" + 180 + "deg) ";
			Faces[2].style.transform += "translateY(" + size[1]*.5 + "px) ";
			Faces[2].style.transform += "translateY(" + -(pythag(size[1],size[2])*.5 ) + "px) ";
			Faces[2].style.transform +=  "rotateX(" + degreesFromTangent(size[2],size[1]) + "deg) ";
			Faces[2].style.transform += "translateZ(" + 0 + "px) "
					
			if (isResizeCall != true) { Faces[3].innerHTML += drawTriangle(Faces[3],[ [0,100],[100,100],[100,0] ]) };
			Faces[3].style.border = "0px";
			Faces[3].style.backgroundColor = "transparent";
			Faces[3].style.width  = size[2]+"px";		
			Faces[3].style.height = size[1]+"px";
			Faces[3].style.transform = "rotateY(270deg) translateZ(" + size[2]/2 + "px)";			
						
			if (isResizeCall != true) { Faces[4].innerHTML += drawTriangle(Faces[4],[ [100,100],[0,100],[0,0] ]) };	
			Faces[4].style.border = "0px";			
			Faces[4].style.backgroundColor = "transparent";
			Faces[4].style.width  = size[2]+"px";		
			Faces[4].style.height = size[1]+"px";
			Faces[4].style.transform = "translateX(" + (size[0]-size[2])/2 + "px) rotateY(90deg) translateZ(" + size[0]*.5 + "px)";		
			break;
			
			case 'pyramid' :			
			Faces[0].style.width  = size[0]+"px";		
			Faces[0].style.height = size[1]+"px";
			Faces[0].style.transform = "translateZ(" + size[2]/2 + "px)";
					
			hypoth = pythag( (size[1]/2) ,size[2]);
			angle = degreesFromTangent((2*size[2]), size[1]);
					
			if (isResizeCall != true) { Faces[1].innerHTML += drawTriangle(Faces[1],[ [100,100],[0,100],[50,0] ]) };
			Faces[1].style.width  = size[0]+"px";		
			Faces[1].style.height = hypoth +"px";
			Faces[1].style.transform = "";
			Faces[1].style.transform += "translateY(" + (size[1]*.25 - hypoth/2 ) + "px)";
			Faces[1].style.transform += "rotateX(" + angle*-1 + "deg)";
			Faces[1].style.transform += "rotateY(" + 180 + "deg)";
			Faces[1].style.transform += "rotateZ(" + 180 + "deg)";
			Faces[1].style.border = "0px";
			Faces[1].style.backgroundColor = "transparent";
			Faces[1].style.textAlign="center";
			Faces[1].style.paddingTop='50%';
						
			if (isResizeCall != true) { Faces[2].innerHTML += drawTriangle(Faces[2],[ [100,100],[0,100],[50,0] ]) };		
			Faces[2].style.width  = size[0]+"px";		
			Faces[2].style.height = hypoth +"px";
			Faces[2].style.transform = "";
			Faces[2].style.transform += "translateY(" + (size[1]*.75- hypoth/2) + "px)";
			Faces[2].style.transform += "rotateX(" + angle + "deg)";
			Faces[2].style.transform += "rotateY(" + 180 + "deg)";			
			Faces[2].style.border = "0px";
			Faces[2].style.backgroundColor = "transparent";
			Faces[2].style.textAlign="center";
			Faces[2].style.paddingTop='50%';
	
			hypoth = pythag( (size[0]/2) ,size[2]);
			angle = degreesFromTangent((2*size[2]), size[0]);
						
			if (isResizeCall != true) { Faces[3].innerHTML += drawTriangle(Faces[3],[ [100,100],[0,100],[50,0] ]) };
			Faces[3].style.width  = size[1]+"px";		
			Faces[3].style.height = hypoth +"px";			
			Faces[3].style.transform = "";
			Faces[3].style.transform += "rotateZ(" + 270 + "deg)";
			Faces[3].style.transform += "translateX(" + (size[1]*-.5 + hypoth*.5) + "px)";
			Faces[3].style.transform += "translateY(" + (size[0]*.75 - size[1]*.5) + "px)";
			Faces[3].style.transform += "rotateX(" + angle + "deg)";
			Faces[3].style.transform += "rotateY(" + 180 + "deg)";			
			Faces[3].style.border = "0px";
			Faces[3].style.backgroundColor = "transparent";
			Faces[3].style.textAlign="center";
			Faces[3].style.paddingTop='50%';
			
			if (isResizeCall != true) { Faces[4].innerHTML += drawTriangle(Faces[4],[ [50,0],[100,100],[0,100] ]) };
			Faces[4].style.width  = size[1]+"px";		
			Faces[4].style.height = hypoth +"px";		
			Faces[4].style.transform = "";
			Faces[4].style.transform += "rotateZ(" + 90 + "deg)";
			Faces[4].style.transform += "translateX(" + (size[1]*.5 + hypoth*-.5) + "px)";
			Faces[4].style.transform += "translateY(" + (size[0]*-.25 - size[1]*-.5) + "px)";
			Faces[4].style.transform += "rotateX(" + angle + "deg)";
			Faces[4].style.transform += "rotateY(" + 180 + "deg)";
			Faces[4].style.border = "0px";
			Faces[4].style.backgroundColor = "transparent";
			Faces[4].style.textAlign="center";
			Faces[4].style.paddingTop='50%';
			
			default:
			// unrecognised type of shape
		}
	
		
	function drawTriangle(dFace,points) {	
		// points structure : [ [x1, y1] , [x2,y2] , [x3,y3]  ]
		
		var st = window.getComputedStyle(dFace);	
		var strokeWidth=1;
		if (st.borderWidth == '0px') {strokeWidth=0};
		
		var svgString = '';
		svgString += '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="z-index:-10; position:absolute;left:0px;top:0px">';
		
		svgString += '<polygon points = "';
		svgString += points[0][0] + ',' + points[0][1] + ' ';
		svgString += points[1][0] + ',' + points[1][1] + ' ';
		svgString += points[2][0] + ',' + points[2][1] + ' ';
		svgString += '" '
		
		svgString += 'style = "fill:' + st.backgroundColor + ';';  
		svgString += 'stroke:'+ st.borderColor +'; stroke-width:'+ strokeWidth +'px" fill-opacity = "1">';
		
		svgString += '</svg>';
		
		return svgString;
			
	}	
		
	function pythag (side1,side2) {
		return Math.sqrt ( (side1*side1) +(side2*side2) );
	}

	function degreesFromTangent (a,b) {
		return Math.atan(a/b) * 180 / Math.PI;
	}	
	
}


