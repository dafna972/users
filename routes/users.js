const express = require('express');
const router = express.Router();
const checksession = require('./checksession');
const User = require('../model')("User");
const debug = require('debug')('lab7:users');

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.send('respond with a resource');
// });

/* GET users listing. */
router.get('/', checksession, async (req, res) => {
    debug('request users');
    try {
        res.render('users', {title: 'User List', admin: req.session.admin, users: await User.REQUEST()});
    } catch (err) { debug(`get users failure: ${err}`); }
});

router.get('/add', checksession, async (req, res) => {
    debug('add user page');
    if (!req.session.admin) {
        debug("Must be admin to add a user!!!");
        res.redirect('/users');
    } else
        res.render('adduser', {title: 'Add user', admin: req.session.admin});
});

router.post('/add', checksession, async (req, res) => {
    debug('add user');
    if (!req.session.admin)
        debug("Must be admin to add a user!!!");
    else if (req.body.user === undefined || req.body.user === null || req.body.user === "")
        debug("Missing user to add!!!");
    else if (req.body.password === undefined || req.body.password === null || req.body.password === "")
        debug("Missing password for user to add!!!");
    else if (req.body.name === undefined || req.body.name === null || req.body.name === "")
        debug("Missing name for  userto add!!!");
    else {
        let user;
        try {
            user = await User.findOne({username: req.body.user}).exec();
        } catch (err) {
            debug(`get user for adding failure: ${err}`);
        }
        if (user === null)
            try {
                await User.CREATE([req.body.name, req.body.user, req.body.password, req.body.admin !== undefined]);
                debug('User created:' + user);
            } catch (err) {
                debug("Error creating a user: " + err);
            }
        else
            debug('User to be added already exists or checkin user existence failure!');
    }
    res.redirect('/users');
});

router.get('/delete/:name', checksession, async (req, res) => {
    debug('delete user');
    if (!req.session.admin || req.params.name === 'dzilbers')
        debug("Must be admin to delete a user or can't delete THE ADMIN!!!");
    else {
        let user;
        try {
            user = await User.findOne({username: req.params.name}).exec();
        } catch (err) {
            debug(`get user for deleting failure: ${err}`);
        }
        if (user === null || user === undefined)
            debug('User to be deleted does not exist or failure checking user!');
        else {
            debug("REMOVING");
            try {
                await user.remove();
                debug('User successfully deleted!');
            } catch (err) {
                debug(`Failed deleting user: ${err}`);
            }
        }
    }
    res.redirect('/users');
});

module.exports = router;
