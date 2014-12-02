// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'myapp'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      controller: 'AppCtrl'
    })

    // Each tab has its own nav history stack:

   
    .state('tab.group1', {
      url: '/group/step1',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-group1.html',
          controller: 'Group1Ctrl'
        }
      }
    })
    .state('tab.group2', {
      url: '/group/step2',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-group2.html',
          controller: 'Group2Ctrl'
        }
      }
    })
    .state('tab.group3', {
      url: '/group/step3',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-group3.html',
          controller: 'Group3Ctrl'
        }
      }
    })
    .state('tab.group4', {
      url: '/group/step4',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-group4.html',
          controller: 'Group4Ctrl'
        }
      }
    })
    .state('tab.group5', {
      url: '/group/step5',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-group5.html',
          controller: 'Group5Ctrl'
        }
      }
    })
      .state('tab.group6', {
          url: '/group/step6',
          views: {
              'menuContent': {
                  templateUrl: 'templates/tab-group6.html',
                  controller: 'Group6Ctrl'
              }
          }
      })
     .state('tab.spend', {
      url: '/spend',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-spend.html',
          controller: 'SpendCtrl'
        }
      }
    })

    .state('tab.choose', {
      url: '/choose',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-choose.html',
          controller: 'ChooseCtrl'
        }
      }
    })

    .state('tab.offers', {
      url: '/offers',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-offers.html',
          controller: 'Offer1Ctrl'
        }
      }
    })
    .state('tab.offers2', {
      url: '/offers2',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-offspend.html',
          controller: 'Offer2Ctrl'
        }
      }
    })
    .state('tab.offers3', {
      url: '/offers3',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-offaltzip.html',
          controller: 'Offer3Ctrl'
        }
      }
    })
     .state('tab.offers4', {
      url: '/offers4',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-offzip.html',
          controller: 'Offer4Ctrl'
        }
      }
    })
    .state('tab.merchantDetails', {
      url: '/merchantDetails',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-merchantDetails.html',
          controller: 'merchantDtlCtrl'
        }
      }
    });



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('tab/group/step2');

});

