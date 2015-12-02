var sampleApp = angular.module('sampleApp', []);

sampleApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/default', {
            template: '<div class=\"container\"><h2>Welcome</h2><p>{{message}}</p><a href=\"#/route\">View Example 01 List</a></div>',
            controller: ['$scope', function($scope) {
                $scope.message = 'Hello from default';
            }]
        }).
        otherwise({
            redirectTo: '/default'
        });
    }]);