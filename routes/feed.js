var cheerio = require("cheerio");
var FeedParser = require('feedparser');
var http = require('http');
var urlencode = require('urlencode');
var _ = require('underscore');


var episodes_tw = [];
var episodes_tw2 = [];
var total_news = 0;
var index_news = 0;

//RSS Feed
//http://www.reddit.com/r/technology/.rss
//http://www.reddit.com/r/science/.rss
//http://www.reddit.com/r/Environment/.rss

var rssURL = [
    "http://www.reddit.com/r/technology/.rss",
    "http://www.reddit.com/r/science/.rss",
    "http://www.reddit.com/r/Environment/.rss",
    "http://www.reddit.com/r/userexperience/.rss",
    "http://www.reddit.com/.rss",
    "http://www.reddit.com/r/news+worldnews+science+EverythingScience+technology+environment.rss",
    "http://www.reddit.com/r/Entrepreneur+smallbusiness+startups+marketing+business.rss",
    "http://www.reddit.com/r/Marketing+webmarketing.rss",
    "http://www.reddit.com/r/goodnews+goodnewseveryone+upliftingnews.rss",
    "http://www.reddit.com/r/montreal.rss",
    "http://www.reddit.com/r/Quebec.rss"


];

exports.parse = function(req, res){

    episodes_tw = [];
    episodes_tw2 = [];
    // Retain referene to original response, so we can answer the user at some point
    var serverRes = res;

    // Get the feedUrl, which was passed in via the url, e.g. /feed/http%3A%2F%2Fleoville.tv%2Fpodcasts%2Fsn.xml
    var feedUrl = req.params.feedUrl;
    feedUrl--;


    var feedUrl = rssURL[feedUrl];

    // Create a variable to store the feed's meta data, e.g. title, author, album art
    var feedMeta;

    // Create an array to hold episodes
    var episodes = [];


    // Get the feed by URL
    http.get(feedUrl, function(res) {

        // Give the 'res' stream to FeedParser for processing
        res.pipe(new FeedParser({}))

            // Handle HTTP errors
            .on('error', function(error){
                serverRes.status(500).json({
                    'message': 'HTTP failure while fetching feed'
                });
            })

            // Store the feed's metadata
            .on('meta', function(meta){
                feedMeta = meta;
            })

            // Every time a readable chunk arrives, add it to the episodes array
            .on('readable', function(){
                var stream = this, item;
                var valid_url = "";
                while (item = stream.read()){
                    //filter description to extract valid link url
                    var $ = cheerio.load(item.description);
                    $("a").each(function(i, e) {
                        //console.log($(e).attr("href"));
                        if($(e).attr("href").indexOf("reddit.com") == -1 &&
                        $(e).attr("href").indexOf("imgur.com") == -1
                            ) {
valid_url = $(e).attr("href");
//break;
                        }
                      });



                    //console.log(urlencode(item.title));
                    item.title2 = urlencode(item.title);
                    //item.title2 = item.title2.substring(0,138);

                    if(valid_url != "") {
                        total_news++;

                        // console.log("continue "+total_news);

                        var ep = {
                            'title': item.title,
                            'title2': item.title2,
                            'mediaUrl': item.link,
                            'newUrl': valid_url,
                            'date': item.date

                        };

                        // console.log(item);
                        // return;

                        episodes_tw2.push(ep);

                        getTwitterCount(valid_url);
                    }

                }
            })

            // When everything completes, create a result JSON to hand back to the user
            .on('end', function(){

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


function rebuildArray() {

    // _.sortBy(episodes_tw,...
    // episodes_tw = _.sortBy(episodes_tw);
    // episodes_tw2 = _.sortBy(episodes_tw, function(num){ return Math.sin(num); });
    // console.log(episodes_tw);
    //
    // var maxSpeed = {car:300, bike:60, motorbike:200, airplane:1000,
        // helicopter:400, rocket:8*60*60}
    // var episodes_tw2 = [];
    // for (var ep in episodes_tw)
          // episodes_tw2.push([ep.newUrl, ep.count]);
    // episodes_tw2.sort(function(a, b) {return a[1] - b[1]});
    // console.log(episodes_tw2);
    // episodes_tw.sort(function(a, b) {return a[1] - b[1]});
    episodes_tw.sort(function(a, b) {return b.count - a.count});

}

function renderPage() {
    // console.log(episodes_tw);

    serverRes.render('feed1',{
                    'feedName': feedMeta.title,
                    'website': feedMeta.link,
                    'albumArtUrl': feedMeta.image.url,
                    'episodes': episodes_tw
                });
}

function getTwitterCount(valid_url) {

    var current_ep = episodes_tw2.pop();
    //check item count on twitter
    http.get("http://urls.api.twitter.com/1/urls/count.json?url="+valid_url, function(res) {
        // console.log(item.link);
        // console.log(res);
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var twResponse = JSON.parse(body)
            // console.log("Got response: ", twResponse.count+" : "+twResponse.url);

            var ep = {
                // 'title': item.title,
                // 'title2': item.title2,
                // 'mediaUrl': item.link,
                'newUrl': valid_url,
                'count': twResponse.count
                // 'publicationDate': item.pubDate
            };
            //rebuild array
            index_news++;
            // return twResponse.count;
            // episodes_tw.push(ep);

            //do a loop and compare url to save full info
            for(ep_tmp in episodes_tw2) {
                if(valid_url == episodes_tw2.newUrl) {
                    current_ep = ep_tmp;
                    console.log("found a match");
                    return;
                }
            }

            // new_date = current_ep.date.getFullYear()+"-"+(current_ep.date.getMonth()+1)+"-"+current_ep.date.getDate();
            // new_date += " "+current_ep.date.getHours()+":"+current_ep.date.getMinutes();
            //


            var ep = {
                'title': current_ep.title,
                'title2': current_ep.title2,
                'mediaUrl': current_ep.link,
                'newUrl': valid_url,
                'date': current_ep.date,
                // 'date': new_date,
                'count': twResponse.count
            };

            // episodes.push(ep);
            episodes_tw.push(ep);

            if(index_news < total_news) {
                rebuildArray();
            }else {
                // console.log('------------');
                renderPage();
            }



        });

    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

};
