define([
    'backbone',
    'jquery',
    'text!templates/feed-item.html',
    'models/helpers',
    'models/current_user',
    'gifffer'
], function(
    Backbone,
    $,
    template,
    helpers,
    currentUser
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        showProvider: true,
        events: {
            'click .link': 'onLinkClicked',
            'click .tile-content': 'onTileClicked',
            'click .tile-image-container': 'onImageClicked',
            'click .toggle-like': 'onLikeClicked',
            'click .add-to-board': 'onAddToBoardClicked'
        },
        initialize: function(options) {
            this.options = options.options || {};

            if (!_.isUndefined(this.options.providerId)) {
                this.showProvider = this.options.providerId == 0;
            }

            this.model.on('change', function() { this.onFeedItemChanged() }, this);
        },
        render: function() {
            this.$el.html(this.template({
                item: this.model,
                showProvider: this.showProvider,
                authorized: currentUser.authorized()
            }));
            Gifffer();
            helpers.tooltips(this.$el);
            var view = this;
            this.$el.on('mousemove', '.tile-image-container', function(e) { view.onImageMove(e); });
            this.$el.on('mouseleave', '.tile-image-container', function(e) { view.onImageOut(e); });
            this.$el.find('.tile-image').on('error', this.onImageLoadError);
            return this;
        },
        onImageMove: function(e) {
            if ($(e.target).closest('.tile-image-hover-info').length || e.offsetY > 80) {
                this.$el.find('.tile-image-container').addClass('hover');
            } else {
                this.$el.find('.tile-image-container').removeClass('hover');
            }
        },
        onImageOut: function(e) {
            this.$el.find('.tile-image-container').removeClass('hover');
        },
        getFeedItemUrl: function() {
            if (!_.isUndefined(this.options.providerId)) {
                return 'provider/' + this.options.providerId + '/feed-item/' + this.model.escape('id');
            } else if (!_.isUndefined(this.options.boardId)) {
                return 'board/' + this.options.boardId + '/feed-item/' + this.model.escape('id');
            } else if (!_.isUndefined(this.options.liked)) {
                return 'liked/feed-item/' + this.model.escape('id');
            } else {
                return 'provider/0/feed-item/' + this.model.escape('id');
            }
        },
        onFeedItemChanged: function() {
            this.$el
                .find('.toggle-like')
                .toggleClass('active', this.model.get('liked'))
                .find('.likes-count')
                .text(this.model.getTotalLikes());
        },
        onLinkClicked: function(e) {
            e.stopPropagation();
        },
        onTileClicked: function(e) {
            e.preventDefault();

            Backbone.router.navigate(this.getFeedItemUrl(), { trigger: true });
        },
        onImageClicked: function(e) {
            if (this.model.isGif() && !this.$el.find('.tile-image-container').hasClass('hover')) {
                e.stopPropagation();
            }
        },
        onLikeClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (currentUser.authorized()) {
                this.model.toggleLike();
            } else {
                Backbone.router.openLoginPopup();
            }
        },
        onAddToBoardClicked: function(e) {
            e.preventDefault();

            Backbone.router.openAddBoardFeedItemPopup(this.model);
        },
        onImageLoadError: function(e) {
            $(e.target).remove();
        }
    });

    return View;
});
