// TODO Test multiple Codemirror instances in the same scope.
// TODO Inline object as dictionary must not work. Right now, we watch for changes in the attribute 
// but ignore the default value.

describe('ngCodemirrorDictionaryHint', function() {

  'use strict';

  var $rootScope, $compile, scope;

  beforeEach(function() {
    // Load our module and its dependencies.
    module('ui.codemirror');
    module('ng.codemirror.dictionary.hint');

    // Inject the compile service.
    inject(function(_$rootScope_, _$compile_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      scope = $rootScope.$new();
    });
  });

  afterEach(function() {
    // Stub
  });

  describe('environment', function() {

    function compile() {
      $compile('<div ui-codemirror ng-codemirror-dictionary-hint>')(scope);
    }

    function compileWithoutUiCodemirror() {
      $compile('<div ng-codemirror-dictionary-hint>')(scope);
    }

    function compileWithUiCodemirrorElement() {
      $compile('<ui-codemirror ng-codemirror-dictionary-hint></ui-codemirror>')(scope);
    }

    it('should throw an error only if Codemirror was not included', function() {
      expect(window.CodeMirror).toBeDefined();
      expect(compile).not.toThrow();
      var oldCodeMirror = window.CodeMirror;
      window.CodeMirror = undefined;
      expect(window.CodeMirror).toBeUndefined();
      expect(compile).toThrow(new Error('ng-codemirror-dictionary-hint needs CodeMirror to work.'));
      window.CodeMirror = oldCodeMirror;
    });

    it('should throw an error if the target element is not a ui-codemirror instance', function() {
      expect(compileWithoutUiCodemirror).toThrow(new Error('The ng-codemirror-dictionary-hint directive can ' +
        'only be used either on a ui-codemirror element or an element with the ui-codemirror attribute set.'));
    });

    it('shouldn\'t throw an error if the target element is a ui-codemirror element', function() {
      expect(compileWithUiCodemirrorElement).not.toThrow();
    });

  });

  describe('basic', function() {

    var element;

    function compile() {
      element = $compile('<div ui-codemirror ng-model="code" ng-codemirror-dictionary-hint="words">')(scope);
      angular.element(document.body).prepend(element);
    }

    afterEach(function() {
      element.remove();
      scope.$digest();
    });

    it('should throw an error if the dictionary is a scalar', function() {
      expect(compile).not.toThrow();
      expect(function changeWords() {
        scope.words = 'Chennai+Chandigarh+Chattisgarh+Chidambaram';
        scope.$digest();
      }).toThrow(new Error('ng-codemirror-dictionary-hint must be a list.'));

    });

    it('should throw an error if the dictionary is an object', function() {
      expect(compile).not.toThrow();
      expect(function changeWords() {
        scope.words = { 0: 'Chennai', 1: 'Chandigarh', 2: 'Chattisgarh', 3: 'Chidambaram' };
        scope.$digest();
      }).toThrow(new Error('ng-codemirror-dictionary-hint must be a list.'));
    });

    beforeEach(function() {
      scope.words = [
        'Chennai',
        'Chandigarh',
        'Chattisgarh',
        'Chidambaram'
      ];
      scope.$digest();
    });

    it('should toggle hint list when characters match/don\'t match', function(cb) {
      var done = false;
      
      expect(compile).not.toThrow();
      
      runs(function() {
        scope.$broadcast('CodeMirror', function(cm) {
          var $hintItems;
          cm.setValue('Cha');
          expect(document.querySelector('ul.CodeMirror-hints')).toBeTruthy();
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(2);
          cm.setValue('Ch');
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(4);
          cm.setValue('D');
          expect(document.querySelector('ul.CodeMirror-hints')).toBeFalsy();
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(0);
          done = true;
        });
      });

      waitsFor(function() {
        return done;
      }, 5000);

    });

    it('should toggle hint list when characters match/don\'t match (case-insensitive)', function(cb) {
      var done = false;
      expect(compile).not.toThrow();
      
      runs(function() {
        scope.$broadcast('CodeMirror', function(cm) {
          var $hintItems;
          cm.setValue('cha');
          expect(document.querySelector('ul.CodeMirror-hints')).toBeTruthy();
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(2);
          cm.setValue('ch');
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(4);
          cm.setValue('D');
          expect(document.querySelector('ul.CodeMirror-hints')).toBeFalsy();
          $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(0);
          done = true;
        });
      });

      waitsFor(function() {
        return done;
      }, 5000);

    });

    it('should include dynamically added words in the hint list', function(cb) {
      var done = false;
      
      expect(compile).not.toThrow();
      
      runs(function() {
        scope.$broadcast('CodeMirror', function(cm) {
          scope.words.push('Chicago');
          cm.setValue('C');
          var $hintItems = document.querySelectorAll('ul.CodeMirror-hints li');
          expect($hintItems.length).toBe(5);
          done = true;
        });
      });

      waitsFor(function() {
        return done;
      }, 5000);

    });

  });


});