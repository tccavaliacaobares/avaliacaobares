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
                    console.error(error);
                });
            }).catch(function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message);
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
            
            console.log('Sign-out successful.');
        }).catch(function (error) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert(error.code, error.message);
        });
    }
})

.controller('BarCtrl', function ($scope, $state, firebaseFactory, utilsFactory) {
    $scope.bar = {};
    $scope.avaliacao = {};
    
    $scope.inicio = function () {
        $state.go('app.playlists');
    };
    
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
    
    $scope.cadastrarBar = function () {  
        var database = firebase.database();
        var baresRef = database.ref('bares');
        
        utilsFactory.showLoading();

        baresRef.push($scope.bar).then(function (bar) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert("success/push", "Bar cadastrado com sucesso!");
        }, function (error) {
            utilsFactory.hideLoading();
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
        inserirAvaliacao();
    }
    
    function inserirAvaliacao() { 
        var database = firebase.database();
        var avaliacoesRef = database.ref("avaliacoes/" + barAvaliavel);

        utilsFactory.showLoading();

        avaliacoesRef.push($scope.avaliacao).then(function () {
            atualizarMedia();
        }, function (error) {
            utilsFactory.hideLoading();
            console.error(error);
        });
    }
    
    function atualizarMedia() {
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

            barRef.update(mediaBar, function (error) {
                if (error) {
                    utilsFactory.hideLoading();
                    console.error(error);
                } else {
                    utilsFactory.hideLoading();
                    utilsFactory.showAlert("Sucesso", "Avaliação inserida com sucesso!");
                    $state.go('app.concluir');
                }
            });
        }, function (error) {
            utilsFactory.hideLoading();
            console.error(error);
        });
    }
})