
        var Timeago = {
                    getTimeAgoText: function (datetime, epoch) {
                        if(epoch)
                            return moment.unix(datetime).fromNow();
                        else return new moment(datetime).fromNow();
                    },

                    refresh: function (element, datetime) {
                        element.innerHTML = this.getTimeAgoText(datetime);
                    }
                },
                interval;

        Polymer('time-ago',{
            setup: function () {
                var datetime = this.datetime,
                        element = this.$.timeago;

                element.innerHTML = Timeago.getTimeAgoText(this.datetime, this.epoch);

                if (this.refresh === true) {
                    if (typeof interval !== 'undefined') {
                        clearInterval(interval);
                    }

                    interval = setInterval(function () {
                        Timeago.refresh(element, datetime);
                    }, this.delay);
                }
            },
            ready: function() {
                this.setup();
            },
            datetimeChanged: function () {
                this.setup();
            },
            epoch: true,
            datetime: 0,
            refresh: true,
            delay: 60000
        });
    