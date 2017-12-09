angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $state, $stateParams, $ionicModal, $timeout) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('LoginCtrl', function ($scope, $state, $q, firebaseFactory, utilsFactory) {
    $scope.loginData = {};
    $scope.signData = {};
    
    // Realizar Login:
    $scope.loginUsuario = function () {
        if (angular.isUndefined($scope.loginData.username) || angular.isUndefined($scope.loginData.password)) {
            utilsFactory.showAlert('validation/login', 'Todos os campos são obrigatórios!');
        } else {
            utilsFactory.showLoading();
            
            // Efetuar o login e redirecionar para a tela principal:
            firebase.auth().signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function (user) {
                $state.go('app.principal');
                utilsFactory.hideLoading();
                
                console.log(user);
            }).catch(function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message);
            });
        }
    };
    
    // Cadastrar Usuário:
    $scope.cadastrarUsuario = function () {
        if (angular.isUndefined($scope.signData.username) || angular.isUndefined($scope.signData.password)) {
            utilsFactory.showAlert('validation/login', 'Todos os campos são obrigatórios!');
        } else {
            utilsFactory.showLoading();

            // Criar usuário:
            firebase.auth().createUserWithEmailAndPassword($scope.signData.username, $scope.signData.password).then(function (user) {
                // Criar o perfil e redirecionar:
                criarPerfil(user.uid).then(function (perfil) {
                    $state.go('app.principal');
                    utilsFactory.hideLoading();
                }, function (error) {
                    utilsFactory.hideLoading();
                    utilsFactory.showAlert(error.code, error.message);
                    console.error(error);
                });
            }).catch(function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message);
                console.error(error);
            });
        }
    }

    function criarPerfil(uid) {
        return $q(function (resolve, reject) {
            // var user = firebase.auth().currentUser;

            var database = firebase.database();
            var perfisRef = database.ref('perfis/' + uid);
            var perfil = {tipo: 'comum'};

            perfisRef.set(perfil).then(function () {
                resolve(perfil);
            }, function (error) {
                reject(error);
            });
        });
    }
})

.controller('PrincipalCtrl', function ($scope, $state, firebaseFactory, utilsFactory) {
    // Verificar o estado da sessão e atualizar o perfil:
    firebase.auth().onAuthStateChanged(function (user) {
        utilsFactory.showLoading();

        if (user) {
            var database = firebase.database();
            var perfilRef = database.ref('perfis/' + user.uid);

            perfilRef.once("value").then(function (perfil) {
                if (perfil.child('tipo').val() == 'administrador') {
                    $scope.perfilCadastro = true;
                } else {
                    $scope.perfilCadastro = false;
                }

                utilsFactory.hideLoading();
            });
        } else {
            $state.go('login');
            utilsFactory.hideLoading();
        }
    });
    
    // Sair:
    $scope.sair = function () {
        utilsFactory.showLoading();

        firebase.auth().signOut().then(function () {
            $state.go('login');
            
            utilsFactory.hideLoading();
        }).catch(function (error) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert(error.code, error.message);
            console.log(error);
        });
    }
})

.controller('BarCtrl', function ($ionicHistory, $scope, $state, $q, firebaseFactory, serviceFactory, utilsFactory) {
    $scope.bar = {};
    $scope.endereco = {};
    $scope.avaliacao = {};
    
    $scope.cadastrarBar = function () {
        var database = firebase.database();
        var baresRef = database.ref('bares');
        var bar = {};

        bar.nome = $scope.bar.nome;
        bar.logradouro = $scope.endereco.logradouro;
        bar.numero = $scope.endereco.numero;
        bar.bairro = $scope.endereco.bairro;
        bar.cidade = $scope.endereco.cidade;

        utilsFactory.showLoading();

        // Obter as coordenadas do endereço:
        obterCoordenadasGoogleAPI($scope.endereco).then(function (coordenadas) {
            if (angular.isDefined(coordenadas.data.results[0])) {
                bar.lat = coordenadas.data.results[0].geometry.location.lat;
                bar.lng = coordenadas.data.results[0].geometry.location.lng;
            }

            // Cadastrar o Bar:
            baresRef.push(bar).then(function () {
                $ionicHistory.nextViewOptions({historyRoot: true});
                $state.go('app.principal');
                
                utilsFactory.hideLoading();
                utilsFactory.showAlert("success/push", "Bar cadastrado com sucesso! Nome: <b>" + bar.nome + "</b>; Coordenadas: <b>" + bar.lat + "</b>, <b>" + bar.lng + "</b>;");
            }, function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message)
                console.error(error);
            });
        }, function (error) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert(error.code, error.message)
            console.error(error);
        });
    }

    $scope.carregarBares = function () {
        var database = firebase.database();
        var baresRef = database.ref('bares');
        
        utilsFactory.showLoading();

        baresRef.once('value').then(function (bares) {
            utilsFactory.hideLoading();
            $scope.bares = bares.val();
        });
    }
    
    $scope.definirBar = function (chaveBar) {
        barAvaliavel = chaveBar;
        $state.go('app.finalizar');
    }
    
    $scope.avaliarBar = function () {
        utilsFactory.showLoading();

        inserirAvaliacao().then(function () {
            atualizarMedia().then(function () {
                utilsFactory.hideLoading();
                utilsFactory.showAlert("Sucesso", "Avaliação inserida com sucesso!");
                $state.go('app.concluir');
            }, function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message)
                console.error(error);
            });
        }, function (error) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert(error.code, error.message)
            console.error(error);
        });
    }
    
    $scope.principal = function () {
        $ionicHistory.nextViewOptions({historyRoot: true});
        $state.go('app.principal');
    }
    
    $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 1,
        minRating: 0,
        callback: function (rating) {
            $scope.ratingsCallback(rating);
        }
    };
    
    $scope.ratingsCallback = function (rating) {
        $scope.avaliacao.nota = rating;
    };
    
    function inserirAvaliacao() {
        return $q(function (resolve, reject) {
            var database = firebase.database();
            var avaliacoesRef = database.ref("avaliacoes/" + barAvaliavel);

            avaliacoesRef.push($scope.avaliacao).then(function () {
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    }
    
    function atualizarMedia() {
        return $q(function (resolve, reject) {
            var soma = 0;
            var media = 0;
            var totalAvaliacoes = 0;

            var mediaBar = {};

            var database = firebase.database();
            var avaliacoesRef = database.ref("avaliacoes/" + barAvaliavel);
            var barRef = database.ref("bares/" + barAvaliavel);

            avaliacoesRef.once('value').then(function (avaliacoes) {
                avaliacoes.forEach(function (avaliacao) {
                    soma += parseInt(avaliacao.val().nota);
                    totalAvaliacoes++;
                });

                media = parseInt(soma) / parseInt(totalAvaliacoes);
                mediaBar.media = media.toFixed(2);

                barRef.update(mediaBar).then(function () {
                    resolve();
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    }
    
    function obterCoordenadasGoogleAPI(endereco) {
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
});