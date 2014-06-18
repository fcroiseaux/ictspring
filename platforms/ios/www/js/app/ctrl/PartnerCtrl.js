define(['jquery', 'app/navigation', 'libs/uri/URI', 'app/loading'], function ($, Navigation, URI, Loading) {
    "use strict";

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
            self.params = params;

            self.destroyScroller();
            self.scroller = new iScroll($('[data-role="content-wrapper"]')[0]);

            self.loadData();
        },

        /**
         * @method onhide
         * Called when the view is out of screen.
         * Used to destroy the scroller on the page content wrapper.
         */
        onhide: function () {
            var self = this;
            self.destroyScroller();
        },

        /**
         * @method destroyScroller
         * Destroy the scroller for the current view
         * Free the memory.
         */
        destroyScroller: function () {
            var self = this;
            if (self.scroller !== null) {
                self.scroller.destroy();
                self.scroller = null;
            }
        },

        /**
         * @method loadData
         * Load the exhibitor from remote URL.
         * If it fails try to load the exhibitor from local storage.
         */
        loadData: function () {
            var self = this,
                config = JSON.parse(localStorage.getItem('config')),
                url = config.api.partner_details + self.params.id;
            Loading.show();
            $.getJSON(url, function (data) {
                localStorage.setItem(url, JSON.stringify(data));
                self.updateUI(data);
                Loading.hide();
            }).fail(function () {
                if (localStorage.getItem(url) !== null) {
                    var data = JSON.parse(localStorage.getItem(url));
                    self.updateUI(data);
                }
                Loading.hide();
            });
        },

        /**
         * @method updateUI
         * @param item
         */
        updateUI: function (item) {
            var self = this;
            var url = new URI(item.company_url);

            var standsHTML = '';
            if (!item.stands) { item.stands = []; }
            item.stands.forEach(function (stand, index) {
                standsHTML += self.getLocationInfoHTML(item, index);
            });

            var html = '' +
                '<div class="item-details">' +
                    '<header>' +
                        '<img src="' + item.logo_url + '" alt="logo" width="95" height="40" />' +
                        '<h2>' + item.company + '</h2>' +
                        '<div class="clear"></div>' +
                        '<div class="info">' + standsHTML + '</div>' +
                        '<div class="clear"></div>' +
                    '</header>' +
                    '<article>' + (item.description || '') + '</article>' +
                    '<footer>' +
                        '<a href="' + item.company_url + '" class="item-url">' +
                        url.domain() + '</a>' +
                    '</footer>' +
                '</div>';
            $('#page-partner').html(html);
            self.scroller.refresh();
        },

        /**
         * @method getLocationInfoHTML
         * @param item
         * @returns {String} html
         */
        getLocationInfoHTML: function (item, standIndex) {
            var number = item.stands[standIndex].number || '';
            var village = item.stands[standIndex].village || '';
            var days = (typeof item.days === 'string') ? [] : item.days;
            var html = '' +
                '<div class="stand">' +
                    '<a href="map.html?number=' + number + '">' +
                    '<img src="img/design/icon-location@2x.png" alt="" class="icon-location red" width="10" height="13"> ' +
                    '<span class="location-reference"> ' + number + '</span>' +
                    ((days.length === 0) ? '' : ' - ') +
                    //'<span class="location-village"> ' + village + '</span> - ' +
                    '<span class="date">' + days.join(' & ') + '</span>' +
                    '</a>' +
                '</div>';
            return html;
        }
    };

    return controller;
});