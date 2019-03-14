//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

// This is done to register the method called with moment()
// without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            // even if its not own property I'd still call it non-empty
            return false;
        }
        return true;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    var some$1 = some;

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

// Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

// compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var keys$1 = keys;

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

// MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

// format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    var indexOf$1 = indexOf;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

// FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

// ALIASES

    addUnitAlias('month', 'M');

// PRIORITY

    addUnitPriority('month', 8);

// PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

// LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

// MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

// FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES

    addUnitAlias('year', 'y');

// PRIORITIES

    addUnitPriority('year', 1);

// PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

// HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

// HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

// MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date = new Date(y, m, d, h, M, s, ms);

        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

// start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

// FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

// PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

// PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

// HELPERS

// LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

// MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

// FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

// ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

// PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

// PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

// HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

// LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        if (!m) {
            return isArray(this._weekdays) ? this._weekdays :
                this._weekdays['standalone'];
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf$1.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

// MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

// FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

// ALIASES

    addUnitAlias('hour', 'h');

// PRIORITY
    addUnitPriority('hour', 13);

// PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

// LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


// MOMENTS

// Setting the hour should keep the time, because the user explicitly
// specified which hour he wants. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
    var getSetHour = makeGetSet('Hours', true);

// months
// week
// weekdays
// meridiem
    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

// internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    if (!localeFamilies[config.parentLocale]) {
                        localeFamilies[config.parentLocale] = [];
                    }
                    localeFamilies[config.parentLocale].push({
                        name: name,
                        config: config
                    });
                    return null;
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            // MERGE
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

// returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys$1(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                    a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                        a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                            a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                                    a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                                        -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

// iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var basicRfcRegex = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;

// date and time from ref 2822 format
    function configFromRFC2822(config) {
        var string, match, dayFormat,
            dateFormat, timeFormat, tzFormat;
        var timezones = {
            ' GMT': ' +0000',
            ' EDT': ' -0400',
            ' EST': ' -0500',
            ' CDT': ' -0500',
            ' CST': ' -0600',
            ' MDT': ' -0600',
            ' MST': ' -0700',
            ' PDT': ' -0700',
            ' PST': ' -0800'
        };
        var military = 'YXWVUTSRQPONZABCDEFGHIKLM';
        var timezone, timezoneIndex;

        string = config._i
            .replace(/\([^\)]*\)|[\n\t]/g, ' ') // Remove comments and folding whitespace
            .replace(/(\s\s+)/g, ' ') // Replace multiple-spaces with a single space
            .replace(/^\s|\s$/g, ''); // Remove leading and trailing spaces
        match = basicRfcRegex.exec(string);

        if (match) {
            dayFormat = match[1] ? 'ddd' + ((match[1].length === 5) ? ', ' : ' ') : '';
            dateFormat = 'D MMM ' + ((match[2].length > 10) ? 'YYYY ' : 'YY ');
            timeFormat = 'HH:mm' + (match[4] ? ':ss' : '');

            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            if (match[1]) { // day of week given
                var momentDate = new Date(match[2]);
                var momentDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][momentDate.getDay()];

                if (match[1].substr(0,3) !== momentDay) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return;
                }
            }

            switch (match[5].length) {
                case 2: // military
                    if (timezoneIndex === 0) {
                        timezone = ' +0000';
                    } else {
                        timezoneIndex = military.indexOf(match[5][1].toUpperCase()) - 12;
                        timezone = ((timezoneIndex < 0) ? ' -' : ' +') +
                            (('' + timezoneIndex).replace(/^-?/, '0')).match(/..$/)[0] + '00';
                    }
                    break;
                case 4: // Zone
                    timezone = timezones[match[5]];
                    break;
                default: // UT or +/-9999
                    timezone = timezones[' GMT'];
            }
            match[5] = timezone;
            config._i = match.splice(1).join('');
            tzFormat = ' ZZ';
            config._f = dayFormat + dateFormat + timeFormat + tzFormat;
            configFromStringAndFormat(config);
            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

// date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

// Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

// constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

// date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

// date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

// TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(ordering.indexOf(key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

// FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

// PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
            0 :
            parts[0] === '+' ? minutes : -minutes;
    }

// Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

// ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

// TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                    'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                        diff < 2 ? 'nextDay' :
                            diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                    units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                        units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString() {
        if (!this.isValid()) {
            return null;
        }
        var m = this.clone().utc();
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            return this.toDate().toISOString();
        }
        return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
            createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
            createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
            /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
            /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
            /* falls through */
            case 'hour':
                this.minutes(0);
            /* falls through */
            case 'minute':
                this.seconds(0);
            /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

// FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

// PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


// PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

// MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
            input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

// FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES

    addUnitAlias('quarter', 'Q');

// PRIORITY

    addUnitPriority('quarter', 7);

// PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

// MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

// FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES

    addUnitAlias('date', 'D');

// PRIOROITY
    addUnitPriority('date', 9);

// PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
            (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
            locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

// MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

// FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES

    addUnitAlias('dayOfYear', 'DDD');

// PRIORITY
    addUnitPriority('dayOfYear', 4);

// PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

// HELPERS

// MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

// FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

// ALIASES

    addUnitAlias('minute', 'm');

// PRIORITY

    addUnitPriority('minute', 14);

// PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

// MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

// FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES

    addUnitAlias('second', 's');

// PRIORITY

    addUnitPriority('second', 15);

// PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

// MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

// FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


// ALIASES

    addUnitAlias('millisecond', 'ms');

// PRIORITY

    addUnitPriority('millisecond', 16);

// PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
// MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

// FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;

// Year
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;

// Week Year
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;

// Quarter
    proto.quarter = proto.quarters = getSetQuarter;

// Month
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;

// Week
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;

// Day
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;

// Hour
    proto.hour = proto.hours = getSetHour;

// Minute
    proto.minute = proto.minutes = getSetMinute;

// Second
    proto.second = proto.seconds = getSetSecond;

// Millisecond
    proto.millisecond = proto.milliseconds = getSetMillisecond;

// Offset
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;

// Timezone
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;

// Deprecations
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

// Month
    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;

// Week
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

// Day of Week
    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

// Hours
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

// Side effect imports
    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

// supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

// supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
            (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

// TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
            seconds < thresholds.s   && ['ss', seconds] ||
            minutes <= 1             && ['m']           ||
            minutes < thresholds.m   && ['mm', minutes] ||
            hours   <= 1             && ['h']           ||
            hours   < thresholds.h   && ['hh', hours]   ||
            days    <= 1             && ['d']           ||
            days    < thresholds.d   && ['dd', days]    ||
            months  <= 1             && ['M']           ||
            months  < thresholds.M   && ['MM', months]  ||
            years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

// This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

// This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

// Deprecations
    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

// Side effect imports

// FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

// PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

// Side effect imports


    hooks.version = '2.18.1';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    return hooks;

})));

/*!
 * clipboard.js v1.6.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Clipboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    var DOCUMENT_NODE_TYPE = 9;

    /**
     * A polyfill for Element.matches()
     */
    if (typeof Element !== 'undefined' && !Element.prototype.matches) {
        var proto = Element.prototype;

        proto.matches = proto.matchesSelector ||
            proto.mozMatchesSelector ||
            proto.msMatchesSelector ||
            proto.oMatchesSelector ||
            proto.webkitMatchesSelector;
    }

    /**
     * Finds the closest parent that matches a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @return {Function}
     */
    function closest (element, selector) {
        while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
            if (element.matches(selector)) return element;
            element = element.parentNode;
        }
    }

    module.exports = closest;

},{}],2:[function(require,module,exports){
    var closest = require('./closest');

    /**
     * Delegates event to a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function delegate(element, selector, type, callback, useCapture) {
        var listenerFn = listener.apply(this, arguments);

        element.addEventListener(type, listenerFn, useCapture);

        return {
            destroy: function() {
                element.removeEventListener(type, listenerFn, useCapture);
            }
        }
    }

    /**
     * Finds closest match and invokes callback.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Function}
     */
    function listener(element, selector, type, callback) {
        return function(e) {
            e.delegateTarget = closest(e.target, selector);

            if (e.delegateTarget) {
                callback.call(element, e);
            }
        }
    }

    module.exports = delegate;

},{"./closest":1}],3:[function(require,module,exports){
    /**
     * Check if argument is a HTML element.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.node = function(value) {
        return value !== undefined
            && value instanceof HTMLElement
            && value.nodeType === 1;
    };

    /**
     * Check if argument is a list of HTML elements.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.nodeList = function(value) {
        var type = Object.prototype.toString.call(value);

        return value !== undefined
            && (type === '[object NodeList]' || type === '[object HTMLCollection]')
            && ('length' in value)
            && (value.length === 0 || exports.node(value[0]));
    };

    /**
     * Check if argument is a string.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.string = function(value) {
        return typeof value === 'string'
            || value instanceof String;
    };

    /**
     * Check if argument is a function.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.fn = function(value) {
        var type = Object.prototype.toString.call(value);

        return type === '[object Function]';
    };

},{}],4:[function(require,module,exports){
    var is = require('./is');
    var delegate = require('delegate');

    /**
     * Validates all params and calls the right
     * listener function based on its target type.
     *
     * @param {String|HTMLElement|HTMLCollection|NodeList} target
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listen(target, type, callback) {
        if (!target && !type && !callback) {
            throw new Error('Missing required arguments');
        }

        if (!is.string(type)) {
            throw new TypeError('Second argument must be a String');
        }

        if (!is.fn(callback)) {
            throw new TypeError('Third argument must be a Function');
        }

        if (is.node(target)) {
            return listenNode(target, type, callback);
        }
        else if (is.nodeList(target)) {
            return listenNodeList(target, type, callback);
        }
        else if (is.string(target)) {
            return listenSelector(target, type, callback);
        }
        else {
            throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
        }
    }

    /**
     * Adds an event listener to a HTML element
     * and returns a remove listener function.
     *
     * @param {HTMLElement} node
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNode(node, type, callback) {
        node.addEventListener(type, callback);

        return {
            destroy: function() {
                node.removeEventListener(type, callback);
            }
        }
    }

    /**
     * Add an event listener to a list of HTML elements
     * and returns a remove listener function.
     *
     * @param {NodeList|HTMLCollection} nodeList
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNodeList(nodeList, type, callback) {
        Array.prototype.forEach.call(nodeList, function(node) {
            node.addEventListener(type, callback);
        });

        return {
            destroy: function() {
                Array.prototype.forEach.call(nodeList, function(node) {
                    node.removeEventListener(type, callback);
                });
            }
        }
    }

    /**
     * Add an event listener to a selector
     * and returns a remove listener function.
     *
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenSelector(selector, type, callback) {
        return delegate(document.body, selector, type, callback);
    }

    module.exports = listen;

},{"./is":3,"delegate":2}],5:[function(require,module,exports){
    function select(element) {
        var selectedText;

        if (element.nodeName === 'SELECT') {
            element.focus();

            selectedText = element.value;
        }
        else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
            var isReadOnly = element.hasAttribute('readonly');

            if (!isReadOnly) {
                element.setAttribute('readonly', '');
            }

            element.select();
            element.setSelectionRange(0, element.value.length);

            if (!isReadOnly) {
                element.removeAttribute('readonly');
            }

            selectedText = element.value;
        }
        else {
            if (element.hasAttribute('contenteditable')) {
                element.focus();
            }

            var selection = window.getSelection();
            var range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            selectedText = selection.toString();
        }

        return selectedText;
    }

    module.exports = select;

},{}],6:[function(require,module,exports){
    function E () {
        // Keep this empty so it's easier to inherit from
        // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
    }

    E.prototype = {
        on: function (name, callback, ctx) {
            var e = this.e || (this.e = {});

            (e[name] || (e[name] = [])).push({
                fn: callback,
                ctx: ctx
            });

            return this;
        },

        once: function (name, callback, ctx) {
            var self = this;
            function listener () {
                self.off(name, listener);
                callback.apply(ctx, arguments);
            };

            listener._ = callback
            return this.on(name, listener, ctx);
        },

        emit: function (name) {
            var data = [].slice.call(arguments, 1);
            var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
            var i = 0;
            var len = evtArr.length;

            for (i; i < len; i++) {
                evtArr[i].fn.apply(evtArr[i].ctx, data);
            }

            return this;
        },

        off: function (name, callback) {
            var e = this.e || (this.e = {});
            var evts = e[name];
            var liveEvents = [];

            if (evts && callback) {
                for (var i = 0, len = evts.length; i < len; i++) {
                    if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                        liveEvents.push(evts[i]);
                }
            }

            // Remove event from queue to prevent memory leak
            // Suggested by https://github.com/lazd
            // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

            (liveEvents.length)
                ? e[name] = liveEvents
                : delete e[name];

            return this;
        }
    };

    module.exports = E;

},{}],7:[function(require,module,exports){
    (function (global, factory) {
        if (typeof define === "function" && define.amd) {
            define(['module', 'select'], factory);
        } else if (typeof exports !== "undefined") {
            factory(module, require('select'));
        } else {
            var mod = {
                exports: {}
            };
            factory(mod, global.select);
            global.clipboardAction = mod.exports;
        }
    })(this, function (module, _select) {
        'use strict';

        var _select2 = _interopRequireDefault(_select);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }

        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
            return typeof obj;
        } : function (obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        var _createClass = function () {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }

            return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();

        var ClipboardAction = function () {
            /**
             * @param {Object} options
             */
            function ClipboardAction(options) {
                _classCallCheck(this, ClipboardAction);

                this.resolveOptions(options);
                this.initSelection();
            }

            /**
             * Defines base properties passed from constructor.
             * @param {Object} options
             */


            _createClass(ClipboardAction, [{
                key: 'resolveOptions',
                value: function resolveOptions() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    this.action = options.action;
                    this.emitter = options.emitter;
                    this.target = options.target;
                    this.text = options.text;
                    this.trigger = options.trigger;

                    this.selectedText = '';
                }
            }, {
                key: 'initSelection',
                value: function initSelection() {
                    if (this.text) {
                        this.selectFake();
                    } else if (this.target) {
                        this.selectTarget();
                    }
                }
            }, {
                key: 'selectFake',
                value: function selectFake() {
                    var _this = this;

                    var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                    this.removeFake();

                    this.fakeHandlerCallback = function () {
                        return _this.removeFake();
                    };
                    this.fakeHandler = document.body.addEventListener('click', this.fakeHandlerCallback) || true;

                    this.fakeElem = document.createElement('textarea');
                    // Prevent zooming on iOS
                    this.fakeElem.style.fontSize = '12pt';
                    // Reset box model
                    this.fakeElem.style.border = '0';
                    this.fakeElem.style.padding = '0';
                    this.fakeElem.style.margin = '0';
                    // Move element out of screen horizontally
                    this.fakeElem.style.position = 'absolute';
                    this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                    // Move element to the same position vertically
                    var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                    this.fakeElem.style.top = yPosition + 'px';

                    this.fakeElem.setAttribute('readonly', '');
                    this.fakeElem.value = this.text;

                    document.body.appendChild(this.fakeElem);

                    this.selectedText = (0, _select2.default)(this.fakeElem);
                    this.copyText();
                }
            }, {
                key: 'removeFake',
                value: function removeFake() {
                    if (this.fakeHandler) {
                        document.body.removeEventListener('click', this.fakeHandlerCallback);
                        this.fakeHandler = null;
                        this.fakeHandlerCallback = null;
                    }

                    if (this.fakeElem) {
                        document.body.removeChild(this.fakeElem);
                        this.fakeElem = null;
                    }
                }
            }, {
                key: 'selectTarget',
                value: function selectTarget() {
                    this.selectedText = (0, _select2.default)(this.target);
                    this.copyText();
                }
            }, {
                key: 'copyText',
                value: function copyText() {
                    var succeeded = void 0;

                    try {
                        succeeded = document.execCommand(this.action);
                    } catch (err) {
                        succeeded = false;
                    }

                    this.handleResult(succeeded);
                }
            }, {
                key: 'handleResult',
                value: function handleResult(succeeded) {
                    this.emitter.emit(succeeded ? 'success' : 'error', {
                        action: this.action,
                        text: this.selectedText,
                        trigger: this.trigger,
                        clearSelection: this.clearSelection.bind(this)
                    });
                }
            }, {
                key: 'clearSelection',
                value: function clearSelection() {
                    if (this.target) {
                        this.target.blur();
                    }

                    window.getSelection().removeAllRanges();
                }
            }, {
                key: 'destroy',
                value: function destroy() {
                    this.removeFake();
                }
            }, {
                key: 'action',
                set: function set() {
                    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                    this._action = action;

                    if (this._action !== 'copy' && this._action !== 'cut') {
                        throw new Error('Invalid "action" value, use either "copy" or "cut"');
                    }
                },
                get: function get() {
                    return this._action;
                }
            }, {
                key: 'target',
                set: function set(target) {
                    if (target !== undefined) {
                        if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                            if (this.action === 'copy' && target.hasAttribute('disabled')) {
                                throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                            }

                            if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                                throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                            }

                            this._target = target;
                        } else {
                            throw new Error('Invalid "target" value, use a valid Element');
                        }
                    }
                },
                get: function get() {
                    return this._target;
                }
            }]);

            return ClipboardAction;
        }();

        module.exports = ClipboardAction;
    });

},{"select":5}],8:[function(require,module,exports){
    (function (global, factory) {
        if (typeof define === "function" && define.amd) {
            define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
        } else if (typeof exports !== "undefined") {
            factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
        } else {
            var mod = {
                exports: {}
            };
            factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
            global.clipboard = mod.exports;
        }
    })(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
        'use strict';

        var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

        var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

        var _goodListener2 = _interopRequireDefault(_goodListener);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        var _createClass = function () {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }

            return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();

        function _possibleConstructorReturn(self, call) {
            if (!self) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }

            return call && (typeof call === "object" || typeof call === "function") ? call : self;
        }

        function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }

            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
        }

        var Clipboard = function (_Emitter) {
            _inherits(Clipboard, _Emitter);

            /**
             * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
             * @param {Object} options
             */
            function Clipboard(trigger, options) {
                _classCallCheck(this, Clipboard);

                var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

                _this.resolveOptions(options);
                _this.listenClick(trigger);
                return _this;
            }

            /**
             * Defines if attributes would be resolved using internal setter functions
             * or custom functions that were passed in the constructor.
             * @param {Object} options
             */


            _createClass(Clipboard, [{
                key: 'resolveOptions',
                value: function resolveOptions() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                    this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                    this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                }
            }, {
                key: 'listenClick',
                value: function listenClick(trigger) {
                    var _this2 = this;

                    this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                        return _this2.onClick(e);
                    });
                }
            }, {
                key: 'onClick',
                value: function onClick(e) {
                    var trigger = e.delegateTarget || e.currentTarget;

                    if (this.clipboardAction) {
                        this.clipboardAction = null;
                    }

                    this.clipboardAction = new _clipboardAction2.default({
                        action: this.action(trigger),
                        target: this.target(trigger),
                        text: this.text(trigger),
                        trigger: trigger,
                        emitter: this
                    });
                }
            }, {
                key: 'defaultAction',
                value: function defaultAction(trigger) {
                    return getAttributeValue('action', trigger);
                }
            }, {
                key: 'defaultTarget',
                value: function defaultTarget(trigger) {
                    var selector = getAttributeValue('target', trigger);

                    if (selector) {
                        return document.querySelector(selector);
                    }
                }
            }, {
                key: 'defaultText',
                value: function defaultText(trigger) {
                    return getAttributeValue('text', trigger);
                }
            }, {
                key: 'destroy',
                value: function destroy() {
                    this.listener.destroy();

                    if (this.clipboardAction) {
                        this.clipboardAction.destroy();
                        this.clipboardAction = null;
                    }
                }
            }], [{
                key: 'isSupported',
                value: function isSupported() {
                    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                    var actions = typeof action === 'string' ? [action] : action;
                    var support = !!document.queryCommandSupported;

                    actions.forEach(function (action) {
                        support = support && !!document.queryCommandSupported(action);
                    });

                    return support;
                }
            }]);

            return Clipboard;
        }(_tinyEmitter2.default);

        /**
         * Helper function to retrieve attribute value.
         * @param {String} suffix
         * @param {Element} element
         */
        function getAttributeValue(suffix, element) {
            var attribute = 'data-clipboard-' + suffix;

            if (!element.hasAttribute(attribute)) {
                return;
            }

            return element.getAttribute(attribute);
        }

        module.exports = Clipboard;
    });

},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)
});

/*
 @package NOTY - Dependency-free notification library
 @version version: 3.1.1
 @contributors https://github.com/needim/noty/graphs/contributors
 @documentation Examples and Documentation - http://needim.github.com/noty
 @license Licensed under the MIT licenses: http://www.opensource.org/licenses/mit-license.php
 */

(function webpackUniversalModuleDefinition(root, factory) {
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define("Noty", [], factory);
    else if(typeof exports === 'object')
        exports["Noty"] = factory();
    else
        root["Noty"] = factory();
})(this, function() {
    return /******/ (function(modules) { // webpackBootstrap
        /******/ 	// The module cache
        /******/ 	var installedModules = {};
        /******/
        /******/ 	// The require function
        /******/ 	function __webpack_require__(moduleId) {
            /******/
            /******/ 		// Check if module is in cache
            /******/ 		if(installedModules[moduleId]) {
                /******/ 			return installedModules[moduleId].exports;
                /******/ 		}
            /******/ 		// Create a new module (and put it into the cache)
            /******/ 		var module = installedModules[moduleId] = {
                /******/ 			i: moduleId,
                /******/ 			l: false,
                /******/ 			exports: {}
                /******/ 		};
            /******/
            /******/ 		// Execute the module function
            /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ 		// Flag the module as loaded
            /******/ 		module.l = true;
            /******/
            /******/ 		// Return the exports of the module
            /******/ 		return module.exports;
            /******/ 	}
        /******/
        /******/
        /******/ 	// expose the modules object (__webpack_modules__)
        /******/ 	__webpack_require__.m = modules;
        /******/
        /******/ 	// expose the module cache
        /******/ 	__webpack_require__.c = installedModules;
        /******/
        /******/ 	// identity function for calling harmony imports with the correct context
        /******/ 	__webpack_require__.i = function(value) { return value; };
        /******/
        /******/ 	// define getter function for harmony exports
        /******/ 	__webpack_require__.d = function(exports, name, getter) {
            /******/ 		if(!__webpack_require__.o(exports, name)) {
                /******/ 			Object.defineProperty(exports, name, {
                    /******/ 				configurable: false,
                    /******/ 				enumerable: true,
                    /******/ 				get: getter
                    /******/ 			});
                /******/ 		}
            /******/ 	};
        /******/
        /******/ 	// getDefaultExport function for compatibility with non-harmony modules
        /******/ 	__webpack_require__.n = function(module) {
            /******/ 		var getter = module && module.__esModule ?
                /******/ 			function getDefault() { return module['default']; } :
                /******/ 			function getModuleExports() { return module; };
            /******/ 		__webpack_require__.d(getter, 'a', getter);
            /******/ 		return getter;
            /******/ 	};
        /******/
        /******/ 	// Object.prototype.hasOwnProperty.call
        /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
        /******/
        /******/ 	// __webpack_public_path__
        /******/ 	__webpack_require__.p = "";
        /******/
        /******/ 	// Load entry module and return exports
        /******/ 	return __webpack_require__(__webpack_require__.s = 6);
        /******/ })
    /************************************************************************/
    /******/ ([
        /* 0 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.css = exports.deepExtend = exports.animationEndEvents = undefined;

            var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

            exports.inArray = inArray;
            exports.stopPropagation = stopPropagation;
            exports.generateID = generateID;
            exports.outerHeight = outerHeight;
            exports.addListener = addListener;
            exports.hasClass = hasClass;
            exports.addClass = addClass;
            exports.removeClass = removeClass;
            exports.remove = remove;
            exports.classList = classList;
            exports.visibilityChangeFlow = visibilityChangeFlow;
            exports.createAudioElements = createAudioElements;

            var _api = __webpack_require__(1);

            var API = _interopRequireWildcard(_api);

            function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

            var animationEndEvents = exports.animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

            function inArray(needle, haystack, argStrict) {
                var key = void 0;
                var strict = !!argStrict;

                if (strict) {
                    for (key in haystack) {
                        if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
                            return true;
                        }
                    }
                } else {
                    for (key in haystack) {
                        if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function stopPropagation(evt) {
                evt = evt || window.event;

                if (typeof evt.stopPropagation !== 'undefined') {
                    evt.stopPropagation();
                } else {
                    evt.cancelBubble = true;
                }
            }

            var deepExtend = exports.deepExtend = function deepExtend(out) {
                out = out || {};

                for (var i = 1; i < arguments.length; i++) {
                    var obj = arguments[i];

                    if (!obj) continue;

                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (Array.isArray(obj[key])) {
                                out[key] = obj[key];
                            } else if (_typeof(obj[key]) === 'object' && obj[key] !== null) {
                                out[key] = deepExtend(out[key], obj[key]);
                            } else {
                                out[key] = obj[key];
                            }
                        }
                    }
                }

                return out;
            };

            function generateID() {
                var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

                var id = 'noty_' + prefix + '_';

                id += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0;
                    var v = c === 'x' ? r : r & 0x3 | 0x8;
                    return v.toString(16);
                });

                return id;
            }

            function outerHeight(el) {
                var height = el.offsetHeight;
                var style = window.getComputedStyle(el);

                height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                return height;
            }

            var css = exports.css = function () {
                var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
                var cssProps = {};

                function camelCase(string) {
                    return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
                        return letter.toUpperCase();
                    });
                }

                function getVendorProp(name) {
                    var style = document.body.style;
                    if (name in style) return name;

                    var i = cssPrefixes.length;
                    var capName = name.charAt(0).toUpperCase() + name.slice(1);
                    var vendorName = void 0;

                    while (i--) {
                        vendorName = cssPrefixes[i] + capName;
                        if (vendorName in style) return vendorName;
                    }

                    return name;
                }

                function getStyleProp(name) {
                    name = camelCase(name);
                    return cssProps[name] || (cssProps[name] = getVendorProp(name));
                }

                function applyCss(element, prop, value) {
                    prop = getStyleProp(prop);
                    element.style[prop] = value;
                }

                return function (element, properties) {
                    var args = arguments;
                    var prop = void 0;
                    var value = void 0;

                    if (args.length === 2) {
                        for (prop in properties) {
                            if (properties.hasOwnProperty(prop)) {
                                value = properties[prop];
                                if (value !== undefined && properties.hasOwnProperty(prop)) {
                                    applyCss(element, prop, value);
                                }
                            }
                        }
                    } else {
                        applyCss(element, args[1], args[2]);
                    }
                };
            }();

            function addListener(el, events, cb) {
                var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

                events = events.split(' ');
                for (var i = 0; i < events.length; i++) {
                    if (document.addEventListener) {
                        el.addEventListener(events[i], cb, useCapture);
                    } else if (document.attachEvent) {
                        el.attachEvent('on' + events[i], cb);
                    }
                }
            }

            function hasClass(element, name) {
                var list = typeof element === 'string' ? element : classList(element);
                return list.indexOf(' ' + name + ' ') >= 0;
            }

            function addClass(element, name) {
                var oldList = classList(element);
                var newList = oldList + name;

                if (hasClass(oldList, name)) return;

                // Trim the opening space.
                element.className = newList.substring(1);
            }

            function removeClass(element, name) {
                var oldList = classList(element);
                var newList = void 0;

                if (!hasClass(element, name)) return;

                // Replace the class name.
                newList = oldList.replace(' ' + name + ' ', ' ');

                // Trim the opening and closing spaces.
                element.className = newList.substring(1, newList.length - 1);
            }

            function remove(element) {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }

            function classList(element) {
                return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
            }

            function visibilityChangeFlow() {
                var hidden = void 0;
                var visibilityChange = void 0;
                if (typeof document.hidden !== 'undefined') {
                    // Opera 12.10 and Firefox 18 and later support
                    hidden = 'hidden';
                    visibilityChange = 'visibilitychange';
                } else if (typeof document.msHidden !== 'undefined') {
                    hidden = 'msHidden';
                    visibilityChange = 'msvisibilitychange';
                } else if (typeof document.webkitHidden !== 'undefined') {
                    hidden = 'webkitHidden';
                    visibilityChange = 'webkitvisibilitychange';
                }

                function onVisibilityChange() {
                    API.PageHidden = document[hidden];
                    handleVisibilityChange();
                }

                function onBlur() {
                    API.PageHidden = true;
                    handleVisibilityChange();
                }

                function onFocus() {
                    API.PageHidden = false;
                    handleVisibilityChange();
                }

                function handleVisibilityChange() {
                    if (API.PageHidden) stopAll();else resumeAll();
                }

                function stopAll() {
                    setTimeout(function () {
                        Object.keys(API.Store).forEach(function (id) {
                            if (API.Store.hasOwnProperty(id)) {
                                if (API.Store[id].options.visibilityControl) {
                                    API.Store[id].stop();
                                }
                            }
                        });
                    }, 100);
                }

                function resumeAll() {
                    setTimeout(function () {
                        Object.keys(API.Store).forEach(function (id) {
                            if (API.Store.hasOwnProperty(id)) {
                                if (API.Store[id].options.visibilityControl) {
                                    API.Store[id].resume();
                                }
                            }
                        });
                        API.queueRenderAll();
                    }, 100);
                }

                addListener(document, visibilityChange, onVisibilityChange);
                addListener(window, 'blur', onBlur);
                addListener(window, 'focus', onFocus);
            }

            function createAudioElements(ref) {
                if (ref.hasSound) {
                    var audioElement = document.createElement('audio');

                    ref.options.sounds.sources.forEach(function (s) {
                        var source = document.createElement('source');
                        source.src = s;
                        source.type = 'audio/' + getExtension(s);
                        audioElement.appendChild(source);
                    });

                    if (ref.barDom) {
                        ref.barDom.appendChild(audioElement);
                    } else {
                        document.querySelector('body').appendChild(audioElement);
                    }

                    audioElement.volume = ref.options.sounds.volume;

                    if (!ref.soundPlayed) {
                        audioElement.play();
                        ref.soundPlayed = true;
                    }

                    audioElement.onended = function () {
                        remove(audioElement);
                    };
                }
            }

            function getExtension(fileName) {
                return fileName.match(/\.([^.]+)$/)[1];
            }

            /***/ }),
        /* 1 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Defaults = exports.Store = exports.Queues = exports.DefaultMaxVisible = exports.docTitle = exports.DocModalCount = exports.PageHidden = undefined;
            exports.getQueueCounts = getQueueCounts;
            exports.addToQueue = addToQueue;
            exports.removeFromQueue = removeFromQueue;
            exports.queueRender = queueRender;
            exports.queueRenderAll = queueRenderAll;
            exports.ghostFix = ghostFix;
            exports.build = build;
            exports.hasButtons = hasButtons;
            exports.handleModal = handleModal;
            exports.handleModalClose = handleModalClose;
            exports.queueClose = queueClose;
            exports.dequeueClose = dequeueClose;
            exports.fire = fire;
            exports.openFlow = openFlow;
            exports.closeFlow = closeFlow;

            var _utils = __webpack_require__(0);

            var Utils = _interopRequireWildcard(_utils);

            function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

            var PageHidden = exports.PageHidden = false;
            var DocModalCount = exports.DocModalCount = 0;

            var DocTitleProps = {
                originalTitle: null,
                count: 0,
                changed: false,
                timer: -1
            };

            var docTitle = exports.docTitle = {
                increment: function increment() {
                    DocTitleProps.count++;

                    docTitle._update();
                },

                decrement: function decrement() {
                    DocTitleProps.count--;

                    if (DocTitleProps.count <= 0) {
                        docTitle._clear();
                        return;
                    }

                    docTitle._update();
                },

                _update: function _update() {
                    var title = document.title;

                    if (!DocTitleProps.changed) {
                        DocTitleProps.originalTitle = title;
                        document.title = '(' + DocTitleProps.count + ') ' + title;
                        DocTitleProps.changed = true;
                    } else {
                        document.title = '(' + DocTitleProps.count + ') ' + DocTitleProps.originalTitle;
                    }
                },

                _clear: function _clear() {
                    if (DocTitleProps.changed) {
                        DocTitleProps.count = 0;
                        document.title = DocTitleProps.originalTitle;
                        DocTitleProps.changed = false;
                    }
                }
            };

            var DefaultMaxVisible = exports.DefaultMaxVisible = 5;

            var Queues = exports.Queues = {
                global: {
                    maxVisible: DefaultMaxVisible,
                    queue: []
                }
            };

            var Store = exports.Store = {};

            var Defaults = exports.Defaults = {
                type: 'alert',
                layout: 'topRight',
                theme: 'mint',
                text: '',
                timeout: false,
                progressBar: true,
                closeWith: ['click'],
                animation: {
                    open: 'noty_effects_open',
                    close: 'noty_effects_close'
                },
                id: false,
                force: false,
                killer: false,
                queue: 'global',
                container: false,
                buttons: [],
                callbacks: {
                    beforeShow: null,
                    onShow: null,
                    afterShow: null,
                    onClose: null,
                    afterClose: null,
                    onClick: null,
                    onHover: null,
                    onTemplate: null
                },
                sounds: {
                    sources: [],
                    volume: 1,
                    conditions: []
                },
                titleCount: {
                    conditions: []
                },
                modal: false,
                visibilityControl: false
            };

            /**
             * @param {string} queueName
             * @return {object}
             */
            function getQueueCounts() {
                var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

                var count = 0;
                var max = DefaultMaxVisible;

                if (Queues.hasOwnProperty(queueName)) {
                    max = Queues[queueName].maxVisible;
                    Object.keys(Store).forEach(function (i) {
                        if (Store[i].options.queue === queueName && !Store[i].closed) count++;
                    });
                }

                return {
                    current: count,
                    maxVisible: max
                };
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function addToQueue(ref) {
                if (!Queues.hasOwnProperty(ref.options.queue)) {
                    Queues[ref.options.queue] = { maxVisible: DefaultMaxVisible, queue: [] };
                }

                Queues[ref.options.queue].queue.push(ref);
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function removeFromQueue(ref) {
                if (Queues.hasOwnProperty(ref.options.queue)) {
                    var queue = [];
                    Object.keys(Queues[ref.options.queue].queue).forEach(function (i) {
                        if (Queues[ref.options.queue].queue[i].id !== ref.id) {
                            queue.push(Queues[ref.options.queue].queue[i]);
                        }
                    });
                    Queues[ref.options.queue].queue = queue;
                }
            }

            /**
             * @param {string} queueName
             * @return {void}
             */
            function queueRender() {
                var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

                if (Queues.hasOwnProperty(queueName)) {
                    var noty = Queues[queueName].queue.shift();

                    if (noty) noty.show();
                }
            }

            /**
             * @return {void}
             */
            function queueRenderAll() {
                Object.keys(Queues).forEach(function (queueName) {
                    queueRender(queueName);
                });
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function ghostFix(ref) {
                var ghostID = Utils.generateID('ghost');
                var ghost = document.createElement('div');
                ghost.setAttribute('id', ghostID);
                Utils.css(ghost, {
                    height: Utils.outerHeight(ref.barDom) + 'px'
                });

                ref.barDom.insertAdjacentHTML('afterend', ghost.outerHTML);

                Utils.remove(ref.barDom);
                ghost = document.getElementById(ghostID);
                Utils.addClass(ghost, 'noty_fix_effects_height');
                Utils.addListener(ghost, Utils.animationEndEvents, function () {
                    Utils.remove(ghost);
                });
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function build(ref) {
                findOrCreateContainer(ref);

                var markup = '<div class="noty_body">' + ref.options.text + '</div>' + buildButtons(ref) + '<div class="noty_progressbar"></div>';

                ref.barDom = document.createElement('div');
                ref.barDom.setAttribute('id', ref.id);
                Utils.addClass(ref.barDom, 'noty_bar noty_type__' + ref.options.type + ' noty_theme__' + ref.options.theme);

                ref.barDom.innerHTML = markup;

                fire(ref, 'onTemplate');
            }

            /**
             * @param {Noty} ref
             * @return {boolean}
             */
            function hasButtons(ref) {
                return !!(ref.options.buttons && Object.keys(ref.options.buttons).length);
            }

            /**
             * @param {Noty} ref
             * @return {string}
             */
            function buildButtons(ref) {
                if (hasButtons(ref)) {
                    var buttons = document.createElement('div');
                    Utils.addClass(buttons, 'noty_buttons');

                    Object.keys(ref.options.buttons).forEach(function (key) {
                        buttons.appendChild(ref.options.buttons[key].dom);
                    });

                    ref.options.buttons.forEach(function (btn) {
                        buttons.appendChild(btn.dom);
                    });
                    return buttons.outerHTML;
                }
                return '';
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function handleModal(ref) {
                if (ref.options.modal) {
                    if (DocModalCount === 0) {
                        createModal(ref);
                    }

                    exports.DocModalCount = DocModalCount += 1;
                }
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function handleModalClose(ref) {
                if (ref.options.modal && DocModalCount > 0) {
                    exports.DocModalCount = DocModalCount -= 1;

                    if (DocModalCount <= 0) {
                        var modal = document.querySelector('.noty_modal');

                        if (modal) {
                            Utils.removeClass(modal, 'noty_modal_open');
                            Utils.addClass(modal, 'noty_modal_close');
                            Utils.addListener(modal, Utils.animationEndEvents, function () {
                                Utils.remove(modal);
                            });
                        }
                    }
                }
            }

            /**
             * @return {void}
             */
            function createModal() {
                var body = document.querySelector('body');
                var modal = document.createElement('div');
                Utils.addClass(modal, 'noty_modal');
                body.insertBefore(modal, body.firstChild);
                Utils.addClass(modal, 'noty_modal_open');

                Utils.addListener(modal, Utils.animationEndEvents, function () {
                    Utils.removeClass(modal, 'noty_modal_open');
                });
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function findOrCreateContainer(ref) {
                if (ref.options.container) {
                    ref.layoutDom = document.querySelector(ref.options.container);
                    return;
                }

                var layoutID = 'noty_layout__' + ref.options.layout;
                ref.layoutDom = document.querySelector('div#' + layoutID);

                if (!ref.layoutDom) {
                    ref.layoutDom = document.createElement('div');
                    ref.layoutDom.setAttribute('id', layoutID);
                    Utils.addClass(ref.layoutDom, 'noty_layout');
                    document.querySelector('body').appendChild(ref.layoutDom);
                }
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function queueClose(ref) {
                if (ref.options.timeout) {
                    if (ref.options.progressBar && ref.progressDom) {
                        Utils.css(ref.progressDom, {
                            transition: 'width ' + ref.options.timeout + 'ms linear',
                            width: '0%'
                        });
                    }

                    clearTimeout(ref.closeTimer);

                    ref.closeTimer = setTimeout(function () {
                        ref.close();
                    }, ref.options.timeout);
                }
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function dequeueClose(ref) {
                if (ref.options.timeout && ref.closeTimer) {
                    clearTimeout(ref.closeTimer);
                    ref.closeTimer = -1;

                    if (ref.options.progressBar && ref.progressDom) {
                        Utils.css(ref.progressDom, {
                            transition: 'width 0ms linear',
                            width: '100%'
                        });
                    }
                }
            }

            /**
             * @param {Noty} ref
             * @param {string} eventName
             * @return {void}
             */
            function fire(ref, eventName) {
                if (ref.listeners.hasOwnProperty(eventName)) {
                    ref.listeners[eventName].forEach(function (cb) {
                        if (typeof cb === 'function') {
                            cb.apply(ref);
                        }
                    });
                }
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function openFlow(ref) {
                fire(ref, 'afterShow');
                queueClose(ref);

                Utils.addListener(ref.barDom, 'mouseenter', function () {
                    dequeueClose(ref);
                });

                Utils.addListener(ref.barDom, 'mouseleave', function () {
                    queueClose(ref);
                });
            }

            /**
             * @param {Noty} ref
             * @return {void}
             */
            function closeFlow(ref) {
                delete Store[ref.id];
                ref.closing = false;
                fire(ref, 'afterClose');

                Utils.remove(ref.barDom);

                if (ref.layoutDom.querySelectorAll('.noty_bar').length === 0 && !ref.options.container) {
                    Utils.remove(ref.layoutDom);
                }

                if (Utils.inArray('docVisible', ref.options.titleCount.conditions) || Utils.inArray('docHidden', ref.options.titleCount.conditions)) {
                    docTitle.decrement();
                }

                queueRender(ref.options.queue);
            }

            /***/ }),
        /* 2 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.NotyButton = undefined;

            var _utils = __webpack_require__(0);

            var Utils = _interopRequireWildcard(_utils);

            function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var NotyButton = exports.NotyButton = function NotyButton(html, classes, cb) {
                var _this = this;

                var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

                _classCallCheck(this, NotyButton);

                this.dom = document.createElement('button');
                this.dom.innerHTML = html;
                this.id = attributes.id = attributes.id || Utils.generateID('button');
                this.cb = cb;
                Object.keys(attributes).forEach(function (propertyName) {
                    _this.dom.setAttribute(propertyName, attributes[propertyName]);
                });
                Utils.addClass(this.dom, classes || 'noty_btn');

                return this;
            };

            /***/ }),
        /* 3 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var Push = exports.Push = function () {
                function Push() {
                    var workerPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/service-worker.js';

                    _classCallCheck(this, Push);

                    this.subData = {};
                    this.workerPath = workerPath;
                    this.listeners = {
                        onPermissionGranted: [],
                        onPermissionDenied: [],
                        onSubscriptionSuccess: [],
                        onSubscriptionCancel: [],
                        onWorkerError: [],
                        onWorkerSuccess: [],
                        onWorkerNotSupported: []
                    };
                    return this;
                }

                /**
                 * @param {string} eventName
                 * @param {function} cb
                 * @return {Push}
                 */


                _createClass(Push, [{
                    key: 'on',
                    value: function on(eventName) {
                        var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

                        if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
                            this.listeners[eventName].push(cb);
                        }

                        return this;
                    }
                }, {
                    key: 'fire',
                    value: function fire(eventName) {
                        var _this = this;

                        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                        if (this.listeners.hasOwnProperty(eventName)) {
                            this.listeners[eventName].forEach(function (cb) {
                                if (typeof cb === 'function') {
                                    cb.apply(_this, params);
                                }
                            });
                        }
                    }
                }, {
                    key: 'create',
                    value: function create() {
                        console.log('NOT IMPLEMENTED YET');
                    }

                    /**
                     * @return {boolean}
                     */

                }, {
                    key: 'isSupported',
                    value: function isSupported() {
                        var result = false;

                        try {
                            result = window.Notification || window.webkitNotifications || navigator.mozNotification || window.external && window.external.msIsSiteMode() !== undefined;
                        } catch (e) {}

                        return result;
                    }

                    /**
                     * @return {string}
                     */

                }, {
                    key: 'getPermissionStatus',
                    value: function getPermissionStatus() {
                        var perm = 'default';

                        if (window.Notification && window.Notification.permissionLevel) {
                            perm = window.Notification.permissionLevel;
                        } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
                            switch (window.webkitNotifications.checkPermission()) {
                                case 1:
                                    perm = 'default';
                                    break;
                                case 0:
                                    perm = 'granted';
                                    break;
                                default:
                                    perm = 'denied';
                            }
                        } else if (window.Notification && window.Notification.permission) {
                            perm = window.Notification.permission;
                        } else if (navigator.mozNotification) {
                            perm = 'granted';
                        } else if (window.external && window.external.msIsSiteMode() !== undefined) {
                            perm = window.external.msIsSiteMode() ? 'granted' : 'default';
                        }

                        return perm.toString().toLowerCase();
                    }

                    /**
                     * @return {string}
                     */

                }, {
                    key: 'getEndpoint',
                    value: function getEndpoint(subscription) {
                        var endpoint = subscription.endpoint;
                        var subscriptionId = subscription.subscriptionId;

                        // fix for Chrome < 45
                        if (subscriptionId && endpoint.indexOf(subscriptionId) === -1) {
                            endpoint += '/' + subscriptionId;
                        }

                        return endpoint;
                    }

                    /**
                     * @return {boolean}
                     */

                }, {
                    key: 'isSWRegistered',
                    value: function isSWRegistered() {
                        try {
                            return navigator.serviceWorker.controller.state === 'activated';
                        } catch (e) {
                            return false;
                        }
                    }

                    /**
                     * @return {void}
                     */

                }, {
                    key: 'unregisterWorker',
                    value: function unregisterWorker() {
                        var self = this;
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = registrations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var registration = _step.value;

                                        registration.unregister();
                                        self.fire('onSubscriptionCancel');
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                            _iterator.return();
                                        }
                                    } finally {
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }
                            });
                        }
                    }

                    /**
                     * @return {void}
                     */

                }, {
                    key: 'requestSubscription',
                    value: function requestSubscription() {
                        var _this2 = this;

                        var userVisibleOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

                        var self = this;
                        var current = this.getPermissionStatus();
                        var cb = function cb(result) {
                            if (result === 'granted') {
                                _this2.fire('onPermissionGranted');

                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.register(_this2.workerPath).then(function () {
                                        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                                            self.fire('onWorkerSuccess');
                                            serviceWorkerRegistration.pushManager.subscribe({
                                                userVisibleOnly: userVisibleOnly
                                            }).then(function (subscription) {
                                                var key = subscription.getKey('p256dh');
                                                var token = subscription.getKey('auth');

                                                self.subData = {
                                                    endpoint: self.getEndpoint(subscription),
                                                    p256dh: key ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                                                    auth: token ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                                                };

                                                self.fire('onSubscriptionSuccess', [self.subData]);
                                            }).catch(function (err) {
                                                self.fire('onWorkerError', [err]);
                                            });
                                        });
                                    });
                                } else {
                                    self.fire('onWorkerNotSupported');
                                }
                            } else if (result === 'denied') {
                                _this2.fire('onPermissionDenied');
                                _this2.unregisterWorker();
                            }
                        };

                        if (current === 'default') {
                            if (window.Notification && window.Notification.requestPermission) {
                                window.Notification.requestPermission(cb);
                            } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
                                window.webkitNotifications.requestPermission(cb);
                            }
                        } else {
                            cb(current);
                        }
                    }
                }]);

                return Push;
            }();

            /***/ }),
        /* 4 */
        /***/ (function(module, exports, __webpack_require__) {

            /* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
             * @overview es6-promise - a tiny implementation of Promises/A+.
             * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
             * @license   Licensed under MIT license
             *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
             * @version   4.1.0
             */

                (function (global, factory) {
                    true ? module.exports = factory() :
                        typeof define === 'function' && define.amd ? define(factory) :
                            (global.ES6Promise = factory());
                }(this, (function () { 'use strict';

                    function objectOrFunction(x) {
                        return typeof x === 'function' || typeof x === 'object' && x !== null;
                    }

                    function isFunction(x) {
                        return typeof x === 'function';
                    }

                    var _isArray = undefined;
                    if (!Array.isArray) {
                        _isArray = function (x) {
                            return Object.prototype.toString.call(x) === '[object Array]';
                        };
                    } else {
                        _isArray = Array.isArray;
                    }

                    var isArray = _isArray;

                    var len = 0;
                    var vertxNext = undefined;
                    var customSchedulerFn = undefined;

                    var asap = function asap(callback, arg) {
                        queue[len] = callback;
                        queue[len + 1] = arg;
                        len += 2;
                        if (len === 2) {
                            // If len is 2, that means that we need to schedule an async flush.
                            // If additional callbacks are queued before the queue is flushed, they
                            // will be processed by this flush that we are scheduling.
                            if (customSchedulerFn) {
                                customSchedulerFn(flush);
                            } else {
                                scheduleFlush();
                            }
                        }
                    };

                    function setScheduler(scheduleFn) {
                        customSchedulerFn = scheduleFn;
                    }

                    function setAsap(asapFn) {
                        asap = asapFn;
                    }

                    var browserWindow = typeof window !== 'undefined' ? window : undefined;
                    var browserGlobal = browserWindow || {};
                    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
                    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
                    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
                    function useNextTick() {
                        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
                        // see https://github.com/cujojs/when/issues/410 for details
                        return function () {
                            return process.nextTick(flush);
                        };
                    }

// vertx
                    function useVertxTimer() {
                        if (typeof vertxNext !== 'undefined') {
                            return function () {
                                vertxNext(flush);
                            };
                        }

                        return useSetTimeout();
                    }

                    function useMutationObserver() {
                        var iterations = 0;
                        var observer = new BrowserMutationObserver(flush);
                        var node = document.createTextNode('');
                        observer.observe(node, { characterData: true });

                        return function () {
                            node.data = iterations = ++iterations % 2;
                        };
                    }

// web worker
                    function useMessageChannel() {
                        var channel = new MessageChannel();
                        channel.port1.onmessage = flush;
                        return function () {
                            return channel.port2.postMessage(0);
                        };
                    }

                    function useSetTimeout() {
                        // Store setTimeout reference so es6-promise will be unaffected by
                        // other code modifying setTimeout (like sinon.useFakeTimers())
                        var globalSetTimeout = setTimeout;
                        return function () {
                            return globalSetTimeout(flush, 1);
                        };
                    }

                    var queue = new Array(1000);
                    function flush() {
                        for (var i = 0; i < len; i += 2) {
                            var callback = queue[i];
                            var arg = queue[i + 1];

                            callback(arg);

                            queue[i] = undefined;
                            queue[i + 1] = undefined;
                        }

                        len = 0;
                    }

                    function attemptVertx() {
                        try {
                            var r = require;
                            var vertx = __webpack_require__(9);
                            vertxNext = vertx.runOnLoop || vertx.runOnContext;
                            return useVertxTimer();
                        } catch (e) {
                            return useSetTimeout();
                        }
                    }

                    var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
                    if (isNode) {
                        scheduleFlush = useNextTick();
                    } else if (BrowserMutationObserver) {
                        scheduleFlush = useMutationObserver();
                    } else if (isWorker) {
                        scheduleFlush = useMessageChannel();
                    } else if (browserWindow === undefined && "function" === 'function') {
                        scheduleFlush = attemptVertx();
                    } else {
                        scheduleFlush = useSetTimeout();
                    }

                    function then(onFulfillment, onRejection) {
                        var _arguments = arguments;

                        var parent = this;

                        var child = new this.constructor(noop);

                        if (child[PROMISE_ID] === undefined) {
                            makePromise(child);
                        }

                        var _state = parent._state;

                        if (_state) {
                            (function () {
                                var callback = _arguments[_state - 1];
                                asap(function () {
                                    return invokeCallback(_state, child, callback, parent._result);
                                });
                            })();
                        } else {
                            subscribe(parent, child, onFulfillment, onRejection);
                        }

                        return child;
                    }

                    /**
                     `Promise.resolve` returns a promise that will become resolved with the
                     passed `value`. It is shorthand for the following:

                     ```javascript
                     let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

                     promise.then(function(value){
    // value === 1
  });
                     ```

                     Instead of writing the above, your code now simply becomes the following:

                     ```javascript
                     let promise = Promise.resolve(1);

                     promise.then(function(value){
    // value === 1
  });
                     ```

                     @method resolve
                     @static
                     @param {Any} value value that the returned promise will be resolved with
                     Useful for tooling.
                     @return {Promise} a promise that will become fulfilled with the given
                     `value`
                     */
                    function resolve(object) {
                        /*jshint validthis:true */
                        var Constructor = this;

                        if (object && typeof object === 'object' && object.constructor === Constructor) {
                            return object;
                        }

                        var promise = new Constructor(noop);
                        _resolve(promise, object);
                        return promise;
                    }

                    var PROMISE_ID = Math.random().toString(36).substring(16);

                    function noop() {}

                    var PENDING = void 0;
                    var FULFILLED = 1;
                    var REJECTED = 2;

                    var GET_THEN_ERROR = new ErrorObject();

                    function selfFulfillment() {
                        return new TypeError("You cannot resolve a promise with itself");
                    }

                    function cannotReturnOwn() {
                        return new TypeError('A promises callback cannot return that same promise.');
                    }

                    function getThen(promise) {
                        try {
                            return promise.then;
                        } catch (error) {
                            GET_THEN_ERROR.error = error;
                            return GET_THEN_ERROR;
                        }
                    }

                    function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
                        try {
                            then.call(value, fulfillmentHandler, rejectionHandler);
                        } catch (e) {
                            return e;
                        }
                    }

                    function handleForeignThenable(promise, thenable, then) {
                        asap(function (promise) {
                            var sealed = false;
                            var error = tryThen(then, thenable, function (value) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;
                                if (thenable !== value) {
                                    _resolve(promise, value);
                                } else {
                                    fulfill(promise, value);
                                }
                            }, function (reason) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;

                                _reject(promise, reason);
                            }, 'Settle: ' + (promise._label || ' unknown promise'));

                            if (!sealed && error) {
                                sealed = true;
                                _reject(promise, error);
                            }
                        }, promise);
                    }

                    function handleOwnThenable(promise, thenable) {
                        if (thenable._state === FULFILLED) {
                            fulfill(promise, thenable._result);
                        } else if (thenable._state === REJECTED) {
                            _reject(promise, thenable._result);
                        } else {
                            subscribe(thenable, undefined, function (value) {
                                return _resolve(promise, value);
                            }, function (reason) {
                                return _reject(promise, reason);
                            });
                        }
                    }

                    function handleMaybeThenable(promise, maybeThenable, then$$) {
                        if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
                            handleOwnThenable(promise, maybeThenable);
                        } else {
                            if (then$$ === GET_THEN_ERROR) {
                                _reject(promise, GET_THEN_ERROR.error);
                                GET_THEN_ERROR.error = null;
                            } else if (then$$ === undefined) {
                                fulfill(promise, maybeThenable);
                            } else if (isFunction(then$$)) {
                                handleForeignThenable(promise, maybeThenable, then$$);
                            } else {
                                fulfill(promise, maybeThenable);
                            }
                        }
                    }

                    function _resolve(promise, value) {
                        if (promise === value) {
                            _reject(promise, selfFulfillment());
                        } else if (objectOrFunction(value)) {
                            handleMaybeThenable(promise, value, getThen(value));
                        } else {
                            fulfill(promise, value);
                        }
                    }

                    function publishRejection(promise) {
                        if (promise._onerror) {
                            promise._onerror(promise._result);
                        }

                        publish(promise);
                    }

                    function fulfill(promise, value) {
                        if (promise._state !== PENDING) {
                            return;
                        }

                        promise._result = value;
                        promise._state = FULFILLED;

                        if (promise._subscribers.length !== 0) {
                            asap(publish, promise);
                        }
                    }

                    function _reject(promise, reason) {
                        if (promise._state !== PENDING) {
                            return;
                        }
                        promise._state = REJECTED;
                        promise._result = reason;

                        asap(publishRejection, promise);
                    }

                    function subscribe(parent, child, onFulfillment, onRejection) {
                        var _subscribers = parent._subscribers;
                        var length = _subscribers.length;

                        parent._onerror = null;

                        _subscribers[length] = child;
                        _subscribers[length + FULFILLED] = onFulfillment;
                        _subscribers[length + REJECTED] = onRejection;

                        if (length === 0 && parent._state) {
                            asap(publish, parent);
                        }
                    }

                    function publish(promise) {
                        var subscribers = promise._subscribers;
                        var settled = promise._state;

                        if (subscribers.length === 0) {
                            return;
                        }

                        var child = undefined,
                            callback = undefined,
                            detail = promise._result;

                        for (var i = 0; i < subscribers.length; i += 3) {
                            child = subscribers[i];
                            callback = subscribers[i + settled];

                            if (child) {
                                invokeCallback(settled, child, callback, detail);
                            } else {
                                callback(detail);
                            }
                        }

                        promise._subscribers.length = 0;
                    }

                    function ErrorObject() {
                        this.error = null;
                    }

                    var TRY_CATCH_ERROR = new ErrorObject();

                    function tryCatch(callback, detail) {
                        try {
                            return callback(detail);
                        } catch (e) {
                            TRY_CATCH_ERROR.error = e;
                            return TRY_CATCH_ERROR;
                        }
                    }

                    function invokeCallback(settled, promise, callback, detail) {
                        var hasCallback = isFunction(callback),
                            value = undefined,
                            error = undefined,
                            succeeded = undefined,
                            failed = undefined;

                        if (hasCallback) {
                            value = tryCatch(callback, detail);

                            if (value === TRY_CATCH_ERROR) {
                                failed = true;
                                error = value.error;
                                value.error = null;
                            } else {
                                succeeded = true;
                            }

                            if (promise === value) {
                                _reject(promise, cannotReturnOwn());
                                return;
                            }
                        } else {
                            value = detail;
                            succeeded = true;
                        }

                        if (promise._state !== PENDING) {
                            // noop
                        } else if (hasCallback && succeeded) {
                            _resolve(promise, value);
                        } else if (failed) {
                            _reject(promise, error);
                        } else if (settled === FULFILLED) {
                            fulfill(promise, value);
                        } else if (settled === REJECTED) {
                            _reject(promise, value);
                        }
                    }

                    function initializePromise(promise, resolver) {
                        try {
                            resolver(function resolvePromise(value) {
                                _resolve(promise, value);
                            }, function rejectPromise(reason) {
                                _reject(promise, reason);
                            });
                        } catch (e) {
                            _reject(promise, e);
                        }
                    }

                    var id = 0;
                    function nextId() {
                        return id++;
                    }

                    function makePromise(promise) {
                        promise[PROMISE_ID] = id++;
                        promise._state = undefined;
                        promise._result = undefined;
                        promise._subscribers = [];
                    }

                    function Enumerator(Constructor, input) {
                        this._instanceConstructor = Constructor;
                        this.promise = new Constructor(noop);

                        if (!this.promise[PROMISE_ID]) {
                            makePromise(this.promise);
                        }

                        if (isArray(input)) {
                            this._input = input;
                            this.length = input.length;
                            this._remaining = input.length;

                            this._result = new Array(this.length);

                            if (this.length === 0) {
                                fulfill(this.promise, this._result);
                            } else {
                                this.length = this.length || 0;
                                this._enumerate();
                                if (this._remaining === 0) {
                                    fulfill(this.promise, this._result);
                                }
                            }
                        } else {
                            _reject(this.promise, validationError());
                        }
                    }

                    function validationError() {
                        return new Error('Array Methods must be provided an Array');
                    };

                    Enumerator.prototype._enumerate = function () {
                        var length = this.length;
                        var _input = this._input;

                        for (var i = 0; this._state === PENDING && i < length; i++) {
                            this._eachEntry(_input[i], i);
                        }
                    };

                    Enumerator.prototype._eachEntry = function (entry, i) {
                        var c = this._instanceConstructor;
                        var resolve$$ = c.resolve;

                        if (resolve$$ === resolve) {
                            var _then = getThen(entry);

                            if (_then === then && entry._state !== PENDING) {
                                this._settledAt(entry._state, i, entry._result);
                            } else if (typeof _then !== 'function') {
                                this._remaining--;
                                this._result[i] = entry;
                            } else if (c === Promise) {
                                var promise = new c(noop);
                                handleMaybeThenable(promise, entry, _then);
                                this._willSettleAt(promise, i);
                            } else {
                                this._willSettleAt(new c(function (resolve$$) {
                                    return resolve$$(entry);
                                }), i);
                            }
                        } else {
                            this._willSettleAt(resolve$$(entry), i);
                        }
                    };

                    Enumerator.prototype._settledAt = function (state, i, value) {
                        var promise = this.promise;

                        if (promise._state === PENDING) {
                            this._remaining--;

                            if (state === REJECTED) {
                                _reject(promise, value);
                            } else {
                                this._result[i] = value;
                            }
                        }

                        if (this._remaining === 0) {
                            fulfill(promise, this._result);
                        }
                    };

                    Enumerator.prototype._willSettleAt = function (promise, i) {
                        var enumerator = this;

                        subscribe(promise, undefined, function (value) {
                            return enumerator._settledAt(FULFILLED, i, value);
                        }, function (reason) {
                            return enumerator._settledAt(REJECTED, i, reason);
                        });
                    };

                    /**
                     `Promise.all` accepts an array of promises, and returns a new promise which
                     is fulfilled with an array of fulfillment values for the passed promises, or
                     rejected with the reason of the first passed promise to be rejected. It casts all
                     elements of the passed iterable to promises as it runs this algorithm.

                     Example:

                     ```javascript
                     let promise1 = resolve(1);
                     let promise2 = resolve(2);
                     let promise3 = resolve(3);
                     let promises = [ promise1, promise2, promise3 ];

                     Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
                     ```

                     If any of the `promises` given to `all` are rejected, the first promise
                     that is rejected will be given as an argument to the returned promises's
                     rejection handler. For example:

                     Example:

                     ```javascript
                     let promise1 = resolve(1);
                     let promise2 = reject(new Error("2"));
                     let promise3 = reject(new Error("3"));
                     let promises = [ promise1, promise2, promise3 ];

                     Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
                     ```

                     @method all
                     @static
                     @param {Array} entries array of promises
                     @param {String} label optional string for labeling the promise.
                     Useful for tooling.
                     @return {Promise} promise that is fulfilled when all `promises` have been
                     fulfilled, or rejected if any of them become rejected.
                     @static
                     */
                    function all(entries) {
                        return new Enumerator(this, entries).promise;
                    }

                    /**
                     `Promise.race` returns a new promise which is settled in the same way as the
                     first passed promise to settle.

                     Example:

                     ```javascript
                     let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

                     let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

                     Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
                     ```

                     `Promise.race` is deterministic in that only the state of the first
                     settled promise matters. For example, even if other promises given to the
                     `promises` array argument are resolved, but the first settled promise has
                     become rejected before the other promises became fulfilled, the returned
                     promise will become rejected:

                     ```javascript
                     let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

                     let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

                     Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
                     ```

                     An example real-world use case is implementing timeouts:

                     ```javascript
                     Promise.race([ajax('foo.json'), timeout(5000)])
                     ```

                     @method race
                     @static
                     @param {Array} promises array of promises to observe
                     Useful for tooling.
                     @return {Promise} a promise which settles in the same way as the first passed
                     promise to settle.
                     */
                    function race(entries) {
                        /*jshint validthis:true */
                        var Constructor = this;

                        if (!isArray(entries)) {
                            return new Constructor(function (_, reject) {
                                return reject(new TypeError('You must pass an array to race.'));
                            });
                        } else {
                            return new Constructor(function (resolve, reject) {
                                var length = entries.length;
                                for (var i = 0; i < length; i++) {
                                    Constructor.resolve(entries[i]).then(resolve, reject);
                                }
                            });
                        }
                    }

                    /**
                     `Promise.reject` returns a promise rejected with the passed `reason`.
                     It is shorthand for the following:

                     ```javascript
                     let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

                     promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
                     ```

                     Instead of writing the above, your code now simply becomes the following:

                     ```javascript
                     let promise = Promise.reject(new Error('WHOOPS'));

                     promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
                     ```

                     @method reject
                     @static
                     @param {Any} reason value that the returned promise will be rejected with.
                     Useful for tooling.
                     @return {Promise} a promise rejected with the given `reason`.
                     */
                    function reject(reason) {
                        /*jshint validthis:true */
                        var Constructor = this;
                        var promise = new Constructor(noop);
                        _reject(promise, reason);
                        return promise;
                    }

                    function needsResolver() {
                        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
                    }

                    function needsNew() {
                        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
                    }

                    /**
                     Promise objects represent the eventual result of an asynchronous operation. The
                     primary way of interacting with a promise is through its `then` method, which
                     registers callbacks to receive either a promise's eventual value or the reason
                     why the promise cannot be fulfilled.

                     Terminology
                     -----------

                     - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
                     - `thenable` is an object or function that defines a `then` method.
                     - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
                     - `exception` is a value that is thrown using the throw statement.
                     - `reason` is a value that indicates why a promise was rejected.
                     - `settled` the final resting state of a promise, fulfilled or rejected.

                     A promise can be in one of three states: pending, fulfilled, or rejected.

                     Promises that are fulfilled have a fulfillment value and are in the fulfilled
                     state.  Promises that are rejected have a rejection reason and are in the
                     rejected state.  A fulfillment value is never a thenable.

                     Promises can also be said to *resolve* a value.  If this value is also a
                     promise, then the original promise's settled state will match the value's
                     settled state.  So a promise that *resolves* a promise that rejects will
                     itself reject, and a promise that *resolves* a promise that fulfills will
                     itself fulfill.


                     Basic Usage:
                     ------------

                     ```js
                     let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

                     promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
                     ```

                     Advanced Usage:
                     ---------------

                     Promises shine when abstracting away asynchronous interactions such as
                     `XMLHttpRequest`s.

                     ```js
                     function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

                     getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
                     ```

                     Unlike callbacks, promises are great composable primitives.

                     ```js
                     Promise.all([
                     getJSON('/posts'),
                     getJSON('/comments')
                     ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
                     ```

                     @class Promise
                     @param {function} resolver
                     Useful for tooling.
                     @constructor
                     */
                    function Promise(resolver) {
                        this[PROMISE_ID] = nextId();
                        this._result = this._state = undefined;
                        this._subscribers = [];

                        if (noop !== resolver) {
                            typeof resolver !== 'function' && needsResolver();
                            this instanceof Promise ? initializePromise(this, resolver) : needsNew();
                        }
                    }

                    Promise.all = all;
                    Promise.race = race;
                    Promise.resolve = resolve;
                    Promise.reject = reject;
                    Promise._setScheduler = setScheduler;
                    Promise._setAsap = setAsap;
                    Promise._asap = asap;

                    Promise.prototype = {
                        constructor: Promise,

                        /**
                         The primary way of interacting with a promise is through its `then` method,
                         which registers callbacks to receive either a promise's eventual value or the
                         reason why the promise cannot be fulfilled.

                         ```js
                         findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
                         ```

                         Chaining
                         --------

                         The return value of `then` is itself a promise.  This second, 'downstream'
                         promise is resolved with the return value of the first promise's fulfillment
                         or rejection handler, or rejected if the handler throws an exception.

                         ```js
                         findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });

                         findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
                         ```
                         If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

                         ```js
                         findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
                         ```

                         Assimilation
                         ------------

                         Sometimes the value you want to propagate to a downstream promise can only be
                         retrieved asynchronously. This can be achieved by returning a promise in the
                         fulfillment or rejection handler. The downstream promise will then be pending
                         until the returned promise is settled. This is called *assimilation*.

                         ```js
                         findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
                         ```

                         If the assimliated promise rejects, then the downstream promise will also reject.

                         ```js
                         findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
                         ```

                         Simple Example
                         --------------

                         Synchronous Example

                         ```javascript
                         let result;

                         try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
                         ```

                         Errback Example

                         ```js
                         findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
                         ```

                         Promise Example;

                         ```javascript
                         findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
                         ```

                         Advanced Example
                         --------------

                         Synchronous Example

                         ```javascript
                         let author, books;

                         try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
                         ```

                         Errback Example

                         ```js

                         function foundBooks(books) {

    }

                         function failure(reason) {

    }

                         findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
                         ```

                         Promise Example;

                         ```javascript
                         findAuthor().
                         then(findBooksByAuthor).
                         then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
                         ```

                         @method then
                         @param {Function} onFulfilled
                         @param {Function} onRejected
                         Useful for tooling.
                         @return {Promise}
                         */
                        then: then,

                        /**
                         `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
                         as the catch block of a try/catch statement.

                         ```js
                         function findAuthor(){
      throw new Error('couldn't find that author');
    }

                         // synchronous
                         try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }

                         // async with promises
                         findAuthor().catch(function(reason){
      // something went wrong
    });
                         ```

                         @method catch
                         @param {Function} onRejection
                         Useful for tooling.
                         @return {Promise}
                         */
                        'catch': function _catch(onRejection) {
                            return this.then(null, onRejection);
                        }
                    };

                    function polyfill() {
                        var local = undefined;

                        if (typeof global !== 'undefined') {
                            local = global;
                        } else if (typeof self !== 'undefined') {
                            local = self;
                        } else {
                            try {
                                local = Function('return this')();
                            } catch (e) {
                                throw new Error('polyfill failed because global object is unavailable in this environment');
                            }
                        }

                        var P = local.Promise;

                        if (P) {
                            var promiseToString = null;
                            try {
                                promiseToString = Object.prototype.toString.call(P.resolve());
                            } catch (e) {
                                // silently ignored
                            }

                            if (promiseToString === '[object Promise]' && !P.cast) {
                                return;
                            }
                        }

                        local.Promise = Promise;
                    }

// Strange compat..
                    Promise.polyfill = polyfill;
                    Promise.Promise = Promise;

                    return Promise;

                })));
//# sourceMappingURL=es6-promise.map

                /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(8)))

            /***/ }),
        /* 5 */
        /***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

            /***/ }),
        /* 6 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global VERSION */

            __webpack_require__(5);

            var _es6Promise = __webpack_require__(4);

            var _es6Promise2 = _interopRequireDefault(_es6Promise);

            var _utils = __webpack_require__(0);

            var Utils = _interopRequireWildcard(_utils);

            var _api = __webpack_require__(1);

            var API = _interopRequireWildcard(_api);

            var _button = __webpack_require__(2);

            var _push = __webpack_require__(3);

            function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var Noty = function () {
                /**
                 * @param {object} options
                 * @return {Noty}
                 */
                function Noty() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    _classCallCheck(this, Noty);

                    this.options = Utils.deepExtend({}, API.Defaults, options);
                    this.id = this.options.id || Utils.generateID('bar');
                    this.closeTimer = -1;
                    this.barDom = null;
                    this.layoutDom = null;
                    this.progressDom = null;
                    this.showing = false;
                    this.shown = false;
                    this.closed = false;
                    this.closing = false;
                    this.killable = this.options.timeout || this.options.closeWith.length > 0;
                    this.hasSound = this.options.sounds.sources.length > 0;
                    this.soundPlayed = false;
                    this.listeners = {
                        beforeShow: [],
                        onShow: [],
                        afterShow: [],
                        onClose: [],
                        afterClose: [],
                        onClick: [],
                        onHover: [],
                        onTemplate: []
                    };
                    this.promises = {
                        show: null,
                        close: null
                    };
                    this.on('beforeShow', this.options.callbacks.beforeShow);
                    this.on('onShow', this.options.callbacks.onShow);
                    this.on('afterShow', this.options.callbacks.afterShow);
                    this.on('onClose', this.options.callbacks.onClose);
                    this.on('afterClose', this.options.callbacks.afterClose);
                    this.on('onClick', this.options.callbacks.onClick);
                    this.on('onHover', this.options.callbacks.onHover);
                    this.on('onTemplate', this.options.callbacks.onTemplate);

                    return this;
                }

                /**
                 * @param {string} eventName
                 * @param {function} cb
                 * @return {Noty}
                 */


                _createClass(Noty, [{
                    key: 'on',
                    value: function on(eventName) {
                        var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

                        if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
                            this.listeners[eventName].push(cb);
                        }

                        return this;
                    }

                    /**
                     * @return {Noty}
                     */

                }, {
                    key: 'show',
                    value: function show() {
                        var _this = this;

                        if (this.options.killer === true) {
                            Noty.closeAll();
                        } else if (typeof this.options.killer === 'string') {
                            Noty.closeAll(this.options.killer);
                        }

                        var queueCounts = API.getQueueCounts(this.options.queue);

                        if (queueCounts.current >= queueCounts.maxVisible || API.PageHidden && this.options.visibilityControl) {
                            API.addToQueue(this);

                            if (API.PageHidden && this.hasSound && Utils.inArray('docHidden', this.options.sounds.conditions)) {
                                Utils.createAudioElements(this);
                            }

                            if (API.PageHidden && Utils.inArray('docHidden', this.options.titleCount.conditions)) {
                                API.docTitle.increment();
                            }

                            return this;
                        }

                        API.Store[this.id] = this;

                        API.fire(this, 'beforeShow');

                        this.showing = true;

                        if (this.closing) {
                            this.showing = false;
                            return this;
                        }

                        API.build(this);
                        API.handleModal(this);

                        if (this.options.force) {
                            this.layoutDom.insertBefore(this.barDom, this.layoutDom.firstChild);
                        } else {
                            this.layoutDom.appendChild(this.barDom);
                        }

                        if (this.hasSound && !this.soundPlayed && Utils.inArray('docVisible', this.options.sounds.conditions)) {
                            Utils.createAudioElements(this);
                        }

                        if (Utils.inArray('docVisible', this.options.titleCount.conditions)) {
                            API.docTitle.increment();
                        }

                        this.shown = true;
                        this.closed = false;

                        // bind button events if any
                        if (API.hasButtons(this)) {
                            Object.keys(this.options.buttons).forEach(function (key) {
                                var btn = _this.barDom.querySelector('#' + _this.options.buttons[key].id);
                                Utils.addListener(btn, 'click', function (e) {
                                    Utils.stopPropagation(e);
                                    _this.options.buttons[key].cb();
                                });
                            });
                        }

                        this.progressDom = this.barDom.querySelector('.noty_progressbar');

                        if (Utils.inArray('click', this.options.closeWith)) {
                            Utils.addClass(this.barDom, 'noty_close_with_click');
                            Utils.addListener(this.barDom, 'click', function (e) {
                                Utils.stopPropagation(e);
                                API.fire(_this, 'onClick');
                                _this.close();
                            }, false);
                        }

                        Utils.addListener(this.barDom, 'mouseenter', function () {
                            API.fire(_this, 'onHover');
                        }, false);

                        if (this.options.timeout) Utils.addClass(this.barDom, 'noty_has_timeout');
                        if (this.options.progressBar) {
                            Utils.addClass(this.barDom, 'noty_has_progressbar');
                        }

                        if (Utils.inArray('button', this.options.closeWith)) {
                            Utils.addClass(this.barDom, 'noty_close_with_button');

                            var closeButton = document.createElement('div');
                            Utils.addClass(closeButton, 'noty_close_button');
                            closeButton.innerHTML = '×';
                            this.barDom.appendChild(closeButton);

                            Utils.addListener(closeButton, 'click', function (e) {
                                Utils.stopPropagation(e);
                                _this.close();
                            }, false);
                        }

                        API.fire(this, 'onShow');

                        if (this.options.animation.open === null) {
                            this.promises.show = new _es6Promise2.default(function (resolve) {
                                resolve();
                            });
                        } else if (typeof this.options.animation.open === 'function') {
                            this.promises.show = new _es6Promise2.default(this.options.animation.open.bind(this));
                        } else {
                            Utils.addClass(this.barDom, this.options.animation.open);
                            this.promises.show = new _es6Promise2.default(function (resolve) {
                                Utils.addListener(_this.barDom, Utils.animationEndEvents, function () {
                                    Utils.removeClass(_this.barDom, _this.options.animation.open);
                                    resolve();
                                });
                            });
                        }

                        this.promises.show.then(function () {
                            var _t = _this;
                            setTimeout(function () {
                                API.openFlow(_t);
                            }, 100);
                        });

                        return this;
                    }

                    /**
                     * @return {Noty}
                     */

                }, {
                    key: 'stop',
                    value: function stop() {
                        API.dequeueClose(this);
                        return this;
                    }

                    /**
                     * @return {Noty}
                     */

                }, {
                    key: 'resume',
                    value: function resume() {
                        API.queueClose(this);
                        return this;
                    }

                    /**
                     * @param {int|boolean} ms
                     * @return {Noty}
                     */

                }, {
                    key: 'setTimeout',
                    value: function (_setTimeout) {
                        function setTimeout(_x) {
                            return _setTimeout.apply(this, arguments);
                        }

                        setTimeout.toString = function () {
                            return _setTimeout.toString();
                        };

                        return setTimeout;
                    }(function (ms) {
                        this.stop();
                        this.options.timeout = ms;

                        if (this.barDom) {
                            if (this.options.timeout) {
                                Utils.addClass(this.barDom, 'noty_has_timeout');
                            } else {
                                Utils.removeClass(this.barDom, 'noty_has_timeout');
                            }

                            var _t = this;
                            setTimeout(function () {
                                // ugly fix for progressbar display bug
                                _t.resume();
                            }, 100);
                        }

                        return this;
                    })

                    /**
                     * @param {string} html
                     * @param {boolean} optionsOverride
                     * @return {Noty}
                     */

                }, {
                    key: 'setText',
                    value: function setText(html) {
                        var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                        if (this.barDom) {
                            this.barDom.querySelector('.noty_body').innerHTML = html;
                        }

                        if (optionsOverride) this.options.text = html;

                        return this;
                    }

                    /**
                     * @param {string} type
                     * @param {boolean} optionsOverride
                     * @return {Noty}
                     */

                }, {
                    key: 'setType',
                    value: function setType(type) {
                        var _this2 = this;

                        var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                        if (this.barDom) {
                            var classList = Utils.classList(this.barDom).split(' ');

                            classList.forEach(function (c) {
                                if (c.substring(0, 11) === 'noty_type__') {
                                    Utils.removeClass(_this2.barDom, c);
                                }
                            });

                            Utils.addClass(this.barDom, 'noty_type__' + type);
                        }

                        if (optionsOverride) this.options.type = type;

                        return this;
                    }

                    /**
                     * @param {string} theme
                     * @param {boolean} optionsOverride
                     * @return {Noty}
                     */

                }, {
                    key: 'setTheme',
                    value: function setTheme(theme) {
                        var _this3 = this;

                        var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                        if (this.barDom) {
                            var classList = Utils.classList(this.barDom).split(' ');

                            classList.forEach(function (c) {
                                if (c.substring(0, 12) === 'noty_theme__') {
                                    Utils.removeClass(_this3.barDom, c);
                                }
                            });

                            Utils.addClass(this.barDom, 'noty_theme__' + theme);
                        }

                        if (optionsOverride) this.options.theme = theme;

                        return this;
                    }

                    /**
                     * @return {Noty}
                     */

                }, {
                    key: 'close',
                    value: function close() {
                        var _this4 = this;

                        if (this.closed) return this;

                        if (!this.shown) {
                            // it's in the queue
                            API.removeFromQueue(this);
                            return this;
                        }

                        API.fire(this, 'onClose');

                        this.closing = true;

                        if (this.options.animation.close === null) {
                            this.promises.close = new _es6Promise2.default(function (resolve) {
                                resolve();
                            });
                        } else if (typeof this.options.animation.close === 'function') {
                            this.promises.close = new _es6Promise2.default(this.options.animation.close.bind(this));
                        } else {
                            Utils.addClass(this.barDom, this.options.animation.close);
                            this.promises.close = new _es6Promise2.default(function (resolve) {
                                Utils.addListener(_this4.barDom, Utils.animationEndEvents, function () {
                                    if (_this4.options.force) {
                                        Utils.remove(_this4.barDom);
                                    } else {
                                        API.ghostFix(_this4);
                                    }
                                    resolve();
                                });
                            });
                        }

                        this.promises.close.then(function () {
                            API.closeFlow(_this4);
                            API.handleModalClose(_this4);
                        });

                        this.closed = true;

                        return this;
                    }

                    // API functions

                    /**
                     * @param {boolean|string} queueName
                     * @return {Noty}
                     */

                }], [{
                    key: 'closeAll',
                    value: function closeAll() {
                        var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                        Object.keys(API.Store).forEach(function (id) {
                            if (queueName) {
                                if (API.Store[id].options.queue === queueName && API.Store[id].killable) {
                                    API.Store[id].close();
                                }
                            } else if (API.Store[id].killable) {
                                API.Store[id].close();
                            }
                        });
                        return this;
                    }

                    /**
                     * @param {Object} obj
                     * @return {Noty}
                     */

                }, {
                    key: 'overrideDefaults',
                    value: function overrideDefaults(obj) {
                        API.Defaults = Utils.deepExtend({}, API.Defaults, obj);
                        return this;
                    }

                    /**
                     * @param {int} amount
                     * @param {string} queueName
                     * @return {Noty}
                     */

                }, {
                    key: 'setMaxVisible',
                    value: function setMaxVisible() {
                        var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API.DefaultMaxVisible;
                        var queueName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'global';

                        if (!API.Queues.hasOwnProperty(queueName)) {
                            API.Queues[queueName] = { maxVisible: amount, queue: [] };
                        }

                        API.Queues[queueName].maxVisible = amount;
                        return this;
                    }

                    /**
                     * @param {string} innerHtml
                     * @param {String} classes
                     * @param {Function} cb
                     * @param {Object} attributes
                     * @return {NotyButton}
                     */

                }, {
                    key: 'button',
                    value: function button(innerHtml) {
                        var classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                        var cb = arguments[2];
                        var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

                        return new _button.NotyButton(innerHtml, classes, cb, attributes);
                    }

                    /**
                     * @return {string}
                     */

                }, {
                    key: 'version',
                    value: function version() {
                        return "3.1.1";
                    }

                    /**
                     * @param {String} workerPath
                     * @return {Push}
                     */

                }, {
                    key: 'Push',
                    value: function Push(workerPath) {
                        return new _push.Push(workerPath);
                    }
                }]);

                return Noty;
            }();

// Document visibility change controller


            exports.default = Noty;
            Utils.visibilityChangeFlow();
            module.exports = exports['default'];

            /***/ }),
        /* 7 */
        /***/ (function(module, exports) {

// shim for using process in browser
            var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

            var cachedSetTimeout;
            var cachedClearTimeout;

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            (function () {
                try {
                    if (typeof setTimeout === 'function') {
                        cachedSetTimeout = setTimeout;
                    } else {
                        cachedSetTimeout = defaultSetTimout;
                    }
                } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                }
                try {
                    if (typeof clearTimeout === 'function') {
                        cachedClearTimeout = clearTimeout;
                    } else {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } ())
            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }

            process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };

// v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            process.title = 'browser';
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = ''; // empty string to avoid regexp issues
            process.versions = {};

            function noop() {}

            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;

            process.binding = function (name) {
                throw new Error('process.binding is not supported');
            };

            process.cwd = function () { return '/' };
            process.chdir = function (dir) {
                throw new Error('process.chdir is not supported');
            };
            process.umask = function() { return 0; };


            /***/ }),
        /* 8 */
        /***/ (function(module, exports) {

            var g;

// This works in non-strict mode
            g = (function() {
                return this;
            })();

            try {
                // This works if eval is allowed (see CSP)
                g = g || Function("return this")() || (1,eval)("this");
            } catch(e) {
                // This works if the window reference is available
                if(typeof window === "object")
                    g = window;
            }

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

            module.exports = g;


            /***/ }),
        /* 9 */
        /***/ (function(module, exports) {

            /* (ignored) */

            /***/ })
        /******/ ]);
});
//# sourceMappingURL=noty.js.map

(function webpackUniversalModuleDefinition(root, factory) {
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define([], factory);
    else if(typeof exports === 'object')
        exports["soda"] = factory();
    else
        root["soda"] = factory();
})(this, function() {
    return /******/ (function(modules) { // webpackBootstrap
        /******/ 	// The module cache
        /******/ 	var installedModules = {};
        /******/
        /******/ 	// The require function
        /******/ 	function __webpack_require__(moduleId) {
            /******/
            /******/ 		// Check if module is in cache
            /******/ 		if(installedModules[moduleId]) {
                /******/ 			return installedModules[moduleId].exports;
                /******/ 		}
            /******/ 		// Create a new module (and put it into the cache)
            /******/ 		var module = installedModules[moduleId] = {
                /******/ 			i: moduleId,
                /******/ 			l: false,
                /******/ 			exports: {}
                /******/ 		};
            /******/
            /******/ 		// Execute the module function
            /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ 		// Flag the module as loaded
            /******/ 		module.l = true;
            /******/
            /******/ 		// Return the exports of the module
            /******/ 		return module.exports;
            /******/ 	}
        /******/
        /******/
        /******/ 	// expose the modules object (__webpack_modules__)
        /******/ 	__webpack_require__.m = modules;
        /******/
        /******/ 	// expose the module cache
        /******/ 	__webpack_require__.c = installedModules;
        /******/
        /******/ 	// define getter function for harmony exports
        /******/ 	__webpack_require__.d = function(exports, name, getter) {
            /******/ 		if(!__webpack_require__.o(exports, name)) {
                /******/ 			Object.defineProperty(exports, name, {
                    /******/ 				configurable: false,
                    /******/ 				enumerable: true,
                    /******/ 				get: getter
                    /******/ 			});
                /******/ 		}
            /******/ 	};
        /******/
        /******/ 	// getDefaultExport function for compatibility with non-harmony modules
        /******/ 	__webpack_require__.n = function(module) {
            /******/ 		var getter = module && module.__esModule ?
                /******/ 			function getDefault() { return module['default']; } :
                /******/ 			function getModuleExports() { return module; };
            /******/ 		__webpack_require__.d(getter, 'a', getter);
            /******/ 		return getter;
            /******/ 	};
        /******/
        /******/ 	// Object.prototype.hasOwnProperty.call
        /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
        /******/
        /******/ 	// __webpack_public_path__
        /******/ 	__webpack_require__.p = "";
        /******/
        /******/ 	// Load entry module and return exports
        /******/ 	return __webpack_require__(__webpack_require__.s = 3);
        /******/ })
    /************************************************************************/
    /******/ ([
        /* 0 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            var _const = __webpack_require__(1);

            var _util = __webpack_require__(2);

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var doc = typeof document !== 'undefined' ? document : {};

            var Soda = function () {
                function Soda() {
                    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'soda-';

                    _classCallCheck(this, Soda);

                    this._prefix = prefix;
                }

                _createClass(Soda, [{
                    key: 'setDocument',
                    value: function setDocument(_doc) {
                        doc = _doc;
                    }
                }, {
                    key: 'run',
                    value: function run(str, data) {
                        var _this = this;

                        // 解析模板DOM
                        var div = doc.createElement("div");

                        // 必须加入到body中去，不然自定义标签不生效
                        if (doc.documentMode < 9) {
                            div.style.display = 'none';
                            doc.body.appendChild(div);
                        }

                        div.innerHTML = str;

                        (0, _util.nodes2Arr)(div.childNodes).map(function (child) {
                            _this.compileNode(child, data);
                        });

                        var innerHTML = div.innerHTML;

                        if (doc.documentMode < 9) {
                            doc.body.removeChild(div);
                        }

                        return innerHTML;
                    }
                }, {
                    key: 'prefix',
                    value: function prefix(_prefix) {
                        this._prefix = _prefix;
                    }
                }, {
                    key: '_getPrefixReg',
                    value: function _getPrefixReg() {
                        return new RegExp('^' + this._prefix);
                    }
                }, {
                    key: '_getPrefixedDirectiveMap',
                    value: function _getPrefixedDirectiveMap() {
                        var _this2 = this;

                        var map = {};
                        Soda.sodaDirectives.map(function (item) {
                            var prefixedName = _this2._prefix + item.name;

                            map[prefixedName] = item;
                        });

                        return map;
                    }
                }, {
                    key: '_removeSodaMark',
                    value: function _removeSodaMark(node, name) {
                        node.removeAttribute(name);
                    }
                }, {
                    key: 'compileNode',
                    value: function compileNode(node, scope) {
                        var _this3 = this;

                        var prefixReg = this._getPrefixReg();

                        var sodaDirectives = Soda.sodaDirectives;


                        var prefixedDirectiveMap = this._getPrefixedDirectiveMap();

                        var compile = function compile(node, scope) {

                            // 如果只是文本
                            // parseTextNode
                            if (node.nodeType === (node.TEXT_NODE || 3)) {
                                node.nodeValue = node.nodeValue.replace(_const.VALUE_OUT_REG, function (item, $1) {
                                    var value = _this3.parseSodaExpression($1, scope);
                                    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object") {
                                        value = JSON.stringify(value, null, 2);
                                    }
                                    return value;
                                });
                            }

                            // parse Attributes
                            if (node.attributes && node.attributes.length) {

                                // 指令优先处理
                                sodaDirectives.map(function (item) {
                                    var name = item.name,
                                        opt = item.opt;


                                    var prefixedName = _this3._prefix + name;

                                    // 这里移除了对parentNode的判断
                                    // 允许使用无值的指令
                                    if ((0, _util.exist)(node.getAttribute(prefixedName))) {
                                        var expression = node.getAttribute(prefixedName);

                                        opt.link.bind(_this3)({
                                            expression: expression,
                                            scope: scope,
                                            el: node,
                                            parseSodaExpression: _this3.parseSodaExpression.bind(_this3),
                                            getValue: _this3.getValue.bind(_this3),
                                            compileNode: _this3.compileNode.bind(_this3),
                                            document: doc
                                        });

                                        // 移除标签
                                        _this3._removeSodaMark(node, prefixedName);
                                    }
                                });

                                // 处理输出 包含 prefix-*
                                (0, _util.nodes2Arr)(node.attributes)
                                // 过滤掉指令里包含的属性
                                    .filter(function (attr) {
                                        return !prefixedDirectiveMap[attr.name];
                                    }).map(function (attr) {
                                    if (prefixReg.test(attr.name)) {
                                        var attrName = attr.name.replace(prefixReg, '');

                                        if (attrName && (0, _util.exist)(attr.value)) {
                                            var attrValue = attr.value.replace(_const.VALUE_OUT_REG, function (item, $1) {
                                                return _this3.parseSodaExpression($1, scope);
                                            });

                                            if ((0, _util.exist)(attrValue)) {
                                                node.setAttribute(attrName, attrValue);
                                            }

                                            _this3._removeSodaMark(node, attr.name);
                                        }

                                        // 对其他属性里含expr 处理
                                    } else {
                                        if ((0, _util.exist)(attr.value)) {
                                            attr.value = attr.value.replace(_const.VALUE_OUT_REG, function (item, $1) {
                                                return _this3.parseSodaExpression($1, scope);
                                            });
                                        }
                                    }
                                });
                            }

                            // parse childNodes
                            (0, _util.nodes2Arr)(node.childNodes).map(function (child) {
                                compile(child, scope);
                            });
                        };

                        compile(node, scope);
                    }
                }, {
                    key: 'getEvalFunc',
                    value: function getEvalFunc(expr) {
                        var evalFunc = new Function("getValue", "sodaFilterMap", "return function sodaExp(scope){ return " + expr + "}")(this.getValue, Soda.sodaFilterMap);

                        return evalFunc;
                    }
                }, {
                    key: 'getValue',
                    value: function getValue(_data, _attrStr) {
                        _const.CONST_REGG.lastIndex = 0;
                        var realAttrStr = _attrStr.replace(_const.CONST_REGG, function (r) {
                            if (typeof _data[r] === "undefined") {
                                return r;
                            } else {
                                return _data[r];
                            }
                        });

                        if (_attrStr === 'true') {
                            return true;
                        }

                        if (_attrStr === 'false') {
                            return false;
                        }

                        var _getValue = function _getValue(data, attrStr) {
                            var dotIndex = attrStr.indexOf(".");

                            if (dotIndex > -1) {
                                var attr = attrStr.substr(0, dotIndex);
                                attrStr = attrStr.substr(dotIndex + 1);

                                // 检查attrStr是否属于变量并转换
                                if (typeof _data[attr] !== "undefined" && _const.CONST_REG.test(attr)) {
                                    attr = _data[attr];
                                }

                                if (typeof data[attr] !== "undefined" && data[attr] !== null) {
                                    return _getValue(data[attr], attrStr);
                                } else {
                                    var eventData = {
                                        name: realAttrStr,
                                        data: _data
                                    };

                                    // 如果还有
                                    return "";
                                }
                            } else {
                                attrStr = attrStr.trim();

                                // 检查attrStr是否属于变量并转换
                                if (typeof _data[attrStr] !== "undefined" && _const.CONST_REG.test(attrStr)) {
                                    attrStr = _data[attrStr];
                                }

                                var rValue;
                                if (typeof data[attrStr] !== "undefined") {
                                    rValue = data[attrStr];
                                } else {
                                    var eventData = {
                                        name: realAttrStr,
                                        data: _data
                                    };

                                    rValue = "";
                                }

                                return rValue;
                            }
                        };

                        return _getValue(_data, _attrStr);
                    }
                }, {
                    key: 'parseSodaExpression',
                    value: function parseSodaExpression(str, scope) {
                        var _this4 = this;

                        // 将字符常量保存下来
                        str = str.replace(_const.STRING_REG, function (r, $1, $2) {
                            var key = (0, _util.getRandom)();
                            scope[key] = $1 || $2;
                            return key;
                        });

                        // 对filter进行处理
                        str = str.replace(_const.OR_REG, _const.OR_REPLACE).split("|");

                        for (var i = 0; i < str.length; i++) {
                            str[i] = (str[i].replace(new RegExp(_const.OR_REPLACE, 'g'), "||") || '').trim();
                        }

                        var expr = str[0] || "";
                        var filters = str.slice(1);

                        while (_const.ATTR_REG_NG.test(expr)) {
                            _const.ATTR_REG.lastIndex = 0;

                            //对expr预处理
                            expr = expr.replace(_const.ATTR_REG, function (r, $1) {
                                var key = (0, _util.getAttrVarKey)();
                                // 属性名称为字符常量
                                var attrName = _this4.parseSodaExpression($1, scope);

                                // 给一个特殊的前缀 表示是属性变量

                                scope[key] = attrName;

                                return "." + key;
                            });
                        }

                        expr = expr.replace(_const.OBJECT_REG, function (value) {
                            return "getValue(scope,'" + value.trim() + "')";
                        });

                        expr = this.parseFilter(filters, expr);

                        return this.getEvalFunc(expr)(scope);
                    }
                }, {
                    key: 'parseFilter',
                    value: function parseFilter(filters, expr) {
                        var sodaFilterMap = Soda.sodaFilterMap;


                        var parse = function parse() {
                            var filterExpr = filters.shift();

                            if (!filterExpr) {
                                return;
                            }

                            var filterExpr = filterExpr.split(":");
                            var args = filterExpr.slice(1) || [];
                            var name = (filterExpr[0] || "").trim();

                            for (var i = 0; i < args.length; i++) {
                                //这里根据类型进行判断
                                if (_const.OBJECT_REG_NG.test(args[i])) {
                                    args[i] = "getValue(scope,'" + args[i] + "')";
                                } else {}
                            }

                            if (sodaFilterMap[name]) {
                                args.unshift(expr);

                                args = args.join(",");

                                expr = "sodaFilterMap['" + name + "'](" + args + ")";
                            }

                            parse();
                        };

                        parse();

                        return expr;
                    }
                }], [{
                    key: 'filter',
                    value: function filter(name, func) {
                        this.sodaFilterMap[name] = func;
                    }
                }, {
                    key: 'getFilter',
                    value: function getFilter(name) {
                        return this.sodaFilterMap[name];
                    }
                }, {
                    key: 'directive',
                    value: function directive(name, opt) {
                        // 按照顺序入
                        var _opt$priority = opt.priority,
                            priority = _opt$priority === undefined ? 0 : _opt$priority;

                        var i = void 0;

                        for (i = 0; i < this.sodaDirectives.length; i++) {
                            var item = this.sodaDirectives[i];
                            var _item$opt$priority = item.opt.priority,
                                itemPriority = _item$opt$priority === undefined ? 0 : _item$opt$priority;

                            // 比他小 继续比下一个

                            if (priority < itemPriority) {

                                // 发现比它大或者相等 就插大他前面
                            } else if (priority >= itemPriority) {
                                break;
                            }
                        }

                        this.sodaDirectives.splice(i, 0, {
                            name: name,
                            opt: opt
                        });
                    }
                }, {
                    key: 'discribe',
                    value: function discribe(name, funcOrStr) {
                        var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { compile: true };


                        this.template[name] = {
                            funcOrStr: funcOrStr,
                            option: option
                        };
                    }
                }, {
                    key: 'getTmpl',
                    value: function getTmpl(name, args) {
                        var template = this.template[name];
                        var funcOrStr = template.funcOrStr,
                            _template$option = template.option,
                            option = _template$option === undefined ? {} : _template$option;


                        var result = void 0;

                        if (typeof funcOrStr === 'function') {
                            result = funcOrStr.apply(null, args);
                        } else {
                            result = funcOrStr;
                        }

                        return {
                            template: result,
                            option: option
                        };
                    }
                }]);

                return Soda;
            }();

            Soda.sodaDirectives = [];
            Soda.sodaFilterMap = {};
            Soda.template = {};
            exports["default"] = Soda;

            /***/ }),
        /* 1 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });
// 标识符
            var IDENTOR_REG = exports.IDENTOR_REG = /[a-zA-Z_\$]+[\w\$]*/g;
            var STRING_REG = exports.STRING_REG = /"([^"]*)"|'([^']*)'/g;
            var NUMBER_REG = exports.NUMBER_REG = /\d+|\d*\.\d+/g;

            var OBJECT_REG = exports.OBJECT_REG = /[a-zA-Z_\$]+[\w\$]*(?:\s*\.\s*(?:[a-zA-Z_\$]+[\w\$]*|\d+))*/g;

// 非global 做test用
            var OBJECT_REG_NG = exports.OBJECT_REG_NG = /[a-zA-Z_\$]+[\w\$]*(?:\s*\.\s*(?:[a-zA-Z_\$]+[\w\$]*|\d+))*/;

            var ATTR_REG = exports.ATTR_REG = /\[([^\[\]]*)\]/g;
            var ATTR_REG_NG = exports.ATTR_REG_NG = /\[([^\[\]]*)\]/;
            var ATTR_REG_DOT = exports.ATTR_REG_DOT = /\.([a-zA-Z_\$]+[\w\$]*)/g;

            var NOT_ATTR_REG = exports.NOT_ATTR_REG = /[^\.|]([a-zA-Z_\$]+[\w\$]*)/g;

            var OR_REG = exports.OR_REG = /\|\|/g;

            var OR_REPLACE = exports.OR_REPLACE = "OR_OPERATOR\x1E";

            var CONST_PRIFIX = exports.CONST_PRIFIX = "_$C$_";
            var CONST_REG = exports.CONST_REG = /^_\$C\$_/;
            var CONST_REGG = exports.CONST_REGG = /_\$C\$_[^\.]+/g;
            var VALUE_OUT_REG = exports.VALUE_OUT_REG = /\{\{([^\}]*)\}\}/g;

            /***/ }),
        /* 2 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.assign = exports.nodes2Arr = exports.exist = exports.getRandom = exports.getAttrVarKey = undefined;

            var _const = __webpack_require__(1);

            var getAttrVarKey = exports.getAttrVarKey = function getAttrVarKey() {
                return _const.CONST_PRIFIX + ~~(Math.random() * 1E6);
            };

            var getRandom = exports.getRandom = function getRandom() {
                return "$$" + ~~(Math.random() * 1E6);
            };

            var exist = exports.exist = function exist(value) {
                return value !== null && value !== undefined && value !== "" && typeof value !== 'undefined';
            };

            var nodes2Arr = exports.nodes2Arr = function nodes2Arr(nodes) {
                var arr = [];

                for (var i = 0; i < nodes.length; i++) {
                    arr.push(nodes[i]);
                }

                return arr;
            };

            var getOwnPropertySymbols = Object.getOwnPropertySymbols;
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var propIsEnumerable = Object.prototype.propertyIsEnumerable;

            var toObject = function toObject(val) {
                if (val === null || val === undefined) {
                    throw new TypeError('Object.assign cannot be called with null or undefined');
                }

                return Object(val);
            };

            var assign = exports.assign = Object.assign || function (target, source) {
                    var from;
                    var to = toObject(target);
                    var symbols;

                    for (var s = 1; s < arguments.length; s++) {
                        from = Object(arguments[s]);

                        for (var key in from) {
                            if (hasOwnProperty.call(from, key)) {
                                to[key] = from[key];
                            }
                        }

                        if (getOwnPropertySymbols) {
                            symbols = getOwnPropertySymbols(from);
                            for (var i = 0; i < symbols.length; i++) {
                                if (propIsEnumerable.call(from, symbols[i])) {
                                    to[symbols[i]] = from[symbols[i]];
                                }
                            }
                        }
                    }

                    return to;
                };

            /***/ }),
        /* 3 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            var _util = __webpack_require__(2);

            __webpack_require__(4);

            __webpack_require__(5);

            __webpack_require__(6);

            __webpack_require__(7);

            __webpack_require__(8);

            __webpack_require__(9);

            __webpack_require__(10);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            var sodaInstance = new _soda2["default"]();

            var init = function init(str, data) {
                return sodaInstance.run(str, data);
            };

            var mock = {
                prefix: function prefix(_prefix) {
                    sodaInstance.prefix(_prefix);
                },
                filter: function filter(name, func) {
                    _soda2["default"].filter(name, func);
                },
                directive: function directive(name, opt) {
                    _soda2["default"].directive(name, opt);
                },
                setDocument: function setDocument(document) {
                    sodaInstance.setDocument(document);
                },
                discribe: function discribe(name, str, option) {
                    _soda2["default"].discribe(name, str, option);
                },


                Soda: _soda2["default"]
            };

            var soda = (0, _util.assign)(init, mock);

            module.exports = soda;

            /***/ }),
        /* 4 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('repeat', {
                priority: 10,
                link: function link(_ref) {
                    var _this = this;

                    var scope = _ref.scope,
                        el = _ref.el,
                        expression = _ref.expression,
                        getValue = _ref.getValue,
                        parseSodaExpression = _ref.parseSodaExpression,
                        compileNode = _ref.compileNode;

                    var itemName;
                    var valueName;

                    var trackReg = /\s+by\s+([^\s]+)$/;

                    var trackName;
                    var opt = expression.replace(trackReg, function (item, $1) {
                        if ($1) {
                            trackName = ($1 || '').trim();
                        }

                        return '';
                    });

                    var inReg = /([^\s]+)\s+in\s+([^\s]+)|\(([^,]+)\s*,\s*([^)]+)\)\s+in\s+([^\s]+)/;

                    var r = inReg.exec(opt);
                    if (r) {
                        if (r[1] && r[2]) {
                            itemName = (r[1] || '').trim();
                            valueName = (r[2] || '').trim();

                            if (!(itemName && valueName)) {
                                return;
                            }
                        } else if (r[3] && r[4] && r[5]) {
                            trackName = (r[3] || '').trim();
                            itemName = (r[4] || '').trim();
                            valueName = (r[5] || '').trim();
                        }
                    } else {
                        return;
                    }

                    trackName = trackName || '$index';

                    // 这里要处理一下
                    var repeatObj = getValue(scope, valueName) || [];

                    var repeatFunc = function repeatFunc(i) {
                        var itemNode = el.cloneNode(true);

                        // 这里创建一个新的scope
                        var itemScope = Object.create(scope);
                        itemScope[trackName] = i;

                        itemScope[itemName] = repeatObj[i];

                        //itemScope.__proto__ = scope;

                        // REMOVE cjd6568358
                        itemNode.removeAttribute(_this._prefix + 'repeat');

                        el.parentNode.insertBefore(itemNode, el);

                        // 这里是新加的dom, 要单独编译
                        compileNode(itemNode, itemScope);
                    };

                    if ('length' in repeatObj) {
                        for (var i = 0; i < repeatObj.length; i++) {
                            repeatFunc(i);
                        }
                    } else {
                        for (var i in repeatObj) {
                            if (repeatObj.hasOwnProperty(i)) {
                                repeatFunc(i);
                            }
                        }
                    }

                    // el 清理
                    el.parentNode.removeChild(el);

                    if (el.childNodes && el.childNodes.length) {
                        el.innerHTML = '';
                    }
                }
            });

            /***/ }),
        /* 5 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('if', {
                priority: 9,
                link: function link(_ref) {
                    var expression = _ref.expression,
                        parseSodaExpression = _ref.parseSodaExpression,
                        scope = _ref.scope,
                        el = _ref.el;

                    var expressFunc = parseSodaExpression(expression, scope);

                    if (expressFunc) {} else {
                        el.parentNode && el.parentNode.removeChild(el);
                        el.innerHTML = '';
                    }
                }
            });

            /***/ }),
        /* 6 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            var classNameRegExp = function classNameRegExp(className) {
                return new RegExp('(^|\\s+)' + className + '(\\s+|$)', 'g');
            };

            var addClass = function addClass(el, className) {
                if (!el.className) {
                    el.className = className;

                    return;
                }

                if (el.className.match(classNameRegExp(className))) {} else {
                    el.className += " " + className;
                }
            };

            var removeClass = function removeClass(el, className) {
                el.className = el.className.replace(classNameRegExp(className), "");
            };

            _soda2["default"].directive('class', {
                link: function link(_ref) {
                    var scope = _ref.scope,
                        el = _ref.el,
                        expression = _ref.expression,
                        parseSodaExpression = _ref.parseSodaExpression;

                    var expressFunc = parseSodaExpression(expression, scope);

                    if (expressFunc) {
                        addClass(el, expressFunc);
                    } else {}
                }
            });

            /***/ }),
        /* 7 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('html', {
                link: function link(_ref) {
                    var expression = _ref.expression,
                        scope = _ref.scope,
                        el = _ref.el,
                        parseSodaExpression = _ref.parseSodaExpression;

                    var result = parseSodaExpression(expression, scope);

                    if (result) {
                        el.innerHTML = result;
                    }
                }
            });

            /***/ }),
        /* 8 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('replace', {
                link: function link(_ref) {
                    var scope = _ref.scope,
                        el = _ref.el,
                        expression = _ref.expression,
                        parseSodaExpression = _ref.parseSodaExpression,
                        document = _ref.document;

                    var result = parseSodaExpression(expression, scope);

                    if (result) {
                        var div = document.createElement('div');
                        div.innerHTML = result;

                        if (el.parentNode) {
                            while (div.childNodes[0]) {
                                el.parentNode.insertBefore(div.childNodes[0], el);
                            }
                        }
                    }

                    el.parentNode && el.parentNode.removeChild(el);
                }
            });

            /***/ }),
        /* 9 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('style', {
                link: function link(_ref) {
                    var scope = _ref.scope,
                        el = _ref.el,
                        expression = _ref.expression,
                        parseSodaExpression = _ref.parseSodaExpression;

                    var expressFunc = parseSodaExpression(expression, scope);

                    var getCssValue = function getCssValue(name, value) {
                        var numberWithoutpx = /opacity|z-index/;
                        if (numberWithoutpx.test(name)) {
                            return parseFloat(value);
                        }

                        if (isNaN(value)) {
                            return value;
                        } else {
                            return value + "px";
                        }
                    };

                    if (expressFunc) {
                        var stylelist = [];

                        for (var i in expressFunc) {
                            if (expressFunc.hasOwnProperty(i)) {
                                var provalue = getCssValue(i, expressFunc[i]);

                                stylelist.push([i, provalue].join(":"));
                            }
                        }

                        var style = el.style;
                        for (var i = 0; i < style.length; i++) {
                            var name = style[i];
                            if (expressFunc[name]) {} else {
                                stylelist.push([name, style[name]].join(":"));
                            }
                        }

                        var styleStr = stylelist.join(";");

                        el.setAttribute("style", styleStr);
                    }
                }
            });

            /***/ }),
        /* 10 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _soda = __webpack_require__(0);

            var _soda2 = _interopRequireDefault(_soda);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            _soda2["default"].directive('include', {
                priority: 8,
                link: function link(_ref) {
                    var scope = _ref.scope,
                        el = _ref.el,
                        parseSodaExpression = _ref.parseSodaExpression,
                        expression = _ref.expression;

                    var VALUE_OUT_REG = /\{\{([^\}]*)\}\}/g;

                    var result = expression.replace(VALUE_OUT_REG, function (item, $1) {
                        return parseSodaExpression($1, scope);
                    });

                    result = result.split(":");

                    var name = result[0];

                    var args = result.slice(1);

                    var templateOption = _soda2["default"].getTmpl(name, args);

                    var template = templateOption.template,
                        _templateOption$optio = templateOption.option,
                        option = _templateOption$optio === undefined ? {} : _templateOption$optio;

                    if (template) {
                        if (option.compile) {
                            el.outerHTML = this.run(template, scope);
                        } else {
                            el.outerHTML = template;
                        }
                    }
                }
            });

            /***/ })
        /******/ ]);
});

/*! tether 1.3.3 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require, exports, module);
    } else {
        root.Tether = factory();
    }
}(this, function(require, exports, module) {

    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var TetherBase = undefined;
    if (typeof TetherBase === 'undefined') {
        TetherBase = { modules: [] };
    }

    var zeroElement = null;

// Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
// if the element lies within a nested document (<frame> or <iframe>-like).
    function getActualBoundingClientRect(node) {
        var boundingRect = node.getBoundingClientRect();

        // The original object returned by getBoundingClientRect is immutable, so we clone it
        // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
        var rect = {};
        for (var k in boundingRect) {
            rect[k] = boundingRect[k];
        }

        if (node.ownerDocument !== document) {
            var _frameElement = node.ownerDocument.defaultView.frameElement;
            if (_frameElement) {
                var frameRect = getActualBoundingClientRect(_frameElement);
                rect.top += frameRect.top;
                rect.bottom += frameRect.top;
                rect.left += frameRect.left;
                rect.right += frameRect.left;
            }
        }

        return rect;
    }

    function getScrollParents(el) {
        // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
        // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = getComputedStyle(el) || {};
        var position = computedStyle.position;
        var parents = [];

        if (position === 'fixed') {
            return [el];
        }

        var parent = el;
        while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
            var style = undefined;
            try {
                style = getComputedStyle(parent);
            } catch (err) {}

            if (typeof style === 'undefined' || style === null) {
                parents.push(parent);
                return parents;
            }

            var _style = style;
            var overflow = _style.overflow;
            var overflowX = _style.overflowX;
            var overflowY = _style.overflowY;

            if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
                if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
                    parents.push(parent);
                }
            }
        }

        parents.push(el.ownerDocument.body);

        // If the node is within a frame, account for the parent window scroll
        if (el.ownerDocument !== document) {
            parents.push(el.ownerDocument.defaultView);
        }

        return parents;
    }

    var uniqueId = (function () {
        var id = 0;
        return function () {
            return ++id;
        };
    })();

    var zeroPosCache = {};
    var getOrigin = function getOrigin() {
        // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
        // jitter as the user scrolls that messes with our ability to detect if two positions
        // are equivilant or not.  We place an element at the top left of the page that will
        // get the same jitter, so we can cancel the two out.
        var node = zeroElement;
        if (!node) {
            node = document.createElement('div');
            node.setAttribute('data-tether-id', uniqueId());
            extend(node.style, {
                top: 0,
                left: 0,
                position: 'absolute'
            });

            document.body.appendChild(node);

            zeroElement = node;
        }

        var id = node.getAttribute('data-tether-id');
        if (typeof zeroPosCache[id] === 'undefined') {
            zeroPosCache[id] = getActualBoundingClientRect(node);

            // Clear the cache when this position call is done
            defer(function () {
                delete zeroPosCache[id];
            });
        }

        return zeroPosCache[id];
    };

    function removeUtilElements() {
        if (zeroElement) {
            document.body.removeChild(zeroElement);
        }
        zeroElement = null;
    };

    function getBounds(el) {
        var doc = undefined;
        if (el === document) {
            doc = document;
            el = document.documentElement;
        } else {
            doc = el.ownerDocument;
        }

        var docEl = doc.documentElement;

        var box = getActualBoundingClientRect(el);

        var origin = getOrigin();

        box.top -= origin.top;
        box.left -= origin.left;

        if (typeof box.width === 'undefined') {
            box.width = document.body.scrollWidth - box.left - box.right;
        }
        if (typeof box.height === 'undefined') {
            box.height = document.body.scrollHeight - box.top - box.bottom;
        }

        box.top = box.top - docEl.clientTop;
        box.left = box.left - docEl.clientLeft;
        box.right = doc.body.clientWidth - box.width - box.left;
        box.bottom = doc.body.clientHeight - box.height - box.top;

        return box;
    }

    function getOffsetParent(el) {
        return el.offsetParent || document.documentElement;
    }

    function getScrollBarSize() {
        var inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '200px';

        var outer = document.createElement('div');
        extend(outer.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
            width: '200px',
            height: '150px',
            overflow: 'hidden'
        });

        outer.appendChild(inner);

        document.body.appendChild(outer);

        var widthContained = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var widthScroll = inner.offsetWidth;

        if (widthContained === widthScroll) {
            widthScroll = outer.clientWidth;
        }

        document.body.removeChild(outer);

        var width = widthContained - widthScroll;

        return { width: width, height: width };
    }

    function extend() {
        var out = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var args = [];

        Array.prototype.push.apply(args, arguments);

        args.slice(1).forEach(function (obj) {
            if (obj) {
                for (var key in obj) {
                    if (({}).hasOwnProperty.call(obj, key)) {
                        out[key] = obj[key];
                    }
                }
            }
        });

        return out;
    }

    function removeClass(el, name) {
        if (typeof el.classList !== 'undefined') {
            name.split(' ').forEach(function (cls) {
                if (cls.trim()) {
                    el.classList.remove(cls);
                }
            });
        } else {
            var regex = new RegExp('(^| )' + name.split(' ').join('|') + '( |$)', 'gi');
            var className = getClassName(el).replace(regex, ' ');
            setClassName(el, className);
        }
    }

    function addClass(el, name) {
        if (typeof el.classList !== 'undefined') {
            name.split(' ').forEach(function (cls) {
                if (cls.trim()) {
                    el.classList.add(cls);
                }
            });
        } else {
            removeClass(el, name);
            var cls = getClassName(el) + (' ' + name);
            setClassName(el, cls);
        }
    }

    function hasClass(el, name) {
        if (typeof el.classList !== 'undefined') {
            return el.classList.contains(name);
        }
        var className = getClassName(el);
        return new RegExp('(^| )' + name + '( |$)', 'gi').test(className);
    }

    function getClassName(el) {
        // Can't use just SVGAnimatedString here since nodes within a Frame in IE have
        // completely separately SVGAnimatedString base classes
        if (el.className instanceof el.ownerDocument.defaultView.SVGAnimatedString) {
            return el.className.baseVal;
        }
        return el.className;
    }

    function setClassName(el, className) {
        el.setAttribute('class', className);
    }

    function updateClasses(el, add, all) {
        // Of the set of 'all' classes, we need the 'add' classes, and only the
        // 'add' classes to be set.
        all.forEach(function (cls) {
            if (add.indexOf(cls) === -1 && hasClass(el, cls)) {
                removeClass(el, cls);
            }
        });

        add.forEach(function (cls) {
            if (!hasClass(el, cls)) {
                addClass(el, cls);
            }
        });
    }

    var deferred = [];

    var defer = function defer(fn) {
        deferred.push(fn);
    };

    var flush = function flush() {
        var fn = undefined;
        while (fn = deferred.pop()) {
            fn();
        }
    };

    var Evented = (function () {
        function Evented() {
            _classCallCheck(this, Evented);
        }

        _createClass(Evented, [{
            key: 'on',
            value: function on(event, handler, ctx) {
                var once = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

                if (typeof this.bindings === 'undefined') {
                    this.bindings = {};
                }
                if (typeof this.bindings[event] === 'undefined') {
                    this.bindings[event] = [];
                }
                this.bindings[event].push({ handler: handler, ctx: ctx, once: once });
            }
        }, {
            key: 'once',
            value: function once(event, handler, ctx) {
                this.on(event, handler, ctx, true);
            }
        }, {
            key: 'off',
            value: function off(event, handler) {
                if (typeof this.bindings === 'undefined' || typeof this.bindings[event] === 'undefined') {
                    return;
                }

                if (typeof handler === 'undefined') {
                    delete this.bindings[event];
                } else {
                    var i = 0;
                    while (i < this.bindings[event].length) {
                        if (this.bindings[event][i].handler === handler) {
                            this.bindings[event].splice(i, 1);
                        } else {
                            ++i;
                        }
                    }
                }
            }
        }, {
            key: 'trigger',
            value: function trigger(event) {
                if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
                    var i = 0;

                    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                    }

                    while (i < this.bindings[event].length) {
                        var _bindings$event$i = this.bindings[event][i];
                        var handler = _bindings$event$i.handler;
                        var ctx = _bindings$event$i.ctx;
                        var once = _bindings$event$i.once;

                        var context = ctx;
                        if (typeof context === 'undefined') {
                            context = this;
                        }

                        handler.apply(context, args);

                        if (once) {
                            this.bindings[event].splice(i, 1);
                        } else {
                            ++i;
                        }
                    }
                }
            }
        }]);

        return Evented;
    })();

    TetherBase.Utils = {
        getActualBoundingClientRect: getActualBoundingClientRect,
        getScrollParents: getScrollParents,
        getBounds: getBounds,
        getOffsetParent: getOffsetParent,
        extend: extend,
        addClass: addClass,
        removeClass: removeClass,
        hasClass: hasClass,
        updateClasses: updateClasses,
        defer: defer,
        flush: flush,
        uniqueId: uniqueId,
        Evented: Evented,
        getScrollBarSize: getScrollBarSize,
        removeUtilElements: removeUtilElements
    };
    /* globals TetherBase, performance */

    'use strict';

    var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    if (typeof TetherBase === 'undefined') {
        throw new Error('You must include the utils.js file before tether.js');
    }

    var _TetherBase$Utils = TetherBase.Utils;
    var getScrollParents = _TetherBase$Utils.getScrollParents;
    var getBounds = _TetherBase$Utils.getBounds;
    var getOffsetParent = _TetherBase$Utils.getOffsetParent;
    var extend = _TetherBase$Utils.extend;
    var addClass = _TetherBase$Utils.addClass;
    var removeClass = _TetherBase$Utils.removeClass;
    var updateClasses = _TetherBase$Utils.updateClasses;
    var defer = _TetherBase$Utils.defer;
    var flush = _TetherBase$Utils.flush;
    var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;
    var removeUtilElements = _TetherBase$Utils.removeUtilElements;

    function within(a, b) {
        var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        return a + diff >= b && b >= a - diff;
    }

    var transformKey = (function () {
        if (typeof document === 'undefined') {
            return '';
        }
        var el = document.createElement('div');

        var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
        for (var i = 0; i < transforms.length; ++i) {
            var key = transforms[i];
            if (el.style[key] !== undefined) {
                return key;
            }
        }
    })();

    var tethers = [];

    var position = function position() {
        tethers.forEach(function (tether) {
            tether.position(false);
        });
        flush();
    };

    function now() {
        if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
            return performance.now();
        }
        return +new Date();
    }

    (function () {
        var lastCall = null;
        var lastDuration = null;
        var pendingTimeout = null;

        var tick = function tick() {
            if (typeof lastDuration !== 'undefined' && lastDuration > 16) {
                // We voluntarily throttle ourselves if we can't manage 60fps
                lastDuration = Math.min(lastDuration - 16, 250);

                // Just in case this is the last event, remember to position just once more
                pendingTimeout = setTimeout(tick, 250);
                return;
            }

            if (typeof lastCall !== 'undefined' && now() - lastCall < 10) {
                // Some browsers call events a little too frequently, refuse to run more than is reasonable
                return;
            }

            if (pendingTimeout != null) {
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
            }

            lastCall = now();
            position();
            lastDuration = now() - lastCall;
        };

        if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
            ['resize', 'scroll', 'touchmove'].forEach(function (event) {
                window.addEventListener(event, tick);
            });
        }
    })();

    var MIRROR_LR = {
        center: 'center',
        left: 'right',
        right: 'left'
    };

    var MIRROR_TB = {
        middle: 'middle',
        top: 'bottom',
        bottom: 'top'
    };

    var OFFSET_MAP = {
        top: 0,
        left: 0,
        middle: '50%',
        center: '50%',
        bottom: '100%',
        right: '100%'
    };

    var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
        var left = attachment.left;
        var top = attachment.top;

        if (left === 'auto') {
            left = MIRROR_LR[relativeToAttachment.left];
        }

        if (top === 'auto') {
            top = MIRROR_TB[relativeToAttachment.top];
        }

        return { left: left, top: top };
    };

    var attachmentToOffset = function attachmentToOffset(attachment) {
        var left = attachment.left;
        var top = attachment.top;

        if (typeof OFFSET_MAP[attachment.left] !== 'undefined') {
            left = OFFSET_MAP[attachment.left];
        }

        if (typeof OFFSET_MAP[attachment.top] !== 'undefined') {
            top = OFFSET_MAP[attachment.top];
        }

        return { left: left, top: top };
    };

    function addOffset() {
        var out = { top: 0, left: 0 };

        for (var _len = arguments.length, offsets = Array(_len), _key = 0; _key < _len; _key++) {
            offsets[_key] = arguments[_key];
        }

        offsets.forEach(function (_ref) {
            var top = _ref.top;
            var left = _ref.left;

            if (typeof top === 'string') {
                top = parseFloat(top, 10);
            }
            if (typeof left === 'string') {
                left = parseFloat(left, 10);
            }

            out.top += top;
            out.left += left;
        });

        return out;
    }

    function offsetToPx(offset, size) {
        if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
            offset.left = parseFloat(offset.left, 10) / 100 * size.width;
        }
        if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
            offset.top = parseFloat(offset.top, 10) / 100 * size.height;
        }

        return offset;
    }

    var parseOffset = function parseOffset(value) {
        var _value$split = value.split(' ');

        var _value$split2 = _slicedToArray(_value$split, 2);

        var top = _value$split2[0];
        var left = _value$split2[1];

        return { top: top, left: left };
    };
    var parseAttachment = parseOffset;

    var TetherClass = (function (_Evented) {
        _inherits(TetherClass, _Evented);

        function TetherClass(options) {
            var _this = this;

            _classCallCheck(this, TetherClass);

            _get(Object.getPrototypeOf(TetherClass.prototype), 'constructor', this).call(this);
            this.position = this.position.bind(this);

            tethers.push(this);

            this.history = [];

            this.setOptions(options, false);

            TetherBase.modules.forEach(function (module) {
                if (typeof module.initialize !== 'undefined') {
                    module.initialize.call(_this);
                }
            });

            this.position();
        }

        _createClass(TetherClass, [{
            key: 'getClass',
            value: function getClass() {
                var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
                var classes = this.options.classes;

                if (typeof classes !== 'undefined' && classes[key]) {
                    return this.options.classes[key];
                } else if (this.options.classPrefix) {
                    return this.options.classPrefix + '-' + key;
                } else {
                    return key;
                }
            }
        }, {
            key: 'setOptions',
            value: function setOptions(options) {
                var _this2 = this;

                var pos = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

                var defaults = {
                    offset: '0 0',
                    targetOffset: '0 0',
                    targetAttachment: 'auto auto',
                    classPrefix: 'tether'
                };

                this.options = extend(defaults, options);

                var _options = this.options;
                var element = _options.element;
                var target = _options.target;
                var targetModifier = _options.targetModifier;

                this.element = element;
                this.target = target;
                this.targetModifier = targetModifier;

                if (this.target === 'viewport') {
                    this.target = document.body;
                    this.targetModifier = 'visible';
                } else if (this.target === 'scroll-handle') {
                    this.target = document.body;
                    this.targetModifier = 'scroll-handle';
                }

                ['element', 'target'].forEach(function (key) {
                    if (typeof _this2[key] === 'undefined') {
                        throw new Error('Tether Error: Both element and target must be defined');
                    }

                    if (typeof _this2[key].jquery !== 'undefined') {
                        _this2[key] = _this2[key][0];
                    } else if (typeof _this2[key] === 'string') {
                        _this2[key] = document.querySelector(_this2[key]);
                    }
                });

                addClass(this.element, this.getClass('element'));
                if (!(this.options.addTargetClasses === false)) {
                    addClass(this.target, this.getClass('target'));
                }

                if (!this.options.attachment) {
                    throw new Error('Tether Error: You must provide an attachment');
                }

                this.targetAttachment = parseAttachment(this.options.targetAttachment);
                this.attachment = parseAttachment(this.options.attachment);
                this.offset = parseOffset(this.options.offset);
                this.targetOffset = parseOffset(this.options.targetOffset);

                if (typeof this.scrollParents !== 'undefined') {
                    this.disable();
                }

                if (this.targetModifier === 'scroll-handle') {
                    this.scrollParents = [this.target];
                } else {
                    this.scrollParents = getScrollParents(this.target);
                }

                if (!(this.options.enabled === false)) {
                    this.enable(pos);
                }
            }
        }, {
            key: 'getTargetBounds',
            value: function getTargetBounds() {
                if (typeof this.targetModifier !== 'undefined') {
                    if (this.targetModifier === 'visible') {
                        if (this.target === document.body) {
                            return { top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth };
                        } else {
                            var bounds = getBounds(this.target);

                            var out = {
                                height: bounds.height,
                                width: bounds.width,
                                top: bounds.top,
                                left: bounds.left
                            };

                            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
                            out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
                            out.height = Math.min(innerHeight, out.height);
                            out.height -= 2;

                            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
                            out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
                            out.width = Math.min(innerWidth, out.width);
                            out.width -= 2;

                            if (out.top < pageYOffset) {
                                out.top = pageYOffset;
                            }
                            if (out.left < pageXOffset) {
                                out.left = pageXOffset;
                            }

                            return out;
                        }
                    } else if (this.targetModifier === 'scroll-handle') {
                        var bounds = undefined;
                        var target = this.target;
                        if (target === document.body) {
                            target = document.documentElement;

                            bounds = {
                                left: pageXOffset,
                                top: pageYOffset,
                                height: innerHeight,
                                width: innerWidth
                            };
                        } else {
                            bounds = getBounds(target);
                        }

                        var style = getComputedStyle(target);

                        var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || this.target !== document.body;

                        var scrollBottom = 0;
                        if (hasBottomScroll) {
                            scrollBottom = 15;
                        }

                        var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;

                        var out = {
                            width: 15,
                            height: height * 0.975 * (height / target.scrollHeight),
                            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
                        };

                        var fitAdj = 0;
                        if (height < 408 && this.target === document.body) {
                            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
                        }

                        if (this.target !== document.body) {
                            out.height = Math.max(out.height, 24);
                        }

                        var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
                        out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);

                        if (this.target === document.body) {
                            out.height = Math.max(out.height, 24);
                        }

                        return out;
                    }
                } else {
                    return getBounds(this.target);
                }
            }
        }, {
            key: 'clearCache',
            value: function clearCache() {
                this._cache = {};
            }
        }, {
            key: 'cache',
            value: function cache(k, getter) {
                // More than one module will often need the same DOM info, so
                // we keep a cache which is cleared on each position call
                if (typeof this._cache === 'undefined') {
                    this._cache = {};
                }

                if (typeof this._cache[k] === 'undefined') {
                    this._cache[k] = getter.call(this);
                }

                return this._cache[k];
            }
        }, {
            key: 'enable',
            value: function enable() {
                var _this3 = this;

                var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

                if (!(this.options.addTargetClasses === false)) {
                    addClass(this.target, this.getClass('enabled'));
                }
                addClass(this.element, this.getClass('enabled'));
                this.enabled = true;

                this.scrollParents.forEach(function (parent) {
                    if (parent !== _this3.target.ownerDocument) {
                        parent.addEventListener('scroll', _this3.position);
                    }
                });

                if (pos) {
                    this.position();
                }
            }
        }, {
            key: 'disable',
            value: function disable() {
                var _this4 = this;

                removeClass(this.target, this.getClass('enabled'));
                removeClass(this.element, this.getClass('enabled'));
                this.enabled = false;

                if (typeof this.scrollParents !== 'undefined') {
                    this.scrollParents.forEach(function (parent) {
                        parent.removeEventListener('scroll', _this4.position);
                    });
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                var _this5 = this;

                this.disable();

                tethers.forEach(function (tether, i) {
                    if (tether === _this5) {
                        tethers.splice(i, 1);
                    }
                });

                // Remove any elements we were using for convenience from the DOM
                if (tethers.length === 0) {
                    removeUtilElements();
                }
            }
        }, {
            key: 'updateAttachClasses',
            value: function updateAttachClasses(elementAttach, targetAttach) {
                var _this6 = this;

                elementAttach = elementAttach || this.attachment;
                targetAttach = targetAttach || this.targetAttachment;
                var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];

                if (typeof this._addAttachClasses !== 'undefined' && this._addAttachClasses.length) {
                    // updateAttachClasses can be called more than once in a position call, so
                    // we need to clean up after ourselves such that when the last defer gets
                    // ran it doesn't add any extra classes from previous calls.
                    this._addAttachClasses.splice(0, this._addAttachClasses.length);
                }

                if (typeof this._addAttachClasses === 'undefined') {
                    this._addAttachClasses = [];
                }
                var add = this._addAttachClasses;

                if (elementAttach.top) {
                    add.push(this.getClass('element-attached') + '-' + elementAttach.top);
                }
                if (elementAttach.left) {
                    add.push(this.getClass('element-attached') + '-' + elementAttach.left);
                }
                if (targetAttach.top) {
                    add.push(this.getClass('target-attached') + '-' + targetAttach.top);
                }
                if (targetAttach.left) {
                    add.push(this.getClass('target-attached') + '-' + targetAttach.left);
                }

                var all = [];
                sides.forEach(function (side) {
                    all.push(_this6.getClass('element-attached') + '-' + side);
                    all.push(_this6.getClass('target-attached') + '-' + side);
                });

                defer(function () {
                    if (!(typeof _this6._addAttachClasses !== 'undefined')) {
                        return;
                    }

                    updateClasses(_this6.element, _this6._addAttachClasses, all);
                    if (!(_this6.options.addTargetClasses === false)) {
                        updateClasses(_this6.target, _this6._addAttachClasses, all);
                    }

                    delete _this6._addAttachClasses;
                });
            }
        }, {
            key: 'position',
            value: function position() {
                var _this7 = this;

                var flushChanges = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

                // flushChanges commits the changes immediately, leave true unless you are positioning multiple
                // tethers (in which case call Tether.Utils.flush yourself when you're done)

                if (!this.enabled) {
                    return;
                }

                this.clearCache();

                // Turn 'auto' attachments into the appropriate corner or edge
                var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);

                this.updateAttachClasses(this.attachment, targetAttachment);

                var elementPos = this.cache('element-bounds', function () {
                    return getBounds(_this7.element);
                });

                var width = elementPos.width;
                var height = elementPos.height;

                if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
                    var _lastSize = this.lastSize;

                    // We cache the height and width to make it possible to position elements that are
                    // getting hidden.
                    width = _lastSize.width;
                    height = _lastSize.height;
                } else {
                    this.lastSize = { width: width, height: height };
                }

                var targetPos = this.cache('target-bounds', function () {
                    return _this7.getTargetBounds();
                });
                var targetSize = targetPos;

                // Get an actual px offset from the attachment
                var offset = offsetToPx(attachmentToOffset(this.attachment), { width: width, height: height });
                var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);

                var manualOffset = offsetToPx(this.offset, { width: width, height: height });
                var manualTargetOffset = offsetToPx(this.targetOffset, targetSize);

                // Add the manually provided offset
                offset = addOffset(offset, manualOffset);
                targetOffset = addOffset(targetOffset, manualTargetOffset);

                // It's now our goal to make (element position + offset) == (target position + target offset)
                var left = targetPos.left + targetOffset.left - offset.left;
                var top = targetPos.top + targetOffset.top - offset.top;

                for (var i = 0; i < TetherBase.modules.length; ++i) {
                    var _module2 = TetherBase.modules[i];
                    var ret = _module2.position.call(this, {
                        left: left,
                        top: top,
                        targetAttachment: targetAttachment,
                        targetPos: targetPos,
                        elementPos: elementPos,
                        offset: offset,
                        targetOffset: targetOffset,
                        manualOffset: manualOffset,
                        manualTargetOffset: manualTargetOffset,
                        scrollbarSize: scrollbarSize,
                        attachment: this.attachment
                    });

                    if (ret === false) {
                        return false;
                    } else if (typeof ret === 'undefined' || typeof ret !== 'object') {
                        continue;
                    } else {
                        top = ret.top;
                        left = ret.left;
                    }
                }

                // We describe the position three different ways to give the optimizer
                // a chance to decide the best possible way to position the element
                // with the fewest repaints.
                var next = {
                    // It's position relative to the page (absolute positioning when
                    // the element is a child of the body)
                    page: {
                        top: top,
                        left: left
                    },

                    // It's position relative to the viewport (fixed positioning)
                    viewport: {
                        top: top - pageYOffset,
                        bottom: pageYOffset - top - height + innerHeight,
                        left: left - pageXOffset,
                        right: pageXOffset - left - width + innerWidth
                    }
                };

                var doc = this.target.ownerDocument;
                var win = doc.defaultView;

                var scrollbarSize = undefined;
                if (doc.body.scrollWidth > win.innerWidth) {
                    scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
                    next.viewport.bottom -= scrollbarSize.height;
                }

                if (doc.body.scrollHeight > win.innerHeight) {
                    scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
                    next.viewport.right -= scrollbarSize.width;
                }

                if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
                    // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
                    next.page.bottom = doc.body.scrollHeight - top - height;
                    next.page.right = doc.body.scrollWidth - left - width;
                }

                if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
                    (function () {
                        var offsetParent = _this7.cache('target-offsetparent', function () {
                            return getOffsetParent(_this7.target);
                        });
                        var offsetPosition = _this7.cache('target-offsetparent-bounds', function () {
                            return getBounds(offsetParent);
                        });
                        var offsetParentStyle = getComputedStyle(offsetParent);
                        var offsetParentSize = offsetPosition;

                        var offsetBorder = {};
                        ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
                            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle['border' + side + 'Width']);
                        });

                        offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
                        offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

                        if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
                            if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
                                // We're within the visible part of the target's scroll parent
                                var scrollTop = offsetParent.scrollTop;
                                var scrollLeft = offsetParent.scrollLeft;

                                // It's position relative to the target's offset parent (absolute positioning when
                                // the element is moved to be a child of the target's offset parent).
                                next.offset = {
                                    top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                                    left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
                                };
                            }
                        }
                    })();
                }

                // We could also travel up the DOM and try each containing context, rather than only
                // looking at the body, but we're gonna get diminishing returns.

                this.move(next);

                this.history.unshift(next);

                if (this.history.length > 3) {
                    this.history.pop();
                }

                if (flushChanges) {
                    flush();
                }

                return true;
            }

            // THE ISSUE
        }, {
            key: 'move',
            value: function move(pos) {
                var _this8 = this;

                if (!(typeof this.element.parentNode !== 'undefined')) {
                    return;
                }

                var same = {};

                for (var type in pos) {
                    same[type] = {};

                    for (var key in pos[type]) {
                        var found = false;

                        for (var i = 0; i < this.history.length; ++i) {
                            var point = this.history[i];
                            if (typeof point[type] !== 'undefined' && !within(point[type][key], pos[type][key])) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            same[type][key] = true;
                        }
                    }
                }

                var css = { top: '', left: '', right: '', bottom: '' };

                var transcribe = function transcribe(_same, _pos) {
                    var hasOptimizations = typeof _this8.options.optimizations !== 'undefined';
                    var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;
                    if (gpu !== false) {
                        var yPos = undefined,
                            xPos = undefined;
                        if (_same.top) {
                            css.top = 0;
                            yPos = _pos.top;
                        } else {
                            css.bottom = 0;
                            yPos = -_pos.bottom;
                        }

                        if (_same.left) {
                            css.left = 0;
                            xPos = _pos.left;
                        } else {
                            css.right = 0;
                            xPos = -_pos.right;
                        }

                        css[transformKey] = 'translateX(' + Math.round(xPos) + 'px) translateY(' + Math.round(yPos) + 'px)';

                        if (transformKey !== 'msTransform') {
                            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
                            // but IE9 doesn't support 3d transforms and will choke.
                            css[transformKey] += " translateZ(0)";
                        }
                    } else {
                        if (_same.top) {
                            css.top = _pos.top + 'px';
                        } else {
                            css.bottom = _pos.bottom + 'px';
                        }

                        if (_same.left) {
                            css.left = _pos.left + 'px';
                        } else {
                            css.right = _pos.right + 'px';
                        }
                    }
                };

                var moved = false;
                if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
                    css.position = 'absolute';
                    transcribe(same.page, pos.page);
                } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
                    css.position = 'fixed';
                    transcribe(same.viewport, pos.viewport);
                } else if (typeof same.offset !== 'undefined' && same.offset.top && same.offset.left) {
                    (function () {
                        css.position = 'absolute';
                        var offsetParent = _this8.cache('target-offsetparent', function () {
                            return getOffsetParent(_this8.target);
                        });

                        if (getOffsetParent(_this8.element) !== offsetParent) {
                            defer(function () {
                                _this8.element.parentNode.removeChild(_this8.element);
                                offsetParent.appendChild(_this8.element);
                            });
                        }

                        transcribe(same.offset, pos.offset);
                        moved = true;
                    })();
                } else {
                    css.position = 'absolute';
                    transcribe({ top: true, left: true }, pos.page);
                }

                if (!moved) {
                    var offsetParentIsBody = true;
                    var currentNode = this.element.parentNode;
                    while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY') {
                        if (getComputedStyle(currentNode).position !== 'static') {
                            offsetParentIsBody = false;
                            break;
                        }

                        currentNode = currentNode.parentNode;
                    }

                    if (!offsetParentIsBody) {
                        this.element.parentNode.removeChild(this.element);
                        this.element.ownerDocument.body.appendChild(this.element);
                    }
                }

                // Any css change will trigger a repaint, so let's avoid one if nothing changed
                var writeCSS = {};
                var write = false;
                for (var key in css) {
                    var val = css[key];
                    var elVal = this.element.style[key];

                    if (elVal !== val) {
                        write = true;
                        writeCSS[key] = val;
                    }
                }

                if (write) {
                    defer(function () {
                        extend(_this8.element.style, writeCSS);
                    });
                }
            }
        }]);

        return TetherClass;
    })(Evented);

    TetherClass.modules = [];

    TetherBase.position = position;

    var Tether = extend(TetherClass, TetherBase);
    /* globals TetherBase */

    'use strict';

    var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

    var _TetherBase$Utils = TetherBase.Utils;
    var getBounds = _TetherBase$Utils.getBounds;
    var extend = _TetherBase$Utils.extend;
    var updateClasses = _TetherBase$Utils.updateClasses;
    var defer = _TetherBase$Utils.defer;

    var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

    function getBoundingRect(tether, to) {
        if (to === 'scrollParent') {
            to = tether.scrollParents[0];
        } else if (to === 'window') {
            to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
        }

        if (to === document) {
            to = to.documentElement;
        }

        if (typeof to.nodeType !== 'undefined') {
            (function () {
                var node = to;
                var size = getBounds(to);
                var pos = size;
                var style = getComputedStyle(to);

                to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

                // Account any parent Frames scroll offset
                if (node.ownerDocument !== document) {
                    var win = node.ownerDocument.defaultView;
                    to[0] += win.pageXOffset;
                    to[1] += win.pageYOffset;
                    to[2] += win.pageXOffset;
                    to[3] += win.pageYOffset;
                }

                BOUNDS_FORMAT.forEach(function (side, i) {
                    side = side[0].toUpperCase() + side.substr(1);
                    if (side === 'Top' || side === 'Left') {
                        to[i] += parseFloat(style['border' + side + 'Width']);
                    } else {
                        to[i] -= parseFloat(style['border' + side + 'Width']);
                    }
                });
            })();
        }

        return to;
    }

    TetherBase.modules.push({
        position: function position(_ref) {
            var _this = this;

            var top = _ref.top;
            var left = _ref.left;
            var targetAttachment = _ref.targetAttachment;

            if (!this.options.constraints) {
                return true;
            }

            var _cache = this.cache('element-bounds', function () {
                return getBounds(_this.element);
            });

            var height = _cache.height;
            var width = _cache.width;

            if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
                var _lastSize = this.lastSize;

                // Handle the item getting hidden as a result of our positioning without glitching
                // the classes in and out
                width = _lastSize.width;
                height = _lastSize.height;
            }

            var targetSize = this.cache('target-bounds', function () {
                return _this.getTargetBounds();
            });

            var targetHeight = targetSize.height;
            var targetWidth = targetSize.width;

            var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];

            this.options.constraints.forEach(function (constraint) {
                var outOfBoundsClass = constraint.outOfBoundsClass;
                var pinnedClass = constraint.pinnedClass;

                if (outOfBoundsClass) {
                    allClasses.push(outOfBoundsClass);
                }
                if (pinnedClass) {
                    allClasses.push(pinnedClass);
                }
            });

            allClasses.forEach(function (cls) {
                ['left', 'top', 'right', 'bottom'].forEach(function (side) {
                    allClasses.push(cls + '-' + side);
                });
            });

            var addClasses = [];

            var tAttachment = extend({}, targetAttachment);
            var eAttachment = extend({}, this.attachment);

            this.options.constraints.forEach(function (constraint) {
                var to = constraint.to;
                var attachment = constraint.attachment;
                var pin = constraint.pin;

                if (typeof attachment === 'undefined') {
                    attachment = '';
                }

                var changeAttachX = undefined,
                    changeAttachY = undefined;
                if (attachment.indexOf(' ') >= 0) {
                    var _attachment$split = attachment.split(' ');

                    var _attachment$split2 = _slicedToArray(_attachment$split, 2);

                    changeAttachY = _attachment$split2[0];
                    changeAttachX = _attachment$split2[1];
                } else {
                    changeAttachX = changeAttachY = attachment;
                }

                var bounds = getBoundingRect(_this, to);

                if (changeAttachY === 'target' || changeAttachY === 'both') {
                    if (top < bounds[1] && tAttachment.top === 'top') {
                        top += targetHeight;
                        tAttachment.top = 'bottom';
                    }

                    if (top + height > bounds[3] && tAttachment.top === 'bottom') {
                        top -= targetHeight;
                        tAttachment.top = 'top';
                    }
                }

                if (changeAttachY === 'together') {
                    if (tAttachment.top === 'top') {
                        if (eAttachment.top === 'bottom' && top < bounds[1]) {
                            top += targetHeight;
                            tAttachment.top = 'bottom';

                            top += height;
                            eAttachment.top = 'top';
                        } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
                            top -= height - targetHeight;
                            tAttachment.top = 'bottom';

                            eAttachment.top = 'bottom';
                        }
                    }

                    if (tAttachment.top === 'bottom') {
                        if (eAttachment.top === 'top' && top + height > bounds[3]) {
                            top -= targetHeight;
                            tAttachment.top = 'top';

                            top -= height;
                            eAttachment.top = 'bottom';
                        } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
                            top += height - targetHeight;
                            tAttachment.top = 'top';

                            eAttachment.top = 'top';
                        }
                    }

                    if (tAttachment.top === 'middle') {
                        if (top + height > bounds[3] && eAttachment.top === 'top') {
                            top -= height;
                            eAttachment.top = 'bottom';
                        } else if (top < bounds[1] && eAttachment.top === 'bottom') {
                            top += height;
                            eAttachment.top = 'top';
                        }
                    }
                }

                if (changeAttachX === 'target' || changeAttachX === 'both') {
                    if (left < bounds[0] && tAttachment.left === 'left') {
                        left += targetWidth;
                        tAttachment.left = 'right';
                    }

                    if (left + width > bounds[2] && tAttachment.left === 'right') {
                        left -= targetWidth;
                        tAttachment.left = 'left';
                    }
                }

                if (changeAttachX === 'together') {
                    if (left < bounds[0] && tAttachment.left === 'left') {
                        if (eAttachment.left === 'right') {
                            left += targetWidth;
                            tAttachment.left = 'right';

                            left += width;
                            eAttachment.left = 'left';
                        } else if (eAttachment.left === 'left') {
                            left += targetWidth;
                            tAttachment.left = 'right';

                            left -= width;
                            eAttachment.left = 'right';
                        }
                    } else if (left + width > bounds[2] && tAttachment.left === 'right') {
                        if (eAttachment.left === 'left') {
                            left -= targetWidth;
                            tAttachment.left = 'left';

                            left -= width;
                            eAttachment.left = 'right';
                        } else if (eAttachment.left === 'right') {
                            left -= targetWidth;
                            tAttachment.left = 'left';

                            left += width;
                            eAttachment.left = 'left';
                        }
                    } else if (tAttachment.left === 'center') {
                        if (left + width > bounds[2] && eAttachment.left === 'left') {
                            left -= width;
                            eAttachment.left = 'right';
                        } else if (left < bounds[0] && eAttachment.left === 'right') {
                            left += width;
                            eAttachment.left = 'left';
                        }
                    }
                }

                if (changeAttachY === 'element' || changeAttachY === 'both') {
                    if (top < bounds[1] && eAttachment.top === 'bottom') {
                        top += height;
                        eAttachment.top = 'top';
                    }

                    if (top + height > bounds[3] && eAttachment.top === 'top') {
                        top -= height;
                        eAttachment.top = 'bottom';
                    }
                }

                if (changeAttachX === 'element' || changeAttachX === 'both') {
                    if (left < bounds[0]) {
                        if (eAttachment.left === 'right') {
                            left += width;
                            eAttachment.left = 'left';
                        } else if (eAttachment.left === 'center') {
                            left += width / 2;
                            eAttachment.left = 'left';
                        }
                    }

                    if (left + width > bounds[2]) {
                        if (eAttachment.left === 'left') {
                            left -= width;
                            eAttachment.left = 'right';
                        } else if (eAttachment.left === 'center') {
                            left -= width / 2;
                            eAttachment.left = 'right';
                        }
                    }
                }

                if (typeof pin === 'string') {
                    pin = pin.split(',').map(function (p) {
                        return p.trim();
                    });
                } else if (pin === true) {
                    pin = ['top', 'left', 'right', 'bottom'];
                }

                pin = pin || [];

                var pinned = [];
                var oob = [];

                if (top < bounds[1]) {
                    if (pin.indexOf('top') >= 0) {
                        top = bounds[1];
                        pinned.push('top');
                    } else {
                        oob.push('top');
                    }
                }

                if (top + height > bounds[3]) {
                    if (pin.indexOf('bottom') >= 0) {
                        top = bounds[3] - height;
                        pinned.push('bottom');
                    } else {
                        oob.push('bottom');
                    }
                }

                if (left < bounds[0]) {
                    if (pin.indexOf('left') >= 0) {
                        left = bounds[0];
                        pinned.push('left');
                    } else {
                        oob.push('left');
                    }
                }

                if (left + width > bounds[2]) {
                    if (pin.indexOf('right') >= 0) {
                        left = bounds[2] - width;
                        pinned.push('right');
                    } else {
                        oob.push('right');
                    }
                }

                if (pinned.length) {
                    (function () {
                        var pinnedClass = undefined;
                        if (typeof _this.options.pinnedClass !== 'undefined') {
                            pinnedClass = _this.options.pinnedClass;
                        } else {
                            pinnedClass = _this.getClass('pinned');
                        }

                        addClasses.push(pinnedClass);
                        pinned.forEach(function (side) {
                            addClasses.push(pinnedClass + '-' + side);
                        });
                    })();
                }

                if (oob.length) {
                    (function () {
                        var oobClass = undefined;
                        if (typeof _this.options.outOfBoundsClass !== 'undefined') {
                            oobClass = _this.options.outOfBoundsClass;
                        } else {
                            oobClass = _this.getClass('out-of-bounds');
                        }

                        addClasses.push(oobClass);
                        oob.forEach(function (side) {
                            addClasses.push(oobClass + '-' + side);
                        });
                    })();
                }

                if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
                    eAttachment.left = tAttachment.left = false;
                }
                if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
                    eAttachment.top = tAttachment.top = false;
                }

                if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
                    _this.updateAttachClasses(eAttachment, tAttachment);
                    _this.trigger('update', {
                        attachment: eAttachment,
                        targetAttachment: tAttachment
                    });
                }
            });

            defer(function () {
                if (!(_this.options.addTargetClasses === false)) {
                    updateClasses(_this.target, addClasses, allClasses);
                }
                updateClasses(_this.element, addClasses, allClasses);
            });

            return { top: top, left: left };
        }
    });
    /* globals TetherBase */

    'use strict';

    var _TetherBase$Utils = TetherBase.Utils;
    var getBounds = _TetherBase$Utils.getBounds;
    var updateClasses = _TetherBase$Utils.updateClasses;
    var defer = _TetherBase$Utils.defer;

    TetherBase.modules.push({
        position: function position(_ref) {
            var _this = this;

            var top = _ref.top;
            var left = _ref.left;

            var _cache = this.cache('element-bounds', function () {
                return getBounds(_this.element);
            });

            var height = _cache.height;
            var width = _cache.width;

            var targetPos = this.getTargetBounds();

            var bottom = top + height;
            var right = left + width;

            var abutted = [];
            if (top <= targetPos.bottom && bottom >= targetPos.top) {
                ['left', 'right'].forEach(function (side) {
                    var targetPosSide = targetPos[side];
                    if (targetPosSide === left || targetPosSide === right) {
                        abutted.push(side);
                    }
                });
            }

            if (left <= targetPos.right && right >= targetPos.left) {
                ['top', 'bottom'].forEach(function (side) {
                    var targetPosSide = targetPos[side];
                    if (targetPosSide === top || targetPosSide === bottom) {
                        abutted.push(side);
                    }
                });
            }

            var allClasses = [];
            var addClasses = [];

            var sides = ['left', 'top', 'right', 'bottom'];
            allClasses.push(this.getClass('abutted'));
            sides.forEach(function (side) {
                allClasses.push(_this.getClass('abutted') + '-' + side);
            });

            if (abutted.length) {
                addClasses.push(this.getClass('abutted'));
            }

            abutted.forEach(function (side) {
                addClasses.push(_this.getClass('abutted') + '-' + side);
            });

            defer(function () {
                if (!(_this.options.addTargetClasses === false)) {
                    updateClasses(_this.target, addClasses, allClasses);
                }
                updateClasses(_this.element, addClasses, allClasses);
            });

            return true;
        }
    });
    /* globals TetherBase */

    'use strict';

    var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

    TetherBase.modules.push({
        position: function position(_ref) {
            var top = _ref.top;
            var left = _ref.left;

            if (!this.options.shift) {
                return;
            }

            var shift = this.options.shift;
            if (typeof this.options.shift === 'function') {
                shift = this.options.shift.call(this, { top: top, left: left });
            }

            var shiftTop = undefined,
                shiftLeft = undefined;
            if (typeof shift === 'string') {
                shift = shift.split(' ');
                shift[1] = shift[1] || shift[0];

                var _shift = shift;

                var _shift2 = _slicedToArray(_shift, 2);

                shiftTop = _shift2[0];
                shiftLeft = _shift2[1];

                shiftTop = parseFloat(shiftTop, 10);
                shiftLeft = parseFloat(shiftLeft, 10);
            } else {
                shiftTop = shift.top;
                shiftLeft = shift.left;
            }

            top += shiftTop;
            left += shiftLeft;

            return { top: top, left: left };
        }
    });
    return Tether;

}));

/*! URI.js v1.18.10 http://medialize.github.io/URI.js/ */
/* build contains: IPv6.js, punycode.js, SecondLevelDomains.js, URI.js, URITemplate.js, jquery.URI.js */
/*
 URI.js - Mutating URLs
 IPv6 Support

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
 MIT License http://www.opensource.org/licenses/mit-license

 https://mths.be/punycode v1.4.0 by @mathias  URI.js - Mutating URLs
 Second Level Domain (SLD) Support

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
 MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
 MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs
 URI Template Support - http://tools.ietf.org/html/rfc6570

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
 MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs
 jQuery Plugin

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/jquery-uri-plugin.html

 Licensed under
 MIT License http://www.opensource.org/licenses/mit-license

 */
(function(d,k){"object"===typeof module&&module.exports?module.exports=k():"function"===typeof define&&define.amd?define(k):d.IPv6=k(d)})(this,function(d){var k=d&&d.IPv6;return{best:function(g){g=g.toLowerCase().split(":");var d=g.length,b=8;""===g[0]&&""===g[1]&&""===g[2]?(g.shift(),g.shift()):""===g[0]&&""===g[1]?g.shift():""===g[d-1]&&""===g[d-2]&&g.pop();d=g.length;-1!==g[d-1].indexOf(".")&&(b=7);var p;for(p=0;p<d&&""!==g[p];p++);if(p<b)for(g.splice(p,1,"0000");g.length<b;)g.splice(p,0,"0000");
    for(p=0;p<b;p++){for(var d=g[p].split(""),k=0;3>k;k++)if("0"===d[0]&&1<d.length)d.splice(0,1);else break;g[p]=d.join("")}var d=-1,t=k=0,m=-1,r=!1;for(p=0;p<b;p++)r?"0"===g[p]?t+=1:(r=!1,t>k&&(d=m,k=t)):"0"===g[p]&&(r=!0,m=p,t=1);t>k&&(d=m,k=t);1<k&&g.splice(d,k,"");d=g.length;b="";""===g[0]&&(b=":");for(p=0;p<d;p++){b+=g[p];if(p===d-1)break;b+=":"}""===g[d-1]&&(b+=":");return b},noConflict:function(){d.IPv6===this&&(d.IPv6=k);return this}}});
(function(d){function k(b){throw new RangeError(A[b]);}function g(b,f){for(var h=b.length,d=[];h--;)d[h]=f(b[h]);return d}function u(b,f){var h=b.split("@"),d="";1<h.length&&(d=h[0]+"@",b=h[1]);b=b.replace(E,".");h=b.split(".");h=g(h,f).join(".");return d+h}function b(b){for(var f=[],h=0,d=b.length,g,a;h<d;)g=b.charCodeAt(h++),55296<=g&&56319>=g&&h<d?(a=b.charCodeAt(h++),56320==(a&64512)?f.push(((g&1023)<<10)+(a&1023)+65536):(f.push(g),h--)):f.push(g);return f}function p(b){return g(b,function(b){var f=
    "";65535<b&&(b-=65536,f+=y(b>>>10&1023|55296),b=56320|b&1023);return f+=y(b)}).join("")}function B(b,f){return b+22+75*(26>b)-((0!=f)<<5)}function t(b,h,d){var g=0;b=d?f(b/700):b>>1;for(b+=f(b/h);455<b;g+=36)b=f(b/35);return f(g+36*b/(b+38))}function m(b){var h=[],d=b.length,g=0,m=128,a=72,c,e;var n=b.lastIndexOf("-");0>n&&(n=0);for(c=0;c<n;++c)128<=b.charCodeAt(c)&&k("not-basic"),h.push(b.charCodeAt(c));for(n=0<n?n+1:0;n<d;){c=g;var l=1;for(e=36;;e+=36){n>=d&&k("invalid-input");var x=b.charCodeAt(n++);
    x=10>x-48?x-22:26>x-65?x-65:26>x-97?x-97:36;(36<=x||x>f((2147483647-g)/l))&&k("overflow");g+=x*l;var q=e<=a?1:e>=a+26?26:e-a;if(x<q)break;x=36-q;l>f(2147483647/x)&&k("overflow");l*=x}l=h.length+1;a=t(g-c,l,0==c);f(g/l)>2147483647-m&&k("overflow");m+=f(g/l);g%=l;h.splice(g++,0,m)}return p(h)}function r(h){var d,g,m,q=[];h=b(h);var a=h.length;var c=128;var e=0;var n=72;for(m=0;m<a;++m){var l=h[m];128>l&&q.push(y(l))}for((d=g=q.length)&&q.push("-");d<a;){var x=2147483647;for(m=0;m<a;++m)l=h[m],l>=c&&
l<x&&(x=l);var r=d+1;x-c>f((2147483647-e)/r)&&k("overflow");e+=(x-c)*r;c=x;for(m=0;m<a;++m)if(l=h[m],l<c&&2147483647<++e&&k("overflow"),l==c){var v=e;for(x=36;;x+=36){l=x<=n?1:x>=n+26?26:x-n;if(v<l)break;var p=v-l;v=36-l;q.push(y(B(l+p%v,0)));v=f(p/v)}q.push(y(B(v,0)));n=t(e,r,d==g);e=0;++d}++e;++c}return q.join("")}var w="object"==typeof exports&&exports&&!exports.nodeType&&exports,h="object"==typeof module&&module&&!module.nodeType&&module,q="object"==typeof global&&global;if(q.global===q||q.window===
    q||q.self===q)d=q;var v=/^xn--/,D=/[^\x20-\x7E]/,E=/[\x2E\u3002\uFF0E\uFF61]/g,A={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},f=Math.floor,y=String.fromCharCode,C;var z={version:"1.3.2",ucs2:{decode:b,encode:p},decode:m,encode:r,toASCII:function(b){return u(b,function(b){return D.test(b)?"xn--"+r(b):b})},toUnicode:function(b){return u(b,function(b){return v.test(b)?m(b.slice(4).toLowerCase()):
    b})}};if("function"==typeof define&&"object"==typeof define.amd&&define.amd)define("punycode",function(){return z});else if(w&&h)if(module.exports==w)h.exports=z;else for(C in z)z.hasOwnProperty(C)&&(w[C]=z[C]);else d.punycode=z})(this);
(function(d,k){"object"===typeof module&&module.exports?module.exports=k():"function"===typeof define&&define.amd?define(k):d.SecondLevelDomains=k(d)})(this,function(d){var k=d&&d.SecondLevelDomains,g={list:{ac:" com gov mil net org ",ae:" ac co gov mil name net org pro sch ",af:" com edu gov net org ",al:" com edu gov mil net org ",ao:" co ed gv it og pb ",ar:" com edu gob gov int mil net org tur ",at:" ac co gv or ",au:" asn com csiro edu gov id net org ",ba:" co com edu gov mil net org rs unbi unmo unsa untz unze ",
    bb:" biz co com edu gov info net org store tv ",bh:" biz cc com edu gov info net org ",bn:" com edu gov net org ",bo:" com edu gob gov int mil net org tv ",br:" adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ",bs:" com edu gov net org ",bz:" du et om ov rg ",ca:" ab bc mb nb nf nl ns nt nu on pe qc sk yk ",
    ck:" biz co edu gen gov info net org ",cn:" ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ",co:" com edu gov mil net nom org ",cr:" ac c co ed fi go or sa ",cy:" ac biz com ekloges gov ltd name net org parliament press pro tm ","do":" art com edu gob gov mil net org sld web ",dz:" art asso com edu gov net org pol ",ec:" com edu fin gov info med mil net org pro ",eg:" com edu eun gov mil name net org sci ",er:" com edu gov ind mil net org rochest w ",
    es:" com edu gob nom org ",et:" biz com edu gov info name net org ",fj:" ac biz com info mil name net org pro ",fk:" ac co gov net nom org ",fr:" asso com f gouv nom prd presse tm ",gg:" co net org ",gh:" com edu gov mil org ",gn:" ac com gov net org ",gr:" com edu gov mil net org ",gt:" com edu gob ind mil net org ",gu:" com edu gov net org ",hk:" com edu gov idv net org ",hu:" 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ",
    id:" ac co go mil net or sch web ",il:" ac co gov idf k12 muni net org ","in":" ac co edu ernet firm gen gov i ind mil net nic org res ",iq:" com edu gov i mil net org ",ir:" ac co dnssec gov i id net org sch ",it:" edu gov ",je:" co net org ",jo:" com edu gov mil name net org sch ",jp:" ac ad co ed go gr lg ne or ",ke:" ac co go info me mobi ne or sc ",kh:" com edu gov mil net org per ",ki:" biz com de edu gov info mob net org tel ",km:" asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ",
    kn:" edu gov net org ",kr:" ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ",kw:" com edu gov net org ",ky:" com edu gov net org ",kz:" com edu gov mil net org ",lb:" com edu gov net org ",lk:" assn com edu gov grp hotel int ltd net ngo org sch soc web ",lr:" com edu gov net org ",lv:" asn com conf edu gov id mil net org ",ly:" com edu gov id med net org plc sch ",ma:" ac co gov m net org press ",
    mc:" asso tm ",me:" ac co edu gov its net org priv ",mg:" com edu gov mil nom org prd tm ",mk:" com edu gov inf name net org pro ",ml:" com edu gov net org presse ",mn:" edu gov org ",mo:" com edu gov net org ",mt:" com edu gov net org ",mv:" aero biz com coop edu gov info int mil museum name net org pro ",mw:" ac co com coop edu gov int museum net org ",mx:" com edu gob net org ",my:" com edu gov mil name net org sch ",nf:" arts com firm info net other per rec store web ",ng:" biz com edu gov mil mobi name net org sch ",
    ni:" ac co com edu gob mil net nom org ",np:" com edu gov mil net org ",nr:" biz com edu gov info net org ",om:" ac biz co com edu gov med mil museum net org pro sch ",pe:" com edu gob mil net nom org sld ",ph:" com edu gov i mil net ngo org ",pk:" biz com edu fam gob gok gon gop gos gov net org web ",pl:" art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ",pr:" ac biz com edu est gov info isla name net org pro prof ",
    ps:" com edu gov net org plo sec ",pw:" belau co ed go ne or ",ro:" arts com firm info nom nt org rec store tm www ",rs:" ac co edu gov in org ",sb:" com edu gov net org ",sc:" com edu gov net org ",sh:" co com edu gov net nom org ",sl:" com edu gov net org ",st:" co com consulado edu embaixada gov mil net org principe saotome store ",sv:" com edu gob org red ",sz:" ac co org ",tr:" av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ",tt:" aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ",
    tw:" club com ebiz edu game gov idv mil net org ",mu:" ac co com gov net or org ",mz:" ac co edu gov org ",na:" co com ",nz:" ac co cri geek gen govt health iwi maori mil net org parliament school ",pa:" abo ac com edu gob ing med net nom org sld ",pt:" com edu gov int net nome org publ ",py:" com edu gov mil net org ",qa:" com edu gov mil net org ",re:" asso com nom ",ru:" ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ",
    rw:" ac co com edu gouv gov int mil net ",sa:" com edu gov med net org pub sch ",sd:" com edu gov info med net org tv ",se:" a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ",sg:" com edu gov idn net org per ",sn:" art com edu gouv org perso univ ",sy:" com edu gov mil net news org ",th:" ac co go in mi net or ",tj:" ac biz co com edu go gov info int mil name net nic org test web ",tn:" agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ",
    tz:" ac co go ne or ",ua:" biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ",ug:" ac co go ne or org sc ",uk:" ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ",
    us:" dni fed isa kids nsn ",uy:" com edu gub mil net org ",ve:" co com edu gob info mil net org web ",vi:" co com k12 net org ",vn:" ac biz com edu gov health info int name net org pro ",ye:" co com gov ltd me net org plc ",yu:" ac co edu gov org ",za:" ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ",zm:" ac co com edu gov net org sch ",com:"ar br cn de eu gb gr hu jpn kr no qc ru sa se uk us uy za ",net:"gb jp se uk ",
    org:"ae",de:"com "},has:function(d){var b=d.lastIndexOf(".");if(0>=b||b>=d.length-1)return!1;var k=d.lastIndexOf(".",b-1);if(0>=k||k>=b-1)return!1;var u=g.list[d.slice(b+1)];return u?0<=u.indexOf(" "+d.slice(k+1,b)+" "):!1},is:function(d){var b=d.lastIndexOf(".");if(0>=b||b>=d.length-1||0<=d.lastIndexOf(".",b-1))return!1;var k=g.list[d.slice(b+1)];return k?0<=k.indexOf(" "+d.slice(0,b)+" "):!1},get:function(d){var b=d.lastIndexOf(".");if(0>=b||b>=d.length-1)return null;var k=d.lastIndexOf(".",b-1);
    if(0>=k||k>=b-1)return null;var u=g.list[d.slice(b+1)];return!u||0>u.indexOf(" "+d.slice(k+1,b)+" ")?null:d.slice(k+1)},noConflict:function(){d.SecondLevelDomains===this&&(d.SecondLevelDomains=k);return this}};return g});
(function(d,k){"object"===typeof module&&module.exports?module.exports=k(require("./punycode"),require("./IPv6"),require("./SecondLevelDomains")):"function"===typeof define&&define.amd?define(["./punycode","./IPv6","./SecondLevelDomains"],k):d.URI=k(d.punycode,d.IPv6,d.SecondLevelDomains,d)})(this,function(d,k,g,u){function b(a,c){var e=1<=arguments.length,n=2<=arguments.length;if(!(this instanceof b))return e?n?new b(a,c):new b(a):new b;if(void 0===a){if(e)throw new TypeError("undefined is not a valid argument for URI");
    a="undefined"!==typeof location?location.href+"":""}if(null===a&&e)throw new TypeError("null is not a valid argument for URI");this.href(a);return void 0!==c?this.absoluteTo(c):this}function p(a){return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}function B(a){return void 0===a?"Undefined":String(Object.prototype.toString.call(a)).slice(8,-1)}function t(a){return"Array"===B(a)}function m(a,c){var e={},b;if("RegExp"===B(c))e=null;else if(t(c)){var l=0;for(b=c.length;l<b;l++)e[c[l]]=!0}else e[c]=
    !0;l=0;for(b=a.length;l<b;l++)if(e&&void 0!==e[a[l]]||!e&&c.test(a[l]))a.splice(l,1),b--,l--;return a}function r(a,c){var e;if(t(c)){var b=0;for(e=c.length;b<e;b++)if(!r(a,c[b]))return!1;return!0}var l=B(c);b=0;for(e=a.length;b<e;b++)if("RegExp"===l){if("string"===typeof a[b]&&a[b].match(c))return!0}else if(a[b]===c)return!0;return!1}function w(a,c){if(!t(a)||!t(c)||a.length!==c.length)return!1;a.sort();c.sort();for(var e=0,b=a.length;e<b;e++)if(a[e]!==c[e])return!1;return!0}function h(a){return a.replace(/^\/+|\/+$/g,
    "")}function q(a){return escape(a)}function v(a){return encodeURIComponent(a).replace(/[!'()*]/g,q).replace(/\*/g,"%2A")}function D(a){return function(c,e){if(void 0===c)return this._parts[a]||"";this._parts[a]=c||null;this.build(!e);return this}}function E(a,c){return function(e,b){if(void 0===e)return this._parts[a]||"";null!==e&&(e+="",e.charAt(0)===c&&(e=e.substring(1)));this._parts[a]=e;this.build(!b);return this}}var A=u&&u.URI;b.version="1.18.10";var f=b.prototype,y=Object.prototype.hasOwnProperty;
    b._parts=function(){return{protocol:null,username:null,password:null,hostname:null,urn:null,port:null,path:null,query:null,fragment:null,duplicateQueryParameters:b.duplicateQueryParameters,escapeQuerySpace:b.escapeQuerySpace}};b.duplicateQueryParameters=!1;b.escapeQuerySpace=!0;b.protocol_expression=/^[a-z][a-z0-9.+-]*$/i;b.idn_expression=/[^a-z0-9\.-]/i;b.punycode_expression=/(xn--)/i;b.ip4_expression=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;b.ip6_expression=/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    b.find_uri_expression=/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/ig;b.findUri={start:/\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,end:/[\s\r\n]|$/,trim:/[`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019]+$/,parens:/(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g};b.defaultPorts={http:"80",https:"443",ftp:"21",
        gopher:"70",ws:"80",wss:"443"};b.invalid_hostname_characters=/[^a-zA-Z0-9\.-]/;b.domAttributes={a:"href",blockquote:"cite",link:"href",base:"href",script:"src",form:"action",img:"src",area:"href",iframe:"src",embed:"src",source:"src",track:"src",input:"src",audio:"src",video:"src"};b.getDomAttribute=function(a){if(a&&a.nodeName){var c=a.nodeName.toLowerCase();if("input"!==c||"image"===a.type)return b.domAttributes[c]}};b.encode=v;b.decode=decodeURIComponent;b.iso8859=function(){b.encode=escape;b.decode=
        unescape};b.unicode=function(){b.encode=v;b.decode=decodeURIComponent};b.characters={pathname:{encode:{expression:/%(24|26|2B|2C|3B|3D|3A|40)/ig,map:{"%24":"$","%26":"&","%2B":"+","%2C":",","%3B":";","%3D":"=","%3A":":","%40":"@"}},decode:{expression:/[\/\?#]/g,map:{"/":"%2F","?":"%3F","#":"%23"}}},reserved:{encode:{expression:/%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,map:{"%3A":":","%2F":"/","%3F":"?","%23":"#","%5B":"[","%5D":"]","%40":"@","%21":"!","%24":"$","%26":"&","%27":"'",
        "%28":"(","%29":")","%2A":"*","%2B":"+","%2C":",","%3B":";","%3D":"="}}},urnpath:{encode:{expression:/%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,map:{"%21":"!","%24":"$","%27":"'","%28":"(","%29":")","%2A":"*","%2B":"+","%2C":",","%3B":";","%3D":"=","%40":"@"}},decode:{expression:/[\/\?#:]/g,map:{"/":"%2F","?":"%3F","#":"%23",":":"%3A"}}}};b.encodeQuery=function(a,c){var e=b.encode(a+"");void 0===c&&(c=b.escapeQuerySpace);return c?e.replace(/%20/g,"+"):e};b.decodeQuery=function(a,c){a+="";void 0===c&&
    (c=b.escapeQuerySpace);try{return b.decode(c?a.replace(/\+/g,"%20"):a)}catch(e){return a}};var C={encode:"encode",decode:"decode"},z,F=function(a,c){return function(e){try{return b[c](e+"").replace(b.characters[a][c].expression,function(e){return b.characters[a][c].map[e]})}catch(n){return e}}};for(z in C)b[z+"PathSegment"]=F("pathname",C[z]),b[z+"UrnPathSegment"]=F("urnpath",C[z]);C=function(a,c,e){return function(n){var l=e?function(a){return b[c](b[e](a))}:b[c];n=(n+"").split(a);for(var d=0,f=
        n.length;d<f;d++)n[d]=l(n[d]);return n.join(a)}};b.decodePath=C("/","decodePathSegment");b.decodeUrnPath=C(":","decodeUrnPathSegment");b.recodePath=C("/","encodePathSegment","decode");b.recodeUrnPath=C(":","encodeUrnPathSegment","decode");b.encodeReserved=F("reserved","encode");b.parse=function(a,c){c||(c={});var e=a.indexOf("#");-1<e&&(c.fragment=a.substring(e+1)||null,a=a.substring(0,e));e=a.indexOf("?");-1<e&&(c.query=a.substring(e+1)||null,a=a.substring(0,e));"//"===a.substring(0,2)?(c.protocol=
        null,a=a.substring(2),a=b.parseAuthority(a,c)):(e=a.indexOf(":"),-1<e&&(c.protocol=a.substring(0,e)||null,c.protocol&&!c.protocol.match(b.protocol_expression)?c.protocol=void 0:"//"===a.substring(e+1,e+3)?(a=a.substring(e+3),a=b.parseAuthority(a,c)):(a=a.substring(e+1),c.urn=!0)));c.path=a;return c};b.parseHost=function(a,c){a=a.replace(/\\/g,"/");var e=a.indexOf("/");-1===e&&(e=a.length);if("["===a.charAt(0)){var b=a.indexOf("]");c.hostname=a.substring(1,b)||null;c.port=a.substring(b+2,e)||null;
        "/"===c.port&&(c.port=null)}else{var l=a.indexOf(":");b=a.indexOf("/");l=a.indexOf(":",l+1);-1!==l&&(-1===b||l<b)?(c.hostname=a.substring(0,e)||null,c.port=null):(b=a.substring(0,e).split(":"),c.hostname=b[0]||null,c.port=b[1]||null)}c.hostname&&"/"!==a.substring(e).charAt(0)&&(e++,a="/"+a);return a.substring(e)||"/"};b.parseAuthority=function(a,c){a=b.parseUserinfo(a,c);return b.parseHost(a,c)};b.parseUserinfo=function(a,c){var e=a.indexOf("/"),n=a.lastIndexOf("@",-1<e?e:a.length-1);-1<n&&(-1===
    e||n<e)?(e=a.substring(0,n).split(":"),c.username=e[0]?b.decode(e[0]):null,e.shift(),c.password=e[0]?b.decode(e.join(":")):null,a=a.substring(n+1)):(c.username=null,c.password=null);return a};b.parseQuery=function(a,c){if(!a)return{};a=a.replace(/&+/g,"&").replace(/^\?*&*|&+$/g,"");if(!a)return{};for(var e={},n=a.split("&"),l=n.length,d,f,h=0;h<l;h++)if(d=n[h].split("="),f=b.decodeQuery(d.shift(),c),d=d.length?b.decodeQuery(d.join("="),c):null,y.call(e,f)){if("string"===typeof e[f]||null===e[f])e[f]=
        [e[f]];e[f].push(d)}else e[f]=d;return e};b.build=function(a){var c="";a.protocol&&(c+=a.protocol+":");a.urn||!c&&!a.hostname||(c+="//");c+=b.buildAuthority(a)||"";"string"===typeof a.path&&("/"!==a.path.charAt(0)&&"string"===typeof a.hostname&&(c+="/"),c+=a.path);"string"===typeof a.query&&a.query&&(c+="?"+a.query);"string"===typeof a.fragment&&a.fragment&&(c+="#"+a.fragment);return c};b.buildHost=function(a){var c="";if(a.hostname)c=b.ip6_expression.test(a.hostname)?c+("["+a.hostname+"]"):c+a.hostname;
    else return"";a.port&&(c+=":"+a.port);return c};b.buildAuthority=function(a){return b.buildUserinfo(a)+b.buildHost(a)};b.buildUserinfo=function(a){var c="";a.username&&(c+=b.encode(a.username));a.password&&(c+=":"+b.encode(a.password));c&&(c+="@");return c};b.buildQuery=function(a,c,e){var n="",l,d;for(l in a)if(y.call(a,l)&&l)if(t(a[l])){var f={};var h=0;for(d=a[l].length;h<d;h++)void 0!==a[l][h]&&void 0===f[a[l][h]+""]&&(n+="&"+b.buildQueryParameter(l,a[l][h],e),!0!==c&&(f[a[l][h]+""]=!0))}else void 0!==
    a[l]&&(n+="&"+b.buildQueryParameter(l,a[l],e));return n.substring(1)};b.buildQueryParameter=function(a,c,e){return b.encodeQuery(a,e)+(null!==c?"="+b.encodeQuery(c,e):"")};b.addQuery=function(a,c,e){if("object"===typeof c)for(var n in c)y.call(c,n)&&b.addQuery(a,n,c[n]);else if("string"===typeof c)void 0===a[c]?a[c]=e:("string"===typeof a[c]&&(a[c]=[a[c]]),t(e)||(e=[e]),a[c]=(a[c]||[]).concat(e));else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");};b.removeQuery=
        function(a,c,e){var n;if(t(c))for(e=0,n=c.length;e<n;e++)a[c[e]]=void 0;else if("RegExp"===B(c))for(n in a)c.test(n)&&(a[n]=void 0);else if("object"===typeof c)for(n in c)y.call(c,n)&&b.removeQuery(a,n,c[n]);else if("string"===typeof c)void 0!==e?"RegExp"===B(e)?!t(a[c])&&e.test(a[c])?a[c]=void 0:a[c]=m(a[c],e):a[c]!==String(e)||t(e)&&1!==e.length?t(a[c])&&(a[c]=m(a[c],e)):a[c]=void 0:a[c]=void 0;else throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");
        };b.hasQuery=function(a,c,e,n){switch(B(c)){case "String":break;case "RegExp":for(var l in a)if(y.call(a,l)&&c.test(l)&&(void 0===e||b.hasQuery(a,l,e)))return!0;return!1;case "Object":for(var d in c)if(y.call(c,d)&&!b.hasQuery(a,d,c[d]))return!1;return!0;default:throw new TypeError("URI.hasQuery() accepts a string, regular expression or object as the name parameter");}switch(B(e)){case "Undefined":return c in a;case "Boolean":return a=!(t(a[c])?!a[c].length:!a[c]),e===a;case "Function":return!!e(a[c],
        c,a);case "Array":return t(a[c])?(n?r:w)(a[c],e):!1;case "RegExp":return t(a[c])?n?r(a[c],e):!1:!(!a[c]||!a[c].match(e));case "Number":e=String(e);case "String":return t(a[c])?n?r(a[c],e):!1:a[c]===e;default:throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");}};b.joinPaths=function(){for(var a=[],c=[],e=0,n=0;n<arguments.length;n++){var l=new b(arguments[n]);a.push(l);for(var l=l.segment(),d=0;d<l.length;d++)"string"===typeof l[d]&&
    c.push(l[d]),l[d]&&e++}if(!c.length||!e)return new b("");c=(new b("")).segment(c);""!==a[0].path()&&"/"!==a[0].path().slice(0,1)||c.path("/"+c.path());return c.normalize()};b.commonPath=function(a,c){var e=Math.min(a.length,c.length),b;for(b=0;b<e;b++)if(a.charAt(b)!==c.charAt(b)){b--;break}if(1>b)return a.charAt(0)===c.charAt(0)&&"/"===a.charAt(0)?"/":"";if("/"!==a.charAt(b)||"/"!==c.charAt(b))b=a.substring(0,b).lastIndexOf("/");return a.substring(0,b+1)};b.withinString=function(a,c,e){e||(e={});
        var d=e.start||b.findUri.start,l=e.end||b.findUri.end,f=e.trim||b.findUri.trim,h=e.parens||b.findUri.parens,g=/[a-z0-9-]=["']?$/i;for(d.lastIndex=0;;){var m=d.exec(a);if(!m)break;var q=m.index;if(e.ignoreHtml){var k=a.slice(Math.max(q-3,0),q);if(k&&g.test(k))continue}for(var v=q+a.slice(q).search(l),k=a.slice(q,v),v=-1;;){var r=h.exec(k);if(!r)break;v=Math.max(v,r.index+r[0].length)}k=-1<v?k.slice(0,v)+k.slice(v).replace(f,""):k.replace(f,"");k.length<=m[0].length||e.ignore&&e.ignore.test(k)||(v=
            q+k.length,m=c(k,q,v,a),void 0===m?d.lastIndex=v:(m=String(m),a=a.slice(0,q)+m+a.slice(v),d.lastIndex=q+m.length))}d.lastIndex=0;return a};b.ensureValidHostname=function(a){if(a.match(b.invalid_hostname_characters)){if(!d)throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-] and Punycode.js is not available');if(d.toASCII(a).match(b.invalid_hostname_characters))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');}};b.noConflict=function(a){if(a)return a=
    {URI:this.noConflict()},u.URITemplate&&"function"===typeof u.URITemplate.noConflict&&(a.URITemplate=u.URITemplate.noConflict()),u.IPv6&&"function"===typeof u.IPv6.noConflict&&(a.IPv6=u.IPv6.noConflict()),u.SecondLevelDomains&&"function"===typeof u.SecondLevelDomains.noConflict&&(a.SecondLevelDomains=u.SecondLevelDomains.noConflict()),a;u.URI===this&&(u.URI=A);return this};f.build=function(a){if(!0===a)this._deferred_build=!0;else if(void 0===a||this._deferred_build)this._string=b.build(this._parts),
        this._deferred_build=!1;return this};f.clone=function(){return new b(this)};f.valueOf=f.toString=function(){return this.build(!1)._string};f.protocol=D("protocol");f.username=D("username");f.password=D("password");f.hostname=D("hostname");f.port=D("port");f.query=E("query","?");f.fragment=E("fragment","#");f.search=function(a,c){var b=this.query(a,c);return"string"===typeof b&&b.length?"?"+b:b};f.hash=function(a,c){var b=this.fragment(a,c);return"string"===typeof b&&b.length?"#"+b:b};f.pathname=function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     c){if(void 0===a||!0===a){var e=this._parts.path||(this._parts.hostname?"/":"");return a?(this._parts.urn?b.decodeUrnPath:b.decodePath)(e):e}this._parts.path=this._parts.urn?a?b.recodeUrnPath(a):"":a?b.recodePath(a):"/";this.build(!c);return this};f.path=f.pathname;f.href=function(a,c){var e;if(void 0===a)return this.toString();this._string="";this._parts=b._parts();var d=a instanceof b,l="object"===typeof a&&(a.hostname||a.path||a.pathname);a.nodeName&&(l=b.getDomAttribute(a),a=a[l]||"",l=!1);!d&&
    l&&void 0!==a.pathname&&(a=a.toString());if("string"===typeof a||a instanceof String)this._parts=b.parse(String(a),this._parts);else if(d||l)for(e in d=d?a._parts:a,d)y.call(this._parts,e)&&(this._parts[e]=d[e]);else throw new TypeError("invalid input");this.build(!c);return this};f.is=function(a){var c=!1,e=!1,d=!1,l=!1,f=!1,h=!1,m=!1,q=!this._parts.urn;this._parts.hostname&&(q=!1,e=b.ip4_expression.test(this._parts.hostname),d=b.ip6_expression.test(this._parts.hostname),c=e||d,f=(l=!c)&&g&&g.has(this._parts.hostname),
        h=l&&b.idn_expression.test(this._parts.hostname),m=l&&b.punycode_expression.test(this._parts.hostname));switch(a.toLowerCase()){case "relative":return q;case "absolute":return!q;case "domain":case "name":return l;case "sld":return f;case "ip":return c;case "ip4":case "ipv4":case "inet4":return e;case "ip6":case "ipv6":case "inet6":return d;case "idn":return h;case "url":return!this._parts.urn;case "urn":return!!this._parts.urn;case "punycode":return m}return null};var G=f.protocol,H=f.port,I=f.hostname;
    f.protocol=function(a,c){if(void 0!==a&&a&&(a=a.replace(/:(\/\/)?$/,""),!a.match(b.protocol_expression)))throw new TypeError('Protocol "'+a+"\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");return G.call(this,a,c)};f.scheme=f.protocol;f.port=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0!==a&&(0===a&&(a=null),a&&(a+="",":"===a.charAt(0)&&(a=a.substring(1)),a.match(/[^0-9]/))))throw new TypeError('Port "'+a+'" contains characters other than [0-9]');
        return H.call(this,a,c)};f.hostname=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0!==a){var e={};if("/"!==b.parseHost(a,e))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');a=e.hostname}return I.call(this,a,c)};f.origin=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){var e=this.protocol();return this.authority()?(e?e+"://":"")+this.authority():""}e=b(a);this.protocol(e.protocol()).authority(e.authority()).build(!c);return this};
    f.host=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a)return this._parts.hostname?b.buildHost(this._parts):"";if("/"!==b.parseHost(a,this._parts))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');this.build(!c);return this};f.authority=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a)return this._parts.hostname?b.buildAuthority(this._parts):"";if("/"!==b.parseAuthority(a,this._parts))throw new TypeError('Hostname "'+
        a+'" contains characters other than [A-Z0-9.-]');this.build(!c);return this};f.userinfo=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){var e=b.buildUserinfo(this._parts);return e?e.substring(0,e.length-1):e}"@"!==a[a.length-1]&&(a+="@");b.parseUserinfo(a,this._parts);this.build(!c);return this};f.resource=function(a,c){if(void 0===a)return this.path()+this.search()+this.hash();var e=b.parse(a);this._parts.path=e.path;this._parts.query=e.query;this._parts.fragment=e.fragment;
        this.build(!c);return this};f.subdomain=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){if(!this._parts.hostname||this.is("IP"))return"";var e=this._parts.hostname.length-this.domain().length-1;return this._parts.hostname.substring(0,e)||""}e=this._parts.hostname.length-this.domain().length;e=this._parts.hostname.substring(0,e);e=new RegExp("^"+p(e));a&&"."!==a.charAt(a.length-1)&&(a+=".");a&&b.ensureValidHostname(a);this._parts.hostname=this._parts.hostname.replace(e,a);
        this.build(!c);return this};f.domain=function(a,c){if(this._parts.urn)return void 0===a?"":this;"boolean"===typeof a&&(c=a,a=void 0);if(void 0===a){if(!this._parts.hostname||this.is("IP"))return"";var e=this._parts.hostname.match(/\./g);if(e&&2>e.length)return this._parts.hostname;e=this._parts.hostname.length-this.tld(c).length-1;e=this._parts.hostname.lastIndexOf(".",e-1)+1;return this._parts.hostname.substring(e)||""}if(!a)throw new TypeError("cannot set domain empty");b.ensureValidHostname(a);
        !this._parts.hostname||this.is("IP")?this._parts.hostname=a:(e=new RegExp(p(this.domain())+"$"),this._parts.hostname=this._parts.hostname.replace(e,a));this.build(!c);return this};f.tld=function(a,c){if(this._parts.urn)return void 0===a?"":this;"boolean"===typeof a&&(c=a,a=void 0);if(void 0===a){if(!this._parts.hostname||this.is("IP"))return"";var b=this._parts.hostname.lastIndexOf("."),b=this._parts.hostname.substring(b+1);return!0!==c&&g&&g.list[b.toLowerCase()]?g.get(this._parts.hostname)||b:b}if(a)if(a.match(/[^a-zA-Z0-9-]/))if(g&&
        g.is(a))b=new RegExp(p(this.tld())+"$"),this._parts.hostname=this._parts.hostname.replace(b,a);else throw new TypeError('TLD "'+a+'" contains characters other than [A-Z0-9]');else{if(!this._parts.hostname||this.is("IP"))throw new ReferenceError("cannot set TLD on non-domain host");b=new RegExp(p(this.tld())+"$");this._parts.hostname=this._parts.hostname.replace(b,a)}else throw new TypeError("cannot set TLD empty");this.build(!c);return this};f.directory=function(a,c){if(this._parts.urn)return void 0===
    a?"":this;if(void 0===a||!0===a){if(!this._parts.path&&!this._parts.hostname)return"";if("/"===this._parts.path)return"/";var e=this._parts.path.length-this.filename().length-1,e=this._parts.path.substring(0,e)||(this._parts.hostname?"/":"");return a?b.decodePath(e):e}e=this._parts.path.length-this.filename().length;e=this._parts.path.substring(0,e);e=new RegExp("^"+p(e));this.is("relative")||(a||(a="/"),"/"!==a.charAt(0)&&(a="/"+a));a&&"/"!==a.charAt(a.length-1)&&(a+="/");a=b.recodePath(a);this._parts.path=
        this._parts.path.replace(e,a);this.build(!c);return this};f.filename=function(a,c){if(this._parts.urn)return void 0===a?"":this;if("string"!==typeof a){if(!this._parts.path||"/"===this._parts.path)return"";var e=this._parts.path.lastIndexOf("/"),e=this._parts.path.substring(e+1);return a?b.decodePathSegment(e):e}e=!1;"/"===a.charAt(0)&&(a=a.substring(1));a.match(/\.?\//)&&(e=!0);var d=new RegExp(p(this.filename())+"$");a=b.recodePath(a);this._parts.path=this._parts.path.replace(d,a);e?this.normalizePath(c):
        this.build(!c);return this};f.suffix=function(a,c){if(this._parts.urn)return void 0===a?"":this;if(void 0===a||!0===a){if(!this._parts.path||"/"===this._parts.path)return"";var e=this.filename(),d=e.lastIndexOf(".");if(-1===d)return"";e=e.substring(d+1);e=/^[a-z0-9%]+$/i.test(e)?e:"";return a?b.decodePathSegment(e):e}"."===a.charAt(0)&&(a=a.substring(1));if(e=this.suffix())d=a?new RegExp(p(e)+"$"):new RegExp(p("."+e)+"$");else{if(!a)return this;this._parts.path+="."+b.recodePath(a)}d&&(a=b.recodePath(a),
        this._parts.path=this._parts.path.replace(d,a));this.build(!c);return this};f.segment=function(a,c,b){var e=this._parts.urn?":":"/",d=this.path(),f="/"===d.substring(0,1),d=d.split(e);void 0!==a&&"number"!==typeof a&&(b=c,c=a,a=void 0);if(void 0!==a&&"number"!==typeof a)throw Error('Bad segment "'+a+'", must be 0-based integer');f&&d.shift();0>a&&(a=Math.max(d.length+a,0));if(void 0===c)return void 0===a?d:d[a];if(null===a||void 0===d[a])if(t(c)){d=[];a=0;for(var m=c.length;a<m;a++)if(c[a].length||
        d.length&&d[d.length-1].length)d.length&&!d[d.length-1].length&&d.pop(),d.push(h(c[a]))}else{if(c||"string"===typeof c)c=h(c),""===d[d.length-1]?d[d.length-1]=c:d.push(c)}else c?d[a]=h(c):d.splice(a,1);f&&d.unshift("");return this.path(d.join(e),b)};f.segmentCoded=function(a,c,e){var d;"number"!==typeof a&&(e=c,c=a,a=void 0);if(void 0===c){a=this.segment(a,c,e);if(t(a)){var f=0;for(d=a.length;f<d;f++)a[f]=b.decode(a[f])}else a=void 0!==a?b.decode(a):void 0;return a}if(t(c))for(f=0,d=c.length;f<d;f++)c[f]=
        b.encode(c[f]);else c="string"===typeof c||c instanceof String?b.encode(c):c;return this.segment(a,c,e)};var J=f.query;f.query=function(a,c){if(!0===a)return b.parseQuery(this._parts.query,this._parts.escapeQuerySpace);if("function"===typeof a){var e=b.parseQuery(this._parts.query,this._parts.escapeQuerySpace),d=a.call(this,e);this._parts.query=b.buildQuery(d||e,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);this.build(!c);return this}return void 0!==a&&"string"!==typeof a?(this._parts.query=
        b.buildQuery(a,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace),this.build(!c),this):J.call(this,a,c)};f.setQuery=function(a,c,e){var d=b.parseQuery(this._parts.query,this._parts.escapeQuerySpace);if("string"===typeof a||a instanceof String)d[a]=void 0!==c?c:null;else if("object"===typeof a)for(var f in a)y.call(a,f)&&(d[f]=a[f]);else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");this._parts.query=b.buildQuery(d,this._parts.duplicateQueryParameters,
        this._parts.escapeQuerySpace);"string"!==typeof a&&(e=c);this.build(!e);return this};f.addQuery=function(a,c,e){var d=b.parseQuery(this._parts.query,this._parts.escapeQuerySpace);b.addQuery(d,a,void 0===c?null:c);this._parts.query=b.buildQuery(d,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);"string"!==typeof a&&(e=c);this.build(!e);return this};f.removeQuery=function(a,c,e){var d=b.parseQuery(this._parts.query,this._parts.escapeQuerySpace);b.removeQuery(d,a,c);this._parts.query=
        b.buildQuery(d,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);"string"!==typeof a&&(e=c);this.build(!e);return this};f.hasQuery=function(a,c,e){var d=b.parseQuery(this._parts.query,this._parts.escapeQuerySpace);return b.hasQuery(d,a,c,e)};f.setSearch=f.setQuery;f.addSearch=f.addQuery;f.removeSearch=f.removeQuery;f.hasSearch=f.hasQuery;f.normalize=function(){return this._parts.urn?this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build():this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build()};
    f.normalizeProtocol=function(a){"string"===typeof this._parts.protocol&&(this._parts.protocol=this._parts.protocol.toLowerCase(),this.build(!a));return this};f.normalizeHostname=function(a){this._parts.hostname&&(this.is("IDN")&&d?this._parts.hostname=d.toASCII(this._parts.hostname):this.is("IPv6")&&k&&(this._parts.hostname=k.best(this._parts.hostname)),this._parts.hostname=this._parts.hostname.toLowerCase(),this.build(!a));return this};f.normalizePort=function(a){"string"===typeof this._parts.protocol&&
    this._parts.port===b.defaultPorts[this._parts.protocol]&&(this._parts.port=null,this.build(!a));return this};f.normalizePath=function(a){var c=this._parts.path;if(!c)return this;if(this._parts.urn)return this._parts.path=b.recodeUrnPath(this._parts.path),this.build(!a),this;if("/"===this._parts.path)return this;var c=b.recodePath(c),e="";if("/"!==c.charAt(0)){var d=!0;c="/"+c}if("/.."===c.slice(-3)||"/."===c.slice(-2))c+="/";c=c.replace(/(\/(\.\/)+)|(\/\.$)/g,"/").replace(/\/{2,}/g,"/");d&&(e=c.substring(1).match(/^(\.\.\/)+/)||
        "")&&(e=e[0]);for(;;){var f=c.search(/\/\.\.(\/|$)/);if(-1===f)break;else if(0===f){c=c.substring(3);continue}var h=c.substring(0,f).lastIndexOf("/");-1===h&&(h=f);c=c.substring(0,h)+c.substring(f+3)}d&&this.is("relative")&&(c=e+c.substring(1));this._parts.path=c;this.build(!a);return this};f.normalizePathname=f.normalizePath;f.normalizeQuery=function(a){"string"===typeof this._parts.query&&(this._parts.query.length?this.query(b.parseQuery(this._parts.query,this._parts.escapeQuerySpace)):this._parts.query=
        null,this.build(!a));return this};f.normalizeFragment=function(a){this._parts.fragment||(this._parts.fragment=null,this.build(!a));return this};f.normalizeSearch=f.normalizeQuery;f.normalizeHash=f.normalizeFragment;f.iso8859=function(){var a=b.encode,c=b.decode;b.encode=escape;b.decode=decodeURIComponent;try{this.normalize()}finally{b.encode=a,b.decode=c}return this};f.unicode=function(){var a=b.encode,c=b.decode;b.encode=v;b.decode=unescape;try{this.normalize()}finally{b.encode=a,b.decode=c}return this};
    f.readable=function(){var a=this.clone();a.username("").password("").normalize();var c="";a._parts.protocol&&(c+=a._parts.protocol+"://");a._parts.hostname&&(a.is("punycode")&&d?(c+=d.toUnicode(a._parts.hostname),a._parts.port&&(c+=":"+a._parts.port)):c+=a.host());a._parts.hostname&&a._parts.path&&"/"!==a._parts.path.charAt(0)&&(c+="/");c+=a.path(!0);if(a._parts.query){for(var e="",f=0,h=a._parts.query.split("&"),m=h.length;f<m;f++){var g=(h[f]||"").split("="),e=e+("&"+b.decodeQuery(g[0],this._parts.escapeQuerySpace).replace(/&/g,
            "%26"));void 0!==g[1]&&(e+="="+b.decodeQuery(g[1],this._parts.escapeQuerySpace).replace(/&/g,"%26"))}c+="?"+e.substring(1)}return c+=b.decodeQuery(a.hash(),!0)};f.absoluteTo=function(a){var c=this.clone(),e=["protocol","username","password","hostname","port"],d,f;if(this._parts.urn)throw Error("URNs do not have any generally defined hierarchical components");a instanceof b||(a=new b(a));if(c._parts.protocol)return c;c._parts.protocol=a._parts.protocol;if(this._parts.hostname)return c;for(d=0;f=e[d];d++)c._parts[f]=
        a._parts[f];c._parts.path?(".."===c._parts.path.substring(-2)&&(c._parts.path+="/"),"/"!==c.path().charAt(0)&&(e=(e=a.directory())?e:0===a.path().indexOf("/")?"/":"",c._parts.path=(e?e+"/":"")+c._parts.path,c.normalizePath())):(c._parts.path=a._parts.path,c._parts.query||(c._parts.query=a._parts.query));c.build();return c};f.relativeTo=function(a){var c=this.clone().normalize();if(c._parts.urn)throw Error("URNs do not have any generally defined hierarchical components");a=(new b(a)).normalize();var e=
        c._parts;var d=a._parts;var f=c.path();a=a.path();if("/"!==f.charAt(0))throw Error("URI is already relative");if("/"!==a.charAt(0))throw Error("Cannot calculate a URI relative to another relative URI");e.protocol===d.protocol&&(e.protocol=null);if(e.username===d.username&&e.password===d.password&&null===e.protocol&&null===e.username&&null===e.password&&e.hostname===d.hostname&&e.port===d.port)e.hostname=null,e.port=null;else return c.build();if(f===a)return e.path="",c.build();f=b.commonPath(f,a);
        if(!f)return c.build();d=d.path.substring(f.length).replace(/[^\/]*$/,"").replace(/.*?\//g,"../");e.path=d+e.path.substring(f.length)||"./";return c.build()};f.equals=function(a){var c=this.clone(),e=new b(a);a={};var d;c.normalize();e.normalize();if(c.toString()===e.toString())return!0;var f=c.query();var h=e.query();c.query("");e.query("");if(c.toString()!==e.toString()||f.length!==h.length)return!1;c=b.parseQuery(f,this._parts.escapeQuerySpace);h=b.parseQuery(h,this._parts.escapeQuerySpace);for(d in c)if(y.call(c,
            d)){if(!t(c[d])){if(c[d]!==h[d])return!1}else if(!w(c[d],h[d]))return!1;a[d]=!0}for(d in h)if(y.call(h,d)&&!a[d])return!1;return!0};f.duplicateQueryParameters=function(a){this._parts.duplicateQueryParameters=!!a;return this};f.escapeQuerySpace=function(a){this._parts.escapeQuerySpace=!!a;return this};return b});
(function(d,k){"object"===typeof module&&module.exports?module.exports=k(require("./URI")):"function"===typeof define&&define.amd?define(["./URI"],k):d.URITemplate=k(d.URI,d)})(this,function(d,k){function g(b){if(g._cache[b])return g._cache[b];if(!(this instanceof g))return new g(b);this.expression=b;g._cache[b]=this;return this}function u(b){this.data=b;this.cache={}}var b=k&&k.URITemplate,p=Object.prototype.hasOwnProperty,B=g.prototype,t={"":{prefix:"",separator:",",named:!1,empty_name_separator:!1,
    encode:"encode"},"+":{prefix:"",separator:",",named:!1,empty_name_separator:!1,encode:"encodeReserved"},"#":{prefix:"#",separator:",",named:!1,empty_name_separator:!1,encode:"encodeReserved"},".":{prefix:".",separator:".",named:!1,empty_name_separator:!1,encode:"encode"},"/":{prefix:"/",separator:"/",named:!1,empty_name_separator:!1,encode:"encode"},";":{prefix:";",separator:";",named:!0,empty_name_separator:!1,encode:"encode"},"?":{prefix:"?",separator:"&",named:!0,empty_name_separator:!0,encode:"encode"},
    "&":{prefix:"&",separator:"&",named:!0,empty_name_separator:!0,encode:"encode"}};g._cache={};g.EXPRESSION_PATTERN=/\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;g.VARIABLE_PATTERN=/^([^*:.](?:\.?[^*:.])*)((\*)|:(\d+))?$/;g.VARIABLE_NAME_PATTERN=/[^a-zA-Z0-9%_.]/;g.LITERAL_PATTERN=/[<>{}"`^| \\]/;g.expand=function(b,d,k){var h=t[b.operator],m=h.named?"Named":"Unnamed";b=b.variables;var v=[],r,p;for(p=0;r=b[p];p++){var w=d.get(r.name);if(0===w.type&&k&&k.strict)throw Error('Missing expansion value for variable "'+
    r.name+'"');if(w.val.length){if(1<w.type&&r.maxlength)throw Error('Invalid expression: Prefix modifier not applicable to variable "'+r.name+'"');v.push(g["expand"+m](w,h,r.explode,r.explode&&h.separator||",",r.maxlength,r.name))}else w.type&&v.push("")}return v.length?h.prefix+v.join(h.separator):""};g.expandNamed=function(b,g,k,h,q,v){var m="",r=g.encode;g=g.empty_name_separator;var p=!b[r].length,f=2===b.type?"":d[r](v),t;var w=0;for(t=b.val.length;w<t;w++){if(q){var u=d[r](b.val[w][1].substring(0,
    q));2===b.type&&(f=d[r](b.val[w][0].substring(0,q)))}else p?(u=d[r](b.val[w][1]),2===b.type?(f=d[r](b.val[w][0]),b[r].push([f,u])):b[r].push([void 0,u])):(u=b[r][w][1],2===b.type&&(f=b[r][w][0]));m&&(m+=h);k?m+=f+(g||u?"=":"")+u:(w||(m+=d[r](v)+(g||u?"=":"")),2===b.type&&(m+=f+","),m+=u)}return m};g.expandUnnamed=function(b,g,k,h,q){var m="",r=g.encode;g=g.empty_name_separator;var p=!b[r].length,w;var f=0;for(w=b.val.length;f<w;f++){if(q)var t=d[r](b.val[f][1].substring(0,q));else p?(t=d[r](b.val[f][1]),
    b[r].push([2===b.type?d[r](b.val[f][0]):void 0,t])):t=b[r][f][1];m&&(m+=h);if(2===b.type){var u=q?d[r](b.val[f][0].substring(0,q)):b[r][f][0];m+=u;m=k?m+(g||t?"=":""):m+","}m+=t}return m};g.noConflict=function(){k.URITemplate===g&&(k.URITemplate=b);return g};B.expand=function(b,d){var k="";this.parts&&this.parts.length||this.parse();b instanceof u||(b=new u(b));for(var h=0,q=this.parts.length;h<q;h++)k+="string"===typeof this.parts[h]?this.parts[h]:g.expand(this.parts[h],b,d);return k};B.parse=function(){var b=
    this.expression,d=g.EXPRESSION_PATTERN,k=g.VARIABLE_PATTERN,h=g.VARIABLE_NAME_PATTERN,q=g.LITERAL_PATTERN,v=[],p=0,u=function(b){if(b.match(q))throw Error('Invalid Literal "'+b+'"');return b};for(d.lastIndex=0;;){var A=d.exec(b);if(null===A){v.push(u(b.substring(p)));break}else v.push(u(b.substring(p,A.index))),p=A.index+A[0].length;if(!t[A[1]])throw Error('Unknown Operator "'+A[1]+'" in "'+A[0]+'"');if(!A[3])throw Error('Unclosed Expression "'+A[0]+'"');var f=A[2].split(",");for(var y=0,B=f.length;y<
B;y++){var z=f[y].match(k);if(null===z)throw Error('Invalid Variable "'+f[y]+'" in "'+A[0]+'"');if(z[1].match(h))throw Error('Invalid Variable Name "'+z[1]+'" in "'+A[0]+'"');f[y]={name:z[1],explode:!!z[3],maxlength:z[4]&&parseInt(z[4],10)}}if(!f.length)throw Error('Expression Missing Variable(s) "'+A[0]+'"');v.push({expression:A[0],operator:A[1],variables:f})}v.length||v.push(u(b));this.parts=v;return this};u.prototype.get=function(b){var d=this.data,g={type:0,val:[],encode:[],encodeReserved:[]};
    if(void 0!==this.cache[b])return this.cache[b];this.cache[b]=g;d="[object Function]"===String(Object.prototype.toString.call(d))?d(b):"[object Function]"===String(Object.prototype.toString.call(d[b]))?d[b](b):d[b];if(void 0!==d&&null!==d)if("[object Array]"===String(Object.prototype.toString.call(d))){var h=0;for(b=d.length;h<b;h++)void 0!==d[h]&&null!==d[h]&&g.val.push([void 0,String(d[h])]);g.val.length&&(g.type=3)}else if("[object Object]"===String(Object.prototype.toString.call(d))){for(h in d)p.call(d,
        h)&&void 0!==d[h]&&null!==d[h]&&g.val.push([h,String(d[h])]);g.val.length&&(g.type=2)}else g.type=1,g.val.push([void 0,String(d)]);return g};d.expand=function(b,k){var m=(new g(b)).expand(k);return new d(m)};return g});
(function(d,k){"object"===typeof module&&module.exports?module.exports=k(require("jquery"),require("./URI")):"function"===typeof define&&define.amd?define(["jquery","./URI"],k):k(d.jQuery,d.URI)})(this,function(d,k){function g(b){return b.replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}function u(b){var d=b.nodeName.toLowerCase();if("input"!==d||"image"===b.type)return k.domAttributes[d]}function b(b){return{get:function(h){return d(h).uri()[b]()},set:function(h,g){d(h).uri()[b](g);return g}}}function p(b,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          g){if(!u(b)||!g)return!1;var h=g.match(r);if(!h||!h[5]&&":"!==h[2]&&!t[h[2]])return!1;var k=d(b).uri();if(h[5])return k.is(h[5]);if(":"===h[2]){var q=h[1].toLowerCase()+":";return t[q]?t[q](k,h[4]):!1}q=h[1].toLowerCase();return B[q]?t[h[2]](k[q](),h[4],q):!1}var B={},t={"=":function(b,d){return b===d},"^=":function(b,d){return!!(b+"").match(new RegExp("^"+g(d),"i"))},"$=":function(b,d){return!!(b+"").match(new RegExp(g(d)+"$","i"))},"*=":function(b,d,k){"directory"===k&&(b+="/");return!!(b+"").match(new RegExp(g(d),
    "i"))},"equals:":function(b,d){return b.equals(d)},"is:":function(b,d){return b.is(d)}};d.each("origin authority directory domain filename fragment hash host hostname href password path pathname port protocol query resource scheme search subdomain suffix tld username".split(" "),function(h,g){B[g]=!0;d.attrHooks["uri:"+g]=b(g)});var m=function(b,g){return d(b).uri().href(g).toString()};d.each(["src","href","action","uri","cite"],function(b,g){d.attrHooks[g]={set:m}});d.attrHooks.uri.get=function(b){return d(b).uri()};
    d.fn.uri=function(b){var d=this.first(),g=d.get(0),h=u(g);if(!h)throw Error('Element "'+g.nodeName+'" does not have either property: href, src, action, cite');if(void 0!==b){var m=d.data("uri");if(m)return m.href(b);b instanceof k||(b=k(b||""))}else{if(b=d.data("uri"))return b;b=k(d.attr(h)||"")}b._dom_element=g;b._dom_attribute=h;b.normalize();d.data("uri",b);return b};k.prototype.build=function(b){if(this._dom_element)this._string=k.build(this._parts),this._deferred_build=!1,this._dom_element.setAttribute(this._dom_attribute,
        this._string),this._dom_element[this._dom_attribute]=this._string;else if(!0===b)this._deferred_build=!0;else if(void 0===b||this._deferred_build)this._string=k.build(this._parts),this._deferred_build=!1;return this};var r=/^([a-zA-Z]+)\s*([\^\$*]?=|:)\s*(['"]?)(.+)\3|^\s*([a-zA-Z0-9]+)\s*$/;var w=d.expr.createPseudo?d.expr.createPseudo(function(b){return function(d){return p(d,b)}}):function(b,d,g){return p(b,g[3])};d.expr[":"].uri=w;return d});

/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global, setTimeout) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.3.3',
        commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    //Could match something like ')//comment', do not lose the prefix to comment.
    function commentReplace(match, singlePrefix) {
        return singlePrefix || '';
    }

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
                foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
                baseParts = (baseName && baseName.split('/')),
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (isNormalized) {
                        normalizedName = name;
                    } else if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                                         normalize(name, parentName, applyMap) :
                                         name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                each(globalDefQueue, function(queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch();
                    }
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                var resLoadMaps = [];
                                each(this.depMaps, function (depMap) {
                                    resLoadMaps.push(depMap.normalizedMap || depMap);
                                });
                                req.onResourceLoad(context, this.map, resLoadMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap,
                                                      true);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.map.normalizedMap = normalizedMap;
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return;
                            }
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        } else if (this.events.error) {
                            // No direct errback on this module, but something
                            // else is listening for errors, so be sure to
                            // propagate the error correctly.
                            on(depMap, 'error', bind(this, function(err) {
                                this.emit('error', err);
                            }));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
                        args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
            context.defQueueMap = {};
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            defQueueMap: {},
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                // Convert old style urlArgs string to a function.
                if (typeof cfg.urlArgs === 'string') {
                    var urlArgs = cfg.urlArgs;
                    cfg.urlArgs = function(id, url) {
                        return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
                    };
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim,
                    objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? {name: pkgObj} : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                                     .replace(currDirRegExp, '')
                                     .replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id, null, true);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        mod.undefed = true;
                        removeScript(id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function(args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        delete context.defQueueMap[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }
                context.defQueueMap = {};

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url,
                    parentPath, bundleId,
                    pkgMain = getOwn(config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs && !/^blob\:/.test(url) ?
                       url + config.urlArgs(moduleName, url) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    var parents = [];
                    eachProp(registry, function(value, key) {
                        if (key.indexOf('_@r') !== 0) {
                            each(value.depMaps, function(depMap) {
                                if (depMap.id === data.id) {
                                    parents.push(key);
                                    return true;
                                }
                            });
                        }
                    });
                    return onError(makeError('scripterror', 'Script error for "' + data.id +
                                             (parents.length ?
                                             '", needed by: ' + parents.join(', ') :
                                             '"'), evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/requirejs/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/requirejs/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //Calling onNodeCreated after all properties on the node have been
            //set, but before it is placed in the DOM.
            if (config.onNodeCreated) {
                config.onNodeCreated(node, config, moduleName, url);
            }

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation is that a build has been done so
                //that only one script needs to be loaded anyway. This may need
                //to be reevaluated if other use cases become common.

                // Post a task to the event loop to work around a bug in WebKit
                // where the worker gets garbage-collected after calling
                // importScripts(): https://webkit.org/b/153317
                setTimeout(function() {}, 0);
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one,
                //but only do so if the data-main value is not a loader plugin
                //module ID.
                if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, commentReplace)
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        if (context) {
            context.defQueue.push([name, deps, callback]);
            context.defQueueMap[name] = true;
        } else {
            globalDefQueue.push([name, deps, callback]);
        }
    };

    define.amd = {
        jQuery: true
    };

    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)));
