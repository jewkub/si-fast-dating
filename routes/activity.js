const { name: projectId } = require('../package.json');

const express = require('express');
const router = express.Router();

const Firestore = require('@google-cloud/firestore');
const db = new Firestore({
  projectId,
});

// const flash = require('connect-flash');

router.get('/activity', async (req, res) => {
  let data = await db.collection('Users').doc(req.user.id).get()
});

router.post('/activity/create', async (req, res, next) => {
  try {
    // console.log(req.body);
    if (!req.user.id) throw new Error('No login');
    let out = {};
    for (let k in req.body) {
      out[k] = req.body[k];
    }
    out.owner = req.user.displayName;
    out.userId = req.user.id;
    out.created = new Date();
    out.status = 'Ready';
    let newact = db.collection('Activities').doc();
    await newact.create(out);
    await newact.collection('Members').doc().create({
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value,
      ref: db.collection('Users').doc(req.user.id)
    });
    await db.collection('Users').doc(req.user.id).collection('Activities').doc().create({
      ref: newact
    });
    req.flash('success', 'Create activity success');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

router.get('/activity/get', async (req, res, next) => {
  let acts = (await db.collection('Activities').get()).docs;
  let out = acts.reduce((acc, cur) => {
    // console.log(cur.data());
    acc.push(cur.data());
    acc[acc.length-1].id = cur.ref.id;
    return acc;
  }, []);
  res.json(out);
});


router.get('/activity/join/:id', async (req, res, next) => {
  let members = (await db.collection('Activities').doc(req.params.id).collection('Members').get()).docs;
  let out = members.reduce((acc, cur) => {
    // console.log(cur.data());
    acc.push(cur.data());
    // acc[acc.length-1].id = cur.ref.id;
    return acc;
  }, []);
  res.json(out);
});

router.post('/activity/join/:id', async (req, res, next) => {
  try {
    /* let self = await db.collection('Activities').doc(req.params.id).collection('Members').doc(req.params.id).get();
    if (self.exists) {
      console.log('already joined');
      return res.redirect('/');
    } */
    await db.collection('Activities').doc(req.params.id).collection('Members').doc(req.user.id).create({
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value
    });
    req.flash('success', 'Join activity success');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

module.exports = router;