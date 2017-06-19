define([
    'backbone',
    'moment',
    'models/globals'
], function(
    Backbone,
    moment,
    globals
) {

    var Model = Backbone.Model.extend({
        remove: function() {
            this.collection.remove(this);
        }
    });

    return Model;
});