const ctrl     = require('./src/analyticsController');
      dotenv   = require('dotenv'),
      express  = require('express'),
      mongoose = require('mongoose'),
      morgan   = require('morgan'),
      path     = require('path'),
      app      = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

app.use(function (req, res, next) {
  const inCorsWhitelist = process.env.ALLOWED_HOSTS.split(' ').includes(req.headers.origin);
  const allowAnyOrigin = Boolean(process.env.ALLOW_ANY_ORIGIN);
  console.log('origin:', req.headers.origin);
  console.log('inCorsWhitelist:', inCorsWhitelist);
  console.log('allowAnyOrigin:', allowAnyOrigin);
  if (inCorsWhitelist || allowAnyOrigin) {
    let origin = inCorsWhitelist ? req.headers.origin : '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  } else {
    next(new Error('Access denied by CORS policy.'));
  }
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public/')));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

// Endpoints section
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

app.post('/api/newpageview', function(req, res, next) {
  console.log('body:', req.body);
  const host = req.body.host,
        path = req.body.path,
        ip   = req.body.ip;
  ctrl.storePageView(host, path, req.headers['accept-language'], ip,
    (err, data) => {
      if (err) {
        next(err);
      }
      console.log('stored event:', data);
      res.sendStatus(200);
    }
  );
});
//

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Node.js listening on port ' + listener.address().port);
});

module.exports = app;
