// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'system-exe.chat']).run(function($ionicPlatform) {
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
angular.module('starter').controller('mainCtrl', ['$rootScope', '$scope', 'Items', 'Auth', '$ionicPlatform', '$ionicModal', '$ionicLoading', '$timeout', '$ionicScrollDelegate', '$systemChat', function($rootScope, $scope, Items, Auth, $ionicPlatform, $ionicModal, $ionicLoading, $timeout, $ionicScrollDelegate, $systemChat) {
    $scope.model = {
        Items: Items,
        Auth: Auth,
        username: null,
        password: null,
        messageInfo: {
            username: null,
            time: null,
            message: null,
            timeago: null
        },
        messageSend: null
    };
    $scope.init = function() {
        console.log('items', Items);
        console.log('Auth', Auth);
        $systemChat.checkAuthen().then(function(success) {
            console.log(success);
            $scope.model.userAuth = success;
        }, function(err) {
            console.log(err);
            $scope.login();
        });
        setInterval(function() {
            $('time.time').timeago();
            $ionicScrollDelegate.scrollBottom();
        }, 500);
    };
    $scope.logout = function() {
        $scope.model.Auth.$unauth();
        $scope.login();
    };
    $scope.login = function() {
        if (angular.isDefined($scope.sigupModal)) {
            $scope.sigupModal.hide();
        }
        if (!angular.isDefined($scope.loginModal)) {
            $ionicModal.fromTemplateUrl('./template/login.html', function(modal) {
                modal.backdropClickToClose = false;
                $scope.loginModal = modal;
                $scope.loginModal.show();
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        } else {
            $scope.loginModal.show();
        }
    };
    $scope.showSigup = function() {
        $scope.model.newUser = {
            name: null,
            password: null,
            passConfirm: null,
            email: null
        };
        if (!angular.isDefined($scope.sigupModal)) {
            $ionicModal.fromTemplateUrl('./template/sigup.html', function(modal) {
                modal.backdropClickToClose = false;
                $scope.sigupModal = modal;
                $scope.loginModal.hide();
                $scope.sigupModal.show();
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        } else {
            $scope.loginModal.hide();
            $scope.sigupModal.show();
        }
    };
    $scope.createNewUserSubmit = function() {
        $scope.loading = $ionicLoading.show({
            content: 'loging...',
            showBackdrop: false
        });
        $systemChat.sigup($scope.model.newUser).then(function(success) {
            console.log(success);
            $scope.sigupModal.hide();
            $scope.loading.hide();
        }, function(err) {
            console.log(err);
            $scope.loading.hide();
        });
    };
    $scope.loginSubmit = function() {
        $scope.loading = $ionicLoading.show({
            content: 'loging...',
            showBackdrop: false
        });
        $systemChat.login($scope.model.username, $scope.model.password).then(function(success) {
            console.log("Authenticated successfully with payload:", success);
            $scope.model.userAuth = success;
            $scope.loginModal.hide();
            $scope.loading.hide();
        }, function(err) {
            console.log("Login Failed!", err);
            $scope.loading.hide();
        });
    };
    $scope.sendMessage = function() {
        if ($scope.model.messageSend == null || $scope.model.messageSend == '') {
            return;
        }
        $scope.model.messageInfo = {
            username: $scope.model.userAuth.password.email,
            time: new Date().toISOString(),
            message: angular.copy($scope.model.messageSend),
            timeago: new Date().toISOString() //$.timeago(this.time)
        }
        $scope.model.Items.$add($scope.model.messageInfo);
        $scope.model.messageSend = null;
    };
    $ionicPlatform.ready(function() {
        $scope.init();
    });
}]);