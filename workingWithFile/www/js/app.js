// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova']).run(function($ionicPlatform, $cordovaFile) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})
angular.module('starter').constant('dbConfig', {
    dbName: 'bookmarkDb',
    dbVersion: 5,
    dbIsReadOnly: '1',
    dbModeReadWrite: 'readwrite',
    dbModeReadOnly: 'readonly',
    dbTimeout: 2000
});
angular.module('starter').factory('dbService', ['$rootScope', '$q', 'dbConfig', function($rootScope, $q, dbConfig) {
    var model = {};
    model.openDb = function() {
        var q = $q.defer();
        var dbreq = window.indexedDB.open(dbConfig.dbName, dbConfig.dbVersion);
        dbreq.onsuccess = function(event) {
            console.log('connect db success');
            q.resolve(event.target.result);
        };
        dbreq.onerror = function(event) {
            console.log("indexedDB.open Error: " + event.message);
            q.reject(event);
        };
        dbreq.onupgradeneeded = function(event) {
            console.log('upgrade');
            var db = event.target.result;
            var params = {
                name: "bookmarks",
                keyPath: "bookmark",
                autoIncrement: false
            };
            model.createObjectStore(db, params);
        };
        return q.promise;
    };
    model.createObjectStore = function(db, params) {
        if (!db.objectStoreNames.contains(params.name)) {
            var objectStore = db.createObjectStore(params.name, {
                keyPath: params.keyPath
            }, params.autoIncrement);
            // objectStore.createIndex("bookmark", "bookmark", {
            //     unique: false
            // });
        }
    };
    model.addRecord = function(db, table, record) {
        var q = $q.defer();
        var transaction = db.transaction([table], dbConfig.dbModeReadWrite, dbConfig.dbTimeout);
        var store = transaction.objectStore(table);
        var request = store.add(record);
        request.onerror = function(e) {
            console.log("Error", e.target.error.name);
            q.reject(event);
            //some type of error handler
        };
        request.onsuccess = function(event) {
            q.resolve(event);
            console.log("Woot! Did it");
        }
        return q.promise;
    };
    model.getRecords = function(db, table) {
        var q = $q.defer();
        var transaction = db.transaction([table], dbConfig.dbModeReadOnly, dbConfig.dbTimeout);
        var store = transaction.objectStore(table);
        var cursorReq = store.openCursor();
        cursorReq.onsuccess = function(e) {
            var res = e.target.result;
            var list = [];
            if (res) {
                list.push(angular.fromJson(res.value.bookmark));
                res.continue();
            } else {
                console.log("Got all customers: ", list);
            }
            q.resolve(list);
        }
        cursorReq.onerror = function(e) {
            console.log("Error", e.target.error.name);
            q.reject(event);
            //some type of error handler
        };
        return q.promise;
    };
    model.getRecord = function(db, table, value) {
        var q = $q.defer();
        var transaction = db.transaction([table], dbConfig.dbModeReadOnly, dbConfig.dbTimeout);
        var store = transaction.objectStore(table);
        store.get(value);
        store.onsuccess = function(e) {
            q.resolve(e);
        }
        store.onerror = function(e) {
            console.log("Error", e.target.error.name);
            q.reject(event);
            //some type of error handler
        };
        return q.promise;
    };
    return model;
}]);
angular.module('starter').factory('$serviceCommon', ['$q', function($q) {
    var model = {
        getDisplayListByEntry: function(entry) {
            var q = $q.defer();
            var directoryReader = entry.createReader();
            // Get a list of all the entries in the directory
            directoryReader.readEntries(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        },
        getMetadata: function(entry) {
            var q = $q.defer();
            entry.getMetadata(function(result) {
                q.resolve(result)
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        },
        getFileMetadata: function(entry) {
            var q = $q.defer();
            entry.file(function(result) {
                q.resolve(result)
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        },
        getParent: function(entry) {
            var q = $q.defer();
            entry.getParent(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        }
    };
    return model;
}]);
angular.module('starter').controller('mainCtrl', ['$serviceCommon', '$scope', '$filter', '$window', '$cordovaFile', '$ionicPlatform', '$cordovaFileOpener2', '$cordovaZip', '$ionicPopup', '$timeout', '$cordovaToast', '$ionicSideMenuDelegate', '$ionicLoading', 'dbService',
    function($serviceCommon, $scope, $filter, $window, $cordovaFile, $ionicPlatform, $cordovaFileOpener2, $cordovaZip, $ionicPopup, $timeout, $cordovaToast, $ionicSideMenuDelegate, $ionicLoading, dbService) {
        $scope.model = {
            displayListSearch: [],
            bookmarks: [],
            constant: {
                rootDirectory: "file:///storage/emulated/0/"
            },
            displayList: [{
                isFile: true,
                isDirectory: false,
                name: 'file',
                url: 'file.png'
            }]
        };
        $scope.init = function() {
            // dbService.openDb().then(function(success) {
            //     console.log(success);
            //     dbService.getRecords(success, 'bookmarks').then(function(list) {
            //         console.log('record', list);
            //     }, function(err) {});
            // }, function(err) {});
            if (angular.isDefined(localStorage.bookmarks)) {
                $scope.model.bookmarks = angular.fromJson(localStorage.bookmarks);
            }
            $scope.defineExitApp();
            $cordovaFile.getFreeDiskSpace().then(function(success) {
                console.log(success / (1024 * 1024) + 'GB');
                // success in kilobytes
            }, function(error) {
                // error
            });
            $scope.getDisplayList(cordova.file.externalRootDirectory, "");
        };
        $scope.$watch('$destroy', function() {
            console.log('destroy');
        });
        $scope.defineExitApp = function() {
            $scope.doubleClick = false;
            $ionicPlatform.registerBackButtonAction(function(event) {
                if ($scope.model.currentEntry.nativeURL == $scope.model.constant.rootDirectory) {
                    if ($scope.doubleClick == false) {
                        $cordovaToast.show('Press again to exit', 'short', 'bottom');
                        $scope.doubleClick = true;
                    } else {
                        (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
                    }
                    $timeout(function() {
                        $scope.doubleClick = false
                    }, 500);
                } else {
                    $scope.backFolder($scope.model.currentEntry);
                }
            }, 100);
        };
        $scope.getDisplayList = function(path, dir) {
            $cordovaFile.checkDir(path, dir).then(function(result) {
                // success
                $scope.model.currentEntry = result;
                $scope.getDisplayListByEntry(result);
            }, function(error) {
                // error
                console.log(error);
            });
        };
        $scope.getDisplayListByEntry = function(entry) {
            // Get a list of all the entries in the directory
            $serviceCommon.getDisplayListByEntry(entry).then(function(result) {
                $scope.model.displayList = result;
                $scope.model.displayList = $scope.formatDisplay($scope.model.displayList);
            }, function(err) {});
        };
        $scope.formatItem = function(item) {
            var urlImg = 'folder_red.png';
            if (item.isFile) {
                if (item.name.lastIndexOf('.zip') > -1) {
                    urlImg = 'zip.png';
                } else if (item.name.lastIndexOf('.pdf') > -1) {
                    urlImg = 'pdf.png';
                } else if (item.name.lastIndexOf('.xls') > -1 || item.name.lastIndexOf('.xlsx') > -1) {
                    urlImg = 'excel.png';
                } else if (item.name.lastIndexOf('.doc') > -1 || item.name.lastIndexOf('.docx') > -1) {
                    urlImg = 'word.png';
                } else if (item.name.lastIndexOf('.txt') > -1) {
                    urlImg = 'text.png';
                } else if (item.name.lastIndexOf('.apk') > -1) {
                    urlImg = 'apk.png';
                } else if (item.name.lastIndexOf('.mp3') > -1) {
                    urlImg = 'mp3.png';
                } else if (item.name.lastIndexOf('.mp4') > -1 || item.name.lastIndexOf('.flv') > -1) {
                    urlImg = 'movie.png';
                } else {
                    urlImg = 'file.png';
                }
            }
            return {
                fullPath: item.fullPath,
                isDirectory: item.isDirectory,
                isFile: item.isFile,
                name: item.name,
                nativeURL: item.nativeURL,
                urlImg: urlImg,
                entry: item
            };
        };
        $scope.sortList = function(list) {
            var orderBy = $filter('orderBy');
            return orderBy(list, ['isFile', 'name', 'isDirectory', 'name'], false);
        };
        $scope.formatDisplay = function(list, isSearchFile) {
            list = list.map(function(item) {
                return $scope.formatItem(item);
            });
            list = $scope.sortList(list);
            if (isSearchFile == true) {
                return list;
            }
            angular.forEach(list, function(item) {
                if (item.isFile == true) {
                    $serviceCommon.getFileMetadata(item.entry).then(function(result) {
                        var size = Number(result.size / 1024).toFixed();
                        if (size > 1024) {
                            size = Number(size / 1024).toFixed(2);
                            if (size > 1024) {
                                size = Number(size / 1024).toFixed(2) + 'GB';
                            } else {
                                size += 'MB';
                            }
                        } else {
                            size += 'KB';
                        }
                        item.size = size;
                        item.modificationTime = $filter('date')(result.modificationTime, 'dd-MM-yyyy');
                        item.type = result.type;
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    $serviceCommon.getMetadata(item.entry).then(function(result) {
                        var size = Number(result.size / 1024).toFixed();
                        if (size > 1024) {
                            size = Number(size / 1024).toFixed(2);
                            if (size > 1024) {
                                size = Number(size / 1024).toFixed(2) + 'GB';
                            } else {
                                size += 'MB';
                            }
                        } else {
                            size += 'KB';
                        }
                        item.size = size;
                        item.modificationTime = $filter('date')(result.modificationTime, 'dd-MM-yyyy');
                    }, function(err) {
                        console.log(err);
                    });
                }
            });
            return list;
        };
        $scope.selectEntry = function(item) {
            console.log(item);
            if (item.isFile) {
                $scope.openFile(item);
            } else {
                $scope.openFolder(item.entry);
            }
        };
        $scope.openFile = function(item) {
            if (item.name.lastIndexOf('.zip') > -1) {
                $scope.openZipFile(item);
                // } else if (item.name.lastIndexOf('.pdf') > -1) {
                //     $scope.openPdfFile(item);
                // } else if (item.name.lastIndexOf('.xls') > -1 || item.name.lastIndexOf('.xlsx') > -1) {
                //     window.plugins.fileOpener.open(item.nativeURL);
                // } else if (item.name.lastIndexOf('.doc') > -1 || item.name.lastIndexOf('.docx') > -1) {
                //     window.plugins.fileOpener.open(item.nativeURL);
                // } else if (item.name.lastIndexOf('.txt') > -1) {
                //     window.plugins.fileOpener.open(item.nativeURL);
                // } else if (item.name.lastIndexOf('.apk') > -1) {
                //     $scope.openApkFile(item);
            } else if (item.name.lastIndexOf('.mp3') > -1) {
                window.plugins.fileOpener.open(item.nativeURL);
                // } else if (item.name.lastIndexOf('.mp4') > -1 || item.name.lastIndexOf('.flv') > -1) {
                //     window.plugins.fileOpener.open(item.nativeURL);
                // } else if (item.name.lastIndexOf('.jpg') > -1 || item.name.lastIndexOf('.png') > -1) {
                //     window.plugins.fileOpener.open(item.nativeURL);
            } else {
                $scope.openOrtherFile(item);
            }
        };
        $scope.openOrtherFile = function(item) {
            $cordovaFileOpener2.open(item.nativeURL, item.type).then(function() {
                // file opened successfully
            }, function(err) {
                // An error occurred. Show a message to the user
            });
        };
        $scope.openZipFile = function(item) {
            var params = {
                title: 'Unzip'
            };
            $scope.showListEntryForAction(params, function(res) {
                if (res == true) {
                    $scope.unZip(item);
                }
            });
        };
        $scope.unZip = function(item) {
            $scope.model.popupProgressBar = $ionicPopup.show({
                templateUrl: './templates/progressBar.html',
                title: 'Unzip',
                scope: $scope
            });
            $scope.model.popupProgressBar.then(function(res) {
                console.log('Tapped!', res);
            });
            $cordovaZip.unzip(item.nativeURL, // https://github.com/MobileChromeApps/zip/blob/master/tests/tests.js#L32
                $scope.model.currentEntryForAction.nativeURL // https://github.com/MobileChromeApps/zip/blob/master/tests/tests.js#L45
            ).then(function() {
                console.log('success');
                $scope.getDisplayListByEntry($scope.model.currentEntry);
                $timeout(function() {
                    $scope.model.popupProgressBar.close();
                }, 1000);
            }, function() {
                console.log('error');
            }, function(progressEvent) {
                // https://github.com/MobileChromeApps/zip#usage
                console.log(progressEvent);
                $scope.model.progressBar = Number(progressEvent.loaded * 100 / progressEvent.total).toFixed(0);
            });
        };
        $scope.openApkFile = function(item) {
            $cordovaFileOpener2.open(item.nativeURL, 'application/vnd.android.package-archive').then(function() {
                // Success!
            }, function(err) {
                // An error occurred. Show a message to the user
            });
        };
        $scope.openFolder = function(entry) {
            $scope.model.currentEntry = entry;
            $scope.getDisplayListByEntry(entry);
        };
        $scope.backFolder = function(entry) {
            $serviceCommon.getParent(entry).then(function(result) {
                $scope.model.currentEntry = result;
                $scope.getDisplayListByEntry(result);
                $scope.model.showInfoSearch = false;
            }, function(err) {});
        };
        $scope.stopClick = function() {
            event.stopPropagation();
        };
        $scope.showMenuLeft = function($event) {
            $scope.model.popupActionList = $ionicPopup.show({
                templateUrl: './templates/actionList.html',
                title: 'Action',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }]
            });
            $scope.model.popupActionList.then(function(res) {
                console.log('Tapped!', res);
            });
        };
        $scope.getDisplayListEntryForActionByEntry = function(entry) {
            $serviceCommon.getDisplayListByEntry(entry).then(function(result) {
                $scope.model.displayListEntryForAction = result;
                $scope.model.displayListEntryForAction = $scope.formatDisplay($scope.model.displayListEntryForAction);
            }, function(err) {});
        };
        $scope.showListEntryForAction = function(params, fnCallback) {
            $cordovaFile.checkDir(cordova.file.externalRootDirectory, "").then(function(result) {
                // success
                $scope.model.currentEntryForAction = result;
                $scope.getDisplayListEntryForActionByEntry(result);
            }, function(error) {
                // error
                console.log(error);
            });
            $scope.model.popupListEntryForAction = $ionicPopup.show({
                templateUrl: './templates/displayListEntryForAction.html',
                title: params.title + ' to',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>' + params.title + ' here</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        return true;
                    }
                }]
            });
            $scope.model.popupListEntryForAction.then(function(res) {
                console.log('Tapped!', res);
                $scope.model.popupListEntryForAction.close();
                fnCallback(res);
            });
        };
        $scope.actionType = function(type, item, newName, toEntry) {
            var parentName = item.nativeURL.substring(0, item.nativeURL.lastIndexOf('/') + 1);
            $cordovaFile[type](parentName, item.name, toEntry.nativeURL, newName).then(function(success) {
                // success
                console.log(success);
                $scope.checkClosePopupActionList();
            }, function(error) {
                // error
                console.log(error);
                $scope.checkClosePopupActionList();
            });
        };
        $scope.checkClosePopupActionList = function() {
            $scope.model.totalRemove++;
            if ($scope.model.totalSelect == $scope.model.totalRemove) {
                $scope.model.popupActionList.close();
                $scope.getDisplayListByEntry($scope.model.currentEntry);
                $scope.model.loading.hide();
            }
        };
        $scope.selectEntryForAction = function(item) {
            $scope.model.currentEntryForAction = item.entry;
            $scope.getDisplayListEntryForActionByEntry(item.entry);
        };
        $scope.selectActionDeleteSelections = function() {
            if (!angular.isDefined($scope.showConfirmDelete)) {
                $scope.showConfirmDelete = function(fnCallback) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Delete selections',
                        template: 'Are you want to delete?'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            console.log('You are sure');
                            fnCallback();
                        } else {
                            console.log('You are not sure');
                        }
                    });
                };
            }
            $scope.showConfirmDelete(function() {
                var totalSelect = 0;
                var totalRemove = 0;
                $scope.model.displayList.forEach(function(item) {
                    $scope.model.loading = $ionicLoading.show({
                        showBackdrop: false
                    });
                    if (item.selected == true) {
                        totalSelect++;
                        if (item.isFile) {
                            $cordovaFile.removeFile($scope.model.currentEntry.nativeURL, item.name).then(function(success) {
                                // success
                                totalRemove++;
                                if (totalSelect == totalRemove) {
                                    $scope.getDisplayListByEntry($scope.model.currentEntry);
                                    $scope.model.popupActionList.close();
                                    $scope.model.loading.hide();
                                }
                            }, function(error) {
                                // error
                            });
                        } else {
                            $cordovaFile.removeRecursively($scope.model.currentEntry.nativeURL, item.name).then(function(success) {
                                // success
                                totalRemove++;
                                if (totalSelect == totalRemove) {
                                    $scope.getDisplayListByEntry($scope.model.currentEntry);
                                    $scope.model.popupActionList.close();
                                    $scope.model.loading.hide();
                                }
                            }, function(error) {
                                // error
                                console.log(error);
                            });
                        }
                    }
                });
            });
        };
        $scope.selectActionMoveSelections = function() {
            $scope.model.totalSelect = 0;
            $scope.model.totalRemove = 0;
            var params = {
                title: 'Move'
            };
            $scope.showListEntryForAction(params, function(res) {
                if (res == true) {
                    $scope.model.loading = $ionicLoading.show({
                        showBackdrop: false
                    });
                    angular.forEach($scope.model.displayList, function(item) {
                        if (item.selected == true) {
                            $scope.model.totalSelect++;
                            if (item.isFile == true) {
                                $scope.actionType("moveFile", item, '', $scope.model.currentEntryForAction);
                            } else {
                                $scope.actionType("moveDir", item, '', $scope.model.currentEntryForAction);
                            }
                        }
                    });
                }
            });
        };
        $scope.selectActionCopySelections = function() {
            $scope.model.totalSelect = 0;
            $scope.model.totalRemove = 0;
            var params = {
                title: 'Copy'
            };
            $scope.showListEntryForAction(params, function(res) {
                if (res == true) {
                    $scope.model.loading = $ionicLoading.show({
                        showBackdrop: false
                    });
                    angular.forEach($scope.model.displayList, function(item) {
                        if (item.selected == true) {
                            $scope.model.totalSelect++;
                            if (item.isFile == true) {
                                $scope.actionType("copyFile", item, '', $scope.model.currentEntryForAction);
                            } else {
                                $scope.actionType("copyDir", item, '', $scope.model.currentEntryForAction);
                            }
                        }
                    });
                }
            });
        };
        $scope.selectActionNewFolder = function() {
            var params = {
                title: 'please type folder\'s name',
                value: 'new folder'
            };
            $scope.showPopupInput(params, function(input) {
                if (angular.isDefined(input)) {
                    $cordovaFile.createDir($scope.model.currentEntry.nativeURL, input, false).then(function(success) {
                        // success
                        console.log(success);
                        $scope.getDisplayListByEntry($scope.model.currentEntry);
                        $scope.model.popupActionList.close();
                    }, function(error) {
                        // error
                        console.log(error);
                        $scope.model.popupActionList.close();
                    });
                }
            });
        };
        $scope.selectActionNewFile = function() {
            var params = {
                title: 'please type file\'s name',
                value: 'new file'
            };
            $scope.showPopupInput(params, function(input) {
                $cordovaFile.createFile($scope.model.currentEntry.nativeURL, input, true).then(function(success) {
                    // success
                    $scope.getDisplayListByEntry($scope.model.currentEntry);
                    $scope.model.popupActionList.close();
                }, function(error) {
                    // error
                    console.log(error);
                    $scope.model.popupActionList.close();
                });
            });
        };
        $scope.selectActionSelectAll = function() {
            angular.forEach($scope.model.displayList, function(item) {
                item.selected = true;
            });
            $scope.model.popupActionList.close();
        };
        $scope.selectActionDeselectAll = function() {
            angular.forEach($scope.model.displayList, function(item) {
                item.selected = false;
            });
            $scope.model.popupActionList.close();
        };
        $scope.selectActionRefresh = function() {
            $scope.getDisplayListByEntry($scope.model.currentEntry);
            $scope.model.popupActionList.close();
        };
        $scope.selectActionAddBoomark = function() {
            console.log($scope.model.currentEntry);
            $scope.model.bookmarks.push($scope.model.currentEntry);
            localStorage.bookmarks = angular.toJson($scope.model.bookmarks, true);
            $scope.model.popupActionList.close();
            // dbService.openDb().then(function(success) {
            //     var db = success;
            //     dbService.addRecord(db, 'bookmarks', {
            //         bookmark: angular.toJson($scope.model.currentEntry)
            //     });
            // }, function(err) {});
        };
        $scope.selectActionRename = function() {
            $scope.model.totalSelect = 0;
            $scope.model.totalRemove = 0;
            var params = {
                title: 'please type new name',
                value: ''
            };
            $scope.showPopupInput(params, function(newName) {
                if (angular.isDefined(newName)) {
                    $scope.model.loading = $ionicLoading.show({
                        showBackdrop: false
                    });
                    angular.forEach($scope.model.displayList, function(item) {
                        if (item.selected == true) {
                            $scope.model.totalSelect++;
                            if (item.isFile == true) {
                                $scope.actionType("moveFile", item, $scope.model.totalSelect < 2 ? newName : newName + $scope.model.totalSelect, $scope.model.currentEntry);
                            } else {
                                $scope.actionType("moveDir", item, $scope.model.totalSelect < 2 ? newName : newName + $scope.model.totalSelect, $scope.model.currentEntry);
                            }
                        }
                    });
                }
            });
        };
        $scope.backFolderForAction = function(entry) {
            $serviceCommon.getParent(entry).then(function(result) {
                $scope.model.currentEntryForAction = result;
                $scope.getDisplayListEntryForActionByEntry(result);
            }, function(err) {});
        };
        $scope.showPopupInput = function(params, fnCallback) {
            // An elaborate, custom popup
            $scope.model.inputModelTextbox = params.value;
            $scope.model.popupInput = $ionicPopup.show({
                template: '<input type="text" ng-model="model.inputModelTextbox" class="ionic-text" autofocus>',
                title: params.title,
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Done</b>',
                    type: 'button-calm',
                    onTap: function(e) {
                        return $scope.model.inputModelTextbox;
                    }
                }, ]
            });
            $scope.model.popupInput.then(function(res) {
                console.log('Tapped!', res);
                // $scope.model.inputModelTextbox = res;
                $scope.model.popupInput.close();
                fnCallback(res);
            });
        };
        $scope.getListFolderByEntry = function(entry, fnCallback) {
            if ($scope.model.cancelSearch == true) {
                $scope.getDisplayListByEntry($scope.model.currentEntry);
                return;
            }
            $serviceCommon.getDisplayListByEntry(entry).then(function(result) {
                fnCallback(result);
            }, function(err) {});
        };
        $scope.checkIsFileOrFolder = function(item, type) {
            $scope.model.totalSearch++;
            if ($scope.model.cancelSearch == true) {
                $scope.getDisplayListByEntry($scope.model.currentEntry);
                return;
            }
            if (item.name.toLowerCase().indexOf(type) > -1) {
                // $scope.model.displayListSearch.push(item);
                // $scope.model.displayList = $scope.formatDisplay(angular.copy($scope.model.displayListSearch), false);
                $scope.model.displayList.push($scope.formatItem(item));
                $scope.model.displayList = $scope.sortList($scope.model.displayList);
            }
            if (item.isFile == false) {
                $scope.getListFolderByEntry(item, function(list) {
                    $scope.model.totalEntry += list.length;
                    angular.forEach(list, function(itemChild) {
                        $scope.checkIsFileOrFolder(itemChild, type);
                    });
                });
            }
            //  else {
            //     if ($scope.model.totalEntry > 0 && $scope.model.totalEntry == $scope.model.totalSearch) {
            //         $scope.model.loading.hide();
            //         $cordovaToast.show('search complete!', 'short', 'bottom');
            //         $scope.model.showInfoSearch = false;
            //         // $scope.model.displayList = $scope.formatDisplay($scope.model.displayListSearch, false);
            //     }
            // }
            $scope.model.currentSearch = item.nativeURL;
        };
        $scope.clickOnSearchType = function(type) {
            // $scope.model.loading = $ionicLoading.show({
            //     showBackdrop: false
            // });
            $scope.model.showControlSearch = !$scope.model.showControlSearch;
            $scope.getListFolderByEntry($scope.model.currentEntry, function(list) {
                $scope.model.totalEntry += list.length;
                angular.forEach(list, function(item) {
                    if ($scope.model.cancelSearch == true) {
                        $scope.getDisplayListByEntry($scope.model.currentEntry);
                        return;
                    }
                    $scope.checkIsFileOrFolder(item, type);
                });
            });
        };
        $scope.showPopupSearch = function() {
            var params = {
                title: 'input value search',
                value: ''
            };
            $scope.showPopupInput(params, function(res) {
                if (angular.isDefined(res)) {
                    $scope.model.displayList = [];
                    $scope.model.displayListSearch = [];
                    $scope.model.showInfoSearch = true;
                    $scope.model.totalEntry = 0;
                    $scope.model.totalSearch = 0;
                    $timeout(function() {
                        $scope.clickOnSearchType(res);
                    }, 1000);
                }
            });
        };
        $scope.showSideMenuLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
        $scope.removeBookmark = function(index) {
            $scope.model.bookmarks.splice(index, 1);
            localStorage.bookmarks = angular.toJson($scope.model.bookmarks, true);
        };
        $scope.selectBookmark = function(entry) {
            // $scope.model.currentEntry = entry;
            $scope.getDisplayList(entry.nativeURL);
            $ionicSideMenuDelegate.toggleLeft();
            $scope.model.showInfoSearch = false;
        };
        $ionicPlatform.ready(function() {
            $scope.init();
        });
    }
]);
angular.module('starter').directive('checkMultiSelect', function() {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            scope.model.multiSelect = false;
            scope.$watch(iAttrs.ngModel, function(newValue, oldValue) {
                var newList = scope.model.displayList.filter(function(item) {
                    return (item.selected == true);
                });
                if (newList != null && newList.length > 1) {
                    scope.model.multiSelect = true;
                } else {
                    scope.model.multiSelect = false;
                }
            });
        },
    };
});