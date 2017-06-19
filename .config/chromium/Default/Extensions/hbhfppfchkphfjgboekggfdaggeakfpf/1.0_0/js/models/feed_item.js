define([
    'backbone',
    'models/globals',
    'moment',
    'utils/cookies'
], function(
    Backbone,
    globals,
    moment,
    cookies
) {

    var Model = Backbone.Model.extend({
        defaults: {
            liked: false,
            is_boarded: false
        },
        constructor: function() {
            Backbone.Model.apply(this, arguments);
            this.set('is_boarded', this.isBoarded());
        },
        formatPublished: function() {
            return moment(this.escape('published')).format("D MMM, YYYY");
        },
        formatPublishedDayAndMonth: function() {
            return moment(this.escape('published')).format("D MMMM");
        },
        getShortNumber: function(num) {
            if (num >= 1000000) {
                num = Math.round((num / 1000000) * 100) / 100 + 'M';
            } else if (num >= 1000) {
                num = Math.round((num / 1000) * 100) / 100 + 'K';
            }

            return num;
        },
        getTotalViews: function() {
            return (parseInt(this.escape('views_count'))  || 0) + (parseInt(this.escape('provider_views_count')) || 0);
        },
        getTotalViewsShort: function() {
            var result = this.getTotalViews();
            return this.getShortNumber(result);
        },
        getTotalBoards: function() {
            return (parseInt(this.escape('boards_count'))  || 0) + (parseInt(this.escape('provider_boards_count')) || 0);
        },
        getTotalBoardsShort: function() {
            var result = this.getTotalBoards();
            return this.getShortNumber(result);
        },
        getTotalLikes: function() {
            return (parseInt(this.escape('likes_count'))  || 0) + (parseInt(this.escape('provider_likes_count')) || 0);
        },
        getTotalLikesShort: function() {
            var result = this.getTotalLikes();
            return this.getShortNumber(result);
        },
        getTotalComments: function() {
            return parseInt(this.escape('provider_comments_count')) || 0;
        },
        getTotalCommentsShort: function() {
            var result = this.getTotalComments();
            return this.getShortNumber(result);
        },
        isInBoard: function(board) {
            return _.contains(this.get('boards'), board.get('id'));
        },
        isBoarded: function() {
            return this.get('boards').length > 0
        },
        isGif: function() {
            var img = _.first(this.get('images'));

            if (_.isUndefined(img.image) || _.isEmpty(img.image)) {
                return false;
            }

            return img.image.indexOf('.gif', img.image.length - '.gif'.length) !== -1;
        },
        toggleLike: function() {
            var token = cookies.get('token');
            var model = this;
            var like = !this.get('liked');
            var likesCount = like ? model.get('likes_count') + 1 : model.get('likes_count') - 1;
            var url = like ? globals['apiBaseUrl'] + 'feed_item_like/' : globals['apiBaseUrl'] + 'feed_item_like/' + this.get('id') + '/';
            var data = like ? {
                feed_item: this.get('id')
            } : {};

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: like ? 'POST' : 'DELETE',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    model.set('liked', like);
                    model.set('likes_count', likesCount);
                }
            });
        },
        addToBoard: function(board) {
            var token = cookies.get('token');
            var model = this;
            var url = globals['apiBaseUrl'] + 'board_feed_item/';
            var data = {
                feed_item: this.get('id'),
                board: board.get('id')
            };

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    var boards = model.get('boards');

                    boards.push(board.get('id'));

                    model.set('boards', boards);
                    model.set('boards_count', model.get('boards_count') + 1);
                    model.set('is_boarded', model.isBoarded());
                }
            });
        },
        addToBoards: function(boards) {
            if (boards.length == 0) {
                return;
            }

            var token = cookies.get('token');
            var model = this;
            var url = this.url() + '/add_boards/';
            var ids = _.map(boards, function(board) { return board.get('id'); });
            var data = {
                boards: ids.join(',')
            };

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    var boards = model.get('boards');

                    _.each(ids, function(id) {
                        boards.push(id);
                    });

                    model.set('boards', boards);
                    model.set('boards_count', boards.length);
                    model.set('is_boarded', model.isBoarded());
                }
            });
        },
        deleteFromBoard: function(board) {
            var token = cookies.get('token');
            var model = this;
            var url = globals['apiBaseUrl'] + 'board_feed_item/' + board.get('id') + '/' + this.get('id') + '/';

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'DELETE',
                headers: {
                    Authorization: 'Token ' + token
                },
                success: function() {
                    var boards = _.without(model.get('boards'), board.get('id'));

                    model.set('boards', boards);
                    model.set('boards_count', model.get('boards_count') - 1);
                    model.set('is_boarded', model.isBoarded());
                }
            });
        },
        deleteFromBoards: function(boards) {
            if (boards.length == 0) {
                return;
            }

            var token = cookies.get('token');
            var model = this;
            var url = this.url() + '/remove_boards/';
            var ids = _.map(boards, function(board) { return board.get('id'); });
            var data = {
                boards: ids.join(',')
            };

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'DELETE',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    var boards = model.get('boards');

                    _.each(ids, function(id) {
                        boards = _.without(boards, id);
                    });

                    model.set('boards', boards);
                    model.set('boards_count', boards.length);
                    model.set('is_boarded', model.isBoarded());
                }
            });
        },
        addView: function() {
            var model = this;
            var viewsCount = model.get('views_count') + 1;
            var url = globals['apiBaseUrl'] + 'feed_item/' + this.get('id') + '/add_view/';

            $.ajax({
                url: url,
                method: 'POST',
                success: function() {
                    model.set('views_count', viewsCount);
                }
            });
        }
    });

    return Model;
});