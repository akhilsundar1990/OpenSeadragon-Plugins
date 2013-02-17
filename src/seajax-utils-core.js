/**
 * Namespace declarations
 */
No5 = {};
No5.OpenSeajax = {};
No5.OpenSeajax.Shapes = {};
No5.OpenSeajax.Tilesource = {};

/**
 * Translates from OpenSeajax viewer coordinate 
 * system to image coordinate system 
 */
No5.OpenSeajax.toImageCoordinates = function(viewer, viewerX, viewerY) {
   return new Seadragon.Point(viewerX * viewer.source.width, viewerY * viewer.source.height * viewer.source.aspectRatio);
}

/**
 * Translates from image coordinate system to
 * OpenSeajax viewer coordinate system 
 */
No5.OpenSeajax.toWorldCoordinates = function(viewer, imageX, imageY) {
   return new Seadragon.Point(imageX / viewer.source.width, imageY / viewer.source.height / viewer.source.aspectRatio);
}
