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
         * Load the speaker from remote URL.
         * If it fails try to load the speaker from local storage.
         */
        loadData: function () {
            var self = this,
                config = JSON.parse(localStorage.getItem('config')),
                url = config.api.speaker_details + self.params.id;
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
            var name = item.first_name + ' ' + item.last_name;
            var html = '' +
                '<header>' +
                    '<div class="speaker-mask"></div>' +
                    '<img src="' + item.profile_url + '" alt="" width="66" height="66">' +
                    '<div class="info"> ' +
                        '<h2>' + name + '</h2>' +
                        '<h3>' +
                            '<span class="position">' + item.position + ', </span>' +
                            '<span class="company">' + item.company + '</span>' +
                        '</h3>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                '</header>' +
                '<article>' + item.biography + '</article>';
            $('#page-speaker').html(html);

            setTimeout(function () {
                self.scroller.refresh();
            }, 0);
        }
    };

    return controller;
});