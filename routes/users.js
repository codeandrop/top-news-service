'use strict';

var express = require('express');
var router = new express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource');
});

module.exports = router;
