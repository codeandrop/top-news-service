'use strict';

var cheerio = require('cheerio');
var FeedParser = require('FeedParser');
var http = require('http');
var urlEncode = require('urlEncode');
// var _ = require('underscore');

var episodesTw = [],
  episodesTw2 = [],
  // episodes = [],
  feedUrl,
  totalNews = 0,
  indexNews = 0,
  serverRes,
  feedMeta,
  rssURL = [
    'http://www.reddit.com/r/technology/.rss',
    'http://www.reddit.com/r/science/.rss',
    'http://www.reddit.com/r/Environment/.rss',
    'http://www.reddit.com/r/userexperience/.rss',
    'http://www.reddit.com/.rss',
    'http://www.reddit.com/r/news+worldnews+science+EverythingScience+technology+environment.rss',
    'http://www.reddit.com/r/Entrepreneur+smallbusiness+startups+marketing+business.rss',
    'http://www.reddit.com/r/Marketing+webmarketing.rss',
    'http://www.reddit.com/r/goodnews+goodnewseveryone+upliftingnews.rss',
    'http://www.reddit.com/r/montreal.rss',
    'http://www.reddit.com/r/Quebec.rss'
];



function rebuildArray() {

    // _.sortBy(episodesTw,...
    // episodesTw = _.sortBy(episodesTw);
    // episodesTw2 = _.sortBy(episodesTw, function(num){ return Math.sin(num); });
    // console.log(episodesTw);
    //
    // var maxSpeed = {car:300, bike:60, motorbike:200, airplane:1000,
        // helicopter:400, rocket:8*60*60}
    // var episodesTw2 = [];
    // for (var ep in episodesTw)
          // episodesTw2.push([ep.newUrl, ep.count]);
    // episodesTw2.sort(function(a, b) {return a[1] - b[1]});
    // console.log(episodesTw2);
    // episodesTw.sort(function(a, b) {return a[1] - b[1]});
    episodesTw.sort(function(a, b) {
        return b.count - a.count;
    });
}

function renderPage() {
    // console.log(episodesTw);

    serverRes.render('feed1', {
                    'feedName': feedMeta.title,
                    'website': feedMeta.link,
                    'albumArtUrl': feedMeta.image.url,
                    'episodes': episodesTw
                });
}

function getTwitterCount(validUrl) {

    var currentEp = episodesTw2.pop();
    // check item count on twitter
    http.get('http://urls.api.twitter.com/1/urls/count.json?url=' + validUrl, function(res) {
        // console.log(item.link);
        // console.log(res);
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var twResponse = JSON.parse(body),
              epTmp;
            // console.log('Got response: ', twResponse.count+' : '+twResponse.url);

            var ep = {
                // 'title': item.title,
                // 'title2': item.title2,
                // 'mediaUrl': item.link,
                'newUrl': validUrl,
                'count': twResponse.count
                // 'publicationDate': item.pubDate
            };
            // rebuild array
            indexNews++;
            // return twResponse.count;
            // episodesTw.push(ep);

            // do a loop and compare url to save full info
            for (epTmp in episodesTw2) {
                if (validUrl === episodesTw2.newUrl) {
                    currentEp = epTmp;
                    console.log('found a match');
                    return;
                }
            }

            // new_date = currentEp.date.getFullYear()+'-'+(currentEp.date.getMonth()+1)+'-'+currentEp.date.getDate();
            // new_date += ' '+currentEp.date.getHours()+':'+currentEp.date.getMinutes();
            //


            ep = {
                'title': currentEp.title,
                'title2': currentEp.title2,
                'mediaUrl': currentEp.link,
                'newUrl': validUrl,
                'date': currentEp.date,
                // 'date': new_date,
                'count': twResponse.count
            };

            // episodes.push(ep);
            episodesTw.push(ep);

            if (indexNews < totalNews) {
                rebuildArray();
            }else {
                renderPage();
            }
        });

    }).on('error', function(e) {
        console.log('Got error: ' + e.message);
    });
}

function getValidURL(content) {
    var $ = cheerio.load(content);
    $('a').each(function(i, e) {
        // console.log($(e).attr('href'));
        if ( $(e).attr('href').indexOf('reddit.com') === -1 &&
          $(e).attr('href').indexOf('imgur.com') === -1 ) {
            return $(e).attr('href');
        }
    });
    return null;
}

exports.parse = function(req, res) {

    // Retain referene to original response, so we can answer the user at some point
    serverRes = res;
    // episodes = [];
    feedUrl = req.params.feedUrl;

    feedUrl--;

    feedUrl = rssURL[feedUrl];

    episodesTw = [];
    episodesTw2 = [];

    // Get the feed by URL
    http.get(feedUrl, function(resGet) {

        // Give the 'res' stream to FeedParser for processing
        resGet.pipe(new FeedParser({}))

            // Handle HTTP errors
            .on('error', function(error) {
                serverRes.status(500).json({
                    'message': 'HTTP failure while fetching feed'
                });
            })

            // Store the feed's metadata
            .on('meta', function(meta) {
                feedMeta = meta;
            })

            // Every time a readable chunk arrives, add it to the episodes array
            .on('readable', function() {
                var stream = this,
                  item,
                  validUrl = '';
                while ((item = stream.read()) !== null) {
                    // filter description to extract valid link url
                    validUrl = getValidURL(item.description);

                    // console.log(urlEncode(item.title));
                    item.title2 = urlEncode(item.title);
                    // item.title2 = item.title2.substring(0,138);

                    if (validUrl !== '') {
                        totalNews++;

                        //  console.log('continue '+totalNews);

                        var ep = {
                            'title': item.title,
                            'title2': item.title2,
                            'mediaUrl': item.link,
                            'newUrl': validUrl,
                            'date': item.date

                        };

                        // console.log(item);
                        // return;

                        episodesTw2.push(ep);

                        getTwitterCount(validUrl);
                    }

                }
            })

            // When everything completes, create a result JSON to hand back to the user
            .on('end', function() {

                // serverRes.render('feed1',{
                //     'feedName': feedMeta.title,
                //     'website': feedMeta.link,
                //     'albumArtUrl': feedMeta.image.url,
                //     'episodes': episodes
                // });


                // serverRes.json({
                //     'feedName': feedMeta.title,
                //     'website': feedMeta.link,
                //     'albumArtUrl': feedMeta.image.url,
                //     'episodes': episodes
                // });
            });
    });





};
