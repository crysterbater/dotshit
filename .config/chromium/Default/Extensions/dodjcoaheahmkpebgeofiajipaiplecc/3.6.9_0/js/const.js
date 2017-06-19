var GM_CONST = {};


GM_CONST.THEME = {
  DARK: 'dark',
  DEFAULT: 'default'
};
/**
 * Players Data
 */
GM_CONST.PLAYERS = {};
GM_CONST.PLAYERS.GPM = {
  'id': "gpm",
  'name': "Google Music",
  'url': "https://play.google.com/music/listen#/now",
  'logo_url': "images/icon_48.png",
  'media_keys_url': "/js/keys-gmusic.js",
  'eq_enabled': true,
  'mini_height' : 165,
  'css_init': '/css/gpm_init.css'
};

GM_CONST.PLAYERS.SC = {
  'id': "sc",
  'name': "SoundCloud",
  'url': "https://soundcloud.com/stream",
  'logo_url': "images/sc_48.png",
  'media_keys_url': "/js/keys-soundcloud.js",
  'eq_enabled': false,
  'mini_height' : 117,
  'css_init': '/css/sc_init.css'
};

/**
 * EQ filter types
 */
GM_CONST.FT = {
    LOWPASS: "lowpass",
    HIGHPASS: "highpass",
    BANDPASS: "bandpass",
    LOWSHELF: "lowshelf",
    HIGHSHELF: "highshelf",
    PEAKING: "peaking",
    NOTCH: "notch",
    ALLPASS: "allpass"
};

/**
 * EQ default values
 */
GM_CONST.EQ = [{
    label : 'master',
    gain : 1
}, {
    label : '32',
    f : 32,
    gain : 0,
    type : GM_CONST.FT.LOWSHELF
}, {
    label : '64',
    f : 64,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '125',
    f : 125,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '250',
    f : 250,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '500',
    f : 500,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '1k',
    f : 1000,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '2k',
    f : 2000,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '4k',
    f : 4000,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '8k',
    f : 8000,
    gain : 0,
    type : GM_CONST.FT.PEAKING
}, {
    label : '16k',
    f : 16000,
    gain : 0,
    type : GM_CONST.FT.HIGHSHELF
}];
GM_CONST.PRESETS = [];
GM_CONST.PRESETS.push({
    name : 'None',
    gains : [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000]
});
GM_CONST.PRESETS.push({
    name : 'Classical',
    gains : [-0.0000, -0.0000, -0.0000, -0.0000, -0.0000, -0.0000, -4.3200, -4.3200, -4.3200, -5.7600]
});
GM_CONST.PRESETS.push({
    name : 'Club',
    gains : [-0.0000, -0.0000, 4.8000, 3.3600, 3.3600, 3.3600, 1.9200, -0.0000, -0.0000, -0.0000]
});
GM_CONST.PRESETS.push({
    name : 'Dance',
    gains : [5.7600, 4.3200, 1.4400, -0.0000, -0.0000, -3.3600, -4.3200, -4.3200, -0.0000, -0.0000]
});
GM_CONST.PRESETS.push({
    name : 'Full Bass',
    gains : [4.8000, 5.7600, 5.7600, 3.3600, 0.9600, -2.4000, -4.8000, -6.2400, -6.7200, -6.7200]
});
GM_CONST.PRESETS.push({
    name : 'Full Bass & Treble',
    gains : [4.3200, 3.3600, -0.0000, -4.3200, -2.8800, 0.9600, 4.8000, 6.7200, 7.2000, 7.2000]
});
GM_CONST.PRESETS.push({
    name : 'Full Treble',
    gains : [-5.7600, -5.7600, -5.7600, -2.4000, 1.4400, 6.7200, 9.6000, 9.6000, 9.6000, 10.0800]
});
GM_CONST.PRESETS.push({
    name : 'Laptop Speakers / Headphones',
    gains : [2.8800, 6.7200, 3.3600, -1.9200, -1.4400, 0.9600, 2.8800, 5.7600, 7.6800, 8.6400]
});
GM_CONST.PRESETS.push({
    name : 'Large Hall',
    gains : [6.2400, 6.2400, 3.3600, 3.3600, -0.0000, -2.8800, -2.8800, -2.8800, -0.0000, -0.0000]
});
GM_CONST.PRESETS.push({
    name : 'Live',
    gains : [-2.8800, -0.0000, 2.4000, 3.3600, 3.3600, 3.3600, 2.4000, 1.4400, 1.4400, 1.4400]
});
GM_CONST.PRESETS.push({
    name : 'Party',
    gains : [4.3200, 4.3200, -0.0000, -0.0000, -0.0000, -0.0000, -0.0000, -0.0000, 4.3200, 4.3200]
});
GM_CONST.PRESETS.push({
    name : 'Pop',
    gains : [-0.9600, 2.8800, 4.3200, 4.8000, 3.3600, -0.0000, -1.4400, -1.4400, -0.9600, -0.9600]
});
GM_CONST.PRESETS.push({
    name : 'Reggae',
    gains : [-0.0000, -0.0000, -0.0000, -3.3600, -0.0000, 3.8400, 3.8400, -0.0000, -0.0000, -0.0000]
});
GM_CONST.PRESETS.push({
    name : 'Rock',
    gains : [4.8000, 2.8800, -3.3600, -4.8000, -1.9200, 2.4000, 5.2800, 6.7200, 6.7200, 6.7200]
});
GM_CONST.PRESETS.push({
    name : 'Ska',
    gains : [-1.4400, -2.8800, -2.4000, -0.0000, 2.4000, 3.3600, 5.2800, 5.7600, 6.7200, 5.7600]
});
GM_CONST.PRESETS.push({
    name : 'Soft',
    gains : [2.8800, 0.9600, -0.0000, -1.4400, -0.0000, 2.4000, 4.8000, 5.7600, 6.7200, 7.2000]
});
GM_CONST.PRESETS.push({
    name : 'Soft rock',
    gains : [2.4000, 2.4000, 1.4400, -0.0000, -2.4000, -3.3600, -1.9200, -0.0000, 1.4400, 5.2800]
});
GM_CONST.PRESETS.push({
    name : 'Techno',
    gains : [4.8000, 3.3600, -0.0000, -3.3600, -2.8800, -0.0000, 4.8000, 5.7600, 5.7600, 5.2800]
});
