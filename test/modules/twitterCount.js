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

    it('should return 0 when an empty json response is passed', function(done) {
        var expected = {'count': '', 'url': 'www.google.com'};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('www.google.com').should.eventually.equal(0).notify(done);
    });

    it('should return 0 when an null count response is passed', function(done) {
        var expected = {'count': null, 'url': 'www.google.com'};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('www.google.com').should.eventually.equal(0).notify(done);
    });

    it('should return 0 when an undefined count response is passed', function(done) {
        var emptyCount,
          expected = {'count': emptyCount, 'url': 'www.google.com'};

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('www.google.com').should.eventually.equal(0).notify(done);
    });

    it('should return 0 when an invalid json response is passed', function(done) {
        var expected = '[1, 2, 3, 4, ]';

        response.write(expected);
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('www.google.com').should.eventually.equal(0).notify(done);
    });


    it('should return rejected promise when an error is emitted in stream response', function(done) {
        var expected = {'count': '', 'url': 'www.google.com'},
          expectedError = 'unknown error 1';

        response.write(JSON.stringify(expected));
        response.end();

        http.get.callsArgWith(1, response)
                .returns(responsePT);

        twitterCount.getCount('www.google.com').should.be.rejectedWith(expectedError).notify(done);

        responsePT.emit('error', {message: expectedError});

    });
});
