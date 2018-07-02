// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngAnimate', 'ngCordova', 'commonModule', 'ngMessages', 'commonDTA']).run(function($ionicPlatform) {
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
});
angular.module('starter').config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('main', {
        url: '/main',
        templateUrl: 'templates/main.html'
    }).state('actionSheetWordListLearn', {
        url: '/actionSheetWordListLearn',
        templateUrl: 'templates/actionSheetWordListLearn.html'
    }).state('addNewWords', {
        url: '/addNewWords',
        templateUrl: 'templates/addNewWords.html'
    }).state('allWordOfClass', {
        url: '/allWordOfClass',
        templateUrl: 'templates/allWordOfClass.html'
    }).state('classContent', {
        url: '/classContent',
        templateUrl: 'templates/classContent.html'
    }).state('createLesson', {
        url: '/createLesson',
        templateUrl: 'templates/createLesson.html'
    }).state('listDoExercises', {
        url: '/listDoExercises',
        templateUrl: 'templates/listDoExercises.html'
    }).state('mainLesson', {
        url: '/mainLesson',
        templateUrl: 'templates/mainLesson.html'
    }).state('manageLessons', {
        url: '/manageLessons',
        templateUrl: 'templates/manageLessons.html'
    }).state('wordListLearn', {
        url: '/wordListLearn',
        templateUrl: 'templates/wordListLearn.html'
    }).state('wordsNotLearnYet', {
        url: '/wordsNotLearnYet',
        templateUrl: 'templates/wordsNotLearnYet.html'
    }).state('doExercisesNeedList', {
        url: '/doExercisesNeedList',
        templateUrl: 'templates/doExercisesNeedList.html'
    }).state('setting', {
        url: '/setting',
        templateUrl: 'templates/setting.html'
    }).state('profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html'
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/main');
});
angular.module('starter').controller('mainCtrl', ['$rootScope', '$scope', '$commonSql', '$DTA', '$ionicSideMenuDelegate', '$ionicPlatform', '$ionicPopup', '$cordovaToast', '$ionicModal', '$timeout', '$ionicPopover', '$cordovaLocalNotification', '$cordovaVibration', '$window', '$ionicScrollDelegate', '$ionicLoading', '$cordovaFile',
    function($rootScope, $scope, $commonSql, $DTA, $ionicSideMenuDelegate, $ionicPlatform, $ionicPopup, $cordovaToast, $ionicModal, $timeout, $ionicPopover, $cordovaLocalNotification, $cordovaVibration, $window, $ionicScrollDelegate, $ionicLoading, $cordovaFile) {
        $scope.model = {};
        $scope.initModel = function() {
            $scope.model = {
                mainView: '#/main',
                view: '#/main',
                viewList: ['#/main'],
                classList: [],
                wordList: [],
                lessonList: [],
                lessonListOfClass: [],
                newWordList: [],
                newWordListTmp: [],
                words: [],
                classes: [],
                fibonacci: [],
                needExercisesCount: 0,
                doExercisesNeedList: [],
                maxCountLearn: 10,
                countWordsOfLesson: 5,
                rootDirectory: 'file:///storage/emulated/0/',
                search: {}
            };
            $scope.model.loading = $ionicLoading;
        };
        $ionicPlatform.ready(function() {
            $scope.init();
        });
        $scope.init = function() {
            $scope.initModel();
            $scope.defineExitApp();
            $commonSql.openDb().then(function(db) {
                // localStorage.clear();
                $scope.db = db;
                $scope.createTableNeeded(db);
                if (angular.isUndefined(localStorage.user) || localStorage.user == 'null') {
                    $scope.showLogin();
                } else {
                    $scope.loginSubmit(angular.fromJson(localStorage.user));
                }
            }, function(err) {});
        };
        $scope.showLogin = function() {
            if (angular.isDefined($scope.sigupModal)) {
                $timeout(function() {
                    $scope.model.username = null;
                    $scope.model.password = null;
                    $scope.model.confirmPassword = null;
                    $scope.model.email = null;
                    if (angular.isDefined($scope.sigupForm)) {
                        $scope.sigupForm.$setUntouched();
                    }
                }, 100);
                $scope.sigupModal.hide();
            }
            if (!$scope.loginModal) {
                $ionicModal.fromTemplateUrl('./templates/login.html', function(modal) {
                    $scope.loginModal = modal;
                    $scope.loginModal.show();
                }, {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true,
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                });
            } else {
                $scope.loginModal.show();
            }
        };
        $scope.loginSubmit = function(model) {
            if ($scope.model.isResetPass == 1) {
                if (model.username.indexOf('@') != -1) {
                    var user = {
                        email: model.username
                    };
                } else {
                    var user = {
                        username: CryptoJS.SHA3(angular.copy(model.username), {
                            outputLength: 224
                        }).toString(),
                    };
                }
                $DTA.selectTableWhere($scope.db, 'users', user).then(function(result) {
                    if (result.rows.length > 0) {
                        $scope.model.currentUser = result.rows[0];
                        var userUpdate = {
                            password: CryptoJS.SHA3(angular.copy(model.password), {
                                outputLength: 224
                            }).toString()
                        };
                        $DTA.updateTable($scope.db, 'users', userUpdate, user).then(function(result) {
                            model.username = '';
                            model.password = '';
                            $scope.model.isResetPass = 0;
                        }, function(err) {});
                    }
                }, function(err) {});
                return;
            }
            var user = {
                username: CryptoJS.SHA3(angular.copy(model.username), {
                    outputLength: 224
                }).toString(),
                password: CryptoJS.SHA3(angular.copy(model.password), {
                    outputLength: 224
                }).toString()
            };
            // var user = {
            //     username: model.username,
            //     password: model.password
            // };
            $DTA.selectTableWhere($scope.db, 'users', user).then(function(result) {
                if (result.rows.length == 0) {
                    if (angular.isUndefined($scope.showAlertLogin)) {
                        $scope.showAlertLogin = function() {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Login',
                                template: 'Wrong username or password!'
                            });
                            alertPopup.then(function(res) {
                                $scope.showLogin();
                            });
                        };
                    }
                    $scope.showAlertLogin();
                } else {
                    user = {
                        username: model.username,
                        password: model.password
                    };
                    localStorage.user = angular.toJson(user);
                    $scope.initModel();
                    $scope.model.currentUser = result.rows[0];
                    $scope.loadDataFromDb($scope.db);
                    if (angular.isDefined($scope.loginModal)) {
                        $timeout(function() {
                            $scope.model.username = null;
                            $scope.model.password = null;
                            if (angular.isDefined($scope.loginForm)) {
                                $scope.loginForm.$setUntouched();
                            }
                        }, 100);
                        $scope.loginModal.hide();
                    }
                    $scope.setView('#/main');
                }
            }, function(err) {});
        };
        $scope.showSigup = function() {
            if (angular.isDefined($scope.loginModal)) {
                $timeout(function() {
                    $scope.model.username = null;
                    $scope.model.password = null;
                    if (angular.isDefined($scope.loginForm)) {
                        $scope.loginForm.$setUntouched();
                    }
                }, 100);
                $scope.loginModal.hide();
            }
            if (!$scope.sigupModal) {
                $ionicModal.fromTemplateUrl('./templates/sigup.html', function(modal) {
                    $scope.sigupModal = modal;
                    $scope.sigupModal.show();
                }, {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true,
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                });
            } else {
                $scope.sigupModal.show();
            }
        };
        $scope.sigupSubmit = function(model) {
            if ($scope.model.password != $scope.model.confirmPassword) {
                return;
            }
            $scope.getNextIdOfTable('users', function(id) {
                var uid = new Date().getTime().toString();
                var users = {
                    uid: _.uniqueId(uid),
                    id: id,
                    username: CryptoJS.SHA3(angular.copy(model.username), {
                        outputLength: 224
                    }).toString(),
                    password: CryptoJS.SHA3(angular.copy(model.password), {
                        outputLength: 224
                    }).toString(),
                    email: model.email,
                };
                $DTA.insertDataToTable($scope.db, 'users', users).then(function(result) {
                    var user = {
                        username: model.username,
                        password: model.password
                    };
                    localStorage.user = angular.toJson(user);
                    $scope.initModel();
                    $scope.model.currentUser = users;
                    $scope.loadDataFromDb($scope.db);
                    $scope.sigupModal.hide();
                    $scope.setView('#/main');
                }, function(err) {});
            });
        };
        $scope.logOut = function() {
            localStorage.user = null;
            $scope.showLogin();
            $scope.popoverMenu.hide();
        };
        $scope.createTableNeeded = function(db) {
            $DTA.createTableNeeded(db);
        };
        $scope.loadDataFromDb = function(db) {
            // get class
            $scope.getClasses();
            // get fibonacci
            $DTA.selectTableAll(db, 'fibonacci').then(function(result) {
                _.each(result.rows, function(item) {
                    $scope.model.fibonacci.push(item);
                });
                if (result.rows.length == 0) {
                    //insert default data
                    var item = {
                        number: 1
                    };
                    $DTA.insertDataToTable($scope.db, 'fibonacci', item);
                    item = {
                        number: 2
                    };
                    $DTA.insertDataToTable($scope.db, 'fibonacci', item);
                    item = {
                        number: 3
                    };
                    $DTA.insertDataToTable($scope.db, 'fibonacci', item);
                    //reload fibonacci
                    $DTA.selectTableAll(db, 'fibonacci').then(function(result) {
                        _.each(result.rows, function(item) {
                            $scope.model.fibonacci.push(item);
                        });
                    }, function(err) {});
                }
            }, function(err) {});
            //load config
            $DTA.selectTableAll(db, 'config').then(function(result) {
                _.each(result.rows, function(item) {
                    eval('$scope.model.' + item.name + ' = ' + item.value);
                });
                if (result.rows.length == 0) {
                    //insert default data
                    var item = {
                        name: 'maxCountLearn',
                        value: 10
                    };
                    $DTA.insertDataToTable($scope.db, 'config', item);
                    //reload fibonacci
                    $DTA.selectTableAll(db, 'config').then(function(result) {
                        _.each(result.rows, function(item) {
                            eval('$scope.model.' + item.name + ' = ' + item.value);
                        });
                    }, function(err) {});
                }
            }, function(err) {});
            //check lesson relearn
            $DTA.selectTableAll(db, 'lessons').then(function(resultChild) {
                _.each(resultChild.rows, function(item) {
                    if (item.nextLearnDate != null && item.nextLearnDate != '') {
                        var today = new Date().toISOString();
                        today = today.substr(0, 10);
                        var itemNextLearnDate = item.nextLearnDate;// new Date(item.nextLearnDate).toISOString();
                        itemNextLearnDate = itemNextLearnDate.substr(0, 10);
                        var todayTime = new Date(today).getTime();
                        var nextDateTime = new Date(itemNextLearnDate).getTime();
                        if (todayTime >= nextDateTime && item.countLearn < $scope.model.maxCountLearn) {
                            $scope.model.needExercisesCount++;
                            var itemUpdate = {
                                state: 2
                            };
                            var itemWhere = {
                                id: item.id
                            };
                            $DTA.updateTable($scope.db, 'lessons', itemUpdate, itemWhere);
                        }
                    }
                });
                if ($scope.model.needExercisesCount > 0) {
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: 'Notification do exercises',
                        text: 'there are ' + $scope.model.needExercisesCount + ' lesson need to do exercises'
                    });
                }
            }, function(err) {});
        };
        $rootScope.$on('$cordovaLocalNotification:trigger', function(event, notification, state) {
            $cordovaVibration.vibrate(1000);
        });
        $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
            $scope.showDoExercisesNeedList();
        });
        $scope.showDoExercisesNeedList = function() {
            $scope.model.search.$ = '';
            var lessonWhere = {
                state: 2
            }
            $DTA.selectTableWhere($scope.db, 'lessons', lessonWhere).then(function(result) {
                _.each(result.rows, function(item) {
                    $scope.model.doExercisesNeedList.push(item);
                });
            }, function(err) {});
            $scope.setView('#/doExercisesNeedList');
        };
        $scope.getClasses = function() {
            var where = {
                userId: $scope.model.currentUser.id
            };
            $DTA.selectTableWhere($scope.db, 'classes', where).then(function(result) {
                _.each(result.rows, function(item) {
                    $scope.model.classes.push(item);
                });
                $scope.model.classList = _.map(result.rows, function(item) {
                    return item = {
                        id: item.id,
                        name: item.name,
                        vocabulary: [],
                        lessons: []
                    };
                });
            }, function(err) {});
        };
        $scope.getLessonOfClass = function(classes) {
            classes.lessons = [];
            var where = {
                classId: classes.id
            }
            $DTA.selectTableWhere($scope.db, 'classes_lessons', where).then(function(result) {
                _.each(result.rows, function(item) {
                    var where = {
                        id: item.lessonId
                    };
                    $DTA.selectTableWhere($scope.db, 'lessons', where).then(function(resultChild) {
                        classes.lessons.push(resultChild.rows[0]);
                    }, function(err) {});
                });
            }, function(err) {
                console.log(err);
            });
        };
        $scope.getWordOfClass = function(state) {
            // load classes_words
            $scope.model.currentClass.vocabulary = [];
            var where = {
                classId: $scope.model.currentClass.id
            }
            $DTA.selectTableWhere($scope.db, 'classes_words', where).then(function(result) {
                if (result.rows.length == 0) {
                    $scope.model.loading.hide();
                    $scope.model.currentClass.vocabulary = [];
                    return;
                }
                var arrWhere = [];
                _.each(result.rows, function(item) {
                    arrWhere.push([item.wordId]);
                });
                $DTA.selectAllWordsOfClasses($scope.db, arrWhere, state).then(function(resultChild) {
                    $scope.model.currentClass.vocabulary = resultChild;
                    $scope.model.loading.hide();
                }, function(err) {
                    console.log(err);
                });
                arrWhere = [];
            }, function(err) {
                console.log(err);
            });
        };
        $scope.getWordsOfLesson = function(fnCallback) {
            // load lesson
            $scope.model.currentLesson.vocabulary = [];
            $scope.model.lessonList.push($scope.model.currentLesson);
            // load lessons_words
            var where = {
                lessonId: $scope.model.currentLesson.id
            }
            $DTA.selectTableWhere($scope.db, 'lessons_words', where).then(function(resultC) {
                _.each(resultC.rows, function(item) {
                    where = {
                        id: item.wordId
                    };
                    $DTA.selectTableWhere($scope.db, 'words', where).then(function(resultChild) {
                        $scope.model.currentLesson.vocabulary.push(resultChild.rows[0]);
                    }, function(err) {
                        console.log(err);
                    });
                });
            }, function(err) {
                console.log(err);
            });
            (fnCallback || angular.noop)();
        };
        $scope.getNextIdOfTable = function(tableName, fnCallback) {
            $DTA.getNextIdOfTable($scope.db, tableName).then(function(result) {
                fnCallback(result);
            }, function(err) {
                console.log(err);
            });
        };
        $scope.defineExitApp = function() {
            $scope.doubleClick = false;
            $ionicPlatform.registerBackButtonAction(function(event) {
                $scope.back();
                $scope.$digest();
            }, 100);
        };
        $scope.back = function() {
            if ($scope.model.view == $scope.model.mainView) {
                if ($scope.doubleClick == false) {
                    $scope.doubleClick = true;
                    $cordovaToast.show('Press again to exit', 'short', 'bottom');
                } else {
                    (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
                }
                $timeout(function() {
                    $scope.doubleClick = false;
                }, 500);
            } else {
                if ($scope.model.view === '#/wordListLearn') {
                    if (angular.isUndefined($scope.showConfirm)) {
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Leave your lesson',
                                template: 'Are you sure?'
                            });
                            confirmPopup.then(function(res) {
                                if (res) {
                                    $scope.backView();
                                }
                            });
                        };
                    }
                    $scope.showConfirm();
                } else {
                    $scope.backView();
                }
            }
        };
        $scope.setView = function(view) {
            $scope.model.viewList.push(view);
            $scope.model.view = view;
            $window.location = view;
        };
        $scope.backView = function() {
            var index = $scope.model.viewList.lastIndexOf($scope.model.view);
            $scope.model.view = $scope.model.viewList[index - 1];
            $window.location = $scope.model.view;
            $scope.model.viewList.pop();
        };
        $scope.showHome = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.setView('#/main');
            $scope.model.viewList = ['#/main'];
        };
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
        $scope.showPopupAddClass = function(update) {
            var tittle = 'Add class';
            if (angular.isDefined(update) && update == true) {
                tittle = 'Rename class';
            }
            $ionicPopup.prompt({
                title: tittle,
                inputType: 'text',
                inputPlaceholder: 'Enter new class',
            }).then(function(res) {
                if (angular.isUndefined(res) || res == null || res == '') {
                    return;
                }
                if (angular.isDefined(update) && update == true) {
                    var updateClass = {
                        name: res
                    };
                    var whereClass = {
                        id: $scope.model.currentClass.id
                    }
                    $DTA.updateTable($scope.db, 'classes', updateClass, whereClass);
                    $scope.model.currentClass.name = res;
                    $scope.getClasses();
                    return;
                }
                if (angular.isUndefined($scope.addClass)) {
                    $scope.addClass = function(res) {
                        // insert to db
                        $scope.getNextIdOfTable('classes', function(id) {
                            var classesItem = {
                                userId: $scope.model.currentUser.id,
                                id: id,
                                name: res
                            };
                            $DTA.insertDataToTable($scope.db, 'classes', classesItem);
                            //insert to model
                            var params = {
                                id: id,
                                name: res,
                                vocabulary: [],
                                lessons: []
                            }
                            $scope.model.classList.push(params);
                            $scope.model.classes.push(classesItem);
                        });
                    };
                }
                $scope.addClass(res);
            });
        };
        $scope.toggleGroup = function(classItem) {
            event.stopPropagation();
            if ($scope.isGroupShown(classItem)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = classItem;
                $scope.getLessonOfClass(classItem);
            }
            $scope.model.currentClass = classItem;
        };
        $scope.isGroupShown = function(classItem) {
            return $scope.shownGroup === classItem;
        };
        $scope.chooseClass = function(classItem) {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.setView('#/classContent');
            $scope.model.currentClass = classItem;
        };
        $scope.showModalAddNewWords = function() {
            $scope.model.search.$ = '';
            $scope.model.newWordList = [];
            $scope.resetAddNewWords();
            $scope.setView('#/addNewWords');
        };
        $scope.initAddNewWordsForm = function(form) {
            $timeout(function() {
                $scope.addNewWordsForm = form.addNewWordsForm;
            }, 100);
        };
        $scope.initloginForm = function(form) {
            $timeout(function() {
                $scope.loginForm = form.loginForm;
            }, 100);
        };
        $scope.initSigupForm = function(form) {
            $timeout(function() {
                $scope.sigupForm = form.sigupForm;
            }, 100);
        };
        $scope.AddNewWords = function() {
            // insert to db words and classes_words
            $scope.getNextIdOfTable('words', function(id) {
                var itemWords = {
                    id: id,
                    english: $scope.model.english,
                    vietnamese: $scope.model.vietnamese,
                    example: $scope.model.example,
                    isLearned: 0
                };
                $DTA.insertDataToTable($scope.db, 'words', itemWords);
                var itemClasses_Words = {
                    classId: $scope.model.currentClass.id,
                    wordId: id
                };
                $DTA.insertDataToTable($scope.db, 'classes_words', itemClasses_Words);
                //insret to model
                $scope.model.currentClass.vocabulary.push(itemWords);
                $scope.model.newWordList.push(itemWords);
                $scope.resetAddNewWords();
            });
        };
        $scope.resetAddNewWords = function() {
            $timeout(function() {
                $scope.model.english = null;
                $scope.model.vietnamese = null;
                $scope.model.example = null;
                if (angular.isDefined($scope.addNewWordsForm)) {
                    $scope.addNewWordsForm.$setUntouched();
                }
            }, 100);
        };
        $scope.showCreateLesson = function() {
            $scope.model.loading.show();
            $scope.model.currentClass.vocabulary = null;
            $scope.model.countWordsOfLesson = 5;
            $scope.resetCreateLesson();
            $scope.setView('#/createLesson');
            //loading words of class
            $scope.getWordOfClass(0);
        };
        $scope.resetCreateLesson = function() {
            $scope.model.lessonName = null;
            delete $scope.model.errorLessonName;
        };
        $scope.createLesson = function() {
            $scope.model.errorLessonName = false;
            $scope.model.errorLessonListWord = false;
            var isValid = $scope.model.currentClass.vocabulary.every(function(item) {
                return (item.isChecked != true);
            });
            if ($scope.model.lessonName == null || $scope.model.lessonName == '' || isValid) {
                if ($scope.model.lessonName == null || $scope.model.lessonName == '') {
                    $scope.model.errorLessonName = true;
                }
                if (isValid) {
                    $scope.model.errorLessonListWord = true;
                };
                return;
            } else {
                //insert to db lessons
                $scope.getNextIdOfTable('lessons', function(id) {
                    var itemLesson = {
                        'id': id,
                        'name': $scope.model.lessonName,
                        'state': 0,
                        'learnStartDate': '',
                        'relearnDate': '',
                        'nextLearnDate': '',
                        'nextFibonaci': 3,
                        'isLearned': 0,
                        'countLearn': 0
                    };
                    $DTA.insertDataToTable($scope.db, 'lessons', itemLesson);
                    var itemClasses_Lessons = {
                        classId: $scope.model.currentClass.id,
                        lessonId: id
                    };
                    $DTA.insertDataToTable($scope.db, 'classes_lessons', itemClasses_Lessons);
                    // insert to model
                    var lesson = {
                        id: id,
                        name: $scope.model.lessonName,
                        state: 0
                    };
                    $scope.model.currentClass.lessons.push(lesson);
                    $scope.model.currentLesson = lesson;
                    var vocabularu = [];
                    var listVocabuRemove = [];
                    $scope.model.currentClass.vocabulary.forEach(function(item, index) {
                        if (item.isChecked == true && (angular.isUndefined(item.lessonId) || item.lessonId == null)) {
                            item.isLearned = 1;
                            item.lessonId = lesson.id;
                            vocabularu.push({
                                id: item.id,
                                english: item.english,
                                vietnamese: item.vietnamese,
                                example: item.example
                            });
                            // insert to db
                            var itemLessons_words = {
                                lessonId: id,
                                wordId: item.id
                            };
                            $DTA.insertDataToTable($scope.db, 'lessons_words', itemLessons_words);
                            listVocabuRemove.push(index);
                        }
                    });
                    listVocabuRemove.forEach(function(item, index) {
                        $scope.model.currentClass.vocabulary.splice(item - index, 1);
                    });
                    lesson = {
                        id: id,
                        name: $scope.model.lessonName,
                        vocabulary: vocabularu,
                        learnStartDate: null,
                        relearnDate: null,
                        nextLearnDate: null,
                        nextFibonaci: 3,
                        isLearned: 0,
                        state: 0,
                        countLearn: 0
                    };
                    $scope.model.lessonList.push(lesson);
                    $scope.resetCreateLesson();
                    $scope.confirmLearnNow();
                });
            }
        };
        $scope.confirmLearnNow = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Create done!',
                template: 'Are you sure you want to learn now?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    $scope.setView('#/mainLesson');
                }
            });
        };
        $scope.startLearnVocabulary = function() {
            var lesson = $scope.model.lessonList.filter(function(item) {
                return (item.id == $scope.model.currentLesson.id);
            });
            if (lesson != null && lesson.length > 0) {
                $scope.model.wordList = lesson[0].vocabulary;
            }
            $scope.model.wordList.forEach(function(item) {
                item.isRemember = 0;
            });
            // cap nhat cac thuoc tinh cua lesson
            $scope.setView('#/wordListLearn');
        };
        $scope.chooseLesson = function(item, exercise) {
            $scope.model.currentLesson = item;
            $scope.getWordsOfLesson();
            $scope.setView('#/mainLesson');
            if (exercise) {
                return;
            }
            $scope.toggleLeft();
        };
        $scope.checkShowCompleteLesson = function(list) {
            return list.some(function(item) {
                return (item.isRemember != 1);
            }); // isValid is true
        };
        $scope.showActionSheetWordListLearn = function($event) {
            if (!$scope.popoverModeTravel) {
                $ionicPopover.fromTemplateUrl('./templates/actionSheetWordListLearn.html', {
                    scope: $scope,
                }).then(function(popoverModeTravel) {
                    $scope.popoverModeTravel = popoverModeTravel;
                    $scope.popoverModeTravel.show($event);
                });
            } else {
                $scope.popoverModeTravel.show($event);
            }
        };
        $scope.showAllWords = function() {
            $scope.model.wordList.forEach(function(item) {
                item.isRemember = false;
            });
            $scope.popoverModeTravel.hide();
        };
        $scope.endLesson = function() {
            //update to db
            if (angular.isDefined($scope.popoverModeTravel)) {
                $scope.popoverModeTravel.hide();
            }
            $scope.setView('#/main');
            if ($scope.model.currentLesson.state == 1) {
                return;
            }
            var itemLessons = {};
            var newList = $scope.model.lessonList.filter(function(item) {
                return (item.id == $scope.model.currentLesson.id);
            });
            if (newList != null && newList.length > 0) {
                itemLessons = newList[0];
            }
            var today = new Date().toISOString();
            today = today.substr(0, 10);
            var nextLearnDate = null;
            var itemLessonsObject, itemLessonsObjectWhere;
            if (itemLessons.isLearned != 1 && itemLessons.state == 0) {
                var date = new Date(today).getTime();
                var nextLearnTime = date + (24 * 3600 * 1000);
                nextLearnDate = new Date(nextLearnTime).toISOString();
                nextLearnDate = nextLearnDate.substr(0, 10);
                itemLessonsObject = {
                    state: 1,
                    learnStartDate: today,
                    relearnDate: today,
                    nextLearnDate: nextLearnDate,
                    isLearned: 1,
                    countLearn: ++itemLessons.countLearn
                };
            } else {
                // get index current fibonacci
                var indexFibo = _.findIndex($scope.model.fibonacci, {
                    number: $scope.model.currentLesson.nextFibonaci
                });
                var nextFibonaci = null;
                if (indexFibo == $scope.model.fibonacci.length - 1) {
                    nextFibonaci = Number($scope.model.fibonacci[$scope.model.fibonacci.length - 1].number) + Number($scope.model.fibonacci[$scope.model.fibonacci.length - 2].number);
                    $scope.model.fibonacci.push({
                        number: nextFibonaci
                    });
                    // insert to db
                    var itemFibonacciObject = {
                        number: nextFibonaci
                    };
                    $DTA.insertDataToTable($scope.db, 'fibonacci', itemFibonacciObject);
                } else {
                    nextFibonaci = $scope.model.fibonacci[indexFibo + 1].number;
                }
                var date = new Date(today).getTime();
                var nextLearnTime = date + ((nextFibonaci - itemLessons.nextFibonaci) * 24 * 3600 * 1000);
                nextLearnDate = new Date(nextLearnTime).toISOString();
                nextLearnDate = nextLearnDate.substr(0, 10);
                itemLessonsObject = {
                    state: 1,
                    relearnDate: today,
                    nextLearnDate: nextLearnDate,
                    isLearned: 1,
                    nextFibonaci: nextFibonaci,
                    countLearn: ++itemLessons.countLearn
                };
            }
            itemLessonsObjectWhere = {
                id: itemLessons.id
            };
            $DTA.updateTable($scope.db, 'lessons', itemLessonsObject, itemLessonsObjectWhere);
            angular.forEach($scope.model.lessonList, function(item) {
                if (item.id == $scope.model.currentLesson.id) {
                    item.state = 1;
                    item.nextLearnDate = itemLessonsObject.nextLearnDate;
                }
            });
            angular.forEach($scope.model.currentClass.lessons, function(item) {
                if (item.id == $scope.model.currentLesson.id) {
                    item.state = 1;
                }
            });
        };
        $scope.showDoExcercises = function() {
            $scope.model.search.$ = '';
            $scope.getLessonOfClass($scope.model.currentClass);
            $scope.setView('#/listDoExercises');
        };
        $scope.showAllWordOfClass = function() {
            $scope.model.loading.show();
            $scope.model.currentClass.vocabulary = null;
            $scope.model.search.$ = '';
            $scope.getWordOfClass();
            $scope.setView('#/allWordOfClass');
        };
        $scope.showWordsNotLearnYet = function() {
            $scope.model.loading.show();
            $scope.model.currentClass.vocabulary = null;
            $scope.model.search.$ = '';
            $scope.getWordOfClass(0);
            $scope.setView('#/wordsNotLearnYet');
        };
        $scope.speak = function(string) {
            var url = 'http://translate.google.com/translate_tts?tl=en&q=';
            var endUrl = '&client=t';
            url += encodeURIComponent(string.split('(')[0].toString()) + endUrl;
            var a = new Audio(url);
            a.play();
        };
        $scope.showManageLessons = function() {
            $scope.model.search.$ = '';
            $scope.getLessonOfClass($scope.model.currentClass);
            $scope.setView('#/manageLessons');
        };
        $scope.selectRemoveClass = function(classes) {
            event.stopPropagation();
            if (angular.isUndefined($scope.showConfirmRemoveClass)) {
                $scope.showConfirmRemoveClass = function(classes) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Warnig',
                        template: 'Are you sure want to remove this class?'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.model.loading.show();
                            $scope.removeClass(classes, true);
                            $scope.setView('#/main');
                        } else {}
                    });
                };
            }
            $scope.showConfirmRemoveClass(classes);
        };
        $scope.removeClass = function(classes, stop) {
            //remove class
            $DTA.deleteTable($scope.db, 'classes', {
                id: classes.id
            });
            //remove class in list show
            var classIndex = _.findIndex($scope.model.classList, function(item) {
                return (item.id == classes.id);
            });
            $scope.model.classList.splice(classIndex, 1);
            if (stop == true) {
                $scope.model.loading.hide();
            }
        };
        $scope.selectRemoveLesson = function(lesson) {
            if (angular.isUndefined($scope.showConfirmRemoveLesson)) {
                $scope.showConfirmRemoveLesson = function(lesson) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Warnig',
                        template: 'Are you sure want to remove this lesson?'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.removeLesson(lesson);
                        } else {}
                    });
                };
            }
            $scope.showConfirmRemoveLesson(lesson);
        };
        $scope.removeLesson = function(lesson) {
            //remove classes_lessons
            var whereClassesLesson = {
                lessonId: lesson.id
            };
            $DTA.deleteTable($scope.db, 'classes_lessons', whereClassesLesson);
            //remove class in list show
            var lessonIndex = _.findIndex($scope.model.currentClass.lessons, function(item) {
                return (item.id == lesson.id);
            });
            $scope.model.currentClass.lessons.splice(lessonIndex, 1);
        };
        $scope.selectRemoveWord = function(word) {
            if (angular.isUndefined($scope.showConfirmRemoveWord)) {
                $scope.showConfirmRemoveWord = function(word) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Warnig',
                        template: 'Are you sure want to remove this word?'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.removeWords(word);
                        } else {}
                    });
                };
            }
            $scope.showConfirmRemoveWord(word);
        };
        $scope.removeWords = function(word) {
            //remove classes_words
            var whereWord = {
                wordId: word.id
            };
            $DTA.deleteTable($scope.db, 'classes_words', whereWord);
            //remove word in list show
            var wordIndex = _.findIndex($scope.model.currentClass.vocabulary, function(item) {
                return (item.id == word.id);
            });
            $scope.model.currentClass.vocabulary.splice(wordIndex, 1);
        };
        $scope.showPopupRenameLesson = function(lesson) {
            $ionicPopup.prompt({
                title: 'Rename lesson',
                inputType: 'text',
                inputPlaceholder: 'Enter new lesson',
            }).then(function(res) {
                if (angular.isUndefined(res) || res == null || res == '') {
                    return;
                }
                if (angular.isUndefined($scope.renameLesson)) {
                    $scope.renameLesson = function(lesson) {
                        var updateLesson = {
                            name: res
                        };
                        var whereLesson = {
                            id: lesson.id
                        }
                        $DTA.updateTable($scope.db, 'lessons', updateLesson, whereLesson);
                        lesson.name = res;
                        $scope.shownGroup = null;
                    };
                }
                $scope.renameLesson(lesson);
            });
        };
        $scope.showModalUpdateWords = function(word) {
            $scope.model.currentWord = word;
            $scope.resetUpdateWords(word);
            if (!$scope.updateWordsModal) {
                $ionicModal.fromTemplateUrl('./templates/updateWords.html', function(modal) {
                    $scope.updateWordsModal = modal;
                    $scope.updateWordsModal.show();
                }, {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true,
                    backdropClickToClose: false,
                    hardwareBackButtonClose: true
                });
            } else {
                $scope.updateWordsModal.show();
            }
        };
        $scope.initUpdateWordsForm = function(form) {
            $timeout(function() {
                $scope.updateWordsForm = form.updateWordsForm;
            }, 100);
        };
        $scope.updateWords = function() {
            // update word
            var valueUpdate = {
                english: $scope.model.english,
                vietnamese: $scope.model.vietnamese,
                example: $scope.model.example
            }
            var whereWord = {
                id: $scope.model.currentWord.id
            };
            $DTA.updateTable($scope.db, 'words', valueUpdate, whereWord);
            $scope.model.currentWord.english = $scope.model.english;
            $scope.model.currentWord.vietnamese = $scope.model.vietnamese;
            $scope.model.currentWord.example = $scope.model.example;
            $scope.closeUpdateWords();
        };
        $scope.resetUpdateWords = function(word) {
            $timeout(function() {
                $scope.model.english = word.english;
                $scope.model.vietnamese = word.vietnamese;
                $scope.model.example = word.example;
                if (angular.isDefined($scope.updateWordsForm)) {
                    $scope.updateWordsForm.$setUntouched();
                }
            }, 100);
        };
        $scope.closeUpdateWords = function() {
            $scope.updateWordsModal.hide();
        };
        $scope.checkIfShowHideVietnamese = function() {
            return $scope.model.wordList.every(function(item) {
                return (item.isShowVietnamese == 0);
            }); // isValid is true
        };
        $scope.hideVietnamese = function() {
            angular.forEach($scope.model.wordList, function(item) {
                item.isShowVietnamese = 0;
            });
            $scope.popoverModeTravel.hide();
            $ionicScrollDelegate.scrollTop(true);
        };
        $scope.showVietnamese = function() {
            angular.forEach($scope.model.wordList, function(item) {
                item.isShowVietnamese = 1;
            });
            $scope.popoverModeTravel.hide();
            $ionicScrollDelegate.scrollTop(true);
        };
        $scope.showPopoverMenu = function($event) {
            if (!$scope.popoverMenu) {
                $ionicPopover.fromTemplateUrl('./templates/popoverMenu.html', {
                    scope: $scope,
                }).then(function(popoverMenu) {
                    $scope.popoverMenu = popoverMenu;
                    $scope.popoverMenu.show($event);
                });
            } else {
                $scope.popoverMenu.show($event);
            }
        };
        $scope.showPopoverWordListLearn = function($event, itemWord) {
            $event.stopPropagation();
            $scope.itemWord = itemWord;
            if (!$scope.popoverWordListLearn) {
                $ionicPopover.fromTemplateUrl('./templates/popupWordListLearn.html', {
                    scope: $scope,
                }).then(function(popoverWordListLearn) {
                    $scope.popoverWordListLearn = popoverWordListLearn;
                    $scope.popoverWordListLearn.show($event);
                });
            } else {
                $scope.popoverWordListLearn.show($event);
            }
        };
        $scope.reload = function() {
            $scope.setView('#/main');
            location.reload(); // = location.origin;
        };
        $scope.exit = function() {
            $scope.popoverMenu.hide();
            (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
        };
        $scope.showSetting = function() {
            $scope.popoverMenu.hide();
            $scope.setView('#/setting');
        };
        $scope.setDefault = function() {
            $DTA.dropTable($scope.db, 'config');
            if (angular.isUndefined($scope.showConfirm)) {
                $scope.showConfirm = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Restart',
                        template: 'Reload app to take effect'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.reload();
                        }
                    });
                };
            }
            $scope.showConfirm();
        };
        $scope.saveConfig = function() {
            var maxCountLearnUpdate = {
                value: Number($scope.model.maxCountLearn)
            };
            var maxCountLearnWhere = {
                name: 'maxCountLearn'
            };
            $DTA.updateTable($scope.db, 'config', maxCountLearnUpdate, maxCountLearnWhere);
        };
        $scope.clearData = function() {
            if (angular.isUndefined($scope.showConfirmClearData)) {
                $scope.showConfirmClearData = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Clear data',
                        template: 'All class and setting will be clear'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.model.loading.show();
                            var countClear = 0,
                                lengthClass = angular.copy($scope.model.classes.length);
                            $scope.model.classes.forEach(function(item, index) {
                                countClear++;
                                $scope.removeClass(item, false);
                            });
                            setInterval(function() {
                                if (countClear == lengthClass) {
                                    $scope.model.loading.hide();
                                }
                            }, 1000);
                        }
                    });
                };
            }
            $scope.showConfirmClearData();
        };
        $scope.chooseFile = function() {
            $('#chooseFile').trigger('click');
        };
        $scope.countCheck = function() {
            if (angular.isUndefined($scope.model.currentClass)) {
                return;
            }
            $scope.model.countWordsOfLesson = _.countBy($scope.model.currentClass.vocabulary, function(item) {
                return item.isChecked == 1 && item.isLearned != 1 ? 'length' : 'null';
            }).length;
        };
        $scope.endChooseFile = function(arr) {
            $scope.model.loading.show();
            $scope.model.newWordListTmp = [];
            $scope.model.wordIdCount = null;
            $scope.insertDataWhenImport(arr, 0, arr.length);
        };
        $scope.insertDataWhenImport = function(arr, n, length) {
            if (length == n) {
                $scope.model.newWordList = angular.copy($scope.model.newWordListTmp);
                $scope.model.currentClass.vocabulary = angular.copy($scope.model.newWordListTmp);
                $scope.model.loading.hide();
                return;
            }
            var item = arr[n];
            var english = item[0].trim() + ' (' + item[1].trim() + ')',
                vietnamese = item[2].trim(),
                example = angular.isDefined(item[3]) ? item[3].trim() : null;
            if (item[1].trim().indexOf('(') != -1) {
                english = item[0].trim() + ' ' + item[1].trim();
            }
            var itemWords = {
                id: $scope.model.wordIdCount,
                english: english,
                vietnamese: vietnamese,
                example: example,
                isLearned: 0
            };
            var itemClasses_Words = {
                classId: $scope.model.currentClass.id,
                wordId: $scope.model.wordIdCount
            };
            if ($scope.model.wordIdCount === null) {
                $scope.getNextIdOfTable('words', function(id) {
                    itemWords.id = id;
                    itemClasses_Words.wordId = id;
                    $scope.model.wordIdCount = id + 1;
                    $DTA.importWordsClasses_words($scope.db, itemWords, itemClasses_Words, length, n);
                    //insret to model
                    $scope.model.newWordListTmp.push(itemWords);
                    $scope.insertDataWhenImport(arr, ++n, length);
                });
            } else {
                $DTA.importWordsClasses_words($scope.db, itemWords, itemClasses_Words, length, n);
                $scope.model.wordIdCount++;
                //insret to model
                $scope.model.newWordListTmp.push(itemWords);
                $scope.insertDataWhenImport(arr, ++n, length);
            }
        };
        $scope.changeCountWordOfLesson = function() {
            $scope.model.currentClass.vocabulary.forEach(function(item) {
                if (item.isChecked == true && item.isLearned != 1) {
                    item.isChecked = false;
                }
            });
            var count = 0;
            for (var j = 0; j < $scope.model.vocabularyCreateLesson.length; j++) {
                $scope.model.vocabularyCreateLesson[j].isChecked = true;
                for (var i = $scope.model.currentClass.vocabulary.length - 1; i >= 0; i--) {
                    if ($scope.model.currentClass.vocabulary[i].id == $scope.model.vocabularyCreateLesson[j].id) {
                        $scope.model.currentClass.vocabulary[i].isChecked = true;
                        break;
                    }
                }
                ++count;
                if (count == $scope.model.countWordsOfLesson || count == $scope.model.currentClass.vocabulary.length) {
                    break;
                }
            }
        };
        $scope.resetLesson = function(lesson) {
            lesson.countLearn = 0;
            lesson.isLearned = 0;
            lesson.learnStartDate = '';
            lesson.nextFibonaci = 3;
            lesson.nextLearnDate = '';
            lesson.relearnDate = '';
            lesson.state = 0;
            var itemLesson = {
                    countLearn: 0,
                    isLearned: 0,
                    learnStartDate: "",
                    nextFibonaci: 3,
                    nextLearnDate: "",
                    relearnDate: "",
                    state: 0
                },
                where = {
                    id: lesson.id
                };
            $DTA.updateTable($scope.db, 'lessons', itemLesson, where);
        };
        $scope.showPopupExport = function() {
            var tittle = 'Export words';
            $ionicPopup.prompt({
                title: tittle,
                inputType: 'text',
                inputPlaceholder: 'Enter name',
            }).then(function(res) {
                if (angular.isUndefined(res) || res == null || res == '') {
                    return;
                }
                $scope.export(res);
            });
        };
        $scope.export = function(name) {
            var content = '';
            $scope.model.currentClass.vocabulary.forEach(function(item) {
                var spilit = item.english.split('(');
                content += spilit[0] + "| " + (angular.isDefined(spilit[1]) ? spilit[1].replace(')', '| ') : '| ') + item.vietnamese + '|' + item.example + '\n';
            });
            $cordovaFile.writeFile($scope.model.rootDirectory, name + '.txt', content, true).then(function(success) {
                // success
                if (angular.isUndefined($scope.showAlertExportComplete)) {
                    $scope.showAlertExportComplete = function() {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Export',
                            template: 'Export complete'
                        });
                        alertPopup.then(function(res) {});
                    };
                }
                $scope.showAlertExportComplete();
            }, function(error) {
                // error
            });
        };
        $scope.showProfile = function() {
            var user = angular.fromJson(localStorage.user);
            $scope.model.username = user.username;
            $scope.setView('#/profile');
        };
        $scope.saveUsername = function(model) {
            var usernameValue = {
                    username: CryptoJS.SHA3(angular.copy(model.username), {
                        outputLength: 224
                    }).toString()
                },
                where = {
                    id: $scope.model.currentUser.id
                };
            $DTA.updateTable($scope.db, 'users', usernameValue, where);
            var user = {
                username: model.username,
                password: angular.fromJson(localStorage.user).password
            };
            localStorage.user = angular.toJson(user);
        };
        $scope.savePassword = function(model) {
            if ($scope.model.password != $scope.model.confirmPassword) {
                return;
            }
            var passwordValue = {
                    password: CryptoJS.SHA3(angular.copy(model.password), {
                        outputLength: 224
                    }).toString()
                },
                where = {
                    id: $scope.model.currentUser.id
                };
            $DTA.updateTable($scope.db, 'users', passwordValue, where);
            var user = {
                username: angular.fromJson(localStorage.user).username,
                password: model.password
            };
            localStorage.user = angular.toJson(user);
        };
        $scope.showTestWord = function(wordItem) {
            $scope.model.currentVoca = angular.copy(wordItem);
            $scope.model.testList = [];
            $scope.model.testList.push({
                index: 0,
                word: wordItem['english'],
                tested: false,
                lang: "english",
                mean: wordItem['vietnamese']
            });
            $scope.model.testList.push({
                index: 1,
                word: wordItem['vietnamese'],
                tested: false,
                lang: "vietnamese",
                mean: wordItem['english']
            });
            $scope.model.voca = $scope.model.testList[0];
            if (!$scope.testWordModal) {
                $ionicModal.fromTemplateUrl('./templates/testWord.html', function(modal) {
                    $scope.testWordModal = modal;
                    $scope.testWordModal.show();
                }, {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: false,
                    backdropClickToClose: false,
                    hardwareBackButtonClose: true
                });
            } else {
                $scope.testWordModal.show();
            }
            setTimeout(function() {
                $('#inputTestMean').focus();
            }, 100);
        };
        $scope.checkMean = function() {
            if ($scope.model.showNext != true) {
                var mean = $scope.model.voca.mean.split('(')[0];
                var slug = getSlug(mean, {
                    separator: ' '
                });
                var slug2 = getSlug($scope.model.meaning, {
                    separator: ' '
                });
                if (slug == slug2) {
                    $scope.model.voca.tested = true;
                    $scope.model.wrong = false;
                } else {
                    $scope.model.wrong = true;
                }
            } else {
                $scope.model.meaning = '';
                $scope.model.wrong = null;
                var isValid = $scope.model.testList.every(function(item) {
                    return (item.tested == true);
                });
                if (isValid) {
                    if ($scope.model.currentVoca.example != null && $scope.model.currentVoca.example != '') {
                        $scope.model.isReadWord = true;
                        $scope.model.voca.word = angular.copy($scope.model.currentVoca.example);
                    }
                    return;
                }
                $scope.model.voca = $scope.model.testList[1 - $scope.model.voca.index];
                if ($scope.model.voca.tested) {
                    $scope.model.voca = $scope.model.testList[1 - $scope.model.voca.index];
                }
            }
            $scope.model.showNext = !$scope.model.showNext;
            setTimeout(function() {
                $('#inputTestMean').focus();
            }, 100);
        };
        $scope.startSpeech = function() {
            $scope.model.loading.show({
                template: '<span class="ion-ios-mic-outline"></span>'
            });
            var recognition = new SpeechRecognition();
            recognition.onresult = function(event) {
                if (event.results.length > 0) {
                    $scope.model.speech = event.results[0][0].transcript;
                    $scope.$digest();
                    if ($scope.model.isReadWord && $scope.model.speech == $scope.model.voca) {
                        $scope.model.wrong = false;
                        $scope.model.isReadWord = false;
                        $scope.model.loading.hide();
                        $scope.testWordModal.hide();
                    } else {
                        $scope.model.loading.hide();
                    }
                }
            }
            recognition.onerror = function(event) {
                $scope.model.loading.hide();
            };
            recognition.start();
        };
        $scope.hideTestWord = function() {
            $scope.testWordModal.hide();
        };
    }
]);
angular.module('starter').directive('fileReader', function() {
    return {
        scope: {
            fileReader: "=",
            change: '&'
        },
        link: function(scope, element) {
            angular.element(element).on('change', function(changeEvent) {
                if (changeEvent.target.value.lastIndexOf('.txt') == -1) {
                    return;
                }
                var files = changeEvent.target.files;
                if (files.length) {
                    var r = new FileReader();
                    r.onload = function(e) {
                        var contents = e.target.result.trim();
                        scope.$apply(function() {
                            scope.fileReader = contents.replace(/"/g, " ");
                            var arr = scope.fileReader.split("\n");
                            var childArr = [];
                            angular.forEach(arr, function(item) {
                                childArr.push(item.split('|'));
                            });
                            scope.change({
                                arr: childArr
                            });
                            element.val("");
                        });
                    };
                    r.readAsText(files[0]);
                }
            });
        }
    };
});