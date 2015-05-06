'use strict';

var Promise = require('promise');
var rssParser = require('../modules/rssParser');
var twitterCount = require('../modules/twitterCount');

// TODO: Add JSdoc

var serverRes,
  rssObject = {
    title: '',
    link: '',
    image: '',
    items: []
  },
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
    rssObject.items.sort(function(a, b) {
        return b.count - a.count;
    });
}

function renderPage() {
    serverRes.render('feed', rssObject);
}

function getCountAllItems() {
    return Promise.all(
        rssObject.items.map(function(element, index, array) {
            return twitterCount.getCount(element.newUrl);
        })
    );
}

function addCountAllItems(countValues) {
    rssObject.items.map(function(element, index, array) {
        element.count = countValues[index];
    });
}

function updateRSSArray() {
    getCountAllItems()
    .done(function(results) {
        addCountAllItems(results);
        rebuildArray();
        renderPage();
    });
}

exports.parse = function(req, res) {
    var urlIndex = --req.params.feedUrl,
    feedUrl;

    serverRes = res;
    feedUrl = rssURL[urlIndex];

    rssParser.parseRss(feedUrl)
    .done(function(responseObject) {
        rssObject = responseObject;
        updateRSSArray();
    });
};
