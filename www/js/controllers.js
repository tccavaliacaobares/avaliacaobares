angular.module('starter.controllers', [])

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

.controller('BarCtrl', function ($ionicHistory, $scope, $state, $q, firebaseFactory, mapsFactory, serviceFactory, utilsFactory) {
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
        mapsFactory.obterCoordenadas($scope.endereco).then(function (coordenadas) {
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
        }, function (error) {
            utilsFactory.hideLoading();
            utilsFactory.showAlert(error.code, error.message)
            console.error(error);
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
})

.controller('MapaCtrl', function ($ionicHistory, $scope, $state, $q, firebaseFactory, mapsFactory, serviceFactory, utilsFactory) {
    $scope.$on('$ionicView.enter', function () {
        utilsFactory.showLoading();

        mapsFactory.obterLocalizacaoHTML5().then(function (coordenadas) {
            $scope.map = new google.maps.Map(document.getElementById('map'), {center: {lat: -34.397, lng: 150.644}, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP});
            $scope.map.setCenter(coordenadas);

            obterMediasMapa().then(function () {
                utilsFactory.hideLoading();
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
    });
    
    $scope.ondeEstou = function () {
        if ($scope.map) {
            mapsFactory.obterLocalizacaoHTML5().then(function (coordenadas) {
                $scope.map.setCenter(coordenadas);
            }, function (error) {
                utilsFactory.hideLoading();
                utilsFactory.showAlert(error.code, error.message)
                console.error(error);
            });
        }
    }
    
    function obterMediasMapa() {
        return $q(function (resolve, reject) {
            var database = firebase.database();
            var baresRef = database.ref('bares');

            baresRef.once('value').then(function (bares) {
                bares.forEach(function (bar) {
                    var media = angular.isDefined(bar.val().media) ? bar.val().media : 'Sem Média;';
                    var contentString =
                            '<div id="content">' +
                            '<div id="headerContent">' +
                            '<h3>' + bar.val().nome + '</h3>' +
                            '<h4>' + bar.val().logradouro + ', ' + bar.val().numero + '</h4>' +
                            '</div>' +
                            '<div id="bodyContent">' +
                            'Média: ' + media +
                            '</div>' +
                            '</div>';
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
                    var marker = new google.maps.Marker({
                        position: {lat: bar.val().lat, lng: bar.val().lng},
                        map: $scope.map,
                        title: bar.val().nome
                    });

                    marker.addListener('click', function () {
                        infowindow.open($scope.map, marker);
                    });

                });
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    }
});