define(['jquery', 'app/navigation', 'app/loading'], function ($, Navigation, Loading) {
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
         * Load the news from remote URL.
         * If it fails try to load the news from local storage.
         */
        loadData: function () {
            var self = this,
                config = JSON.parse(localStorage.getItem('config')),
                url = config.api.news_details + self.params.id;
            Loading.show();
            $.getJSON(url, function (data) {
                localStorage.setItem(url, data);
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
            var html = '<h2>' + item.title + '</h2>' +
                '<p>' + item.date + '</p>' +
                '<p>' + item.content + '</p>';
            $('#page-news-details').html(html);
            self.scroller.refresh();
        }
    };

    return controller;
});