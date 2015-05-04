var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express',
    pagename: 'Choose a category',
    authors: ['Paul', 'Jim', 'Jane']
   });
});

module.exports = router;
