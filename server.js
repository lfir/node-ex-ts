const corsConfig = require('./src/corsConfiguration'),
      ctrl       = require('./src/analyticsController'),
      dotenv     = require('dotenv'),
      express    = require('express'),
      mongoose   = require('mongoose'),
      morgan     = require('morgan'),
      path       = require('path'),
      app        = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public/')));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

// Endpoints section
// Open endpoints
app.use(corsConfig.allowRequest);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/api/status', function(req, res) {
  let status = { nodejs: 'ok', mongodb: 'nok' };
  if (mongoose.connection.readyState === 1) {
    status.mongodb = status.nodejs;
  }
  res.json(status);
});

// Restricted endpoints
app.use(corsConfig.allowOrBlockRequest);

app.post('/api/newpageview', async (req, res, next) => {
  try {
    console.log('req body:', req.body);
    const host = req.body.host,
          path = req.body.path,
          acl  = req.headers['accept-language'],
          ip   = req.body.ip,
          event = await ctrl.storePageView(host, path, acl, ip);
          console.log('stored event:', event);
          res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

app.get('/api/pageviews', async (req, res, next) => {
  try {
    const pageviews = await ctrl.retrievePageViews(req.query);
    res.json(pageviews);
  } catch (err) {
    next(err);
  }
});
//

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Node.js listening on port ' + listener.address().port);
});

module.exports = app;
