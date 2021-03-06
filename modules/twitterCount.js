'use strict';

var PromisePolyfill = require('promise');
var http = require('http');

// var twitterCountURL = 'http://urls.api.twitter.com/1/urls/count.json?url=';
var twitterCountURL = 'http://graph.facebook.com/?id=';
  // DEFAULT_TIMEOUT = 1000;

// TODO: Add timeout to every call, check if validUrl is null return null

/**
 * Gets the numbers of tweets of a given url.
 * @param {string} validUrl - The url to query
 * @returns {Number} Number of tweets
*/
exports.getCount = function(validUrl) {
    var body = '',
      twResponse = {};

    return new PromisePolyfill(function(resolve, reject) {
        if (validUrl) {
            http.get(twitterCountURL + validUrl, function(res) {
                // console.log(res);
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    try {
                        twResponse = JSON.parse(body);
                        twResponse.count = twResponse.shares;
                        // console.log(twResponse);
                        if (!twResponse.shares || twResponse.shares === null) {
                            twResponse.count = 0;
                        }
                    }catch (err) {
                        twResponse.count = 0;
                    }
                    // console.log(twResponse.count);
                    resolve(twResponse.count);
                });

            }).on('error', function(e) {
                reject(e.message);
            });

        }else {
            resolve(0);
        }
    });
};
