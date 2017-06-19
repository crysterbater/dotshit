define([
    'backbone',
    'jquery',
    'views/popup',
    'text!templates/login-popup.html',
    'models/helpers'
], function(
    Backbone,
    $,
    Popup,
    template,
    helpers
) {

    var View = Popup.extend({
        template: _.template(template),
        render: function() {
            this.$el.html(this.template());
            helpers.tooltips(this.$el);
            return this;
        }
    });

    return View;
});
