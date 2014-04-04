/// <reference path="../definitions/chrome/chrome.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="commons.ts" />

$(document).ready(function () {

    var search = window.location.search;
    if(search.length > 1 && search.charAt(0) == '?') {
        search = search.substr(1);
    }
    if (search.length > 0) {
        var terms = search.split("&");
        for(var i = 0; i < terms.length; i++)
        {
            var key = terms[i].split('=')[0];
            var value = terms[i].split('=')[1];

            if (key == 'response') {

                var embedly:any = JSON.parse(decodeURIComponent(value));

                var title:any = $('#title');
                title.html(embedly.title);

                var content = $('#content');
                content.html(embedly.content.replace(/(\r\n|\n|\r)/gm,""));

                if (embedly.related) {
                    var related: Array<any> = embedly.related;

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
            }
        }
    }
});