require('dotenv').config();
const express = require('express');
const app = express();

const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });

const bodyParser = require('body-parser');

const port = +process.env.PORT || 8080, ip = process.env.IP || '0.0.0.0';

const passport = require('passport');
const flash = require('connect-flash');

(async () => {
  await nextApp.prepare();

  // set up routes
  app.set('trust proxy', true);

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  app.use(flash());

  app.use('/', require('./routes/auth.js'));
  app.use('/', require('./routes/data.js'));
  app.use('/', require('./routes/activity.js'));

  app.get('/', async (req, res, next) => {
    if (!req.user || !req.user.id) return res.redirect('/login');
    res.sendFile(__dirname + '/public/html/index.html');
    // nextApp.render(req, res, '/index');
  });

  app.get('/error', (req, res) => {
    res.send('login error');
  });
  app.get('*', (req, res) => nextApp.getRequestHandler()(req, res));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
    // res.redirect('/');
  });

  app.listen(port, ip, () => console.log('Server running on http://%s:%s', ip, port));

})().catch(e => console.log(e));

module.exports = app;