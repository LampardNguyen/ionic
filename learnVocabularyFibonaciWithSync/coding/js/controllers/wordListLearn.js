angular.module('starter').controller('wordListLearnCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$ionicPopover', '$cordovaToast', '$ionicModal', '$tableName', '$commonFunc', '$DTA', '$ionicScrollDelegate', function($rootScope, $scope, $commonModel, $timeout, $ionicPopover, $cordovaToast, $ionicModal, $tableName, $commonFunc, $DTA, $ionicScrollDelegate) {
	$scope.model = $commonModel;
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
	$scope.checkShowCompleteLesson = function(list) {
		return list.some(function(item) {
			return (item.isRemember != 1);
		}); // isValid is true
	};
	$scope.endLesson = function() {
		//update to db
		if (angular.isDefined($scope.popoverModeTravel)) {
			$scope.popoverModeTravel.hide();
		}
		$commonFunc.setView('#/main');
		if ($scope.model.currentLesson.state == 1) {
			return;
		}
		var itemLessons = {};
		var newList = $scope.model.lessonList.filter(function(item) {
			return (item.idOffline == $scope.model.currentLesson.idOffline);
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
				state: '1',
				learnStartDate: today,
				relearnDate: today,
				nextLearnDate: nextLearnDate,
				isLearned: '1',
				countLearn: (++itemLessons.countLearn).toString()
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
					isDeleted: '',
					deletedBy: '',
					number: nextFibonaci
				};
				$DTA.insertDataToTable($scope.model.db, $tableName.Fibonacci, itemFibonacciObject);
			} else {
				nextFibonaci = $scope.model.fibonacci[indexFibo + 1].number;
			}
			var date = new Date(today).getTime();
			var nextLearnTime = date + ((nextFibonaci - itemLessons.nextFibonaci) * 24 * 3600 * 1000);
			nextLearnDate = new Date(nextLearnTime).toISOString();
			nextLearnDate = nextLearnDate.substr(0, 10);
			itemLessonsObject = {
				state: '1',
				relearnDate: today,
				nextLearnDate: nextLearnDate,
				isLearned: '1',
				nextFibonaci: nextFibonaci,
				countLearn: (++itemLessons.countLearn).toString()
			};
		}
		itemLessonsObjectWhere = {
			idOffline: itemLessons.idOffline
		};
		$DTA.updateTable($scope.model.db, 'Lessons', itemLessonsObject, itemLessonsObjectWhere);
		angular.forEach($scope.model.lessonList, function(item) {
			if (item.idOffline == $scope.model.currentLesson.idOffline) {
				item.state = '1';
				item.nextLearnDate = itemLessonsObject.nextLearnDate;
			}
		});
		angular.forEach($scope.model.currentClass.lessons, function(item) {
			if (item.idOffline == $scope.model.currentLesson.idOffline) {
				item.state = '1';
			}
		});
	};
	$scope.showAllWords = function() {
		$scope.model.wordList.forEach(function(item) {
			item.isRemember = false;
		});
		$scope.popoverModeTravel.hide();
	};
	$scope.speak = function(string) {
		var url = 'http://translate.google.com/translate_tts?tl=' + $scope.model.languages[$scope.model.languageLearn].value2 + '&q=';
		var endUrl = '&client=t';
		url += encodeURIComponent(string.split('(')[0].toString()) + endUrl;
		var a = new Audio(url);
		a.onerror = function(err) {
			var msg = new SpeechSynthesisUtterance();
			var voices = window.speechSynthesis.getVoices();
			msg.text = string.split('(')[0].toString();
			msg.lang = $scope.model.languages[$scope.model.languageLearn].value;
			msg.onerror = function(e) {
				$cordovaToast.show('Can\'t not play', 'short', 'bottom');
			};
			speechSynthesis.speak(msg);
		};
		a.play();
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
	$scope.hideTestWord = function() {
		$scope.testWordModal.hide();
	};
	$scope.startSpeech = function() {
		if (!('webkitSpeechRecognition' in window)) {
			$cordovaToast.show('Sorry, your Device does not support the Speech API', 'short', 'bottom');
		} else {
			$scope.model.loading.show({
				template: '<span class="ion-ios-mic-outline"></span>'
			});
			var recognition = new webkitSpeechRecognition();
			// 'ja-JP'
			// recognition.onresult = function(event) {
			// 	console.log(event)
			// }
			// var recognition = new SpeechRecognition();
			recognition.lang = $scope.model.languages[$scope.model.languageLearn].value;
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
			$timeout(function() {
				$scope.model.loading.hide();
			}, 10000);
		}
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
	$scope.checkIfShowHideVietnamese = function() {
		return $scope.model.wordList.every(function(item) {
			return (item.isShowVietnamese == 0);
		}); // isValid is true
	};
}]);