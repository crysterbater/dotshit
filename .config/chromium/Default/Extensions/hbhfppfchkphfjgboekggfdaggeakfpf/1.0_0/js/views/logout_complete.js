define([
    'backbone',
    'jquery',
    'utils/cookies'
], function(
    Backbone,
    $,
    cookies
) {

    var View = Backbone.View.extend({
        initialize: function() {
            cookies.remove('token');
            Backbone.router.navigate('');
            location.reload();
        }
    });

    return View;
});