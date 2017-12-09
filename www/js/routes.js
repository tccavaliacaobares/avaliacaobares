angular.module('starter.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'PrincipalCtrl'
    })
    
    .state('app.principal', {
        url: '/principal',
        views: {
            'menuContent': {
                templateUrl: 'templates/principal.html',
                controller: 'PrincipalCtrl'
            }
        }
    })

    .state('app.cadastrar', {
        url: '/cadastrar',
        views: {
            'menuContent': {
                templateUrl: 'templates/cadastrar.html',
                controller: 'BarCtrl'
            }
        }
    })

    .state('app.avaliar', {
        url: '/avaliar',
        views: {
            'menuContent': {
                templateUrl: 'templates/avaliar.html',
                controller: 'BarCtrl'
            }
        }
    })


    .state('app.finalizar', {
        url: '/finalizar',
        views: {
            'menuContent': {
                templateUrl: 'templates/finalizar.html',
                controller: 'BarCtrl'
            }
        }
    })

    .state('app.concluir', {
        url: '/concluir',
        views: {
            'menuContent': {
                templateUrl: 'templates/concluir.html',
                controller: 'BarCtrl'
            }
        }
    })

// Parâmetro:
//    .state('app.single', {
//        url: '/playlists/:playlistId',
//        views: {
//            'menuContent': {
//                templateUrl: 'templates/playlist.html',
//                controller: 'PlaylistCtrl'
//            }
//        }
//    })

    .state('inicio', {
        url: '/inicio',
        templateUrl: 'templates/inicio.html',
        controller: 'LoginCtrl'
    })
    
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })
    
    .state('cadastrarusuario', {
        url: '/cadastrarusuario',
        templateUrl: 'templates/cadastrarusuario.html',
        controller: 'LoginCtrl'
    });
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/inicio');
});