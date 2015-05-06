'use strict';

var express = require('express');
var router = new express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
      title: 'Express',
      pagename: 'Choose a category'
     });
});

module.exports = router;
