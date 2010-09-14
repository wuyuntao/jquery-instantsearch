/*
 * jQuery Instant Search Plugin
 *
 * Copyright 2010 Wu Yuntao
 *
 * Version 0.1 - Updated: Sep. 13, 2010
 *
 */
(function($) {

$.fn.instantSearch = function(method, options) {
    if (!this.length) return this;

    options = $.extend({

        // Classnames
        closeClass: 'as-close',
        containerClass: 'as-instant',
        formClass: 'as-form',
        inputClass: 'as-input',
        resultsClass: 'as-results',
        selectionClass: 'as-selection',
        selectionsClass: 'as-selections',
        submitClass: 'as-submit',
        suggestionClass: 'as-suggestion',
        suggestionWrapperClass: 'as-suggestion-wrapper',

        // Selectors
        formSelector: 'form',
        inputSelector: 'input[name=query]',
        submitSelector: 'input[name=submit]',
        resultsSelector: '#results',

        // Events
    }, options || {});

    return this.each(function() {
        var container = $(this).addClass(options.containerClass),
            form = $(options.formSelector, container).addClass(options.formClass),
            input = $(options.inputSelector, container).attr('autocomplete', 'off').addClass(options.inputClass).val('pyth'),
            submit = $(options.submitSelector, container).addClass(options.submitClass),
            results = $(options.resultsSelector).addClass(options.resultsClass),
            
            close = $('<a href="#close">X</a>').addClass(options.closeClass).insertAfter(input),
            suggestionWrapper = $('<div></div>').addClass(options.suggestionWrapperClass).insertBefore(input),
            suggestion = $('<input type="text" name="suggestion" autocomplete="off"/>').addClass(options.suggestionClass).val('python').appendTo(suggestionWrapper),
            selections = $('<ul class="as-selections"></ul>').addClass(options.selectionsClass).width(input.outerWidth() - 2).appendTo(container);
            selections.append([
                '<li class="as-selection">python</li>',
                '<li class="as-selection">python django</li>',
                '<li class="as-selection">python twitter</li>',
                '<li class="as-selection">python deluge</li>'
            ].join(' '))

            $.each([input, close, submit, selections], function() {
                this.css('top', -suggestionWrapper.outerHeight());
            });
    });
};

})(jQuery);
