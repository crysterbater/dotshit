define([
    'backbone',
    'jquery',
    'text!templates/feed-item-popup.html',
    'models/helpers',
    'models/current_user'
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
        className: 'feed-popup-wrapper',
        events: {
            'click .feed-popup-expand-image': 'onExpandImageClicked',
            'click .toggle-like': 'onLikeClicked',
            'click .add-to-board': 'onAddToBoardClicked',
            'click .feed-popup-buttons-item.share': 'onShareClicked'
        },
        initialize: function(options) {
            this.options = options.options || {};
            this.showProvider = !_.isUndefined(this.options) ? this.options.showProvider : false;
            this.on('show', this.onShow);
            this.model.on('change', function() { this.onFeedItemChanged() }, this);
        },
        render: function() {
            this.$el.html(this.template({
                item: this.model,
                showProvider: this.showProvider,
                authorized: currentUser.authorized()
            }));
            helpers.tooltips(this.$el);
            this.$el.find('.feed-popup-images-item, .feed-popup-image').on('error', this.onImageLoadError);
            return this;
        },
        onShow: function() {
            this.initCarousel();
        },
        initCarousel: function() {
            this.$el.find('.feed-popup-images').flickity({
                contain: false,
                pageDots: false,
                accessibility: false,
                prevNextButtons: false
            });
        },
        prevImage: function() {
            this.$el.find('.feed-popup-images').flickity('previous');
        },
        nextImage: function() {
            this.$el.find('.feed-popup-images').flickity('next');
        },
        onExpandImageClicked: function(e) {
            e.preventDefault();

            var $item = $(e.target).parents('.feed-popup-images-item-container');
            var initialSlide = $item.length > 0 ? $item.index() : 0;

            Backbone.router.openFeedImagesPopup(this.model, initialSlide);
        },
        onFeedItemChanged: function() {
            this.$el
                .find('.toggle-like')
                .toggleClass('active', this.model.get('liked'))
                .find('.likes-count')
                .text(this.model.getTotalLikes());
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

            if (currentUser.authorized()) {
                Backbone.router.openAddBoardFeedItemPopup(this.model);
            } else {
                Backbone.router.openLoginPopup();
            }
        },
        onShareClicked: function(e) {
            e.preventDefault();

            var $item = $(e.target).closest('.feed-popup-buttons-item');

            $item.toggleClass('active');

            this.$el.find('.feed-popup-foreground').toggle($item.hasClass('active'));
        },
        onImageLoadError: function(e) {
            $(e.target).remove();
        }
    });

    return View;
});