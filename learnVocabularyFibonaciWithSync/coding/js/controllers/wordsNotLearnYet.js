angular.module('starter').controller('wordsNotLearnYetCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$ionicFilterBar', '$controller', '$ionicPopover', '$ionicModal', '$tableName', '$DTA', '$ionicPopup', function($rootScope, $scope, $commonModel, $timeout, $ionicFilterBar, $controller, $ionicPopover, $ionicModal, $tableName, $DTA, $ionicPopup) {
	$scope.model = $commonModel;
	$controller('allWordOfClassCtrl', {
		'$scope': $scope
	});
	$scope.init = function() {
		$scope.model.currentClass.vocabulary = null;
		$scope.model.search.$ = '';
		$scope.model.countCheck = 0;
	};
	$scope.showFilterBar = function() {
		if ($scope.popoverEdit) {
			$scope.popoverEdit.hide();
		}
		var filterBarInstance = $ionicFilterBar.show({
			items: $scope.model.currentClass.vocabulary,
			update: function(filteredItems, filterText) {
				$scope.model.currentClass.vocabulary = filteredItems;
			}
		});
	};
	$scope.checkToEdit = function() {
		$scope.model.countCheck = 0;
		$scope.model.currentClass.vocabulary.forEach(function(item) {
			if (item.check == 1) {
				$scope.model.countCheck++;
			}
		});
	};
	$scope.showPopoverEdit = function($event) {
		if (!$scope.popoverEdit) {
			$ionicPopover.fromTemplateUrl('./templates/popoverEditWordNotYetLearn.html', {
				scope: $scope,
			}).then(function(popoverEdit) {
				$scope.popoverEdit = popoverEdit;
				$scope.popoverEdit.show($event);
			});
		} else {
			$scope.popoverEdit.show($event);
		}
	};
	$scope.transferTo = function() {
		$scope.popoverEdit.hide();
		if (!$scope.transferToModal) {
			$ionicModal.fromTemplateUrl('./templates/modalTransferTo.html', function(modal) {
				$scope.transferToModal = modal;
				$scope.transferToModal.show();
			}, {
				scope: $scope,
				animation: 'slide-in-up',
				focusFirstInput: true,
				backdropClickToClose: false,
				hardwareBackButtonClose: false
			});
		} else {
			$scope.transferToModal.show();
		}
	};
	$scope.chooseClassTransfer = function(itemClass) {
		$scope.model.classTransfer = itemClass;
	};
	$scope.acceptTransfer = function() {
		for (var i = $scope.model.currentClass.vocabulary.length - 1; i >= 0; i--) {
			var itemFor = $scope.model.currentClass.vocabulary[i];
			if (itemFor.check == 1) {
				var whereUpdate = {
					wordId: itemFor.idOffline
				};
				var update = {
					classId: $scope.model.classTransfer.idOffline
				};
				$DTA.updateTable($scope.model.db, $tableName.ClassesWords, update, whereUpdate);
				$scope.model.currentClass.vocabulary.splice(i, 1);
			}
		}
		$scope.transferToModal.hide();
	};
	$scope.cancelTransfer = function() {
		$scope.transferToModal.hide();
	};
	$scope.deleteTheseRows = function() {
		for (var i = $scope.model.currentClass.vocabulary.length - 1; i >= 0; i--) {
			var itemFor = $scope.model.currentClass.vocabulary[i];
			if (itemFor.check == 1) {
				$scope.removeWords(itemFor);
			}
		}
	};
	$scope.confirmDeleteRows = function() {
		$scope.popoverEdit.hide();
		var confirmPopup = $ionicPopup.confirm({
			title: 'Confirm delete!',
			template: 'Are you sure you want to delete these rows?'
		});
		confirmPopup.then(function(res) {
			if (res) {
				$scope.deleteTheseRows();
			}
		});
	};
}]);