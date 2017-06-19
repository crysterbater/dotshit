define([

], function(

) {

    return {
        tooltips: function($el) {
            $el.find('a[title], .tooltip[title]').tooltip({
                track: true
            });
        }
    };
});