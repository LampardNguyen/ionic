// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
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

function MainController($ionicLoading, $compile, $ionicModal,
    $scope, $ionicPopover, $ionicPopup, $cordovaGeolocation,
    $ionicActionSheet, $cordovaDevice, $cordovaActionSheet, $ionicPlatform, $timeout, $cordovaToast) {
    var self = this;
    self.markers = [];
    self.markerDirections = [];
    self.startMarker = null;
    self.endMarker = null;
    self.km = null;
    self.initialize = function() {
        var my = new google.maps.LatLng(10.761668, 106.785777);
        var mapOptions = {
            // streetViewControl: true,
            // center: my,
            // zoom: 16,
            // mapTypeId: google.maps.MapTypeId.ROADMAP,

            zoom: 15, // The initial zoom level when your map loads (0-20)
            minZoom: 6, // Minimum zoom level allowed (0-20)
            //maxZoom: 17, // Maximum soom level allowed (0-20)
            zoomControl: true, // Set to true if using zoomControlOptions below, or false to remove all zoom controls.
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.DEFAULT // Change to SMALL to force just the + and - buttons.
            },
            center: my, // Centre the Map to our coordinates variable
            mapTypeId: google.maps.MapTypeId.ROADMAP, // Set the type of Map
            scrollwheel: true, // Disable Mouse Scroll zooming (Essential for responsive sites!)
            // All of the below are set to true by default, so simply remove if set to true:
            panControl: false, // Set to false to disable
            mapTypeControl: true, // Disable Map/Satellite switch
            scaleControl: true, // Set to false to hide scale
            streetViewControl: true, // Set to disable to hide street view
            overviewMapControl: false, // Set to false to remove overview control
            rotateControl: true, // Set to false to disable rotate control
            disableDefaultUI: true
        };
        var map = new google.maps.Map($("#map-canvas")[0],
            mapOptions);
        // google.maps.event.addListener(map, 'click', function(item) {
        //     self.positionOnMap = item;
        // });
        google.maps.event.addListener(map, 'click', function(item) {
            var position = item.latLng;
            self.markerRight = new google.maps.Marker({
                draggable: true,
                position: position,
                map: map,
                title: ''
            });
            self.addEventRightClickOnMarker(self.markerRight);
            self.markers.push(self.markerRight);
        });

        self.map = map;
    };
    self.touchOnMap = function() {
        setTimeout(function() {
            google.maps.event.trigger(self.map, 'clickOnMap',
                self.positionOnMap
            );
        }, 300);
    };
    self.closeMarkerActionSheet = function() {
        if (self.markerCurrent == null) {
            self.markerRight.setMap(null);
            self.markerRight = null;
        }
    };
    self.refreshMarker = function() {
        angular.forEach(self.markers, function(item) {
            item.setMap(null);
        });
        self.markers = [];
        angular.forEach(self.markerDirections, function(item) {
            item.setMap(null);
        });
        self.markerDirections = [];
        if (self.directionsDisplay) {
            self.directionsDisplay.setMap(null);
        }
        self.startMarker = null;
        self.endMarker = null;
        if (self.circle) {
            self.circle.setMap(null);
            self.isShowMe = false;
        }
        self.km = null;
    };
    self.findMe = function() {
        if (!self.map) {
            return;
        }
        self.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });
        var posOptions = {
            timeout: 10000,
            enableHighAccuracy: true
        };
        if (!self.isShowMe) {
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(pos) {
                var userLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                self.map.setCenter(userLatLng);
                self.loading.hide();
                self.circle = new google.maps.Circle({
                    center: userLatLng,
                    radius: 100,
                    map: self.map,
                    fillColor: '#bcbcf4',
                    fillOpacity: 0.5,
                    strokeColor: '#bcbcf4',
                    strokeOpacity: 1.0,
                    scale: 10
                });
                self.markerMe = new google.maps.Marker({
                    draggable: true,
                    position: userLatLng,
                    map: self.map
                });
                self.markers.push(self.markerMe);
                self.addEventRightClickOnMarker(self.markerMe);
                self.isShowMe = !self.isShowMe;
            }, function(err) {
                // error
                console.log('err');
                console.log(err);
                if (!self.showAlertGPS) {
                    self.showAlertGPS = function() {
                        var alertPopup = $ionicPopup.alert({
                            title: 'GPS',
                            template: 'GPS are not available, please open it!'
                        });
                        alertPopup.then(function(res) {
                            console.log('Thank you for not eating my delicious ice cream cone');
                        });
                    };
                }
                self.loading.hide();
                self.showAlertGPS();
            });
        } else {
            self.isShowMe = !self.isShowMe;
            self.loading.hide();
            self.circle.setMap(null);
            self.markerMe.setMap(null);
        }
    };
    self.init = function() {
        self.initialize();
        self.doubleClick = false;
        self.defineExitApp();
    };
    self.defineExitApp = function() {
        self.doubleClick = false;
        $ionicPlatform.registerBackButtonAction(function(event) {
            if (self.doubleClick == false) {
                $cordovaToast.show('click again to exit app', 'short', 'bottom');
                self.doubleClick = true;
            } else {
                // if(!$scope.showConfirm) {
                //     $scope.showConfirm = function() {
                //         var confirmPopup = $ionicPopup.confirm({
                //             title: 'Exit?',
                //             template: 'Are you sure want to exit?'
                //         });
                //         confirmPopup.then(function(res) {
                //             if (res) {
                //                 (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
                //             } else {
                //                 console.log('You are not sure');
                //                 return false;
                //             }
                //         });
                //     };
                // }
                // $scope.showConfirm();
                (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
            }
            $timeout(function() {
                self.doubleClick = false
            }, 500);
        }, 100);
    };
    self.findWay = function() {
        if (self.startMarker == null) {
            if (!self.showAlertStart) {
                self.showAlertStart = function() {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Check info',
                        template: 'please choose start marker!'
                    });
                    alertPopup.then(function(res) {
                        console.log('Thank you for not eating my delicious ice cream cone');
                    });
                };
                self.showAlertStart();
            } else {
                self.showAlertStart();
            }
            return;
        }
        if (self.endMarker == null) {
            if (!self.showAlertEnd) {
                self.showAlertEnd = function() {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Check info',
                        template: 'please choose end marker!'
                    });
                    alertPopup.then(function(res) {
                        console.log('Thank you for not eating my delicious ice cream cone');
                    });
                };
                self.showAlertEnd();
            } else {
                self.showAlertEnd();
            }
            return;
        }
        // self.from = self.startMarker.position;
        // self.to = self.endMarker.position;
        self.from = self.markerDirections[0].position;
        self.to = self.markerDirections[self.markerDirections.length - 1].position;
        var wayPoint = [];
        for (var i = 1; i < self.markerDirections.length - 1; i++) {
            wayPoint.push({
                location: self.markerDirections[i].position,
                stopover: true
            });
        }
        self.directionsService = new google.maps.DirectionsService();
        self.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true
        });

        var request = {
            origin: self.from,
            destination: self.to,
            waypoints: wayPoint,
            optimizeWaypoints: true,
            travelMode: self.modeTravel
        };
        self.directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                // self.km = self.computeTotalDistance(response);
                self.directionsDisplay.setDirections(response);
                self.markers.splice(self.markers.indexOf(self.startMarker), 1);
                self.markers.splice(self.markers.indexOf(self.endMarker), 1);
                self.startMarker.setMap(null);
                self.endMarker.setMap(null);
                for (var i = 1; i < self.markerDirections.length - 1; i++) {
                    self.markerDirections[i].setMap(null);
                    var indexMarker = self.markers.indexOf(self.markerDirections[i]);
                    if (indexMarker > -1) {
                        self.markers.splice(indexMarker, 1);
                    }
                }
                if (self.modelCheck) {
                    self.stepDisplay = new google.maps.InfoWindow();
                    if (!self.attachInstructionText) {
                        self.attachInstructionText = function(marker, text) {
                            google.maps.event.addListener(marker, 'click', function() {
                                // Open an info window when the marker is clicked on,
                                // containing the text of the step.
                                self.stepDisplay.setContent(text);
                                self.stepDisplay.open(self.map, marker);
                            });
                        };
                    }
                    if (!self.showSteps) {
                        self.showSteps = function(directionResult) {
                            var myRoute = directionResult.routes[0].legs[0];
                            for (var i = 0; i < myRoute.steps.length; i++) {
                                var marker = new google.maps.Marker({
                                    // draggable: true,
                                    position: myRoute.steps[i].start_location,
                                    map: self.map
                                });
                                self.attachInstructionText(marker, myRoute.steps[i].instructions);
                                self.markers.push(marker);
                            }
                        };
                    }
                    self.showSteps(response);
                }
            }
        });
        google.maps.event.addListener(self.directionsDisplay, 'directions_changed', function() {
            $scope.$apply(function() {
                self.km = self.computeTotalDistance(self.directionsDisplay.getDirections());
            });
        });
        self.directionsDisplay.setMap(self.map);
        self.popoverModeTravel.hide();
        self.computeTotalDistance = function(result) {
            var total = 0;
            var myroute = result.routes[0];
            for (var i = 0; i < myroute.legs.length; i++) {
                total += myroute.legs[i].distance.value;
            }
            total = total / 1000.0;
            return total.toString();
        };
    };
    self.showDirections = function(event) {
        if (!self.directionsModal) {
            $ionicModal.fromTemplateUrl('./templates/directionsPanel.html', function(modal) {
                self.directionsModal = modal;
                self.directionsModal.show();
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        } else {
            self.directionsModal.show();
        }
        $('#directions-panel').empty();
        setTimeout(function() {
            self.directionsDisplay.setPanel(document.getElementById('directions-panel'));
        }, 100);
    };
    self.showModeTravel = function($event) {
        if (!self.popoverModeTravel) {
            $ionicPopover.fromTemplateUrl('templates/modeTravelModal.html', {
                scope: $scope,
            }).then(function(popoverModeTravel) {
                self.popoverModeTravel = popoverModeTravel;
                self.popoverModeTravel.show($event);
            });
        } else {
            self.popoverModeTravel.show($event);
        }
        if (self.directionsDisplay) {
            self.directionsDisplay.setMap(null);
        }
    };
    self.showMenuRight = function($event) {
        if (!self.popoverMenuRight) {
            $ionicPopover.fromTemplateUrl('templates/menuRight.html', {
                scope: $scope,
            }).then(function(popoverMenuRight) {
                self.popoverMenuRight = popoverMenuRight;
                self.popoverMenuRight.show($event);
            });
        } else {
            self.popoverMenuRight.show($event);
        }
    };
    self.openSearchModal = function() {
        self.searchPlace = null;
        if (!self.searchPlacesModal) {
            $ionicModal.fromTemplateUrl('./templates/modalPlaceList.html', function(modal) {
                self.searchPlacesModal = modal;
                self.searchPlacesModal.show();
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        } else {
            self.searchPlacesModal.show();
        }
        self.findPlace = function() {
            if (self.searchPlace == "") {
                self.placesList = [];
                return;
            }
            if (!self.service) {
                self.service = new google.maps.places.AutocompleteService();
            }

            self.service.getQueryPredictions({
                input: self.searchPlace
            }, callback);

            function callback(predictions, status) {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                    self.placesList = [];
                    return;
                }
                self.placesList = predictions;
            }
        };
        self.backToMap = function() {
            self.searchPlacesModal.hide();
        };
    };
    self.setMarker = function() {
        var marker = new google.maps.Marker({
            draggable: true,
            map: self.map,
            title: '',
            position: self.map.getCenter()
        });
        self.addEventRightClickOnMarker(marker);
        self.markers.push(marker);
    };
    self.choosePlace = function(item) {
        if (!self.geocoder) {
            self.geocoder = new google.maps.Geocoder();
        }
        self.geocoder.geocode({
            'address': item.description
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    draggable: true,
                    map: self.map,
                    position: results[0].geometry.location,
                    title: item.description
                });
                self.markers.push(marker);
                self.addEventRightClickOnMarker(marker);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
        self.searchPlacesModal.hide();
    };
    self.addEventRightClickOnMarker = function(marker) {
        google.maps.event.addListener(marker, 'position_changed', function() {

        });
        var longpress = true;
        // var startTime, endTime;
        google.maps.event.addListener(marker, 'mousedown', function() {
            self.markerOnTouch = marker;
            // startTime = new Date().getTime();
        });

        // google.maps.event.addListener(marker, 'mouseup', function() {
        //     endTime = new Date().getTime();
        //     longpress = (endTime - startTime < 200) ? false : true;
        // });
        google.maps.event.addListener(marker, 'longClickOnMarker', function() {
            if (longpress) {
                self.markerCurrent = marker;
                var buttons = [{
                    text: 'Set as start point'
                }, {
                    text: 'Set as end point'
                }, ];
                // if (self.startMarker) {
                //     buttons.shift();
                // }
                // if (self.endMarker) {
                //     buttons.pop();
                // }
                $ionicActionSheet.show({
                    titleText: 'Want?',
                    buttons: buttons,
                    destructiveText: 'Delete this marker',
                    cancelText: 'Cancel',
                    cancel: function() {
                        self.closeMarkerActionSheet();
                    },
                    buttonClicked: function(index) {
                        if (buttons.length == 2 && index == 0) {
                            self.setStartPoint();
                        } else if (buttons.length == 2 && index == 1) {
                            self.setEndPoint();
                        }
                        // } else if (buttons.length == 1) {
                        //     if (self.startMarker) {
                        //         self.setEndPoint();
                        //     } else {
                        //         self.setStartPoint();
                        //     }
                        // }
                        return true;
                    },
                    destructiveButtonClicked: function() {
                        return self.deleteMarker();
                    }
                });
                // self.checkCurrentIsStartPoint = function() {
                //     if (self.markerCurrent == self.startMarker) {
                //         self.startMarker = null;
                //     }
                // };
                // self.checkCurrnetIsEndPoint = function() {
                //     if (self.markerCurrent == self.endMarker) {
                //         self.endMarker = null;
                //     }
                // };
                self.deleteMarker = function() {
                    var indexmarker = self.markers.indexOf(self.markerCurrent);
                    if (indexmarker > -1) {
                        self.markers.splice(indexmarker, 1);
                    }
                    indexmarker = self.markerDirections.indexOf(self.markerCurrent);
                    if (self.markerDirections.length > 0 && indexmarker > -1) {
                        self.markerDirections.splice(indexmarker, 1);
                    }
                    self.markerCurrent.setMap(null);
                    self.markerCurrent = null;
                    self.markerOnTouch = null;
                    // var confirmPopup = $ionicPopup.confirm({
                    //     title: 'Confirm delete',
                    //     template: 'Are you sure you want to delete this marker?'
                    // });
                    // confirmPopup.then(function(res) {
                    //     if (res) {
                    //         var indexmarker = self.markers.indexOf(self.markerCurrent);
                    //         if (indexmarker > -1) {
                    //             self.markers.splice(indexmarker, 1);
                    //         }
                    //         indexmarker = self.markerDirections.indexOf(self.markerCurrent);
                    //         if (self.markerDirections.length > 0 && indexmarker > -1) {
                    //             self.markerDirections.splice(indexmarker, 1);
                    //         }
                    //         self.markerCurrent.setMap(null);
                    //         self.markerCurrent = null;
                    //         self.markerOnTouch = null;
                    //     } else {
                    //         console.log('You are not sure?');
                    //     }
                    // });
                    return true;
                };
                self.setStartPoint = function() {
                    // self.checkCurrnetIsEndPoint();
                    self.startMarker = self.markerCurrent;
                    self.markerDirections.unshift(self.markerCurrent);
                };
                self.setEndPoint = function() {
                    // self.checkCurrentIsStartPoint();
                    self.endMarker = self.markerCurrent;
                    self.markerDirections.push(self.markerCurrent);
                };
            }
        });
    };
    self.touchOnMarker = function() {
        if (self.markerOnTouch != null && angular.isDefined(self.markerOnTouch)) {
            google.maps.event.trigger(self.markerOnTouch, 'longClickOnMarker');
        }
    };
    self.createNewMarker = function() {
        self.setMarker();
    };
    self.reload = function() {
        location.reload(); // = location.origin;
    };
    self.showAbout = function() {
        if (!self.aboutModal) {
            $ionicModal.fromTemplateUrl('./templates/about.html', function(modal) {
                self.aboutModal = modal;
                self.aboutModal.show();
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        } else {
            self.aboutModal.show();
        }
    };
    $ionicPlatform.ready(function() {
        self.init();
    });
};
MainController.$inject = [
    '$ionicLoading', '$compile', '$ionicModal',
    '$scope', '$ionicPopover', '$ionicPopup', '$cordovaGeolocation',
    '$ionicActionSheet', '$cordovaDevice', '$cordovaActionSheet', '$ionicPlatform', '$timeout', '$cordovaToast'
];
angular.module('starter').controller('MainController', MainController);