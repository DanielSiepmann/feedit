(function () {
    // Merge context from opener into this window.
    // This allows opened popups to retrieve TYPO3 backend context.
    if (window.opener !== null) {
        window.TYPO3 = Object.assign({}, window.opener.TYPO3, window.TYPO3);
    }

    // Add closest implementation if missing.
    window.Element && function(ElementPrototype) {
        ElementPrototype.closest = ElementPrototype.closest ||
            function(selector) {
                var el = this;
                while (el.matches && !el.matches(selector)) el = el.parentNode;
                return el.matches ? el : null;
            }
    }(Element.prototype);

    // Define public API
    // This can also be overwritten upfront by defining the same properties / functions.
    var publicApi = {
        openBackendHandler: function (event) {
            event.preventDefault();
            var element = event.target;

            if (element.tagName !== 'A') {
                element = element.closest('a.typo3-feedit-btn-openBackend');
            }

            var vHWin = window.open(element.getAttribute('data-backendScript'), element.getAttribute('data-t3BeSitenameMd5'));
            vHWin.focus();
            return false;
        },
        submitFormHandler: function (event) {
            event.preventDefault();
            var element = event.target;

            if (element.tagName !== 'A') {
                element = element.closest('a.typo3-feedit-btn-submitForm');
            }

            var execute = true;
            var form = document[element.getAttribute('data-feedit-formname')];
            var confirmText = element.getAttribute('data-feedit-confirm');

            if (confirmText) {
                execute = confirm(confirmText);
            }

            if (execute) {
                form.querySelector('.typo3-feedit-cmd').value = element.getAttribute('data-feedit-cmd');
                form.submit();
            }

            return false;
        }
    };

    var internalApi = {
        disableElement: function (element) {
            element.classList.add('disabled');
            var parentPanel = element.closest('.typo3-editPanel');
            if (parentPanel !== null) {
                parentPanel.classList.add('typo3-feedit-not-fully-functional');
            }

            element.addEventListener('click', function (event) {
                event.preventDefault();
                return false;
            });

            var buttonTitleElement = element.querySelector('span');
            if (buttonTitleElement != null) {
                buttonTitleElement.title = 'Disabled due to … ' + buttonTitleElement.title;
            }
        },
        initializeEditModule: function () {
            var active = true;
            if (typeof window.TYPO3.settings === "undefined") {
                var active = false;
                document.querySelector('.feedit-defect').style.display = 'block';
            }

            var editModuleBtnsOpenBackend = document.querySelectorAll('.typo3-feedit-btn-openBackend');
            for (var i = 0, len = editModuleBtnsOpenBackend.length; i < len; i++ ) {
                if (active) {
                    editModuleBtnsOpenBackend[i].addEventListener('click', window.TYPO3.Feedit.openBackendHandler);
                } else {
                    internalApi.disableElement(editModuleBtnsOpenBackend[i]);
                }
            }

            var editModuleBtnsSubmitForm = document.querySelectorAll('.typo3-feedit-btn-submitForm');
            for (var i = 0, len = editModuleBtnsSubmitForm.length; i < len; i++ ) {
                if (active) {
                    editModuleBtnsSubmitForm[i].addEventListener('click', window.TYPO3.Feedit.submitFormHandler);
                } else {
                    internalApi.disableElement(editModuleBtnsSubmitForm[i]);
                }
            }
        }
    };

    window.TYPO3.Feedit = Object.assign(publicApi, window.TYPO3.Feedit);
    window.addEventListener('load', internalApi.initializeEditModule, false);
})();
