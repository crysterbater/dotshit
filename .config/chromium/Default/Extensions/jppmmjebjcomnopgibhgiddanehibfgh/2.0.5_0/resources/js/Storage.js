function Storage( requireToInit) {
  var obj = this;
  var name = 'quickLaunchEm';

  this.options = [];
  this.quickLaunches = [];
  this.storageType = null;

  this.self = {
    init: function( ) {
      obj.quickLaunches = [];
      obj.self.save( );
    },

    setStorageType: function( type) {
      obj.storageType = (type == 'sync') ? chrome.storage.sync : chrome.storage.local;
    },

    load: function( ) {
      obj.storageType.get( name, function( quickLaunches) {
        if ( chrome.extension.lastError) {
          console.log( 'An error occurred: ' + chrome.extension.lastError.message);
        }
        else {
          if (typeof quickLaunches == 'object' && null != quickLaunches[name]) {
            obj.quickLaunches = quickLaunches[name];
          } else {
            obj.quickLaunches = [];
          }
        }
      });
    },

    save: function( ) {
      obj.storageType.set( {'quickLaunchEm': obj.quickLaunches}, function( ) {
        if ( chrome.extension.lastError) {
          console.log( 'An error occurred: ' + chrome.extension.lastError.message);
        }
        else {
          setTimeout( function( ) {
            obj.self.load( );
          }, 100);
        }
      });
    },

    loadOptions: function( ) {
      obj.storageType.get( 'quickLaunchEm_options', function( options) {
        if ( chrome.extension.lastError) {
          console.log( 'An error occurred: ' + chrome.extension.lastError.message);
        }
        else {
          if (typeof options == 'object' && null != options['quickLaunchEm_options']) {
            obj.options = options['quickLaunchEm_options'];
          } else {
            obj.options = {};
          }
        }
      });
    },

    saveOptions: function( options, callback) {
      obj.storageType.set( {'quickLaunchEm_options': options}, function( ) {
        if ( chrome.extension.lastError) {
          console.log( 'An error occurred: ' + chrome.extension.lastError.message);
        }
        else {
          setTimeout( function( ) {
            obj.self.loadOptions( );
          }, 100);
        }
      });
    },

    getOptions: function( callback, index) {
      setTimeout( function( ) {
        if (null == index) {
          callback( obj.options);
        }
        else {
          callback( obj.options[index]);
        }
      }, 100);
    },

    updateOptions: function( index, params) {
      if (null != index && null != params) {
        setTimeout( function( ) {
          obj.options[index] = obj.self.merge( obj.options[index], params);
          obj.self.saveOptions( );
        }, 100);
      }
    },

    merge: function( obj, newParams) {
      for (var property in newParams) {
        obj[property] = newParams[property];
      }
      return obj;
    },

    get: function( callback, index) {
      setTimeout( function( ) {
        if (null == index) {
          callback( obj.quickLaunches);
        }
        else {
          callback( obj.quickLaunches[index]);
        }
      }, 100);
    },

    addQuickLaunch: function( quickLaunch) {
      setTimeout( function( ) {
        obj.quickLaunches.push( quickLaunch);
        obj.self.save( );
      }, 100);
    },

    updateQuickLaunch: function( params, index) {
      if (null != params) {
        setTimeout( function( ) {
          if (null != index) {
            obj.quickLaunches[index] = obj.self.merge( obj.quickLaunches[index], params);
          }
          else {
            obj.quickLaunches = params;
          }
          obj.self.save( );
        }, 100);
      }
    },

    removeQuickLaunch: function( index) {
      if (null != index) {
        setTimeout( function( ) {
          obj.quickLaunches.splice( index, 1);
          obj.self.save( );
        }, 100);
      }
    }
  };

  this.self.setStorageType( 'local');
  this.self.load( );
  this.self.loadOptions( );

  if ( Object.keys( obj.options).length > 0) {
    if (null != obj.options.sync && obj.options.sync == true) {
      this.self.setStorageType( 'sync');
    }
  }

  return this.self;
}
