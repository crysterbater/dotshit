var d = document;

var Gifffer = function () {
    var images, i = 0;

    images = d.querySelectorAll('[data-gifffer]');
    for (; i < images.length; ++i) process(images[i]);
};

function formatUnit(v) {
    return v + (v.toString().indexOf('%') > 0 ? '' : 'px');
};

function createContainer(w, h, el) {
    var con = d.createElement('DIV');
    var cls = el.getAttribute('class');
    var id = el.getAttribute('id');

    cls ? con.setAttribute('class', el.getAttribute('class')) : null;
    id ? con.setAttribute('id', el.getAttribute('id')) : null;
    con.setAttribute('style', 'cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;');

    // creating play button
    var play = d.createElement('DIV');
    play.setAttribute('class', 'gifffer-play-button');

    var trngl = d.createElement('DIV');
    trngl.setAttribute('class', 'gifffer-play-button-trngl');
    play.appendChild(trngl);

    // dom placement
    con.appendChild(play);
    el.parentNode.replaceChild(con, el);
    return {c: con, p: play};
};

function calculatePercentageDim(el, w, h, wOrig, hOrig) {
    var parentDimW = el.parentNode.offsetWidth;
    var parentDimH = el.parentNode.offsetHeight;
    var ratio = wOrig / hOrig;

    if (w.toString().indexOf('%') > 0) {
        w = parseInt(w.toString().replace('%', ''));
        w = (w / 100) * parentDimW;
        h = w / ratio;
    }

    return {w: w, h: h};
};

function process(el) {
    var url, con, c, w, h, duration, play, gif, playing = false, playClicked = false, cc, isC, durationTimeout, dims;

    url = el.getAttribute('data-gifffer');
    w = el.getAttribute('data-gifffer-width');
    h = el.getAttribute('data-gifffer-height');
    duration = el.getAttribute('data-gifffer-duration');
    el.style.display = 'block';
    el.style.visibility = 'hidden';

    // creating the canvas
    c = document.createElement('canvas');
    isC = !!(c.getContext && c.getContext('2d'));
    if (w && h && isC) cc = createContainer(w, h, el);

    // waiting for image load
    el.onload = function () {
        if (!isC) return;

        w = w || el.width;
        h = h || el.height;

        // creating the container
        if (!cc) cc = createContainer(w, h, el);
        con = cc.c;
        play = cc.p;
        dims = calculatePercentageDim(con, w, h, el.width, el.height);

        var playGif = function() {
            playing = true;
            gif = document.createElement('IMG');
            gif.setAttribute('style', 'width:' + dims.w + 'px;height:' + dims.h + 'px;');
            gif.setAttribute('data-uri', Math.floor(Math.random() * 100000) + 1);
            setTimeout(function () {
                gif.src = url;
            }, 0);
            con.removeChild(play);
            con.removeChild(c);
            con.appendChild(gif);
            if (parseInt(duration) > 0) {
                durationTimeout = setTimeout(function () {
                    playing = false;
                    con.appendChild(play);
                    con.removeChild(gif);
                    con.appendChild(c);
                    gif = null;
                }, duration);
            }
        };

        var pauseGif = function() {
            playing = false;
            con.appendChild(play);
            con.removeChild(gif);
            con.appendChild(c);
            gif = null;
        };

        con.addEventListener('mouseover', function (e) {
            clearTimeout(durationTimeout);
            if (!playing) {
                playGif();
            }
        });

        con.addEventListener('mouseout', function (e) {
            clearTimeout(durationTimeout);
            if (playing && !playClicked) {
                pauseGif();
            }
        });

        con.addEventListener('click', function () {
            clearTimeout(durationTimeout);
            if (!playing) {
                playClicked = true;
                playGif();
            } else if (playing && !playClicked) {
                playClicked = true;
            } else if (playing && playClicked) {
                playClicked = false;
                pauseGif();
            }
        });

        el.style.visibility = 'visible';

        // canvas
        c.width = dims.w;
        c.height = dims.h;
        c.getContext('2d').drawImage(el, 0, 0, dims.w, dims.h);
        con.appendChild(c);

    }
    el.src = url;
};
