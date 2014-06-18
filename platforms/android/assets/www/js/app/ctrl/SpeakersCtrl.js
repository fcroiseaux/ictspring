define(['jquery', 'app/loading'], function ($, Loading) {
    "use strict";

    var controller = {
        data: [],

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

            // prevent data reloading if we already have the speakers.
            if (self.data.length === 0) {
                self.loadData();
            } else {
                self.reloadList(self.data);
            }
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
         * Load the speakers from remote URL.
         * If it fails try to load the speakers from local storage.
         */
        loadData: function () {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            var storageKey = 'speakers';

            Loading.show();
            $.getJSON(config.api.speakers, function (data) {
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
            self.data = data;

            /*
            self.data.sort(function (speaker1, speaker2) {
                return speaker1.last_name.localeCompare(speaker2.last_name);
            });
            //*/

            var $list = $('#page-speakers ul');
            $list.empty();
            data.forEach(function (item) {
                var html = self.getListItemHTML(item);
                $list.append(html);
            });
            setTimeout(function () {
                self.scroller.refresh();
            });
        },

        /**
         * @method getListItemHTML
         * @param item
         */
        getListItemHTML: function (item) {
            var name = item.first_name + ' ' + item.last_name;
            var html = '' +
                '<li><a href="speaker.html?id=' + item.id + '">' +
                    '<div class="speaker-mask"></div>' +
                    '<img src="' + item.profile_url + '" alt="" width="66" height="66">' +
                    '<div class="speaker-name">' + name + '</div>' +
                    '<div class="company-name">' + item.company + '</div>' +
                '</a></li>';
            return html;
        }
    };

    return controller;
});