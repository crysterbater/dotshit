(function (win) {
    'use strict';

    let box = {};
    const STORAGE_KEY = 'com.lrednight.boxes';
    /** Initialize */
    let storage = win.localStorage.getItem(STORAGE_KEY);
    if (!storage || storage === 'null') {
        storage = {};
    } else {
        storage = JSON.parse(storage);
    }

    Object.defineProperty(box, 'STORAGE_KEY', {
        value: STORAGE_KEY,
        writable: false
    });

    box.lock = function () {
        if (storage._locking) {
            throw new Error('Box already locked.');
        }
        storage._locking = + new Date();
        save();
    };

    box.reload = function () {
        storage = JSON.parse(win.localStorage.getItem(STORAGE_KEY));
    };

    box.unlock = function () {
        if (!storage._locking) {
            throw new Error('Box is not locked.');
        }
        storage._locking = false;
        save();
    };

    box.get = function (name) {
        checkName(name);
        if (name in storage) {
            return storage[name];
        }
        else {
            return null;
        }
    };

    box.copyAll = function () {
        return JSON.parse(JSON.stringify(storage));
    };

    /** Instead of using this method, you should use copyAll */
    box.getAll = function () {
        console.warn('You should use box.copyAll() instead.');
        return storage;
    };

    var listeners = {
        change: []
    };
    box.addEventListener = function (type, callback) {
          type in listeners && listeners[type].push(callback);
    };

    box.add = function (name) {
        checkName(name);
        if (name in storage) {
            throw new Error('Box already exists.');
        }
        storage[name] = {
            name: name,
            id: generateId(),
            created: + new Date,
            updated: + new Date,
            tabs: []
        };
    };

    box.appendTabs = function (name, tab) {
        checkName(name);
        if (!storage[name]) {
            throw new Error('Box does not exist.');
        }
        if (tab.constructor.name === 'Array' && tab.length >= 1) {
            storage[name].tabs = storage[name].tabs.concat(tab);
        } else {
            storage[name].tabs.push(generateTab(tab));
        }
        storage[name].updated = + new Date();
        save();
    };

    box.insert = function (name, index, tab) {
        checkName(name);
        storage[name].tabs.splice(index, 0, generateTab(tab));
        save();
    };

    box.remove = function (name) {
        checkName(name);
        if (!storage[name]) return false;
        delete storage[name];
        save();
    };

    box.removeTab = function (name, tab) {
        let url = typeof tab === 'string' ? tab : tab.url, flag;
        for (let i = 0, len = storage[name].tabs.length; i < len; i++) {
            if (storage[name].tabs[i].url === url) {
                storage[name].tabs.splice(i, 1);
                flag = true;
                break;
            }
        }
        if (!flag) {
            return false;
        }

        save();
        return true;
    };

    box.rename = function (oriName, newName) {
        if (oriName === newName) return true;
        checkName(newName);
        if (!storage[oriName]) return false;
        storage[newName] = JSON.parse(JSON.stringify(storage[oriName]));
        storage[newName].name = newName;
        delete storage[oriName];
        save();
        return true;
    };

    function save() {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

        listeners.change.forEach(function (val) {
            val();
        });
    }
    function generateId() {
        return btoa(+ new Date() % 1000 + Math.random() + '');
    }
    function checkName(name) {
        name = name.trim();
        if (!name) {
            throw new Error('Box name cannot be empty.');
        }
        if (name.indexOf('\\') !== -1 || name.indexOf('~') !== -1 || name.indexOf('_') === 0) {
            throw new Error('Invalid character.');
        }
        return name;
    }
    function generateTab(tab) {
        return {
            icon: tab.icon || tab.favIconUrl,
            title: tab.title || 'Unnamed',
            url: tab.url || '#'
        };
    }

    window.box = box;

})(window);