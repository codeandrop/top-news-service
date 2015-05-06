'use strict';

var cheerio = require('cheerio');
var FeedParser = require('FeedParser');
var http = require('http');
var PromisePolyfill = require('Promise');
var urlEncode = require('urlEncode');

// TODO: Add JSdoc

function getValidURL(content) {
    var $ = cheerio.load(content),
      responseUrl;

    $('a').each(function(i, e) {
        if ( $(e).attr('href').indexOf('reddit.com') === -1 &&
          $(e).attr('href').indexOf('imgur.com') === -1 ) {
            responseUrl = $(e).attr('href');
        }
    });
    return responseUrl;
}

exports.parseRss = function(rssUrl) {
    var responseObject = {
      title: '',
      link: '',
      image: '',
      items: []
    };

    return new PromisePolyfill(function(resolve, reject) {
        http.get(rssUrl, function(resGet) {
            resGet.pipe(new FeedParser({}))
                .on('error', function(error) {
                    reject(error.message);
                })
                .on('meta', function(meta) {
                    responseObject.title = meta.title;
                    responseObject.link = meta.link;
                })
                .on('readable', function() {
                    var stream = this,
                      item,
                      validUrl = '';

                    while ((item = stream.read())) {
                        validUrl = getValidURL(item.description);
                        item.title2 = urlEncode(item.title);

                        if (validUrl) {
                            var ep = {
                                'title': item.title,
                                'title2': item.title2,
                                'mediaUrl': item.link,
                                'newUrl': validUrl,
                                'date': item.date
                            };

                            responseObject.items.push(ep);
                        }

                    }
                })
                .on('end', function() {
                    resolve(responseObject);
                });
        })
        .on('error', function(error) {
            reject(error.message);
        });
    });
};
