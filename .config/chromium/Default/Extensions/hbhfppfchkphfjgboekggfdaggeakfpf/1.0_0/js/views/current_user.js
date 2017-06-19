define([
    'backbone',
    'jquery',
    'models/current_user',
    'text!templates/sidebar-current-user.html'
], function(
    Backbone,
    $,
    currentUser,
    template
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        sidebarOpened: false,
        initialize: function() {
            this.on('show', this.onShow);
            currentUser.on('change', this.onUserUpdate, this);
        },
        render: function() {
            this.setElement(this.$el.html(this.template({
                currentUser: currentUser
            })));
            return this;
        },
        onUserUpdate: function() {
            this.render();
        },
        onShow: function() {

        }
    });

    return View;
});