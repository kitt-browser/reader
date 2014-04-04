/// <reference path="../definitions/chrome/chrome.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="commons.ts" />

var _jQuery = $.noConflict(true);

(function ($) {

    var pendingRequest = false;

    var embedlyRequest = function(callback) {
        if (pendingRequest) {
            setTimeout(function() {
                alert('Request to EmbedLy service is in the process.');
            }, 250);
            return;
        }
        pendingRequest = true;

        var  EMBEDLY_URL = "http://api.embed.ly/1/extract?maxwidth=1000&key=" + Constants.EMBEDLY_TOKEN + "&url=#{URL}";

        var url = EMBEDLY_URL.replace('#{URL}', encodeURIComponent(window.location.href));
        var xhr = new XMLHttpRequest();

        var displayErrorMessage = function (reason: string) {
            setTimeout(function() {
                alert('Request to service EmbedLy has failed with possible reason: ' + reason);
            }, 250);
        };

        xhr.open('GET', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onerror = function () {
            displayErrorMessage('');
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                pendingRequest = false;

                // On success
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var embedLy = JSON.parse(xhr.responseText);
                        if (embedLy.content && embedLy.title) {
                            pendingRequest = false;
                            callback(xhr.responseText);
                        } else {
                            displayErrorMessage('EmbedLy service returned response with missing title or content.');
                        }
                    } catch (e) {
                        displayErrorMessage(e);
                    }
                }

                // On error
                if (xhr.status >= 400) {
                    displayErrorMessage(xhr.statusText);
                }

            }
        };
        xhr.send();
    }

    var displayFrame = function (text): HTMLElement {

        var div = document.createElement('div');
        div.style.cssText = 'overflow:scroll !important; -webkit-overflow-scrolling:touch !important;';
        div.style.backgroundColor = 'white';
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.bottom = "0px";
        div.style.right = "0px";
        div.style.padding = '0px';
        div.style['z-index'] = '10000000';
        div.style.zIndex = '10000000';

        var frame:HTMLIFrameElement = document.createElement('iframe');
        frame.src = chrome.extension.getURL('html/display.html?response=' + encodeURIComponent(text));
        frame.style.cssText = '-webkit-transform-origin: 50% 0';
        frame.style.top = "0px";
        frame.style.left = "0px";
        frame.style.height = "100%";
        frame.style.border = "none";

        var resize = function () {
            frame.style.top = "0px";
            frame.style.left = "0px";
            frame.style.height = "100%";
            frame.style.width = screen.width + 'px';
            var scale = document.documentElement.clientWidth / screen.width;
            frame.style['-webkit-transform'] = 'scale(' + scale + ')';
        }

        resize();

        frame.onload = function () {
            resize();
        }

        div.appendChild(frame);

        document.body.appendChild(div);

        return div;
    }

    var frameDisplayed:boolean;

    var frame:HTMLElement;

    var iconPath = function () {
        return 'images/'+(frameDisplayed? 'book_icon&48' :'book_side_icon&48')+'.png';
    }

    var toggleStatus = function() {
        frameDisplayed = !frameDisplayed;
        frame.style.display = frameDisplayed ? 'block': 'none';
        chrome.runtime.sendMessage({cmd:Constants.SET_ICON, path:iconPath()}, function () {});
    }

    $(document).ready(function () {

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

            switch (request.cmd) {
                case Constants.BROWSER_ACTION:

                    if (typeof frameDisplayed == 'undefined') {
                        embedlyRequest(function (text) {

                            frame = displayFrame(text);
                            frameDisplayed = false;
                            toggleStatus();
                        });
                    } else {
                        toggleStatus();
                    }

                    sendResponse({});
                    break;
                case Constants.GET_ICON:
                    sendResponse({path: iconPath()});
                    break;
                default:
                    sendResponse({});
                    break;
            }
        });

        chrome.runtime.sendMessage({cmd:Constants.SET_ICON, path:iconPath()}, function () {});

    });

})(_jQuery);

