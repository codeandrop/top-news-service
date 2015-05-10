'use strict';

var cheerio = require('cheerio');
var FeedParser = require('feedParser');
var http = require('http');
var PromisePolyfill = require('Promise');
var urlEncode = require('urlEncode');



// TODO: Refactor methods, validurl

/**
  * Extracts a valid url from the RSS Feed Item, taking into account exception urls
  * @param {string} content - the item to be analyzed
  * @returns {string} - the valid url inside the item
*/
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

/**
  * Parses a RSS stream into an Object
  * @param {string} rssUrl - RSS url to fetch the stream
  * @returns {Object} - the Object with meta and item information
*/
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
