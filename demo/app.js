(function() {
  var angular = require('angular');
  var dictHint = require('../../lib/ng-codemirror-dictionary-hint');
  var app = angular.module('app', [ dictHint ]);
  // Editor controller.
  app.controller('MainController', [ '$scope', '$timeout', function($scope, $timeout) {
    var number = 10;
    $scope.code = 'And the best Javascript framework is: ';
    $scope.tags = [ 'AngularJS', 'EmberJS', 'ReactJS', 'BackboneJS', 'BatmanJS' ];
    $timeout(function() {
        // Adding a new tag.
        $scope.tags.push('KnockoutJS');
        console.log('Added a tag to the dictionary..');
    }, 5000);
  }]);
})();