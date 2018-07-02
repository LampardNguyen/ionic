angular.module('starter').controller('allWordOfClassCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$ionicModal', '$DTA', '$ionicPopup', '$ionicListDelegate', '$ionicFilterBar', '$commonFunc', '$tableName', function($rootScope, $scope, $commonModel, $timeout, $ionicModal, $DTA, $ionicPopup, $ionicListDelegate, $ionicFilterBar, $commonFunc, $tableName) {
	$scope.model = $commonModel;
	$scope.init = function() {
		$scope.model.loading.show();
		$scope.model.currentClass.vocabulary = null;
		$scope.model.search.$ = '';
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
						$ionicListDelegate.closeOptionButtons();
					} else {}
				});
			};
		}
		$scope.showConfirmRemoveWord(word);
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
	$scope.removeWords = function(word) {
		//remove ClassesWords
		var whereWord = {
			wordId: word.idOffline
		};
		$DTA.deleteTable($scope.model, $tableName.ClassesWords, whereWord);
		//remove word in list show
		var wordIndex = _.findIndex($scope.model.currentClass.vocabulary, function(item) {
			return (item.idOffline == word.idOffline);
		});
		$scope.model.currentClass.vocabulary.splice(wordIndex, 1);
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
			idOffline: $scope.model.currentWord.idOffline
		};
		$DTA.updateTable($scope.model.db, $tableName.Words, valueUpdate, whereWord);
		$scope.model.currentWord.english = $scope.model.english;
		$scope.model.currentWord.vietnamese = $scope.model.vietnamese;
		$scope.model.currentWord.example = $scope.model.example;
		$scope.closeUpdateWords();
		$ionicListDelegate.closeOptionButtons();
	};
	$scope.closeUpdateWords = function() {
		$scope.updateWordsModal.hide();
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
	$scope.showFilterBar = function() {
		var filterBarInstance = $ionicFilterBar.show({
			items: $scope.model.currentClass.vocabulary,
			update: function(filteredItems, filterText) {
				$scope.model.currentClass.vocabulary = filteredItems;
			}
		});
	};
	$scope.inputSpeech = function(modelName, language) {
		$scope.model.loading.show({
			template: '<span class="ion-ios-mic-outline"></span>'
		});
		var recognition = new webkitSpeechRecognition();
		// 'ja-JP' ,'vi-VN'
		// recognition.onresult = function(event) {
		// 	console.log(event)
		// }
		// var recognition = new SpeechRecognition();
		recognition.lang = language;
		recognition.onresult = function(event) {
			if (event.results.length > 0) {
				eval('$scope.model.' + modelName + ' = event.results[0][0].transcript');
				$scope.model.loading.hide();
			}
		}
		recognition.onerror = function(event) {
			$scope.model.loading.hide();
		};
		recognition.start();
	};
}]);