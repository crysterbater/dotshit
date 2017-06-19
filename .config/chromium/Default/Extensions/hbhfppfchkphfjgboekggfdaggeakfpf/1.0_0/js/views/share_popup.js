define([
    'backbone',
    'jquery',
    'views/popup',
    'text!templates/share-popup.html',
    'models/globals'
], function(
    Backbone,
    $,
    Popup,
    template,
    globals
) {

    var View = Popup.extend({
        template: _.template(template),
        render: function() {
            this.$el.html(this.template({
                baseUrl: globals['baseUrl']
            }));
            return this;
        }
    });

    return View;
});
