require('dotenv').config();
console.log(process.env.CALLBACK_URL);


import { Secret } from './secret';

import { NextFunction, Request, Response } from 'express';
import express from 'express';
const app = express();

import * as bodyParser from 'body-parser';

const port = +(process.env.PORT || 8080), ip = process.env.IP || '0.0.0.0';

import session from 'cookie-session';
import flash from 'connect-flash';

import HttpException from './exceptions/HttpException';

(async () => {
  await Secret.load();

  // set up routes
  app.set('trust proxy', true);

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  app.use(session({
    name: 'session',
    secret: process.env.SESSION_SECRET,
    expires: new Date(2147483647000), // Tue, 19 Jan 2038 03:14:07 GMT
    /* saveUninitialized: false,
    resave: true */
  }));

  app.use(flash());
  app.get('/flash/:event', async (req, res, next) => {
    let message = req.flash(req.params.event);
    res.json(message);
  });

  app.use('/', require('./routes/auth.js'));
  app.use('/', require('./routes/profile.js'));
  app.use('/', require('./routes/activity.js'));

  app.get('/', async (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    res.sendFile(__dirname + '/public/html/index.html');
  });

  app.get('/error', (req, res) => {
    res.send('login error');
  });
  app.use(express.static('public'));

  function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    response
      .status(status)
      .send({
        message,
        status,
      });
  }

  app.use(errorMiddleware);

  app.listen(port, ip, () => console.log('Server running on http://%s:%s', ip, port));

})().catch(e => console.log(e));

module.exports = app;