'use strict';

let container = document.querySelector('.grid');
let item = document.querySelector('.grid-item');
let noapp = document.getElementById('no-app');

document.addEventListener('click', (e) => {
  let parent = e.target.closest('.grid-item');
  let cmd = e.target.dataset.cmd || parent.dataset.cmd;
  if (cmd === 'open-settings') {
    chrome.tabs.create({
      url: parent.dataset.settingsurl
    });
  }
  if (cmd === 'open-home') {
    chrome.tabs.create({
      url: parent.dataset.homeurl
    });
  }
  if (cmd === 'open-app') {
    chrome.management.launchApp(parent.dataset.id);
  }
}, false);

chrome.management.getAll((extensions) => {
  extensions = extensions.filter(e => e.type.endsWith('app') && e.enabled);
  if (extensions.length) {
    chrome.storage.local.get('ids', (obj) => {
      let ids = obj.ids || [];
      extensions.sort((e1, e2) => {
        let i = ids.indexOf(e1.id);
        let j = ids.indexOf(e2.id);
        return i !== -1 && j !== -1 ? i - j : 0;
      }).forEach(app => {
        let div = item.cloneNode(true);
        let icon = app.icons.sort((a, b) => b.size - a.size)[0] || './addon.png';
        div.style.backgroundImage = `url("${icon.url}")`;
        div.querySelector('.title').textContent = div.title = app.name;
        div.dataset.id = app.id;
        if (app.optionsUrl) {
          div.dataset.settingsurl = app.optionsUrl;
        }
        if (app.homepageUrl) {
          div.dataset.homeurl = app.homepageUrl;
        }
        container.insertBefore(div, noapp);
      });
      // resize
      let cols = 4;
      let width = 138 || container.querySelector('.grid-item').getBoundingClientRect().width;
      width = Math.min(extensions.length, cols) * (width + 10);
      document.body.style.width = width + 'px';
      // iso
      window.dragableIsotope('.grid', '.grid-item').on('arrangeComplete', function () {
        let ids = this.getFilteredItemElements().map(e => e.dataset.id);
        chrome.storage.local.set({ids});
      });
    });
  }
});
