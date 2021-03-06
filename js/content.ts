/// <reference path="../definitions/chrome/chrome.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="commons.ts" />

var FRAME_WIDTH = 240;

var pendingRequest = false;

var embedlyRequest = function(callback) {
    if (pendingRequest) {
        // NO callback, no response
        return;
    }
    pendingRequest = true;

    var canonical = document.querySelector('link[rel="canonical"]');
    var url = canonical ? canonical.getAttribute("href") : window.location.href;

    if (typeof url === 'undefined') {
        url = window.location.href;
    }

    var  EMBEDLY_URL = "http://api.embed.ly/1/extract?maxwidth=1000&key=" + Constants.EMBEDLY_TOKEN + "&url=#{URL}";

    var url = EMBEDLY_URL.replace('#{URL}', encodeURIComponent(url));
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onerror = function () {
        callback(null, 'XHR Error');
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            pendingRequest = false;
                // On success
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.responseText, null);
            }
                // On error
            if (xhr.status >= 400) {
                callback(null, xhr.statusText || 'Server error');
            }
        }
    };
    xhr.send();
}

var readerResponse:any;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.cmd) {
        case Constants.GET_READER_CONTENT:
            if (typeof readerResponse == 'undefined') {
                embedlyRequest(function (text, error) {
                    if (text) {
                        readerResponse = {
                            content: text
                        };
                    } else {
                        readerResponse = {
                            error: error ? error.toString(): ''
                        };
                    }
                    chrome.runtime.sendMessage({cmd:Constants.READER_CONTENT, readerResponse:readerResponse}, function () {
                        // No response
                    });
                });
            } else {
                chrome.runtime.sendMessage({cmd:Constants.READER_CONTENT, readerResponse:readerResponse}, function () {
                    // No response
                });
            }
            sendResponse({});
        break;
        default:
            sendResponse({});
        break;
    }
});

