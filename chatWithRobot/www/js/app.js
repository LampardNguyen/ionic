// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic']).run(function($ionicPlatform) {
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
}).controller('mainCtrl', ['$scope', '$ionicPlatform', function($scope, $ionicPlatform) {
  $scope.model = {
    random: Math.random().toString()
  };
  $scope.init = function() {};
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    $scope.init();
  });
}]).directive('formatFormChat', function() {
  return {
    restrict: 'A',
    link: function(scope, iElement, iAttrs) {
      var height = $('.content0000').height();
      var width = $('.content0000').width();
      iElement.css({
        'height': height,
        'width': width
      });
    }
  };
});