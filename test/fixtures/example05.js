var sampleApp = angular.module('sampleApp', []);

sampleApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/test01', {
            templateUrl: 'templates/with/many/directories/default.html',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/test02', {
            templateUrl: 'templates/with/default02.html',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/test03', {
            templateUrl: 'templates/with/many/default03.html',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/test04', {
            templateUrl: 'templates/default04.html',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .otherwise({
            redirectTo: '/default'
        });
    }]);