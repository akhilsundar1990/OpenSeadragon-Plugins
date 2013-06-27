var KEEP_LOGS = true;
if( typeof _log !== 'function' ) {
	_log = function() {
		if( !KEEP_LOGS ) return;
		try { console.log(arguments); } catch(err) {}
	}
}

var AnnotationTypes = {},
	OverlayTypes = {};

function AnnotationData(options) { this._init(options || {}); }

/** Instantiate a copy from storage data. */
AnnotationData.fromValueObject = function(obj) {
	var result;
	if( AnnotationTypes.hasOwnProperty(obj.type) )
		result = new AnnotationTypes[obj.type](obj);
	else
		result = new AnnotationData(obj);
	return result;
};
$.extend(AnnotationData.prototype, {
	OPTIONS: {
		id: null,
		type: 'unknown',

		label: null,
		points: null,

		color: '#FF00FF',
		alpha: 1,
		filled: false,
		closed: false
	},
		
	/** If positive, limit the number of points to maxPoints. */
	maxPoints: -1,
	
	_init: function(options) {
		var opts = $.extend({}, this.OPTIONS, options);
		for( var opt in this.OPTIONS )
			this[opt] = opts[opt];
		if( this.points == null ) this.points = [];
		
		this.bounds = null;
	},
	
	/** 
	 * Return the bounds, computing if necessary or request by <code>recompute</code>.
	 * @param {boolean} recompute to force bounds to be recomputed
	 * @return {null} the bounds ({x,y,width,height}) or <code>null</code> if no points
	 */
	getBounds: function(recompute) {
		if( this.points.length < 1 ) return null;
		if( this.bounds == null || recompute ) {
			var start = this.points[0], top, bottom, left, right;
			top = bottom = start.y;
			left = right = start.x;
			for( var i = 1; i < this.points.length; ++i ) {
				var p = this.points[i];
				if( p.y < top )    top = p.y;
				if( p.y > bottom ) bottom = p.y;
				if( p.x < left )   left = p.x;
				if( p.x > right )  right = p.x;
			}
			this.bounds = {x: left, y: top, width: right - left, height: bottom - top};
		}
		return this.bounds;
	},
	
	/** Add a point and invalidate the bounds. */
	addPoint: function(point) {
		if( this.maxPoints > 0 && this.points.length >= this.maxPoints )
			throw new Error('Points already at max: ' + this.maxPoints);
		this.points.push(point);
		this.bounds = null;
	},
	
	/** Remove a point and invalidate the bounds. */
	removePoint: function(index) {
		if( typeof index !== 'number' ) throw new Error('index is not a number');
		if( index < 0 || index >= this.points.length ) throw new Error('index out of range: ' + index);
		this.points.splice(index, 1);
		this.bounds = null;
	},
	
	/** Replace an existing point and invalidate the bounds if changed. */
	replacePoint: function(index, point) {
		if( typeof index !== 'number' ) throw new Error('index is not a number');
		if( index < 0 || index > this.points.length ) throw new Error('index out of range: ' + index);
		if( index === this.points.length ) {
			this.addPoint(point);
			return null;
		}
		var old = this.points[index];
		this.points[index] = point;
		if( old.x !== point.x || old.y !== point.y )
			this.bounds = null;
		return old;
	},
	
	/** Return a copy of this data with only the values for storage. */
	asValueObject: function() {
		var obj = {};
		for( var opt in this.OPTIONS )
			obj[opt] = this[opt];
		return obj;
	}
});

/** Point of Interest data. */
function PointOfInterestData(options) {
	options = options || {};
	options.type = 'poi';
	this._init(options);
}
AnnotationTypes['poi'] = PointOfInterestData;
$.extend(PointOfInterestData.prototype, AnnotationData.prototype, {
	OPTIONS: $.extend({}, AnnotationData.prototype.OPTIONS, {
		imgsrc: null,
		rectsize: 0.025
	}),
	
	maxPoints: 1,
	
	/** 
	 * Return the bounds, computing if necessary or request by <code>recompute</code>.
	 * @param {boolean} recompute to force bounds to be recomputed
	 * @return {null} the bounds ({x,y,width,height}) or <code>null</code> if no points
	 */
	getBounds: function(recompute) {
		if( this.points.length < 1 ) return null;
		if( this.bounds == null || recompute ) {
			var p = this.points[0], size = this.rectsize;
			this.bounds = {x: p.x - size, y: p.y - size, width: size, height: size};
		}
		return this.bounds;
	}
});

/** A rectangle. */
function RectangleData(options) {
	options = options || {};
	options.type = 'rect';
	this._init(options);
}
AnnotationTypes['rect'] = RectangleData;
$.extend(RectangleData.prototype, AnnotationData.prototype, {
	maxPoints: 2
});

/** A circle / oval. */
function CircleData(options) {
	options = options || {};
	options.type = 'circle';
	this._init(options);
}
AnnotationTypes['circle'] = CircleData;
$.extend(CircleData.prototype, AnnotationData.prototype, {
	maxPoints: 2
});

/** Polygons and freehand drawing data. */
function PolygonData(options) {
	options = options || {};
	if( options.type !== 'polygon' && options.type !== 'freehand' )
		options.type = 'polygon';
	this._init(options);
}
AnnotationTypes['polygon'] = PolygonData;
AnnotationTypes['freehand'] = PolygonData;
$.extend(PolygonData.prototype, AnnotationData.prototype);

//
// END data objects
//

//
// BEGIN overlays
//

/** Annotation overlay renderer. */
function AnnotationOverlay(options) { this._init(options || {}); }
AnnotationOverlay.fromValueObject = function(obj) {
	var result;
	if( OverlayTypes.hasOwnProperty(obj.type) )
		result = new OverlayTypes[obj.type]({data: obj});
	else
		result = new AnnotationData({data: obj});
	return result;
};
$.extend(AnnotationOverlay.prototype, {
	EMPTY_RECT: new OpenSeadragon.Rect(0,0,0,0),
	
	_init: function(options) {
		if( options.data )
			this.data = AnnotationData.fromValueObject(options.data);
		else
			this.data = AnnotationData.fromValueObject(options);
		
		this.viewer = null;
		this.element = null;
		this.labelelement = null;
		if( options.viewer ) this.attachTo(options.viewer);
	},

	/** Implement shape specific drawing. */
	draw: $.noop,

	/** Called by detach() for extra cleanup. */
	cleanup: $.noop,

	/** Creates the drawing element, which is a div by default. */
	createElement: function() {
		return document.createElement('div');
	},
	
	/** Creates the label display element. */
	createLabelElement: function() {
		var el = document.createElement('div');
		// TODO: use negative 'top' or 'left' values to place outside of element container
		$(el).css({
			'position': 'absolute',
			'overflow': 'visible',
			'top': '0px',
			'left': '0px',
		});
		return el;
	},
	
	attachTo: function(viewer) {
		this.viewer = viewer;
		this.element = this.createElement();
		this.labelelement = this.createLabelElement();
		$(this.labelelement).text(this.data.label).appendTo(this.element);
		viewer.drawer.addOverlay(this.element, this.EMPTY_RECT);
		this.redraw();
	},

	detach: function() {
		if( !this.viewer ) return;
		this.viewer.drawer.removeOverlay(this.element);
		this.viewer = this.element = this.labelelement = null;
		this.cleanup();
	},
	
	updateBounds: function() {
		var bounds, rect;
		if( !this.viewer ) return;
		bounds = this.data.getBounds();
		if( bounds == null ) {
			rect = this.EMPTY_RECT;
		} else {
			rect = new OpenSeadragon.Rect(
				bounds.x, bounds.y, bounds.width, bounds.height);
		}
		this.viewer.drawer.updateOverlay(this.element, rect);
	},
	
	redraw: function() {
		if( this.viewer ) {
			this.updateBounds();
			this.labelelement.innerText = this.data.label || '';
			this.draw();
		}
	}
});

function POIOverlay(options) {
	options = options || {};
	options.type = 'poi';
	this._init(options);
};
OverlayTypes['poi'] = POIOverlay;
$.extend(POIOverlay.prototype, AnnotationOverlay.prototype, {
	_superinit: AnnotationOverlay.prototype._init,
	
	_init: function(options) {
		window.lastPOI = this; // FIXME temp
		window.lastOptions = options; // FIXME temp
		this._superinit(options);
		
		this.img = document.createElement('img');
		var $img = $(this.img);
		if( this.data.imgsrc )
			$img.attr('src', this.data.imgsrc);
		$img.css({width: '100%', height: '100%'});
		$img.appendTo(this.element);
	}
});

/** Mixin for overlays using a <DIV> and CSS. */
var DivOverlayMixin = {
	/** Implement for initial CSS settings on the DIV. */
	applyStaticCSS: $.noop,

	/** For dynamic attributes, defaults implemented. */
	applyDynamicCSS: function() {
		var d = this.data;
		this.$element.css({
			'border-color': d.color,
			'opacity': d.alpha,
			'filter': 'alpha(opacity=' + (d.alpha*100) + ')',
			'background': (d.filled ? d.color : '')
		});
		this.labelelement.innerText = d.label || '';
	},

	/** Creates the DIV and applies the static CSS to it. */
	createElement: function() {
		var e = document.createElement('div');
		this.$element = $(e);
		this.applyStaticCSS();
		return e;
	},

	cleanup: function() { 
		this.$element = null;
	},

	draw: function() {
		if( !this.viewer ) return;
		this.applyDynamicCSS();
	}
};

/** An overlay for a rectangle annotation. */
function RectangleOverlay(options) {
	options = options || {};
	options.type = 'rect';
	this._init(options || {});
}
OverlayTypes['rect'] = RectangleOverlay;
$.extend(RectangleOverlay.prototype,
			AnnotationOverlay.prototype,
			DivOverlayMixin, {
	/** Sets the border to show the rectangle. */
	applyStaticCSS: function() {
		this.$element.css({
			'position': 'relative',
			'border-width': '2px',
			'border-style': 'solid'
		});
	}
});

/** An overlay for a circle annotation. */
function CircleOverlay(options) {
	options = options || {};
	options.type = 'circle';
	this._init(options);
};
OverlayTypes['circle'] = CircleOverlay;
$.extend(CircleOverlay.prototype,
			AnnotationOverlay.prototype,
			DivOverlayMixin, {
	/** Sets the border and makes it circular. */
	applyStaticCSS: function() {
		this.$element.css({
			'position': 'relative',
			'border-width':  '2px',
			'border-style':  'solid',
			'border-radius': '50%'
		});
	}
});


/**
 * Creates a polygon or freehand annotation.
 *
 * @param {object} the options, which may be:<br /><ul>
 *   <li>points - an initial array of points</li>
 *   <li>color - a color string of the form #HHHHHH</li>
 *   <li>alpha - a number [0,1] indicating the alpha level</li>
 *   <li>filled - if the shape should be filled</li>
 *   <li>closed - if the shape should be closed</li>
 *   <li>viewer - the OpenSeadragon viewer to attach to, if not given call attachTo(viewer) later</li>
 * </ul>
 */
function PolygonOverlay(options) {
	options = options || {};
	var type = options.type;
	if( type !== 'polygon' && type !== 'freehand' )
		options.type = 'polygon';
	this._init(options);
};
OverlayTypes['polygon'] = PolygonOverlay;
OverlayTypes['freehand'] = PolygonOverlay;
$.extend(PolygonOverlay.prototype, AnnotationOverlay.prototype, {
	_superinit: AnnotationOverlay.prototype._init,
	_superCreateElement: AnnotationOverlay.prototype.createElement,
			
	_init: function(options) {
		this._superinit(options);

		this._lastBounds = null;
		this._lastCanvasSize = null;
		this._canvasPoints = null;
	},

	createElement: function() {
      this.canvas = document.createElement('canvas');
      this.$canvas = $(this.canvas).css({'height': '100%', 'width': '100%'});
		var element = this._superCreateElement();
      this.$canvas.appendTo(element);
		return element;
	},

	addPoint: function(point) {
		this.data.addPoint(point);
		this.clearCaches();
		this.redraw();
	},

	clearCaches: function() {
		this._lastBounds = null;
		this._lastCanvasSize = null;
		this._canvasPoints = null;
	},

	/**
	 * Returns whether the bounds are different from the cached version.
	 * If not given, uses the data bounds.
	 */
	areBoundsChanged: function(bounds) {
		var last = this._lastBounds, current = bounds;
		if( current === undefined ) current = this.data.getBounds();
		
		if( last == null && current != null ) return true;
		if( last != null && current == null ) return true;
		if( last.x !== current.x || last.y !== current.y ||
				last.width !== current.width || last.height !== current.height ) {
			return true;
		}

		return false;
	},

	/** Same as areBoundsChanged but caches the bounds if changed. */
	cacheBounds: function(bounds) {
		if( bounds === undefined ) bounds = this.data.getBounds();
		if( this.areBoundsChanged(bounds) ) {
			this._lastBounds = bounds;
			return true;
		}
		return false;
	},
			
	/**
	 * Returns whether the canvas size is different from the cached version.
	 * If not given, uses the element dimensions.
	 */
	isCanvasResized: function(width, height) {
		var last = this._lastCanvasSize;
		if( width == null ) {
			width = this.element.width;
			height = this.element.height;
		}
		if( last == null ) return true;
		if( last.width !== width || last.height !== height ) return true;

		return false;
	},

	/** Same as isCanvasResized but caches the size if changed. */
	cacheCanvasSize: function(width, height) {
		if( this.isCanvasResized(width, height) ) {
			this._lastCanvasSize = {width: width, height: height};
			return true;
		}
		return false;
	},

	draw: function() {
		if( !this.viewer ) return;

		var el = this.canvas, cwidth = el.width, cheight = el.height,
			ctx = this.canvas.getContext('2d'), data = this.data;
			
		if( cwidth === undefined || cheight === undefined ) {
			_log('PolygonAnnotation.draw, canvas width/height undefined:', cwidth, cheight);
			return;
		}

		// always clear
		ctx.clearRect(0, 0, cwidth, cheight);
		if( data.points.length < 2 )
			return;
		
		var cpoints = this.getCanvasPoints(), first = cpoints[0];

		ctx.beginPath();
		ctx.strokeStyle = data.color;
		ctx.globalAlpha = data.alpha;

		// draw the path
		ctx.moveTo(first.x, first.y);
		for( var i = 1, len = cpoints.length; i < len; ++i ) {
			var p = cpoints[i];
			ctx.lineTo(p.x, p.y);
		}

		if( data.closed ) ctx.closePath();

		ctx.stroke();

		if( data.filled ) {
			ctx.fillStyle = data.color;
			ctx.fill();
		}
	},

	/** Gets the overlay points relative to the canvas. */
	getCanvasPoints: function() {
		var bounds = this.data.getBounds(),
			cwidth = this.canvas.width,
			cheight = this.canvas.height,
			cpoints = this._canvasPoints,
			cached;
			
		if( cwidth === undefined || cheight === undefined ) {
			_log('PolygonAnnotation.getCanvasPoints, canvas width or height undefined.', cwidth, cheight);
			return null;
		}

		// see if we can reuse the earlier points
		cached = this.cacheBounds(bounds);
		cached = this.cacheCanvasSize(cwidth, cheight) && cached;
		cached = cached && cpoints != null;
		if( cached ) return cpoints;

		// translate based on current bounds and canvas size
		var xorigin = bounds.x,     yorigin = bounds.y,
		      width = bounds.width,  height = bounds.height,
			points = this.data.points,        len = points.length,
			i = 0, x, y, p, Point = OpenSeadragon.Point;
			
		cpoints = Array(len);
		for(; i < len; ++i) {
			p = points[i];
			x = ((p.x - xorigin) / width)  * cwidth;
			y = ((p.y - yorigin) / height) * cheight;
			cpoints[i] = new Point(x, y);
		}

		// cache and return
		this._canvasPoints = cpoints;
		return cpoints;
	},
			
	cleanup: function() {
		this.clearCaches();
	}
});

//
// END overlays
//

// BEGIN Annotation state controller
function AnnotationState(toolbar, viewer) {
	// need anything here?
	this.drawMode = 'poi';
	this.lineColor = '#FFFF00';
	this.toolbar = null;
	this.viewer = null;
	this.isDrawing = false;
	this.annotations = [];

	if( toolbar ) this.setupToolbar(toolbar);
	if( viewer ) this.setSeadragonViewer(viewer);
}
$.extend(AnnotationState.prototype, {
	setDrawMode: function(mode) {
		// cancel the current annotation if switching modes
		if( mode !== this.drawMode ) 
			this.cancelAnnotation();
		this.drawMode = mode;
	},

	selectForegroundColor: function(color) {
		if( color ) 
			this.colorPicker.setColor(color);
		else
			this.colorPicker.setColor(this.lineColor);
		this.colorPicker.show();
	},
	
	setForegroundColor: function(color) {
		this.lineColor = color;
		// FIXME
		$('#line_color').val(color);
		this.$colorInput.css('background-color', color);
	},
	
	setSeadragonViewer: function(viewer) {
		if( this.viewer ) {
			_log('Warning: setSeadragonViewer already called.', this.viewer, viewer, this);
		}
		this.viewer = viewer;
		OpenSeadragon.Utils.addEvent(viewer.element, 'click', $.proxy(this._viewerClicked, this));
		
		// set up listeners for freehand drawing
		var self = this;
		var $el = this.$el = $(viewer.element);
		$el.on('mousedown', function(evt) {
			var loc, onMouseMove;
			if( 'freehand' === self.drawMode && self.isDrawing ) {
				loc = self._getEventLocation(evt);
				self._startFreehand(loc.point);
				onMouseMove = function(event) {
					var loc = self._getEventLocation(event);
					self._overlay.addPoint(loc.point);
				};
				$el.one('mouseup', function(event) {
					// FIXME this is not preventing the click event for some reason
					event.preventDefault();
					event.stopImmediatePropagation();
					
					// stop listening to movement and turn off drawing
					$el.off('mousemove', onMouseMove);
					self.annotations.push(self._overlay);
					self._overlay = null;
					self.setIsDrawing(false, true);
				});
				$el.on('mousemove', onMouseMove);
			}
		});
	},
	
	setIsDrawing: function(drawing, setItemState) {
		this.isDrawing = drawing;
		if( !drawing ) {
			// TODO finalize freehand / polygon
			if( this.drawMode !== 'polygon' && this._overlay != null )
				this.cancelAnnotation();
			if( this._overlay != null )
				this.annotations.push(this._overlay);
			this._overlay = null;
		}
		if( setItemState )
			this.toolbar.setItemState('start_draw', drawing);
		this.viewer.setMouseNavEnabled(!drawing);
	},
	
	/** 
	 * Gets the pixel and point location from a click event.
	 * @return {object} with 'pixel' and 'point' attributes
	 */
	_getEventLocation: function(event) {
		var u = OpenSeadragon.Utils, 
			pixel = u.getMousePosition(event).minus(u.getElementPosition(this.viewer.element)),
			point = this.viewer.viewport.pointFromPixel(pixel);
		return {pixel: pixel, point: point};
	},
	
	_viewerClicked: function(event) {
		var location = this._getEventLocation(event),
			pixel = location.pixel,
			point = location.point;
		_log('_viewerClicked', pixel, point, event, this);
		if( this.isDrawing ) {
			var isNewOverlay = this._overlay == null;
			
			if( 'poi' === this.drawMode ) {
				this._drawPOI(point);
			} else if( 'polygon' === this.drawMode ) {
				if( isNewOverlay )
					this._startPolygon(point);
				else
					this._overlay.addPoint(point);
			} else if( 'rect' == this.drawMode ) {
				if( isNewOverlay ) {
					this._startRectangle(point);
				} else {
					this._overlay.data.replacePoint(1, point);
					this._overlay.redraw();
					this.annotations.push(this._overlay);
					this._overlay = null; // FIXME save these
				}
			} else if( 'circle' === this.drawMode ) {
				if( isNewOverlay ) {
					this._startCircle(point);
				} else {
					this._overlay.data.replacePoint(1, point);
					this._overlay.redraw();
					this.annotations.push(this._overlay);
					this._overlay = null; // FIXME save these
				}
			}
		}
	},

	_startRectangle: function(point) {
		this._overlay = new RectangleOverlay({
			label: String(this.annotations.length + 1),
			points: [point],
			color: this.lineColor,
			viewer: this.viewer,
		});
		var self = this, $el = this.$el = $(this.viewer.element);
		var onMouseMove = function(event) {
			var location = self._getEventLocation(event);
			self._overlay.data.replacePoint(1, location.point);
			self._overlay.redraw();
		};
		$el.one('mouseup', function() { $el.off('mousemove', onMouseMove); });
		$el.on('mousemove', onMouseMove);
	},

	_startCircle: function(point) {
		this._overlay = new CircleOverlay({
			label: String(this.annotations.length + 1),
			points: [point],
			color: this.lineColor,
			viewer: this.viewer,
		});
		var self = this, $el = this.$el = $(this.viewer.element);
		var onMouseMove = function(event) {
			var location = self._getEventLocation(event);
			self._overlay.data.replacePoint(1, location.point);
			self._overlay.redraw();
		};
		$el.one('mouseup', function() { $el.off('mousemove', onMouseMove); });
		$el.on('mousemove', onMouseMove);
	},
	
	/** Starts a freehand annotation at the given point. */
	_startFreehand: function(point) {
		this._overlay = new PolygonOverlay({
			label: String(this.annotations.length + 1),
			type: 'freehand',
			points: [point],
			color: this.lineColor,
			viewer: this.viewer
		});
	},
	
	/** Starts a polygon annotation at the given point. */
	_startPolygon: function(point) {
		this._overlay = new PolygonOverlay({
			label: String(this.annotations.length + 1),
			type: 'polygon',
			points: [point],
			color: this.lineColor,
			viewer: this.viewer,
			filled: true,
			closed: true,
			alpha: 0.3
		});
	},

	/**
	 * Draws a POI (Point of Interest) based on the current 
	 * point.
	 */
	_drawPOI: function(point) {
		var lineColor = this.lineColor || '#FFFF00',
			pinImg = get_url_for_poi_image(lineColor.substring(1));
			
		var overlay = new POIOverlay({
			label: String(this.annotations.length + 1),
			type: 'poi',
			imgsrc: pinImg,
			points: [point],
			color: this.lineColor,
			viewer: this.viewer
		});
		this.annotations.push(overlay);
	},

	
	/** Cancel and remove the current annotation. */
	cancelAnnotation: function() {
		if( this._overlay != null ) {
			this._overlay.detach();
			this._overlay = null;
		}
	},

	/**
	 * Set and initialize the dhtmlx.Toolbar instance.
	 * Should only be called once.
	 */
	setupToolbar: function(toolbar) {
		var self = this;
		if( this.toolbar ) {
			_log('Warning: setupToolbar already called.', this.toolbar, toolbar, this);
		}
		this.toolbar = toolbar;
		toolbar.attachEvent('onClick', $.proxy(this._toolbarClicked, this));
		toolbar.attachEvent('onStateChange', $.proxy(this._stateChanged, this));
		
		// this.toolbar.disableItem('foreground_color_input');
		this.$colorInput = $(toolbar.cont).find('input.inp').first();
		this.$colorInput.on('click keypress', function(event){
			event.preventDefault();
			if( event.type === 'click' || (event.type === 'keypress' && event.which == 13) )
				self.selectForegroundColor();
		});

		this.colorPicker = new dhtmlXColorPicker(null, null, true, true);
		this.colorPicker.setSkin('');
		this.colorPicker.setOnSelectHandler($.proxy(this.setForegroundColor, this));
		this.colorPicker.init();
		
		this.setForegroundColor(this.lineColor);
	},

	_toolbarClicked: function(id) {
		_log('_toolbarClicked', id, this);
		// FIXME handle this ourselves, forward for now
		setup_wsi_toolbar(id);

		var isDrawMode = id.substring(0, "drawmode_".length) === "drawmode_";
		if( isDrawMode ) {
			this.setDrawMode(id.substring("drawmode_".length));
		} else if( id === 'foreground_color' ) {
			this.selectForegroundColor();
		} else if( id === 'add_poi' ) {
			if( this.drawMode === 'poi' ) {
				this.toolbar.setItemState('add_poi', false);
				this.drawMode = null;
			} else {
				this.setDrawMode('poi');
			}
		}
	},
	
	/** Return all the annotation data as value objects. */
	storeAnnotations: function() {
		return $.map(this.annotations, function(el, idx) {
			return el.data.asValueObject();
		});
	},
	
	/** Remove all the current annotations. */
	clearAnnotations: function() {
		var annotations = this.annotations, annotation;
		while( annotation = annotations.pop() )
			annotation.detach();
	},
	
	/** Load a set of annotations from value objects. */
	loadAnnotations: function(values) {
		var overlay;
		this.clearAnnotations();
		for( var i=0, ilen=values.length; i < ilen; ++i ) {
			overlay = AnnotationOverlay.fromValueObject(values[i]);
			overlay.attachTo(this.viewer);
			this.annotations.push(overlay);
		}
	},

	_stateChanged: function(id, state) {
		_log('_stateChanged', id, state, this);
		if( 'start_draw' === id ) {
			this.setIsDrawing(state);
		}
	},
});
var annotationState = new AnnotationState();
// END Annotation state controller 
