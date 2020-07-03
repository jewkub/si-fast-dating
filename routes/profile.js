const { name: projectId } = require('../package.json');

const express = require('express');
const router = express.Router();

const Firestore = require('@google-cloud/firestore');
const db = new Firestore({
  projectId,
});

// Endpoint to get current user
router.get('/user', function(req, res){
	// console.log(req.user);
  res.json(req.user || {});
});

router.get('/profile', async (req, res) => {
  let data = (await db.collection('Users').doc(req.user.id).get());
  res.json(data.data());
});

router.get('/profile/activity', async (req, res) => {
  let data = (await db.collection('Users').doc(req.user.id).collection('Activities').get()).docs;
  let out = data.reduce((acc, cur) => {
    // console.log(cur.data());
    acc.push(cur.data());
    acc[acc.length-1].id = cur.ref.id;
    return acc;
  }, []);
  res.json(out);
});

router.get('/profile/activity/active', async (req, res, next) => {
  try {
    let data = (await db.collection('Users').doc(req.user.id).collection('Activities').get()).docs;
    let out = [];
    for (let cur of data) {
      let actData = (await cur.get('ref').get()).data();
      if (actData.status != 'Ready') return acc;
      for (let key in actData) {
        if (actData[key] instanceof Firestore.Timestamp) actData[key] = actData[key].toDate();
      }
      out.push(actData);
      // out[out.length-1].id = cur.ref.id;
    }
    res.json(out);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;