'use strict';

var angular = angular || {};
var CodeMirror = CodeMirror || {};
var dictHint;

function isCommonJS() {
  return typeof(require) === 'function' &&
         typeof(module) === 'object' && // This bit taken from CodeMirror.
         typeof(exports) === 'object' &&
         module.exports;
}

if (isCommonJS()) {
  // CommonJS context.
  angular = require('angular');
  CodeMirror = require('codemirror');
  require('codemirror/addon/hint/show-hint');
  // We do this because the last time I checked, angular-ui-codemirror was not CommonJS-friendly.
  if (window && !window.CodeMirror) {
    window.CodeMirror = CodeMirror;
  }
  require('angular-ui-codemirror');
}

function directive($parse, $timeout) {
  return {
    restrict: 'A',
    priority: 2, // higher than ui-codemirror which is 1.
    compile: function compile() {

      return function postLink(scope, iElement, iAttrs) {
        var dictionary = [];

        // Register our custom Codemirror hint plugin.
        CodeMirror.registerHelper('hint', 'dictionaryHint', function(editor) {
            var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
            var start = cur.ch, end = start;
            while (end < curLine.length && /[\w$]+/.test(curLine.charAt(end))) ++end;
            while (start && /[\w$]+/.test(curLine.charAt(start - 1))) --start;
            var curWord = start != end && curLine.slice(start, end);
            var regex = new RegExp('^' + curWord, 'i');
            return {
              list: (!curWord ? [] : dictionary.filter(function(item) {
                return item.match(regex);
              })).sort(),
              from: CodeMirror.Pos(cur.line, start),
              to: CodeMirror.Pos(cur.line, end)
            }
        });
        
        // Check if the ui-codemirror directive is present.
        if (!iAttrs.hasOwnProperty('uiCodemirror') && iElement[0].tagName.toLowerCase() !== 'ui-codemirror') {
          throw new Error('The ng-codemirror-dictionary-hint directive can only be used either ' + 
            'on a ui-codemirror element or an element with the ui-codemirror attribute set.');
        }

        if (iAttrs.ngCodemirrorDictionaryHint) {
          scope.$watch('iAttrs.ngCodemirrorDictionaryHint', function() {
              dictionary = $parse(iAttrs.ngCodemirrorDictionaryHint)(scope);
              if (!angular.isArray(dictionary)) {
                throw new Error('ng-codemirror-dictionary-hint must be a list.');
              }
          });
        }

        // The ui-codemirror directive allows us to receive a reference to the Codemirror instance on demand.
        scope.$broadcast('CodeMirror', function(cm) {
          cm.on('change', function(instance, change) {
            if (change.origin !== 'complete') {
              scope.$apply(function() {
                instance.showHint({ hint: CodeMirror.hint.dictionaryHint, completeSingle: false });
              });
            }
          });
        });

      };
    }
  };
}

// Register module
dictHint = angular.module('ng.codemirror.dictionary.hint', [ 'ui.codemirror' ]);

// Register directive
dictHint.directive('ngCodemirrorDictionaryHint', [ '$parse', '$timeout', directive ]);

if (isCommonJS()) {
  module.exports = dictHint.name;
}