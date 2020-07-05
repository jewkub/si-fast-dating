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

router.get('/profile/activity', async (req, res, next) => {
  try {
    // https://stackoverflow.com/a/56189687/4468834
    let snaps = (await db.collectionGroup('Members').where('_id', '==', req.user.id).get()).docs;
    
    let out = [];
    for (let snap of snaps) {
      let actDoc = snap.ref.parent.parent;

      let actData = (await actDoc.get()).data();
      for (let key in actData) {
        if (actData[key] instanceof Firestore.Timestamp) actData[key] = actData[key].toDate();
      }
      actData._id = actDoc.id;
      
      out.push(actData);
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
    out._id = detail.ref.id;
    res.json(out);
  } catch (e) {
    return next(e);
  }
  
});

router.post('/profile/manage/:id/cancel', async (req, res, next) => {
  try {
    let act = db.collection('Activities').doc(req.params.id);
    let data = (await act.get()).data();
    if (!isActive[data.status]) throw new Error('Activity already dropped');
    if (req.user.id != data.ownerId) throw new Error('Only owner can cancel activity');
    if (moment().isAfter(moment(data.date.toDate()).subtract(30, 'm'))) throw new Error('Cannot cancel after 30 mins before activity');

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
    let data = (await act.get()).data();
    if (!isActive[data.status]) throw new Error('Activity already dropped');
    if (req.user.id != data.ownerId) throw new Error('Only owner can cancel activity');
    if (moment().isBefore(moment(data.date.toDate()))) throw new Error('Cannot finish before activity');

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