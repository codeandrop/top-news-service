'use strict';

var Promise = require('promise');
var http = require('http');

var twitterCountURL = 'http://urls.api.twitter.com/1/urls/count.json?url=';
  // DEFAULT_TIMEOUT = 1000;

// TODO: Add timeout to every call, check if validUrl is null return null
// TODO: Add JSdoc

exports.getCount = function(validUrl) {
    return new Promise(function(resolve, reject) {
        http.get(twitterCountURL + validUrl, function(res) {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                var twResponse = JSON.parse(body);
                resolve(twResponse.count);
            });

        }).on('error', function(e) {
            reject(e.message);
        });
    });
};
