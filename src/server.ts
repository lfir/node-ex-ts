import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import * as swaggerUi from 'swagger-ui-express';
import * as corsConfig from './configuration/corsConfiguration';
import { openApiDocumentation } from './configuration/openApiDocumentation';
import AnalyticsController from './controller/analyticsController';

const app = express(),
  ctrl: AnalyticsController = new AnalyticsController();

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
app.use('/public/css', express.static(path.join(__dirname, '/public/css')));
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));
app.use('/public/js', express.static(path.join(__dirname, '/public/js')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(express.json());

// Endpoints section.
// Open endpoints.
app.use(corsConfig.allowRequest);

app.get('/', (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/api/status', (_req: Request, res: Response): void => {
  let status = { nodejs: 'ok', mongodb: 'nok' };
  if (mongoose.connection.readyState === 1) {
    status.mongodb = status.nodejs;
  }
  res.json(status);
});

// CRUD Operations. CORS-restricted endpoints.
app.use(corsConfig.allowOrBlockRequest);

app.post(
  '/api/newpageview',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('req body:', req.body);
      const host = req.body.host,
        path = req.body.path,
        acl = req.headers['accept-language'],
        ip = req.body.ip,
        newPageView = await ctrl.storePageView(host, path, acl, ip);
      console.log('stored event:', newPageView);
      res.json(newPageView);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  '/api/pageviews',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('req query string:', req.query);
      const pageviews = await ctrl.retrievePageViews(req.query);
      res.json(pageviews);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  '/api/pageview',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('req query string:', req.query);
      const pageview = await ctrl.retrievePageView(req.query);
      res.json(pageview);
    } catch (err) {
      next(err);
    }
  }
);

app.put(
  '/api/pageview',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('req query string:', req.query);
      console.log('req body:', req.body);
      const updatedPageview = await ctrl.updatePageView(req.query, req.body);
      console.log('stored event:', updatedPageview);
      res.json(updatedPageview);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  '/api/pageview',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('req query string:', req.query);
      const removedPageView = await ctrl.deletePageView(req.query);
      res.json(removedPageView);
    } catch (err) {
      next(err);
    }
  }
);
//

app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), (): void => {
  console.log('Node.js listening on port ' + app.get('port'));
});

export default server;
