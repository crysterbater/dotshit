$('#interface').css({opacity: 0});

$( function( ) {

  var editedQuickLaunches = [];

  function getAction( ) {
    return window.location.hash.substring( 1);
  }

  function changeView( ) {
    var hash = getAction( );

    switch( hash) {

      case 'add':
        showForm( );
        editQuickLaunches( );
        break;

      case 'opt':
        showOptions( );
        break;

      case 'sht':
        hideOptions( );
        break;

      case 'upd':
        hideForm( );
        editQuickLaunches( );
    }
  }

  function showForm( ) {
    ($('#shortcuts section').html() == '') ?
      $('#cclApply').hide( ) : $('#cclApply').show( );

    $('#edition').addClass('hidden');
    $('#urls').html('');
    form_add.auto.checked = false;
    form_add.name.value = '';
    addUrl( );
  }

  function hideForm( ) {
    $('#edition').removeClass('hidden');
  }

  function showOptions( ) {
    $('#shortcuts').addClass('bottom');
  }

  function hideOptions( ) {
    var storage = new Storage( );
    if (editedQuickLaunches.length > 0) {
      storage.updateQuickLaunch( editedQuickLaunches);
      editedQuickLaunches = [];
      setTimeout( function( ) {
        reloadQuickLaunches( );
        $('#flipper').removeClass('return');
        $('#shortcuts').removeClass('bottom');
      }, 100);
    }
    else {
      $('#flipper').removeClass('return');
      $('#shortcuts').removeClass('bottom');
    }
  }

  function openUrls( urls) {
    urls = urls.reverse( );
    for(i in urls) {
      window.open( urls[i]);
    }
  }

  function deleteQuickLaunch( article) {
    var index = parseInt( article.attr('id').replace('quick_', ''));
    var storage = new Storage( );
    storage.removeQuickLaunch( index);

    article.css({height: '0px'});
    setTimeout( function( ) {
      reloadQuickLaunches( );
    }, 1000);
  }

  function sortQuickLaunches( prefixe) {
    editedQuickLaunches = [];

    var storage = new Storage( );
    setTimeout( function( ) {
      storage.get( function( quickLaunches) {
        $('#edition article').each( function( i) {
          var index = parseInt( $(this).attr('id').replace('quick_', ''));
          editedQuickLaunches.push( quickLaunches[index]);
        });
      });
    }, 100);
  }

  function moveElementUp( element, isQuickLaunch) {
    var index = element.index( );
    var children = element.parent( ).children('article');
    if (index > 0) element.insertBefore( children.eq( index - 1));

    if (true == isQuickLaunch) {
      sortQuickLaunches( isQuickLaunch);
    }
  }

  function moveElementDown( element, isQuickLaunch) {
    var index = element.index( );
    var children = element.parent( ).children('article');
    if (index < children.length) element.insertAfter( children.eq( index + 1));

    if (true == isQuickLaunch) {
      sortQuickLaunches( isQuickLaunch);
    }
  }

  function editQuickLaunches( ) {
    $('#flipper').addClass('return');
  }

  function editQuickLaunch( article) {
    showForm( );

    var index = parseInt( article.attr('id').replace('quick_', ''));
    var storage = new Storage( );
    storage.get( function( quickLaunches) {
      var quickLaunch = quickLaunches[index];
      form_add.auto.checked = quickLaunch.auto;
      form_add.name.value = quickLaunch.name;

      $('#addition form').append('<input type="hidden" name="id" value="'+index+'" />');
      $('#urls').html('');

      for (i in quickLaunch.urls) {
        addUrl( quickLaunch.urls[i]);
      }
      editQuickLaunches( );
      window.location.hash = 'edt';
    });
  }

  function loadQuickLaunches( quickLaunches, quickLaunchesList, editable) {
    quickLaunchesList.html('');
    var html = '';

    for (i in quickLaunches) {
      var attr = (quickLaunches[i].auto == true) ? ' class="autolaunch"' : '';

      html += '<article class="tr_2" id="quick_'+i+'">';
      html += '  <div'+attr+'>';
      html += '    <i class="icns icon-right"></i>';
      html += '    <h2>'+quickLaunches[i].name+'</h2>';
      html += '    <h4>'+quickLaunches[i].urls.length+' onglets</h4>';
      html += '  </div>';
      if ( editable) {
        html += '  <button class="delete">';
        html += '    <i class="icns icon-delete"></i>';
        html += '  </button>';
        html += '  <button class="up halfHeight">';
        html += '    <i class="icns icon-up"></i>';
        html += '  </button>';
        html += '  <button class="down halfHeight">';
        html += '    <i class="icns icon-down"></i>';
        html += '  </button>';
      }
      html += '</article>';
    }

    quickLaunchesList.html( html);

    if (! editable) {
      $('#shortcuts article div').bind('click', function( event) {
        var index = $(this).parent( ).index( );
        var storage = new Storage( );
        storage.get( function( quickLaunches) {
          var quickLaunch = quickLaunches[index];
          openUrls( quickLaunch.urls);
        });
      });
    }
    else {
      $('#edition article div').bind('click', function( event) {
        editQuickLaunch( $(this).parent( ));
      });

      $('#edition article button.delete').bind('click', function( event) {
        event.stopPropagation( );
        deleteQuickLaunch( $(this).parent( ));
        return false;
      });

      $('#edition article button.up').bind('click', function( event) {
        event.stopPropagation( );
        moveElementUp( $(this).parent( ), true);
        return false;
      });

      $('#edition article button.down').bind('click', function( event) {
        event.stopPropagation( );
        moveElementDown( $(this).parent( ), true);
        return false;
      });
    }
  }

  function reloadQuickLaunches( callback) {
    var storage = new Storage( );
    setTimeout( function( ) {
      storage.get( function( quickLaunches) {
        if (quickLaunches.length > 0) {
          loadQuickLaunches( quickLaunches, $('#shortcuts section'));
          loadQuickLaunches( quickLaunches, $('#edition section'), true);
        }
        else {
          $('#shortcuts section').html( '');
          $('#edition section').html( '');
          window.location.hash = 'add';
        }
        if (null != callback) callback( );
      });
    }, 100);
  }

  function saveQuickLaunch( form, action) {
    var index = null;
    var name = '';
    var pos  = 1;
    var urls = [];
    var auto = false;

    for (i in form) {
      if (form[i].name == 'urls[]') {
        urls.push( form[i].value);
      }
      if (form[i].name == 'name') {
        name = form[i].value;
      }
      if (form[i].name == 'id') {
        index = form[i].value;
      }
      if (form[i].name == 'auto') {
        auto = (form[i].value == 1);
      }
    }

    var quickLaunch = new QuickLaunch( name, urls.reverse( ), auto);
    var qlParams = quickLaunch.getParams( );

    if (qlParams.urls.length > 0) {
      var storage = new Storage( );

      if (action == 'add') {
        storage.addQuickLaunch( qlParams);
      }
      else if (action == 'edt') {
        storage.updateQuickLaunch( qlParams, index);
      }

      reloadQuickLaunches( function( ) {
        window.location.hash = 'upd';
      });
    } else {
      console.log('Your urls are wrong');
    }
    return false;
  }

  function removeUrl( article) {
    article.addClass('hidden');

    setTimeout( function( ) {
      article.remove( );

      if ($('#urls').children( ).length <= 1) {
        $('#urls').addClass('hideButtons');
      }
      else {
        $('#urls').removeClass('hideButtons');
      }
    }, 1000);
  }

  function addUrl( value) {
    var input = '';

    if (null != value) {
      var attr = 'value="'+value+'" ';
      var className = '';
    } else {
      var attr = '';
      var className = 'hidden ';
    }

    var translator = new Translator( );
    var translation = translator.get('addition', 'placeholderUrl');

    input += '<article class="'+className+'tr_spe">';
    input += '  <input type="text" name="urls[]" '+attr+'placeholder="'+translation+'" />';
    input += '  <button class="delete">';
    input += '    <i class="icns icon-cancelw"></i>';
    input += '  </button>';
    input += '  <button class="up halfHeight">';
    input += '    <i class="icns icon-up"></i>';
    input += '  </button>';
    input += '  <button class="down halfHeight">';
    input += '    <i class="icns icon-down"></i>';
    input += '  </button>';
    input += '</article>';

    $('#urls').prepend( input);

    if ($('#urls').children( ).length <= 1) {
      $('#urls').addClass('hideButtons');
    }
    else {
      $('#urls').removeClass('hideButtons');
    }

    if ($('#urls article').length > 1 && null == value) {
      $('#urls article:eq(0) input').focus( );
    }

    $('#urls article:eq(0) button.delete').bind('click', function( ) {
      removeUrl( $(this).parent( ));
      return false;
    });

    $('#urls article:eq(0) button.up').bind('click', function( ) {
      moveElementUp( $(this).parent( ));
      return false;
    });

    $('#urls article:eq(0) button.down').bind('click', function( ) {
      moveElementDown( $(this).parent( ));
      return false;
    });

    if ('' != className) {
      setTimeout( function( ) {
        $('#urls article:eq(0)').removeClass('hidden');
      }, 100);
    }

    return false;
  }

  function checkAutoLaunch( ) {
    var storage = new Storage( );
    storage.get( function( quickLaunches) {
      for (i in quickLaunches) {
        if (quickLaunches[i].auto == 1) {
          openUrls( quickLaunches[i].urls);
        }
      }
    });
  }

  function checkOldStorage( ) {
    if (undefined != localStorage["shorcuts"]) {

      var storage = JSON.parse( localStorage["shorcuts"]);

      for (i in storage) {
        var urls = storage[i].links;
        var quickLaunch = new QuickLaunch( storage[i].title, i, urls.reverse( ));
        var qlParams = quickLaunch.getParams( );
        var storage = new Storage( );
        storage.addQuickLaunch( qlParams);
      }
    }
  }

  function translate( ) {
    var translator = new Translator( );
    var shortcuts_tsl = {
      'aOptions': {
        'element': $('a[href="#opt"]'),
        'target': 'title'
      },
      'aModify': {
        'element': $('a[href="#upd"]'),
        'target': 'title'
      }
    };

    var option_tsl = {
      'aClose': {
        'element': $('a[href="#sht"]'),
        'target': 'title'
      },
      'labelSync': {
        'element': $('label[for="sync"]'),
        'target': 'html'
      }
    };

    var edition_tsl = {
      'aBack': {
        'element': $('a[href="#sht"]'),
        'target': 'title'
      },
      'aAdd': {
        'element': $('a[href="#add"]'),
        'target': 'title'
      }
    };

    var addition_tsl = {
      'aCancel': {
        'element': $('a[id="cclApply"]'),
        'target': 'title'
      },
      'labelLaunchAtStart': {
        'element': $('label[for="auto"]'),
        'target': 'html'
      },
      'placeholderName': {
        'element': $('input[name="name"]'),
        'target': 'placeholder'
      },
      'buttonAddUrl': {
        'element': $('button[id="addUrl"] span'),
        'target': 'html'
      },
      'buttonApply': {
        'element': $('button[id="save"] span'),
        'target': 'html'
      }
    };

    translator.setElements('shortcuts', shortcuts_tsl);
    translator.setElements('option', option_tsl);
    translator.setElements('edition', edition_tsl);
    translator.setElements('addition', addition_tsl);

    translator.translate( );
  }

  function init( ) {

    // TO INIT APP
    //
    // var storage = new Storage( );
    // storage.init( );

    // checkOldStorage( );

    reloadQuickLaunches( function( ) {
      $('#interface').animate( {opacity: 1}, 1200, changeView);
      hideOptions( );
      hideForm( );
    });

    if (getAction( ) == 'edt') {
      window.location.hash = 'upd';
    }

    checkAutoLaunch( );
    translate( );
  }

  $( window).bind('hashchange', changeView);

  $('button#addUrl').bind('click', function( ) {
    addUrl( );
    return false;
  });

  // $('#options input[name="sync"]').bind('click', function( ) {
  //   var isChecked = $(this).is('input:checked');

  //   var storage = new Storage( );
  //   storage.updateOptions( {sync: isChecked});
  // });

  $('#form form').submit( function( event) {
    saveQuickLaunch( $(this).serializeArray( ), getAction( ));
    setTimeout( function( ) {
      reloadQuickLaunches( );
    }, 100);
    event.preventDefault( );
  });

  init( );
});
