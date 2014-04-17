/// <reference path="../definitions/chrome/chrome.d.ts" />
/// <reference path="commons.ts" />

chrome.browserAction.onClicked.addListener(function() {

    chrome.tabs.query({active: true}, function(tabs) {
        if (tabs.length <= 2) {
            chrome.tabs.sendMessage(tabs[0].id, {cmd: Constants.BROWSER_ACTION}, function () {});
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.cmd) {
        case Constants.SET_ICON:
            chrome.browserAction.setIcon({path: request.path});
            sendResponse({});
            break;
        default:
            sendResponse({});
            break;
    }
});