// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'jett.ionic.filter.bar', 'ngAnimate', 'ngCordova', 'commonModule', 'ngMessages', 'commonDTA', 'modelModule', 'funcModule', 'ngCookies', 'pascalprecht.translate']).run(['$ionicPlatform', function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
		Parse.initialize("t0L423J0yVlXAfjTp34NIjdd9v1XNRo8co9GVqdq", "R9hXsy0jnQJZ7u6Bgb9BrRamVxBIop2AjPu95vyt");
	});
}]);
angular.module('starter').controller('mainCtrl', ['$rootScope', '$scope', '$commonModel', '$commonSql', '$DTA', '$ionicSideMenuDelegate', '$ionicPlatform', '$ionicPopup', '$cordovaToast', '$ionicModal', '$timeout', '$ionicPopover', '$cordovaLocalNotification', '$cordovaVibration', '$window', '$ionicScrollDelegate', '$ionicLoading', '$cordovaFile', '$commonFunc', '$tableName', '$translate',
	function($rootScope, $scope, $commonModel, $commonSql, $DTA, $ionicSideMenuDelegate, $ionicPlatform, $ionicPopup, $cordovaToast, $ionicModal, $timeout, $ionicPopover, $cordovaLocalNotification, $cordovaVibration, $window, $ionicScrollDelegate, $ionicLoading, $cordovaFile, $commonFunc, $tableName, $translate) {
		$scope.model = $commonModel;
		$scope.initModel = function() {
			$scope.model.languageDisplay = $translate.use();
			$scope.model.loading = $ionicLoading;
			$scope.model.mainView = '#/main';
			$scope.model.view = '#/main';
			$scope.model.viewList = ['#/main'];
			$scope.model.classList = [];
			$scope.model.wordList = [];
			$scope.model.lessonList = [];
			$scope.model.lessonListOfClass = [];
			$scope.model.newWordList = [];
			$scope.model.newWordListTmp = [];
			$scope.model.words = [];
			$scope.model.classes = [];
			$scope.model.fibonacci = [];
			$scope.model.needExercisesCount = 0;
			$scope.model.doExercisesNeedList = [];
			$scope.model.maxCountLearn = 10;
			$scope.model.countWordsOfLesson = 5;
			$scope.model.rootDirectory = 'file=///storage/emulated/0/';
			$scope.model.search = {};
			$scope.model.languages = [{
				name: 'English',
				value: 'en-US',
				value2: 'en',
				id: '0'
			}, {
				name: 'Japanese',
				value: 'ja-JP',
				value2: 'ja',
				id: '1'
			}, {
				name: 'Vietnamese',
				value: 'vi-VN',
				value2: 'vi',
				id: '2'
			}];
			$scope.model.languageItem = '0';
			$scope.model.languageLearn = "0";
		};
		$scope.checkSyncData = function(db) {
			$commonFunc.checkIsOnline().then(function(state) {
				// state == 100 is offline
				if (state != Parse.Error.CONNECTION_FAILED) {
					$scope.model.isOnline = true;
					//check user isExist
					$DTA.selectTableAll(db, $tableName.Users).then(function(result) {
						_.each(result.rows, function(itemUser) {
							var _User = Parse.Object.extend('_User');
							var object = new Parse.Query(_User);
							object.get(itemUser.idOnline, {
								success: function(object) {},
								error: function(model, error) {
									//destroy the user
									// object not found and user isSync == true
									if (error.code == Parse.Error.OBJECT_NOT_FOUND && itemUser.isSync == true) {
										$commonModel.currentUser = angular.copy(itemUser);
										// remove user
										$DTA.deleteTable($commonModel, $tableName.Users, {
											idOffline: itemUser.idOffline
										});
										// remove configs
										$DTA.deleteTable($commonModel, $tableName.Configs, {});
										// remove classes
										$DTA.selectTableWhere(db, $tableName.Classes, {
											uesrId: itemUser.idOffline
										}).then(function(result) {
											_.each(result.rows, function(itemClass) {
												// remove each class
												$DTA.deleteTable($commonModel, $tableName.Classes, {
													idOffline: itemClass.idOffline
												});
											});
										}, function(err) {});
									}
								}
							});
						});
					}, function(err) {});
				}
			});
		};
		$scope.init = function() {
			$scope.initModel();
			$scope.defineExitApp();
			$commonSql.openDb().then(function(db) {
				// localStorage.clear();
				$scope.model.db = db;
				$scope.createTableNeeded(db);
				$scope.checkSyncData(db);
				if (angular.isUndefined(localStorage.user) || localStorage.user == 'null') {
					$scope.showLogin();
				} else {
					$scope.loginSubmit(angular.fromJson(localStorage.user));
				}
			}, function(err) {});
		};
		$scope.saveLanguage = function() {
			var configModel = {
				name: 'languageLearn',
				value: $scope.model.languageItem.toString(),
				deletedBy: '',
				isDeleted: '',
				createdBy: $scope.model.currentUser.isOnline
			};
			$DTA.insertDataToTable($scope.model.db, $tableName.Configs, configModel).then(function(result) {
				$scope.selectLanguageModal.hide();
				console.log('save configs', result);
			}, function(err) {
				console.log('save config err', err);
			});
		};
		$scope.showSelectLanguage = function() {
			if (!$scope.selectLanguageModal) {
				$ionicModal.fromTemplateUrl('./templates/selectLanguage.html', function(modal) {
					$scope.selectLanguageModal = modal;
					$scope.selectLanguageModal.show();
				}, {
					scope: $scope,
					animation: 'slide-in-up',
					backdropClickToClose: false,
					hardwareBackButtonClose: false
				});
			} else {
				$scope.selectLanguageModal.show();
			}
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
		$scope.loginLocal = function(user, model) {
			$DTA.selectTableWhere($scope.model.db, $tableName.Users, user).then(function(result) {
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
					//refresh data
					$scope.initModel();
					$scope.model.currentUser = result.rows[0];
					$scope.loadDataFromDb($scope.model.db);
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
					$commonFunc.setView('#/main');
				}
			}, function(err) {});
		};
		$scope.syncUserToClient = function(user, userObj, fnCallback) {
			$scope.model.currentUser = {
				idOnline: userObj.id
			};
			// check user is sync
			$DTA.selectTableWhere($scope.model.db, $tableName.Users, user).then(function(result) {
				// already exist user
				if (result.rows.length > 0) {
					var item = result.rows[0];
					var dateUpdate = new Date(item.updated).getTime();
					var dateUpdateServer = new Date(userObj.get('updatedAt').toString()).getTime();
					if (dateUpdateServer > dateUpdate) {
						var objectUpdate = {
							username: userObj.get('username'),
							password: user.password,
							email: userObj.get('email'),
							updated: userObj.get('updatedAt').toString()
						};
						var whereUser = {
							idOnline: item.idOnline
						};
						$DTA.updateTableLocal($scope.model.db, $tableName.Users, objectUpdate, whereUser).then(function(result) {
							(fnCallback || angular.noop)(result);
						}, function(err) {});;
					} else {
						(fnCallback || angular.noop)(result);
					}
				} else {
					// not exist
					var users = {
						uid: userObj.get('uid'),
						username: userObj.get('username'),
						password: user.password,
						email: userObj.get('email'),
						isDeleted: userObj.get('isDeleted'),
						deletedBy: userObj.get('deletedBy'),
					};
					users.idOnline = userObj.id;
					users.isSync = true;
					users.created = userObj.get('createdAt').toString();
					users.updated = userObj.get('updatedAt').toString();
					$scope.model.currentUser = {
						idOnline: userObj.id
					};
					$commonFunc.getNextIdOfTable($tableName.Users, function(idOffline) {
						users.idOffline = idOffline;
						$scope.model.isSyncToServer = false;
						$DTA.insertDataToTable($scope.model.db, $tableName.Users, users).then(function(result) {
							(fnCallback || angular.noop)(result);
						}, function(err) {});;
					});
				}
			}, function(err) {});
		};
		$scope.syncDataFromServerToClient = function(userObj, tableName) {
			console.log(tableName + ' syncDataFromServerToClient', 1);
			$scope.model.totalProcessSync++; //A
			tableName = tableName;
			$DTA.getMaxColOfTable($scope.model.db, tableName, 'updated', 'DATE').then(function(result) {
				var Objects = Parse.Object.extend(tableName);
				var object = new Parse.Query(Objects);
				if (result != null) {
					var dateUpdate = new Date(result.updated).getTime();
					object.greaterThan("updatedAt", new Date(dateUpdate));
				}
				if (tableName != $tableName.Fibonacci) {
					object.equalTo('createdBy', userObj.id);
				}
				var thisFunction = arguments.callee
				if (!thisFunction.uid) thisFunction.uid = 0;
				++thisFunction.uid;
				console.log(tableName + ' getMaxColOfTable', thisFunction.uid);
				$scope.model.totalProcessSync++; //AA
				object.count({
					success: function(count) {
						var countC = Math.ceil((count / 1000));
						if (countC > 1) {
							for (var i = 0; i < countC; i++) {
								console.log(tableName + ' countC', i);
								$scope.model.totalProcessSync++; //B
								object.limit(1000);
								object.skip(1000 * i);
								object.find({
									success: function(objects) {
										for (var i = objects.length - 1; i >= 0; i--) {
											if (new Date(objects[i].get('updatedAt').toString()).getTime() == dateUpdate) {
												objects.splice(i, 1);
											}
										}
										if (objects.length > 0) {
											$scope.findDataFromServerDone(objects, tableName);
										} else {
											$scope.model.countProcessSync++; //B
										}
									},
									error: function(model, error) {
										$scope.model.countProcessSync++; //B
									}
								});
							}
						} else {
							console.log(tableName + ' countC', 1);
							$scope.model.totalProcessSync++; //C
							object.limit(1000);
							object.find({
								success: function(objects) {
									for (var i = objects.length - 1; i >= 0; i--) {
										if (new Date(objects[i].get('updatedAt').toString()).getTime() == dateUpdate) {
											objects.splice(i, 1);
										}
									}
									if (objects.length > 0) {
										$scope.findDataFromServerDone_2(objects, tableName);
									} else {
										$scope.model.countProcessSync++; //C
									}
								},
								error: function(model, error) {
									$scope.model.countProcessSync++; //C
								}
							});
						}
						$scope.model.countProcessSync++; //AA
					},
					error: function(error) {
						// The request failed
						$scope.model.countProcessSync++; //AA
					}
				});
				$scope.model.countProcessSync++; //A
			}, function(err) {
				$scope.model.countProcessSync++; //A
			});
		};
		$scope.findDataFromServerDone = function(objects, tableName) {
			objects.forEach(function(itemObject) {
				console.log(tableName + ' findDataFromServerDone', 1);
				$scope.model.totalProcessSync++; //D
				var where = {
					idOnline: itemObject.id
				};
				$DTA.selectTableWhere($scope.model.db, tableName, where).then(function(result) {
					if (result.rows.length > 0) {
						console.log(tableName + ' selectTableWhere', 1);
						$scope.model.totalProcessSync++; //F
						var itemLocal = result.rows[0];
						var dateUpdate = new Date(itemLocal.updated).getTime();
						var dateUpdateServer = new Date(itemObject.get('updatedAt').toString()).getTime();
						if (dateUpdateServer > dateUpdate) {
							var objectUpdate = {};
							for (var item in itemObject.attributes) {
								if (item == 'updatedAt') {
									objectUpdate.updated = itemObject.attributes[item].toString();
								} else if (item == 'createdAt') {
									objectUpdate.created = itemObject.attributes[item].toString();
								} else {
									objectUpdate[item] = itemObject.attributes[item];
								}
							};
							objectUpdate.isSync = true;
							$DTA.updateTableLocal($scope.model.db, tableName, objectUpdate, where).then(function(result) {
								$scope.model.isSuccess = false;
								$scope.model.countProcessSync++; //F
							}, function(err) {
								console.log(err);
								$scope.model.countProcessSync++; //F
							});
						} else {
							$scope.model.countProcessSync++; //F
						}
					} else {
						console.log(tableName + ' selectTableWhere', 1);
						$scope.model.totalProcessSync++; //G
						var objectInsert = {};
						for (var item in itemObject.attributes) {
							if (item == 'updatedAt') {
								objectInsert.updated = itemObject.attributes[item].toString();
							} else if (item == 'createdAt') {
								objectInsert.created = itemObject.attributes[item].toString();
							} else {
								objectInsert[item] = itemObject.attributes[item];
							}
						};
						objectInsert.isSync = true;
						objectInsert.idOnline = itemObject.id;
						$scope.model.isSyncToServer = false;
						$DTA.insertDataToTable($scope.model.db, tableName, objectInsert).then(function(result) {
							$scope.model.isSuccess = false;
							$scope.model.countProcessSync++; //G
						}, function(err) {
							console.log(err);
							$scope.model.countProcessSync++; //G
						});
					}
					$scope.model.countProcessSync++; //D
				}, function(err) {
					$scope.model.countProcessSync++; //D
				});
			});
			$scope.model.countProcessSync++; //B
		};
		$scope.findDataFromServerDone_2 = function(objects, tableName) {
			objects.forEach(function(itemObject) {
				console.log(tableName + ' findDataFromServerDone_2', 1);
				$scope.model.totalProcessSync++; //E
				var where = {
					idOnline: itemObject.id
				};
				$DTA.selectTableWhere($scope.model.db, tableName, where).then(function(result) {
					if (result.rows.length > 0) {
						console.log(tableName + ' selectTableWhere_2', 1);
						$scope.model.totalProcessSync++; //H
						var itemLocal = result.rows[0];
						var dateUpdate = new Date(itemLocal.updated).getTime();
						var dateUpdateServer = new Date(itemObject.get('updatedAt').toString()).getTime();
						if (dateUpdateServer > dateUpdate) {
							var objectUpdate = {};
							for (var item in itemObject.attributes) {
								if (item == 'updatedAt') {
									objectUpdate.updated = itemObject.attributes[item].toString();
								} else if (item == 'createdAt') {
									objectUpdate.created = itemObject.attributes[item].toString();
								} else {
									objectUpdate[item] = itemObject.attributes[item];
								}
							};
							objectUpdate.isSync = true;
							$DTA.updateTableLocal($scope.model.db, tableName, objectUpdate, where).then(function(result) {
								$scope.model.isSuccess = false;
								$scope.model.countProcessSync++; //H
							}, function(err) {
								console.log(err);
								$scope.model.countProcessSync++; //H
							});
						} else {
							$scope.model.countProcessSync++; //H
						}
					} else {
						console.log(tableName + ' selectTableWhere_2', 1);
						$scope.model.totalProcessSync++; //I
						var objectInsert = {};
						for (var item in itemObject.attributes) {
							if (item == 'updatedAt') {
								objectInsert.updated = itemObject.attributes[item].toString();
							} else if (item == 'createdAt') {
								objectInsert.created = itemObject.attributes[item].toString();
							} else {
								objectInsert[item] = itemObject.attributes[item];
							}
						};
						objectInsert.isSync = true;
						objectInsert.idOnline = itemObject.id;
						$scope.model.isSyncToServer = false;
						$DTA.insertDataToTable($scope.model.db, tableName, objectInsert).then(function(result) {
							$scope.model.isSuccess = false;
							$scope.model.countProcessSync++; //I
						}, function(err) {
							console.log(err);
							console.log(objectInsert.idOnline);
							$scope.model.countProcessSync++; //I
						});
					}
					$scope.model.countProcessSync++; //E
				}, function(err) {
					$scope.model.countProcessSync++; //E
				});
			});
			$scope.model.countProcessSync++; //C
		};
		$scope.syncDataFromClientToServer = function(userObj, tableName) {
			console.log(tableName + ' syncDataFromClientToServer', 1);
			$scope.model.totalProcessSync++; //1
			var where = {
				isSync: false
			};
			$DTA.selectTableWhere($scope.model.db, tableName, where).then(function(result) {
				if (result.rows.length > 0) {
					_.each(result.rows, function(item) {
						console.log(tableName + ' syncDataFromClientToServer selectTableWhere', 1);
						$scope.model.totalProcessSync++; //3
						$scope.model.isSuccess = false;
						if (angular.isDefined(item.idOnline) && item.idOnline != null) {
							var tableNameOb = Parse.Object.extend(tableName);
							var object = new Parse.Query(tableNameOb);
							object.get(item.idOnline, {
								success: function(objectRe) {
									$scope.model.isSuccess = false;
									for (var itemChild in item) {
										if (itemChild != 'isSync' && itemChild != 'created' && itemChild != 'updated' && itemChild != 'createdBy' && itemChild != 'deletedBy' && itemChild != 'isDeleted' && itemChild != 'idOnline') {
											objectRe.set(itemChild, item[itemChild]);
										}
									};
									objectRe.save(null, {
										success: function(objectReSave) {
											var objectWhere = {
												idOnline: item.idOnline
											}
											item.isSync = true;
											item.updated = objectReSave.get('updatedAt').toString();
											$DTA.updateTableLocal($scope.model.db, tableName, item, objectWhere)
											$scope.model.isSuccess = false;
											$scope.model.countProcessSync++; //3
										},
										error: function(model, error) {
											$scope.model.countProcessSync++; //3
										}
									});
								},
								error: function(model, error) {
									if (error.code == Parse.Error.OBJECT_NOT_FOUND) {
										var objectWhere = {
											idOnline: item.idOnline
										};
										$DTA.deleteTableLocal($scope.model, tableName, objectWhere);
										$scope.model.isSuccess = false;
									}
									$scope.model.countProcessSync++; //3
								}
							});
						} else {
							var tableNameOb = Parse.Object.extend(tableName);
							var object = new tableNameOb();
							var model = {};
							for (var itemChild in item) {
								if (itemChild != 'isSync' && itemChild != 'created' && itemChild != 'updated' && itemChild != 'idOnline') {
									model[itemChild] = item[itemChild];
								}
							};
							$DTA.executeParse(object, 'save', model).then(function(result) {
								item.idOnline = result.id;
								item.isSync = true;
								item.created = result.createdAt.toString();
								item.updated = result.updatedAt.toString();
								var objectWhere = {
									idOffline: item.idOffline
								};
								$DTA.updateTableLocal($scope.model.db, tableName, item, objectWhere);
								$scope.model.countProcessSync++; //3
							}, function(err) {
								$scope.model.countProcessSync++; //3
							});
						}
					});
				}
				$scope.model.countProcessSync++; //1
			}, function(err) {
				$scope.model.countProcessSync++; //1
			});
			// $scope.removeDataSyncFromClient(tableName);
		};
		// $scope.removeDataSyncFromClient = function(tableName) {
		//    console.log(tableName + ' removeDataSyncFromClient', 1);
		//    $scope.model.totalProcessSync++; //2
		//    where = {
		//       isSync: true
		//    };
		//    $DTA.selectTableWhere($scope.model.db, tableName, where).then(function(result) {
		//       if (result.rows.length > 0) {
		//          _.each(result.rows, function(item) {
		//             console.log(tableName + ' removeDataSyncFromClient selectTableWhere', 1);
		//             $scope.model.totalProcessSync++; //4
		//             $scope.model.isSuccess = false;
		//             var tableNameOb = Parse.Object.extend(tableName);
		//             var object = new Parse.Query(tableNameOb);
		//             object.get(item.idOnline, {
		//                success: function(objectRe) {
		//                   $scope.model.countProcessSync++; //4
		//                },
		//                error: function(model, error) {
		//                   if (error.code == Parse.Error.OBJECT_NOT_FOUND) {
		//                      var objectWhere = {
		//                         idOnline: item.idOnline
		//                      };
		//                      $DTA.deleteTableLocal($scope.model, tableName, objectWhere);
		//                      $scope.model.isSuccess = false;
		//                   }
		//                   $scope.model.countProcessSync++; //4
		//                }
		//             });
		//          });
		//       }
		//       $scope.model.countProcessSync++; //2
		//    }, function(err) {
		//       $scope.model.countProcessSync++; //2
		//    });
		// };
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
				$DTA.selectTableWhere($scope.model.db, $tableName.Users, user).then(function(result) {
					if (result.rows.length > 0) {
						$scope.model.currentUser = result.rows[0];
						var userUpdate = {
							password: CryptoJS.SHA3(angular.copy(model.password), {
								outputLength: 224
							}).toString()
						};
						$DTA.updateTable($scope.model.db, $tableName.Users, userUpdate, user).then(function(result) {
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
			$commonFunc.checkIsOnline().then(function(state) {
				if (state != Parse.Error.CONNECTION_FAILED) {
					$scope.model.isOnline = true;
					//login online
					Parse.User.logIn(user.username, user.password, {
						success: function(userObj) {
							$scope.syncUserToClient(user, userObj, function() {
								$scope.model.isLoadDoExercise = false;
								$scope.loginLocal(user, model);
								// $scope.model.loading.show({
								//    template: 'synchronizing your data</br><ion-spinner></ion-spinner>'
								// });
								NProgress.start();
								$scope.model.totalProcessSync = 0;
								$scope.model.countProcessSync = 0;
								for (var item in $tableName) {
									if (item != $tableName.Users) {
										//sync to client
										$scope.syncDataFromServerToClient(userObj, item);
										// sync to server
										$scope.syncDataFromClientToServer(userObj, item);
									}
								};
								$scope.model.interval = setInterval(function() {
									if ($scope.model.totalProcessSync === $scope.model.countProcessSync) {
										// $scope.model.loading.hide();
										console.log('abc');
										NProgress.done();
										clearInterval($scope.model.interval);
										$scope.model.isLoadDoExercise = true;
										$scope.loadDataFromDb($scope.model.db);
									}
								}, 2000);
							});
						},
						error: function(userObj, error) {
							if (error.code == Parse.Error.OBJECT_NOT_FOUND) {
								if (angular.isUndefined($scope.showAlertLogin)) {
									$scope.showAlertLogin = function() {
										var alertPopup = $ionicPopup.alert({
											title: 'Login',
											template: error.message
										});
										alertPopup.then(function(res) {
											$scope.showLogin();
										});
									};
								}
								$scope.showAlertLogin();
							}
						}
					});
				} else {
					$scope.loginLocal(user, model);
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
			var uid = new Date().getTime().toString();
			var users = {
				uid: _.uniqueId(uid),
				username: CryptoJS.SHA3(angular.copy(model.username), {
					outputLength: 224
				}).toString(),
				password: CryptoJS.SHA3(angular.copy(model.password), {
					outputLength: 224
				}).toString(),
				email: model.email,
				isDeleted: '',
				deletedBy: '',
			};
			$commonFunc.getNextIdOfTable($tableName.Users, function(idOffline) {
				users.idOffline = idOffline;
				$DTA.insertDataToTable($scope.model.db, $tableName.Users, users).then(function(result) {
					var user = {
						username: model.username,
						password: model.password
					};
					localStorage.user = angular.toJson(user);
					//refresh data
					$scope.initModel();
					$scope.model.currentUser = users;
					$timeout(function() {
						var configModel = {
							name: 'maxCountLearn',
							value: '10',
							deletedBy: '',
							isDeleted: '',
							createdBy: users.idOnline
						};
						$DTA.insertDataToTable($scope.model.db, $tableName.Configs, configModel).then(function(result) {
							console.log('save configs', result);
						}, function(err) {
							console.log('save config err', err);
						});
						// get fibonacci
						$DTA.selectTableAll(db, $tableName.Fibonacci).then(function(result) {
							_.each(result.rows, function(item) {
								$scope.model.fibonacci.push(item);
							});
							if (result.rows.length == 0) {
								//insert default data
								var item = {
									isDeleted: '',
									deletedBy: '',
									number: '1'
								};
								$DTA.insertDataToTable($scope.model.db, $tableName.Fibonacci, item);
								item = {
									isDeleted: '',
									deletedBy: '',
									number: '2'
								};
								$DTA.insertDataToTable($scope.model.db, $tableName.Fibonacci, item);
								item = {
									isDeleted: '',
									deletedBy: '',
									number: '3'
								};
								$DTA.insertDataToTable($scope.model.db, $tableName.Fibonacci, item);
							}
						}, function(err) {});
					});
					$scope.loadDataFromDb($scope.model.db);
					$scope.sigupModal.hide();
					$scope.showSelectLanguage();
					$commonFunc.setView('#/main');
				}, function(err) {
					console.log(err);
				});
			});
		};
		$scope.logOut = function() {
			localStorage.user = null;
			$scope.showLogin();
			$scope.popoverMenu.hide();
			Parse.User.logOut();
		};
		$scope.createTableNeeded = function(db) {
			$DTA.createTableNeeded(db);
		};
		$scope.loadDataFromDb = function(db) {
			//reload fibonacci
			$DTA.selectTableAll(db, $tableName.Fibonacci).then(function(result) {
				_.each(result.rows, function(item) {
					$scope.model.fibonacci.push(item);
				});
			}, function(err) {});
			//load config
			var whereConfig = {
				createdBy: $scope.model.currentUser.idOnline
			}
			$DTA.selectTableWhere(db, $tableName.Configs, whereConfig).then(function(result) {
				_.each(result.rows, function(item) {
					eval('$scope.model.' + item.name + ' = ' + item.value);
				});
				// get class
				$scope.getClasses(function(listClass) {
					$scope.model.lessonListDo = [];
					listClass.forEach(function(itemClass) {
						$DTA.selectLessonsOfClasses(db, itemClass.idOffline).then(function(result) {
							_.each(result.rows, function(item) {
								$scope.model.lessonListDo.push(item);
								$scope.model.isSuccessGetClass = false;
							});
						}, function(err) {});
					});
				});
				$scope.model.needExercisesCount = 0;
				// prevent load do exercise
				if ($scope.model.isLoadDoExercise != false) {
					_.each($scope.model.lessonListDo, function(item) {
						if (item.nextLearnDate != null && item.nextLearnDate != '') {
							var today = new Date().toISOString();
							today = today.substr(0, 10);
							var itemNextLearnDate = new Date(item.nextLearnDate).toISOString();
							itemNextLearnDate = itemNextLearnDate.substr(0, 10);
							var todayTime = new Date(today).getTime();
							var nextDateTime = new Date(itemNextLearnDate).getTime();
							if (todayTime >= nextDateTime && item.countLearn < $scope.model.maxCountLearn) {
								$scope.model.needExercisesCount++;
								var itemUpdate = {
									state: 2
								};
								var itemWhere = {
									idOffline: item.idOffline
								};
								$DTA.updateTable($scope.model.db, $tableName.Lessons, itemUpdate, itemWhere);
							}
						}
					});
					if ($scope.model.needExercisesCount > 0) {
						var sringNote = null;
						if ($scope.model.needExercisesCount == 1) {
							sringNote = 'There is ' + $scope.model.needExercisesCount + ' lesson need to do exercises';
						} else {
							sringNote = 'There are ' + $scope.model.needExercisesCount + ' lessons need to do exercises';
						}
						try {
							$cordovaLocalNotification.schedule({
								idOffline: 1,
								title: 'Notification do exercises',
								text: sringNote
							});
						} catch (e) {
							if (!Notification) {
								alert('Desktop notifications not available in your browser. Try Chromium.');
								return;
							}
							if (Notification.permission !== "granted") Notification.requestPermission();
							else {
								$scope.model.notification = new Notification('Notification do exercises', {
									icon: './img/icon.png',
									body: sringNote
								});
								$scope.model.notification.onclick = function() {
									$scope.showDoExercisesNeedList();
									$scope.model.notification.close();
									$scope.model.notification = null;
								};
							}
						}
					}
				}
				$scope.model.languageItem = $scope.model.languageLearn.toString();
			}, function(err) {});
			//check lesson relearn
			// $DTA.selectTableAll(db, $tableName.Lessons).then(function(resultChild) {
			//     _.each(resultChild.rows, function(item) {
			//         if (item.nextLearnDate != null && item.nextLearnDate != '') {
			//             var today = new Date().toISOString();
			//             today = today.substr(0, 10);
			//             var itemNextLearnDate = new Date(item.nextLearnDate).toISOString();
			//             itemNextLearnDate = itemNextLearnDate.substr(0, 10);
			//             var todayTime = new Date(today).getTime();
			//             var nextDateTime = new Date(itemNextLearnDate).getTime();
			//             if (todayTime >= nextDateTime && item.countLearn < $scope.model.maxCountLearn) {
			//                 $scope.model.needExercisesCount++;
			//                 var itemUpdate = {
			//                     state: 2
			//                 };
			//                 var itemWhere = {
			//                     idOffline: item.idOffline
			//                 };
			//                 $DTA.updateTable($scope.model.db, $tableName.Lessons, itemUpdate, itemWhere);
			//             }
			//         }
			//     });
			//     if ($scope.model.needExercisesCount > 0) {
			//         var sringNote = null;
			//         if ($scope.model.needExercisesCount == 1) {
			//             sringNote = 'There is ' + $scope.model.needExercisesCount + ' lesson need to do exercises';
			//         } else {
			//             sringNote = 'There are ' + $scope.model.needExercisesCount + ' lessons need to do exercises';
			//         }
			//         try {
			//             $cordovaLocalNotification.schedule({
			//                 idOffline: 1,
			//                 title: 'Notification do exercises',
			//                 text: sringNote
			//             });
			//         } catch (e) {
			//             if (!Notification) {
			//                 alert('Desktop notifications not available in your browser. Try Chromium.');
			//                 return;
			//             }
			//             if (Notification.permission !== "granted") Notification.requestPermission();
			//             else {
			//                 $scope.model.notification = new Notification('Notification do exercises', {
			//                     icon: './img/icon.png',
			//                     body: sringNote
			//                 });
			//                 $scope.model.notification.onclick = function() {
			//                     $scope.showDoExercisesNeedList();
			//                     $scope.model.notification.close();
			//                 };
			//             }
			//         }
			//     }
			// }, function(err) {});
		};
		$rootScope.$on('$cordovaLocalNotification:trigger', function(event, notification, state) {
			$cordovaVibration.vibrate(1000);
		});
		$rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
			$scope.showDoExercisesNeedList();
		});
		$scope.showDoExercisesNeedList = function() {
			$scope.model.doExercisesNeedList = [];
			$timeout(function() {
				var lessonWhere = {
					state: 2
				}
				$DTA.selectTableWhere($scope.model.db, $tableName.Lessons, lessonWhere).then(function(result) {
					_.each(result.rows, function(item) {
						$scope.model.doExercisesNeedList.push(item);
					});
				}, function(err) {});
			});
			$commonFunc.setView('#/doExercisesNeedList');
		};
		$scope.getLessonOfClass = function(classes) {
			classes.lessons = [];
			var where = {
				classId: classes.idOffline
			}
			$DTA.selectTableWhere($scope.model.db, $tableName.ClassesLessons, where).then(function(result) {
				_.each(result.rows, function(item) {
					var where = {
						idOffline: item.lessonId
					};
					$DTA.selectTableWhere($scope.model.db, $tableName.Lessons, where).then(function(resultChild) {
						classes.lessons.push(resultChild.rows[0]);
					}, function(err) {});
				});
			}, function(err) {
				console.log(err);
			});
		};
		$scope.getClasses = function(fnCallback) {
			$scope.model.classes = []
			if (angular.isUndefined($scope.model.languageLearn)) {
				return;
			}
			var where = {
				userId: $scope.model.currentUser.idOffline,
				idLanguage: $scope.model.languageLearn.toString()
			};
			$DTA.selectTableWhere($scope.model.db, $tableName.Classes, where).then(function(result) {
				_.each(result.rows, function(item) {
					$scope.model.classes.push(item);
				});
				$scope.model.classList = _.map(result.rows, function(item) {
					return item = {
						idOffline: item.idOffline,
						name: item.name,
						vocabulary: [],
						lessons: []
					};
				});
				(fnCallback || angular.noop)($scope.model.classes);
			}, function(err) {});
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
		$scope.backView = function() {
			var index = $scope.model.viewList.lastIndexOf($scope.model.view);
			$scope.model.view = $scope.model.viewList[index - 1];
			$window.location = $scope.model.view;
			$scope.model.viewList.pop();
		};
		$scope.showHome = function() {
			$ionicSideMenuDelegate.toggleLeft();
			$commonFunc.setView('#/main');
			$scope.model.viewList = ['#/main'];
		};
		$scope.toggleLeft = function() {
			$ionicSideMenuDelegate.toggleLeft();
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
			$commonFunc.setView('#/classContent');
			$scope.model.currentClass = classItem;
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
		$scope.reload = function() {
			$commonFunc.setView('#/main');
			location.reload(); // = location.origin;
		};
		$scope.exit = function() {
			$scope.popoverMenu.hide();
			(navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
		};
		$scope.showSetting = function() {
			$scope.popoverMenu.hide();
			$commonFunc.setView('#/setting');
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
			$commonFunc.setView('#/profile');
		};
		$scope.chooseLesson = function(item, exercise) {
			$scope.model.currentLesson = item;
			$commonFunc.getWordsOfLesson();
			$commonFunc.setView('#/mainLesson');
			if (exercise) {
				return;
			}
			$ionicSideMenuDelegate.toggleLeft();
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
							$commonFunc.removeClass(classes, true);
							$commonFunc.setView('#/main');
						} else {}
					});
				};
			}
			$scope.showConfirmRemoveClass(classes);
		};
		$scope.showPopupAddClass = function(update) {
			if (angular.isDefined($scope.actionSheetClass)) {
				$scope.actionSheetClass.hide();
			}
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
						idOffline: $scope.model.currentClass.idOffline
					}
					$DTA.updateTable($scope.model.db, $tableName.Classes, updateClass, whereClass).then(function(result) {
						$scope.getClasses();
					}, function(err) {});;
					$scope.model.currentClass.name = res;
					return;
				}
				if (angular.isUndefined($scope.addClass)) {
					$scope.addClass = function(res) {
						// insert to db
						$commonFunc.getNextIdOfTable($tableName.Classes, function(idOffline) {
							var classesItem = {
								createdBy: $scope.model.currentUser.idOffline,
								userId: $scope.model.currentUser.idOffline,
								idOffline: idOffline,
								name: res,
								isDeleted: '',
								deletedBy: '',
								idLanguage: $scope.model.languageLearn.toString()
							};
							$DTA.insertDataToTable($scope.model.db, $tableName.Classes, classesItem);
							//insert to model
							var params = {
								idOffline: idOffline,
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
		$scope.showActionClass = function($event) {
			if (!$scope.actionSheetClass) {
				$ionicPopover.fromTemplateUrl('./templates/actionSheetClass.html', {
					scope: $scope,
				}).then(function(actionSheetClass) {
					$scope.actionSheetClass = actionSheetClass;
					$scope.actionSheetClass.show($event);
				});
			} else {
				$scope.actionSheetClass.show($event);
			}
		};
		/**
		 * [showExsercise description]
		 * @param  [type]  [description]
		 * @return [type]  [description]
		 */
		$scope.showExsercise = function() {
			$ionicSideMenuDelegate.toggleLeft();
			$scope.showDoExercisesNeedList();
			if (angular.isDefined($scope.actionSheetClass)) {
				$scope.actionSheetClass.hide();
			}
		};
		$ionicPlatform.ready(function() {
			$scope.init();
		});
	}
]);