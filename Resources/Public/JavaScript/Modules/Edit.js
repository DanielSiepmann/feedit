(function () {
    // Merge context from opener into this window.
    // This allows opened popups to retrieve TYPO3 backend context.
    if (window.opener !== null) {
        window.TYPO3.settings = Object.assign({}, window.opener.TYPO3.settings, window.TYPO3.settings);
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
        settings: {
            mode: 'popup'
        },
        openBackendHandler: function (event) {
            event.preventDefault();

            var element = event.target;
            if (element.tagName !== 'A') {
                element = element.closest('a.typo3-feedit-btn-openBackend');
            }

            if (window.TYPO3.Feedit.settings.mode === 'modal') {
                internalApi.openBackendInModal(element);
            } else {
                internalApi.openBackendInWindow(element);
            }

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
        openBackendInModal: function (element) {
            if (typeof jQuery === 'undefined') {
                console.error('jQuery is not defined, modal is therefore not possible, fallback to window.');
                internalApi.openBackendInWindow(element);
                return;
            }

            var $modal;
            var iframe;
            var url;

            try {
                url = new URL(element.getAttribute('data-backendScript'));
            } catch (error) {
                var currentUrl = new URL(document.URL);
                url = new URL(currentUrl.origin + element.getAttribute('data-backendScript'));
            }
            url.searchParams.delete('returnUrl')

            $modal = $(
                '<div class="modal" id="feeditModal" tabindex="-1" data-keyboard="false" style="display: none">'
                    + '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">'
                        + '<div class="modal-content" style="width: 75vh; height: 75vh;">'
                            + '<div class="modal-body">'
                                + '<iframe height="100%" width="100%" frameBorder="0">'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>'
            );
            $('body').append($modal);

            iframe = $modal.find('iframe:first')[0];
            iframe.src = url.toString();
            iframe.onload = function () {
                iframe.contentWindow.TYPO3.FormEngine.preventExitIfNotSavedCallback = function () {
                    $modal.modal('hide');
                    $modal.remove();
                    window.location.reload();
                };
            };

            $modal.modal({
                keyboard: false,
                focus: true,
                show: true
            });
        },
        openBackendInWindow: function (element) {
            var backendWindow = window.open(
                element.getAttribute('data-backendScript'),
                element.getAttribute('data-t3BeSitenameMd5')
            );
            backendWindow.focus();
        },
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
