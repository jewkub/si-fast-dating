const express = require('express');
const router = express.Router();

// const flash = require('connect-flash');

router.get('/flash/:event', async (req, res, next) => {
  let message = req.flash(req.params.event);
  res.json(message);
});

// Endpoint to get current user
router.get('/user', function(req, res){
	// console.log(req.user);
  res.json(req.user || {});
});

module.exports = router;