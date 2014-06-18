define(['jquery'], function ($) {
    "use strict";

    var controllers = {};
    var navmenu = null;
    var previousPage = 'index.html';

    var Navigation = {
        /**
         * @method setTitle
         * @param title
         */
        setTitle: function (title) {
            $('[data-role="header"] h1').html(title);
        },

        /**
         * @method setControllers
         * @param theControllers
         */
        setControllers: function (theControllers) {
            controllers = theControllers;
        },

        /**
         * @method changePage
         * @param page
         * @param params
         * @param back
         */
        changePage: function (page, params, back) {
            var self = this,
                currentPageId = $('[data-role="content"]').attr('id');

            if (page.indexOf('http') !== -1) {
                var ref = window.open(page, '_blank', 'location=yes');
                return;
            }
            $.get(page, function (data) {
                // setup new page content
                var $newPage    = $(data);
                var pageId      = $newPage.find('[data-role="content"]').attr('id');
                var pageClass   = $newPage.attr('class') || '';
                var $backButton = $newPage.find('[data-rel="back"]');

                // setup the navbar left button
                $backButton.attr('href', previousPage);
                if ($backButton.size() === 1) {
                    console.log('[navigation] replace nav by back button');
                    $('#navmenu-link').hide();
                    $('[data-role="page"] [data-role="header"] h1').before($backButton);
                } else {
                    console.log('[navigation] replace back by nav button');
                    $('[data-rel="back"]').remove();
                    $('#navmenu-link').show();
                }

                // set the page title
                var pageTitle = $newPage.find('[data-role="header"] h1').html();
                self.setTitle(pageTitle);

                // getting the actual page content
                var $content = $('[data-role="page"] [data-role="content-wrapper"] [data-role="content"]');
                // getting the new content
                var $newContent = $newPage.find('[data-role="content"]');

                var contentLeft = -$content.width() + 'px';
                var newContentLeft = $('[data-role="page"]').width() + 'px';

                if (back) {
                    contentLeft = $content.width() + 'px';
                    newContentLeft = -$('[data-role="page"]').width() + 'px';
                }

                // prepare the current and next page for animation
                $content.css({
                    position: 'absolute'
                });

                $newContent.css({
                    position: 'absolute',
                    width: $content.width() + 'px',
                    left: newContentLeft,
                    top: 0
                });

                // add new page content to the DOM
                $('[data-role="content-scroller"]').append($newContent);

                // call the init method if it exists
                if (controllers.hasOwnProperty(pageId)) {
                    console.log('[navigation] ' + pageId + ': init');
                    controllers[pageId].init(pageId);
                }

                // animate the transition
                $content.animate({
                    left: contentLeft
                });
                $newContent.animate({
                    left: 0
                }, function () {
                    // after the animation
                    $newContent.css({
                        position: 'static',
                        width: '100%'
                    });

                    // remove old content from the DOM
                    $content.remove();

                    if (controllers.hasOwnProperty(currentPageId)) {
                        if (controllers[currentPageId].onhide) {
                            console.log('[navigation] ' + currentPageId + ': onhide');
                            controllers[currentPageId].onhide();
                        }
                    }

                    if (controllers.hasOwnProperty(pageId)) {
                        console.log('[navigation] ' + pageId + ': onshow');
                        controllers[pageId].onshow(params);
                    }

                    $('[data-role="page"] [data-role="content-wrapper"]').attr('class', pageClass);
                    previousPage = page;

                    console.log('[navigation] page changed');
                });
            }).fail(function () {
                console.log('[navigation] !!!FAILED TO LOADED PAGE!!!');
            });
        }
    };

    return Navigation;
});
