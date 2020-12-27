const { name: projectId } = require('../package.json');

const express = require('express');
const router = express.Router();

const Firestore = require('@google-cloud/firestore');
const db = new Firestore({
  projectId,
});

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Bangkok');
moment.locale('th');

const isActive = {
  open: true,
  closed: true,
  cancelled: false,
  finished: false,
}

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
      if (k == 'date' || k == 'time') continue;
      out[k] = req.body[k];
    }
    out.date = moment(req.body.date + ' ' + req.body.time).toDate();

    out.owner = req.user.displayName;
    out.ownerId = req.user.id;
    out.created = new Date();
    out.status = 'open';
    let newact = db.collection('Activities').doc();
    await newact.create(out);
    await newact.collection('Members').doc(req.user.id).create({
      /* userId: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value, */
      ref: db.collection('Users').doc(req.user.id),
      _id: req.user.id,
    });
    /* await db.collection('Users').doc(req.user.id).collection('Activities').doc().create({
      ref: newact
    }); */
    req.flash('success', 'Create activity success');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

router.get('/activity/get', async (req, res, next) => {
  let acts = (await db.collection('Activities').get()).docs;
  let out = acts.reduce((acc, cur) => {
    let data = cur.data();
    for (let key in data) {
      if (data[key] instanceof Firestore.Timestamp) data[key] = data[key].toDate();
    }
    data._id = cur.ref.id;
    acc.push(data);
    return acc;
  }, []);
  res.json(out);
});


router.get('/activity/join/:id', async (req, res, next) => {
  try {
    let members = (await db.collection('Activities').doc(req.params.id).collection('Members').get()).docs;
    let out = [];
    for (let cur of members) {
      let userDoc = cur.get('ref');

      let userData = (await userDoc.get()).data();
      for (let key in userData) {
        if (userData[key] instanceof Firestore.Timestamp) userData[key] = userData[key].toDate();
      }
      userData._id = userDoc.id;

      out.push(userData);
    }
    res.json(out);
  } catch (e) {
    return next(e);
  }
});

router.post('/activity/join/:id', async (req, res, next) => {
  try {
    let actDoc = db.collection('Activities').doc(req.params.id);

    let self = await actDoc.collection('Members').doc(req.user.id).get();
    if (self.exists) throw new Error('Already joined');

    let snap = await actDoc.get();
    if (!isActive[snap.get('status')]) throw new Error('Cannot join inactive activity');
    await actDoc.collection('Members').doc(req.user.id).create({
      /* userId: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value, */
      ref: db.collection('Users').doc(req.user.id),
      _id: req.user.id,
    });
    /* await db.collection('Users').doc(req.user.id).collection('Activities').doc().create({
      ref: actDoc
    }); */
    req.flash('success', 'Join activity success');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

module.exports = router;