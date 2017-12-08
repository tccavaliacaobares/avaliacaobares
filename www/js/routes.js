angular.module('starter.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    })

    .state('app.browse', {
        url: '/browse',
        views: {
            'menuContent': {
                templateUrl: 'templates/browse.html'
            }
        }
    })
    .state('app.playlists', {
        url: '/playlists',
        views: {
            'menuContent': {
                templateUrl: 'templates/playlists.html',
                controller: 'LoginCtrl'
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

    .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
            'menuContent': {
                templateUrl: 'templates/playlist.html',
                controller: 'PlaylistCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');
});