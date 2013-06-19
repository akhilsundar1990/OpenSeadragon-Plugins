/* this is mostly example/warpper code for key function related to aperio and base drawing examples
these may not be needed depending on your application....*/


var poi_win_old;
var point_list;
var overlay;
var overlay_obj;

if( typeof KEEP_LOGS === 'undefined' )
	KEEP_LOGS = true;
if( typeof _log !== 'function' ) {
	_log = function() {
		if( !KEEP_LOGS ) return;
		try { console.log(arguments); } catch(err) {}
	}
}

function aperio_region_to_osdAnnotation(annotation_xml_file,region_id)
	{
	/*This function will concert an aperio XML document/annotation file into the format
	I am now using with annotation.js
	
	Basically I will create a new annotation using the annotation.js methodology and
	copy the properties over from the aperio file....*/

	//assuming xml document... have annotation and then regions each regino is a set of points
	grid1.clearAll(); //clear previous annotations loaded into the grid

	//need to pull the linecolor from aperio xml
	//linecolor = this.getAttribute("LineColor").toString(16);
	//linecolor =(linecolor.length < 6) ? "0" + linecolor : linecolor;								
	
	$('Annotation',aperioxml_annotation).each( function() {
		grid1.addRow(this.getAttribute("Id"),"Annotation " + this.getAttribute("Id"),this.getAttribute("Id"));
			$('Vertices', this).each(function(){
				
				/*need image size to scale the coordinates... points are from 0-1 not in pixel coordinates*/
				dzi_x_pixels = viewer.viewport.contentSize.x;	
	 			dzi_y_pixels = viewer.viewport.contentSize.y  ;
				aspect_ratio = dzi_y_pixels/dzi_x_pixels;
				var point_list = new Array();

			$('Vertex', this).each(function(){
				var row = new OpenSeadragon.Point();
				row.x = (this.getAttribute("X")/( dzi_x_pixels)  );
				row.y = (this.getAttribute("Y")/( dzi_y_pixels) * (aspect_ratio ) );
				point_list.push(row);
							});
					});
						
							});
/*
			/*var overlay_obj = $.extend({},AnnotationOverlay.prototype.OPTIONS);
			overlay_obj = {type:'freehand', points:point_list};
			overlay = AnnotationOverlay.fromValueObject(overlay_obj);
			overlay.attachTo(viewer);
			annotationState.annotations.push(overlay);
	}

*/


/* this function sets up the toolbar I use in CDSA--- I only kept events related to drawing for this example */
function setup_wsi_toolbar(id) {
	_log('setup_wsi_toolbar', id);
	//make an elseif

	if (id == "grab_snapshot") {
	/* I want to add a feature to grab a PNG/JPG or PDF and save to desktop */
	}
	if (id == "show_annotations") {
		dhxWins.window("poi_win_old").show();
	}
   /* For now annotations generated in my viewer are kept in a separate frame from those generated from aperio xml files */
	if (id == "load_aperio") {
			//			alert('load aperio window...');
	if ( !	dhxWins.isWindow("aperio_xml") ) {   gen_aperio_annotation_box(); }
		else{ dhxWins.window("aperio_xml").show(); }
		xml_file_list = getAperioXML_list();
		}

}


/*this window is generated using dhtmlx and the window function in that framework.. */
function gen_aperio_annotation_box(target_win_id)
	{
	/* This is inherited code from Dan--- this generates the basic grid/layout needed to render an Aperio XML type document */
	aperio_win = dhxWins.createWindow("aperio_xml", 400, 50, 600, 600);
	aperio_win.setText("Aperio Annotations Window");
				
			
	aperio_win.button("close").hide();
	aperio_win.button("minmax1").hide();
	aperio_win.button("park").hide();
	aperio_win.addUserButton("hide", 0, 'Hide', 'hide');
    aperio_win.button('hide').attachEvent("onClick", function() {  aperio_win.hide() } );				
	/*removing min/max and park buttons in the window--- resizing this window to full screen looks aweful
	and also adding a button to hide it */

	/*layers layout is the object for the 4 separate panels I have within the window I am creating */
	layers_layout = aperio_win.attachLayout('4U' );

	mainlayers_div = layers_layout.cells('a');
	
	/*aperio xml file grid lists all of the XML files I have foudn that are associated with a given slide*/
	
	aperio_xml_filegrid = mainlayers_div.attachGrid();
	aperio_xml_filegrid.setImagePath("dsa-common-files/codebase/imgs/");
	aperio_xml_filegrid.setHeader("Annotation File,filename");
	aperio_xml_filegrid.setColTypes("ro,ro");
	aperio_xml_filegrid.setColSorting("str,ro");
	/*when debug is done, will actually hide the 2nd column-- doesn't need to be displayed */
	
	aperio_xml_filegrid.init();
	aperio_xml_filegrid.setSkin("dhx_web");
	mainlayers_div.setText('');
	/* need to add an onclick handler to this grid box as well... */

	
	var XMLResponse ;	
	aperio_xml_filegrid.attachEvent("onRowSelect", function(id,ind){
	/* Event is fired when a user picks an XML annotation file to load
	It loads the appropriate XML and clear the other data... */		
					
	var xml_filename = aperio_xml_filegrid.cellById(id,1).getValue();			
	aperioxml_annotation = getAperioXML_document( xml_filename );
	/*this aperioxml_annotation now contains the entire xml document I needed... 
	I may need a callback function for this */
	/*grid 1 will be renamed.. this currently contains the list of labeled regions... */
	
	
	/*DELETE THIS CODE AND REPLACE WITH FUNCTION ABOVE..... */
	$('Annotation', aperioxml_annotation).each(function(){
			grid1.addRow(this.getAttribute("Id"),"Annotation " + this.getAttribute("Id"),this.getAttribute("Id"));
			linecolor = this.getAttribute("LineColor").toString(16);
			linecolor =(linecolor.length < 6) ? "0" + linecolor : linecolor;
						});	
				});
		
		/*grid1 contains the layers/annotations the user generated--- each layer then consists of regions */
		
		/*consider getting rid of sections_div and just attaching grid 1 directly */
		/*will make the image path a global variable as I reuse it all the time */
		sections_div = layers_layout.cells('b');
		grid1 = sections_div.attachGrid();
		grid1.setImagePath("dsa-common-files/codebase/imgs/");
		grid1.setHeader("Annotations");
		grid1.setColTypes("ro");
		grid1.setColSorting("str");
		grid1.init();
		grid1.setSkin("dhx_web");
				
		grid1.attachEvent("onRowSelect", function(id,ind){			
			grid2.clearAll();
			grid3.clearAll();
					
			XMLResponse = aperioxml_annotation;
			$('Annotation', XMLResponse).each(function(){
				if (this.getAttribute("Id") == id) {
					grid2.addRow(1,["Id:",this.getAttribute("Id")],1);	
					grid2.addRow(2,["Name:",this.getAttribute("Name")],2);
					grid2.addRow(3,["ReadOnly:",this.getAttribute("ReadOnly")],3);
					grid2.addRow(4,["NameReadOnly:",this.getAttribute("NameReadOnly")],4);
					grid2.addRow(5,["LineColorReadOnly:",this.getAttribute("LineColorReadOnly")],5);
					grid2.addRow(6,["Incremental:",this.getAttribute("Incremental")],6);
					grid2.addRow(7,["Type:",this.getAttribute("Type")],7);
					grid2.addRow(8,["LineColor:",this.getAttribute("LineColor")],8);
					grid2.addRow(9,["Visible:",this.getAttribute("Visible")],9);
					grid2.addRow(10,["Selected:",this.getAttribute("Selected")],10);
					grid2.addRow(11,["MarkupImagePath:",this.getAttribute("MarkupImagePath")],11);
					grid2.addRow(12,["MacroName:",this.getAttribute("MacroName")],12);
					// grid2.addRow(2,["LineColor:",this.getAttribute("LineColor")],2);
					linecolor = this.getAttribute("LineColor").toString(16);
					linecolor =(linecolor.length < 6) ? "0" + linecolor : linecolor;												
					XMLResponse2 = this;
					
					var blue_eye = "";
					var eye_style = "style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'";
					var eye_open_url = " 'dsa-common-files/codebase/imgs/openEye.gif' ";
					var red_image = "<img id='redImage' src='dsa-common-files/codebase/imgs/red1.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>";
					var blue_image = "<img id='blueImage' src='dsa-common-files/codebase/imgs/blue1.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>";
					var green_image= "<img id='greenImage' src='dsa-common-files/codebase/imgs/green1.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"; 
					/* the blue/green/red boxes can likely be removed or changed--- this was added because I wanted
					to have the ability to recolor an ROI dynamically-- and chose those three colors to start */
					/*also the eyye open/close should allow me to click a set of ROI's on and off... */
				
					/*grid 3 should be region_infogrid */
					$('Region', this).each(function(){
							grid3.addRow(this.getAttribute("Id"),["<img id='eyeImage"+this.getAttribute("Id")+"' src=" + eye_open_url + eye_style + ">", "Layer " + this.getAttribute("Id"),this.getAttribute("Length"),this.getAttribute("Area"),this.getAttribute("Zoom"),red_image,green_image,blue_image],this.getAttribute("Id"));
						//	document.getElementById("txtPlots").value+="y;"+linecolor+"|";
													})
											}
										})
															
				});

				sections_div.setText('');
				data_div = layers_layout.cells('c');
				grid2 = data_div.attachGrid();
				grid2.setImagePath("dsa-common-files/codebase/imgs/");
				grid2.setHeader("Parameter,Value");
				// grid2.setInitWidths("100");
				//grid2.setColAlign("center, center");
				grid2.setColTypes("ro,ro");
				grid2.setColSorting("str,str");				
				grid2.init();
				grid2.setSkin("dhx_web");
				/* grid2.attachEvent("onRowSelect", function(id,ind){
					alert ("Id: " + id + " Index: " + ind);
				}); */

				/*grid3 is the 4th box that contains the ROI info */

				data_div.setText('');
				layers_div = layers_layout.cells('d');
				grid3 = layers_div.attachGrid();
				grid3.setHeader("Visible,Layer,Length,Area,Zoom,Red,Green,Blue");;
				grid3.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
				grid3.setColSorting("str,str,str,str,str,str,str,str");	
				grid3.enableKeyboardSupport(false);		/*need to see why this was disabled */
				grid3.init();
				grid3.setSkin("dhx_web");
				grid3.attachEvent("onRowSelect", function(id,ind){

				//CODE IS DEPRECATED  THIS IS USING A CANVAS BASED DRAWING AND ONLY WORKS ON NON ZOOMABLE CANVASES
				//REPLACE WITH AnnotationState calls ... 
				/*
				
				OF NOTE , although the code now is gone... a set of functions was called..
				in the case of ind == 0, this means the visible state of the roi should be toggled
				if ind==5 it means it should recolor it blue, ig ind==6 green ind==7 red...
				*/
					})
				});  //may be an extra
					layers_div.setText('');
		//dhxWins.window("anotation_xml").hide();  nice to hide the object after creation
	}


/*simple helper function--- for now I have sdifferent colored pins depending on which
color was chosen-- the image just gets appended as a DIV--- should change this to use one
pin and apply some sort of color filter to it */

function get_url_for_poi_image(pin_color) {
	if (pin_color == 'FF0000' || pin_color == 'red') {
		pin_image_src = "dsa-common-files/imgs/Pin1_Red.png";
	} else if (pin_color == '00FF00' || pin_color == 'green') {
		pin_image_src = "dsa-common-files/imgs/Pin1_Green.png";
	} else {
		pin_image_src = "dsa-common-files/imgs/Pin1_Blue.png";
	}
	return (pin_image_src);
}


function drawRect(clr) {
	document.getElementById("clicked_item").value = "rect";
	document.getElementById("line_color").value = clr;
}

function drawCircle(clr) {
	document.getElementById("clicked_item").value = "circ";
	document.getElementById("line_color").value = clr;
}

function drawPoi(clr) {
	document.getElementById("clicked_item").value = "poi";
	document.getElementById("line_color").value = clr;
}


function create_main_annotation_windowbox() {

	mainlayers_div = layers_layout.cells('a');
	mainlayers_div.setText('');
	formStructure0 = [{
			type: "settings",
			position: "label-top"
		}, {
			type: "select",
			id: "poicolor",
			name: "poicolor",
			width: 100,
			label: "Color",
			options: [{
					text: "Red",
					value: "FF0000"
				}, {
					text: "Green",
					value: "00FF00"
				}, {
					text: "Blue",
					value: "0000FF"
				}
			]
		}, {
			type: "button",
			name: "poi",
			width: 100,
			offsetTop: 2,
			value: "Add POI"
		},
	];
	myForm0 = mainlayers_div.attachForm(formStructure0);

	myForm0.attachEvent("onButtonClick", function (id) {
		if (id == "poi") //defines addition
		{
			poicolor = document.getElementsByName("poicolor")[0].value;
			drawPoi(poicolor);
		}
	});

	sections_div = layers_layout.cells('b');
	sections_div.setText('');

	formStructure1 = [{
			type: "settings",
			position: "label-top"
		}, {
			type: "button",
			name: "save",
			width: 150,
			offsetTop: 2,
			value: "Save POIs"
		}
	];
	myForm1 = sections_div.attachForm(formStructure1);
	myForm1.attachEvent("onButtonClick", function (id) {
		if (id == "save") //defines addition
		{
			poisdata = "";
			for (var k in defn) {
				poisdata += document.getElementById("current_experiment").value + ";" + defn[k] + ";" + data_drw[k] + "|";

			}
			poisdata = poisdata.substr(0, poisdata.length - 1);
			$.ajax({
				type: "post",
				data: {
					textData: poisdata
				},
				url: "savedata.php",
				success: function (data) {
					alert(data);
				}
			});
		}
	});
	layers_div = layers_layout.cells('c');



	gridPois = layers_div.attachGrid();
	gridPois.setImagePath("dsa-common-files/codebase/imgs/");
	gridPois.setHeader("ID,Type,Color,Status");
	gridPois.setColAlign("center,center,center,center");
	gridPois.setColTypes("ro,ro,ro,ro");
	gridPois.setColSorting("str,str,str,str");
	gridPois.init();
	gridPois.setSkin("dhx_web");


	gridPois.attachEvent("onRowSelect", function (id, ind) {
		if (ind == 3) {
			var valcell = gridPois.cells(id, 0).getValue();
			var b2 = document.getElementById("eye" + valcell).src;
			viewer.drawer.clearOverlays();
			if (b2.substring(b2.length - 11, b2.length) == "openEye.gif") {
				var tempvar;
				document.getElementById("eye" + valcell).src = "dsa-common-files/imgs/closedEye.gif";
				tempvar = defn[valcell].split(";");
				defn[valcell] = tempvar[0] + ";" + tempvar[1] + ";0";

			} else {
				var tempvar;
				document.getElementById("eye" + valcell).src = "dsa-common-files/imgs/openEye.gif";
				tempvar = defn[valcell].split(";");
				defn[valcell] = tempvar[0] + ";" + tempvar[1] + ";1";
			}
			/* k is apparently the shape ID or the position of the po in the list.... */
			for (var k in defn) {
				var temvar = defn[k].split(";");
				if (temvar[0] == "poi") {
					if (temvar[2] == "1") {
						var temprect = data_drw[k].split(",");
						var pointX = temprect[0];
						var pointY = temprect[1];
						var nucleus_rect = new Seadragon.Rect(parseFloat(pointX), parseFloat(pointY), 0.025, 0.025); //(x,y,w,h)
						var poi_image = document.createElement("img");

						poi_image.src = get_url_for_poi_image(tempvar[1]);

						document.body.appendChild(poi_image);
						viewer.drawer.addOverlay(poi_image, nucleus_rect);
					}
				}
				if (temvar[0] == "rect") {
					if (temvar[2] == "1") {
						var temprect = data_drw[k].split(";");
						var point1 = temprect[0].split(",");
						var point2 = temprect[1].split(",");
						/* need to modify logic here-- a rectangle can be drawn from top to bottom or bottom to top... need to add a greateR>less than check
							var x1 = parseFloat(point1[0]);
							var y1 = parseFloat(point1[1]);
							var x2 = parseFloat(point2[0]);
							var y2 = parseFloat(point2[1]);
							var h = Math.abs(y2-y1);
							var w = Math.abs(x2-x1);

							var cur_div = document.createElement("div");
							cur_div.setAttribute("style", "border: 2px solid "+temvar[1]);
							document.body.appendChild(cur_div);
							var rect = new Seadragon.Rect(x1,y1,w,h);//(x,y,w,h)
							viewer.drawer.addOverlay(cur_div, rect);
						 }
					}
					if ( temvar[0]=="circ") {
						 if(temvar[2]=="1"){
							var temprect = data_drw[k].split(";");
							var point1 = temprect[0].split(",");
							var point2 = temprect[1].split(",");
							var x1 = parseFloat(point1[0]);
							var y1 = parseFloat(point1[1]);
							var x2 = parseFloat(point2[0]);
							var y2 = parseFloat(point2[1]);
				/* tihs logic is wrong as well... doesn't make sense in terms of how its drawing the roi */
						var w = Math.abs(x2 - x1);

						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid " + temvar[1] + "; border-radius: 50%;");
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, w); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					}
				}
			}
		}
	});



	layers_div.setText('');
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	poi_win_old = dhxWins.createWindow("annotate_win", 400, 50, 600, 600);
	poi_win_old.setText("Annotations Window");
	poi_win_old.button("close").hide();
	poi_win_old.button("park").hide();
	poi_win_old.button("minmax1").hide();
	poi_win_old.addUserButton("hide", 0, 'Hide', 'hide');
	poi_win_old.button('hide').attachEvent("onClick", function () {
		poi_win_old.hide()
	});
	//need to refactor... make poi_win_old=win_annotate

	layers_layoutshape = poi_win_old.attachLayout('3U', 'dhx_web');
	dhxWins.window("annotate_win").hide();

	leftLayers_div = layers_layoutshape.cells('a');
	leftLayers_div.setText('');

	formStructure2 = [{
			type: "settings",
			position: "label-top"
		}, {
			type: "input",
			id: "color",
			name: "color",
			label: "Color",
			validate: "NotEmpty"
		}, {
			type: "button",
			name: "rect",
			width: 100,
			offsetTop: 2,
			value: "Draw Rectangle"
		}, {
			type: "button",
			name: "circ",
			width: 100,
			offsetTop: 2,
			value: "Draw Circle"
		},
	];
	myForm2 = leftLayers_div.attachForm(formStructure2);
	//			{type:"button", name:"hide", width:100,offsetTop:2, value:"Hide Me!"}

	myForm2.attachEvent("onButtonClick", function (id) {
		if (id == "rect") //defines addition
		{
			color = document.getElementsByName("color")[0].value;
			drawRect(color);
		}
		if (id == "circ") //defines addition
		{
			color = document.getElementsByName("color")[0].value;
			drawCircle(color);
		}
		if (id == "hide") //defines addition
		{
			dhxWins.window("poi_win_old").hide();
		}
	});
	rightLayers_div = layers_layoutshape.cells('b');
	rightLayers_div.setText('');

	formStructure3 = [{
			type: "settings",
			position: "label-top"
		}, {
			type: "button",
			name: "savedrawings",
			width: 150,
			offsetTop: 2,
			value: "Save Drawing"
		}
	];
	myForm3 = rightLayers_div.attachForm(formStructure3);

	myForm3.attachEvent("onButtonClick", function (id) {
		if (id == "savedrawings") //defines addition
		{
			dawingsdata = "";
			for (var k in defn) {
				dawingsdata += document.getElementById("current_experiment").value + ";" + defn[k] + ";" + data_drw[k] +
					"|";

			}
			dawingsdata = dawingsdata.substr(0, dawingsdata.length - 1);
			$.ajax({
				type: "post",
				data: {
					textData: dawingsdata
				},
				url: "savedata.php",
				success: function (data) {
					alert(data);
				}
			});
		}
	});




	bottomLayers_div = layers_layoutshape.cells('c');



	gridShapes = bottomLayers_div.attachGrid();
	gridShapes.setImagePath("dsa-common-files/codebase/imgs/");
	gridShapes.setHeader("ID,Type,Color,Status");
	//gridShapes.setInitWidths("50,100,60,100");
	gridShapes.setColAlign("center,center,center,center");
	gridShapes.setColTypes("ro,ro,ro,ro");
	gridShapes.setColSorting("str,str,str,str");

	gridShapes.init();
	gridShapes.setSkin("dhx_web");

	gridShapes.attachEvent("onRowSelect", function (id, ind) {
		if (ind == 3) {
			var valcell = gridShapes.cells(id, 0).getValue();
			var b2 = document.getElementById("eye" + valcell).src;
			viewer.drawer.clearOverlays();
			if (b2.substring(b2.length - 11, b2.length) == "openEye.gif") {
				var tempvar;
				document.getElementById("eye" + valcell).src = "codebase/imgs/closedEye.gif";
				tempvar = defn[valcell].split(";");
				defn[valcell] = tempvar[0] + ";" + tempvar[1] + ";0";

			} else {
				var tempvar;
				document.getElementById("eye" + valcell).src = "codebase/imgs/openEye.gif";
				tempvar = defn[valcell].split(";");
				defn[valcell] = tempvar[0] + ";" + tempvar[1] + ";1";
			}

			for (var k in defn) {
				var temvar = defn[k].split(";");
				if (temvar[0] == "poi") {
					if (temvar[2] == "1") {
						var temprect = data_drw[k].split(",");
						var pointX = temprect[0];
						var pointY = temprect[1];
						var nucleus_rect = new Seadragon.Rect(parseFloat(pointX), parseFloat(pointY), 0.025, 0.025); //(x,y,w,h)
						var poi_image = document.createElement("img");

						poi_image.src = get_url_for_poi_image(tempvar[1]);
						document.body.appendChild(poi_image);
						viewer.drawer.addOverlay(poi_image, nucleus_rect);
					}
				}
				if (temvar[0] == "rect") {
					if (temvar[2] == "1") {
						var temprect = data_drw[k].split(";");
						var point1 = temprect[0].split(",");
						var point2 = temprect[1].split(",");
						var x1 = parseFloat(point1[0]);
						var y1 = parseFloat(point1[1]);
						var x2 = parseFloat(point2[0]);
						var y2 = parseFloat(point2[1]);
						var h = Math.abs(y2 - y1);
						var w = Math.abs(x2 - x1);

						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid " + temvar[1]);
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, h); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					}
				}

				if (temvar[0] == "circ") {
					if (temvar[2] == "1") {
						var temprect = data_drw[k].split(";");
						var point1 = temprect[0].split(",");
						var point2 = temprect[1].split(",");
						var x1 = parseFloat(point1[0]);
						var y1 = parseFloat(point1[1]);
						var x2 = parseFloat(point2[0]);
						var y2 = parseFloat(point2[1]);
						var w = Math.abs(x2 - x1);

						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid " + temvar[1] + "; border-radius: 50%;");
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, w); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					}
				}

			}
		}
	});

	bottomLayers_div.setText('');


}




function toString(point, useParens) {
	var x = point.x;
	var y = point.y;
	var PRECISION = 3;
	if (x % 1 || y % 1) { // if not an integer,
		x = x.toFixed(PRECISION); // then restrict number of
		y = y.toFixed(PRECISION); // decimal places
	}

	if (useParens) {
		return x + "," + y;
	} else {
		return x + " x " + y;
	}
}


function showClix(event) {
	try {
		if (document.getElementById("clicked_item").value == "poi") {

			var pixel = Seadragon.Utils.getMousePosition(event).minus(Seadragon.Utils.getElementPosition(viewer.element));
			// alert(toString(pixel, true));
			var point = viewer.viewport.pointFromPixel(pixel);
			// alert (point.x.toFixed(3) + " : " + point.y.toFixed(3));
			var nucleus_rect = new Seadragon.Rect((parseFloat(point.x.toFixed(3)) - 0.025), (parseFloat(point.y.toFixed(
				3)) - 0.025), 0.025, 0.025); //(x,y,w,h)
			var poi_image = document.createElement("img");


			element_line_color = document.getElementById("line_color").value;
			poi_image.src = get_url_for_poi_image(element_line_color);

			/*				if (document.getElementById("line_color").value == "FF0000") {
					poi_image.src = "dsa-common-files/imgs/Pin1_Red.png";
				}
				if (document.getElementById("line_color").value == "00FF00") {
					poi_image.src = "dsa-common-files/imgs/Pin1_Green.png";
				}
				if (document.getElementById("line_color").value == "0000FF") {
					poi_image.src = "dsa-common-files/imgs/Pin1_Blue.png";
				}*/
			document.body.appendChild(poi_image);
			viewer.drawer.addOverlay(poi_image, nucleus_rect);
			defn[glbCounter] = "poi;" + "#" + document.getElementById("line_color").value + ";1";
			data_drw[glbCounter] = (parseFloat(point.x.toFixed(3)) - 0.025).toString() + "," + (parseFloat(point.y.toFixed(
				3)) - 0.025).toString();
			var clrGlb = defn[glbCounter].split(";");
			gridPois.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter +
					"' src='codebase/imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"
			], glbCounter);

			glbCounter = glbCounter + 1;
		}
		if (document.getElementById("clicked_item").value == "rect") {
			if ((document.getElementById("rect_x1").value == "") && (document.getElementById("rect_y1").value == "")) {
				var pixel = Seadragon.Utils.getMousePosition(event).minus(Seadragon.Utils.getElementPosition(viewer.element));
				var point = viewer.viewport.pointFromPixel(pixel);
				document.getElementById("rect_x1").value = parseFloat(point.x.toFixed(3));
				document.getElementById("rect_y1").value = parseFloat(point.y.toFixed(3));
				document.getElementById("container").style.cursor = "crosshair";
				document.getElementById("circ_x1").value = "";
				document.getElementById("circ_y1").value = "";
				document.getElementById("circ_x2").value = "";
				document.getElementById("circ_y2").value = "";
			} else {

				if ((document.getElementById("rect_x1").value != "") && (document.getElementById("rect_y1").value != "")) {
					document.getElementById("container").style.cursor = "default";
					var pixel = Seadragon.Utils.getMousePosition(event).minus(Seadragon.Utils.getElementPosition(viewer.element));
					var point = viewer.viewport.pointFromPixel(pixel);
					document.getElementById("rect_x2").value = parseFloat(point.x.toFixed(3));
					document.getElementById("rect_y2").value = parseFloat(point.y.toFixed(3));
					var x1 = parseFloat(document.getElementById("rect_x1").value);
					var y1 = parseFloat(document.getElementById("rect_y1").value);
					var x2 = parseFloat(document.getElementById("rect_x2").value);
					var y2 = parseFloat(document.getElementById("rect_y2").value);
					var h = Math.abs(y2 - y1);
					var w = Math.abs(x2 - x1);

					if (document.getElementById("line_color").value != "") {
						defn[glbCounter] = "rect;" + "#" + document.getElementById("line_color").value + ";1";
						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid  " + "#" + document.getElementById("line_color").value);
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, h); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					} else {
						defn[glbCounter] = "rect;" + "#FFFF00" + ";1";
						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid  #FFFF00");
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, h); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					}

					/////////////SAVE Drawing/////////////////////////////////////////////////////////////

					data_drw[glbCounter] = x1 + "," + y1 + ";" + x2 + "," + y2;
					var clrGlb = defn[glbCounter].split(";");
					gridShapes.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter +
							"' src='codebase/imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"
					], glbCounter);
					glbCounter = glbCounter + 1;


					/////////////////////////////////////////////////////////////////////////////////////

					document.getElementById("rect_x1").value = "";
					document.getElementById("rect_y1").value = "";
					document.getElementById("rect_x2").value = "";
					document.getElementById("rect_y2").value = "";

				}
			}
		}
		if (document.getElementById("clicked_item").value == "circ") {
			if ((document.getElementById("circ_x1").value == "") && (document.getElementById("circ_y1").value == "")) {
				var pixel = Seadragon.Utils.getMousePosition(event).minus(Seadragon.Utils.getElementPosition(viewer.element));
				var point = viewer.viewport.pointFromPixel(pixel);
				document.getElementById("circ_x1").value = parseFloat(point.x.toFixed(3));
				document.getElementById("circ_y1").value = parseFloat(point.y.toFixed(3));
				document.getElementById("container").style.cursor = "crosshair";
				document.getElementById("rect_x1").value = "";
				document.getElementById("rect_y1").value = "";
				document.getElementById("rect_x2").value = "";
				document.getElementById("rect_y2").value = "";
			} else {

				if ((document.getElementById("circ_x1").value != "") && (document.getElementById("circ_y1").value != "")) {
					document.getElementById("container").style.cursor = "default";
					var pixel = Seadragon.Utils.getMousePosition(event).minus(Seadragon.Utils.getElementPosition(viewer.element));
					var point = viewer.viewport.pointFromPixel(pixel);
					document.getElementById("circ_x2").value = parseFloat(point.x.toFixed(3));
					document.getElementById("circ_y2").value = parseFloat(point.y.toFixed(3));
					var x1 = parseFloat(document.getElementById("circ_x1").value);
					var y1 = parseFloat(document.getElementById("circ_y1").value);
					var x2 = parseFloat(document.getElementById("circ_x2").value);
					var y2 = parseFloat(document.getElementById("circ_y2").value);
					var w = Math.abs(x2 - x1);

					if (document.getElementById("line_color").value != "") {
						defn[glbCounter] = "circ;" + "#" + document.getElementById("line_color").value + ";1";
						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid " + "#" + document.getElementById("line_color").value +
							"; border-radius: 50%;");
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, w); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					} else {
						defn[glbCounter] = "circ;" + "#FFFF00" + ";1";
						var cur_div = document.createElement("div");
						cur_div.setAttribute("style", "border: 2px solid #FFFF00; border-radius: 50%;");
						document.body.appendChild(cur_div);
						var rect = new Seadragon.Rect(x1, y1, w, w); //(x,y,w,h)
						viewer.drawer.addOverlay(cur_div, rect);
					}

					/////////////SAVE Drawing/////////////////////////////////////////////////////////////

					data_drw[glbCounter] = x1 + "," + y1 + ";" + x2 + "," + y2;
					var clrGlb = defn[glbCounter].split(";");
					gridShapes.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter +
							"' src='codebase/imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"
					], glbCounter);
					glbCounter = glbCounter + 1;


					/////////////////////////////////////////////////////////////////////////////////////

					document.getElementById("circ_x1").value = "";
					document.getElementById("circ_y1").value = "";
					document.getElementById("circ_x2").value = "";
					document.getElementById("circ_y2").value = "";

				}
			}
		}
	} catch (err) {

		alert('hi it died above!!');
		alert(err.message);
	}
}



function legacy_ajax_draw_roi_and_pos()
	{
	/* This is messy code copied from Mridul that was called upload loading of a slide and drew and ROIs associated with it.. been refactor */
	
	$.ajax({ type :"POST", 
					 url : "local_php/get_dsa_annotation_data.php",
					 data : { experiment: document.getElementById("current_experiment").value },
					 success: function(data){ 
						if(data!="")
						{
							var tdata=data.split("|");
							for(var i in tdata)
							{
								var tvar=tdata[i].split(";");
								defn[glbCounter]=tvar[0]+";"+tvar[1]+";"+"1";
								
								data_drw[glbCounter]=tdata[i].replace(tvar[0]+";"+tvar[1]+";",""); 
								var clrGlb = defn[glbCounter].split(";");
								if (tvar[0]=="poi") {
									gridPois.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter + "' src='imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"], glbCounter);
								}
								if (tvar[0]=="rect") {
									gridShapes.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter + "' src='imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"], glbCounter);								
								}
								if (tvar[0]=="circ") {
									gridShapes.addRow(glbCounter, [glbCounter, clrGlb[0], clrGlb[1], "<img id='eye" + glbCounter + "' src='imgs/openEye.gif' style='border: #707070 1px solid; width: 16px; height: 16px; cursor: pointer;'>"], glbCounter);								
								}

								glbCounter+=1;
							}
							for (var k in defn){
								var temvar=defn[k].split(";");
								if ( temvar[0]=="poi") {
									 if(temvar[2]=="1"){
										 var temprect = data_drw[k].split(",");
										 var pointX = temprect[0];
										 var pointY = temprect[1];
										 var nucleus_rect= new Seadragon.Rect(parseFloat(pointX),parseFloat(pointY),0.025,0.025);//(x,y,w,h)
										 var nucleus_image = document.createElement("img");
										 if (temvar[1] == "#FF0000") {
											 nucleus_image.src = "dsa-common-files/imgs/Pin1_Red.png";
										 }
										 if (temvar[1] == "#00FF00") {
											 nucleus_image.src = "dsa-common-files/imgs/Pin1_Green.png";
										 }
										 if (temvar[1] == "#0000FF") {
											 nucleus_image.src = "dsa-common-files/imgs/Pin1_Blue.png";
										 }
										 document.body.appendChild(nucleus_image);
										 viewer.drawer.addOverlay(nucleus_image, nucleus_rect);							 
									 }
								}
								if ( temvar[0]=="rect") {
									 if(temvar[2]=="1"){
										var temprect = data_drw[k].split(";");
										var point1 = temprect[0].split(",");
										var point2 = temprect[1].split(",");
										var x1 = parseFloat(point1[0]);
										var y1 = parseFloat(point1[1]);
										var x2 = parseFloat(point2[0]);
										var y2 = parseFloat(point2[1]);
										var h = Math.abs(y2-y1);
										var w = Math.abs(x2-x1);

										var cur_div = document.createElement("div");
										cur_div.setAttribute("style", "border: 2px solid "+temvar[1]);
										document.body.appendChild(cur_div);
										var rect = new Seadragon.Rect(x1,y1,w,h);//(x,y,w,h)
										viewer.drawer.addOverlay(cur_div, rect);
									 }
								}
								if ( temvar[0]=="circ") {
									 if(temvar[2]=="1"){
										var temprect = data_drw[k].split(";");
										var point1 = temprect[0].split(",");
										var point2 = temprect[1].split(",");
										var x1 = parseFloat(point1[0]);
										var y1 = parseFloat(point1[1]);
										var x2 = parseFloat(point2[0]);
										var y2 = parseFloat(point2[1]);
										var w = Math.abs(x2-x1);

										var cur_div = document.createElement("div");
										cur_div.setAttribute("style", "border: 2px solid "+temvar[1]+"; border-radius: 50%;");
										document.body.appendChild(cur_div);
										var rect = new Seadragon.Rect(x1,y1,w,w);//(x,y,w,h)
										viewer.drawer.addOverlay(cur_div, rect);
									 }
								}								
							}
						}
					},
				error: function(xhr, textStatus, errorThrown){
				   alert(errorThrown);
				}
			});
	
	}

