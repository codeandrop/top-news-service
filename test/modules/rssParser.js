'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var http = require('http');
var fs = require('fs');
var PassThrough = require('stream').PassThrough;
var rssParser = require('../../modules/rssParser');

var response,
  responsePT;

chai.should();
chai.use(chaiAsPromised);

// TODO: move this response to feed.js test file
        // sinon
        //   .stub(rssParser, 'parseRss')
        //   .yields(null, null,
        //           {'title': 'Science',
        //            'link': 'http://www.reddit.com/r/science/.rss',
        //            'image': 'http://www.reddit.com/sBJfjQft_8pqDRBA.png',
        //            'items': [
        //                {
        //                 'title': 'Title 1',
        //                 'title2': 'Title 1',
        //                 'mediaUrl': 'https://www.google.com',
        //                 'newUrl': 'https://www.google.com',
        //                 'date': '2015-05-08 11:32:32'
        //               },
        //               {
        //                 'title': 'Title 2',
        //                 'title2': 'Title 2',
        //                 'mediaUrl': 'https://www.yahoo.com',
        //                 'newUrl': 'https://www.yahoo.com',
        //                 'date': '2015-05-08 11:34:34'
        //               }
        //          ]
        //          });

describe('rssParser Module', function() {

    beforeEach(function(done) {
        response = new PassThrough();
        responsePT = new PassThrough();
        sinon.stub(http, 'get');
        done();
    });

    afterEach(function(done) {
        http.get.restore();
        done();
    });

    it('should return valid object when a valid url is passed', function(done) {

        var data = fs.readFileSync('test/fixtures/rssResponse1.xml', 'utf8');

        response.write(data);
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        rssParser.parseRss('http://www.reddit.com/r/science/.rss')
        .done(function(responseObject) {
            responseObject.should.be.an('object');
            responseObject.items.length.should.equal(3);
            done();
        });
    });

    it('should return empty items when a valid url is not found', function(done) {

        var data = fs.readFileSync('test/fixtures/notFound.xml', 'utf8');

        response.write(data);
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        rssParser.parseRss('http://www.reddit.com/r/urlnotfound/.rss')
        .done(function(responseObject) {
            responseObject.should.be.an('object');
            responseObject.items.length.should.equal(0);
            done();
        });
    });

    it('should throw an error with an empty response', function(done) {

        var data = '';

        response.write(data);
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        rssParser.parseRss('http://www.reddit.com/r/emptyresponse/.rss')
        .then(function() {
            // Not returning a valid responseObject, should catch the error
        }, function(error) {
            error.should.equal('Not a feed');
            done();
        });
    });
});
