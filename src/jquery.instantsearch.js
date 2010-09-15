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
        interval: 100,
        searchResultLimit: 10,
        suggestionLimit: 10,

        // CSS Classes
        closeClass: 'as-close',
        containerClass: 'as-instant',
        formClass: 'as-form',
        inputClass: 'as-input',
        resultsClass: 'as-results',
        selectionClass: 'as-selection',
        selectionsClass: 'as-selections',
        submitClass: 'as-submit',
        suggestionClass: 'as-suggestion',

        // Date names
        timerName: 'as-timer',
        valueName: 'as-value',
        searchRequestName: 'as-search-request',
        suggestRequestName: 'as-suggest-request',

        // Selectors
        formSelector: 'form',
        inputSelector: 'input[name=query]',
        submitSelector: 'input[name=submit]',
        resultsSelector: '#results',

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

        if (input.data(options.timerName)) {
            clearInterval(input.data(options.timerName));
            input.data(options.timerName, null);
        }

        input.data(options.timerName, setInterval(inputChange, options.interval));

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

                // Hide suggestions
                if (!input.val() || !suggestion.val().match(input.val())) {
                    suggestion.val('');
                    selections.hide();
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
                                        .click(selectionClick)
                                        .appendTo(selections);
                                }
                                selections.fadeIn('fast');
                            } else {
                                selections.fadeOut('fast');
                            }

                            function selectionClick(e) {
                                selection = $(this);
                                input.val(selection.text());
                                suggestion.val(selection.text());

                                // Trigger onSearch event
                                selections.fadeOut('fast');
                            }
                        },
                        error: function(xhr, text, e) {
                            // Trigger onSuggestError event
                            if ($.isFunction(options.suggestError))
                                options.suggestError(input, e);
                        }
                    }));
                }

                input.data(options.valueName, input.val());
            }
        }
    });
};

})(jQuery);
