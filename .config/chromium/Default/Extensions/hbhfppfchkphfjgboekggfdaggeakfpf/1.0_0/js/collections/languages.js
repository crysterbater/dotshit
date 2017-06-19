define([
    'backbone',
    'models/language',
    'models/globals'
], function(
    Backbone,
    Language,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: Language,
        url: globals['apiBaseUrl'] + 'language/'
    });

    return Collection;
});
