define([
    'backbone',
    'models/feed_item',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    FeedItem,
    globals,
    cookies
) {

    var Collection = Backbone.Collection.extend({
        model: FeedItem,
        providerId: null,
        boardId: 0,
        liked: null,
        url: globals['apiBaseUrl'] + 'feed_item/',
        paginating: true,
        order: 'new',
        comparator: function(item) {
            if (this.order == 'best') {
                return [-item.get('provider_likes_count'), -item.get('likes_count'), -item.get('id')];
            } else if (this.order == 'popular') {
                return [-item.get('provider_views_count'), -item.get('views_count'), -item.get('id')];
            } else {
                return [-item.get('published'), -item.get('id')];
            }
        },
        parse: function(response) {
            if (this.paginating) {
                this.url = response.next;
            }
            return response.results;
        },
        fetch: function(options) {
            var token = cookies.get('token');

            options = options || {};

            if (token) {
                options = $.extend(true, options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            if (this.providerId !== null) {
                if (this.providerId != 0) {
                    options = $.extend(true, options, {
                        data: {
                            provider: this.providerId
                        }
                    });
                } else {
                    options = $.extend(true, options, {
                        data: {
                            user_active: 'True'
                        }
                    });
                }
            }

            if (this.boardId != 0) {
                options = $.extend(true, options, {
                    data: {
                        boards: this.boardId
                    }
                });
            }

            if (this.liked) {
                options = $.extend(true, options, {
                    data: {
                        like: this.liked ? 'True' : 'False'
                    }
                });
            }

            if (this.order == 'best') {
                options = $.extend(true, options, {
                    data: {
                        order: this.order
                    }
                });
            } else if (this.order == 'popular') {
                options = $.extend(true, options, {
                    data: {
                        order: this.order
                    }
                });
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        isFetchable: function() {
            return this.url != null;
        },
        fetchWithBounds: function(date, first_id, last_id, options) {
            var data = {};

            if (this.providerId !== null) {
                if (this.providerId != 0) {
                    data['provider'] = this.providerId;
                } else {
                    data['user_active'] = 'True'
                }
            }

            if (this.boardId != 0) {
                data['boards'] = this.boardId;
            }

            if (this.liked) {
                data['like'] = this.liked ? 'True' : 'False';
            }

            if (first_id) {
                if (date) {
                    data['after_id_and_date'] = first_id + ',' + date;
                } else {
                    data['starting_from_id_date'] = first_id;
                }
            }

            if (last_id) {
                if (date) {
                    data['before_id_and_date'] = last_id + ',' + date;
                } else {
                    data['ending_with_id_date'] = last_id;
                }
            }

            this.fetch($.extend(true, options, {
                data: data,
                append: last_id != null
            }));
        }
    });

    return Collection;
});
