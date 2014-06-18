define(['jquery', 'moment', 'app/loading'], function ($, moment, Loading) {
    "use strict";

    var controller = {
        /** scroller for the timeline */
        timelineScroll: null,
        /** scroller for the events */
        eventsScroll: null,
        /** {String} current search string */
        currentSearch: null,
        /** {Array} list of events filtered by the search string */
        filteredEvents: null,
        /** {String} current day */
        currentDay: null,

        minHour: 8,
        maxHour: 23,

        /**
         * @method init
         * Initialize the controller.
         */
        init: function () {
            var self = this;
            self.config = JSON.parse(localStorage.getItem('config'));
        },

        /**
         * @method onshow
         * Called when the view is loaded.
         */
        onshow: function () {
            var self = this;
            self.destroyScroller();

            $('[data-role="content-scroller"]').css({
                height: '100%'
            });

            $('[data-role="content"]').css({
                height: '100%'
            });

            $('.clear-bar-icon img').css('opacity', 0);
            $('.clear-bar-icon').click(function (event) {
                event.preventDefault();
                self.clearSearch();
                $('input#search-bar').focus();
            });

            $('#day1, #day2').click(function (event) {
                event.preventDefault();
                var id = $(this).attr('id');
                $('#day1, #day2').removeClass('selected');
                $(this).addClass('selected');

                self.clearSearch();
                self.loadEventsForDayHour(id, self.currentHour);
            });

            $('#timeline').on('click', 'li', function () {
                var id = $(this).attr('id');
                self.loadEventsForDayHour(self.currentDay, id);
            });

            $('input#search-bar').focus(function () {
                $('.clear-bar-icon img').css('opacity', 1);
                self.clearSearch();
            }).blur(function (event) {
                $('.clear-bar-icon img').css('opacity', 0);
                self.currentSearch = $(this).val();
                self.performSearch(self.currentSearch);
            });

            self.generateTimeline();
            if (self.currentSearch !== null) {
                $('input#search-bar').val(self.currentSearch);
                self.performSearch(self.currentSearch);
            } else if (self.currentDay !== null) {
                self.loadEventsForDayHour(self.currentDay, self.currentHour);
            } else {
                self.loadData();
            }

            self.timelineScroll = new iScroll('wrapper-timeline', {
            });

            self.eventsScroll = new iScroll('wrapper-events', {
            });
        },

        /**
         * @method onhide
         * Called when the view is out of screen.
         * Used to destroy the scroller on the page content wrapper.
         */
        onhide: function () {
            var self = this;
            self.destroyScroller();

            $('[data-role="content-scroller"]').css({
                height: 'auto'
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
            if (self.timelineScroll !== null) {
                self.timelineScroll.destroy();
                self.timelineScroll = null;
            }
            if (self.eventsScroll !== null) {
                self.eventsScroll.destroy();
                self.eventsScroll = null;
            }
        },

        /**
         * @method loadData
         * Load the news from remote URL.
         * If it fails try to load the news from local storage.
         */
        loadData: function () {
            var self = this;
            var config = JSON.parse(localStorage.getItem('config'));
            var url = config.api.calendar;
            var startDay = moment(config.event_start_date, 'YYYY-MM-DD').date();
            var endDay = moment(config.event_end_date, 'YYYY-MM-DD').date();

            Loading.show();
            $.getJSON(url, function (data) {

                var calendar = {
                    day1: [],
                    day2: []
                };
                var days = {};
                days[startDay.toString()] = 'day1';
                days[endDay.toString()] = 'day2';

                self.minHour = 23;
                self.maxHour = 0;
                for (var i = 0; i < data.length; i++) {
                    var ev = data[i];
                    var startTime = moment(ev.start_datetime, 'YYYY-MM-DD HH:mm:ss');
                    var endTime = moment(ev.end_datetime, 'YYYY-MM-DD HH:mm:ss');
                    var day = startTime.date();

                    if (startTime.hours() < self.minHour) {
                        self.minHour = startTime.hours();
                    }
                    if (endTime.hours() > self.maxHour) {
                        self.maxHour = endTime.hours();
                    }
                    calendar[days[day]].push(ev);
                }

                self.calendar = calendar;
                self.generateTimeline();
                self.loadEventsForDayHour('day1');
                Loading.hide();
            }).fail(function () {
                Loading.hide();
            });
        },

        /**
         * @method loadEventsForDayHour
         * @param day
         * @param hour
         */
        loadEventsForDayHour: function (day, hour) {
            var self = this;
            self.currentDay = day;
            // get the selected hour or fallback to 8:00 am.
            self.currentHour = parseInt(hour, 10) || self.minHour * 100;

            // show the selected time interval on the timeline.
            // the interval is always 1 hour and start from currentHour.
            self.selectTimeline();

            var events = [];
            if (self.calendar.hasOwnProperty(day)) {

                // filter the events 
                // either get all the events of the selected day
                // or all the filtered events based on the current search
                var tempEvents = [];
                if (self.currentSearch === null) {
                    tempEvents = self.calendar[day];
                } else {
                    tempEvents = self.filteredEvents;
                }

                // filter the events that are in the selected time interval
                for (var i = 0; i < tempEvents.length; i++) {
                    var event       = tempEvents[i];
                    var startTime   = moment(event.start_datetime, 'YYYY-MM-DD HH:mm:ss');
                    var endTime     = moment(event.end_datetime, 'YYYY-MM-DD HH:mm:ss');
                    var startHour   = startTime.hours() * 100 + startTime.minutes();
                    var endHour     = endTime.hours() * 100 + endTime.minutes();

                    if ((self.currentHour >= startHour && self.currentHour < endHour) ||
                        (startHour >= self.currentHour && startHour < self.currentHour + 100)) {
                        events.push(event);
                    }
                }

                // sort the events by start time
                events.sort(function (event1, event2) {
                    var ev1Start = moment(event1.start_datetime, 'YYYY-MM-DD HH:mm:ss');
                    var ev2Start = moment(event2.start_datetime, 'YYYY-MM-DD HH:mm:ss');
                    if (ev1Start.isBefore(ev2Start)) {
                        return -1;
                    } else if (ev1Start.isAfter(ev2Start)) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }

            self.reloadEvents(events);
        },

        /**
         * @method selectTimeline
         * Select the correct interval based on the currentHour
         */
        selectTimeline: function () {
            var self = this;
            $('#timeline').css('opacity', 1.0);
            $('#timeline li').removeClass('selected');
            var $li = $('#timeline #' + self.currentHour);
            $li.addClass('selected');
            $li.next().addClass('selected');
        },

        /**
         * @method unselect timeline
         * Clear the selector on the timeline
         */
        unselectTimeline: function () {
            var self = this;
            $('#timeline').css('opacity', 0.4);
            $('#timeline li').removeClass('selected');
        },

        /**
         * @method reloadEvents
         * @param {Array} events
         */
        reloadEvents: function (events) {
            var self = this;
            $('#events').empty();
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var $html = $(self.getHTMLForEvent(event));
                $html.css('borderLeftColor', event.color);
                $html.find('h3').css('color', event.color);
                $('#events').append($html);
            }
            $('#events li').first().addClass('first');

            setTimeout(function () {
                self.eventsScroll.refresh();
            }, 0);
        },

        /**
         * @method getHTMLForEvent
         * @param {Object} event
         */
        getHTMLForEvent: function (event) {
            var speakers = [];
            for (var i = 0; i < event.speakers.length; i++) {
                var speaker = event.speakers[i];
                var split = speaker.name.split(' - ');
                var speakerHTML = '' +
                    '<a href="speaker.html?id=' + speaker.id + '">' +
                        '<span class="speaker-name">' + split[0] + ', </span>' +
                        '<span class="speaker-company">' + split[1] + '</span>' +
                    '</a>';
                speakers.push(speakerHTML);
            }

            var startTime = moment(event.start_datetime, 'YYYY-MM-DD HH:mm:ss');
            var endTime = moment(event.end_datetime, 'YYYY-MM-DD HH:mm:ss');
            var time = startTime.format('HH:mm') + ' to ' + endTime.format('HH:mm');
            var html = '' +
                '<li>' +
                    '<h3>' + event.room + '</h3>' +
                    '<h4>' + event.title + '</h4>' +
                    '<p>' + time + '</p>' +
                    '<p>' + speakers.join('<br>') + '</p>' +
                '</li>';
            return html;
        },

        /**
         * @method generateTimeline
         * Generate the timeline
         */
        generateTimeline: function () {
            var self = this;
            console.log('[calendar] minhour: ' + self.minHour);
            console.log('[calendar] maxhour: ' + self.maxHour);
            var $timeline = $('#timeline');
            $timeline.empty();
            var startHour = self.minHour;
            var endHour = 19 + 1;

            for (var hour = startHour; hour <= endHour; hour++) {
                $timeline.append(self.generateHour(hour));
                $timeline.append(self.generateHalfHour(hour));
            }

            setTimeout(function () {
                self.timelineScroll.refresh();
            });
        },

        /**
         * @method generateHour
         * @param hour
         * Generate hours interval
         */
        generateHour: function (hour) {
            var html = '' +
                '<li id="' + hour + '00">' +
                    '<div class="timeline-wrapper">' +
                        '<div class="timeline-bar"></div>' +
                        '<div class="timeline-time">' + hour + 'H00</div>' +
                    '</div>' +
                '</li>';
            return html;
        },

        /**
         * @method generateHalfHour
         * Generate half hour interval
         * @param hour
         */
        generateHalfHour: function (hour) {
            var html = '' +
                '<li id="' + hour + '30">' +
                    '<div class="timeline-wrapper">' +
                        '<div class="timeline-bar half"></div>' +
                        '<div class="timeline-time">' + hour + 'H30</div>' +
                    '</div>' +
                '</li>';
            return html;
        },

        /**
         * @method clearSearch
         * Clear the search input
         */
        clearSearch: function () {
            var self = this;
            self.currentSearch = null;
            self.filteredEvents = null;
            $('input#search-bar').val('');
        },

        /**
         * @method performSearch
         * @param search 
         */
        performSearch: function (search) {
            var self = this;
            var re = new RegExp('.*' + search + '.*', 'gi');
            var events = [];

            function buildSpeakersSearch(speakers) {
                var speakersArray = [];
                speakers.forEach(function (speaker) {
                    speakersArray.push(speaker.name.split(' - ').join(' '));
                });
                return speakersArray.join(' ');
            }


            for (var i = 0; i < self.calendar[self.currentDay].length; i++) {
                var event = self.calendar[self.currentDay][i];
                var speakers = buildSpeakersSearch(event.speakers);
                if (re.test(event.title) ||
                    re.test(event.room) ||
                    re.test(speakers)) {
                    events.push(event);
                }
            }
            self.filteredEvents = events;
            self.reloadEvents(self.filteredEvents);
            self.unselectTimeline();
        }
    };

    return controller;
});