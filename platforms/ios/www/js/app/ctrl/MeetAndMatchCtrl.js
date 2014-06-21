define(['jquery', 'nicescroll', 'app/loading'], function ($, Loading) {
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

            //self.destroyScroller();
            //self.scroller = new iScroll('#page-meetandmatch');
            $("#meetandmatch-wrapper").niceScroll("#meetandmatch-frame",{autohidemode:false});

          //  self.loadData();
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
            $('#page-meetandmatch #meetandmatch-wrapper').append('<div class="clear"></div>');
            self.scroller.refresh();
        }
    };

    return controller;
});