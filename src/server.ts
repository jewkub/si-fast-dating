import * as path from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import * as bodyParser from 'body-parser';
import session from 'cookie-session';
import flash from 'connect-flash';

import { Secret } from './secret';
import HttpException from './exceptions/HttpException';

const app = express();
const port = +(process.env.PORT || 8080), ip = process.env.IP || '0.0.0.0';

(async () => {
  await Secret.load();
  process.env.projectId = 'si-fast-dating';

  // initialize middleware
  app.set('trust proxy', true);
  app.use(bodyParser.urlencoded({ extended: false }));
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

  // routes
  app.use('/', require('./routes/auth.js'));
  app.use('/', require('./routes/profile.js'));
  app.use('/', require('./routes/activity.js'));

  app.get('/', async (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    res.sendFile(path.resolve('./static/public/html/index.html'));
  });

  app.get('/error', (req, res) => {
    res.send('login error');
  });
  app.use(express.static('./static/public'));

  app.use((error: HttpException, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = error.status || 500;
    const message = error.message || 'Error';
    console.log(error.message);
    res.status(status).send({
      message,
      status,
    });
  });

  app.listen(port, ip, () => console.log('Server running on http://%s:%s', ip, port));

})().catch(e => console.log(e));

module.exports = app;
