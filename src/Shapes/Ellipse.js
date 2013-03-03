OpenSeajax.Shapes.Ellipse = function(width, height) {
   this.width = width;
   this.height = height;  
   this.div = document.createElement("div");

   var paper = Raphael(this.div, width, height);
   var maxZoom = viewer.viewport.getMaxZoom();
   this.ellipse = paper.ellipse(
      width / (2 * maxZoom), height / (2 * maxZoom),
      width / (2 * maxZoom), height / (2 * maxZoom));
   this.ellipse.node.style.cursor = "pointer";
}

OpenSeajax.Shapes.Ellipse.prototype.attachTo = function(viewer, x, y) {
   var center = OpenSeajax.toWorldCoordinates(viewer, x, y);
   var extent = OpenSeajax.toWorldCoordinates(viewer, this.width, this.height);
   viewer.drawer.addOverlay(this.div, new Seadragon.Rect(center.x, center.y, extent.x, extent.y)); 

   var e = this.ellipse;
   viewer.addEventListener("animation", function() { 
      var zoom = viewer.viewport.getZoom(true);
      e.scale(zoom, zoom, 0, 0);
   });
}

OpenSeajax.Shapes.Ellipse.prototype.getElement = function() {
   return this.ellipse;
}

OpenSeajax.Shapes.Ellipse.prototype.redraw = function(viewer) { 
   var zoom = viewer.viewport.getZoom(true);
   this.ellipse.scale(zoom, zoom, 0, 0); 
} 

OpenSeajax.Shapes.Ellipse.prototype.addEventListener = function(evt, listener) {
   Seadragon.Utils.addEvent(this.div, evt, Seadragon.Utils.stopEvent);
   this.img.addEventListener(evt, listener, false);
}
