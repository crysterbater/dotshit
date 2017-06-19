angular.module("sp-app", ['templates']);
angular.module('sp-app').controller('gridContextMenuCtrl', function($scope, library, dialogManager, $rootScope, player) {
    // $scope.navigator.openMainMenu = false;
})

;/// <reference path="../../../vendor/angular/angular.js" />
angular.module('sp-app').directive('gridView', function($filter, library) {
    return {
        scope: {
            items: "=?",
            itemApi: "="
        },
        restrict: 'AE',
        replace: true,
        templateUrl: 'app/controls/grid_view/gridView.html',
        link: function($scope, $elem, $attrs) {
            $scope.onDblClick = function(item) {
                if (!document.querySelector('.contextmenu')) {
                    if ($scope.itemApi) {
                        $scope.itemApi.open(item);
                    }
                }

            }
            $scope.getArtStyles = function(album) {

                var styles = {};
                if (album && album.albumArtPath) {
                    styles = {
                        'background-image': 'url(' + album.albumArtPath + ')'
                    };
                }

                return styles;
            }
            $scope.criteriaMatch = function() {               
                if ($scope.itemApi.filter) {
                    var result = $scope.itemApi.filter();                    
                    if(result) {
                        return function(item) {
                            return _.find(result, item);
                        }
                    }                    
                }
                
            }
        }
    }
});

angular.module('sp-app').directive('seeker', function(player, $filter) {
    return {
        replace: true,
        templateUrl: 'app/controls/seeker/seeker.html',
        link: function($scope, $elem, $attrs) {
            var line, handler, progress;
            var initX;
            var logicalPercent;
            var isSeek = false;
            line = document.querySelector('#line');
            handler = document.querySelector('.handler');
            progress = document.querySelector('#seek-progress');
            

            handler.style.left = line.offsetLeft + 'px';

            handler.addEventListener('mousedown', onMouseDown);
            line.addEventListener('mousedown', function(e) {
                //   var y = (e.offsetY + line.offsetTop) - handler.offsetHeight / 2;(e.offsetX + line.offsetLeft)- handler.offsetHeight / 2
                var x = (e.offsetX + line.offsetLeft) - handler.offsetHeight / 2;
                moveHandler(x);
                onMouseDown(e);

            });
            var curPos = 0,
                curPercent;
            player.onTimeUpdate(function() {
                if (!isSeek) {
                    curPos = player.getCurrentTime();
                    
                    curPercent = 100 * curPos / player.getDuration();
                    var currentLeft = (line.offsetWidth - handler.offsetWidth) * curPercent / 100;
                    currentLeft += line.offsetLeft;
                    moveHandler(currentLeft);

                }
            });

            function moveHandler(left) {


                var leftBound = line.offsetLeft;
                var rightBound = line.offsetLeft + line.offsetWidth - handler.offsetWidth;
                if (left < line.offsetLeft) left = leftBound;
                if (left > rightBound) left = rightBound;
                var parentWidth = handler.parentElement.offsetWidth;
                var physicalPercent = 100 * left / parentWidth;
                handler.style.left = physicalPercent + '%';
                var logicalWidth = line.offsetWidth - handler.offsetWidth;
                var logicalDiff = left - line.offsetLeft;
                logicalPercent = 100 * logicalDiff / logicalWidth;
                progress.style.width = physicalPercent + '%';

            }

            function onMouseDown(e) {
                isSeek = true;
                initX = e.pageX - handler.offsetLeft;
                document.body.addEventListener('mousemove', onMouseMove);
                document.body.addEventListener('mouseup', onMouseUp);
            }

            function onMouseMove(e) {

                e.preventDefault();
                var x = e.pageX;
                var left = (x - initX);
                moveHandler(left);

            }

            function onMouseUp(e) {
                isSeek = false;
                document.body.removeEventListener('mousemove', onMouseMove);
                document.body.removeEventListener('mouseup', onMouseUp);
                player.setCurrentTime(logicalPercent);
            }
        }
    }
});

angular.module('sp-app').directive('spTooltip', function($interpolate, dialogManager, $timeout) {

    return {
        link: function($scope, $elem, $attrs) {
            var tooltipExp;
            var tooltipTemplateExp;
            var childScope;

            var tooltip;
            var position = "bottom";
            var deferred;
            var autoCloseTimeout;
            $scope.$watch(function() {
                return $attrs.spTooltip
            }, function(newVal, oldVal) {
                if (newVal != oldVal && childScope) {
                    if ($attrs.spTooltipUpdate) {
                        stopPopup();
                    }
                    childScope.spTooltip = $interpolate($attrs.spTooltip)($scope);
                }
            })

            function startPopup() {
                // stopPopup();
                childScope = $scope.$new();
                if ($attrs.spTooltip) {
                    childScope.spTooltip = $interpolate($attrs.spTooltip)($scope);
                } else {
                    childScope.spTooltip = '';
                }
                if ($attrs.spTooltipPosition) {
                    position = $attrs.spTooltipPosition;
                }
                var elemPosition = $elem[0].getBoundingClientRect();
                deferred = $timeout(function() {
                    tooltip = dialogManager.openDialog({
                        template: "app/controls/tooltip/spTooltip.html",
                        scope: childScope,
                        alignElement: $elem[0],
                        alignPosition: position,
                        autoClose: false
                    });
                }, 200);


            }

            function stopPopup() {
                if (deferred) {
                    $timeout.cancel(deferred);
                }
                if (tooltip) {
                    tooltip.destroy();
                }
                deferred = undefined;
                if (autoCloseTimeout) {
                    clearTimeout(autoCloseTimeout);
                    autoCloseTimeout = undefined;
                }
            }
            $elem[0].addEventListener("mouseenter", function($event) {
                $event.stopPropagation();
                startPopup();
                autoCloseTimeout = setTimeout(function() {

                    stopPopup();
                }, 5000)
            });
            $elem[0].addEventListener("mouseleave", function() {
                stopPopup();
            });

        }
    }
})

;angular.module('sp-app').controller('listContextMenuCtrl', function ($scope, library, dialogManager, $rootScope, player) {
    $scope.playlists = library.getPlaylists();
    $scope.navigator.openMainMenu = false;
    $scope.goToAlbum = function (track) {
        library.setOpenAlbum(track.album);
        $scope.navigator.openAlbum = true;
    }
    $scope.addToQueue = function (track) {
        library.addToQueue(track);
    }
    $scope.addToPlaylist = function (track, playlist) {
        library.addToPlaylist(track, playlist);
    }
    $scope.removeFromQueue = function (track) {
        library.removeFromQueue(track);
    }
    $scope.clearQueue = function () {
        library.clearQueue();
    }
    $scope.stopTrack = function () {

    }
    $scope.isPlaying = function (track) {

        return track === library.getCurrentTrack();
    }
    $scope.createPlaylist = function (track) {

        var scope = $rootScope.$new();
        scope.selectedTrack = track;
        dialogManager.openDialog({
            template: "app/views/playlists/createNewPlaylist.html",

            scope: scope,
            autoClose: false,
            backDrop: true
        });
    }

})

;/// <reference path="../../../vendor/angular/angular.js" />
angular.module('sp-app').directive('trackList', function(effects, library, dialogManager, $rootScope, player, $filter) {
    return {
        scope: {
            items: "=?",
            itemApi: "=",
            stick: "="
        },
        restrict: 'AE',
        replace: true,
        require: '?^^scrollbarRoot',
        templateUrl: 'app/controls/track_list/trackList.html',
        link: function($scope, $elem, $attrs, $scrollbarRoot) {
            
            var elem = $elem[0];
            var parentElement = null;
            const ITEM_HEIGHT = 50;

            function updateScrollbar() {
                if (!$scope.items) {
                    return;
                }
                var height = $scope.items.length * ITEM_HEIGHT;
                elem.style.height = height + "px";

                var parentHeight = parentElement.offsetHeight;
                var scrollTop = parentElement.scrollTop;

                var skipStart = Math.round(scrollTop / ITEM_HEIGHT);
                var skipEnd = skipStart + Math.round(parentHeight / ITEM_HEIGHT);

                // console.log(skipStart, skipEnd);
                if (skipStart >= 2) {
                    elem.style.paddingTop = (skipStart - 2) * ITEM_HEIGHT + "px";
                    elem.style.height = elem.style.offsetHeight - (skipStart - 2) * ITEM_HEIGHT + "px";
                } else {
                    elem.style.paddingTop = "";
                }
                if (skipEnd == 0) {
                    skipEnd = elem.children.length + 2;
                }
                for (var i = 0; i < elem.children.length; i++) {

                    if (i < skipStart - 2 || i > skipEnd + 2) {
                        elem.children[i].style.display = "none";

                    } else {
                        elem.children[i].style.display = "";


                    }
                }
            }
            if ($scrollbarRoot) {
                parentElement = $scrollbarRoot.getElement();
                $scope.$watch(function() {
                    if (Array.isArray($scope.items)) {
                        return $scope.items.length;
                    }

                }, function(newVal, oldVal) {
                    if (newVal != undefined && (newVal != oldVal)) {
                        updateScrollbar();
                    }
                })

                $scrollbarRoot.onScroll(function(e) {

                    updateScrollbar(e.target);

                })
                $scope.$on('window-resize', function() {
                    updateScrollbar();
                })
            }

            if ($scope.itemApi && $scope.itemApi.incomingEvent) {

                $scope.$on('search-key-down', function() {
                    if ($scope.items.length != 0) {
                        $elem[0].querySelector('.list_view_item').focus();

                        $scope.selectTrack($scope.items[0]);
                    }
                })
            }
            var selectedTrack = null;

            $scope.selectTrack = function(track, $event) {
                $elem[0].focus();
                selectedTrack = track;
                var elem = null;
                if ($event) {
                    if ($event.target.tagName === 'SPAN' || $event.target.classList.contains('eq_cont')) {
                        elem = $event.target.parentNode;
                    } else {
                        elem = $event.target;
                    }

                    effects.ripple(elem, $event.clientX, $event.clientY);
                }


                var selectedIndex = $scope.items.indexOf(selectedTrack);
                var domElement = $elem[0];

                var selectedIndexOffsetTop = selectedIndex * ITEM_HEIGHT;

                if (selectedIndexOffsetTop - domElement.parentElement.parentElement.scrollTop > domElement.parentElement.parentElement.offsetHeight - ITEM_HEIGHT) {
                    domElement.parentElement.parentElement.scrollTop = selectedIndexOffsetTop;
                }
                if (selectedIndexOffsetTop - domElement.parentElement.parentElement.scrollTop < 0) {
                    domElement.parentElement.parentElement.scrollTop = selectedIndexOffsetTop;
                }
            }
            $scope.criteriaMatch = function() {

                if ($scope.itemApi.filter) {
                    var result = $scope.itemApi.filter();                    
                    if(result) {
                        return function(item) {
                            return _.find(result, item);
                        }
                    }                    
                }

            }
            $scope.isSelected = function(track) {
                return track === selectedTrack;
            }
            $scope.playTrack = function(track) {

                library.playTrack(track);
                if (library.getQueue() != $scope.items) {
                    library.setQueue($scope.items);
                }
            }



            $scope.isPlaying = function(track) {

                return track === library.getCurrentTrack();
            }

            $elem[0].addEventListener("keydown", function(e) {
                var selectedTrackIndex = $scope.items.indexOf(selectedTrack);
                if (selectedTrackIndex === -1) {
                    selectedTrackIndex = 0;
                }
                if (e.which == 40) { //down
                    e.preventDefault();                   
                    var index = (((selectedTrackIndex + 1) % $scope.items.length) + $scope.items.length) % $scope.items.length;
                    $scope.selectTrack($scope.items[index], null);
                }
                if (e.which == 38) { //up
                    e.preventDefault();
                    var index = (((selectedTrackIndex - 1) % $scope.items.length) + $scope.items.length) % $scope.items.length;
                    $scope.selectTrack($scope.items[index], null);
                }
                if (e.which == 13 && selectedTrack) {
                    $scope.playTrack(selectedTrack);
                }


            });


            /*drag drop*/
            $elem[0].addEventListener('dragstart', function(e) {

            });

            $elem[0].addEventListener('dragover', function(e) {
                e.preventDefault();
                e.cancelBubble = true;
                e.stopPropagation();
            });

            $elem[0].addEventListener('dragend', function(e) {
                e.preventDefault();
                e.cancelBubble = true;
                e.stopPropagation();
            });
        }
    }
});

angular.module('sp-app').directive('volume', function(player, $rootScope, configFactory) {
    return {
        replace: true,
        templateUrl: 'app/controls/volume/volume.html',
        link: function($scope, $elem, $attrs) {

            $scope.toggleVolume = function() {
               
                $scope.isOpened = !$scope.isOpened;
            }
            
            var line, handler, volLabel;
            var initY;
            var volumeCnt;
            var logicalPercent = 100;
            var isSeek = false;
            var vol, volToggle;
            

            vol = $elem[0];
            line = vol.querySelector('#vol-line');
            handler = vol.querySelector('#vol-handler');
            volLabel = vol.querySelector('#vol-label');
            volumeCnt = vol.querySelector('.volume');
            volToggle = vol.querySelector('#vol-toggle');
            $rootScope.$on('global-mouse-click', function(event, obj) {
                if(obj.target != vol 
                    && obj.target != line 
                    && obj.target != handler 
                    && obj.target != volumeCnt 
                    && obj.target != volToggle) {
                    $scope.isOpened = false;
                }
            });
            handler.addEventListener('mousedown', onMouseDown);
            volumeCnt.addEventListener('mousewheel', onMouseWheel);


            volLabel.textContent = player.getVolume();
                 
                    var location = 110 * logicalPercent / 100 -100;
                    handler.style.top = Math.abs(location) + 'px';
            line.addEventListener('mousedown', function(e) {

                var y = (e.offsetY + line.offsetTop) - handler.offsetHeight / 2;

                moveHandler(y);
                onMouseDown(e);

            }, false);

            function moveHandler(top) {
                var topBound = line.offsetTop;
                var bottomBound = line.offsetTop + line.offsetHeight - handler.offsetHeight;
                if (top < topBound) top = topBound;
                if (top > bottomBound) top = bottomBound;

                var parentHeight = handler.parentElement.offsetHeight;
                var physicalPercent = 100 * top / parentHeight;
                handler.style.top = physicalPercent + '%';
                var logicalHeight = line.offsetHeight - handler.offsetHeight;
                var logicalDiff = top - line.offsetTop;
                logicalPercent = 100 - 100 * logicalDiff / logicalHeight;
                setVolume();

            }

            function onMouseWheel(e) {

                if (e.wheelDelta < 0) {
                    moveHandler(handler.offsetTop + 5);
                } else {
                    moveHandler(handler.offsetTop - 5);
                }

            }

            function onMouseDown(e) {

                isSeek = true;
                initY = e.pageY - handler.offsetTop;
                document.body.addEventListener('mousemove', onMouseMove);
                document.body.addEventListener('mouseup', onMouseUp);
                //  volLabel.style.display = 'block';
            }

            function onMouseMove(e) {

                e.preventDefault();
                var y = e.pageY;
                var top = (y - initY);

                moveHandler(top);


            }
            var debounced = _.debounce(updateConfig, 500);
            function setVolume() {
                volLabel.textContent = player.getVolume();
               	player.setVolume(logicalPercent);
                volLabel.textContent = player.getVolume();
                debounced();
                
            }
            function updateConfig() {
                
                configFactory.configuration.playback.volume = logicalPercent;
            }
            function onMouseUp(e) {
                isSeek = false;
                document.body.removeEventListener('mousemove', onMouseMove);
                document.body.removeEventListener('mouseup', onMouseUp);
                // volLabel.style.display = 'none';
            }
            $scope.$on('volume-changed', function(args,e){
                logicalPercent = configFactory.configuration.playback.volume;
                player.setVolume(logicalPercent);
                volLabel.textContent = player.getVolume();
             
                var location = 110 * logicalPercent / 100 -100;
                handler.style.top = Math.abs(location) + 'px';
            })

        }
    }
});

angular.module('sp-app').directive('dragDrop', function(player, localStorage, Directory, File, fileSystem) {
    return {
        link: function($scope, $elem, $attr) {
                
            var dropZone = content.querySelector('.drop_zone')
            content.addEventListener("dragover", function(e) {
                e.preventDefault();
                if (!content.classList.contains('drag-mode')) {
                    content.classList.add('drag-mode');
                }

            });
            dropZone.addEventListener('dragleave', function() {
                content.classList.remove('drag-mode');
            });
            dropZone.addEventListener('mouseout', function() {
                content.classList.remove('drag-mode');
            });
            dropZone.addEventListener("drop", function(e) {
                e.preventDefault();
                content.classList.remove('drag-mode');
                var files = e.dataTransfer.items;
                fileSystem.processTransferedData(e.dataTransfer).then(function(item) {
                    localStorage.addTemporary(item);
                });
                // for (var i = 0; i < files.length; i++) {
                //     var item = files[i];
                //     var entry = item.webkitGetAsEntry();
                 
                //     if (entry.isDirectory) {
                        
                //         var dir = new Directory(entry);
                //         // dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(selectedDirectory);
                //         // dir.physicalPath = dir.metadata.name;
                //         localStorage.addTemporary(dir);
                //     } else {
                //         entry.getExtension = function() {
                //             return entry.fullPath.split('.').pop();
                //         };
                //         var file = new File(entry);
                //         localStorage.addTemporary(file);
                //     }
                // }
            })

        }
    }
})

;angular.module('sp-app').directive('scrollbarRoot', function() {
    return {
        scope: true, 
        link: function($scope, $elem, $attr) {
            var elem = $elem[0];

            elem.addEventListener('scroll', onScroll);

            function onScroll(e) {
               if($scope.handler) {
                    $scope.handler(e);
               }
            }

            $scope.$on('$destroy', function() {
                elem.removeEventListener('scroll', onScroll);
            })
            $scope.getElement = function() {
                return elem;
            }
        },
        controller: function($scope) {
            var self = this;
            self.onScroll = function(callback){
                
                $scope.handler = callback;
            }
            self.getElement = function() {
                return $scope.getElement();
            }

        },
        controllerAs: "scrollbarRoot"
    }
})

;angular.module('sp-app').directive('spRightClick', function($parse) {
    var menu;
    return function($scope, $elem, $attrs) {
        var elem = $elem[0];
        elem.addEventListener('contextmenu', function(event){
            var fn = $parse($attrs.spRightClick);
            if(fn) {
                 fn($scope, {$event: event});
            }
           
            event.preventDefault();
        });
    }
})
;angular.module('sp-app').directive('spStick', function($parse) {
    var menu;
    return function($scope, $elem, $attrs) {
        var elem = $elem[0];
        elem.addEventListener('scroll', function(event) {

            if (elem.scrollTop == 0 && elem.parentElement.classList.contains('stick')) {
                elem.parentElement.classList.remove('stick');
            } else if (!elem.parentElement.classList.contains('stick')) {
                elem.parentElement.classList.add('stick');
            }

        });
    }
})

;angular.module('sp-app').factory('Album', function() {
    function Album(name) {
        this.name = name;
        this.tracks = [];
        this.albumArtPath = "";
    }
    Album.prototype.addTrack = function(track) {
    	track.album  = this;
    	this.tracks.push(track);
    }
    Album.prototype.removeTrack = function(track) {
    	track.album = null;
    	_.remove(this.tracks, track);
    }
    return Album;
});

angular.module('sp-app').factory('Artist', function(fileSystem) {
    function Artist(name) {
        this.name = name;
        this.albums = [];

    }
    Artist.prototype.addAlbum = function(album) {
    	album.artist = this;
    	this.albums.push(album);
    }
    Artist.prototype.removeAlbum = function(album) {
    	album.artist = null;
    	fileSystem.removeURL(album.albumArthPath);
    	_.remove(this.albums, album);
    }    
    return Artist;
});
angular.module('sp-app').factory('Cloud', function() {
    function Cloud(name) {
        this.name = name;
        this.tracks = [];
        this.user = "";
    }
    Cloud.prototype.addTrack = function(track) {
    	track.cloud  = this;
    	this.tracks.push(track);
    }
    Cloud.prototype.removeTrack = function(track) {
    	track.cloud = null;
    	_.remove(this.tracks, track);
    }
    return Cloud;
});
angular.module('sp-app').factory('Directory', function(Entry) {
    function Directory(rawData) {
        Entry.call(this, rawData);
        this.entries = [];        
        this.metadata = undefined;
        this.addEntry = function(entry) {
            entry.parent = this;
            this.entries.push(entry);
        }
        this.physicalPath = null;

    }
    Directory.prototype = new Entry();

    return Directory;
})

;angular.module('sp-app').factory('Entry', function () {
    function Entry(rawData) {
      
        this.rawData = rawData;
        this.relativePath = "";
		this.physicalPath = "";
        this.parent = null;        
        
    }
    Entry.prototype.getRawData = function(){
        return this.rawData;
    }
    return Entry;
})
;angular.module('sp-app').factory('File', function (Entry) {
    function File(rawData) {
		Entry.call(this, rawData);
		if(rawData && rawData.getExtension) {
			this.extension =  rawData.getExtension();
		}
		var _physicalPath = ""
        if(typeof(rawData) == 'string') {
            this.name = rawData
        } else {
		this.name = rawData && rawData.name;
        }
		this.file = undefined;
		this.physicalPath = "";
        this.local = false;
        

    }
	File.prototype = new Entry();
    return File;
})
;angular.module('sp-app').factory('Playlist', function(uidService) {
    function Playlist(name) {
        this.id = name;
        this.name = name;
        this.tracks = [];
        this.dataMapping = {};

    }
    Playlist.prototype.addTrack = function(track) {
        // track.playlist = this;
        this.tracks.push(track);
    }
    Playlist.prototype.removeTrack = function(track) {
        // track.playlist = null;
        _.remove(this.tracks, track);
    }
    return Playlist;
});

angular.module('sp-app').factory('Track', function() {
    function Track(file) {
        var uid = "";
        this.title = file.name;
        this.file = file;
        this.duration = undefined;
        this.album = undefined;
        this.src = undefined;
        this.metadata = undefined;
        this.playlist = undefined;
        this.cloud = undefined;
        this.number = undefined;
        var slef = this;
        Object.defineProperty(this, 'id', {
            get: function() {
                if (slef.file.local) {
                    return slef.file.physicalPath;
                } else {
                    return this.file.id;
                }
            }

        })

    }
    return Track;
});

angular.module('sp-app').factory('chromeFileSystem', function($q, Directory, File, Entry) {
    var watchedDirectories = [];
    if (window.chrome && window.chrome.mediaGalleries) {
        chrome.mediaGalleries.onGalleryChanged.addListener(function(details) {

            if (details.type == "contents_changed") {
                var changedDirectory = _.find(watchedDirectories, function(wd) {
                    return wd.directory.metadata.galleryId == details.galleryId;
                })
                if (changedDirectory.callback) {
                    changedDirectory.callback(changedDirectory.directory);
                }
            }
        })
    }
    return {
        // chooseLocation: function() {
        //     return $q(function(reslove, reject) {
        //         chrome.fileSystem.chooseEntry({
        //             type: "openDirectory"
        //         }, function(entry) {
        //             if (chrome.runtime.lastError) {
        //                 reject(chrome.runtime.lastError.message);
        //             }
        //             if (entry != undefined) {

        //                 chrome.fileSystem.getDisplayPath(entry, function(fullPath) {
        //                     var dir = new Directory(entry);
        //                     dir.physicalPath = fullPath;
        //                     reslove(dir);
        //                 })

        //             } else {
        //                 reject("Entry is empty")
        //             }
        //         })
        //     });

        // },
        chooseLocation: function() {
            return $q(function(resolve, reject) {
                chrome.mediaGalleries.addUserSelectedFolder(function(mediaFileSystems, selectedFileSystemName) {

                    if (selectedFileSystemName) {
                        var selectedDirectory = _.find(mediaFileSystems, function(mfs) {
                            return mfs.name == selectedFileSystemName;
                        })

                        var dir = new Directory(selectedDirectory.root);
                        dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(selectedDirectory);
                        dir.physicalPath = dir.metadata.name;
                        resolve(dir);
                    }
                });
            })
        },
        addFolderWatch: function(directory, callback) {
            return $q(function(resolve, reject) {

                chrome.mediaGalleries.addGalleryWatch(directory.metadata.galleryId, function(result) {
                    if (result.success) {
                        watchedDirectories.push({
                            directory: directory,
                            callback: callback
                        });
                        resolve(result);
                    } else {
                        reject(result);
                    }
                });
            })
        },
        removeFolderWatch: function(directory) {
            var directoryToDelete = _.find(watchedDirectories, function(dir) {
                return dir.directory == directory;
            });
            _.remove(watchedDirectories, function(dir) {
                return dir.directory == directory;
            })
            if (directoryToDelete) {
                chrome.mediaGalleries.removeGalleryWatch(directoryToDelete.directory.metadata.galleryId);
                // chrome.mediaGalleries.dropPermissionForMediaFileSystem(directoryToDelete.directory.metadata.galleryId);

            } else {
                chrome.mediaGalleries.removeGalleryWatch(directory.metadata.galleryId);
                // chrome.mediaGalleries.dropPermissionForMediaFileSystem(directory.metadata.galleryId);

            }


        },

        autoDetect: function(interactive) {
            return $q(function(resolve, reject) {
                chrome.mediaGalleries.getMediaFileSystems({
                    interactive: interactive
                }, function(mediaFileSystems) {
                    var directories = mediaFileSystems.map(function(mfs) {
                        var dir = new Directory(mfs.root);
                        dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(mfs);
                        dir.physicalPath = dir.metadata.name;
                        return dir;
                    });
                    resolve(directories);

                })
            });
        },
        getEntries: function(directory) {
            var allEntries = [];
            var deferred = $q.defer();
            var dirReader = directory.rawData.createReader();

            function readEntries() {
                dirReader.readEntries(function(result) {
                    if (result.length) {
                        var entries = result.map(function(item) {
                            if (item.isDirectory) {
                                return new Directory(item);
                            } else if (item.isFile) {
                                /////////////////////////



                                item.getExtension = function() {
                                    return item.fullPath.split('.').pop();
                                };
                                return new File(item);
                            } else {
                                return new Entry(item);
                            }

                        });
                        allEntries = allEntries.concat(entries);
                        readEntries();
                    } else {
                        deferred.resolve(allEntries);
                    }

                }, function(error) {
                    if (error.name === "NotFoundError") {
                        deferred.reject({ type: error.name });
                    } else {
                        defered.reject({ type: "UnknownError" });
                    }

                });
            }
            readEntries();
            return deferred.promise;
        },
        errors: {
            not_found: "NotFoundError",
            unknown: "UnknownError"
        },
        getDisplayPath: function(directory) {

            return $q(function(resolve, reject) {
               
                chrome.fileSystem.getDisplayPath(directory.rawData, function(fullPath) {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError)
                    }
                    
                });
            })

        },
        getRootDirectory: function() {
            return $q(function(resolve, reject) {
                chrome.runtime.getPackageDirectoryEntry(function(dirEntry) {
                    var rootDir = new Directory(dirEntry);
                    resolve(rootDir);
                })
            })
        },
        getFile: function(rootDirecotry) {
            return $q(function(resolve, reject) {
                rootDirecotry.rawData.getFile('log.txt', { create: false }, function(fileEntry) {
                    resolve(fileEntry);
                }, function(error) {
                    reject(error.message);
                })
            })
        },
        obtainURL: function(file) {
            if(file instanceof File) {
                return URL.createObjectURL(file.file);
            } else {
                return URL.createObjectURL(file);
            }
        },
        removeURL: function(itemSrc) {
            URL.revokeObjectURL(itemSrc);
        },
        obtainFiles: function(musicFiles) {
            var deffered = $q.defer();
            var indicator = 0;
            var musicLength = musicFiles.length;
            var faildFiles = [];
            for (var i = 0; i < musicFiles.length; i++) {
                musicFiles[i].local = true;
                musicFiles[i].rawData.file(function(x) {
                    return function(file) {                      
                        musicFiles[x].file = file;
                        if (x == musicLength - 1) {
                            faildFiles.forEach(function(f){
                                _.remove(musicFiles, f);
                            })
                            deffered.resolve(musicFiles);

                        }
                    }

                }(i), 
                function(y) {
                    return function(err) {
                        if(err) {
                            faildFiles.push(musicFiles[y]);
                            if (y == musicLength - 1) {
                                faildFiles.forEach(function(f){
                                    _.remove(musicFiles, f);
                                })
                                deffered.resolve(musicFiles);
                            }
                            
                        }
                    }
                }(i));
            }
            return deffered.promise;
        },
        processTransferedData: function(dataTransfer) {
            var files = dataTransfer.items;
            var deferred = $q.defer();
            
            for (var i = 0; i < files.length; i++) {
                var item = files[i];
                var entry = item.webkitGetAsEntry();
             
                if (entry.isDirectory) {
                    
                    var dir = new Directory(entry);
                    // dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(selectedDirectory);
                    // dir.physicalPath = dir.metadata.name;
                    deferred.resolve(dir);
                    // localStorage.addTemporary(dir);
                } else {
                    entry.getExtension = function() {
                        return entry.fullPath.split('.').pop();
                    };
                    var file = new File(entry);
                    deferred.resolve(file);
                    // localStorage.addTemporary(file);
                }
            }
            return deferred.promise;
        },
        getEntriesRecursively: function(directory) {

            var self = this;
            var indicator = 0;
            var deferred = $q.defer();
            var fileList = []

            function recursiveProcess(dir) {
                indicator++;

                self.getEntries(dir).then(function(entries) {

                    indicator--;
                    for (var i = 0; i < entries.length; i++) {
                        if (entries[i] instanceof Directory) {

                            recursiveProcess(entries[i]);
                            // dir.addEntry(entries[i]);
                        }
                        if (entries[i] instanceof File) {
                            // dir.addEntry(entries[i]);
                            fileList.push(entries[i]);
                        }
                    }
                    if (indicator == 0) {
                        deferred.resolve({
                            directory: directory,
                            fileList: fileList
                        });
                    }

                }, function(error) {
                    deferred.reject(error);
                });

            }
            recursiveProcess(directory);
            return deferred.promise;



        }
    }

});

angular.module("sp-app").factory("chromeStorage", function ($q) {
    return {
        set: function (key, obj) {
            var o = {};
            o[key] = obj;
            chrome.storage.local.set(o);
        },
        get: function (key) {
            return $q(function (resolve, reject) {
                chrome.storage.local.get(key, function (obj) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else {
                        resolve(obj[key]); 
                    }
                });
            });
        },
        remove: function(key) {
            return $q(function(resolve, reject){
                chrome.storage.local.remove(key, function(){
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else {
                        resolve(); 
                    }
                })
            })
        }
        
    };
});
angular.module('sp-app').factory('chromeWindowManager', function() {
    return {
        createWindow: function(url, options) {
            options.frame = 'none';
           
            chrome.app.window.create(url, options);

        }
    }
})

;angular.module('sp-app').factory('configFactory', function(player, $q, storage) {
    // settings defaults
    var configObj = {
        settings: {
            autoPlay: false,
            showAlbumArt: true,
            alwaysTop: false,
            theme: "primary.css"

        },
        playback: {
            repeat: player.repeatModes.repeatAll,
            shuffle: false,
            volume: 50
        }

    }

    var retObj =  {
        loadConfiguration: function() {
            var deferred = $q.defer();
            storage.get("config").then(function(config) {
                
                _.merge(configObj, config);
              
                deferred.resolve();


            });            
            return deferred.promise;
        },
        saveConfiguration: function() {
            storage.set('config', configObj);
        },
        configuration: configObj    
    };

    return retObj;

})

;angular.module('sp-app').factory('DbContext', function($q) {





    function DbContext(dbName, objectStoreNames) {
        this.dbName = dbName;

        this.objectStoreNames = [];
        this.db = null;
        this.version = 5;

        if (objectStoreNames) {
            objectStoreNames.forEach(function(objectStoreName) {

                this.objectStoreNames.push(objectStoreName);
            }.bind(this))
        }

    }

    DbContext.prototype.openDatabase = function() {
        var self = this;
        var deferred = $q.defer();
        if (!self.db) {

            var request = indexedDB.open(this.dbName, this.version);

            
                request.onerror = function(event) {
                    console.log("error: ");
                    deferred.reject("error: ");
                };

                request.onsuccess = function(event) {
                    self.db = request.result;                    
                    deferred.resolve();

                };
                request.onupgradeneeded = function(event) {
                    self.db = event.target.result;
                   console.log(self.db);
                    
                    self.objectStoreNames.forEach(function(objectStoreName) {
                        if(!self.db.objectStoreNames.contains(objectStoreName)) {
                            var objectStore = self.db.createObjectStore(objectStoreName, { keyPath: "id" });
                        }
                    })

                    // console.log('hello')
                    // for (var i in employeeData) {
                    //     objectStore.add(employeeData[i]);
                    // }
                }
           
        } else {
            deferred.resolve();
        }
        return deferred.promise;

    }
    DbContext.prototype.addEntry = function(objectStoreName, entry) {

        var request = this.db.transaction([objectStoreName], "readwrite")
            .objectStore(objectStoreName)
            .add(entry);
        return $q(function(resolve, reject) {
            request.onsuccess = function(event) {
               
                resolve(event);
            };

            request.onerror = function(event) {
                reject("Unable to add data\r\nKenny is aready exist in your database! ");
            }
        })


    }
    DbContext.prototype.updateEntry = function(objectStoreName, entry) {

        var request = this.db.transaction([objectStoreName], "readwrite")
            .objectStore(objectStoreName)
            .put(entry);
        return $q(function(resolve, reject) {
            request.onsuccess = function(event) {
               
                resolve(event);
            };

            request.onerror = function(event) {
                reject("Unable to add data\r\nKenny is aready exist in your database! ");
            }
        })


    }
    DbContext.prototype.removeEntry = function(objectStoreName, entryId) {
        var request = this.db.transaction([objectStoreName], "readwrite")
            .objectStore(objectStoreName)
            .delete(entryId);
        return $q(function(resolve, reject) {
            request.onsuccess = function(event) {
                
                resolve(event);
            };

            request.onerror = function(event) {
                reject("Unable to add data\r\nKenny is aready exist in your database! ");
            }
        });
    };
    DbContext.prototype.getEntry = function(objectStoreName, entryId) {
        var self = this;
        var deferred = $q.defer();
        var transaction = this.db.transaction([objectStoreName]);
        var objectStore = transaction.objectStore(objectStoreName);
        var request = objectStore.get(entryId);

        request.onerror = function(event) {
           console.log("Unable to retrieve daa from database!");
           deferred.reject();
        };

        request.onsuccess = function(event) {
            // Do something with the request.result!
            if (request.result) {

                deferred.resolve(request.result);
            } else {
                console.log("Entity could not be found!");
                deferred.resolve();
            }
        };
        return deferred.promise;
    };
    DbContext.prototype.getAllEntries = function(objectStoreName) {

        var objectStore = this.db.transaction(objectStoreName).objectStore(objectStoreName);
        var entries = [];
        var deferred = $q.defer();
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;

            if (cursor) {
               
                    entries.push(cursor.value);
               
                cursor.continue();
            } else {
                deferred.resolve(entries);
            }
        };
        return deferred.promise; 
    }
    DbContext.prototype.clear = function(objectStoreName) {
        var request = this.db.transaction([objectStoreName], "readwrite")
            .objectStore(objectStoreName)
            .clear();
        return $q(function(resolve, reject) {
            request.onsuccess = function(event) {
                
                resolve(event);
            };

            request.onerror = function(event) {
                reject("Unable to add data\r\nKenny is aready exist in your database! ");
            }
        });
    }
    const DB_NAME = "SalmonDB";
    const TRACKS_TABLE = "tracks";
    const PLAYLISTS_TABLE = "playlists";
   
    var dbContext = new DbContext(DB_NAME, [TRACKS_TABLE, PLAYLISTS_TABLE])
    return {
        getDbContext: function() {
            return dbContext;
        } 
    };

})

;angular.module('sp-app').factory('playlistsRepository', function($q, DbContext) {

    const DB_NAME = "SalmonDB";
    const PLAYLISTS_TABLE = "playlists";
    
    var salmonDbContext = null;
    return {
        openConnection: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    resolve();
                }, function() {
                    reject();
                })
            });
        },
        addPlaylist: function(playlist) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.addEntry(PLAYLISTS_TABLE, playlist).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        updatePlaylist: function(playlist) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.updateEntry(PLAYLISTS_TABLE, playlist).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getPlaylist: function(playlist) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    var id = playlist.name;
                    salmonDbContext.getEntry(PLAYLISTS_TABLE, id).then(function(result) {
                        resolve({ playlistRecord: result, playlist: playlist });
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        removePlaylist: function(playlist) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.removeEntry(PLAYLISTS_TABLE, playlist.name).then(function() {
                        resolve();
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getAllPlaylists: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.getAllEntries(PLAYLISTS_TABLE).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        }
    }
})

;angular.module('sp-app').factory('queueRepository', function($q, DbContext) {

    const DB_NAME = "SalmonDB";
    const QUEUE_TABLE = "queue";
    
    var salmonDbContext = null;
    return {
        openConnection: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    resolve();
                }, function() {
                    reject();
                })
            });
        },
        addQueue: function(queue) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.addEntry(QUEUE_TABLE, queue).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        updateQueue: function(queue) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.updateEntry(QUEUE_TABLE, queue).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getQueue: function(queue) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    var id = queue.id;
                    salmonDbContext.getEntry(QUEUE_TABLE, id).then(function(result) {
                        resolve({ queueRecord: result, queue: queue });
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        removeQueue: function(queue) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.removeEntry(QUEUE_TABLE, queue.name).then(function() {
                        resolve();
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getAllQueues: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.getAllEntries(QUEUE_TABLE).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        removeAllQueues: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.clear(QUEUE_TABLE).then(function(result) {
                        resolve();
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        }
    }
})

;angular.module('sp-app').factory('tracksRepository', function($q, DbContext) {

    const DB_NAME = "SalmonDB";
    const TRACKS_TABLE = "tracks";

    var salmonDbContext = null;
    return {
        openConnection: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {

                salmonDbContext.openDatabase().then(function() {
                    resolve();
                }, function() {
                    reject();
                })
            });
        },
        addTrack: function(track) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.addEntry(TRACKS_TABLE, track).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        updateTrack: function(track) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.updateEntry(TRACKS_TABLE, track).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getTrack: function(trackId, track, metadata) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.getEntry(TRACKS_TABLE, trackId).then(function(result) {
                        resolve({ trackRecord: result, track: track, metadata: metadata });
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        removeTrack: function(track) {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.removeEntry(TRACKS_TABLE, track.id).then(function() {
                        resolve();
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getAllTracks: function() {
            salmonDbContext = DbContext.getDbContext();
            return $q(function(resolve, reject) {
                salmonDbContext.openDatabase().then(function() {
                    salmonDbContext.getAllEntries(TRACKS_TABLE).then(function(result) {
                        resolve(result);
                    }, function(e) {
                        console.log(e);
                    });
                })
            });
        },
        getMetadata: function(musicStorage, track) {
            var self = this;
            var deferred = $q.defer();
            salmonDbContext = DbContext.getDbContext();
            
            self.getTrack(track.id, track).then(function(result) {
                if (result.trackRecord && result.trackRecord.metadata && !result.trackRecord.metadata.cloud) {
                   
                        deferred.resolve(result.trackRecord);
                   
                 } else {
                    musicStorage.getMetadata(track).then(function(metadata) {
                        deferred.resolve({metadata: metadata});
                    })
                 }
            })

            return deferred.promise;

        }
    }
})

;angular.module('sp-app').factory('desktopFileSystem', function($q, Directory, File, Entry) {

    var watchedDirectories = [];
    

    return {

        chooseLocation: function() {
            const dialog  = require('electron').remote.dialog;

            return $q(function(resolve, reject) {

                dialog.showOpenDialog({ properties: ['openDirectory'] }, function(result) {
                        if (result && result.length != 0) {
                            var dir = new Directory();
                            dir.physicalPath = result[0];
                            resolve(dir);
                        }
                    })
                    // chrome.mediaGalleries.addUserSelectedFolder(function(mediaFileSystems, selectedFileSystemName) {

                //     if (selectedFileSystemName) {
                //         var selectedDirectory = _.find(mediaFileSystems, function(mfs) {
                //             return mfs.name == selectedFileSystemName;
                //         })

                //         var dir = new Directory(selectedDirectory.root);
                //         dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(selectedDirectory);
                //         dir.physicalPath = dir.metadata.name;
                //         resolve(dir);
                //     }
                // });
            })
        },
        addFolderWatch: function(directory, callback) {
            var fs = require('fs');
            var debounced = _.debounce(callback, 500);
            return $q(function(resolve, reject) {
              
                var w = fs.watch(directory.physicalPath, { encoding: 'string'}, (event, filename) => {
                        if (filename) {
                            // debugger;
                            debounced(directory);
                        }
                    });
                watchedDirectories.push({
                    watcher: w,
                    directory:directory
                })
              
            })
        },
        removeFolderWatch: function(directory) {
            var directoryToDelete = _.find(watchedDirectories, function(dir) {
                return dir.directory == directory;
            });
            _.remove(watchedDirectories, function(dir) {
                return dir.directory == directory;
            })
            if (directoryToDelete) {
                directoryToDelete.watcher.close();              

            }


        },

        autoDetect: function(interactive) {
            var folders = ["music"];
            return $q(function(resolve, reject) {
                var app =  require('electron').remote.app;
                var folderPaths = [];
                folders.forEach(function(folder){
                   folderPaths.push(app.getPath(folder));
                });
                var directories = folderPaths.map(function(mfs){
                    var dir = new Directory();
                    dir.physicalPath = mfs;
                    return dir;
                });
                console.log(directories);
                resolve(directories);             
            });
        },
        getEntries: function(directory) {
            var allEntries = [];
            var deferred = $q.defer();
            var fs = require('fs');



            fs.readdir(directory.physicalPath, function(error, result) {
                if (result) {
                    var entries = result.map(function(item) {
                        var itemPath = directory.physicalPath + '\\' +item;
                        var stats = fs.statSync(itemPath);                        
                        if (stats.isDirectory()) {
                            var dir = new Directory();
                            dir.physicalPath = itemPath;
                            return dir;
                        } else if (stats.isFile()) {
                            
                            var file = new File(item);
                            file.physicalPath = itemPath;
                            file.extension = itemPath.split('.').pop();
                            
                            return file;
                        }
                        
                        
                   
                    });
                    allEntries = allEntries.concat(entries);
                    deferred.resolve(allEntries);
                }
            });
            
            return deferred.promise;
        },
        errors: {
            not_found: "NotFoundError",
            unknown: "UnknownError"
        },
        getDisplayPath: function(directory) {

             return $q(function(resolve, reject) {               
                resolve(directory.physicalPath);
            })

        },
        getRootDirectory: function() {
            return $q(function(resolve, reject) {
                chrome.runtime.getPackageDirectoryEntry(function(dirEntry) {
                    var rootDir = new Directory(dirEntry);
                    resolve(rootDir);
                })
            })
        },
        pathExists: function(path) {           
            var fs = require('fs');
            return fs.existsSync(path);
        },
        obtainURL: function(item) {
            if(item instanceof File) {
                return item.physicalPath;
            }
            else  {
                var blob = new Blob([item.data], {'type': 'image/'+item.format});
                return URL.createObjectURL(blob);
            }
        },
        removeURL: function(itemSrc) {
            URL.revokeObjectURL(itemSrc);
        },
        obtainFiles: function(musicFiles) {
            var deffered = $q.defer();           
            for (var i = 0; i < musicFiles.length; i++) {
                musicFiles[i].local = true;
                // musicFiles[i].rawData.file(function(x) {
                //     return function(file) {

                //         musicFiles[x].file = file;
                //         if (x == musicFiles.length - 1) {
                //             deffered.resolve(musicFiles);
                //         }
                //     }

                // }(i));
            }
            deffered.resolve(musicFiles);
            return deffered.promise;
        },
        processTransferedData: function(dataTransfer) {
            var files = dataTransfer.files;
            var deferred = $q.defer();
            var fs = require('fs');

            for (var i = 0; i < files.length; i++) {
                var item = files[i];
                var stats = fs.statSync(item.path);
             
                if (stats.isDirectory()) {
                    
                    var dir = new Directory();
                    dir.physicalPath = item.path;
                    // dir.metadata = chrome.mediaGalleries.getMediaFileSystemMetadata(selectedDirectory);
                    // dir.physicalPath = dir.metadata.name;
                    deferred.resolve(dir);
                    // localStorage.addTemporary(dir);
                } else {                 
                    
                    var file = new File(item.name);
                    file.physicalPath = item.path;
                    file.extension = item.path.split('.').pop();
                    deferred.resolve(file);
                    // localStorage.addTemporary(file);
                }
            }
            return deferred.promise;
        },
        getEntriesRecursively: function(directory) {

            var self = this;
            var indicator = 0;
            var deferred = $q.defer();
            var fileList = []

            function recursiveProcess(dir) {
                indicator++;

                self.getEntries(dir).then(function(entries) {

                    indicator--;
                    for (var i = 0; i < entries.length; i++) {
                        if (entries[i] instanceof Directory) {

                            recursiveProcess(entries[i]);
                            // dir.addEntry(entries[i]);
                        }
                        if (entries[i] instanceof File) {
                            // dir.addEntry(entries[i]);
                            fileList.push(entries[i]);
                        }
                    }
                    if (indicator == 0) {
                        deferred.resolve({
                            directory: directory,
                            fileList: fileList
                        });
                    }

                }, function(error) {
                    deferred.reject(error);
                });

            }
            recursiveProcess(directory);
            return deferred.promise;



        }
    }

});

angular.module('sp-app').factory('desktopWindowManager', function () {
    return {
        createWindow: function (url, options) {

            options.frame = true;
            options.show = false;

            // Or in the renderer process.
            const BrowserWindow = require('electron').remote.BrowserWindow

            var win = new BrowserWindow(options);
            // win.openDevTools();
            win.on('closed', () => {                
                win = null;
            });
           
            win.loadURL(`file://${__dirname}/${url}`);
            win.show();
            
        }
    }
})

;angular.module('sp-app').provider('dialog', function() {
    var _defaults = {
        tempalte: "",
        title: "Title",
        alignPosition: 'bottom'
    }
    this.$get = function($window, $sce, $compile, $rootScope, $q, $templateCache, $http, $timeout) {
        function Dialog(options) {
            var me = this;

            for (var option in _defaults) {
                if (!options[option]) {
                    options[option] = _defaults[option];
                }
            }


            var fetchPromises = {};
            var wrapperElem = undefined;
            var deferred = undefined;

            function fetchTemplate(template) {
                if (fetchPromises[template]) {
                    return fetchPromises[template];
                }
                return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
                    .then(function(res) {
                        if (angular.isObject(res)) {
                            $templateCache.put(template, res.data);
                            return res.data;
                        }
                        return res;
                    }));
            }

            function closeDialog(event) {


                if (wrapperElem) {
                    wrapperElem.parentNode.removeChild(wrapperElem);
                    wrapperElem = null;
                    document.body.removeEventListener("click", closeDialog);
                    document.body.removeEventListener("contextmenu", closeDialog);
                    if (deferred) {
                        $timeout.cancel(deferred);
                        deferred = undefined;
                    }
                    me.scope.$destroy();
                }
            }

            function closeDialogBackground(event) {
                if (event.target != event.currentTarget) {
                    return;
                }
                closeDialog();
            }
            this.open = function() {
                scope = options.scope || $rootScope.$new();
                this.scope = scope;
                var $promise = fetchTemplate(options.template);
                //scope.trustedHtml = $sce.trustAsHtml(scope.src);
                wrapperElem = document.createElement('div');
                wrapperElem.style.position = 'absolute';
                wrapperElem.style.zIndex = options.zIndex;
                if (options.backDrop) {
                    wrapperElem.classList.add('player_modal_wrapper');
                }
                if (options.wrapperClass) {
                    wrapperElem.classList.add(options.wrapperClass);
                }
                document.body.appendChild(wrapperElem)


                scope.closeDialog = function() {
                    closeDialog();
                }

                $promise.then(function(template) {
                    if (angular.isObject(template)) {
                        template = template.data;
                    }
                    template = String.prototype.trim.apply(template);

                    wrapperElem.innerHTML = template;

                    popupElementLinker = $compile(wrapperElem);
                    popupElementLinker(scope);
                    deferred = $timeout(function() {
                        var wrapperPos = wrapperElem.getBoundingClientRect();
                        if (options.alignElement) {

                            var alignElemPos = options.alignElement.getBoundingClientRect();

                            switch (options.alignPosition) {
                                case 'bottom':
                                    options.y = alignElemPos.bottom;
                                    options.x = alignElemPos.left + alignElemPos.width / 2 - wrapperPos.width / 2;
                                    break;
                                case 'top':
                                    options.y = alignElemPos.top - wrapperPos.height;
                                    options.x = alignElemPos.left + alignElemPos.width / 2 - wrapperPos.width / 2;
                                    break;
                                case 'left':
                                    options.y = alignElemPos.top + alignElemPos.height / 2 - wrapperPos.height / 2;
                                    options.x = alignElemPos.left - wrapperPos.width;
                                    break;
                                case 'right':
                                    options.y = alignElemPos.top + alignElemPos.height / 2 - wrapperPos.height / 2;
                                    options.x = alignElemPos.right + wrapperPos.width;
                                    break;
                            }
                            $timeout.cancel(deferred);
                        }
                        var controlWidth = wrapperPos.width || wrapperElem.children[0].offsetWidth;
                        var controlHeight = wrapperPos.height || wrapperElem.children[0].offsetHeight;
                        if (options.y + controlHeight > document.body.offsetHeight) {
                            options.y = options.y - (options.y + controlHeight - document.body.offsetHeight);
                        }
                        if (options.x + controlWidth > document.body.offsetWidth) {
                            options.x = options.x - (options.x + controlWidth - document.body.offsetWidth);
                        }
                        if (options.x < 0) {
                            options.x = 0;
                        }
                        wrapperElem.style.left = options.x + "px" || "";
                        wrapperElem.style.top = options.y + "px" || "";
                    })

                    if (options.autoClose) {

                        document.body.addEventListener("contextmenu", closeDialog);
                        document.body.addEventListener("click", closeDialog);

                    }


                });



            }
            this.destroy = function() {

                scope.closeDialog();
            }
        }

        function createDialogObject(config) {
            var dialog = new Dialog(config);

            return dialog;
        }

        return createDialogObject;
    };
})

;angular.module('sp-app').factory('dialogManager', function(dialog, $timeout) {
    dialogs = []
    return {
        openDialog: function(config) {
            config.zIndex = config.zIndex || dialog.length+100;
            dialogElem = dialog(config);
            dialogElem.open();
            dialogs.push(dialogElem);

            var onClose = config.onClose;
            config.onClose = function() {

                if (onClose) {
                    $timeout(function() {
                        onClose.apply(this, arguments);
                    });
                }
                dialogs.splice(dialogs.indexOf(dialogElem), 1);
            }
            return dialogElem;
        },
        getDialogs: function() {
            return dialogs;
        },
        closeDialog: function() {
            if(dialogs[dialogs.length - 1]) {
                dialogs[dialogs.length - 1].destroy();
            }
        }
    }
})
;// angular.module('sp-app').factory('dimensionService', function() {    
//     var innerBounds = undefined;
//     var outterBounds = undefined;
//     // chrome.app.window.current().onBoundsChanged.addListener(onWindowResize);
//     // function onWindowResize(e) {
//     //     bounds = chrome.app.window.current().innerBounds;
//     //     outterBounds = chrome.app.window.current().innerOutter;
//     // }
//     // return {
//     //     getWindowInnerBounds: function() {
//     //         return innerBounds;
//     //     },
//     //     getWindowOutterBounds: function() {
//     //         return outterBounds;
//     //     },
//     //     getWindowBounds: function() {
//     //         return innerBounds;
//     //     }
//     // }
// })
;angular.module("sp-app").provider("fileSystem", function () {
    

    this.$get = function (platform, chromeFileSystem, html5FileSystem, desktopFileSystem) {

        if(platform.getType() == platform.types.chrome) {
            return chromeFileSystem;
        } else if(platform.getType() == platform.types.desktop) {
            return desktopFileSystem;
        } else if(platform.getType() == platform.types.web) {
            return html5FileSystem;
        }    
           
    
    }
})
;angular.module('sp-app').factory('guid', function(player, $q, storage) {
    return {
        generate: function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
    }
})

;angular.module('sp-app').factory('html5FileSystem', function($q, Directory, File, Entry) {
   
    return {
        // chooseLocation: function() {
        //     return $q(function(reslove, reject) {
        //         chrome.fileSystem.chooseEntry({
        //             type: "openDirectory"
        //         }, function(entry) {
        //             if (chrome.runtime.lastError) {
        //                 reject(chrome.runtime.lastError.message);
        //             }
        //             if (entry != undefined) {

        //                 chrome.fileSystem.getDisplayPath(entry, function(fullPath) {
        //                     var dir = new Directory(entry);
        //                     dir.physicalPath = fullPath;
        //                     reslove(dir);
        //                 })

        //             } else {
        //                 reject("Entry is empty")
        //             }
        //         })
        //     });

        // },
        chooseLocation: function() {
            return $q(function(resolve, reject) {
                resolve();
            })
        },

        getEntries: function(directory) {
            var allEntries = [];
            var deferred = $q.defer();
            var dirReader = directory.rawData.createReader();

            function readEntries() {
                dirReader.readEntries(function(result) {
                    if (result.length) {
                        var entries = result.map(function(item) {
                            if (item.isDirectory) {
                                return new Directory(item);
                            } else if (item.isFile) {
                                /////////////////////////



                                item.getExtension = function() {
                                    return item.fullPath.split('.').pop();
                                };
                                return new File(item);
                            } else {
                                return new Entry(item);
                            }

                        });
                        allEntries = allEntries.concat(entries);
                        readEntries();
                    } else {
                        deferred.resolve(allEntries);
                    }

                }, function(error) {
                    if (error.name === "NotFoundError") {
                        deferred.reject({ type: error.name });
                    } else {
                        defered.reject({ type: "UnknownError" });
                    }

                });
            }
            readEntries();
            return deferred.promise;
        },
        errors: {
            not_found: "NotFoundError",
            unknown: "UnknownError"
        },
        getDisplayPath: function(directory) {

            return $q(function(resolve, reject) {
                resolve();
            })

        },
        getRootDirectory: function() {
            return $q(function(resolve, reject) {
                chrome.runtime.getPackageDirectoryEntry(function(dirEntry) {
                    var rootDir = new Directory(dirEntry);
                    resolve(rootDir);
                })
            })
        },
        getFile: function(rootDirecotry) {
            return $q(function(resolve, reject) {
                rootDirecotry.rawData.getFile('log.txt', { create: false }, function(fileEntry) {
                    resolve(fileEntry);
                }, function(error) {
                    reject(error.message);
                })
            })
        }
    }

});

angular.module("sp-app").factory("html5Storage", function ($q) {
    
    return {
        set: function (key, obj) {
            var o = {};
            o[key] = obj;
            
            localStorage.setItem(key, JSON.stringify(o));
        },
        get: function (key) {
            return $q(function (resolve, reject) {
                var obj = JSON.parse(localStorage.getItem(key));
                var retVal = {};
                if(obj) {
                    retVal = obj;
                }
                resolve(retVal[key]); 
            });
        },
        remove: function(key) {
            return $q(function(resolve, reject){
                localStorage.removeItem(key);
                resolve();
            })
        }
        
    };
});
angular.module('sp-app').factory('library', function(Track, Album, Artist, player, loader, Cloud, Playlist, toast, fileSystem,  searchService, playlistsRepository, tracksRepository, $rootScope, configFactory) {
    var allTracks = [];
    var allAlbums = [];
    var allArtists = [];
    var allPlaylists = [];
    var allClouds = [];

    var allTempTracks = [];


    var currentTrack = null;

    var currentOpenAlbum = null;
    var currentOpenArtist = null;
    var currentOpenPlaylist = null;
    var currentOpenCloud = null;

    var queueList = [];





    var searchResult = undefined;
    var searchValue = undefined;
    player.onEnd(onPlayEnd);


    function getArtistByName(artistName) {
        return _.find(allArtists, function(artist) {
            return artist.name.toLowerCase() === artistName.toLowerCase();
        });
    }

    function getAlbumByName(albumName, artistName) {
        return _.find(allAlbums, function(album) {
            return album.name.toLowerCase() === albumName.toLowerCase() && album.artist.name.toLowerCase() === artistName.toLowerCase();
        });
    }

    function getCloudByName(cloudName) {
        return _.find(allClouds, function(cloud) {
            return cloud.name.toLowerCase() === cloudName.toLowerCase();
        });
    }

    function updateQueueData() {


        tracksRepository.getAllTracks().then(function(tracksResult) {
            for (var i = 0; i < tracksResult.length; i++) {
                var queueItem = _.find(queueList, function(item) {
                    return item.id == tracksResult[i].id
                });
                var position = queueList ? queueList.indexOf(queueItem) : null;
                tracksRepository.updateTrack({
                    id: tracksResult[i].id,
                    metadata: tracksResult[i].metadata,
                    queueIndex: position,
                    isPlaying: tracksResult[i].isPlaying,
                    createdDate: tracksResult[i].createdDate
                });

            }
            console.log("Queue was updated");
        });


    }
    var debounced = _.debounce(updateQueueData, 2000);
    playlistsRepository.openConnection().then(function() {
        playlistsRepository.getAllPlaylists().then(function(result) {
            result.forEach(function(plistRecord) {
                var playlist = new Playlist(plistRecord.id);
                playlist.dataMapping.tracks = plistRecord.tracks;               
                allPlaylists.push(playlist);
            })
           
        })
    })
    var libObj = {
        addMusicFiles: function(musicFiles, musicStorage) {
           
            tracksRepository.openConnection().then(function() {

               
                var tracks = musicFiles.map(function(musicFile) {
                    var track = new Track(musicFile);

                    tracksRepository.getMetadata(musicStorage, track).then(function(result) {
                        
                        var metadata = result.metadata;
                        track.duration = metadata.duration;
                        track.number = metadata.track;
                        track.title = metadata.title || track.title;
                        var artistName = metadata.artist || 'Unknown Artist';
                        var artist = getArtistByName(artistName);
                        if (!artist) {
                            artist = new Artist(artistName);
                            allArtists.push(artist);
                        }
                        var albumName = metadata.album || 'Unknown Album';
                        var album = getAlbumByName(albumName, artistName);
                        if (!album) {
                            album = new Album(albumName);
                            allAlbums.push(album);
                            artist.addAlbum(album);
                            if (metadata.attachedImages && metadata.attachedImages.length > 0) {

                                album.albumArtPath = fileSystem.obtainURL(metadata.attachedImages[0]);
                            }
                        }


                        album.addTrack(track);


                        // Update track if it exists in DB, otherwise create one
                        if (!result.id) {
                            tracksRepository.updateTrack({
                                id: track.id,
                                "metadata": metadata,
                                "createdDate": (new Date()).getTime()
                            });
                        }
                      
                        // Assign tracks to an appropriate playlists
                        allPlaylists.forEach(function(playlist) {
                                if (playlist.dataMapping.tracks.indexOf(track.id) != -1) {
                                    playlist.tracks.push(track);
                                }
                            })
                            //Check if a track is in queue list
                        if (result.queueIndex != null && result.queueIndex != undefined) {
                            queueList.push(track);
                        }
                        if (result.isPlaying) {                            
                            libObj.loadTrack(track);
                        }



                        if (!track.duration) {
                            player.obtainDuration(track).then(function(duration) {
                                track.duration = duration;
                                metadata.duration = duration;
                                // $rootScope.$apply();
                            });
                        } else {
                            // $rootScope.$apply();
                        }
                    })
                    return track;
                }.bind(this));
                tracks.forEach(function(t) {

                    allTracks.push(t);
                })
             
            });


            // $rootScope.$broadcast('tracks-added', allTracks);
        },
        addFileToDirectory: function(file, mediaStorage) {
            this.addMusicFiles([file], mediaStorage);
        },
        removeTrack: function(track) {
            _.remove(allTracks, track);
            if (currentTrack == track) {
                this.unloadCurrentTrack();
            }
            var album = track.album;
            album.removeTrack(track);
            if (album.tracks.length === 0) {
                var artist = album.artist;
                artist.removeAlbum(album);
                _.remove(allAlbums, album);
                if (artist.albums.length === 0) {
                    _.remove(allArtists, artist);
                }
            }
            _.remove(queueList, track);
            tracksRepository.removeTrack(track);
            this.removeFromAllPlaylists(track);
        },
        removeCloud: function(cloud) {
            _.remove(allClouds, cloud);
            // cloud.remove();
            cloud.tracks.forEach(function(track) {
                this.removeTrack(track);
            }.bind(this));

        },
        removeAllTracks: function() {
            allTracks.forEach(function(track) {
                this.removeTrack(track);
            }.bind(this));
        },
        removeAllClouds: function() {
            allClouds.forEach(function(cloud) {
                this.removeCloud(cloud);
            }.bind(this));
        },
        addPlaylist: function(playlist) {
            var existingPlaylist = _.find(allPlaylists, function(plist) {
                return plist.name.toLowerCase() == playlist.name.toLowerCase();
            })
            if (existingPlaylist) {                
                toast.show({content: "The playlist <b>" + playlist.name + "</b> already exists"})
                return false;
            }
            allPlaylists.push(playlist);
            var trackIds = playlist.tracks.map(function(track) {


                return track.id;
            });

            playlistsRepository.addPlaylist({ id: playlist.name, tracks: trackIds, "createdDate": (new Date()).getTime() });
            toast.show({content: "The playlist <b>" + playlist.name + "</b> has been successfully created"})
            return true;
        },
        removePlaylist: function(playlist) {

            _.remove(allPlaylists, playlist);
            playlistsRepository.removePlaylist(playlist);
        },
        removePlaylists: function() { 
            allPlaylists.forEach(function(p){
                 playlistsRepository.removePlaylist(p);
            })
            allPlaylists = [];
        },
        nextTrack: function() {
            var currentTrackIndex = queueList.indexOf(currentTrack);
            playback = configFactory.configuration.playback;
            var nextIndex = 0;
            if (playback.shuffle) {
                var nextIndex = Math.floor(Math.random() * queueList.length);
            } else {
                var nextIndex = (((currentTrackIndex + 1) % queueList.length) + queueList.length) % queueList.length;
            }
            this.playTrack(queueList[nextIndex]);
        },
        prevTrack: function() {
            playback = configFactory.configuration.playback;
            var currentTrackIndex = queueList.indexOf(currentTrack);
            var nextIndex = 0;
            if (playback.shuffle) {
                var nextIndex = Math.floor(Math.random() * queueList.length);
            } else {
                nextIndex = (((currentTrackIndex - 1) % queueList.length) + queueList.length) % queueList.length;
            }
            this.playTrack(queueList[nextIndex]);
        },
        playTrack: function(track) {
            if (currentTrack && currentTrack.trackRecord) {
                tracksRepository.getTrack(currentTrack.id, currentTrack).then(function(result) {
                    tracksRepository.updateTrack({
                        id: result.track.id,
                        metadata: result.trackRecord.metadata,
                        queueIndex: result.trackRecord.queueIndex,
                        createdDate: result.trackRecord.createdDate,
                        isPlaying: null
                    })
                })
            }
            if (currentTrack && !currentTrack.cloud) {
                fileSystem.removeURL(currentTrack.src);
                currentTrack.src = "";
            }
            currentTrack = track;
            
            player.volumeOut(function() {
                if (!track.src) {
                    currentTrack.src = fileSystem.obtainURL(currentTrack.file);
                }
                player.load(currentTrack);
                player.play();
                if(track.trackRecord) {
                    tracksRepository.getTrack(currentTrack.id, track).then(function(result) {
                        tracksRepository.updateTrack({
                            id: result.track.id,
                            metadata: result.trackRecord.metadata,
                            queueIndex: result.trackRecord.queueIndex,
                            createdDate: result.trackRecord.createdDate,
                            isPlaying: true
                        })
                    });
                }
            })


        },
        loadTrack: function(track) {
            player.stop();
            player.pause();
            currentTrack = track;
            if (!track.src) {
                currentTrack.src = fileSystem.obtainURL(currentTrack.file);
            }
            player.load(currentTrack);
        },
        unloadCurrentTrack: function() {
            currentTrack = undefined;
            player.stop();
        },
        setOpenAlbum: function(album) {
            currentOpenAlbum = album;
        },
        setOpenAlbum: function(album) {
            currentOpenAlbum = album;
        },
        setOpenArtist: function(artist) {
            currentOpenArtist = artist;
        },
        setOpenPlaylist: function(playlist) {
            currentOpenPlaylist = playlist;
        },
        setOpenCloud: function(cloud) {
            currentOpenCloud = cloud;
        },
        setQueue: function(tracks) {
            queueList = [];
            tracks.forEach(function(t) {
                libObj.addToQueue(t, true);

            })
            debounced();
        },
        clearQueue: function() {
            while(queueList.length!=0) {
                this.removeFromQueue(queueList[queueList.length-1])
            }
        },
        getOpenPlaylist: function() {
            return currentOpenPlaylist;
        },
        getOpenCloud: function() {
            return currentOpenCloud;
        },
        getOpenAlbum: function() {
            return currentOpenAlbum;
        },
        getOpenArtist: function() {
            return currentOpenArtist;
        },
        getCurrentTrack: function() {
            return currentTrack;
        },
        getTracks: function() {
            // console.log('tracks has been requested');
            return allTracks;
        },
        getAlbums: function() {
            // console.log('albums has been requested');
            return allAlbums;
        },
        getArtists: function() {
            // console.log('artists has been requested');
            return allArtists;
        },
        getPlaylists: function() {
            // console.log('artists has been requested');
            return allPlaylists;
        },
        getClouds: function() {
            // console.log('artists has been requested');
            return allClouds;
        },
        getQueue: function() {
            return queueList;
        },
        getSearchResult: function() {
            return searchResult;
        },
        addToQueue: function(track, disableSync) {
            if (queueList.indexOf(track) == -1) {
                queueList.push(track);

                if (!disableSync) {
                    tracksRepository.getTrack(track.id, track, queueList.length).then(function(result) {
                        tracksRepository.updateTrack({
                            id: result.track.id,
                            metadata: result.trackRecord.metadata,
                            queueIndex: result.metadata,
                            createdDate: result.trackRecord.createdDate,
                            isPlaying: result.trackRecord.isPlaying
                        })
                    })
                }

            } else {
                console.log('The song exists');
            }
        },
        removeFromQueue: function(track) {
            if (currentTrack == track) {
                this.unloadCurrentTrack();
            }
            _.remove(queueList, track);
            tracksRepository.getTrack(track.id, track).then(function(result) {
                tracksRepository.updateTrack({
                    id: result.track.id,
                    metadata: result.trackRecord.metadata,
                    queueIndex: null,
                    createdDate: result.trackRecord.createdDate,
                    isPlaying: null
                })
            })

        },
        addToPlaylist: function(track, playlist) {

            if (playlist.tracks.indexOf(track) == -1) {
                playlist.tracks.push(track);
                if(!playlist.dataMapping.tracks) {
                    playlist.dataMapping.tracks = [];
                }
                playlist.dataMapping.tracks.push(track.id)
                playlistsRepository.getPlaylist(playlist).then(function(result) {
                    if (result.playlistRecord) {
                        result.playlistRecord.tracks.push(track.id);

                        playlistsRepository.updatePlaylist({
                            id: result.playlistRecord.id,
                            tracks: result.playlistRecord.tracks,
                            "createdDate": result.playlistRecord.createdDate
                        })

                    }
                })
            } else {
                console.log('The song exists');
            }
        },
        removeFromPlaylist: function(track, playlist) {

            _.remove(playlist.tracks, track);
            playlistsRepository.getPlaylist(playlist).then(function(result) {
                if (result.playlistRecord) {
                    var trackIds = [];
                    trackIds = playlist.tracks.map(function(t) {
                        return t.id;
                    })
                    playlist.dataMapping.tracks = trackIds;

                    playlistsRepository.updatePlaylist({
                        id: result.playlistRecord.id,
                        tracks: trackIds,
                        "createdDate": result.playlistRecord.createdDate
                    })

                }
            })


        },
        removeFromAllPlaylists: function(track) {
            var self = this;
            allPlaylists.forEach(function(playlist) {
                self.removeFromPlaylist(track, playlist);
            })
        },
        addToCloud: function(track, user) {

            var cloud = getCloudByName(track.metadata.cloud);

            if (!cloud) {
                cloud = new Cloud(track.metadata.cloud);
                allClouds.push(cloud);
            }
            cloud.user = user;
            cloud.addTrack(track);
        },
        // createSuggestion: function(keyword) {
        //     var artistsResult = searchService.search(this.getArtists(), keyword, "name");
        //     var albumsResult = searchService.search(this.getAlbums(), keyword, "name");
        //     var songsResult = searchService.search(this.getTracks(), keyword, "title");
        //     searchResult = {
        //         artists: artistsResult,
        //         albums: albumsResult,
        //         songs: songsResult
        //     }
        // },
        setSearchValue: function(keyword) {
            searchValue = keyword;
        },
        getSearchValue: function() {
            return searchValue;
        },
        getCloudByName: getCloudByName,
        temporary: {
            addMusicFiles: function(musicFiles, musicStorage) {

                var tracks = musicFiles.map(function(musicFile) {
                    var track = new Track(musicFile);

                    musicStorage.getMetadata(track).then(function(metadata) {
                        track.duration = metadata.duration;
                        track.title = metadata.title || track.title;

                        var artistName = metadata.artist || 'Unknown Artist';
                        var artist = new Artist(artistName);


                        var albumName = metadata.album || 'Unknown Album';
                        album = new Album(albumName);
                        artist.addAlbum(album);

                        if (metadata.attachedImages && metadata.attachedImages.length > 0) {

                            album.albumArtPath = fileSystem.createObjectURL(metadata.attachedImages[0]);
                        }


                        album.addTrack(track);

                        if (!track.duration) {
                            player.obtainDuration(track).then(function(duration) {
                                track.duration = duration;
                                metadata.duration = duration;
                                // $rootScope.$apply();
                            });
                        } else {
                            // $rootScope.$apply();
                        }
                    })
                    return track;
                }.bind(this));
                tracks.forEach(function(t) {
                    allTempTracks.push(t);
                    queueList.push(t);
                })

                // $rootScope.$broadcast('tracks-added', allTracks);
            },
            getTempTracks: function() {
                // console.log('tracks has been requested');
                return allTempTracks;
            }
        }
    };

    function onPlayEnd() {
        var playback = configFactory.configuration.playback;
        if (playback.repeat == player.repeatModes.noRepeat) {
            player.pause();
        } else if (playback.repeat == player.repeatModes.repeatAll) {
            libObj.nextTrack();
        } else {
            libObj.playTrack(currentTrack);
        }
        $rootScope.$apply();
    }

    return libObj;
});

angular.module('sp-app').factory('loader', function() {
    
    var loader = null;
    return {
        show: function(options) {
          

           loader = document.querySelector('.library_loader');
           loader.style.display = 'flex';

        },
        hide: function() {
           if(!loader) {
                loader =  document.querySelector('.library_loader')
           }
           loader.style.display = 'none'; 
        }   
    }
})
;angular.module('sp-app').factory('mediaSources', function() {
    var storages = [];
    var currentOpenCloud = undefined;
    return {
        addStorage: function(storage) {
            storages.push(storage);
            
        },
        getStorages: function() {
            return storages;
        },
        getOpenCloud: function() {
        	return currentOpenCloud;
        },
        setOpenCloud: function(cloud) {
        	currentOpenCloud = cloud;
        }

    }

});

angular.module('sp-app').factory('dropbox', function($http, File, $q, Cloud, library, storage, Dropbox) {

    var dropbox = new Dropbox();

    var username = "";
    var dbox = {
        initDrive: function() {
            var deferred = $q.defer();
            var self = this;

            var musicFiles = [];
            var indicator = 0;
            var config = {
                method: 'POST',

                headers: {
                    'Authorization': 'Bearer ' + dropbox.accessToken
                }
            }

            function getFiles(secondTime) {
                $http(config).then(function(result) {
                    if (result && result.data) {

                        var descriptors = result.data.entries.filter(function(entry) {
                            return entry[1].mime_type === "audio/mpeg"
                        });

                        config.headers['Content-Type'] = "application/json";

                        descriptors.forEach(function(descriptor) {
                            indicator++;
                            config.url = dropbox.METADATA;
                            config.data = {
                                path: descriptor[0]
                            }
                            $http(config).then(function(metadata) {
                                indicator--;
                                var file = new File(metadata.data);
                                file.id = file.rawData.id;
                                config.url = dropbox.MEDIA + metadata.data.path_lower;
                                musicFiles.push(file);
                                if (indicator === 0) {
                                    var options = {}
                                    options.method = "POST";
                                    options.headers = {
                                        'Authorization': 'Bearer ' + dropbox.accessToken
                                    }

                                    options.url = dropbox.USER;
                                    $http(options).then(function(user) {
                                        username = user.data.email;
                                        deferred.resolve({
                                            source: self,
                                            musicFiles: musicFiles,
                                            name: "Dropbox"
                                        });
                                    });
                                }
                            });

                        })

                    }
                }, function(error) {
                    if (error && error.status == 401 && !secondTime) {
                        dropbox.auth().then(function() {
                            config.headers['Authorization'] = 'Bearer ' + dropbox.accessToken;
                            getFiles(true);
                        });
                    }
                })
            }




            config.url = dropbox.DELTA;
            getFiles();
            return deferred.promise;
        },
        remove: function() {
            if (dropbox) {
                dropbox.remove();
            }

        },
        getMetadata: function(track) {
            var file = track.file;
            var deffered = $q.defer();
            var metadata = {};

            track.metadata = metadata;

            metadata.cloud = "Dropbox";
            library.addToCloud(track, username);
            var options = {}
            options.method = "POST";
            options.headers = {
                'Authorization': 'Bearer ' + dropbox.accessToken
            }
            options.url = dropbox.MEDIA + track.file.rawData.path_lower;
            $http(options).then(function(media) {
                media = media.data;
                track.src = media.url;
                var audio = new Audio();
                audio.src = track.src;
                audio.addEventListener('loadedmetadata', function() {
                    metadata.duration = audio.duration;
                    audio = null;
                    deffered.resolve(metadata);
                });

            });

            return deffered.promise;
        },
        type: "cloud"
    }
    storage.get('dropbox').then(function(result) {
        if (result) {
            dropbox.accessToken = result;
            dbox.initDrive().then(function(musicStorage) {
                library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

            });
        }
    });
    return dbox;

})

;angular.module("sp-app").provider("Dropbox", function () {
    

    this.$get = function (platform, DropboxChrome, DropboxDesktop) {

        if(platform.getType() == platform.types.chrome) {
            return DropboxChrome;
        } else if(platform.getType() == platform.types.desktop) {
            return DropboxDesktop;
        } 
      
    }


})
;angular.module('sp-app').factory('DropboxChrome', function($q, storage, $http) {
    function Dropbox(options) {
        var authWindow = null;
        var me = this;
        var _accessToken = null;
        var _userId = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('dropbox', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'userId', {
            set: function(value) {
                storage.set('dropbox-userid', value);
                _userId = value;
            },
            get: function() {
                return _userId;
            }
        });
        this.options = options || {
            app_key: 'd9gva19s9015p8l',
            app_secret: "lpcvsa6i2kplcaf" // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://api.dropboxapi.com/';
        this.DELTA = this.ROOT_URL + '1/delta';
        this.METADATA = this.ROOT_URL + "2/files/get_metadata";
        this.USER = this.ROOT_URL + "2/users/get_current_account";
        this.DOWNLOAD = this.ROOT_URL + "2/files/download";
        this.MEDIA = this.ROOT_URL + "1/media/auto/";

        this.auth = function() {

            var deffered = $q.defer();
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            var authUrlRppt = 'https://www.dropbox.com/1/oauth2/authorize';
            var authUrl = `${authUrlRppt}?client_id=${this.options.app_key}&response_type=token&redirect_uri=${redirectUrl}`;

            var config = {
                url: authUrl,
                interactive: true
            }
            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                if (responseUrl) {


                    var raw_code = /access_token=([^&]*)/.exec(responseUrl) || null;
                    var raw_user_id = /uid=([^&]*)/.exec(responseUrl) || null;
                    var access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
                    var user_id = (raw_user_id && raw_user_id.length > 1) ? raw_user_id[1] : null;
                    if (access_token) {
                        me.accessToken = access_token;
                        me.userId = user_id;
                        deffered.resolve();
                    }



                }
            })
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('dropbox');
            storage.remove('dropbox-userid');
            // var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            // var url = `https://www.dropbox.com/logout`;
            // var config = {
            //     url: url,
            //     interactive: true
            // }
            chrome.identity.removeCachedAuthToken({
                token: _accessToken
            });

            // chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
            //     // deffered.resolve();
            // });
            var options = {}
            options.method = "POST";
            options.headers = {
                'Authorization': 'Bearer ' + me.accessToken
            }

            options.url = 'https://api.dropboxapi.com/1/disable_access_token';
            $http(options).then(function(result) {
                console.log(result)
            });
            _accessToken = null;
            _userId = null;

        }
    }
    return Dropbox;
})

;angular.module('sp-app').factory('DropboxDesktop', function($q, storage) {
    function Dropbox(options) {
        var authWindow = null;
        var me = this;
        var _accessToken = null;
        var _userId = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('dropbox', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'userId', {
            set: function(value) {
                storage.set('dropbox-userid', value);
                _userId = value;
            },
            get: function() {
                return _userId;
            }
        });
        this.options = options || {
            app_key: 'd9gva19s9015p8l',
            app_secret: "lpcvsa6i2kplcaf" // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://api.dropboxapi.com/';
        this.DELTA = this.ROOT_URL + '1/delta';
        this.METADATA = this.ROOT_URL + "2/files/get_metadata";
        this.USER = this.ROOT_URL + "2/users/get_current_account";
        this.DOWNLOAD = this.ROOT_URL + "2/files/download";
        this.MEDIA = this.ROOT_URL + "1/media/auto/";
        
        this.auth = function() {
            var deffered = $q.defer();
            const BrowserWindow = require('electron').remote.BrowserWindow;
            authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
            var authUrlRppt = 'https://www.dropbox.com/1/oauth2/authorize';
            var authUrl = `${authUrlRppt}?client_id=${this.options.app_key}&response_type=token&redirect_uri=https://eidcnkihddokbdjfdkcocgigmggfpeio.chromiumapp.org/salmonplayer`;


            authWindow.loadURL(authUrl);

            authWindow.show();

            authWindow.webContents.on('did-frame-finish-load', (event) => {

                handleCallback(event).then(function() {
                    deffered.resolve();
                });
            });
            authWindow.on('close', () => {
                this.authWindow = null;
            }, false);
            return deffered.promise;
        }

        this.remove = function() {
            storage.remove('dropbox');
            storage.remove('dropbox-userid');
            _accessToken = null;
            _userId = null;
            var remote = require('electron').remote;
            var session = remote.session;
            session.defaultSession.cookies.get({}, (error, cookies) => {

                cookies.forEach((cookie) => {

                    if (cookie.domain.indexOf('dropbox.com') != -1) {
                        var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                        session.defaultSession.cookies.remove(url, cookie.name, () => {});
                    }
                })
            });
        }

        function handleCallback(event) {
            var deffered = $q.defer();
            var title = event.sender.getURL();
            var raw_code = /access_token=([^&]*)/.exec(title) || null;
            var raw_user_id = /uid=([^&]*)/.exec(title) || null;
            var access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
            var user_id = (raw_user_id && raw_user_id.length > 1) ? raw_user_id[1] : null;
            if (access_token) {
                authWindow.destroy();
                me.accessToken = access_token;
                me.userId = user_id;
                deffered.resolve();

            }
            return deffered.promise;
        }

    }
    return Dropbox;
})

;angular.module('sp-app').factory('googleDrive', function($http, File, $q, loader, library, storage, $rootScope, GDrive, platform) {

    var gdocs = new GDrive();

    var username = "";

    gdrive = {
        initDrive: function() {

            var self = this;
            var deferred = $q.defer();
            var musicFiles = [];
            var config = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + gdocs.accessToken
                },
                data: {
                    'alt': 'json'
                }
            }

            function getFiles(queryParameters) {
                if (queryParameters) {
                    config.url = gdocs.FILES + queryParameters;
                }
                $http(config).then(function(result) {
                    var items = result.data.items.filter(function(item) {
                        var extension = item.fileExtension;
                        return platform.isSupportedMediaFormat(extension);
                        
                    });
                    var files = items.map(function(item) {

                        item.getExtension = function() {
                            return item.fileExtension;
                        };
                        var file = new File(item);
                        file.name = item.originalFilename;
                        file.id = file.rawData.id;
                        return file;

                    });

                    musicFiles = musicFiles.concat(files);

                    if (result.data.nextPageToken) {
                        getFiles('?pageToken=' + result.data.nextPageToken);
                    } else {
                        config.url = gdocs.USER_INFO
                        $http(config).then(function(info) {

                            username = info.data.user.emailAddress;
                            loader.hide();
                            deferred.resolve({
                                source: self,
                                musicFiles: musicFiles,
                                name: "Google Drive"
                            });
                        })

                    }


                }, function(error) {
                    if (error.status == 401) {

                        if (gdocs.refreshToken) {
                            gdocs.authRefresh().then(function() {
                                config.headers['Authorization'] = 'Bearer ' + gdocs.accessToken;
                                getFiles();
                            });
                        } else {
                            gdocs.auth().then(function() {
                                config.headers['Authorization'] = 'Bearer ' + gdocs.accessToken;
                                getFiles();
                            });
                        }
                    }
                });
            }
            config.url = gdocs.FILES;
            getFiles();
            // gdocs.auth()           
            return deferred.promise;
        },
        remove: function() {
            if (gdocs) {
                // gdocs.removeCachedAuthToken();
                // gdocs.revokeAuthToken();
                gdocs.remove();
                username = "";
                // storage.remove('gdrive');
            }
        },
        getMetadata: function(track) {
            var file = track.file;
            var deffered = $q.defer();
            var metadata = {}

            track.metadata = metadata;
            metadata.cloud = "Google Drive";

            library.addToCloud(track, username);

            if (!file) {
                deffered.resolve(metadata);
            } else {

                var audio = new Audio();
                track.title = file.name;
                track.src = track.file.rawData.downloadUrl + '&access_token=' + gdocs.accessToken;
                audio.src = track.src;
                audio.addEventListener('loadedmetadata', function() {
                    metadata.duration = audio.duration;
                    audio = null;
                    deffered.resolve(metadata);
                });
            }
            return deffered.promise;
        },
        type: "cloud"
    }
    storage.get('gdrive').then(function(accessToken) {
        if(accessToken) {
            console.log(accessToken);
            storage.get('gdrive_refresh').then(function(refreshToken) {                
                gdocs.accessToken = accessToken;
                gdocs.refreshToken = refreshToken;
                gdrive.initDrive().then(function(musicStorage) {
                    library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

                });
            });
        }
    })

    return gdrive;
})

;angular.module("sp-app").provider("GDrive", function () {
    

    this.$get = function (platform, GDriveChrome, GDriveDesktop) {

        if(platform.getType() == platform.types.chrome) {
            return GDriveChrome;
        } else if(platform.getType() == platform.types.desktop) {
            return GDriveDesktop;
        } 
      
    }


})
;angular.module('sp-app').factory('GDriveChrome', function($q, storage) {
    function GDrive(options) {      
        var deffered = $q.defer();
        var me = this;
        var _accessToken = null;
        var _refreshToken = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('gdrive', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'refreshToken', {
            set: function(value) {
                storage.set('gdrive_refresh', value);
                _refreshToken = value;
            },
            get: function() {
                return _refreshToken;
            }
        });
        this.options = options || {
            client_id: '118969089660-jp522il1m80lbotde32ojubaqhe53uro.apps.googleusercontent.com',
            client_secret: 'h9F9JD0ddQ7PT3maPrZDgbut',
            scopes: ["https://www.googleapis.com/auth/drive"] // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://www.googleapis.com/drive/v2/';
        this.FILES = this.ROOT_URL + 'files';
        this.USER_INFO = this.ROOT_URL + 'about';
        this.auth = function() {

            var driveUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            var authUrl = `${driveUrl}?response_type=token&client_id=${this.options.client_id}&scope=${this.options.scopes}&redirect_uri=${redirectUrl}`;
            var config = {
                url: authUrl,
                interactive: true
            }
            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                if (responseUrl) {
                   
                    me.accessToken = responseUrl.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
                    deffered.resolve();

                }
            })
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('gdrive');
            storage.remove('gdrive_refresh');            
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            var url = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=`+redirectUrl;
            var config = {
                url: url,
                interactive: true
            }
            chrome.identity.removeCachedAuthToken({
                token: _accessToken
            });

            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                 deffered.resolve();
            });
            _accessToken = null;
            _refreshToken = null;         
        }  
    }
    return GDrive;
})

;angular.module('sp-app').factory('GDriveDesktop', function($q, storage) {
    function GDrive(options) {
        var authWindow = null;
        
        var me = this;
        var _accessToken = null;
        var _refreshToken = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('gdrive', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            } 
        });
        Object.defineProperty(this, 'refreshToken', {
            set: function(value) {
                storage.set('gdrive_refresh', value);
                _refreshToken = value;
            },
            get: function() {
                return _refreshToken;
            } 
        });
        this.options = options || {
            client_id: '118969089660-0qd1s1jdobecfuk4drs1k6a5vjkvc5tj.apps.googleusercontent.com',
            client_secret: 'AdO4W2POd4R1SGnwbfl8kAvA',
            scopes: ["https://www.googleapis.com/auth/drive"] // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://www.googleapis.com/drive/v2/';
        this.FILES = this.ROOT_URL + 'files';
        this.USER_INFO = this.ROOT_URL + 'about';
        this.auth = function() {
            var deffered = $q.defer();
            const BrowserWindow = require('electron').remote.BrowserWindow;
            authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
            var driveUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
            var authUrl = `${driveUrl}?response_type=code&client_id=${this.options.client_id}&scope=${this.options.scopes}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline`;
            authWindow.loadURL(authUrl);
            authWindow.show();
            authWindow.webContents.on('did-frame-finish-load', (event) => {
                handleCallback(event).then(function(){
                    deffered.resolve();
                });
            });
            authWindow.on('close', () => {
                this.authWindow = null;
            }, false);
            return deffered.promise;
        }
        this.authRefresh = function() {
            var deffered = $q.defer();
            var driveUrl = 'https://www.googleapis.com/oauth2/v4/token';

            var authUrl = `${driveUrl}?grant_type=refresh_token&client_id=${me.options.client_id}&client_secret=${me.options.client_secret}&refresh_token=${me.refreshToken}`;
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST', authUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
           
            xhr.onload = function(e) {

                var responseObj = JSON.parse(this.response);
                if (responseObj && responseObj.access_token) {
                    me.accessToken = responseObj.access_token;                    
                    deffered.resolve();

                } else {
                    return me.auth();                    
                }
            }
            xhr.send(null);
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('gdrive');
            storage.remove('gdrive_refresh');
            var remote = require('electron').remote;
            var session = remote.session;
            _accessToken = null;
            _refreshToken = null;
            session.defaultSession.cookies.get({}, (error, cookies) => {

                cookies.forEach((cookie) => {
                     console.log("http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path)
                    if (cookie.domain.indexOf('google') != -1 || cookie.domain.indexOf('youtube') != -1 || cookie.domain.indexOf('doubleclick.net') != -1) {
                        var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                        session.defaultSession.cookies.remove(url, cookie.name, () => {});
                    }
                })
            });

        }
        function handleCallback(event) {
            var deffered = $q.defer();
            var title = event.sender.getTitle();
            var raw_code = /Success code=([^&]*)/.exec(title) || null;
            var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
            if (code) {
                authWindow.destroy();
                requestToken(code).then(function(){
                    deffered.resolve();
                });

            }
            return deffered.promise;
        }

        function requestToken(code) {
            var deffered = $q.defer();
            var driveUrl = 'https://www.googleapis.com/oauth2/v4/token';

            var authUrl = `${driveUrl}?grant_type=authorization_code&client_id=${me.options.client_id}&code=${code}&client_secret=${me.options.client_secret}&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST', authUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');          
            xhr.onload = function(e) {

                var responseObj = JSON.parse(this.response);
                if (responseObj && responseObj.access_token) {
                    me.accessToken = responseObj.access_token;
                    me.refreshToken = responseObj.refresh_token;
                    deffered.resolve();

                } else {
                    deffered.reject();
                }
            }
            xhr.send(null);
            return deffered.promise;

        }
    }
    return GDrive;
})

; angular.module('sp-app').factory('localStorage', function(fileSystem, loader, toast, $q, $rootScope, library, storage, $timeout, platform, Directory, File) {
     var folders = [];

     $rootScope.$watch(function() {
         return folders.length;
     }, function() {
         physicalPaths = []
         folders.forEach(function(folder) {

             physicalPaths.push(folder.physicalPath);
         })
         storage.set('localFilePaths', {
             physicalPaths: physicalPaths
         })
     });

     var localStorage = {


         addFolder: function() {

             return $q(function(reslove, reject) {
                 fileSystem.chooseLocation().then(function(rootDirectory) {
                     loader.show();
                     folderExists = _.find(physicalPaths, function(physicalPath) {
                         return physicalPath === rootDirectory.physicalPath;
                     })
                     if (!folderExists) {
                         fileSystem.addFolderWatch(rootDirectory, folderContentChanged);

                         processSelectedFolder(rootDirectory, reslove);
                     }
                 }, function(error) {
                     toast.show({ content: error })
                     loader.hide();
                 })

             });
         },
         addTemporary: function(entry) {
             loader.show();
             fileSystem.getDisplayPath(entry).then(function(fullPath) {
                 entry.physicalPath = fullPath;
                 if (entry instanceof Directory) {

                     processTemporaryFolder(entry);
                 } else {
                     processTemporaryFile(entry);
                 }
             })


         },
         scanMediaDevices: function(interactive, physicalPaths) {

             if (!interactive) {
                 interactive = "if_needed";
             }

             return $q(function(reslove, reject) {
                 fileSystem.autoDetect(interactive).then(function(rootDirectories) {

                     rootDirectories.forEach(function(rootDirectory) {

                         folderExists = _.find(physicalPaths, function(physicalPath) {
                             return physicalPath === rootDirectory.physicalPath;
                         })
                         if (physicalPaths != undefined) {
                             if (folderExists) {

                                 fileSystem.addFolderWatch(rootDirectory, folderContentChanged);
                                 processSelectedFolder(rootDirectory, reslove);
                                 _.remove(physicalPaths, folderExists);
                             } else {
                                 fileSystem.removeFolderWatch(rootDirectory);
                             }
                         } else {
                             fileSystem.addFolderWatch(rootDirectory, folderContentChanged);
                             processSelectedFolder(rootDirectory, reslove);
                             _.remove(physicalPaths, folderExists);
                         }
                     })

                 });
             });
         },

         removeFolder: function(folder) {
             fileSystem.removeFolderWatch(folder);
             _.remove(folders, folder);
             // $rootScope.$broadcast('folder-deleted', folder);
             var tracks = library.getTracks().filter(function(track) {
                 return track.file.rootDirectory === folder.physicalPath;
             });
             tracks.forEach(function(track) {
                 library.removeTrack(track);
             });
         },
         getFolders: function() {
             return folders;
         },
         getMetadata: function(track) {
            var deffered = $q.defer();
             if (platform.getType() == platform.types.desktop) {
                 var fs = require('fs');
                 var mm = require('musicmetadata');
                 var parser = mm(fs.createReadStream(track.file.physicalPath),{ duration: true }, function(err, result) {
                    if(err) {
                        deffered.resolve({});
                    } else {
                        var metadata = {};
                        if(result.artist.length!=0) {
                            metadata.artist = result.artist[0];
                        }
                        if(result.title) {
                            metadata.title = result.title;
                        }
                        if(result.album) {
                            metadata.album = result.album;
                        }
                        if(result.picture.length!=0) {
                            metadata.attachedImages = result.picture;
                        }
                        if(result.track && result.track.no) {
                            metadata.track = result.track.no;
                        }
                        if(result.duration) {
                            metadata.duration = result.duration;
                        }
                     };
                     deffered.resolve(metadata);
                 });

             } else { 
                 var file = track.file.file;                 
                 var metadata = {};
                 track.metadata = metadata;
                 if (!file) {
                     deffered.resolve({});
                 } else {
                     chrome.mediaGalleries.getMetadata(file, {
                         metadataType: "all"
                     }, function(_metadata) {

                         metadata = _metadata;
                         if (chrome.runtime.lastError) {

                             deffered.reject(chrome.runtime.lastError);
                         } else {
                             deffered.resolve(metadata);
                         }
                     });
                 }
             }
             return deffered.promise;
         },
         type: "local"
     }

     function addFile(fileToAdd) {
        if(platform.getType() == platform.types.chrome) {
             fileToAdd.rawData.file(function(file) {

                 fileToAdd.file = file;
                 library.addFileToDirectory(fileToAdd, localStorage);
             });
        } else {
            library.addFileToDirectory(fileToAdd, localStorage);
        }
     }

     function folderContentChanged(directory) {

         fileSystem.getEntriesRecursively(directory).then(function(result) {
             var musicFiles = result.fileList.filter(function(item) {

                 item.rootDirectory = directory.physicalPath;
                 item.physicalPath = item.physicalPath || item.rootDirectory.replace(/\\/g, '/') + item.rawData.fullPath;
                 return platform.isSupportedMediaFormat(item.extension);
                 
             });

             // console.log(musicFiles);
             
             musicFiles.forEach(function(musicFile) {
                var tracks = library.getTracks().filter(function(track) {
                    return track.file.rootDirectory === directory.physicalPath;
                });
                var existingTrack = undefined;
                if(platform.getType() == platform.types.chrome) {
                    existingTrack = _.find(tracks, function(track) {
                         return track.file.rawData.fullPath == musicFile.rawData.fullPath;
                     })
                } else if(platform.getType() == platform.types.desktop){
                    existingTrack = _.find(tracks, function(track) {
                         return track.file.physicalPath == musicFile.physicalPath;
                    })
                }
                if (!existingTrack) {
                    musicFile.local = true;
                    addFile(musicFile);
                }
             });
             tracks.forEach(function(track) {
                 var existingTrack = undefined;
                if(platform.getType() == platform.types.chrome) {
                    existingTrack = _.find(musicFiles, function(musicFile) {
                         return track.file.rawData.fullPath == musicFile.rawData.fullPath;
                    });
                } else if(platform.getType() == platform.types.desktop) {
                    existingTrack = _.find(musicFiles, function(musicFile) {
                         return track.file.physicalPath == musicFile.physicalPath;
                    });
                }
                 if (!existingTrack) {
                     library.removeTrack(track);
                 }
             });

         }, function(error) {
             if (error.type === fileSystem.errors.not_found) {
                 localStorage.removeFolder(directory);
             }

         })
     }

     function processTemporaryFile(file) {
         if (platform.isSupportedMediaFormat(file.extension)) {
             fileSystem.obtainFiles([file]).then(function() {

                 $rootScope.$broadcast('temp-storage-added', {
                     source: localStorage,
                     musicFiles: [file]
                 })
             });
         } else {
            loader.hide();
         }
     }

     function processTemporaryFolder(rootDirectory) {
         fileSystem.getEntriesRecursively(rootDirectory).then(function(result) {

             var musicFiles = result.fileList.filter(function(item) {

                 item.rootDirectory = rootDirectory.physicalPath;
                 item.physicalPath = item.physicalPath || item.rootDirectory.replace(/\\/g, '/') + item.rawData.fullPath;
                 return platform.isSupportedMediaFormat(item.extension);
             });

             // folders.push(rootDirectory);

             fileSystem.obtainFiles(musicFiles).then(function() {

                 $rootScope.$broadcast('temp-storage-added', {
                     source: localStorage,
                     musicFiles: musicFiles
                 })
             });
             loader.hide();


         });
     }

     function processSelectedFolder(rootDirectory, resolve) {

         fileSystem.getEntriesRecursively(rootDirectory).then(function(result) {

             var musicFiles = result.fileList.filter(function(item) {

                 item.rootDirectory = rootDirectory.physicalPath;
                 item.physicalPath = item.physicalPath || item.rootDirectory.replace(/\\/g, '/') + item.rawData.fullPath;
                 return platform.isSupportedMediaFormat(item.extension) 
             });

             folders.push(rootDirectory);

             fileSystem.obtainFiles(musicFiles).then(function() {

                 $rootScope.$broadcast('storage-added', {
                     source: localStorage,
                     musicFiles: musicFiles
                 })
             });
             loader.hide();


         });
     }
     storage.get('localFilePaths').then(function(localFolderPaths) {
         if (localFolderPaths && localFolderPaths.physicalPaths && localFolderPaths.physicalPaths.length!=0) {
             localStorage.scanMediaDevices("no", localFolderPaths.physicalPaths);
         }
     });


     return localStorage;
 })

;angular.module('sp-app').factory('oneDrive', function($http, File, $q, loader, library, storage, $rootScope, OneDrive) {

    var oneDrive = new OneDrive();

    var username = "";

    onedrive = {
        initDrive: function() {

            var self = this;
            var deferred = $q.defer();
            var musicFiles = [];
            var config = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + oneDrive.accessToken
                }
            }

            function getFiles(queryParameters) {
                if (queryParameters) {
                    config.url = oneDrive.FILES + queryParameters;
                }
                $http(config).then(function(result) {
                    result.data.value.forEach(function(item){
                        if(item.audo) {
                            // console.log(item);
                        }
                        if(item.folder) {
                             console.log(item);
                        }
                    })
                    var items = result.data.items.filter(function(item) {
                        var extension = item.fileExtension;
                        return extension === 'mp3' || extension === 'wav' || extension === 'ogg';
                    });
                    var files = items.map(function(item) {

                        item.getExtension = function() {
                            return item.fileExtension;
                        };
                        var file = new File(item);
                        file.name = item.originalFilename;
                        file.id = file.rawData.id;
                        return file;

                    });

                    musicFiles = musicFiles.concat(files);

                    if (result.data.nextPageToken) {
                        getFiles('?pageToken=' + result.data.nextPageToken);
                    } else {
                        config.url = oneDrive.USER_INFO
                        $http(config).then(function(info) {

                            username = info.data.user.emailAddress;
                            loader.hide();
                            deferred.resolve({
                                source: self,
                                musicFiles: musicFiles,
                                name: "One Drive"
                            });
                        })

                    }


                }, function(error) {
                    if (error.status == 401) {

                        if (oneDrive.refreshToken) {
                            oneDrive.authRefresh().then(function() {
                                config.headers['Authorization'] = 'Bearer ' + oneDrive.accessToken;
                                getFiles();
                            });
                        } else {
                            oneDrive.auth().then(function() {
                                config.headers['Authorization'] = 'Bearer ' + oneDrive.accessToken;
                                getFiles();
                            });
                        }
                    }
                });
            }
            config.url = oneDrive.CHILDREN+"children";
            getFiles();
            // oneDrive.auth()           
            return deferred.promise;
        },
        remove: function() {
            if (oneDrive) {
                // oneDrive.removeCachedAuthToken();
                // oneDrive.revokeAuthToken();
                oneDrive.remove();
                username = "";
                // storage.remove('gdrive');
            }
        },
        getMetadata: function(track) {
            var file = track.file;
            var deffered = $q.defer();
            var metadata = {}

            track.metadata = metadata;
            metadata.cloud = "Google Drive";

            library.addToCloud(track, username);

            if (!file) {
                deffered.resolve(metadata);
            } else {

                var audio = new Audio();
                track.title = file.name;
                track.src = track.file.rawData.downloadUrl + '&access_token=' + oneDrive.accessToken;
                audio.src = track.src;
                audio.addEventListener('loadedmetadata', function() {
                    metadata.duration = audio.duration;
                    audio = null;
                    deffered.resolve(metadata);
                });
            }
            return deffered.promise;
        },
        type: "cloud"
    }
    storage.get('onedrive').then(function(accessToken) {
        if(accessToken) {
            console.log(accessToken);
            storage.get('one_refresh').then(function(refreshToken) {                
                oneDrive.accessToken = accessToken;
                oneDrive.refreshToken = refreshToken;
                onedrive.initDrive().then(function(musicStorage) {
                    library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

                });
            });
        }
    })

    return onedrive;
})

;angular.module("sp-app").provider("OneDrive", function () {
    

    this.$get = function (platform, OneDriveChrome, OneDriveDesktop) {

        if(platform.getType() == platform.types.chrome) {
            return OneDriveChrome;
        } else if(platform.getType() == platform.types.desktop) {
            return OneDriveDesktop;
        } 
      
    }


})
;angular.module('sp-app').factory('OneDriveChrome', function($q, storage) {
    function OneDrive(options) {      
        var deffered = $q.defer();
        var me = this;
        var _accessToken = null;
        var _refreshToken = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                // storage.set('onedrive', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'refreshToken', {
            set: function(value) {
                storage.set('one_refresh', value);
                _refreshToken = value;
            },
            get: function() {
                return _refreshToken;
            }
        });
        this.options = options || {
            client_id: '8788a8aa-04ba-4e7b-9d95-bb6789505285',
           
            scopes: "onedrive.readonly offline_access" // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://api.onedrive.com/v1.0/';

        this.CHILDREN = this.ROOT_URL + 'drive/root/';
        this.USER_INFO = this.ROOT_URL + 'about';
        this.auth = function() {

            var driveUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            
            var authUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${this.options.client_id}&scope=${this.options.scopes}
    &response_type=token&redirect_uri=${redirectUrl}`;
            var config = {
                url: authUrl,
                interactive: true
            }
            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                if (responseUrl) {
                   
                    me.accessToken = responseUrl.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
                    deffered.resolve();

                }
            })
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('gdrive');
            storage.remove('gdrive_refresh');            
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            var url = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=`+redirectUrl;
            var config = {
                url: url,
                interactive: true
            }
            chrome.identity.removeCachedAuthToken({
                token: _accessToken
            });

            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                 deffered.resolve();
            });
            _accessToken = null;
            _refreshToken = null;         
        }  
    }
    return OneDrive;
})

;angular.module('sp-app').factory('OneDriveDesktop', function($q, storage) {
    function GDrive(options) {
        var authWindow = null;
        
        var me = this;
        var _accessToken = null;
        var _refreshToken = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('gdrive', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            } 
        });
        Object.defineProperty(this, 'refreshToken', {
            set: function(value) {
                storage.set('gdrive_refresh', value);
                _refreshToken = value;
            },
            get: function() {
                return _refreshToken;
            } 
        });
        this.options = options || {
            client_id: '118969089660-0qd1s1jdobecfuk4drs1k6a5vjkvc5tj.apps.googleusercontent.com',
            client_secret: 'AdO4W2POd4R1SGnwbfl8kAvA',
            scopes: ["https://www.googleapis.com/auth/drive"] // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://www.googleapis.com/drive/v2/';
        this.FILES = this.ROOT_URL + 'files';
        this.USER_INFO = this.ROOT_URL + 'about';
        this.auth = function() {
            var deffered = $q.defer();
            const BrowserWindow = require('electron').remote.BrowserWindow;
            authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
            var driveUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
            var authUrl = `${driveUrl}?response_type=code&client_id=${this.options.client_id}&scope=${this.options.scopes}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline`;
            authWindow.loadURL(authUrl);
            authWindow.show();
            authWindow.webContents.on('did-frame-finish-load', (event) => {
                handleCallback(event).then(function(){
                    deffered.resolve();
                });
            });
            authWindow.on('close', () => {
                this.authWindow = null;
            }, false);
            return deffered.promise;
        }
        this.authRefresh = function() {
            var deffered = $q.defer();
            var driveUrl = 'https://www.googleapis.com/oauth2/v4/token';

            var authUrl = `${driveUrl}?grant_type=refresh_token&client_id=${me.options.client_id}&client_secret=${me.options.client_secret}&refresh_token=${me.refreshToken}`;
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST', authUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
           
            xhr.onload = function(e) {

                var responseObj = JSON.parse(this.response);
                if (responseObj && responseObj.access_token) {
                    me.accessToken = responseObj.access_token;                    
                    deffered.resolve();

                } else {
                    return me.auth();                    
                }
            }
            xhr.send(null);
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('gdrive');
            storage.remove('gdrive_refresh');
            var remote = require('electron').remote;
            var session = remote.session;
            _accessToken = null;
            _refreshToken = null;
            session.defaultSession.cookies.get({}, (error, cookies) => {

                cookies.forEach((cookie) => {
                     console.log("http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path)
                    if (cookie.domain.indexOf('google') != -1 || cookie.domain.indexOf('youtube') != -1 || cookie.domain.indexOf('doubleclick.net') != -1) {
                        var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                        session.defaultSession.cookies.remove(url, cookie.name, () => {});
                    }
                })
            });

        }
        function handleCallback(event) {
            var deffered = $q.defer();
            var title = event.sender.getTitle();
            var raw_code = /Success code=([^&]*)/.exec(title) || null;
            var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
            if (code) {
                authWindow.destroy();
                requestToken(code).then(function(){
                    deffered.resolve();
                });

            }
            return deffered.promise;
        }

        function requestToken(code) {
            var deffered = $q.defer();
            var driveUrl = 'https://www.googleapis.com/oauth2/v4/token';

            var authUrl = `${driveUrl}?grant_type=authorization_code&client_id=${me.options.client_id}&code=${code}&client_secret=${me.options.client_secret}&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST', authUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');          
            xhr.onload = function(e) {

                var responseObj = JSON.parse(this.response);
                if (responseObj && responseObj.access_token) {
                    me.accessToken = responseObj.access_token;
                    me.refreshToken = responseObj.refresh_token;
                    deffered.resolve();

                } else {
                    deffered.reject();
                }
            }
            xhr.send(null);
            return deffered.promise;

        }
    }
    return GDrive;
})

;angular.module('sp-app').factory('spotify', function($http, File, $q, Cloud, library, storage) {

    spotify = new Spotify();
    var username = "";

    Object.defineProperty(spotify, 'access_token', {
        set: function(value) {
            this._access_token = value;
            storage.set('spotify', value);
        },
        get: function() {
            return this._access_token;
        }
    })
    var spotify = {
        initDrive: function() {


            var musicFiles = [];
            var self = this;
            var deferred = $q.defer();


            function fetchFiles(retry) {

                $http.get(spotify.tracks, {
                    headers: {
                        'Authorization': 'Bearer ' + spotify.access_token
                    }
                }).then(function(result) {

                    if ((result.data && result.data.error) && retry) {
                        spotify.removeCachedAuthToken(
                            spotify.auth.bind(spotify, fetchFiles.bind(this, false))
                        );
                    } else {

                        var data = result.data.items;
                        var files = data.map(function(item) {

                            var file = new File(item.track);
                            file.name = item.track.artists[0].name + " - " + item.track.name;
                            return file;

                        });
                        musicFiles = musicFiles.concat(files);
                        // var requestURl = 'https://api.vk.com/method/audio.get?uid=' + me.user_id + '&access_token=' + me.access_token;

                        $http.get(spotify.user, {
                            headers: {
                                'Authorization': 'Bearer ' + spotify.access_token
                            }
                        }).success(function(acocuntInfo) {


                            username = acocuntInfo.email;
                            deferred.resolve({
                                source: self,
                                musicFiles: musicFiles,
                                name: "Spotify"
                            });
                        }).error(function(e) {
                            console.log(e);
                        })
                    }
                }, function(error) {
                    if (retry) {
                        spotify.removeCachedAuthToken(
                            spotify.auth.bind(spotify, fetchFiles.bind(this, false))
                        );
                    }
                });
            }
            fetchFiles(true);
            return deferred.promise;
        },
        remove: function() {
            if (spotify) {
                spotify.removeCachedAuthToken();
                spotify.access_token = null;
            }
            storage.remove('spotify');

        },
        getMetadata: function(track) {
            var file = track.file;
            var deffered = $q.defer();
            var metadata = {};

            track.metadata = metadata;
            metadata.cloud = "Spotify";
            library.addToCloud(track, username);
            if (!file) {
                deffered.resolve(metadata);
            } else {
                var audio = new Audio();
                metadata.title = file.rawData.name || "";
                // var artists = [];
                // file.rawData.artists.forEach(function(a){
                //     artists.push(a.name)

                // })
                // metadata.artist = artists.join('/');                
                metadata.duration = file.rawData.duration_ms / 1000 || "";
                track.src = file.rawData.href;
                deffered.resolve(metadata);
            }
            return deffered.promise;
        }
    }
    storage.get('spotify').then(function(result) {
        if (result) {
            spotify.access_token = result;
            spotify.initDrive().then(function(musicStorage) {
                library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

            });
        }
    });
    return spotify;
})

;angular.module('sp-app').factory('vkontakte', function($http, File, $q, loader, Cloud, library, storage, Vkontakte) {

    vkClient = new Vkontakte();
    var username = "";

    Object.defineProperty(vkClient, 'access_token', {
        set: function(value) {
            this._access_token = value;
            storage.set('vk', value);
        },
        get: function() {
            return this._access_token;
        }
    })
    var vk = {
        initDrive: function() {


            var musicFiles = [];
            var self = this;
            var deferred = $q.defer();

            function getFiles(secondTime) {
                //"audio.get" + '?uid=' + this.user_id + '&access_token=' + this.access_token;
                $http.get(vkClient.FILES + '?uid=' + vkClient.userId + '&access_token=' + vkClient.accessToken).then(function(result) {

                    if (result && result.data.error && !secondTime) {
                        vkClient.auth().then(function() {
                            getFiles(true);
                        });
                        return;
                    }
                    var data = result.data.response;
                    var files = data.map(function(item) {
                        var file = new File(item);
                        file.id = file.rawData.aid;
                        file.name = item.artist + " - " + item.title;
                        return file;

                    });
                    musicFiles = musicFiles.concat(files);
                    $http.get(vkClient.USER + '?uid=' + vkClient.userId + '&access_token=' + vkClient.accessToken).then(function(acocuntInfo) {

                        var response = acocuntInfo.data.response[0];
                        username = response.first_name + " " + response.last_name;

                        deferred.resolve({
                            source: self,
                            musicFiles: musicFiles,
                            name: "Vkontakte"
                        });
                    })
                }, function(error) {
                    console.log(error);

                })
            }            
            getFiles();
            return deferred.promise;
        },
        search: function(query) {
                var deferred = $q.defer();
                var self = this;
                $http.get(vkClient.SEARCH + '?q='+query+'&auto_complete=1&sort=2&count=5&access_token=' + vkClient.accessToken+'&v=5.53').then(function(result) {

                    // if (result && result.data.error && !secondTime) {
                    //     vkClient.auth().then(function() {
                    //         getFiles(true);
                    //     });
                    //     return;
                    // }
                    var data = result.data.response.items;
                    var files = data.map(function(item) {
                        var file = new File(item);
                        file.id = file.rawData.aid;
                        file.name = item.artist + " - " + item.title;
                        return file;

                    });
                    

                    // musicFiles = musicFiles.concat(files);
                    // $http.get(vkClient.USER + '?uid=' + vkClient.userId + '&access_token=' + vkClient.accessToken).then(function(acocuntInfo) {

                    //     var response = acocuntInfo.data.response[0];
                    //     username = response.first_name + " " + response.last_name;

                    deferred.resolve({
                        source: self,
                        musicFiles: files,
                        name: "Vkontakte"
                    });
                    // })
                }, function(error) {
                    console.log(error);

                })
                return deferred.promise;
                       
        },
        remove: function() {
            if (vkClient) {
                vkClient.remove();
            }          

        },
        getMetadata: function(track, noCloud) {
            var file = track.file;
            var deffered = $q.defer();
            var metadata = {};

            track.metadata = metadata;
            metadata.cloud = "Vkontakte";
            if(!noCloud) {
                library.addToCloud(track, username);
            }
            if (!file) {
                deffered.resolve(metadata);
            } else {
                var audio = new Audio();
                metadata.title = file.rawData.title || "";
                metadata.artist = file.rawData.artist || "";
                metadata.duration = file.rawData.duration || "";
                track.src = file.rawData.url;
                deffered.resolve(metadata);
            }
            return deffered.promise;
        }
    }
    storage.get('vk').then(function(accessToken) {
        if (accessToken) {
            vkClient.accessToken = accessToken;
            storage.get('vk-userid').then(function(userId) {
                vkClient.userId = userId;
                vk.initDrive().then(function(musicStorage) {
                    library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

                });
            })
        }
    });
    return vk;
})

;angular.module("sp-app").provider("Vkontakte", function () {
    

    this.$get = function (platform, VkontakteChrome, VkontakteDesktop) {

        if(platform.getType() == platform.types.chrome) {
            return VkontakteChrome;
        } else if(platform.getType() == platform.types.desktop) {
            return VkontakteDesktop;
        } 
      
    }


})
;angular.module('sp-app').factory('VkontakteChrome', function($q, storage) {
    function Vkontakte(options) {
        var authWindow = null;
        var me = this;
        var _accessToken = null;
        var _userId = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('vk', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'userId', {
            set: function(value) {
                storage.set('vk-userid', value);
                _userId = value;
            },
            get: function() {
                return _userId;
            }
        });
        this.options = options || {
            app_id: '5516428',
            permissions: "audio,offline" // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://api.vk.com/method/';
        this.FILES = this.ROOT_URL + "audio.get";
        this.USER = this.ROOT_URL + "users.get";
        this.SEARCH = this.ROOT_URL + "audio.search";
        this.auth = function() {

            var deffered = $q.defer();
            var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            var authUrlRppt = 'https://oauth.vk.com/authorize';
            var authUrl = `${authUrlRppt}?response_type=token&v=5.52&display=page&client_id=${this.options.app_id}&scope=${this.options.permissions}&redirect_uri=${redirectUrl}`;

            var config = {
                url: authUrl,
                interactive: true
            }
            chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
                if (responseUrl) {


                    var raw_code = /access_token=([^&]*)/.exec(responseUrl) || null;
                    var raw_user_id = /user_id=([^&]*)/.exec(responseUrl) || null;
                    var access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
                    var user_id = (raw_user_id && raw_user_id.length > 1) ? raw_user_id[1] : null;
                    if (access_token) {
                        me.accessToken = access_token;
                        me.userId = user_id;
                        deffered.resolve();
                    }



                }
            })
            return deffered.promise;
        }
        this.remove = function() {
            storage.remove('vk');
            storage.remove('vk-userid');
            // var redirectUrl = chrome.identity.getRedirectURL('salmonplayer');
            // var url = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=` + redirectUrl;
            // var config = {
            //     url: url,
            //     interactive: true
            // }
            chrome.identity.removeCachedAuthToken({
                token: _accessToken
            });

            // chrome.identity.launchWebAuthFlow(config, function(responseUrl) {
            //     deffered.resolve();
            // });
            _accessToken = null;
            _userId = null;

        }
    }
    return Vkontakte;
})

;angular.module('sp-app').factory('VkontakteDesktop', function($q, storage) {
    function Vkontakte(options) {
        var authWindow = null;
        var me = this;
        var _accessToken = null;
        var _userId = null;
        Object.defineProperty(this, 'accessToken', {
            set: function(value) {
                storage.set('vk', value);
                _accessToken = value;
            },
            get: function() {
                return _accessToken;
            }
        });
        Object.defineProperty(this, 'userId', {
            set: function(value) {
                storage.set('vk-userid', value);
                _userId = value;
            },
            get: function() {
                return _userId;
            }
        });
        this.options = options || {
            app_id: '5516428',
            permissions: "audio,offline" // Scopes limit access for OAuth tokens.
        };
        this.ROOT_URL = 'https://api.vk.com/method/';
        this.FILES = this.ROOT_URL + "audio.get";
        this.USER = this.ROOT_URL + "users.get";
        this.SEARCH = this.ROOT_URL + "audio.search";
        this.auth = function() {
            var deffered = $q.defer();
            const BrowserWindow = require('electron').remote.BrowserWindow;
            authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
            var authUrlRppt = 'https://oauth.vk.com/authorize';
            var authUrl = `${authUrlRppt}?response_type=token&v=5.52&display=popup&client_id=${this.options.app_id}&scope=${this.options.permissions}&redirect_uri=https://oauth.vk.com/blank.html`;


            authWindow.loadURL(authUrl);

            authWindow.show();

            authWindow.webContents.on('did-frame-finish-load', (event) => {

                handleCallback(event).then(function() {
                    deffered.resolve();
                });
            });
            authWindow.on('close', () => {
                this.authWindow = null;
            }, false);
            return deffered.promise;
        }

        this.remove = function() {
            storage.remove('vk');
            storage.remove('vk-userid');
            _accessToken = null;
            _userId = null;
            var remote = require('electron').remote;
            var session = remote.session;
            session.defaultSession.cookies.get({}, (error, cookies) => {

                cookies.forEach((cookie) => {

                    if (cookie.domain.indexOf('vk.com') != -1) {
                        var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
                        session.defaultSession.cookies.remove(url, cookie.name, () => {});
                    }
                })
            });
        }

        function handleCallback(event) {
            var deffered = $q.defer();
            var title = event.sender.getURL();
            var raw_code = /access_token=([^&]*)/.exec(title) || null;
            var raw_user_id = /user_id=([^&]*)/.exec(title) || null;
            var access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
            var user_id = (raw_user_id && raw_user_id.length > 1) ? raw_user_id[1] : null;
            if (access_token) {
                authWindow.destroy();
                me.accessToken = access_token;
                me.userId = user_id;
                deffered.resolve();

            }
            return deffered.promise;
        }

    }
    return Vkontakte;
})

;angular.module("sp-app").factory("platform", function($http) {
    const ROOT_URL = "http://www.salmonplayer.com/";//localhost:41449 
    var types = {
        chrome: 'chrome',
        desktop: 'desktop',
        web: 'web'
    }
    var type = null;
    if (window.chrome && window.chrome.app.window) {
        type = types.chrome;
    } else if (window.process && window.process.type) {
        type = types.desktop;
    } else {
        type = types.web;
    }

    return {
        getType: function() {
            return type;
        },
        types: types,
        getAppVersion: function() {
            if(type == types.chrome) {
                return chrome.runtime.getManifest().version;
            } else if(type == types.desktop) {
                // var file = ${__dirname}/index.html
                var pjson = require('./manifest.json');
                return pjson.version;
            } else {
                return "";
            }
        },
        updateUid : function(uid) {
             var issue = JSON.stringify({ Email: "", Uid: uid, Platform:  type});
             $http.post(ROOT_URL+ "api/ActiveUsersApi", issue).then(function(){
                 console.log("uid is updated");
             })
           
        },
        isSupportedMediaFormat: function(extension) {
            return extension === 'mp3' || extension === 'wav' || extension === 'ogg' || extension=='m4a' || extension=="aac";
        },
        rootURL: ROOT_URL
    }
})

;angular.module('sp-app').factory('player', function($q, platform, fileSystem) {
    var player = new Audio();
    var lGain, mGain, hGain;
    // connectGain();
    var repeatModes = {
        repeatOne: 0,
        repeatAll: 1,
        noRepeat: 2
    };

    function percentToSeconds(percent) {
        var time = player.duration;
        var newPos = (time * percent) / 100;
        return newPos;
    }

    function connectGain() {
        var context = new AudioContext();

        var sourceNode = context.createMediaElementSource(player);

        // EQ Properties
        //
        var gainDb = -40.0;
        var bandSplit = [360, 3600];

        var hBand = context.createBiquadFilter();
        hBand.type = "lowshelf";
        hBand.frequency.value = bandSplit[0];
        hBand.gain.value = gainDb;

        var hInvert = context.createGain();
        hInvert.gain.value = -1.0;

        var mBand = context.createGain();

        var lBand = context.createBiquadFilter();
        lBand.type = "highshelf";
        lBand.frequency.value = bandSplit[1];
        lBand.gain.value = gainDb;

        var lInvert = context.createGain();
        lInvert.gain.value = -1.0;

        sourceNode.connect(lBand);
        sourceNode.connect(mBand);
        sourceNode.connect(hBand);

        hBand.connect(hInvert);
        lBand.connect(lInvert);

        hInvert.connect(mBand);
        lInvert.connect(mBand);

        lGain = context.createGain();
        mGain = context.createGain();
        hGain = context.createGain();

        lBand.connect(lGain);
        mBand.connect(mGain);
        hBand.connect(hGain);

        sum = context.createGain();
        lGain.connect(sum);
        mGain.connect(sum);
        hGain.connect(sum);

        sum.connect(context.destination);

    }

    var playerObj = {
        load: function(track) {
            player.src = track.src;
        },
        unload: function() {
            player.src = "";
        },
        stop: function() {
            this.pause();
            this.unload();
        },
        play: function() {



                player.play();
            

            

        },
        obtainDuration: function(track) {

            var audio = new Audio();
            
            return $q(function(resolve, reject) {

                var src = fileSystem.obtainURL(track.file);

                audio.src = src;
                audio.addEventListener('loadedmetadata', function() {

                    if (audio.duration) {
                        resolve(audio.duration);
                    } else {
                        reject(audio.duration);
                    }
                    audio = null;
                    fileSystem.removeURL(src);

                });
            })
        },
        pause: function() {
            player.pause();
        },
        isPlaying: function() {
            return !player.paused;
        },
        setVolume: function(volume) {
            player.volume = volume / 100;
        },
        setCurrentTime: function(currentTimePrecent) {
            player.currentTime = percentToSeconds(currentTimePrecent);
        },
        getDuration: function() {
            return player.duration;
        },
        getCurrentTime: function(reverse) {
            if (!reverse) {
                return player.currentTime;
            } else {
                return this.getDuration() - this.getCurrentTime();
            }
        },
        getVolume: function() {
            return Math.round(player.volume * 100);
        },
        onTimeUpdate: function(callback) {
            player.addEventListener('timeupdate', function() {
                if (callback) {
                    callback();
                }
            });
        },
        volumeOut: function(callback) {
            if(this.isPlaying()) {
             var currVolume = this.getVolume();
                var i = currVolume;
                var fadeOutInterval = setInterval(function() {
                    if (i >= 0) {
                        this.setVolume(i);
                    } else {
                        this.setVolume(currVolume);
                        clearInterval(fadeOutInterval);
                        callback();
                    }
                    i-=2;
                }.bind(this), 1);
            } else {
                callback();
            }
        },
        onEnd: function(callback) {
            player.addEventListener('ended', function() {
                if (callback)
                    callback();
            });
        }
    }
    Object.defineProperty(playerObj, 'repeatModes', {
        get: function() {
            return repeatModes;
        }
    })
    return playerObj;

})

;angular.module('sp-app').factory("searchService", function() {
    return {
        search: function(collection, keyword, prop) {
            keyword = keyword.toLowerCase();
            return collection.filter(function(item) {
                if (item[prop]) {
                    propValue = item[prop].trim().toLowerCase();
                    if (propValue == keyword) {
                        return item;
                    } else {

                        var parts = propValue.split(" ");
                        for (var i = 0; i < parts.length; i++) {
                            if (_.startsWith(parts[i], keyword)) {
                                return item;
                                break;
                            }
                        }
                        var splittedKey = keyword.split(" ");
                        if(splittedKey.length > 1) {
                        	if(propValue.indexOf(keyword) != -1) {
                        		return item;
                        	}
                        }
                    }
                }
            });

        }
    }
})

;angular.module("sp-app").provider("storage", function () {
    

    this.$get = function (platform, chromeStorage, html5Storage) {

        if(platform.getType() == platform.types.chrome) {
            return chromeStorage;
        } else if(platform.getType() == platform.types.desktop) {
            return html5Storage;
        } else if(platform.getType() == platform.types.web) {
            return html5Storage;
        }  
      
    }


})
;angular.module('sp-app').factory('toast', function() {
    const _DURATION = 2500;
    var _toast_container = null;
    var _timeoutId;

    function removeToast() {
         if(!_toast_container) {
            return;
         }
         _toast_container.parentElement.removeChild(_toast_container);
         _toast_container = null;
    }
    return {
        show: function(options) {
            if(_toast_container) {
                _toast_container.parentElement.removeChild(_toast_container);
            }
            clearTimeout(_timeoutId);
            _toast_container = document.createElement('div');
            _toast_container.classList.add('toast_container');
            _toast_container.classList.add('toast_fadein');
            

            var toast = document.createElement('div');
            toast.classList.add('toast');      
            if(options.content) {
                toast.innerHTML = options.content;
            }
            _toast_container.appendChild(toast);

            document.body.appendChild(_toast_container);
            
            if(options.duration == null || options.duration == undefined || isNaN(optios.duration)) {
                options.duration = _DURATION;
            }
            _timeoutId = setTimeout(this.hide, options.duration);

        },
        hide: function() {
            if(!_toast_container) {
                return;
            }
            clearTimeout(_timeoutId);
            
          
            _toast_container.addEventListener('webkitAnimationEnd', removeToast);
            _toast_container.addEventListener('animationEnd', removeToast);
            _toast_container.addEventListener('msAnimationEnd', removeToast);
            _toast_container.addEventListener('oAnimationEnd', removeToast);

            _toast_container.classList.add('toast_fadeout');
        }   
    }
})
;angular.module('sp-app').factory('uidService', function() {
        return {
            generateUid: function(index, random) {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                    var s = v.toString(16);
                    if (random && ((Math.random() * 2 | 0 ) === 1)) {
                        s = s.toUpperCase();
                    }
                    return s;
                });
            }
        };
    }
);
angular.module("sp-app").factory("updateService", function ($http, platform, $q, fileSystem) {
    const ROOT_URL = platform.rootURL;
    return {
        checkForUpdates: function () {
            var deferred = $q.defer();
            var appVersion = platform.getAppVersion();
            $http.get(`${ROOT_URL}api/UpdateApi?version=${appVersion}`).then(function (result) {
                if (result && result.data) {
                    deferred.resolve(result.data);
                }
            }, function () {
                deferred.reject("Update checking problem");
            })
            return deferred.promise;
        },
        checkIfExists: function (filename) {
            var app = require('electron').remote.app;
            var appDataPath = app.getPath("temp");
            var packagePath = appDataPath + "/salmonplayer-update/" + filename + ".exe";
            if(fileSystem.pathExists(packagePath)) {
                return packagePath;
            }

        },
        saveExecutable: function (filename, data) {
            var deferred = $q.defer();
            var app = require('electron').remote.app;
            var appDataPath = app.getPath("temp");
            var fs = require('fs');
            var rootPath = appDataPath + "/salmonplayer-update/";
            if (!fileSystem.pathExists(rootPath)) {
                fs.mkdirSync(rootPath);
            }
            var updatePackagePath = rootPath+filename;
            fs.writeFile(rootPath+filename, data, "binary", function (err) {
                if (err) {
                    deferred.reject();
                } else {
                    deferred.resolve(updatePackagePath);
                }

                
            });            
            return deferred.promise;
        },
        clearExistingPackage: function() {
            var deferred = $q.defer();
            var app = require('electron').remote.app;
            var appDataPath = app.getPath("temp");
            var fs = require('fs');
            var rootPath = appDataPath + "/salmonplayer-update/";
            if (fileSystem.pathExists(rootPath)) {
                fs.readdir(rootPath, function (error, result) {
                    if (error) {
                        deferred.reject();
                        
                    } else {
                        result.forEach(function (item) {
                            var stats = fs.statSync(rootPath + item);
                            if (stats.isFile()) {
                                fs.unlink(rootPath + item, (err) => {
                                    if (err) {
                                        deferred.reject();
                                    } else {
                                        deferred.resolve();
                                    }                                    
                                });
                            }
                        })
                    }
                }) 
            }
            return deferred.promise
        }
    }
})
;angular.module("sp-app").provider("windowManager", function () {
    

    this.$get = function (platform, chromeWindowManager, desktopWindowManager) {

        if(platform.getType() == platform.types.chrome) {
            return chromeWindowManager;
        } else if(platform.getType() == platform.types.desktop) {
            return desktopWindowManager;
        } 
      
    }


})
;angular.module('sp-app').factory('effects', function() {
    function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;
        

        // while (element) {
        //     xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        //     yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        //     element = element.offsetParent;
        // }
        var metrics = element.getBoundingClientRect();
        return {
            x: metrics.left,
            y: metrics.top
        };
    }


    function inkFill(element, x, y) {
       
        var parentPosition = getPosition(element);
        var svg = element.querySelector(".material_ink");
        var ink = svg.getElementsByTagName("circle")[0];        
       
        var xPosition = x - parentPosition.x;
        var yPosition = y - parentPosition.y;
       // var w = element.offsetWidth;
       // var h = element.offsetHeight;
       // var radius = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)); 
        ink.classList.remove('clicked');
        var tid = setTimeout(function() {
            ink.style["cx"] = xPosition;
            ink.style["cy"] = yPosition;
           // ink.style["r"] = radius ;
            ink.classList.add('clicked');
            clearTimeout(tid);
        });
    }
    return {
        ripple: function(element, clientX, clientY) {

            inkFill(element, clientX, clientY);

        }
    }
}).directive('rippleEffect', function(effects){
    return {
        link: function(scope, elem, attrs) {
           
            elem[0].addEventListener('mousedown', function(e){
                 effects.ripple(elem[0], e.clientX, e.clientY);
            })
           
        }
    }
})

;angular.module('sp-app').filter('duration', function(){
	function toHHMMSS(value) {
        var sec_num = parseInt(value, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
       
        if(!Number.isInteger(hours) || !Number.isInteger(minutes) || !Number.isInteger(seconds)){
            return "";
        }
        if (hours   < 10 ) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) { seconds = "0" + seconds; }
        if(hours!='00')
            var time = hours + ':' + minutes + ':' + seconds;
        else {
            time = minutes + ':' + seconds;
        }
        return time;
    }
	return function(input){
		if(_.isNumber(input)) {
			return toHHMMSS(input);
		}
	}
})
;angular.module('sp-app').controller("albumCtrl", function($scope, library, dialogManager){
	$scope.album = library.getOpenAlbum();
  
    $scope.getArtStyles = function() {
        
        var styles = {};
        if ($scope.album) {
            styles = {
                'background-image': 'url(' + $scope.album.albumArtPath + ')'
            };
        } 
        
        return styles;
    }

    $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;

            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
        orderBy: 'number',
        name: 'album'
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.album.tracks) {
            library.setQueue($scope.album.tracks);
        }
    }
})
;angular.module('sp-app').controller('albumsCtrl', function($scope, library, dialogManager, $filter){
	$scope.albums = library.getAlbums();
    $scope.itemApi = {
    	open: function(album){
    		
    		library.setOpenAlbum(album);
    		$scope.navigator.openAlbum = true;
    	},

        openListContextMenu: function(event, album) {
            var scope = $scope.$new();
            scope.selectedItem = album;
            scope.playAlbum = function() {
                library.playTrack(scope.selectedItem.tracks[0]);
                if (library.getQueue() != scope.selectedItem.tracks) {
                    library.setQueue(scope.selectedItem.tracks);
                }
            },
            scope.addToQueue = function () {
                scope.selectedItem.tracks.forEach(function(t) {
                    library.addToQueue(t);
                })
            }
            dialogManager.openDialog({
                template: "app/controls/grid_view/gridContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        filter: function() {
            var keyword = "";
            var items = undefined;
            if($scope.search && $scope.search.albumsSearch) {
                keyword = $scope.search.albumsSearch.toLowerCase();
                //$filter('filter')(array, expression, comparator, anyPropertyKey)

                items = $scope.albums.filter(function(item){
                    return item.name.toLowerCase().indexOf(keyword) != -1 || item.artist.name.toLowerCase().indexOf(keyword) != -1;
                })
                
            } 
            return items;
        },
        name: 'albums'
    }
   
})
;angular.module('sp-app').controller('appCtrl', function($scope, $timeout, $rootScope, player, uidService, dialogManager, library, storage, configFactory, platform, localStorage, updateService) {
    var APP_PREV_HEIGHT = 650;
    var APP_PREV_WIDTH = 450;
    setTimeout(function() {
        storage.get("uid").then(function(uid) {
            var id = "";
            if (!uid) {

                uid = uidService.generateUid();
                id = uid;

            } else {
                id = uid.uid;
            }
            storage.set("uid", { "uid": id });
            platform.updateUid(id);
        })
    }, 2000)

    $rootScope.checkForUpdates = function() {
        if (platform.getType() == platform.types.desktop) {
            $timeout(function() {
                updateService.checkForUpdates().then(function(appVersion) {
                    if (appVersion) {
                        var existingPath = updateService.checkIfExists(appVersion.FileName);
                        if (existingPath) {
                            showUpdateDialog(appVersion, existingPath);
                            return;
                        }
                        var fs = require('fs');
                        var r = new XMLHttpRequest();
                        r.open("GET", platform.rootURL + 'File/Update?currentVersion=' + platform.getAppVersion(), true);
                        r.responseType = 'arraybuffer';
                        r.onload = function(e) {

                            var data = new Buffer(r.response);
                            var filename = r.responseURL.split("/").pop();
                            filename = filename.split("?").shift();
                            updateService.saveExecutable(filename, data).then(function(updatePackagePath) {
                                showUpdateDialog(appVersion, updatePackagePath);
                            });
                        }
                        r.send();

                    } else {
                        updateService.clearExistingPackage();
                    }
                }, function() {
                    updateService.clearExistingPackage();
                });
            }, 3000);
        }
    }

    $rootScope.checkForUpdates();

    function showUpdateDialog(appVersion, packagePath) {
        var scope = $scope.$new();
        scope.version = appVersion.VersionString;
        scope.packagePath = packagePath;
        dialogManager.openDialog({
            template: "app/views/update/updateDialog.html",
            scope: scope,
            autoClose: false,
            backDrop: true
        });
    }
    $scope.isLibraryEmpty = function() {

        return localStorage.getFolders().length == 0 && library.getClouds().length == 0;
    }
    $rootScope.$closeDialog = function() {
        dialogManager.closeDialog();
    }
    $scope.globalKeyDown = function(event) {
        if (event.which == 9 || event.code == 'Tab') {
            event.preventDefault();
        }
        if (event.keyIdentifier == "MediaPlayPause") {
            $rootScope.$broadcast('play-pause', event);
            event.preventDefault();
        }
        if (event.target.tagName !== 'input' && event.target.tagName !== 'textarea') {
            $rootScope.$broadcast('global-key-down', event);
        }
    }
    $scope.globalKeyUp = function(event) {
        if (event.target.tagName !== 'input' && event.target.tagName !== 'textarea') {
            $rootScope.$broadcast('global-key-up', event);
        }
    }
    $scope.globalClick = function(event) {

        $rootScope.$broadcast('global-mouse-click', event);

    }
    $scope.closeApp = function() {
        if (platform.getType() == platform.types.chrome) {
            chrome.app.window.current().close();
        } else {
            // const remote = require('electron').remote;
            // var currentWindow = remote.getCurrentWindow();
            // currentWindow.close();
            const app = require('electron').remote.app;
            app.quit();
        }
    };
    $scope.navigator = {
        openMainMenu: false,
        openMediaSource: false,
        openSettings: false,
        currentView: 'allsongs',
        queueOpen: false,
        openAlbum: false,
        openArtist: false,
        openPlaylist: false,
        openCloud: false,
    };


    $scope.initialized = false;
    configFactory.loadConfiguration().then(function() {
        $scope.initialized = true;
        $scope.settings = configFactory.configuration.settings;
        $scope.playback = configFactory.configuration.playback;
    });
    $scope.$watch(function() {
        return configFactory.configuration;
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.$broadcast('volume-changed');
            configFactory.saveConfiguration();
        }

    }, true);

    $scope.restoreApp = function() {

    };


    $scope.toggleMainMenu = function() {
        $scope.navigator.openMainMenu = !$scope.navigator.openMainMenu;
    }

    $scope.closeMediaSources = function() {
        $scope.navigator.openMediaSource = false;
    };
    $scope.closeSettings = function() {
        $scope.navigator.openSettings = false;
    };
    $scope.isPlaying = function() {
        return player.isPlaying();
    }
    $scope.toggleQueue = function() {

        $scope.navigator.queueOpen = !$scope.navigator.queueOpen;
        if ($scope.navigator.queueOpen) {
            $scope.navigator.openSettings = false;
            $scope.navigator.openMediaSource = false;
        }
    }
    $scope.closeCloud = function() {
        $scope.navigator.openCloud = false;
    }
    $scope.closeAlbumArtist = function() {
        if ($scope.navigator.openAlbum) {
            $scope.closeAlbum();
            return;
        }
        $scope.closeArtist();
    }
    $scope.closeAlbum = function() {
        $scope.navigator.openAlbum = false;
    }
    $scope.closePlaylist = function() {
        $scope.navigator.openPlaylist = false;
    }

    $scope.closeArtist = function() {
        $scope.navigator.openArtist = false;
    }
    $scope.getCurrentTrack = function() {
        return library.getCurrentTrack();
    }
    $scope.getArtStyles = function() {
        var currentTrack = library.getCurrentTrack();
        var styles = {};
        if (currentTrack && $scope.settings.showAlbumArt) {
            styles = {
                'background-image': 'url(' + library.getCurrentTrack().album.albumArtPath + ')'
            };
        }

        return styles;
    }
    if (platform.getType() == platform.types.chrome) {
        window.chrome.app.window.current().onBoundsChanged.addListener(function() {
            $scope.$broadcast('window-resize');

        });
    } else if (platform.getType() == platform.types.desktop) {

        const currentWindow = require('electron').remote.getCurrentWindow();
        currentWindow.on('resize', function() {

            $scope.$broadcast('window-resize');
        })
    }
    $scope.minimizeApp = function() {
        if (platform.getType() == platform.types.chrome) {
            chrome.system.display.getInfo(function(displayInfo) {
                var primary = displayInfo.filter(function(item) {
                    return (item.isPrimary == true);
                });
                var screenInfo = primary[0];

                var APP_MIN_HEIGHT = 60;
                var APP_MIN_WIDTH = 390;
                var bounds = chrome.app.window.current().getBounds();
                APP_PREV_HEIGHT = bounds.height;
                APP_PREV_WIDTH = bounds.width;

                chrome.app.window.current().setBounds({
                    left: screenInfo.workArea.width - APP_MIN_WIDTH,
                    top: screenInfo.workArea.height - APP_MIN_HEIGHT,
                    width: APP_MIN_WIDTH,
                    height: APP_MIN_HEIGHT
                });

            });
        } else if (platform.getType() == platform.types.desktop) {
            const remote = require('electron').remote;
            var APP_MIN_HEIGHT = 60;
            var APP_MIN_WIDTH = 390;

            var currentWindow = remote.getCurrentWindow();
            var bounds = currentWindow.getBounds();
            var screenSize = remote.screen.getPrimaryDisplay().workAreaSize;
            APP_PREV_HEIGHT = bounds.height;
            APP_PREV_WIDTH = bounds.width;
            currentWindow.setBounds({
                x: screenSize.width - APP_MIN_WIDTH,
                y: screenSize.height - APP_MIN_HEIGHT,
                width: APP_MIN_WIDTH,
                height: APP_MIN_HEIGHT
            })
        }
    }
    $scope.restoreApp = function() {
        if (platform.getType() == platform.types.chrome) {
            chrome.system.display.getInfo(function(displayInfo) {
                var primary = displayInfo.filter(function(item) {
                    return (item.isPrimary == true);
                });
                var screenInfo = primary[0];
                if (screenInfo.rotation == 90) {

                }
                //if (APP_PREV_HEIGHT <= 60) APP_PREV_HEIGHT = 650;
                //if (APP_PREV_WIDTH <= 390) APP_PREV_WIDTH = 450;


                chrome.app.window.current().setBounds({
                    left: screenInfo.workArea.width - APP_PREV_WIDTH,
                    top: screenInfo.workArea.height - APP_PREV_HEIGHT,
                    width: APP_PREV_WIDTH,
                    height: APP_PREV_HEIGHT
                });

            });
        } else if (platform.getType() == platform.types.desktop) {
            const remote = require('electron').remote;
            var screenSize = remote.screen.getPrimaryDisplay().workAreaSize;
            var currentWindow = remote.getCurrentWindow();
            currentWindow.setBounds({
                x: screenSize.width - APP_PREV_WIDTH,
                y: screenSize.height - APP_PREV_HEIGHT,
                width: APP_PREV_WIDTH,
                height: APP_PREV_HEIGHT
            })
        }
    }
}).directive("searchbox", function(library) {
    var keyword = "";
    var timeoutID;
    var prevView = "";

    return function($scope, $elem, $attrs) {
      
        $elem[0].addEventListener('keydown', function(e) {

            // if ($scope.navigator.currentView !== "search") {
            //     prevView = $scope.navigator.currentView;
            // }
            if (e.which === 40) {
                e.preventDefault();
                $elem[0].blur();
                $scope.$broadcast('search-key-down');
                return
            }
            if (e.which === 38) {
                //up
                return
            }
            if (e.which === 9) {
                $elem[0].blur();
                e.preventDefault();
            }
            // console.log($scope.navigator.currentView);
            // timeoutID = setTimeout(function () {
            //     clearTimeout(timeoutID);
            //     var searchValue = $elem[0].value.toLowerCase().trim();
            //     if (searchValue != keyword) {
            //         keyword = searchValue;
            //         if (keyword != "") {
            //             $scope.navigator.currentView = "search"
            //             library.createSuggestion($elem[0].value);

            //         } else {
            //             $scope.navigator.currentView = prevView
            //         }
            //         $scope.$apply();
            //     }
            // }, 10);
            // debounced();



        });

    }
})

;angular.module('sp-app').controller("artistCtrl", function($scope, library) {
    $scope.statistics = {};
    $scope.$watch(function() {
        return library.getOpenArtist()
    }, function() {

        $scope.artist = library.getOpenArtist();
        if ($scope.artist && $scope.artist.albums) {
            $scope.statistics.albumsCount = 0;
            $scope.statistics.tracksCount = 0;
            $scope.statistics.albumsCount = $scope.artist.albums.length;
            $scope.artist.albums.forEach(function(album) {
                $scope.statistics.tracksCount += album.tracks.length;
            })
        }
    })
    $scope.itemApi = {
        open: function(album) {
            library.setOpenAlbum(album);
            $scope.navigator.openAlbum = true;
        }
    }
})

;angular.module('sp-app').controller('artistsCtrl', function($scope, library, dialogManager){
	$scope.artists = library.getArtists();
    $scope.itemApi = {
    	open: function(artist){
    		library.setOpenArtist(artist);
    		$scope.navigator.openArtist = true;
    	},
        openListContextMenu: function(event, artist) {
            var scope = $scope.$new();
            scope.selectedItem = artist;
            scope.playAlbum = function() {
                var tracks = [];
                artist.albums.forEach(function(album){
                    album.tracks.forEach(function(track){
                        tracks.push(track);
                    })
                })
                library.playTrack(tracks[0]);
                if (library.getQueue() != tracks) {
                    library.setQueue(tracks);
                }
            }
            scope.addToQueue = function () {
                artist.albums.forEach(function(album){
                    album.tracks.forEach(function(track){
                        library.addToQueue(track);
                    })
                })
               
            }
            dialogManager.openDialog({
                template: "app/controls/grid_view/gridContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        filter: function() {
            var keyword = "";
            var items = undefined;
            if($scope.search && $scope.search.artistsSearch) {
                keyword = $scope.search.artistsSearch.toLowerCase();
                //$filter('filter')(array, expression, comparator, anyPropertyKey)

                items = $scope.artists.filter(function(item){
                    return item.name.toLowerCase().indexOf(keyword) != -1;
                })
                
            } 
            return items;
        },
        name: 'artists'
    }

})
;angular.module("sp-app").controller('cloudCtrl', function($scope, library, dialogManager, $injector, Track, Album, Artist) {
    $scope.$watch(function() {
        return library.getOpenCloud();
    }, function() {

        $scope.cloud = library.getOpenCloud();
        console.log($injector.get('vkontakte'));

    })
    var  foundTracks = [];
    var deboucned = _.debounce(function(newVal) {
        foundTracks = [];
        var service = $injector.get($scope.cloud.name.toLowerCase());
        if (service.search) {
            service.search(newVal).then(function(couldObj) {
                var musicFiles = couldObj.musicFiles;
                var tracks = musicFiles.map(function(musicFile) {
                    var track = new Track(musicFile);
                    couldObj.source.getMetadata(track, true).then(function(metadata) {
                        
                        track.duration = metadata.duration;
                        track.number = metadata.track;
                        track.title = metadata.title || track.title;
                        var artistName = metadata.artist || 'Unknown Artist';

                        var artist = new Artist(artistName);

                        var albumName = metadata.album || 'Unknown Album';


                        var album = new Album(albumName);

                        artist.addAlbum(album);
                        
                        album.addTrack(track);
                        foundTracks.push(track);
                    });
                })
            });
        }
    }, 500)
    $scope.$watch('searchKeyword', function(newVal, oldVal) {
        if (newVal != oldVal) {
            deboucned(newVal);

        }


    })
    $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;

            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
        name: 'cloud'
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.cloud.tracks) {
            library.setQueue($scope.cloud.tracks);
        }
    }
})

;angular.module('sp-app').controller('cloudsCtrl', function($scope, library){
	$scope.clouds = library.getClouds();
    $scope.itemApi = {
    	open: function(cloud) {
    		library.setOpenCloud(cloud);
    		$scope.navigator.openCloud = true;
    	},
        filter: function() {
            var keyword = "";
            var items = undefined;
            if($scope.search && $scope.search.cloudsSearch) {
                keyword = $scope.search.cloudsSearch.toLowerCase();               

                items = $scope.clouds.filter(function(item){
                    return item.name.toLowerCase().indexOf(keyword) != -1;
                })
                
            } 
            return items;
        },
    };
})
;angular.module('sp-app').controller('mediaSourceCtrl', function ($scope, localStorage, googleDrive, dropbox, oneDrive, vkontakte, spotify, library, mediaSources) {
    // $scope.localFolders = localStorage.getFolders();
    $scope.localFolders = localStorage.getFolders();

    $scope.$watch(
        function () {
            return library.getClouds().length;
        },
        function () {

            $scope.gdrive = library.getCloudByName("Google Drive");
            $scope.dropbox = library.getCloudByName("Dropbox");
            $scope.vkontakte = library.getCloudByName("Vkontakte");
            $scope.spotify = library.getCloudByName("Spotify");
            $scope.oneDrive = library.getCloudByName("One Drive");
        })
    $scope.$on('storage-added', function (event, musicStorage) {
        $scope.navigator.openMediaSource = false;
        library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);
    })
    $scope.$on('temp-storage-added', function (event, musicStorage) {
        $scope.navigator.queueOpen = true;
        library.temporary.addMusicFiles(musicStorage.musicFiles, musicStorage.source, true);
    })
    $scope.addLocalFolder = function () {

        localStorage.addFolder();

    }

    $scope.scanLibrary = function () {
        localStorage.scanMediaDevices("yes").then(function(musicStorage) {
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

        });
      
      
    }
    $scope.removeLocalFolder = function (folder) {
        localStorage.removeFolder(folder);
    }
    $scope.removeCloud = function (cloud) {
        if (cloud.name === "Google Drive") {
            googleDrive.remove();
        }
        if (cloud.name === "Dropbox") {
            dropbox.remove();
        }
        if (cloud.name === "Vkontakte") {
            vkontakte.remove();
        }
        if (cloud.name === "Spotify") {
            spotify.remove();
        }
        if (cloud.name === "One Drive") {
            oneDrive.remove();
        }
        library.removeCloud(cloud);
    }
    $scope.enableGoogleDrive = function () {
        googleDrive.initDrive().then(function (musicStorage) {
            $scope.navigator.openMediaSource = false;
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

        });
    };
    $scope.enableDropbox = function () {
        dropbox.initDrive().then(function (musicStorage) {

            $scope.navigator.openMediaSource = false;
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

        });
    }
    $scope.enableVkontakte = function () {
        vkontakte.initDrive().then(function (musicStorage) {
            $scope.navigator.openMediaSource = false;
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);
        });
    }
    $scope.enableSpotify = function () {
        spotify.initDrive().then(function (musicStorage) {
            $scope.navigator.openMediaSource = false;
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);
        });
    }
    $scope.enableOneDrive = function () {
        oneDrive.initDrive().then(function (musicStorage) {
            $scope.navigator.openMediaSource = false;
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);
        });
    }

})

;/// <reference path="../../../vendor/angular/angular.js" />
angular.module('sp-app').controller('menuCtrl', function($scope, dialogManager, windowManager) {

    $scope.openMediaSources = function() {
        $scope.navigator.openMainMenu = false;
        $scope.navigator.queueOpen = false;
        $scope.navigator.openMediaSource = true;
    };

    $scope.openSettings = function() {
        $scope.navigator.openMainMenu = false;
        $scope.navigator.queueOpen = false;
        $scope.navigator.openSettings = true;
    };
    
    $scope.openAboutDialog = function() {

        $scope.navigator.openMainMenu = false;
        
        windowManager.createWindow('about.html', {
            'id': 'about',           
            'width': 380,
            'height': 540,
            // screenshots
            // 'width': 1335,
            // 'height': 834,
            // 'minWidth': 380,
            // 'minHeight': 540,
            // 'maxWidth': 380,
            // 'maxHeight': 540
        });
    };

    $scope.openFeedbackDialog = function() {
        $scope.navigator.openMainMenu = false;
        windowManager.createWindow('feedback.html', {
            'id': 'report',            
            'width': 380,
            'height': 540,
            // screenshots
            // 'width': 1335,
            // 'height': 834,
            'minWidth': 380,
            'minHeight': 540,
            'maxWidth': 380,
            'maxHeight': 540

        });

    };
    $scope.$on('global-mouse-click', function(event) {
        $scope.navigator.openMainMenu = false;
    });

});

angular.module('sp-app').controller('nowPlayingCtrl', function($scope, library, player) {
    $scope.$watch(function() {
        return library.getCurrentTrack();
    }, function() {

        $scope.track = library.getCurrentTrack();
    })
    $scope.timerReversed = true;
    $scope.toggleReverse = function(){
    	$scope.timerReversed = !$scope.timerReversed;
    }
    $scope.getQueue = function() {
        return library.getQueue();
    }
}).directive('currentTime', function(player, $filter) {
    return function($scope, $elem) {
        player.onTimeUpdate(function() {
            var duration = $filter('duration')(player.getCurrentTime($scope.timerReversed));
            var durationArray = duration.split('');
            
            
            $elem[0].children[0].className = durationArray[0];
            $elem[0].children[1].className = durationArray[1];

            $elem[0].children[2].className = "dur_separator";

            $elem[0].children[3].className = durationArray[3];
            $elem[0].children[4].className = durationArray[4];

            // $elem[0].textContent = $filter('duration')(player.getCurrentTime($scope.timerReversed));
        });
        
    }
});

angular.module('sp-app').controller("playbackCtrl", function($scope, player, library, configFactory, dialogManager, toast, localStorage) {

    // $scope.$watch(function() {
    //     return library.getRepeatMode();
    // }, function() {

    //     $scope.repeatMode = library.getRepeatMode();

    // })
    // $scope.$watch(function() {
    //     return library.getShuffle();
    // }, function() {

    //     $scope.shuffle = library.getShuffle();
    // })
    $scope.$on('play-pause', function() {
        $scope.playPause();
    })
    $scope.isPlaying = function() {
        return player.isPlaying();
    }
    $scope.playPause = function() {
       
        if(library.getTracks().length ==0 && library.temporary.getTempTracks().length == 0) {            
            $scope.navigator.openMainMenu = false;
            $scope.navigator.queueOpen = false;
            $scope.navigator.openMediaSource = true;
            return;
        }

        if ($scope.isPlaying()) {
            player.pause();
        } else {
            if(!library.getCurrentTrack()) {
                var tracks = library.getTracks().concat(library.temporary.getTempTracks());
                if (library.getQueue() != $scope.items) {
                    library.setQueue(tracks);
                }
                library.loadTrack(tracks[0]);
            }
            player.play();
        }

    }
    $scope.nextTrack = function() {
        library.nextTrack();
    }
    $scope.prevTrack = function() {

        library.prevTrack();
    }
    $scope.toggleRepeatMode = function() {


        var mode = ((($scope.playback.repeat + 1) % 3) + 3) % 3;
        $scope.playback.repeat = mode;

    }
    $scope.toggleShuffle = function() {
        $scope.playback.shuffle = !$scope.playback.shuffle;
    }
    $scope.playBtnTitle = function() {

        if (player.isPlaying()) {
            return "Pause";
        } else {
            return "Play";
        }
    }
    $scope.repeatBtnTitle = function() {
        if ($scope.playback) {
            if ($scope.playback.repeat == player.repeatModes.repeatOne) {
                return "Repeat One";
            } else if ($scope.playback.repeat == player.repeatModes.repeatAll) {
                return "Repeat All";
            } else {
                return "Repeat Off";
            }
        }
    }
$scope.shuffleBtnTitle = function() {
        if($scope.playback) {
            if($scope.playback.shuffle) {
                
                return "Turn Shuffle Off";
            } else {
                
                return "Turn Shuffle On";
            }
        }
    }
})

;angular.module('sp-app').controller("createNewPlaylistCtrl", function($scope, library, $interval, Playlist) {

    $scope.playlistName = "";
    $scope.savePlaylist = function() {
        if ($scope.playlistName.trim().length != 0) {
            var playlist = new Playlist($scope.playlistName);
            playlist.addTrack($scope.selectedTrack);
            if(library.addPlaylist(playlist)) {
                $scope.closeDialog();
            }
            
        }
    }
})

;angular.module('sp-app').controller("playlistCtrl", function($scope, library, dialogManager){
	
    $scope.$watch(function() {
        return library.getOpenPlaylist();
    }, function() {    	
    	$scope.playlist = library.getOpenPlaylist();      
    })

    $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;
            scope.removeFromPlaylist = function() {
                library.removeFromPlaylist(scope.selectedTrack, $scope.playlist);
            }
            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
        name: 'playlist'
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.tracks) {
            library.setQueue($scope.tracks);
        }
    }
    
})
;angular.module('sp-app').controller('playlistsCtrl', function($scope, library, dialogManager){
	$scope.playlists = library.getPlaylists();
    $scope.itemApi = {
    	open: function(playlist){
    		
    		library.setOpenPlaylist(playlist);
    		$scope.navigator.openPlaylist = true;
    	},
        openListContextMenu: function(event, playlist) {
            var scope = $scope.$new();
            scope.selectedItem = playlist;
            scope.removePlaylist = function() {
                library.removePlaylist(scope.selectedItem);
            }
            dialogManager.openDialog({
                template: "app/controls/grid_view/gridContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        filter: function() {
            var keyword = "";
            var items = undefined;
            if($scope.search && $scope.search.playlistsSearch) {
                keyword = $scope.search.playlistsSearch.toLowerCase();               

                items = $scope.playlists.filter(function(item){
                    return item.name.toLowerCase().indexOf(keyword) != -1;
                })
                
            } 
            return items;
        },
        name: 'playlists'
    }
    
})
;angular.module('sp-app').controller('queueCtrl', function($scope, library, Playlist, dialogManager, playlistsRepository, tracksRepository) {
    var self = this;
    
    $scope.$watch(function() {
            return library.getQueue().length;
        }, function() {
            $scope.tracks = library.getQueue();
            
        })
       
    
    $scope.savePlaylist = function(playlistObj) {
        if (playlistObj.playlistName) {           
            var playlist = new Playlist(playlistObj.playlistName);

            $scope.tracks.forEach(function(track) {
                playlist.addTrack(track);
            })

            library.addPlaylist(playlist);
            playlistObj.playlistName = "";
        }
    }
    $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;

            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
        name: 'queue'
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.tracks) {
            library.setQueue($scope.tracks);
        }
    }
})

;angular.module('sp-app').controller('quickActionsCtrl', function($scope) {
    $scope.openMediaSources = function() {
        $scope.navigator.openMainMenu = false;
        $scope.navigator.queueOpen = false;
        $scope.navigator.openMediaSource = true;
    };
})
;angular.module('sp-app').controller('searchCtrl', function($scope, library, dialogManager) {
    $scope.$watch(function() {
        return library.getSearchResult();
    }, function(result) {
    	items = [];
        if (result) {
            
            result.artists.forEach(function(artist) {
                artist.albums.forEach(function(album) {
                    album.tracks.forEach(function(track) {
                        items.push(track);
                    })
                });
            });
            result.albums.forEach(function(album) {
                album.tracks.forEach(function(track) {
                    if (items.indexOf(track) == -1)
                        items.push(track);
                })
            });
            result.songs.forEach(function(track) {
                if (items.indexOf(track) == -1)
                    items.push(track);
            })
        }
        $scope.searchResult = items;

    });
    
     $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;

            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
        name: 'songs',
        incomingEvent: true
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.tracks) {
            library.setQueue($scope.searchResult);
        }
    }
})

;angular.module('sp-app').controller('settingsCtrl', function($scope, library, toast,  googleDrive, dropbox, vkontakte, spotify, localStorage, storage) {
    $scope.$watch('settings.alwaysTop', function(newVal, oldVal) {
        if (oldVal != newVal) {
            chrome.app.window.current().setAlwaysOnTop(newVal);
        }
    })
    $scope.resetSettings = function() {

        $scope.settings.autoPlay = false;
        $scope.settings.showAlbumArt = true;
        $scope.settings.alwaysTop = false;
        $scope.settings.theme = 'primary.css';

    }
    $scope.clearData = function() {

        googleDrive.remove();

        dropbox.remove();

        vkontakte.remove();

        // spotify.remove();
        localStorage.getFolders().forEach(function(folder) {
            localStorage.removeFolder(folder);
        });
        library.removePlaylists();

        library.removeAllClouds();
        storage.remove('localFilePaths')
        toast.show({content: "The data has been removed"})
    }
})

;angular.module('sp-app').controller('songsCtrl', function($scope, library, dialogManager, localStorage, searchService) {

  
    $scope.tracks = filter(library.getTracks());

    $scope.$watch('search.songsSearch', function(newVal, oldVal) {
        if(newVal != oldVal) {
                $scope.tracks = filter(library.getTracks());
        }
    })
    function filter() {        
            var keyword = "";
            var items = undefined;
            if($scope.search && $scope.search.songsSearch) {
                var keyword = $scope.search.songsSearch;
                var artistsResult = searchService.search(library.getArtists(), keyword, "name");
                var albumsResult = searchService.search(library.getAlbums(), keyword, "name");
                var songsResult = searchService.search(library.getTracks(), keyword, "title");
                items = [];
                searchResult = {
                    artists: artistsResult,
                    albums: albumsResult,
                    songs: songsResult
                }
               
                searchResult.artists.forEach(function(artist) {
                artist.albums.forEach(function(album) {
                    album.tracks.forEach(function(track) {
                        items.push(track);
                    })
                });
                });
                searchResult.albums.forEach(function(album) {
                    album.tracks.forEach(function(track) {
                        if (items.indexOf(track) == -1)
                            items.push(track);
                    })
                });
                searchResult.songs.forEach(function(track) {
                    if (items.indexOf(track) == -1)
                        items.push(track);
                })

            }
            if(items) {
                return items;
            } else {
                return library.getTracks();
            }
            
        }
    $scope.itemApi = {
        openListContextMenu: function(event, track) {
            var scope = $scope.$new();
            scope.selectedTrack = track;

            dialogManager.openDialog({
                template: "app/controls/track_list/listContextMenu.html",
                x: event.pageX,
                y: event.pageY,
                scope: scope,
                autoClose: true
            });
        },
        goToAlbum: function(track) {
            library.setOpenAlbum(track.album);
            $scope.navigator.openAlbum = true;
        },
      
        incomingEvent: true,
        name: 'songs'
    }
    $scope.playTrack = function(track) {

        library.playTrack(track);
        if (library.getQueue() != $scope.tracks) {
            library.setQueue($scope.tracks);
        }
    }
    $scope.scanLibrary = function() {
        localStorage.scanMediaDevices("yes").then(function(musicStorage) {
            library.addMusicFiles(musicStorage.musicFiles, musicStorage.source);

        });
    }
});

/// <reference path="../../../vendor/angular/angular.js" />
angular.module('sp-app').controller('tabCtrl', function ($scope) {
    
    $scope.setCurrentView = function (view) {
        $scope.navigator.currentView = view;       
    };
    $scope.getCurrentView = function(){
        return $scope.navigator.currentView;
    }

});
angular.module('sp-app').controller("updateDialogCtrl", function($scope) {    
   $scope.installUpdate = function() {     
       var shell = require("electron").shell;
       shell.openItem($scope.packagePath);
       $scope.closeApp();

   }
})
;
//# sourceMappingURL=app.js.map