xtForm.directive('xtValidationTooltip', function () {
    'use strict';

    return {
        require: ['^xtForm', '^ngModel'],
        restrict: 'EA',
        link: function (scope, element, attrs, ctrls) {

            var xtForm = ctrls[0];
            var ngModel = ctrls[1];

            var ngModelElement;
            var lastErrors;

            /**
             * Activates the directive
             */
            function activate() {

                setupNgModel();
                setupTooltipElement();

                // Subscribe to "errors updated" event and redraw errors when changed
                scope.$on('XtForm.ErrorsUpdated', function (message, model) {
                    if (model === null || model === ngModel) {
                        redrawErrors();
                    }
                });
            }

            scope.showErrors = function() {
                var errors = element.attr('tooltip');
                if(errors == '{{showErrors()}}')
                    errors = '';
                return errors;
            }

            function setupTooltipElement() {

                element.addClass('xt-error-container');

                element.attr('tooltip-placement', 'top');
                element.attr('tooltip', '{{showErrors()}}')
                element.attr('tooltip-trigger', 'mouseenter');
                element.attr('tooltip-enable', '!' + xtForm.form.$name + '.' + element.attr('name') + '.$valid');
                // remove the attribute to avoid indefinite loop.
                // see http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs
                element.removeAttr("xt-validation-tooltip");

                $compile(element)(scope);
            }

            function setupNgModel() {

                // allow for a different tooltip container that is not on the ngModel element
                var ngModelElementId = attrs['for'] || attrs.xtValidationTooltip;
                ngModelElement = ngModelElementId ?
                    angular.element(document.getElementById(ngModelElementId)) :
                    element;

                ngModelElement.addClass('xt-validation-tooltip');

                if (!!ngModelElement.attr('required')) {
                    ngModelElement.attr('aria-required', true);
                }
            }

            function redrawErrors() {

                if (ngModel.$xtErrors.length === 0) {
                    lastErrors = null;
                    return;
                }

                // hmm reduce adds br to front of string..
                var noOfErrors = attrs.multiple ? ngModel.$xtErrors.length : 1;
                var errors = ngModel.$xtErrors
                    .slice(0, noOfErrors)
                    .map(function (value) {
                        return value.message;
                    })
                    .join('<br />');

                // only redraw if needed
                if (errors !== lastErrors) {
                    lastErrors = errors;

                    setTimeout(function () {
                        element.attr('tooltip', errors);
                    });
                }
            }

            activate();
        }
    };
});
