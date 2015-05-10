'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var http = require('http');
var PassThrough = require('stream').PassThrough;
var twitterCount = require('../../modules/twitterCount');

var response,
  responsePT;

chai.should();
chai.use(chaiAsPromised);

describe('twitterCount Module', function() {

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

    it('should return valid count when a valid url is passed', function(done) {
        var expected = {'count': 234453234, 'url': 'http:\/\/www.google.com\/'};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('http://www.google.com').should.eventually.equal(234453234).notify(done);
    });

    it('should return 0 when a invalid url is passed', function(done) {
        var expected = {'count': 0, 'url': 'http:\/\/invalidurl.invalid\/'};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('http://invalidurl.invalid').should.eventually.equal(0).notify(done);
    });

    it('should return 0 when an empty url is passed', function(done) {
        var expected = {'count': 0, 'url': ''};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('').should.eventually.equal(0).notify(done);
    });
});
