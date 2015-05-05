'use strict';

var express = require('express');
var router = new express.Router();
// var a = 1;
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
      title: 'Express',
      pagename: 'Choose a category 1'
     });
});

module.exports = router;
