define([
    'backbone',
    'jquery',
    'text!templates/create-resource-popup.html',
    'collections/all_providers',
    'collections/languages',
    'collections/provider_tags',
    'views/popup',
    'FileAPI'
], function(
    Backbone,
    $,
    template,
    AllProvidersCollection,
    LanguagesCollection,
    ProviderTagsCollection,
    Popup
) {

    var View = Popup.extend({
        template: _.template(template),
        events: {
            'click .cancel': 'onCancelClicked',
            'click .create': 'onCreateClicked',
            'focus .create-resource-popup-form-row-input': 'onInputFocus',
            'blur .create-resource-popup-form-row-input': 'onInputBlur'
        },
        initialize: function(options) {
            this.options = options || {};
            this.languages = new LanguagesCollection();
            this.provider_tags = new ProviderTagsCollection();

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

            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                languages: this.languages,
                provider_tags: this.provider_tags
            }));
            this.initImageField();

            var view = this;

            this.$el.find('.create-resource-popup-form-row-input').each(function() {
                view.updateInputState($(this));
            });

            return this;
        },
        initImageField: function() {
            var $input = this.$el.find('[name="image"]');
            var view = this;

            FileAPI.event.on($input[0], 'change', function(e) {
                var files = FileAPI.getFiles(e);

                _.each(files, function(file, i) {
                    if (!/^image/.test(file.type)) {
                        return;
                    }

                    FileAPI.Image(file).resize(320, 240, 'max').get(function(err, preview) {
                        if (err) {
                            return;
                        }

                        var $preview = $(preview);

                        view.$el
                            .find('.create-resource-popup-form-image-preview')
                            .empty()
                            .append($preview)
                            .css('margin-top', (-1) * $preview.height() / 2);
                    });
                });
            });

            return this;
        },
        onCancelClicked: function(e) {
            e.preventDefault();

            Backbone.router.closePopup();
        },
        onCreateClicked: function(e) {
            e.preventDefault();

            var view = this;

            this.$el.find('.create-resource-popup-form-row-item').removeClass('error');

            var provider = new AllProvidersCollection().create({}, {
                form: this.$el.find('.create-resource-popup-form')[0],
                success: function() {
                    Backbone.router.closePopup();
                },
                error: function(model, response) {
                    view.showErrors(response);
                }
            });
        },
        showErrors: function(response) {
            if (response.status >= 400 && response.status < 500) {
                var view = this;
                var errors = JSON.parse(response.responseText);

                _.each(errors, function(fieldErrors, field) {
                    _.each(fieldErrors, function(error) {
                        view.$el
                            .find('.create-resource-popup-form [name="' + field + '"]')
                            .parents('.create-resource-popup-form-row-item')
                            .addClass('error');
                    });
                });
            }
        },
        updateInputState: function($input) {
            $input.parents('.create-resource-popup-form-row-item').toggleClass('focus', $input.is(':focus'));
            $input.parents('.create-resource-popup-form-row-item').toggleClass('empty', $input.val().length == 0);
        },
        onInputFocus: function(e) {
            this.updateInputState($(e.target));
        },
        onInputBlur: function(e) {
            this.updateInputState($(e.target));
        }
    });

    return View;
});
