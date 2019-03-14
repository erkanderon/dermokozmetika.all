(function ($) {
    'use strict';

    $.fn.loading = function (method) {
        var methods = {
            init: function (options) {
                options = $.extend(
                    {},
                    $
                        .fn
                        .loading
                        .defaults,
                    options
                );

                if (!$(this).data('loading'))
                    $(this)
                        .addClass(options.classes.loading)
                        .prepend(
                            $(
                                '<div class="' + options.classes.overlay + '">' +
                                    '<div class="' + options.classes.spinner + '">' +
                                        '<span class="' + options.classes.icon + '"></span>' +
                                        (options.text ? '<span class="' + options.classes.text + '">' + options.text + '</span>': '') +
                                    '</div>' +
                                '</div>'
                            )
                        )
                        .data(
                            'loading',
                            true
                        );

                return $(this);
            },
            hide: function (options) {
                options = $.extend(
                    {},
                    $
                        .fn
                        .loading
                        .defaults,
                    options
                );

                $(this)
                    .data(
                        'loading',
                        false
                    )
                    .removeClass(
                        options
                            .classes
                            .loading
                    )
                    .find('.' + options.classes.overlay)
                    .detach();

                return $(this);
            }
        };

        if (methods[method])
            return methods[method].apply(
                this,
                Array
                    .prototype
                    .slice
                    .call(
                        arguments,
                        1
                    )
            );
        else if (
            typeof method == 'object' ||
            !method
        )
            return methods
                .init
                .apply(
                    this,
                    arguments
                );
    };

    $
        .fn
        .loading
        .defaults = {
            classes: {
                icon: 'loading-icon',
                loading: 'loading',
                overlay: 'loading-overlay',
                spinner: 'loading-spinner',
                text: 'loading-text'
            },
            text: 'Loading'
        };
}(jQuery));