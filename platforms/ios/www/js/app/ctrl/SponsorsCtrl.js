define(['jquery', 'libs/uri/URI', 'app/loading'], function ($, URI, Loading) {
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
        onshow: function () {
            var self = this;
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
         * Load the news from remote URL.
         * If it fails try to load the news from local storage.
         */
        loadData: function () {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            var storageKey = 'sponsors';
            Loading.show();
            $.getJSON(config.api.sponsors, function (data) {
                localStorage.setItem(storageKey, JSON.stringify(data));
                self.reloadList(data);
                Loading.hide();
            }).fail(function () {
                if (localStorage.getItem(storageKey) !== null) {
                    var data = JSON.parse(localStorage.getItem(storageKey));
                    self.reloadList(data);
                }
                Loading.hide();
            });
        },

        /**
         * @method reloadList
         * Reload data.
         * @param data {Array}
         */
        reloadList: function (data) {
            var self = this;
            var $list = $('#page-sponsors ul');

            function createCell(item) {
                var html = self.getListItemHTML(item);
                $list.append(html);
            }

            $list.empty();
            for (var section in data) {
                if (data.hasOwnProperty(section)) {
                    var sectionHTML = '<li class="section">' + section + '</li>';
                    $list.append(sectionHTML);
                    data[section].forEach(createCell);
                }
            }

            setTimeout(function () {
                self.scroller.refresh();
            });
        },

        /**
         * @method getListItemHTML
         * @param item
         */
        getListItemHTML: function (item) {
            var self = this;
            var url = new URI(item.company_url);

            var standsHTML = '';
            if (!item.stands) { item.stands = []; }
            item.stands.forEach(function (stand, index) {
                standsHTML += self.getLocationInfoHTML(item, index);
            });

            var logo;
            if (item.logo_url) {
                logo = '<img src="' + item.logo_url + '" alt="" width="95">';
            } else {
                logo = '';
            }

            var html = '' +
                '<li class="item-logo-cell"><a href="sponsor.html?id=' + item.id + '">' +
                    '<div class="accessory-view"></div>' +
                    '<div class="logo-wrapper">' + logo + '</div>' +
                    '<div class="content-wrapper">' +
                        '<div class="item-name">' + item.company + '</div>' +
                        '<div class="item-url">' +
                            url.domain() + '</div>' +
                        '<div class="info">' + standsHTML + '</div>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                '</a></li>';
            return html;
        },

        /**
         * @method getLocationInfoHTML
         */
        getLocationInfoHTML: function (item, standIndex) {
            var number = item.stands[standIndex].number || '';
            var village = item.stands[standIndex].village || '';
            var days = (typeof item.days === 'string') ? [] : item.days;
            var html = '' +
                '<div class="stand">' +
                    '<img src="img/design/icon-location@2x.png" alt="" class="icon-location red" width="10" height="13"> ' +
                    '<span class="location-reference"> ' + number + '</span>' +
                    ((days.length === 0) ? '' : ' - ') +
                    //'<span class="location-village"> ' + village + '</span> - ' +
                    '<span class="date">' + days.join(' & ') + '</span>' +
                '</div>';
            return html;
        }
    };

    return controller;
});