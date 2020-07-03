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

// Endpoint to get current user
router.get('/user', function(req, res){
	// console.log(req.user);
  res.json(req.user || {});
});

router.get('/profile', async (req, res) => {
  let data = (await db.collection('Users').doc(req.user.id).get());
  res.json(data.data());
});

/* router.get('/profile/activity', async (req, res) => {
  let data = (await db.collection('Users').doc(req.user.id).collection('Activities').get()).docs;
  let out = data.reduce((acc, cur) => {
    // console.log(cur.data());
    acc.push(cur.data());
    acc[acc.length-1].id = cur.ref.id;
    return acc;
  }, []);
  res.json(out);
}); */

router.get('/profile/activity', async (req, res, next) => {
  try {
    let data = (await db.collection('Users').doc(req.user.id).collection('Activities').get()).docs;
    let out = [];
    for (let cur of data) {
      let actData = (await cur.get('ref').get()).data();
      // if (actData.status != 'open') continue;
      for (let key in actData) {
        if (actData[key] instanceof Firestore.Timestamp) actData[key] = actData[key].toDate();
      }
      actData.id = cur.get('ref').id;
      out.push(actData);
      // out[out.length-1].id = cur.ref.id;
    }
    res.json(out);
  } catch (e) {
    return next(e);
  }
});

router.get('/profile/manage/:id', async (req, res, next) => {
  try {
    let detail = await db.collection('Activities').doc(req.params.id).get();
    if (!detail.exists) throw new Error('Activity not found');
    let out = detail.data();
    for (let key in out) {
      if (out[key] instanceof Firestore.Timestamp) out[key] = out[key].toDate();
    }
    out.id = detail.ref.id;
    res.json(out);
  } catch (e) {
    return next(e);
  }
  
});

router.post('/profile/manage/:id/cancel', async (req, res, next) => {
  try {
    let act = db.collection('Activities').doc(req.params.id);
    let data = await act.get();
    if (!isActive[data.get('status')]) throw new Error('Activity already dropped');
    // console.log(data.get('date').toDate());
    // if (moment().isAfter(moment(data.get('date') + ' ' + data.get('time')))) throw new Error('Activity already')

    await act.update({
      status: 'cancelled'
    });
    req.flash('success', 'Cancel activity sucsess');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

router.post('/profile/manage/:id/finish', async (req, res, next) => {
  try {
    let act = db.collection('Activities').doc(req.params.id);
    let data = await act.get();
    if (!isActive[data.get('status')]) throw new Error('Activity already dropped');

    await act.update({
      status: 'finished'
    });
    req.flash('success', 'Finish activity sucsess');
    res.redirect('/');
  } catch (e) {
    return next(e);
  }
});

module.exports = router;