angular.module('starter.factories', [])

.factory('firebaseFactory', function () {
    var config = {
        apiKey: "AIzaSyBuSpoUAyt0yqLAlICIYOJTumjHQVrqjF4",
        authDomain: "avaliacao-bares.firebaseapp.com",
        databaseURL: "https://avaliacao-bares.firebaseio.com",
        projectId: "avaliacao-bares",
        storageBucket: "avaliacao-bares.appspot.com",
        messagingSenderId: "559766716398"
    };

    return firebase.initializeApp(config);
})

.factory('utilsFactory', function ($ionicLoading, $ionicPopup) {
    var utilsFactory = {
        showLoading: function () {
            $ionicLoading.show({
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 500,
                template: '<ion-spinner icon="android"></ion-spinner>'
            });
        },
        
        showAlert: function (title, template) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: template
            });

            alertPopup.then(function (response) {
                console.log(response);
            });
        },

        hideLoading: function () {
            $ionicLoading.hide();
        }
    }

    return utilsFactory;
})