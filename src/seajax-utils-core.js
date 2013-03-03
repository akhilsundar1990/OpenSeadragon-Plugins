/**
 * Namespace declarations
 */
OpenSeajax = {};
OpenSeajax.Shapes = {};
OpenSeajax.Tilesource = {};

/**
 * Translates from OpenSeajax viewer coordinate 
 * system to image coordinate system 
 */
OpenSeajax.toImageCoordinates = function(viewer, viewerX, viewerY) {
   return new Seadragon.Point(viewerX * viewer.source.width, viewerY * viewer.source.height * viewer.source.aspectRatio);
}

/**
 * Translates from image coordinate system to
 * OpenSeajax viewer coordinate system 
 */
OpenSeajax.toWorldCoordinates = function(viewer, imageX, imageY) {
   return new Seadragon.Point(imageX / viewer.source.width, imageY / viewer.source.height / viewer.source.aspectRatio);
}
