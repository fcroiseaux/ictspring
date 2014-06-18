define(['jquery'], function ($) {
    "use strict";

    /**
     * @function request
     * @param {String} path the URL
     * @param {Object} data query params 
     * @param {Function} callback the callback function
     *      callback(error, data) 
     *      on success error will be null and data will be a JSON object
     *      on failure error will contain the error message.
     */
    function request(path, data, callback) {
        $.ajaxSetup({
            data: {
                version: 1.0
            }
        });
        console.log('[API] request=' + path + ' | params:', data);
        $.ajax({
            url         : path,
            type        : 'GET',
            dataType    : 'json',
            data        : data,
            success     : function (data) {

                if (data.error) {
                    console.log('[API] error= ', data.error);
                    if (callback) {
                        callback(data.error, data.more);
                    }
                } else {
                    console.log('[API] response=' + path + ' | data:', data);
                    if (callback) {
                        callback(null, data);
                    }
                }
            },
            error       : function (error) {
                console.log('[API] ajax error= ', error);
                if (callback) {
                    callback(error, null);
                }
            }
        });
    }

    var api = {};
    api.BASE_URL = 'http://www.ictspring.com/api';

    api.getConfig = function (data, callback) {
        request(this.BASE_URL + '/?query=config', data, callback);
    };

    return api;
});