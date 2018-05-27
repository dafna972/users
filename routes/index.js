const express = require('express');
const router = express.Router();
const checksession = require('./checksession');
const debug = require('debug')('lab7:index');

/* GET home page. */
router.get('/', checksession, async (req, res) => {
    debug('requested');
    if (req.session.count === undefined)
        req.session.count = 1;
    else
        req.session.count++;
    res.render('index', { title: 'Express',
                          count: req.session.count,
                          userName: req.session.userName });
});

router.get('/logout', async (req, res) => {
    debug('logging out');
    req.session.regenerate(err => {
        debug('logged out');
        res.redirect('/');
    });
});

module.exports = router;
