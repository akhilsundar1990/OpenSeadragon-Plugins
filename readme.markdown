# OpenSeajax Utils
This is a fork of rsimon's seajax-utils which was is utility library that provides a number of extras to the [Seadragon AJAX viewer] (http://expression.microsoft.com/en-us/gg413362.aspx). 

As Seadragon is no longer supported, the most active development in this space has been on OpenSeadragon (see  )

Please note-- the bulk of this original work was from RSimon although I am changing some of the variable names and function calls so they are compatible with OpenSeadragon

* OpenSeajax Utils act as a bridge between OpenSeadragon Library (AJAX/Javascript) and the [Raphael] (http://raphaeljs.com) JavaScript vector drawing & animation library, so that  Raphael drawing elements can be used as overlays on Deep Zoom images. 
* A demo showing rSimon's implementation using  Raphael integration can be found [here] (http://maps.no5.at/seajax-utils-demo/example.html).

## Getting Started - Adding Raphael Overlays

##BELOW CODE WILL BE UPDATED--- this is code from current seadragon implementation

The file _example-raphael.html_ illustrates how you can add Raphael drawing elements as overlays to a Deep Zoom image hosted on [zoom.it] (http://zoom.it/WwI0). The key part of the code is below. Note that the coordinate system for no.5 Seajax Utils is the original image's pixel coordinates! 

     function addOverlays() {
        var marker = new No5.Seajax.Shapes.Marker("pushpin-icon.png");
        marker.attachTo(viewer, 2000, 1750);

        var ellipse = new No5.Seajax.Shapes.Ellipse(1500, 500);    
        ellipse.attachTo(viewer, 20, 800);

        var points = new Array();
        points[0] = new Seadragon.Point(900, 900);
        points[1] = new Seadragon.Point(500, 100);
        points[2] = new Seadragon.Point(600, 600);
        points[3] = new Seadragon.Point(100, 500);
        var polygon = new No5.Seajax.Shapes.Polygon(points);
        polygon.attachTo(viewer);
     }

To set drawing attributes, animation behavior, event handlers, etc. you can get hold of the Raphael element with the getElement() method:

     ellipse.getElement().attr{("fill":"#ff0000", "fill-opacity":0.5, "stroke-width":"1px", "stroke":"#ffffff"})};

## Getting Started - Tile Sources

The files _example-osm.html_ and _examples/example-tms.html_ show the use of seajax-utils' additional tile
sources. A code sample is below.

     viewer = new Seadragon.Viewer("viewer");
     viewer.openTileSource(new No5.Seajax.Tilesource.OSM());

## License

no.5 Seajax Utils are licensed under the MIT License. See the included file 'MIT-LICENSE.txt'
for details.

## Todos
* OpenSeadragon implementation.. is a work in progress 
* Although polygon coordinate transformation seems to work correctly, there's a scaling factor of 2 required which I can't explain (may be because of the way zooming factors are defined in Seajax. See comment in source code of Polygon.js) -> investigate this!
* Currently, only Marker, Ellipse and Polygon are implemented. All else is yet to come...
* Need to add an online sample for the TMS tile source
