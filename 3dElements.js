make3DShapesDefinedinHTML();

function e3DShape(type, size, coor, orient, setFaceClass)  {
	var newShape = document.createElement('div');
		
	newShape.type 	= type;
	newShape.size 	= (typeof(size) === 'object')? size : [20,20,20];
	newShape.coor 	= (typeof(coor) === 'object')? coor : {x:0, y:0, z:0};
	newShape.orient	= (typeof(orient) === 'object')? orient : {x:0, y:0, z:0};
	newShape.className= 'e3d_shape';
	
	newShape.style.transformStyle = 'preserve-3d';
	newShape.style.visibility = 'hidden';
	
	addShapeMethods.apply(newShape, []);	
	setUpFaces.apply(newShape, []);
	
	if (typeof(setFaceClass) === 'string' ) {
		for (r=0; r<newShape.children.length; r++) {
			newShape.children[r].className= setFaceClass;
		}
	}
	newShape.plot3d();
	
	document.body.appendChild(newShape); // unsure if keep this - best not auto-rendered?
	return newShape;
}

function make3DShapesDefinedinHTML() {
	var Shape = document.getElementsByClassName('e3d_shape');
	var coor,rota;
	
	for (loop=0; loop < Shape.length; loop++) {
		Shape[loop].type = Shape[loop].getAttribute('e3dType');	
		Shape[loop].size = feedAtributefromHTML('e3dSize');
		coor = feedAtributefromHTML('e3dCoor',3);
		Shape[loop].coor   = {x:coor[0], y:coor[1], z:coor[2]}
		rota = feedAtributefromHTML('e3dRota',3);
		Shape[loop].orient = {x:rota[0], y:rota[1], z:rota[2]}		
		
		Shape[loop].style.transformStyle = 'preserve-3d';
		Shape[loop].style.visibility = 'hidden';
		
		addShapeMethods.apply(Shape[loop], []);	
		setUpFaces.apply(Shape[loop], []);
		Shape[loop].plot3d();
	}

		
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
	
}

function addShapeMethods() {
	
	this.rotateVector = [0,0,0];
	this.rotating = false;
	
	this.plot3d = function() { // set a Shape element's style.transform to match its coor and orient properties
		var string ="";
		
		while (this.orient.x >= 360) {this.orient.x -= 360};
		while (this.orient.x < 0) {this.orient.x += 360};
		while (this.orient.y >= 360) {this.orient.y -= 360};
		while (this.orient.y < 0) {this.orient.y += 360};
		while (this.orient.z >= 360) {this.orient.z -= 360};
		while (this.orient.z < 0) {this.orient.z += 360};
		
		string += "translateX("+this.coor.x+"px) ";
		string += "translateY("+this.coor.y+"px) ";
		string += "translateZ("+this.coor.z+"px) ";
		string += "rotateX("+this.orient.x+"deg) ";
		string += "rotateY("+this.orient.y+"deg) ";
		string += "rotateZ("+this.orient.z+"deg) ";
		this.style.transform = string;		
		
	};
		
	this.spin = function (spinParameters, addParamentersToCurrent, time, callback) {
		var that = this;	
		var V ={};
		if (arguments.length < 3  || time <= 0 ) {time=1};
		
		// default non-number parameters to 0
		spinParameters[0] = typeof(spinParameters[0]) === "number" ? spinParameters[0] : 0;
		spinParameters[1] = typeof(spinParameters[1]) === "number" ? spinParameters[1] : 0;
		spinParameters[2] = typeof(spinParameters[2]) === "number" ? spinParameters[2] : 0;
		
		if (addParamentersToCurrent != true) {
		spinParameters[0] -= this.orient.x; 
		spinParameters[1] -= this.orient.y;
		spinParameters[2] -= this.orient.z;
		}
		
		V.x = (spinParameters[0]/time);
		V.y = (spinParameters[1]/time);
		V.z = (spinParameters[2]/time);
		
		stepSpin(time);	
		
		function stepSpin(n) {
			that.orient.x   += V.x;
			that.orient.y   += V.y;
			that.orient.z   += V.z;
			that.plot3d();			
			if (n>1) {
				setTimeout(function(){stepSpin(n-1)}, 10);
			} else {
				that.orient.x = Math.round(that.orient.x);
				that.orient.y = Math.round(that.orient.y);
				that.orient.z = Math.round(that.orient.z);
				that.plot3d();
				if (typeof(callback) == 'function') {callback()};
			}
		}				
		return spinParameters;
	}

	this.move = function (moveParameters, addParamentersToCurrent, time, callback) {
		var that = this;	
		var V ={};
		if (arguments.length < 3  || time <= 0 ) {time=1};
		
		// default non-number parameters to 0
		moveParameters[0] = typeof(moveParameters[0]) === "number" ? moveParameters[0] : 0;
		moveParameters[1] = typeof(moveParameters[1]) === "number" ? moveParameters[1] : 0;
		moveParameters[2] = typeof(moveParameters[2]) === "number" ? moveParameters[2] : 0;
		
		if (addParamentersToCurrent != true) {
		moveParameters[0] -= this.coor.x; 
		moveParameters[1] -= this.coor.y;
		moveParameters[2] -= this.coor.z;
		}
		
		V.x = (moveParameters[0]/time);
		V.y = (moveParameters[1]/time);
		V.z = (moveParameters[2]/time);
		
		stepMove(time);	
		
		function stepMove(n) {
			that.coor.x   += V.x;
			that.coor.y   += V.y;
			that.coor.z   += V.z;
			that.plot3d();			
			if (n>1) {
				setTimeout(function(){stepMove(n-1)}, 10);
			} else {
				if (typeof(callback) == 'function') {callback()};
			}
		}				
		return V;
	}
	
	this.resize = function (sizeParameters, addParamentersToCurrent, time, callback) {
		var that = this;
		var V = [];
		
		if (arguments.length < 3  || time <= 0 ) {time=1};
		
		for (r=0; r<this.size.length; r++ ) {
			if (typeof sizeParameters[r] != 'undefined') {
				if (addParamentersToCurrent == true) {
					V[r] = sizeParameters[r] / time;
				} else {
					V[r] = (sizeParameters[r] - this.size[r]) / time
				}
			} else {
				V[r] = 0;
			}
		}
		
		stepSize(time);	
		
		function stepSize(n) {
			for (r=0; r<V.length; r++ ) {
				that.size[r] += V[r];
			}	
			setUpFaces.apply(that,[true]); 
			// isResizeCall == true for setUpFaces, to improve performance by not repeating steps only needed at the first set up
			if (n>1) {
				setTimeout(function(){stepSize(n-1)}, 10);
			} else  {
				if (typeof(callback) == 'function') {callback()};
			}
		}
	}
	
	this.stopRotation = function() {
		this.rotateVector = [0,0,0];
		clearInterval(this.rotating);
	}
	
	this.startRotation = function (spinParameters, relativeToCurrent) {
		var that = this, r;
		
		var r;
		for (r=0; r<3; r++) {
			this.rotateVector[r] = (relativeToCurrent === true )? spinParameters[r] + this.rotateVector[r] : spinParameters[r];
		}
		
		clearInterval(this.rotating);
		this.rotating = setInterval(applySpin, 10);
		
		function applySpin() {
			that.orient.x += that.rotateVector[0];
			that.orient.y += that.rotateVector[1];
			that.orient.z += that.rotateVector[2];
			that.plot3d();
		//	console.log (duration);
		}

	}
}

function setUpFaces (isResizeCall) { // create and style 'Face' element children of shape elements
	var requiredFaces, node, hypoth, angle, triangleHeight, equalaterialCornerArray, shift, tilt;
	var size = this.size;
	var Faces = this.children;
	Faces = [].slice.call(Faces);		//converts HTML Object collection to array
	
	this.style.width = this.size[0]+"px";
	this.style.height = this.size.length>1 ? this.size[1]+"px" : this.size[0]+"px";
	
	
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
		case 'tetrahedron': requiredFaces = 4;
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
			Faces[3].style.textAlign = 'right';
			
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
			break;
			
			case 'tetrahedron':
			triangleHeight = size[0] * Math.pow(3, 0.5)/2;
			equalaterialCornerArray = [ [50,0],[100, 100],[0,100] ]
			shift = size[0]*(72/500);
			tilt =70.5;
			
			Faces[0].style.width  = size[0]+"px";		
			Faces[0].style.height  = triangleHeight +"px";		
			if (isResizeCall != true) { Faces[0].innerHTML += drawTriangle(Faces[0], equalaterialCornerArray) };			
			Faces[0].style.border = "0px";
			Faces[0].style.backgroundColor = "transparent";
				
			Faces[1].style.width  = size[0]+"px";		
			Faces[1].style.height  = triangleHeight+"px";		
			if (isResizeCall != true) { Faces[1].innerHTML += drawTriangle(Faces[1],equalaterialCornerArray) };
			Faces[1].style.border = "0px";
			Faces[1].style.backgroundColor = "transparent";

			Faces[2].style.width  = size[0]+"px";		
			Faces[2].style.height  = triangleHeight+"px";			
			if (isResizeCall != true) { Faces[2].innerHTML += drawTriangle(Faces[2],equalaterialCornerArray) };
			Faces[2].style.border = "0px";
			Faces[2].style.backgroundColor = "transparent";

			Faces[3].style.width  = size[0]+"px";		
			Faces[3].style.height  = triangleHeight+"px";	
			if (isResizeCall != true) { Faces[3].innerHTML += drawTriangle(Faces[3],equalaterialCornerArray) };			
			Faces[3].style.border = "0px";
			Faces[3].style.backgroundColor = "transparent";
			
			

			
			Faces[0].style.transform = "";		
			Faces[0].style.transform += "translateY(" + shift + "px)";
			Faces[0].style.transform += "rotateX(" + -tilt + "deg)";
			
			Faces[0].style.paddingTop='50%';
			Faces[0].style.paddingLeft='21%';
			Faces[0].style.paddingRight='21%';
			
			Faces[1].style.transform = "";
			Faces[1].style.transform += "rotateZ(" + 120 + "deg)";
			Faces[1].style.transform += "translateY(" + shift + "px)";
			Faces[1].style.transform += "rotateX(" + -tilt + "deg)";
			
			Faces[2].style.transform = "";
			Faces[2].style.transform += "rotateZ(" + 240 + "deg)";
			Faces[2].style.transform += "translateY(" + shift + "px)";
			Faces[2].style.transform += "rotateX(" + -tilt + "deg)";
		
			Faces[3].style.transform = "";
			Faces[3].style.transform += "translateZ(" + -triangleHeight*(6.5/14) + "px)";		
			Faces[3].style.transform += "translateY(" + -triangleHeight*(1/6) + "px)";		
			Faces[3].style.transform += "rotateY(" + 180 + "deg)";
			
			
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
			
		for (dot=0; dot<points.length; dot++){
			svgString += points[dot][0] + ',' + points[dot][1] + ' ';
		}
		
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


