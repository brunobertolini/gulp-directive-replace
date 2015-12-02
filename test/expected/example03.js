var sampleApp = angular.module('sampleApp', []);

sampleApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/default', {
            templateUrl: 'non-exists.html',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        }).
        otherwise({
            redirectTo: '/default'
        });
    }]);