define([
    'backbone',
    'models/provider_tag',
    'models/globals'
], function(
    Backbone,
    ProviderTag,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: ProviderTag,
        url: globals['apiBaseUrl'] + 'provider_tag/'
    });

    return Collection;
});
