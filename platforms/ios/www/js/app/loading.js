define(['jquery'], function ($) {
    "use strict";
    var timer = null;
    var points = [];
    var displayed = false;
    var loading = {
        show: function () {
            if (displayed) {
                return;
            }
            displayed = true;
            $('.loading-wrapper p').html('Loading...');
            console.log('[loading] show');
            $('.loading-wrapper').css({
                display: 'block',
                opacity: 1.0
            });

            timer = setInterval(function () {
                points.push('.');
                var fakePoints = [];
                for (var i = points.length; i < 3; i++) {
                    fakePoints.push('<span style="color: transparent;">.</span>');
                }
                var html = 'Loading' + points.join('') + fakePoints.join('');
                $('.loading-wrapper p').html(html);
                if (points.length > 2) {
                    points = [];
                }
            }, 1000);
        },
        hide: function () {
            displayed = false;
            clearInterval(timer);
            timer = null;
            console.log('[loading] hide');
            $('.loading-wrapper').css({
                display: 'none',
                opacity: 0.0
            });
        }
    };
    return loading;
});