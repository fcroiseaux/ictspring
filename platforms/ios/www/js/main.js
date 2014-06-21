require.config({
    shim: {
        iScroll: {
            deps: ['jquery']
        },
        nicescroll: {
            deps: ['jquery']
        },
        leaflet: {
            exports: 'L'
        },
        leafletlabel: {
            deps: ['leaflet']
        }
    },
    paths: {
        jquery: 'libs/jquery/jquery',
        moment: 'libs/moment/moment.min',
        iScroll: 'libs/iscroll/iscroll',
        nicescroll: 'libs/nicescroll/jquery.nicescroll.min',
        leaflet: 'libs/leaflet/leaflet',
        leafletlabel: 'libs/leaflet/leaflet.label-src'
    }
});


console.log('CONSOLE LOG OK');


function onNotificationGCM(e) {
    "use strict";
    switch (e.event) {
    case 'registered':
        if (e.regid.length > 0) {
            var device = window.device;
            $.post('http://www.ictspring.com/wp-content/plugins/push-notification/push-register.php', {
                platform: device.platform.toLowerCase(),
                name: device.name,
                model: device.model,
                version: device.version,
                registration_id: e.regid,
                dev: 0
            }, function (data) {
            });
        }
        break;
    case 'message':
        // e.foreground
        // e.coldstart
        // e.payload.message
        // e.payload.msgcnt
        break;
    case 'error':
        console.log(e.msg);
        break;
    default:
        break;
    }
}

require(['jquery', 'app/ctrl/controller', 'iScroll', 'nicescroll'],
    function ($, app) {
    "use strict";
    console.log('[require] scripts loaded');
    document.addEventListener('deviceready', function () {
        console.log('[cordova] deviceready');

        var device = window.device;
        console.log(device);

        // iOS
        function tokenHandler(result) {
            var device = window.device;

            $.post('http://www.ictspring.com/wp-content/plugins/push-notification/push-register.php', {
                platform: device.platform.toLowerCase(),
                name: device.name,
                model: device.model,
                version: device.version,
                token: result,
                dev: 0
            }, function (data) {
                console.log(data);
            });
        }

        // Android
        function successHandler(result) {
        }

        function errorHandler(error) {
            console.log('error: ' + error);
        }

        // iOS
        function onNotificationAPN(event) {
            if (event.alert) {
                window.navigator.notification.alert(event.alert);
            }

            if (event.badge) {
                pushNotification.setApplicationIconBadgeNumber(function () {
                }, event.badge);
            }
        }

        var pushNotification = window.plugins.pushNotification;

        if (window.device.platform.toLowerCase() === 'android') {

            pushNotification.register(successHandler, errorHandler, {
                "senderID": "363923874904",
                "ecb": "onNotificationGCM"
            });

        } else if (window.device.platform.toLowerCase() === 'ios') {

            pushNotification.register(tokenHandler, errorHandler, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });

        }

        $(function () {
            console.log('[jquery] DOM ready');
            app.init();
        });
    });
});
