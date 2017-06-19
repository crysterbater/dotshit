'use strict';

var dragable = function (parentSelector, itemSelector) {
  this.dragging = null;
  this.active = true;
  this.onoverlap = function () {};

  this.parent = document.querySelector(parentSelector);

  this.iso = new window.Isotope(this.parent, {
    itemSelector,
    layoutMode: 'fitRows',
    getSortData: {
      order: '[data-order] parseInt'
    }
  });
  this.iso.getItemElements().forEach((e, i) => {
    e.setAttribute('draggable', true);
    e.dataset.order = i;
  });

  this.parent.addEventListener('dragstart', (e) => {
    this.dragging = e.target;
    e.dataTransfer.setData('text', e.target.dataset.order);
    window.setTimeout(
      (dragging) => dragging.classList.add('dragging'),
    0, e.target);
  }, false);
  this.parent.addEventListener('dragend', () => {
    this.dragging.classList.remove('dragging');
    this.dragging = null;
  }, false);
  this.parent.addEventListener('drop', (e) => {
    e.stopPropagation();
    return false;
  }, false);
  this.parent.addEventListener('dragover', (e) => {
    let over = e.target;
    if (
      this.dragging &&
      over.parentNode === this.parent &&
      this.dragging !== over &&
      this.dragging.dataset.order &&
      over.dataset.order
    ) {
      e.preventDefault();
      if (this.active) {
        this.onoverlap(this.dragging, over, this.parent);
      }
    }
  }, false);
};
dragable.prototype.overlap = function (c) {
  this.onoverlap = c;
};
dragable.prototype.pause = function () {
  this.active = false;
};
dragable.prototype.resume = function () {
  this.active = true;
};
function dragableIsotope (parentSelector, ItemsSelector) { // jshint ignore:line
  let d = new dragable(parentSelector, ItemsSelector);
  d.iso.on('arrangeComplete', () => d.resume());
  d.overlap((top, over, parent) => {
    d.pause();
    let i = +top.dataset.order;
    let j = +over.dataset.order;
    if (j > i) {
      for (let k = i + 1; k <= j; k += 1) {
        parent.querySelector(`[data-order="${k}"]`).dataset.order = k - 1;
      }
      top.dataset.order = j;
    }
    if (i > j) {
      for (let k = i - 1; k >= j; k -= 1) {
        parent.querySelector(`[data-order="${k}"]`).dataset.order = k + 1;
      }
      top.dataset.order = j;
    }
    d.iso.updateSortData();
    d.iso.arrange({
      sortBy: 'order'
    });
  });
  return {
    get items () {
      return this.iso.getItemElements();
    },
    attach: (item) => {
      item.classList.add('dragging');
      item.setAttribute('draggable', true);
    },
    on: (n, c) => d.iso.on(n, c)
  };
}
