/*
 * jQuery Instant Search Plugin
 *
 * Copyright 2010 Wu Yuntao
 *
 * Version 0.1 - Updated: Sep. 13, 2010
 *
 */
(function($) {

$.fn.instantSearch = function(options) {
    if (!this.length) return this;

    options = $.extend({
        // URLs
        suggestURL: '/suggest/',
        searchURL: '/search/',

        // Parameters
        delay: 500,
        interval: 100,
        searchResultLimit: 10,
        suggestionLimit: 10,

        // CSS Class names
        closeClass: 'as-close',
        containerClass: 'as-instant',
        formClass: 'as-form',
        inputClass: 'as-input',
        resultsClass: 'as-results',
        selectionClass: 'as-selection',
        selectionHoverClass: 'as-selection-hover',
        selectionsClass: 'as-selections',
        submitClass: 'as-submit',
        suggestionClass: 'as-suggestion',

        // Date names
        delayName: 'as-delay',
        timerName: 'as-timer',
        valueName: 'as-value',
        searchRequestName: 'as-search-request',
        suggestRequestName: 'as-suggest-request',

        // Selectors
        formSelector: 'form',
        inputSelector: 'input[name=query]',
        submitSelector: 'input[name=submit]',
        resultsSelector: '#results',

        // Shortcuts
        keyUp: 38,
        keyDown: 40,
        keyTab: 9,
        keyEnter: 13,
        keyEscape: 27,
        keyShift: 16,
        keyCapslock: 20,

        // Events
    }, options || {});

    return this.each(function() {
        var container = $(this).addClass(options.containerClass),

            form = $(options.formSelector, container)
                        .addClass(options.formClass)
                        .wrapInner('<div class="clearfix"></div>'),

            input = $(options.inputSelector, container)
                        .attr('autocomplete', 'off')
                        .addClass(options.inputClass),

            submit = $(options.submitSelector, container).addClass(options.submitClass),

            results = $(options.resultsSelector).addClass(options.resultsClass),

            close = $('<a href="#close"><span></span></a>')
                        .addClass(options.closeClass)
                        .insertAfter(input),

            suggestion = $('<input type="text" name="suggestion" autocomplete="off"/>')
                        .addClass(options.suggestionClass).prependTo(form),

            selections = $('<ul class="as-selections"></ul>')
                        .addClass(options.selectionsClass)
                        .width(input.outerWidth() - 2/* border width */)
                        .hide()
                        .appendTo(container);

        input.focus(function() {
            if (input.data(options.timerName)) {
                clearInterval(input.data(options.timerName));
                input.data(options.timerName, null);
            }
            input.data(options.timerName, setInterval(inputChange, options.interval));
        }).blur(function() {
            suggestionHide();
        }).keydown(function(e) {
            switch(e.keyCode) {
                case options.keyUp:
                    e.preventDefault();
                    selectionMove('up');
                    break;
                case options.keyDown:
                    e.preventDefault();
                    selectionMove('down');
                    break;
                    case options.keyTab:
                        e.preventDefault();
                        input.data(options.valueName, suggestion.val()).val(suggestion.val());
                        suggestionHide();
                        break;
                    case options.keyEnter:
                        var hover = $('li.' + options.selectionHoverClass + ':first', selections);
                        if (hover.length) {
                            e.preventDefault();
                            input.data(options.valueName, hover.text()).val(hover.text());
                            suggestion.val(input.val());
                            suggestionHide();
                        }
                        break;
                    case options.keyEscape:
                    case options.keyShift:
                    case options.keyCapslock:
                        suggestionHide();
                        break;
                }
            });

            function inputChange() {
                if (input.data(options.valueName) !== input.val()) {
                    // Trigger onChange event
                    if ($.isFunction(options.change)) options.change(input);

                    // Cancel previous request
                    if (input.data(options.searchRequestName)) {
                        input.data(options.searchRequestName).abort();
                        input.data(options.searchRequestName, null);
                    }

                    if (input.data(options.suggestRequestName)) {
                        input.data(options.suggestRequestName).abort();
                        input.data(options.suggestRequestName, null);
                    }

                    if (!input.val() || !suggestion.val().match(input.val())) {
                        suggestionHide();
                    }

                    if (input.val()) {
                        // Trigger onSuggest event
                        if ($.isFunction(options.suggest)) options.suggest(input);

                        // Get suggestion of search query
                        input.data(options.suggestRequestName, $.ajax({
                            url: options.suggestURL,
                            type: 'get',
                            dataType: 'json',
                            data: {
                                query: input.val(),
                                limit: options.suggestionLimit
                            },
                            success: function(data) {
                                // Trigger onSuggestSuccess event
                                if ($.isFunction(options.suggestSuccess))
                                    options.suggestSuccess(input, data);

                                // Only show suggestions when value matches first suggestion
                                if (data.length && data[0].query.match(input.val())
                                        && data[0].query != input.val()) {
                                    suggestion.val(data[0].query);

                                    selections.empty();
                                    for (var i = 0, len = data.length; i < len; ++i) {
                                        $('<li></li>').addClass(options.selectionClass)
                                            .text(data[i].query)
                                            .hoverClass(options.selectionHoverClass)
                                            .click(selectionClick)
                                            .appendTo(selections);
                                    }
                                    selections.fadeIn('fast');
                                } else {
                                    selections.fadeOut('fast');
                                }

                                function selectionClick(e) {
                                    var text = $(this).text();
                                    input.data(options.valueName, text).val(text);

                                    // Trigger onSearch event
                                    suggestionHide();
                                }
                            },
                            error: function(xhr, text, e) {
                                // Trigger onSuggestError event
                                if ($.isFunction(options.suggestError))
                                    options.suggestError(input, e);
                            }
                        }));

                        if (input.data(options.delayName)) {
                            clearTimeout(input.data(options.delayName));
                            input.data(options.delayName, null);
                        }

                        input.data(options.delayName, setTimeout(function() {
                            if (input.val()) {
                            input.data(options.searchRequestName, $.ajax({
                                url: options.searchURL,
                                type: 'get',
                                dataType: 'json',
                                data: {
                                    query: input.val(),
                                    limit: options.searchResultLimit
                                },
                                success: function(data) {
                                    // Trigger onSearchSuccess event
                                    if ($.isFunction(options.searchSuccess))
                                        options.searchSuccess(input, data);

                                    results.html(data.html);
                                },
                                error: function(xhr, text, e) {
                                    // Trigger onSearchError event
                                    if ($.isFunction(options.searchError))
                                        options.searchError(input, e);
                                }
                            }));
                        }
                    }, options.delay));
                }

                input.data(options.valueName, input.val());
            }

        }

        function selectionMove(direction) {
            var all = $('li', selections);
                hover = all.filter('.' + options.selectionHoverClass + ':first');
            if (all.length) {
                if (hover.length) {
                    hover = hover[direction === 'up' ? 'prev' : 'next']();
                }
                if (!hover.length) {
                    hover = all.filter(direction === 'up' ? ':last': ':first');
                }
                all.removeClass(options.selectionHoverClass);
                hover.addClass(options.selectionHoverClass);
            }
        }

        function suggestionHide() {
            suggestion.val(input.val());
            selections.hide();
            $('li', selections).removeClass(options.selectionHoverClass);
        }

    });
};

$.fn.hoverClass = function(klass) {
    if (!this.length) return this;

    return this.hover(function() {
        $(this).addClass(klass);
    }, function() {
        $(this).removeClass(klass);
    });
}

})(jQuery);
