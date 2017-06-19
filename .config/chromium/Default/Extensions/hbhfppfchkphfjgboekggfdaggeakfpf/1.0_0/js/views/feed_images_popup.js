define([
    'backbone',
    'jquery',
    'text!templates/feed-images-popup.html',
    'views/popup',
    'models/helpers',
    'slick'
], function(
    Backbone,
    $,
    template,
    Popup,
    helpers
) {

    var View = Popup.extend({
        $container: function() { return this.$el.find('.feed-images-popup-images'); },
        template: _.template(template),
        events: {

        },
        initialize: function(feedItem, initialSlide) {
            this.feedItem = feedItem;
            this.initialSlide = initialSlide || 0;
            this.on('show', this.onShow);
            this.$el.on('click', '.feed-images-popup-images-control-icon', this.onControlIconClicked);
            Popup.prototype.initialize.apply(this, []);
        },
        remove: function() {
            this.$el.off('click', '.feed-images-popup-images-control-icon', this.onControlIconClicked);
            Popup.prototype.remove.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                item: this.feedItem
            }));
            helpers.tooltips(this.$el);
            return this;
        },
        updateProgress: function() {
            var currentSlide = this.$container().slick('slickCurrentSlide') + 1;
            var totalSlides = this.feedItem.get('images').length;
            var percentage = 100 * currentSlide / totalSlides;

            this.$el.find('.feed-images-popup-header-progress-bar').width(percentage + '%');
            this.$el.find('.current-slide-number').text(currentSlide);
        },
        onShow: function() {
            var view = this;

            this.$container().slick({
                arrows: true,
                prevArrow: '<a href="#" class="feed-images-popup-images-control slick-prev prev"><span class="feed-images-popup-images-control-icon"></span></a>',
                nextArrow: '<a href="#" class="feed-images-popup-images-control slick-next next"><span class="feed-images-popup-images-control-icon"></span></a>',
                centerMode: true,
                centerPadding: '100px',
                infinite: false,
                variableWidth: true,
                focusOnSelect: true,
                swipeToSlide: true,
                initialSlide: this.initialSlide
            }).on('afterChange', function(event, slick, currentSlide) {
                view.updateProgress();
            });

            this.updateProgress();
        },
        onControlIconClicked: function(e) {
            e.preventDefault();
        }
    });

    return View;
});
