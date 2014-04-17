/// <reference path="../definitions/chrome/chrome.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="commons.ts" />

$(document).ready(function () {

    var readerResponse:any;

    var updateContent = function (readerResponse:string):string {

        var embedLy:any;
        try {
            embedLy = JSON.parse(readerResponse);
        } catch (e) {
            return 'Response can\'t be parsed.';
        }

        if (!embedLy.title || !embedLy.content) {
            return 'Response doesn\'t contain title or content.';
        }

        var title:any = $('#title');
        title.html(embedLy.title);

        var content = $('#content');
        content.html(embedLy.content.replace(/(\r\n|\n|\r)/gm,""));

        if (embedLy.related) {
            var related: Array<any> = embedLy.related;

            var p = $('#related')[0];

            for (var i = 0; i < related.length; i++) {

                var b = document.createElement('b');
                b.innerHTML = related[i].title;
                p.appendChild(b);

                var description = document.createElement('div');
                description.innerHTML = related[i].description;
                p.appendChild(description);

                var a = document.createElement('a');
                var linkText = document.createTextNode(related[i].url);
                a.appendChild(linkText);
                a.href = related[i].url;
                p.appendChild(a)

                var br = document.createElement('br');
                p.appendChild(br);
            }
        }

        $('a').click(function () {
            var self:HTMLAnchorElement = <HTMLAnchorElement>this;
            chrome.tabs.query({active:true}, function (tabs) {
                if (tabs.length > 0) {
                    var tab = tabs[0];
                    chrome.tabs.update(tab.id, {url:self.href}, function () {
                        // No response
                        window.close();
                    });
                }
            });
            return false;
        });

        // Hide preloader
        $('.preloader').hide();

        return null;
    }

    var getReaderContent = function () {
        chrome.tabs.query({active:true}, function (tabs) {
            // Kitt, only one active tabs (Chrome may have multiple active tab).
            if (tabs.length > 0) {
                var tab = tabs[0];

                chrome.tabs.sendMessage(tab.id, {cmd:Constants.GET_READER_CONTENT}, function (response) {
                    // No response
                });
            }
        });
    }

    // Repeat until it gets response
    var handle = setInterval(function () {
        if (typeof readerResponse == 'undefined') {
            getReaderContent();
        } else {
            clearInterval(handle);
        }
    }, 250);


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.cmd) {
            case Constants.READER_CONTENT:
                var status: string;

                readerResponse = request.readerResponse;

                if (readerResponse.content) {
                    status = updateContent(readerResponse.content);
                } else {
                    status = readerResponse.error;
                }

                if (status) {
                    $('#preloader').hide();
                    $('#message-box').show();
                    $('#message-box-content').html("Could not get content from Embed.ly.");
                }

                sendResponse({});
                break;
            default:
                sendResponse({});
                break;
        }
    });
});