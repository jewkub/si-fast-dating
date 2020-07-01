const { name: projectId } = require('../package.json');

const express = require('express');
const router = express.Router();

const Firestore = require('@google-cloud/firestore');
const db = new Firestore({
  projectId,
  // keyFilename: './secret/si-fast-dating-49e43f64d5ff.json',
});

// const flash = require('connect-flash');

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
    await db.collection('Activities').doc().create(out);
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
    return acc;
  }, []);
  res.json(out);
});

module.exports = router;