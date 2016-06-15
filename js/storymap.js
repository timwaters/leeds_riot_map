(function ($) {
'use strict';


$.fn.storymap = function(options) {

    var defaults = {
        selector: '[data-place]',
        breakpointPos: '33.333%',
        createMap: function () {
            // create a map in the "map" div, set the view to a given place and zoom
            var map = L.map('map').setView([53.8, -1.55], 12);

            // add an OpenStreetMap tile layer
  //          L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  //            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  //      }).addTo(map);
            L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
                attribution: 'Tiles by <a href="http://stamen.com>Stamen></>" &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);


            return map;
        }
    };

    var settings = $.extend(defaults, options);


    if (typeof(L) === 'undefined') {
        throw new Error('Storymap requires Laeaflet');
    }
    if (typeof(_) === 'undefined') {
        throw new Error('Storymap requires underscore.js');
    }

    function getDistanceToTop(elem, top) {
        var docViewTop = $(window).scrollTop();

        var elemTop = $(elem).offset().top;

        var dist = elemTop - docViewTop;

        var d1 = top - dist;

        if (d1 < 0) {
            return $(window).height();
        }
        return d1;

    }

    function highlightTopPara(paragraphs, top) {

        var distances = _.map(paragraphs, function (element) {
            var dist = getDistanceToTop(element, top);
            return {el: $(element), distance: dist};
        });

        var closest = _.min(distances, function (dist) {
            return dist.distance;
        });

        _.each(paragraphs, function (element) {
            var paragraph = $(element);
            if (paragraph[0] !== closest.el[0]) {
                paragraph.trigger('notviewing');
            }
        });

        if (!closest.el.hasClass('viewing')) {
            closest.el.trigger('viewing');
        }
    }

    function watchHighlight(element, searchfor, top) {
        var paragraphs = element.find(searchfor);
        highlightTopPara(paragraphs, top);
        $(window).scroll(function () {
            highlightTopPara(paragraphs, top);
        });
    }

    var makeStoryMap = function (element, markers) {

        var topElem = $('<div class="breakpoint-current"></div>')
            .css('top', settings.breakpointPos);
        $('body').append(topElem);

        var top = topElem.offset().top - $(window).scrollTop();

        var searchfor = settings.selector;

        var paragraphs = element.find(searchfor);

        paragraphs.on('viewing', function () {
            $(this).addClass('viewing');
        });

        paragraphs.on('notviewing', function () {
            $(this).removeClass('viewing');
        });

        watchHighlight(element, searchfor, top);

        var map = settings.createMap();

        var initPoint = map.getCenter();
        var initZoom = map.getZoom();

        var fg = L.featureGroup().addTo(map);

        function showMapView(key) {
          var starIcon = L.icon({
    iconUrl: 'icon_60x57.png',
    shadowUrl: 'icon_60x57_shadow.png',

    iconSize:     [60, 57], // size of the icon
    shadowSize:   [48, 45], // size of the shadow
    iconAnchor:   [30, 35], // point of the icon which will correspond to marker's location
    shadowAnchor: [22, 23],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

            fg.clearLayers();
            if (key === 'overview') {
                map.setView(initPoint, initZoom, true);
            } else if (markers[key]) {
                var marker = markers[key];
                var layer = marker.layer;
                if(typeof layer !== 'undefined'){
                  fg.addLayer(layer);
                };
                fg.addLayer(L.marker([marker.lat, marker.lon], {icon:starIcon}));

                map.setView([marker.lat, marker.lon], marker.zoom, 1);
            }

        }

        paragraphs.on('viewing', function () {
            showMapView($(this).data('place'));
        });
    };

    makeStoryMap(this, settings.markers);

    return this;
}

}(jQuery));