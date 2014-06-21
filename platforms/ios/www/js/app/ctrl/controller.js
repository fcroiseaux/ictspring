define(['jquery', 'app/navigation', 'libs/uri/URI',
    'app/ctrl/IndexCtrl', 'app/ctrl/SpeakersCtrl', 'app/ctrl/ExhibitorsCtrl',
    'app/ctrl/EventsCtrl', 'app/ctrl/MapCtrl',
    'app/ctrl/NewsDetailsCtrl', 'app/ctrl/SpeakerCtrl', 'app/ctrl/ExhibitorCtrl',
    'app/ctrl/InfosCtrl', 'app/ctrl/StartupsCtrl', 'app/ctrl/StartupCtrl',
    'app/ctrl/SponsorsCtrl', 'app/ctrl/SponsorCtrl',
    'app/ctrl/PartnersCtrl', 'app/ctrl/PartnerCtrl', 'app/ctrl/MeetAndMatchCtrl', 'app/ctrl/Geekcoin'],
function ($, Navigation, URI,
    index, speakers, exhibitors, events,
    map, newsDetails, speaker, exhibitor,
    infos, startups, startup, sponsors, sponsor,
    partners, partner, meetandmatch, geekcoin) {
    "use strict";
    var controllers = {
        'page-index': index,
        'page-news-details': newsDetails,
        'page-speaker': speaker,
        'page-speakers': speakers,
        'page-events': events,
        'page-exhibitor': exhibitor,
        'page-exhibitors': exhibitors,
        'page-map': map,
        'page-startup': startup,
        'page-startups': startups,
        'page-sponsor': sponsor,
        'page-sponsors': sponsors,
        'page-partner': partner,
        'page-partners': partners,
        'page-infos': infos,
        'page-meetandmatch': meetandmatch,
        'page-geekcoin': geekcoin
    };

    return {
        toggled: false,
        init: function () {
            console.log('[app] init');
            var self = this;

            Navigation.setControllers(controllers);

            // catch clicks on links
            $('[data-role="page"] [data-role="content-wrapper"], [data-role="menu"]')
            .on('click', 'a:not([href^="mailto:"])', function (event) {
                event.preventDefault();
                var link = $(this).attr('href');

                if (self.toggled) {
                    $('#navmenu-link').trigger('touchstart');
                }

                var uri = new URI(link);
                var params = URI.parseQuery(uri.search());
                Navigation.changePage(link, params, false);
            });



            // catch back button links
            $('[data-role="page"]').on('touchstart click', 'a[data-rel="back"]', function (event) {
                event.preventDefault();
                var link = $(this).attr('href');
                Navigation.changePage(link, null, true);
            });

            // open navigation panel
            $('#navmenu-link, .navmenu-header').on('touchstart click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var $page = $('[data-role="page"]');
                console.log('[controller] menu toggled: ' + self.toggled);
                if (self.toggled === true) {
                    $page.animate({
                        left: '0px'
                    });
                    self.toggled = !self.toggled;
                } else {
                    $page.animate({
                        left: '260px'
                    });
                    self.toggled = !self.toggled;
                }
                console.log('[controller] menu toggled: ' + self.toggled);
            });

            $('[data-role="menu"] a').on('click', function (event) {
                event.preventDefault();
                $('[data-role="menu"] a').css({ color: 'white'});
                $(this).css({ color: 'red'});
            });

            function checkNetworkStatus() {
                var networkState = window.navigator.connection.type;
                if (networkState === Connection.NONE) {
                    return false;
                } else {
                    return true;
                }
            }

            var checkInterval = null;
            $(document).ajaxError(function () {
                if (checkNetworkStatus()) {
                    clearInterval(checkInterval);
                    $('.no-internet').hide();
                } else {
                    $('.no-internet').show();
                    checkInterval = setInterval(function () {
                        if (checkNetworkStatus()) {
                            $('.no-internet').hide();
                            clearInterval(checkInterval);
                        }
                    }, 5000);
                }
            }).ajaxSuccess(function () {
                clearInterval(checkInterval);
                $('.no-internet').hide();
            });

            for (var key in controllers) {
                if (controllers.hasOwnProperty(key)) {
                    controllers[key].scroller = null;
                }
            }

            self.menuScroller = new iScroll($('[data-role="menu"]')[0]);

            function doOnOrientationChange() {
                setTimeout(function () {
                    self.menuScroller.refresh();
                }, 0);
            }

            window.addEventListener('orientationchange', doOnOrientationChange);

            // initialize first controller
            index.init('page-index');
            index.onshow();
        }
    };
});
