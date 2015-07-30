xtForm.directive('xtValidationTooltip',['$compile', 'xtFormConfig', '$interpolate', function ($compile, xtFormConfig, $interpolate) {
    'use strict';

    return {
        require: ['^xtForm', '^ngModel'],
        restrict: 'EA',
        link: function (scope, element, attrs, ctrls) {

            var xtForm = ctrls[0];
            var defaultErrors = xtFormConfig.getErrorMessages();

            var ngModelElement;

            /**
             * Activates the directive
             */
            function activate() {

                setupNgModel();
                setupTooltipElement();
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

            function setupTooltipElement() {
                // String concatenation. To get expression like : 
                // (formName.elementName.$error.required ? "":"The field is required. ") + (formName.elementName.$error.minlength ? "":"The field is minlength is 6. ")
                var pre = '!' + xtForm.form.$name + '.' + ngModelElement.attr('name');
                var errorPre = pre + '.$error';

                var errors = getErrors()
                    .map(function (value) {
                        return '(' + errorPre + '.' + value.key + '?"":"' + value.message + '.  ")';
                    })
                    .join(' + ');

                element.addClass('xt-error-container');

                element.attr('tooltip-placement', 'top');
                element.attr('tooltip', '{{' + errors + '}}');
                element.attr('tooltip-trigger', 'mouseenter');
                element.attr('tooltip-class', 'xtClass');

                element.attr('tooltip-enable', pre + '.$valid');
                // remove the attribute to avoid indefinite loop.
                // see http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs
                element.removeAttr(attrs.$attr.xtValidationTooltip);

                $compile(element)(scope);
            }

            /**
             * Gets All error messages on element 
             */
            function getErrors() {
                var errors = [];

                angular.forEach(attrs, function (attrValue, attrKey) {
                    var key = attrKey;

                    if (attrKey.indexOf('ng') === 0) {
                        key = attrKey.substring(2).toLowerCase();
                    } else if (attrKey.toLowerCase() === 'type') {
                        key = attrValue.toLowerCase();
                    }
                    if (key in defaultErrors) {
                        var error = {
                            key: key,
                            message: getErrorMessageForKey(key)
                        };
                        errors.push(error);
                    }
                });
                return errors;
            }

            function getErrorMessageForKey(key) {
                var attrKey = 'msg' + key[0].toUpperCase() + key.substring(1);

                // use either the provided string as an interpolated attribute, or the default message
                return attrs[attrKey] ?
                    attrs[attrKey] :
                    $interpolate(defaultErrors[key])(attrs);
            }

            activate();
        }
    };
}]);
