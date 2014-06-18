define(['app/strings'], function (strings) {
    "use strict";

    var availableLocales = ['en'],
        currentLocale = availableLocales[0],
        locale,
        i18n = {

        setLocale: function (locale) {
            console.log('[i18n] locale: ' + locale);
            if (availableLocales.indexOf(locale) !== -1)
            {
                currentLocale = locale;
                window.localStorage.setItem('locale', currentLocale);
                // TODO: fire event about locale change
            }
            console.log('[i18n] currentLocale: ' + currentLocale);
        },

        getLocale: function () {
            return currentLocale;
        },

        _: function (key) {
            if (!strings[currentLocale].hasOwnProperty(key))
            {
                return '!!!MISSING!!!';
            }
            else
            {
                return strings[currentLocale][key];
            }
        }
    };

    if (window.localStorage)
    {
        locale = window.localStorage.getItem('locale');
        if (locale)
        {
            i18n.setLocale(locale);
        }
        else
        {
            window.localStorage.setItem('locale', currentLocale);
        }
    }

    return i18n;
}); // define
