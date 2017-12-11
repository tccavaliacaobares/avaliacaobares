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
        
        hideLoading: function () {
            $ionicLoading.hide();
        },
        
        showAlert: function (title, template) {
            if (title) {
                switch (title) {
                    case "auth/email-already-in-use":
                        template = "O endereço de e-mail já está sendo usado por outra conta.";
                        break;
                    case "auth/invalid-email":
                        template = "O endereço de e-mail está mal formatado.";
                        break;
                    case "auth/user-not-found":
                        template = "Não há registro de usuário correspondente a este identificador. O usuário pode ter sido excluído.";
                        break;
                    case "auth/wrong-password":
                        template = "A senha é inválida ou o usuário não possui uma senha.";
                        break;
                    case "auth/weak-password":
                        template = "A senha deve ter pelo menos 6 caracteres.";
                        break;
                }
            }

            var alertPopup = $ionicPopup.alert({
                title: title,
                template: template
            });

            alertPopup.then(function (response) {
                // Executa uma ação após a confirmação do alerta pelo usuário;
            });
        }
    }

    return utilsFactory;
})

.factory('serviceFactory', function ($http, $q) {
    var serviceFactory = {
        doGet: function (url) {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: url
                }).then(function successCallback(response) {
                    resolve(response);
                }, function errorCallback(response) {
                    reject(response);
                });
            });
        }
    }
    
    return serviceFactory;
})

.factory('mapsFactory', function ($q, serviceFactory) {
    var mapsFactory = {
        obterLocalizacaoHTML5: function () {
            return $q(function (resolve, reject) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        resolve(position);
                    }, function (error) {
                        reject(error);
                    });
                }
            });
        },
        
        obterCoordenadas: function (endereco) {
            return $q(function (resolve, reject) {
                var baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
                var key = '&key=AIzaSyBuSpoUAyt0yqLAlICIYOJTumjHQVrqjF4';
                var parametros = '';

                var index = 0;
                angular.forEach(endereco, function (parametro, chave) {
                    if (index == 0) {
                        parametros += parametro;
                    } else {
                        parametros += "+" + parametro;
                    }
                    index++;
                });

                var url = baseURL + parametros + key;

                serviceFactory.doGet(url).then(function (response) {
                    resolve(response);
                }, function (error) {
                    reject(error);
                });
            });
        }
    }

    return mapsFactory;
});