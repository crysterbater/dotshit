define([
    'jquery'
], function(
    $
) {
    var serverBaseUrl = 'http://flatun.com/';

    return {
        baseUrl: 'http://flatun.com/',
        serverBaseUrl: serverBaseUrl,
        apiBaseUrl: serverBaseUrl + 'api/',
        isMobile: function() {
            return $(document.body).css('min-width') == '0px';
        }
    };
});