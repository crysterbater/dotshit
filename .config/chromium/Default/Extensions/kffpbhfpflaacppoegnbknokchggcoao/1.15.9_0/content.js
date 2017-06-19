function generateKey(timeout) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_',
        sm = {
            divide: function (divisor, dividend) {
                var i = 0,
                    x = 0,
                    g,
                    s = '';
                for(; i<dividend.length; i++){
                    x = (x*10)+parseInt(dividend.charAt(i),10);
                    if(x < divisor)
                        s += (s.length > 0 ? "0" : "");
                    else{
                        g = Math.floor(x / divisor);
                        s += g;
                        x = x - (g * divisor);
                    }
                }
                return {result: s, remainder: x};
            },
            l: function (numStr) {
                var r = 0,
                    i = 0,
                    p;
                for(; i < numStr.length; i++) {
                    p = parseInt(numStr.charAt(i));
                    if (i%2 === 0) r += p;
                    else {
                        p *= 2;
                        r += (p > 9 ? p-9 : p);
                    }
                }
                return (r * 9) % 10;
            }
        };
    var d = timeout.toString()+Date.now().toString(),
        i,
        c,
        p,
        a = '',
        k = '',
        b = chars,
        r10 = function (length) {
            var s = '';
            while(s.length < length)
                s += Math.floor(Math.random()*10);
            return s;
        };
    for(i=0; i<d.length; i++){
        p = parseInt(d.charAt(i));
        while(sm.l((c = r10(5))) !== p){}
        a += c;
    }
    while (a !== '') {
        z = sm.divide(64, a);
        k = b.charAt(z.remainder)+k;
        a = z.result;
    }
    return k;
}
function notifySelf(times, interval) {
    for (var i = 0; i < times; i++) {
        setTimeout(function () {
            window.postMessage({ command: 'unlocker_exists', key: generateKey(1000) }, '*');
        }, interval * i);
    }
}
notifySelf(50, 100);
document.addEventListener('DOMContentLoaded', function () {
    notifySelf(50, 100);
}, false);
