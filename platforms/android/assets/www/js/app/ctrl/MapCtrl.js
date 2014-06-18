define(['jquery', 'leaflet', 'libs/uri/URI', 'app/navigation', 'app/loading', 'leafletlabel'], function ($, L, URI, Navigation, Loading) {
    'use strict';

    var controller = {
        /**
         * @method init
         * Initialize the controller.
         */
        init: function () {
        },

        /**
         * @method onshow
         * Called when the view is loaded.
         */
        onshow: function (params) {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            self.number = (params) ? params.number : null;
            $('[data-role="content-scroller"]').css({
                height: '100%'
            });

            $('[data-role="content"]').css({
                height: '100%'
            });

            var mapSize = {
                w: config.map.width,
                h: config.map.height
            };

            var mapContainerSize = {
                w: $('#map').width(),
                h: $('#map').height()
            };

            self.ratio = 1;

            if (mapContainerSize.w >= mapContainerSize.h) {
                self.ratio = mapContainerSize.h / mapSize.h;
            } else {
                self.ratio = mapContainerSize.w / mapSize.w;
            }

            var map = L.map('map', {
                center: [0, 0],

                zoom: 0,
                minZoom: 0,
                maxZoom: 3,
                crs: L.CRS.Simple,

                attributionControl: false
            });
            self.map = map;
            self.map.setMaxBounds(self.map.getBounds());

            Loading.show();
            var image = new Image();
            image.onload = function () {
                console.log('LOADED');
                self.loadMap(image.src, mapSize);
                Loading.hide();
            };
            image.onerror = function () {
                console.log('ERROR');
                self.loadMap('img/map.jpg', mapSize);
                Loading.hide();
            };
            image.src = config.map.image_url;
        },

        loadMap: function (imageURL, mapSize) {
            var self = this;
            var imageUrl = imageURL;
            var imageBounds = [
                [-((mapSize.h * self.ratio) / 2), -((mapSize.w * self.ratio) / 2)],
                [((mapSize.h * self.ratio) / 2), ((mapSize.w * self.ratio) / 2)]
            ];
            L.imageOverlay(imageUrl, imageBounds).addTo(self.map);

            self.loadData();
        },

        onhide: function () {
            var self = this;

            $('[data-role="content-scroller"]').css({
                height: 'auto'
            });
        },

        /**
         * @method loadData
         */
        loadData: function () {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            var storageKey = 'map';
            $.getJSON(config.api.map, function (data) {
                localStorage.setItem(storageKey, JSON.stringify(data));
                self.showStands(data);
            }).fail(function () {
                if (localStorage.getItem(storageKey) !== null) {
                    var data = JSON.parse(localStorage.getItem(storageKey));
                    self.showStands(data);
                }
            });
        },

        /**
         * @method showStandsPins
         * @param {Array} stands
         */
        showStands: function (stands) {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            var mapSize = {
                w: config.map.width,
                h: config.map.height
            };

            var mapSizeToFit = {
                w: (mapSize.w * self.ratio),
                h: (mapSize.h * self.ratio)
            };

            var standCoordinates = null,
                standMarker = null;

            var pinIcon = L.icon({
                iconUrl: 'img/design/pin.png',
                iconRetinaUrl: 'img/design/pin@2x.png',
                iconSize: [34, 50],
                iconAnchor: [34 / 2, 50],
                popupAnchor: [0, -50],
                shadowUrl: 'js/libs/leaflet/images/marker-shadow.png',
                shadowSize: [41, 41],
                shadowAnchor: [13, 41],
                labelAnchor: [-29, -26]
            });

            stands.forEach(function (stand) {

                var mapCoordinates = {
                    x: parseInt(stand.x, 10) * self.ratio - (mapSizeToFit.w / 2),
                    y: (mapSize.h - parseInt(stand.y, 10)) * self.ratio - (mapSizeToFit.h / 2)
                };

                var marker = L.marker([mapCoordinates.y, mapCoordinates.x], {icon: pinIcon});
                marker.addTo(self.map);
                marker.bindLabel(stand.number || '', {noHide: true}).showLabel();
                marker.bindPopup(self.getStandPopupHTML(stand));
                if (stand.number !== null &&
                    stand.number !== undefined &&
                    stand.number === self.number) {
                    standCoordinates = mapCoordinates;
                    standMarker = marker;
                }
            });
            /*
            var overlays = {
                "Toggle stands": self.layer
            };
            L.control.layers(null, overlays, {
                position: 'bottomright'
            }).addTo(self.map);
            */

            if (standCoordinates !== null) {
                self.map.on('moveend', function () {
                    self.map.setZoom(2);
                    self.map.off('moveend');
                });
                self.map.on('zoomend', function () {
                    standMarker.openPopup();
                });
                self.map.panTo([standCoordinates.y, standCoordinates.x]);
            }
        },

        getStandPopupHTML: function (stand) {
            function click(event) {
                event.preventDefault();

                var link = $(event.currentTarget).attr('href');
                var uri = new URI(link);
                var params = URI.parseQuery(uri.search());
                Navigation.changePage(link, params, false);
            }
            var $exhibitors = $('<ul>');
            stand.exhibitors.forEach(function (exhibitor) {
                var $link = $('<a href="exhibitor.html?id=' + exhibitor.id + '"><img src="img/design/list-bullet-eye@2x.png" alt="" width="18" height="13" /><span>' + exhibitor.name + '</span></a>');
                $link.click(click);
                $exhibitors.append($('<li>').append($link));
            });

            var $html = $('<div class="stand-popup">');
            $html.append('<h2>' + stand.number + '</h2>');
            $html.append($exhibitors);
            $html.append('<div class="clear"></div>');

            return $html[0];
        },
    };

    return controller;
});
