// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

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
angular.module('starter').controller('ChatCtrl', ['$scope', 'Common', '$ionicModal', '$timeout', '$ionicPopup', '$ionicLoading', '$ionicScrollDelegate', '$ionicSideMenuDelegate', '$ionicActionSheet', '$ionicPlatform',
    function($scope, Common, $ionicModal, $timeout, $ionicPopup, $ionicLoading, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicActionSheet, $ionicPlatform) {
        $scope.chatUser;
        $scope.chatService;
        $scope.model = {
            usersAndGroups: [],
            currentFriend: {
                messageChatList: [],
                id: -1
            },
            usersAndGroupsMessage: [],
            contactList: [],
        };
        $scope.loading = {};
        $scope.exitApp = function() {
            var exitApp = false
            document.addEventListener("backbutton", function(e) {
                var intval = setTimeout(function() {
                    exitApp = false;
                }, 1000);
                e.preventDefault();
                if (exitApp) {
                    clearInterval(intval)
                        (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
                } else {
                    exitApp = true
                    history.back(1);
                }
            }, false);
        };
        $scope.init = function() {
            $scope.exitApp();
            QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret, QBAPP.config);
            if (localStorage.usersAndGroups) {
                $scope.model.usersAndGroups = angular.fromJson(localStorage.usersAndGroups);
            }
            $scope.loading = $ionicLoading.show({
                content: 'loging...',
                showBackdrop: false
            });
            $ionicModal.fromTemplateUrl('./template/login.html', function(modal) {
                modal.backdropClickToClose = false;
                $scope.loginModal = modal;
                if (localStorage.chatUser) {
                    $scope.chatUser = angular.fromJson(localStorage.chatUser);
                    var params = {
                        appId: QBAPP.appID,
                        authKey: QBAPP.authKey,
                        authSecret: QBAPP.authSecret,
                        login: $scope.chatUser.login,
                        password: $scope.chatUser.pass
                    };
                    QB.createSession(params, function(err, result) {
                        if (err) {
                            console.re.log(err.detail);
                        } else {
                            $scope.myJid = $scope.createJid(result.user_id);
                            $scope.connectChat();
                        }
                    });
                } else {
                    $scope.login();
                    var params = {
                        appId: QBAPP.appID,
                        authKey: QBAPP.authKey,
                        authSecret: QBAPP.authSecret
                    };
                    QB.createSession(params, function(err, result) {
                        if (err) {
                            console.re.log(err.detail);
                        } else {
                            $scope.applicationId = result.application_id;
                            $scope.loading.hide();
                        }
                    });
                }
            }, {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true,
                backdropClickToClose: false,
                hardwareBackButtonClose: true
            });
        };
        $scope.login = function() {
            if ($scope.sigupModal && $scope.sigupModal.isShown()) {
                $scope.sigupModal.hide();
            }
            $scope.loginModal.show();
        };
        $scope.loginSubmit = function(name, pass) {
            $scope.loading = $ionicLoading.show({
                content: 'loging...',
                showBackdrop: false
            });
            var params;
            if (name.indexOf('@') > 0) {
                params = {
                    email: name,
                    password: pass // default password
                };
            } else {
                params = {
                    login: name,
                    password: pass // default password
                };
            }
            // chat user authentication
            QB.login(params, function(err, result) {
                if (err) {
                    $scope.loading.hide();
                    console.log(err);
                    if (!$scope.showAlert) {
                        $scope.showAlert = function() {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Warning',
                                template: 'Please check your username or password!'
                            });
                            alertPopup.then(function(res) {
                                console.log('Thank you for not eating my delicious ice cream cone');
                            });
                        };
                    }
                    $scope.showAlert();
                } else {
                    $scope.chatUser = {
                        id: result.id,
                        login: params.login,
                        pass: params.password
                    };
                    localStorage.chatUser = angular.toJson($scope.chatUser, true);
                    name = null;
                    pass = null;
                    $scope.loginModal.hide();
                    $scope.myJid = $scope.createJid(result.id);
                    $scope.connectChat();
                }
            });
        };
        $scope.showSigup = function() {
            $scope.newUser = {
                name: null,
                pass: null,
                passConfirm: null,
                email: null
            };
            if (!$scope.sigupModal) {
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
        $scope.createNewUserSubmit = function(newUser) {

            if (newUser.pass != newUser.passConfirm) {
                $scope.showAlert = function() {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error Sigup',
                        template: 'Please! Check password confirm!'
                    });
                    alertPopup.then(function(res) {
                        console.log('Please! Check password confirm!');
                    });
                };
                $scope.showAlert();
                return;
            }
            $scope.loading = $ionicLoading.show({
                content: 'sigup...',
                showBackdrop: false
            });
            var params = {
                login: newUser.name,
                password: newUser.pass,
                email: newUser.email
                    // token: "47454cb30cb2a1cf298eb4155c6173ab8858673b"
            };
            QB.users.create(params, function(err, result) {
                // callback function
                if (err) {
                    console.log('err sigup');
                    console.log(err);
                    var errorMesage = angular.fromJson(err.detail);
                    var errorContent = '';
                    for (var item in errorMesage.errors) {
                        errorContent += item + " " + errorMesage.errors[item][0] + ", ";
                    };
                    errorContent = errorContent.substring(0, errorContent.length - 2);
                    $scope.showAlertSigup = function() {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning',
                            template: errorContent
                        });
                        alertPopup.then(function(res) {
                            console.log('Thank you for not eating my delicious ice cream cone');
                        });
                    };
                    $scope.showAlertSigup();
                } else {
                    $scope.chatUser = {
                        id: result.id,
                        login: params.login,
                        pass: params.password
                    };
                    localStorage.chatUser = angular.toJson($scope.chatUser, true);
                    $scope.sigupModal.hide();
                    name = null;
                    pass = null;
                    $scope.connectChat();
                }
                $scope.loading.hide();
            });
        };
        $scope.logout = function() {
            localStorage.removeItem('user');
            localStorage.removeItem('chatUser');
            $scope.loginModal.show();
            $scope.chatService.disconnect();
            QB.chat.disconnect();
        };
        $scope.connectChat = function() {
            params = {
                onConnectFailed: $scope.onConnectFailed,
                onConnectSuccess: $scope.onConnectSuccess,
                onConnectClosed: $scope.onConnectClosed,
                onChatMessage: $scope.onChatMessage,
                onChatState: $scope.onChatState,

                debug: false
            };

            $scope.chatService = new QBChat(params);
            console.re.log('on connection');
            // connect to QB chat service
            $scope.chatService.connect($scope.chatUser);
            // console.log('user');
            // console.log($scope.chatUser);
        };
        $scope.onConnectFailed = function() {
            console.log('connection fail');
            if (!$scope.showAlertConnectionFail) {
                $scope.showAlertConnectionFail = function() {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning',
                        template: 'connection fail'
                    });
                    alertPopup.then(function(res) {
                        console.log('Thank you for not eating my delicious ice cream cone');
                    });
                };
            }
            $scope.showAlertConnectionFail.show();
        };
        $scope.createUserContact = function(item) {
            return {
                avatar: 'img/user.jpg',
                userStatus: 'unavailable',
                login: item.login,
                fullName: item.full_name,
                id: item.id,
                messageCount: null,
                email: item.email,
                commentStatus: null
            };
        };
        $scope.onConnectSuccess = function(result) {
            console.re.log('connection success');
            $scope.model.contactList = [];
            QB.chat.connect({
                jid: $scope.myJid,
                password: $scope.chatUser.pass
            }, function(err, roster) {
                console.log('chat.connect');
                console.log(roster);
                if (err) {
                    console.log('chat connect err', err);
                    $scope.logout();
                } else {
                    $scope.genFriendFromRoster(roster)

                    // Receive subscription request
                    QB.chat.onSubscribeListener = function(userId) {
                        // callback function
                        console.log('subscribe');
                        console.log(userId);
                        // kiem tra ton tai user trong danh sach
                        var isValid = $scope.model.contactList.some(function(item) {
                            return (item.id == userId);
                        }); // isValid is true
                        if (isValid) {
                            return;
                        }
                        QB.users.get(Number(userId), function(err, result) {
                            if (err) {
                                console.log('get user err', err);
                            } else {
                                console.log(result);
                                var itemContact = $scope.createUserContact(result);
                                itemContact.commentStatus = 'friend requests';
                                itemContact.userStatus = 'friendRequest';
                                $scope.model.contactList.push(itemContact);
                                console.log($scope.model.contactList);
                                $scope.$apply();
                            }
                        });
                    };
                    // Receive confirm request
                    QB.chat.onConfirmSubscribeListener = function(userId) {
                        // callback function
                        console.log('confirm');
                        // if (!angular.isDefined($scope.showAlertConfirmSubscribe)) {
                        //     $scope.showAlertConfirmSubscribe = function() {
                        //         var alertPopup = $ionicPopup.alert({
                        //             title: 'Notify',
                        //             template: 'You friend was add you as a contact!'
                        //         });
                        //         alertPopup.then(function(res) {
                        //             console.log('Thank you for not eating my delicious ice cream cone');
                        //         });
                        //     };
                        // }
                        // $scope.showAlertConfirmSubscribe();
                    };
                    // Receive reject request
                    QB.chat.onRejectSubscribeListener = function(userId) {
                        // callback function
                        console.log('reject');
                        // if (!angular.isDefined($scope.showAlertConfirmSubscribe)) {
                        //     $scope.showAlertRejectSubscribe = function() {
                        //         var alertPopup = $ionicPopup.alert({
                        //             title: 'Notify',
                        //             template: 'You friend won\'t add you as a contact!'
                        //         });
                        //         alertPopup.then(function(res) {
                        //             console.log('Thank you for not eating my delicious ice cream cone');
                        //         });
                        //     };
                        // }
                        // $scope.showAlertRejectSubscribe();
                        // $scope.removeContactFromList(userId);
                    };
                    // Receive user status (online / offline)
                    QB.chat.onContactListListener = function(userId, type) {
                        // callback function
                        console.log('online');
                        console.log(type);
                        if (!angular.isDefined($scope.setStatusUser)) {
                            $scope.setStatusUser = function(status, userId) {
                                angular.forEach($scope.model.contactList, function(item) {
                                    if (item.id == userId) {
                                        item.userStatus = status;
                                    }
                                });
                            };
                        }
                        if (type == 'unavailable') {
                            $scope.setStatusUser('unavailable', userId);
                        } else {
                            $scope.setStatusUser('online', userId);
                        }
                    };
                }

            });
            console.log(QB.chat);
            // QB.chat.onMessageListener = function(userId, message) {

            // };
            $scope.loading.hide();
        };
        $scope.removeContactFromList = function(userId) {
            for (var i = $scope.model.contactList.length - 1; i >= 0; i--) {
                if ($scope.model.contactList[i] == userId) {
                    break;
                }
            }
            $scope.model.contactList.splice(i, 1);
            $scope.$apply();
        };
        $scope.acceptFriend = function() {
            QB.chat.roster.confirm($scope.createJid($scope.model.friendSearched.id), function() {
                // callback function
                $scope.cleanContactInfo();
            });
        };
        $scope.rejectFriend = function() {
            QB.chat.roster.reject($scope.createJid($scope.model.friendSearched.id), function() {
                // callback function
                $scope.removeContactFromList($scope.model.friendSearched.id);
                $scope.cleanContactInfo();
            });
        };
        $scope.genFriendFromRoster = function(roster) {
            $scope.model.contactList = [];
            for (var item in roster) {
                if (roster.hasOwnProperty(item)) {
                    
                    // get on user in app
                    QB.users.get(Number(item), function(err, result) {
                        if (err) {
                            console.log('get user err', err);
                        } else {
                            console.log(result);
                            var itemContact = $scope.createUserContact(result);
                            if (roster[result.id].ask == null && roster[result.id].subscription == 'none') {
                                //duoc yeu cau ket ban
                                itemContact.commentStatus = 'friend requests';
                                itemContact.userStatus = 'friendRequest';

                            } else if (roster[result.id].ask == 'subscribe' && roster[result.id].subscription == 'none') {
                                //gui yeu cau ket ban
                                itemContact.commentStatus = 'requests';
                                itemContact.userStatus = 'requestFriend';
                            }

                            $scope.model.contactList.push(itemContact);
                            console.log($scope.model.contactList);
                            $scope.$apply();
                        }
                    });
                }
            };
        };

        $scope.onConnectClosed = function() {
            $scope.chatUser = null;
            $scope.chatService = null;
            console.log('close connect');
        };
        $scope.onChatMessage = function(senderID, message) {
            if (senderID == $scope.model.currentFriend.id) {
                $scope.showMessage(message.body, message.time, message.extension, false);
            } else if ($scope.model.usersAndGroupsMessage.length == 0) {
                var userAndGroupMessage = {
                    id: senderID,
                    messageChatList: [$scope.createItemChatMessage(message.body, message.time, message.extension, false)]
                }
                $scope.model.usersAndGroupsMessage.push(userAndGroupMessage);
            } else {
                var index = -1;
                for (var i = $scope.model.usersAndGroupsMessage.length - 1; i >= 0; i--) {
                    var item = $scope.model.usersAndGroupsMessage[i];
                    if (item.id == senderID) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    $scope.model.usersAndGroupsMessage[index].messageChatList.push($scope.createItemChatMessage(message.body, message.time, message.extension, false));
                } else {
                    var userAndGroupMessage = {
                        id: senderID,
                        messageChatList: [$scope.createItemChatMessage(message.body, message.time, message.extension, false)]
                    }
                    $scope.model.usersAndGroupsMessage.push(userAndGroupMessage);
                }
            }
            // $scope.showMessage(message.body, message.time, message.extension, false);
        };
        $scope.onChatState = function(senderID, message) {
            switch (message.state) {
                case 'composing':
                    $('.chat .messages').append('<div class="typing-message">' + message.extension.nick + ' ...</div>');
                    $('.chat .messages').scrollTo('*:last', 0);
                    break;
                case 'paused':
                    QBChatHelpers.removeTypingMessage($('.typing-message'), message.extension.nick);
                    break;
            }
        };
        $scope.startTyping = function() {
            if ($scope.chatUser.isTyping) return true;

            var message = {
                state: 'composing',
                type: 'chat',
                extension: {
                    nick: $scope.chatUser.login
                }
            };

            // send 'composing' as chat state notification
            $scope.chatService.sendMessage($scope.model.messageTo, $scope.message);

            $scope.chatUser.isTyping = true;
            setTimeout($scope.stopTyping, 5 * 1000);
        }
        $scope.stopTyping = function(params) {
            if (!$scope.chatUser.isTyping) return true;

            var message = {
                state: 'paused',
                type: 'chat',
                extension: {
                    nick: $scope.chatUser.login
                }
            };

            // send 'paused' as chat state notification
            $scope.chatService.sendMessage($scope.model.messageTo, $scope.message);

            $scope.chatUser.isTyping = false;
        };
        $scope.createItemChatMessage = function(body, time, extension, isSelf) {
            return {
                nick: extension.nick,
                time: time,
                timeago: $.timeago(time),
                body: QBChatHelpers.parser(body),
                isSelf: isSelf,
                fileName: null,
                link: null
            };
        };
        $scope.showMessage = function(body, time, extension, isSelf) {
            var itemChat = $scope.createItemChatMessage(body, time, extension, isSelf);
            if (extension.fileName && extension.fileUID) {
                itemChat.link = QBChatHelpers.getLinkOnFile(extension.fileUID);
                itemChat.fileName = extension.fileName;
            }
            $scope.model.currentFriend.messageChatList.push(itemChat);

            setTimeout(function() {
                $('time.time').timeago();
                $ionicScrollDelegate.scrollBottom();
                $scope.$apply();
            }, 100);
        };
        $scope.sendMessage = function() {
            var message = {
                body: angular.copy($scope.model.messageSend),
                type: 'chat',
                extension: {
                    nick: $scope.chatUser.login
                }
            };
            $scope.model.messageSend = null;
            // if (fileName && fileUID) {
            //     message.extension.fileName = fileName;
            //     message.extension.fileUID = fileUID;
            // }
            if ($scope.model.messageTo == null || $scope.model.messageTo == "") {
                if (!$scope.showAlertMessageTo) {
                    $scope.showAlertMessageTo = function() {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning',
                            template: 'Please check user want to chat!'
                        });
                        alertPopup.then(function(res) {
                            console.log('Thank you for not eating my delicious ice cream cone');
                        });
                    };
                }
                $scope.showAlertMessageTo();
                return;
            }

            // send user message
            // $scope.chatService.sendMessage($scope.model.messageTo, message);
            QB.chat.send($scope.createJid($scope.model.messageTo), message);
            $scope.showMessage(message.body, new Date().toISOString(), message.extension, true);
        };
        $scope.toggleProjects = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
        $scope.clearSearch = function() {
            $scope.model.friendSearched = null;
            $scope.model.searchContact = null;
            // Get the roster
            QB.chat.roster.get(function(roster) {
                $scope.genFriendFromRoster(roster);
            });
        };
        // tam thoi khong dung
        $scope.getInfoContact = function() {
            console.re.log('change');
            var contacts = [];
            if (localStorage.usersAndGroups) {
                contacts = angular.fromJson(localStorage.usersAndGroups);
            }
            console.re.log(contacts);
            if ($scope.model.searchContact == $scope.chatUser.login) {
                return;
            }
            if ($scope.model.searchContact == null || $scope.model.searchContact == '') {
                $scope.model.usersAndGroups = contacts;
            } else {
                console.re.log('find');
                var isExistInContact = false;
                if (localStorage.usersAndGroups) {
                    var newList = contacts.filter(function(item) {
                        return (item.login.indexOf($scope.model.searchContact) > -1 || item.email.indexOf($scope.model.searchContact) > -1);
                    });
                    if (newList != null && newList.length > 0) {
                        $scope.model.usersAndGroups = newList;
                        isExistInContact = true;
                    }
                }
                if (!isExistInContact) {
                    console.re.log('not exist user');
                    $scope.model.usersAndGroups = [];
                    var params;
                    if (name.indexOf('@') > 0) {
                        params = {
                            email: $scope.model.searchContact
                        };
                    } else {
                        params = {
                            login: $scope.model.searchContact
                        };
                    }
                    QB.users.get(params, function(err, result) {
                        if (err) {

                        } else {
                            $scope.model.usersAndGroups.push({
                                email: result.email,
                                full_name: result.full_name,
                                id: result.id,
                                login: result.login
                            });
                            $scope.$apply();
                        }
                    });
                }
            }
        };
        // tam thoi khong dung
        $scope.selectUser = function(user) {
            if ($scope.model.currentFriend.id != -1) {
                var friends = [];
                if (angular.isDefined(sessionStorage.friends)) {
                    friends = angular.fromJson(sessionStorage.friends);
                    if (angular.isDefined(friends) && friends.length > 0) {
                        var existFriend = false;
                        for (var i = friends.length - 1; i >= 0; i--) {
                            if (friends[i].id == $scope.model.currentFriend.id) {
                                friends[i].messageChatList = $scope.model.currentFriend.messageChatList;
                                existFriend = true;
                                break;
                            }
                        }
                        if (!existFriend) {
                            friends.push($scope.model.currentFriend);
                        }
                    } else {
                        friends = [];
                        friends.push($scope.model.currentFriend);
                    }
                } else {
                    friends.push($scope.model.currentFriend);
                }
                sessionStorage.friends = angular.toJson(friends, true);
            }
            if (angular.isDefined(localStorage.usersAndGroups)) {
                var contacts = angular.fromJson(localStorage.usersAndGroups);
                var newList = contacts.filter(function(item) {
                    return (item.id == user.id);
                });
                if (newList != null && newList.length > 0) {
                    $scope.model.messageTo = user.id;
                    $ionicSideMenuDelegate.toggleLeft();
                    if (angular.isDefined(sessionStorage.friends)) {
                        var friends = angular.fromJson(sessionStorage.friends);
                        if (angular.isDefined(friends) && friends.length > 0) {
                            var friendObj = friends.filter(function(item) {
                                return (item.id == user.id);
                            });
                            if (friendObj != null && friendObj.length > 0) {
                                $scope.model.currentFriend = friendObj[0];
                            } else {
                                $scope.model.currentFriend = {
                                    messageChatList: [],
                                    id: user.id
                                }
                            }
                        } else {
                            $scope.model.currentFriend = {
                                messageChatList: [],
                                id: user.id
                            }
                        }
                    } else {
                        $scope.model.currentFriend = {
                            messageChatList: [],
                            id: user.id
                        }
                    }
                    return;
                }
            }

            // Make Sure to Add the $ionicActionSheet as Dependency to the Controller

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: [{
                    text: 'Chat with ' + user.login
                }, {
                    text: 'Add ' + user.login + ' to contact and chat'
                }],
                // destructiveText: 'Delete',
                titleText: 'Selection',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index) {
                    $scope.model.messageTo = user.id;
                    $scope.model.currentFriend = {
                        messageChatList: [],
                        id: user.id
                    }
                    if (index == 1) {
                        if (localStorage.usersAndGroups) {
                            $scope.model.usersAndGroups = angular.fromJson(localStorage.usersAndGroups);
                        } else {
                            $scope.model.usersAndGroups = [];
                        }
                        $scope.model.usersAndGroups.push(user);
                        $scope.model.usersAndGroups.sort(function(a, b) {
                            return a > b;
                        });
                        localStorage.usersAndGroups = angular.toJson($scope.model.usersAndGroups, true);
                        //Add users
                        QB.chat.roster.add($scope.createJid(user.id), function() {
                            console.log('add thanh cong');
                        });
                    }
                    $ionicSideMenuDelegate.toggleLeft();
                    $scope.model.currentFriend.messageChatList = [];
                    $scope.model.searchContact = null;
                    return true;
                }
            });
        };
        $scope.selectContact = function(user) {
            if (user.userStatus != 'requestFriend' && user.userStatus != 'friendRequest' && user.userStatus != 'notFriend') {
                //la ban
                $scope.cleanContactInfo();
                $ionicSideMenuDelegate.toggleLeft();
            } else if (user.userStatus == 'requestFriend') {
                // yeu cau ket ban
                QB.users.get(Number(user.id), function(err, result) {
                    if (err) {
                        console.log('get user err', err);
                    } else {
                        console.log(result);
                        result.userStatus = 'requestFriend';
                        $scope.model.friendSearched = result;
                        $scope.model.showContactInfo = true;
                        $ionicSideMenuDelegate.toggleLeft();
                        $scope.$apply();
                    }
                });

            } else if (user.userStatus == 'friendRequest') {
                // duoc yeu cau ket ban
                QB.users.get(Number(user.id), function(err, result) {
                    if (err) {
                        console.log('get user err', err);
                    } else {
                        console.log(result);
                        result.userStatus = 'friendRequest';
                        $scope.model.friendSearched = result;
                        $scope.model.showContactInfo = true;
                        $ionicSideMenuDelegate.toggleLeft();
                        $scope.$apply();
                    }
                });
            } else if (user.userStatus == 'notFriend') {

                $scope.model.showContactInfo = true;
                $ionicSideMenuDelegate.toggleLeft();
            }
        };
        $scope.addToContact = function() {
            if (!angular.isDefined($scope.showConfirm)) {
                $scope.showConfirmAddContact = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Add to contacts',
                        template: 'Send ' + $scope.model.friendSearched.login + ' a contact request?<br>Hi ' + $scope.model.friendSearched.login + ', I\'d like to add you as a contact.'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            console.log('You are sure');
                            QB.chat.roster.add($scope.createJid($scope.model.friendSearched.id), function() {
                                console.log('request was sent');
                                $scope.cleanContactInfo();
                            });
                        } else {
                            console.log('You are not sure');
                        }
                    });
                };
            }
            $scope.showConfirmAddContact();
        };
        $scope.cleanContactInfo = function() {
            $scope.model.friendSearched = null;
            $scope.model.showContactInfo = false;
        };
        $scope.findUser = function() {
            if ($scope.model.searchContact == '') {
                $scope.clearSearch();
                return;
            }
            var params;
            if (name.indexOf('@') > 0) {
                params = {
                    email: $scope.model.searchContact
                };
            } else {
                params = {
                    login: $scope.model.searchContact
                };
            }
            QB.users.get(params, function(err, result) {
                if (err) {
                    console.log('find user err');
                    console.log(err);
                } else {
                    result.userStatus = 'notFriend';
                    $scope.model.friendSearched = result;
                    var itemContact = $scope.createUserContact(result);
                    itemContact.userStatus = 'notFriend';
                    $scope.model.contactList.push(itemContact);
                    console.log($scope.model.contactList);
                    $scope.$apply();
                }
            });
        };
        $scope.holdOnUser = function(user) {
            var hideSheet = $ionicActionSheet.show({
                buttons: [],
                destructiveText: 'Delete this user',
                titleText: 'Selection',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index) {
                    if (index == 0) {

                    } else {

                    }
                    $ionicSideMenuDelegate.toggleLeft();
                    return true;
                },
                destructiveButtonClicked: function() {
                    for (var i = 0; i < $scope.model.usersAndGroups.length; i++) {
                        var item = $scope.model.usersAndGroups[i];
                        if (item.id == user.id) {
                            $scope.model.usersAndGroups.splice(i, 1);
                        }
                    }
                    localStorage.usersAndGroups = angular.toJson($scope.model.usersAndGroups, true);
                    $ionicSideMenuDelegate.toggleLeft();
                    return true;
                }
            });
        };
        $scope.createJid = function(useId) {
            return useId + "-" + QBAPP.appID + "@chat.quickblox.com";
        };
        $ionicPlatform.ready(function() {
            $scope.init();
        });
    }
]);