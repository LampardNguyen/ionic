angular.module('starter').controller('addNewWordCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonSql', '$DTA', '$commonFunc', '$ionicFilterBar', '$tableName', '$cordovaToast', function($rootScope, $scope, $commonModel, $timeout, $commonSql, $DTA, $commonFunc, $ionicFilterBar, $tableName, $cordovaToast) {
	$scope.model = $commonModel;
	$scope.init = function() {
		$scope.model.search.$ = '';
		$scope.model.newWordList = [];
		$scope.model.newWordListTmp = [];
		$scope.resetAddNewWords();
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
	$scope.AddNewWords = function() {
		// insert to db words and ClassesWords
		$commonFunc.getNextIdOfTable($tableName.Words, function(idOffline) {
			var itemWords = {
				isDeleted: '',
				deletedBy: '',
				createdBy: $scope.model.currentUser.idOffline,
				idOffline: idOffline,
				english: $scope.model.english,
				vietnamese: $scope.model.vietnamese,
				example: $scope.model.example,
				isLearned: 0
			};
			$DTA.insertDataToTable($scope.model.db, $tableName.Words, itemWords);
			var itemClasses_Words = {
				isDeleted: '',
				deletedBy: '',
				createdBy: $scope.model.currentUser.idOffline,
				classId: $scope.model.currentClass.idOffline,
				wordId: idOffline
			};
			$DTA.insertDataToTable($scope.model.db, $tableName.ClassesWords, itemClasses_Words);
			//insret to model
			$scope.model.currentClass.vocabulary.push(itemWords);
			$scope.model.newWordList.push(itemWords);
			$scope.model.newWordListTmp.push(itemWords);
			$scope.resetAddNewWords();
			$("#inputFirst").focus();
		});
	};
	$scope.initAddNewWordsForm = function(form) {
		$timeout(function() {
			$scope.addNewWordsForm = form.addNewWordsForm;
		}, 100);
	};
	$scope.chooseFile = function() {
		$('#chooseFile').trigger('click');
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
			idOffline: $scope.model.wordIdCount,
			english: english,
			vietnamese: vietnamese,
			example: example,
			isLearned: 0,
			isDeleted: '',
			deletedBy: '',
			createdBy: $scope.model.currentUser.idOffline,
			isSync: false
		};
		var itemClasses_Words = {
			classId: $scope.model.currentClass.idOffline,
			wordId: $scope.model.wordIdCount,
			isDeleted: '',
			deletedBy: '',
			createdBy: $scope.model.currentUser.idOffline,
			isSync: false
		};
		if ($scope.model.wordIdCount === null) {
			$commonFunc.getNextIdOfTable($tableName.Words, function(idOffline) {
				itemWords.idOffline = idOffline;
				itemClasses_Words.wordId = idOffline;
				$scope.model.wordIdCount = idOffline + 1;
				$DTA.importWordsClasses_words($scope.model.db, itemWords, itemClasses_Words, length, n);
				//insret to model
				$scope.model.newWordListTmp.push(itemWords);
				$scope.insertDataWhenImport(arr, ++n, length);
			});
		} else {
			$DTA.importWordsClasses_words($scope.model.db, itemWords, itemClasses_Words, length, n);
			$scope.model.wordIdCount++;
			//insret to model
			$scope.model.newWordListTmp.push(itemWords);
			$scope.insertDataWhenImport(arr, ++n, length);
		}
	};
	$scope.showFilterBar = function() {
		var filterBarInstance = $ionicFilterBar.show({
			items: $scope.model.newWordList,
			update: function(filteredItems, filterText) {
				$scope.model.newWordList = filteredItems;
				$scope.model.search.$ = filterText;
			}
		});
	};
	$scope.inputSpeech = function(modelName, language) {
		// 'ja-JP' ,'vi-VN'
		// recognition.onresult = function(event) {
		// 	console.log(event)
		// }
		// var recognition = new SpeechRecognition();
		if (!('webkitSpeechRecognition' in window)) {
			$cordovaToast.show('Sorry, your Device does not support the Speech API', 'short', 'bottom');
		} else {
			$scope.model.loading.show({
				template: '<span class="ion-ios-mic-outline"></span>'
			});
			var recognition = new webkitSpeechRecognition();
			recognition.lang = language;
			recognition.onresult = function(event) {
				if (event.results.length > 0) {
					if (eval('!$scope.model.' + modelName)) {
						eval('$scope.model.' + modelName + ' = ""');
					}
					eval('$scope.model.' + modelName + ' += event.results[0][0].transcript');
					$scope.model.loading.hide();
				}
			}
			recognition.onerror = function(event) {
				$scope.model.loading.hide();
			};
			recognition.start();
			$timeout(function() {
				$scope.model.loading.hide();
			}, 10000);
		}
	};
}]);
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