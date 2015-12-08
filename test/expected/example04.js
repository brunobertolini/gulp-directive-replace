var sampleApp = angular.module('sampleApp', []);

sampleApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/default01', {
            template: '<div class=\"container\"><h2>Welcome</h2><p>{{message}}</p><a href=\"#/test\">View Default List 01</a></div>',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/default02', {
            template: '<div class=\"container\"><h2>Welcome</h2><p>{{message}}</p><a href=\"#/test\">View Default List 9999</a></div>',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/default03', {
            template: '<div class=\"container\"><h2>Welcome</h2><p>{{message}}</p><a href=\"#/test\">View Default List 1000</a></div>',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .when('/default04', {
            template: '<div class=\"container\"><h2>Welcome</h2><p>{{message}}</p><a href=\"#/test\">View Default List 10</a></div>',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        })
        .otherwise({
            redirectTo: '/default'
        });
    }]);