define(
    ['jquery', 'moment', 'libs/uri/URI', 'app/api', 'app/i18n', 'app/loading'],
    function ($, moment, URI, API, T, Loading) {
    "use strict";

    var parseTweetUrls = function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    };

    var parseTweetUsername = function (text) {
        return text.replace(/[@]+[A-Za-z0-9-_]+/g, function (username) {
            return '<strong>' + username + '</strong>';
        });
    };

    var parseTweetHashtag = function (text) {
        return text.replace(/[#]+[A-Za-z0-9-_]+/g, function (hashtag) {
            return '<strong>' + hashtag + '</strong>';
        });
    };

    var controller = {
        data: [],

        accountTweets: [],
        hashtagTweets: [],

        /**
         * @method init
         * Initialize the controller by loading config file.
         */
        init: function (id) {
            var self = this;
            self.loadRemoteConfig();
        },

        /**
         * @method onshow
         * Called when the view is loaded.
         */
        onshow: function () {
            var self = this;
            self.createScroller();

            // prevent data reloading if we already have the news.
            var config = JSON.parse(localStorage.getItem('config'));
            if (self.data.length === 0 && config !== null) {
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
         * @method createScroller
         * Create the scroller with pull to refresh feature.
         */
        createScroller: function () {
            var self = this;
            self.destroyScroller();

            var pullDownEl = document.getElementById('pullDown');
            var pullDownOffset = pullDownEl.offsetHeight;

            self.scroller = new iScroll($('[data-role="content-wrapper"]')[0], {
                useTransition: true,
                topOffset: pullDownOffset,
                onRefresh: function () {
                    if (pullDownEl.className.match('loading')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    }
                },
                onScrollMove: function () {
                    if (this.y > 5 && !pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'flip';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                        this.minScrollY = 0;
                    } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                        this.minScrollY = -pullDownOffset;
                    }
                },
                onScrollEnd: function () {
                    if (pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'loading';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                        self.loadData();
                    }
                }
            });
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

        loadData: function () {
            var self = this;

            var config = JSON.parse(localStorage.getItem('config'));
            var startDate = moment(config.event_start_date, 'YYYY-MM-DD');
            var endDate = moment(config.event_end_date, 'YYYY-MM-DD');
            var now = moment();

            self.loadAccountTweets(config.twitter_account || 'ICTSpring', 50);
            self.loadHashTagTweets(config.twitter_hashtag || '#ictspring', 50);
            /*
            if (now.isAfter(startDate) && now.isBefore(endDate)) {
                self.loadHashTagTweets('#ictspring', 50);
            }
            //*/
        },

        getAccessToken: function (callback) {
            var base64BearerToken = 'VEVwNEpmWUxxdzltd2ZybkpiNnR3OnF5TWVLR2ZNZzdvallYWk02N1FRUERLTHoybTBOR3VpUlYxUG5hSmtkTQ==';
            var oauthURL = 'https://api.twitter.com/oauth2/token';
            $.ajax({
                url: oauthURL,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                data: {
                    grant_type: 'client_credentials'
                },
                headers: {
                    'Authorization': 'Basic ' + base64BearerToken
                },
                success: function (data) {
                    callback(null, data.access_token);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Loading.hide();
                    callback(errorThrown, null);
                }
            });
        },

        loadAccountTweets: function (screenName, count) {
            var self = this;
            var apiBaseURL = 'https://api.twitter.com/1.1';
            var timelinePath = '/statuses/user_timeline.json';
            var storageKey = 'account-tweets';
            Loading.show();
            self.getAccessToken(function (error, accessToken) {

                if (error) {
                    Loading.hide();
                    return;
                }

                $.ajax({
                    url: apiBaseURL + timelinePath,
                    type: 'GET',
                    data: {
                        count: count,
                        screen_name: screenName
                    },
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    success: function (theData) {
                        localStorage.setItem(storageKey, JSON.stringify(theData));
                        self.accountTweets = theData;
                        var data = self.buildTweetsList();
                        self.reloadList(data);
                        Loading.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        if (localStorage.getItem(storageKey) !== null) {
                            self.accountTweets = JSON.parse(localStorage.getItem(storageKey));
                            var data = self.buildTweetsList();
                            self.reloadList(data);
                        }
                        Loading.hide();
                    }
                });
            });
        },

        loadHashTagTweets: function (hashtag, count) {
            var self = this;
            var apiBaseURL = 'https://api.twitter.com/1.1';
            var searchPath = '/search/tweets.json';
            Loading.show();
            self.getAccessToken(function (error, accessToken) {
                $.ajax({
                    url: apiBaseURL + searchPath,
                    type: 'GET',
                    data: {
                        q: encodeURIComponent(hashtag),
                        count: count,
                        result_type: 'recent'
                    },
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    success: function (theData) {
                        self.hashtagTweets = theData.statuses;
                        var data = self.buildTweetsList();
                        self.reloadList(data);
                        Loading.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Loading.hide();
                    }
                });
            });
        },

        buildTweetsList: function () {
            var self = this;
            var tweets = [];
            self.hashtagTweets.forEach(function (tweet) {
                tweets.push(tweet);
            });

            self.accountTweets.forEach(function (tweet) {
                tweets.push(tweet);
            });

            tweets.sort(function (tweet1, tweet2) {
                var tweet1Time = moment(tweet1.created_at);
                var tweet2Time = moment(tweet2.created_at);

                if (tweet1Time.isBefore(tweet2Time)) {
                    return 1;
                } else if (tweet1Time.isAfter(tweet2Time)) {
                    return -1;
                } else {
                    return 0;
                }
            });

            return tweets;
        },

        /**
         * @method reloadList
         * Reload data.
         * @param data {Array}
         */
        reloadList: function (data) {
            var self = this;
            self.data = data;

            function saveRead(event) {
                var id = $(event.currentTarget).data('id');
                self.saveReadNews(id);
            }

            var readNews = self.getReadNews();

            var $list = $('#page-index ul');
            $list.empty();
            self.data.forEach(function (item) {
                var html = self.getListItemHTML(item);
                var $html = $(html);

                // did the user already read this news?
                if (readNews.indexOf(item.id) !== -1) {
                    $html.addClass('read');
                }
                $list.append($html);
            });

            window.setTimeout(function () {
                self.scroller.refresh();
                self.scroller.scrollTo(0, 0, 0, 200);
            }, 100);
        },

        /**
         * @method getListItemHTML
         * @param item
         */
        getListItemHTML: function (item) {
            var text = URI.withinString(item.text, parseTweetUrls);
            text = parseTweetUsername(text);
            text = parseTweetHashtag(text);
            var image = item.user.profile_image_url.replace('normal', 'bigger');
            var datetime = moment(item.created_at);
            var html = '' +
                '<li>' +
                    '<img src="' + image + '" width="36" height="36" />' +
                    '<div class="content-wrapper">' +
                        '<h2>' + item.user.name + '</h2>' +
                        '<p>' + datetime.format('DD/MM/YYYY HH:mm') + '</p>' +
                        '<p>' + text + '</p>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                '</li>';
            return html;
        },

        /**
         * @method getReadNews
         * @returns {Array} an array of news ids that have been read. 
         */
        getReadNews: function () {
            var readNews = [];
            if (localStorage.getItem('read-news') !== null) {
                readNews = JSON.parse(localStorage.getItem('read-news'));
            }
            return readNews;
        },

        /**
         * @method saveReadNews
         * @param newsId the news id to be saved
         */
        saveReadNews: function (newsId) {
            var self = this;
            var readNews = self.getReadNews();
            if (readNews.indexOf(newsId) === -1) {
                readNews.push(newsId);
            }
            localStorage.setItem('read-news', JSON.stringify(readNews));
        },

        /**
         * @method loadRemoteConfig
         * Load remote config that contains api endpoints URL for each screen.
         */
        loadRemoteConfig: function () {
            console.log('[config] Loading remote config');
            var self = this;
            API.getConfig({}, function (error, data) {
                if (error) {
                    console.log('[config] !!!FAILED LOADING REMOTE CONFIG!!!');
                    self.loadLocalConfig();
                } else {
                    localStorage.setItem('config', JSON.stringify(data));
                    self.loadData();
                }
            });
        },

        /**
         * @method loadLocalConfig
         * Fallback method that load the local config file
         * when the remote config is unavailable.
         * First try to load the config from local storage if it exists.
         * Else default on the embedded config.
         */
        loadLocalConfig: function () {
            console.log('[config] Loading local config');
            var self = this;
            if (localStorage.getItem('config') === null) {
                console.log('[config] NO CONFIG IN LOCAL STORAGE');
                $.getJSON('js/app/config.json', function (data) {
                    console.log('[config] config loaded from www directory');
                    localStorage.setItem('config', JSON.stringify(data));
                    self.loadData();
                }).fail(function () {
                    console.log('[config] !!!FAILURE LOADING CONFIG!!!');
                });
            } else {
                self.loadData();
            }
        }

    };

    return controller;
});