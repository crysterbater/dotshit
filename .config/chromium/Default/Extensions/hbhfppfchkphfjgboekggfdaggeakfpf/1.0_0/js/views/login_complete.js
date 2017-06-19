define([
    'backbone',
    'jquery',
    'urijs/URI',
    'text!templates/login-complete.html',
    'utils/cookies'
], function(
    Backbone,
    $,
    URI,
    template,
    cookies
) {

    var View = Backbone.View.extend({
        message: null,
        template: _.template(template),
        initialize: function() {
            this.processParams();
        },
        render: function() {
            this.$el.html(this.template({
                message: this.message
            }));
            return this;
        },
        processParams: function() {
            var url = URI(document.URL);

            var token = url.query(true)['token'];
            if (token) {
                cookies.set('token', token);
                Backbone.router.navigate('');
                location.reload();
            }

            var message = url.query(true)['message'];
            if (message) {
                this.message = message;
            }
        }
    });

    return View;
});