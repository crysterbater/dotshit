define([
    'backbone',
    'jquery',
    'text!templates/resource.html',
    'models/current_user'
], function(
    Backbone,
    $,
    template,
    currentUser
) {

    var View = Backbone.View.extend({
        board: null,
        template: _.template(template),
        events: {
            'click .vote-resource': 'onVoteResourceClicked'
        },
        initialize: function(provider) {
            this.provider = provider;
            this.provider.on('change:voted, change:votes_count', function() { this.onProviderVotesChanged() }, this);
        },
        render: function() {
            this.$el.html(this.template({
                provider: this.provider,
                currentUser: currentUser
            }));
            return this;
        },
        onVoteResourceClicked: function(e) {
            e.preventDefault();

            this.provider.toggleVote();
        },
        onProviderVotesChanged: function() {
            this.$el.find('.resource-tile-vote').toggleClass('active', this.provider.get('voted'));
            this.$el.find('.resource-tile-vote-counter').text(this.provider.escape('votes_count'));
        }
    });

    return View;
});
