define([
    'backbone',
    'jquery',
    'text!templates/resources.html',
    'views/resource',
    'collections/all_providers',
    'collections/languages',
    'collections/provider_tags',
    'viewManager',
    'masonry-layout',
    'select2'
], function(
    Backbone,
    $,
    template,
    ResourceView,
    AllProvidersCollection,
    LanguagesCollection,
    ProviderTagsCollection,
    viewManager
) {

    var View = Backbone.View.extend({
        $scrollable: function() { return this.$el.find('.content-scrollable') },
        $container: function() { return this.$el.find('.resource-tiles') },
        loadMoreOnSpaceLeft: 400,
        loading: false,
        template: _.template(template),
        events: {
            'click .create-resource': 'onCreateResourceClicked',
            'change select': 'onFiltersUpdated',
            'click .mobile-header-menu-button': 'onMenuButtonClicked'
        },
        initialize: function() {
            this.providers = new AllProvidersCollection();
            this.languages = new LanguagesCollection();
            this.provider_tags = new ProviderTagsCollection();
            this.providers.on('add', this.onItemAdd, this);
            this.on('show', this.onShow);

            var view = this;

            this.languages.fetch({
                success: function() {
                    view.render();
                }
            });
            this.provider_tags.fetch({
                success: function() {
                    view.render();
                }
            });
        },
        remove: function() {
            this.providers.off('add', this.onItemAdd, this);
            this.$scrollable().off('scroll', this.fetchItemsIfNeededCallback);
        },
        render: function() {
            this.$el.html(this.template({
                languages: this.languages,
                provider_tags: this.provider_tags
            }));

            this.$el.find('select').each(function() {
                var $select = $(this);
                var options = {
                    theme: 'flatun',
                    minimumResultsForSearch: -1
                };

                if ($select.data('placeholder')) {
                    options = $.extend(options, {
                        placeholder: $select.data('placeholder')
                    })
                }

                $select.select2(options);
            });


            var view = this;
            this.fetchItemsIfNeededCallback = function() {
                view.fetchItemsIfNeeded();
            };
            this.$scrollable().on('scroll', this.fetchItemsIfNeededCallback);

            return this;
        },
        onItemAdd: function(model, collection, options) {
            var $item = new ResourceView(model).render().$el;
            this.$container().append($item).masonry('appended', $item);
        },
        onShow: function() {
            this.initLayout();
            this.reloadItems();
        },

        finishLoading: function() {
            this.$container().masonry('layout');
            this.loading = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            this.$container().empty();
            this.$container().masonry('layout');

            this.fetchItems();
        },
        fetchItems: function() {
            if (this.loading) {
                return;
            }

            var view = this;

            this.loading = true;
            this.providers.fetch({
                success: function() { view.finishLoading(); },
                data: this.getCurrentFilters(),
                remove: false
            });
        },
        fetchItemsIfNeeded: function () {
            if (this.$el.parents('html').length == 0) {
                return;
            }

            var spaceLeft = this.$scrollable().get(0).scrollHeight - (this.$scrollable().scrollTop() + this.$scrollable().height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.providers.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function () {
            this.$container().find('.resource-tile-container').css('opacity', '0');
            var view = this;

            this.$container().on('layoutComplete', function (event, items) {
                view.$container().find('.resource-tile-container').animate({opacity: 1}, 500);
                view.$container().off('layoutComplete');
            });

            this.$container().masonry({
                itemSelector: '.resource-tile-container',
                columnWidth: '.resource-tile-container',
                percentPosition: true
            });
        },
        getCurrentFilters: function() {
            var filters = {};
            var language = this.$el.find('select[name="language"] option:selected').val();
            var tags = this.$el.find('select[name="tags"] option:selected').val();

            if (!_.isEmpty(language)) {
                filters['language'] = language;
            }

            if (!_.isEmpty(tags)) {
                filters['tags'] = tags;
            }

            return filters;
        },
        onCreateResourceClicked: function(e) {
            e.preventDefault();

            Backbone.router.openCreateResourcePopup();
        },
        onFiltersUpdated: function() {
            this.$container().empty();
            this.providers.reset();
            this.fetchItems();
        },
        onMenuButtonClicked: function(e) {
            e.preventDefault();

            viewManager.sidebarView.toggleSidebarOpened();
        }
    });

    return View
});