No5.OpenSeajax.Shapes.Marker = function(src) {
   this.img = document.createElement("img");
   this.img.src = src;
}

No5.OpenSeajax.Shapes.Marker.prototype.attachTo = function(viewer, x, y) {
   var pt = No5.OpenSeajax.toWorldCoordinates(viewer, x, y);
   viewer.drawer.addOverlay(this.img, pt, Seadragon.OverlayPlacement.BOTTOM);   
}

No5.OpenSeajax.Shapes.Marker.prototype.addEventListener = function(evt, listener) {
   Seadragon.Utils.addEvent(this.img, evt, Seadragon.Utils.stopEvent);
   this.img.addEventListener(evt, listener, false);
}
