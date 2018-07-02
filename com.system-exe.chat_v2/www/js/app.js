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
angular.module('starter').controller('mainCtrl', ['$rootScope', '$scope', '$ionicPlatform', '$ionicModal', '$ionicLoading', '$timeout', '$ionicScrollDelegate', '$systemAuth', '$systemCommon', '$systemConfig', '$ionicActionSheet', '$ionicSideMenuDelegate', '$firebaseArray', function($rootScope, $scope, $ionicPlatform, $ionicModal, $ionicLoading, $timeout, $ionicScrollDelegate, $systemAuth, $systemCommon, $systemConfig, $ionicActionSheet, $ionicSideMenuDelegate, $firebaseArray) {
    $scope.systemConfig = angular.copy($systemConfig);
    $scope.initModel = function() {
        $scope.model = {
            username: null,
            password: null,
            messageInfo: {
                body: null,
                from: null,
                to: null,
                time: null,
                timeago: null
            },
            messageSend: null,
            friends: [],
            groups: [],
            searchContact: '',
            showRequestFriend: false,
            userAuth: null,
            userCurrent: null,
            contactCurrent: null,
            showChat: false,
            pair: '',
            messages: null,
            searchGroup: '',
            isGroupMessage: false,
            showUserAddToGroup: false,
            allowGetUser: true
        };
    };
    $scope.init = function() {
        //check authen
        $systemAuth.checkAuthen().then(function(success) {
            console.log('checkAuthen', success);
            $scope.model.userAuth = success;
            if (!$scope.model.watchCreated) {
                $scope.createWatch();
            }
            // update user online
            $scope.updateUserStatus($systemConfig.statusObj.online);
            //get friends
            $scope.getUserAndFriends();
        }, function(err) {
            console.log(err);
            //show login form
            $scope.login();
        });
        //auto update time ago
        setInterval(function() {
            $('time.time').timeago();
        }, 1000);
    };
    $scope.createWatch = function() {
        $scope.model.watchCreated = true;
        //watch on users change
        $systemCommon.getUsers().then(function(users) {
            users.$watch(function(event) {
                if ($scope.model.userAuth != null) {
                    $scope.getUserAndFriends();
                }
            });
        }, function(err) {});
        //watch on friends change
        $systemCommon.getFriends().then(function(friends) {
            friends.$watch(function(event) {
                if ($scope.model.userAuth != null) {
                    $scope.getUserAndFriends();
                }
            });
        }, function(err) {});
        $systemCommon.getOwnGroups('userId', $scope.model.userAuth.uid).then(function(groups) {
            groups.$watch(function(event) {
                if ($scope.model.userAuth != null) {
                    $scope.getUserAndFriends();
                }
            });
        }, function(err) {});
        $scope.$watch('model.searchContact', function(newValue, oldValue) {
            if (angular.isDefined(oldValue) && oldValue != null && oldValue != '' && angular.isDefined(newValue) && (newValue == null || newValue == '') && newValue != oldValue) {
                $scope.getUserAndFriends();
            }
        });
        $scope.$watch('model.searchGroup', function(newValue, oldValue) {
            if (angular.isDefined(oldValue) && oldValue != null && oldValue != '' && angular.isDefined(newValue) && (newValue == null || newValue == '') && newValue != oldValue) {
                $scope.getUserAndFriends();
            }
        });
        $scope.$watch('model.messages.length', function(newValue, oldValue) {
            if (angular.isDefined(oldValue) && oldValue != null && oldValue != '' && angular.isDefined(newValue) && newValue != null && newValue != '' && newValue != oldValue) {
                $ionicScrollDelegate.scrollBottom();
            }
        });
    };
    $scope.logout = function() {
        //update user offline
        $scope.updateUserStatus($systemConfig.statusObj.offline);
        //destroy authen
        $systemAuth.Auth.$unauth();
        // show login form
        $scope.login();
        //inittial model
        $scope.initModel();
    };
    $scope.login = function() {
        if (angular.isDefined($scope.sigupModal)) {
            //if sigup form is show then hide it
            $scope.sigupModal.hide();
        }
        //check login modal was defined
        if (!angular.isDefined($scope.loginModal)) {
            //get template
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
            //show login modal
            $scope.loginModal.show();
        }
    };
    $scope.showSigup = function() {
        //defined model new user
        $scope.model.newUser = {
            name: null,
            password: null,
            passConfirm: null,
            email: null
        };
        //check sigup modal was defined
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
            //hide login modal
            $scope.loginModal.hide();
            //show login modal
            $scope.sigupModal.show();
        }
    };
    $scope.createNewUserSubmit = function() {
        //show loading
        $scope.loading = $ionicLoading.show({
            content: 'loging...',
            showBackdrop: false
        });
        //create new user
        $systemAuth.sigup($scope.model.newUser).then(function(success) {
            console.log(success);
            //hide sigup modal
            $scope.sigupModal.hide();
            //login to server
            $systemAuth.login($scope.model.newUser.email, $scope.model.newUser.password).then(function(success) {
                $scope.model.userAuth = success;
                // update user online
                $scope.updateUserStatus($systemConfig.statusObj.online);
                //get friends
                $scope.getUserAndFriends();
                //hide loading
                $scope.loading.hide();
            }, function(err) {
                console.log("Login Failed!", err);
                //hide loading
                $scope.loading.hide();
            });
        }, function(err) {
            console.log(err);
            //hide loading
            $scope.loading.hide();
        });
    };
    $scope.loginSubmit = function() {
        //show loading
        $scope.loading = $ionicLoading.show({
            content: 'loging...',
            showBackdrop: false
        });
        //login to server
        $systemAuth.login($scope.model.username, $scope.model.password).then(function(success) {
            console.log("Authenticated successfully with payload:", success);
            $scope.model.userAuth = success;
            $scope.loginModal.hide();
            // update user online
            $scope.updateUserStatus($systemConfig.statusObj.online);
            //get list friend
            $scope.getUserAndFriends();
            //hide loading
            $scope.loading.hide();
        }, function(err) {
            console.log("Login Failed!", err);
            //hide loading
            $scope.loading.hide();
        });
    };
    $scope.updateUserStatus = function(status) {
        var id = $scope.model.userAuth.uid;
        //get all user from server
        $systemCommon.getUsers().then(function(users) {
            // find user
            var i = _.findIndex(users, {
                id: id
            });
            users[i].status = status;
            //update user
            users.$save(i).then(function(ref) {
                ref.key() === users[i].$id; // true
            });
        }, function(err) {});
    };
    $scope.getMessages = function(params) {
        //defined condition search
        if ($scope.model.userCurrent.id > $scope.model.contactCurrent.id) {
            $scope.model.pair = $scope.model.contactCurrent.id + '_' + $scope.model.userCurrent.id;
        } else {
            $scope.model.pair = $scope.model.userCurrent.id + '_' + $scope.model.contactCurrent.id;
        }
        //get message by condition
        $systemCommon.getMessages('pair', $scope.model.pair).then(function(success) {
            $scope.model.messages = success;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.sendMessage = function() {
        //check message
        if ($scope.model.messageSend == null || $scope.model.messageSend == '') {
            return;
        }
        //define message model
        $scope.model.messageInfo = {
                body: angular.copy($scope.model.messageSend),
                from: $scope.model.userCurrent.username,
                to: $scope.model.contactCurrent.username,
                pair: $scope.model.pair,
                time: new Date().toISOString(),
                timeago: new Date().toISOString()
            }
            //add message to server
        $scope.model.messages.$add($scope.model.messageInfo);
        //update message count of friend
        $systemCommon.getFriends().then(function(friends) {
            //find user
            index = _.findIndex(friends, {
                userId: $scope.model.contactCurrent.id,
                friendId: $scope.model.userCurrent.id
            });
            // update message count
            if (!angular.isDefined(friends[index].messageCount) || friends[index].messageCount == null) {
                friends[index].messageCount = 0;
            }
            friends[index].messageCount++;
            friends.$save(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
        }, function(err) {
            console.log(err);
        });
        $scope.model.messageSend = null;
        //scroll to end
        setTimeout(function() {
            $ionicScrollDelegate.scrollBottom();
        }, 500);
    };
    $scope.getUserAndFriends = function() {
        if (!$scope.model.allowGetUser) {
            return;
        }
        //get user by id
        $systemCommon.getUser('id', $scope.model.userAuth.uid).then(function(success) {
            $scope.model.userCurrent = success;
            console.log('userCurrent', $scope.model.userCurrent);
            //get friend of user cuurent
            $systemCommon.getMyFriendList($scope.model.userCurrent.id).then(function(success) {
                $scope.model.friends = success;
                console.log($scope.model.friends);
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });
        $scope.getGroups();
    };
    $scope.clearSearchContact = function() {
        $scope.model.searchContact = '';
    };
    $scope.searchOnChat = function() {
        //search user by username
        $systemCommon.searchUser('username', $scope.model.searchContact).then(function(success) {
            console.log(success);
            //check new user is exist in list friend
            var index = _.findIndex($scope.model.friends, {
                id: success.id
            })
            if (angular.isDefined(success) && success.id != $scope.model.userAuth.uid && index == -1) {
                success.status = $systemConfig.statusObj.new;
                success.isFriend = false;
                //add new user to list friend
                $scope.model.friends.push(success);
            }
        }, function(err) {
            console.log(err);
        });
    };
    $scope.selectContact = function(contact) {
        $scope.model.messages = null;
        //check is friend
        if (!contact.isFriend) { //not friend
            $scope.model.showChat = false;
            //check is new user
            if (contact.status == $systemConfig.statusObj.new) {
                $scope.model.showRequestFriend = false;
                var hideSheet = $ionicActionSheet.show({
                    buttons: [{
                        text: 'Add ' + contact.username + ' to contact'
                    }],
                    // destructiveText: 'Delete',
                    titleText: 'Selection',
                    cancelText: 'Cancel',
                    cancel: function() {
                        // add cancel code..
                    },
                    buttonClicked: function(index) {
                        if (index == 0) {
                            //affter click get all friend
                            $systemCommon.getFriends().then(function(friends) {
                                //add new user to list friend
                                friends.$add({
                                    userId: $scope.model.userAuth.uid,
                                    friendId: contact.id,
                                    requestFrom: $scope.model.userAuth.uid,
                                    status: $systemConfig.statusObj.pending,
                                    messageCount: 0
                                });
                                friends.$add({
                                    userId: contact.id,
                                    friendId: $scope.model.userAuth.uid,
                                    requestFrom: $scope.model.userAuth.uid,
                                    status: $systemConfig.statusObj.pending,
                                    messageCount: 0
                                });
                                $scope.model.searchContact = '';
                            }, function(err) {});
                        }
                        //close menu right
                        $ionicSideMenuDelegate.toggleRight();
                        return true;
                    }
                });
            } else if (contact.requestFrom !== $scope.model.userCurrent.id) { //check is request friend
                //show info friend request
                $scope.model.showRequestFriend = true;
                $ionicSideMenuDelegate.toggleRight();
                $scope.model.contactCurrent = contact;
            }
        } else {
            $scope.model.isGroupMessage = false;
            $scope.model.contactCurrent = contact;
            $scope.updateMessageCount();
            //get message of me and friend
            $scope.getMessages();
            $scope.model.showRequestFriend = false;
            $ionicSideMenuDelegate.toggleRight();
            //show control chat
            $scope.model.showChat = true;
        }
    };
    $scope.acceptFriend = function() {
        //get all friend 
        $systemCommon.getFriends().then(function(friends) {
            //find user
            var index = _.findIndex(friends, {
                userId: $scope.model.userCurrent.id,
                friendId: $scope.model.contactCurrent.id,
                requestFrom: $scope.model.contactCurrent.requestFrom,
                status: $systemConfig.statusObj.pending
            });
            friends[index].status = $systemConfig.statusObj.online;
            // update status
            friends.$save(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
            //find user
            index = _.findIndex(friends, {
                userId: $scope.model.contactCurrent.id,
                friendId: $scope.model.userCurrent.id,
                requestFrom: $scope.model.contactCurrent.requestFrom,
                status: $systemConfig.statusObj.pending
            });
            friends[index].status = $systemConfig.statusObj.online;
            // update status
            friends.$save(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
            //get my friends
            $scope.getUserAndFriends();
            $scope.model.showRequestFriend = false;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.rejectFriend = function() {
        $systemCommon.getFriends().then(function(friends) {
            var index = _.findIndex(friends, {
                userId: $scope.model.userCurrent.id,
                friendId: $scope.model.contactCurrent.id,
                requestFrom: $scope.model.contactCurrent.requestFrom,
                status: $systemConfig.statusObj.pending
            });
            friends[index].status = $systemConfig.statusObj.approved;
            friends.$remove(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
            index = _.findIndex(friends, {
                userId: $scope.model.contactCurrent.id,
                friendId: $scope.model.userCurrent.id,
                requestFrom: $scope.model.contactCurrent.requestFrom,
                status: $systemConfig.statusObj.pending
            });
            friends[index].status = $systemConfig.statusObj.approved;
            friends.$remove(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
            $scope.getUserAndFriends();
            $scope.model.showRequestFriend = false;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.updateMessageCount = function() {
        //update message count of friend
        $systemCommon.getFriends().then(function(friends) {
            //find user
            index = _.findIndex(friends, {
                userId: $scope.model.userCurrent.id,
                friendId: $scope.model.contactCurrent.id
            });
            friends[index].messageCount = null;
            friends.$save(index).then(function(ref) {
                ref.key() === friends[index].$id; // true
            });
        }, function(err) {
            console.log(err);
        });
    };
    $scope.getGroups = function() {
        $systemCommon.getMyGroupList($scope.model.userAuth.uid).then(function(success) {
            console.log('groups', success);
            $scope.model.groups = success;
        }, function(err) {});
    };
    $scope.addGroup = function() {
        $systemCommon.getOwnGroups('userId', $scope.model.userAuth.uid).then(function(groups) {
            var item = {
                gruopId: $scope.model.userAuth.uid + '_' + (groups.length + 1),
                userId: $scope.model.userAuth.uid
            }
            groups.$add(item);
        }, function(err) {});
        $systemCommon.getGroups('id', $systemConfig.groupId).then(function(groups) {
            var item = {
                id: $scope.model.userAuth.uid + '_' + (groups.length + 1),
                groupName: $scope.model.searchGroup
            }
            groups.$add(item);
            $scope.model.searchGroup = '';
        }, function(err) {});
    };
    $scope.selectGroup = function(group) {
        $scope.model.isGroupMessage = true;
        $scope.model.currentGroup = group;
        $scope.model.messages = null;
        //get message of me and friend
        $scope.getMessageGroup();
        $scope.model.showRequestFriend = false;
        $ionicSideMenuDelegate.toggleRight();
        //show control chat
        $scope.model.showChat = true;
    };
    $scope.sendMessageGroup = function() {
        //check message
        if ($scope.model.messageSend == null || $scope.model.messageSend == '') {
            return;
        }
        //define message model
        $scope.model.messageInfo = {
                body: angular.copy($scope.model.messageSend),
                from: $scope.model.userCurrent.username,
                to: $scope.model.currentGroup.groupName,
                pair: $scope.model.currentGroup.id,
                time: new Date().toISOString(),
                timeago: new Date().toISOString()
            }
            //add message to server
        $scope.model.messages.$add($scope.model.messageInfo);
        $scope.model.messageSend = null;
        //scroll to end
        setTimeout(function() {
            $ionicScrollDelegate.scrollBottom();
        }, 500);
    };
    $scope.getMessageGroup = function() {
        //get message by condition
        $systemCommon.getMessages('pair', $scope.model.currentGroup.id).then(function(success) {
            $scope.model.messages = success;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.holdOnGroup = function(group) {
        var hideSheet = $ionicActionSheet.show({
            buttons: [{
                text: 'Add user to group'
            }],
            // destructiveText: 'Delete',
            titleText: 'Selection',
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                if (index == 0) {
                    $scope.model.friendsToUser = [];
                    var listUserInGroup = $systemCommon.getAllFriendInGroup(group.id).then(function(success) {
                        $scope.model.friends.forEach(function(item) {
                            var index = _.findIndex(success, {
                                id: item.id
                            })
                            if (index == -1) {
                                $scope.model.friendsToUser.push(item);
                            }
                        });
                    }, function(err) {});
                    $scope.model.currentGroup = group;
                    $scope.model.showUserAddToGroup = true;
                    $scope.model.messages = null;
                }
                //close menu right
                $ionicSideMenuDelegate.toggleRight();
                return true;
            }
        });
    };
    $scope.AddUserToGroup = function() {
        var friends = angular.copy($scope.model.friendsToUser);
        var countObj = _.countBy(friends, function(item) {
            return item.selected == true;
        });
        if (countObj.true > 0) {
            $scope.model.allowGetUser = false;
            $systemCommon.getOwnGroups('userId', $scope.model.userAuth.uid).then(function(groups) {
                var count = 0;
                angular.forEach(friends, function(item) {
                    if (item.selected == true) {
                        count++;
                        var itemGroup = {
                            gruopId: $scope.model.currentGroup.id,
                            userId: item.id
                        }
                        if (countObj.true == count) {
                            $scope.model.allowGetUser = true;
                            $scope.model.showUserAddToGroup = false;
                            $scope.selectGroup($scope.model.currentGroup);
                            $ionicSideMenuDelegate.toggleRight();
                        }
                        groups.$add(itemGroup);
                    }
                });
            }, function(err) {});
        }
    };
    $scope.CancelAddUserToGroup = function() {
        $scope.model.showUserAddToGroup = false;
    };
    $ionicPlatform.ready(function() {
        $scope.initModel();
        $scope.init();
    });
}]);