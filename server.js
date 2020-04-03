const ctrl     = require('./src/analyticsController');
      cors     = require('cors'),
      dotenv   = require('dotenv'),
      express  = require('express'),
      mongoose = require('mongoose'),
      morgan   = require('morgan'),
      path     = require('path'),
      app      = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = process.env.ALLOWED_HOSTS.split(' ');
    const allowAccess = (!origin && Boolean(process.env.ALLOW_NO_ORIGIN)) ||
                        (allowedOrigins.indexOf(origin) !== -1);
    if (allowAccess) {
      callback(null, true);
    } else {
      let msg = 'Access denied by CORS policy.';
      callback(new Error(msg), false);
    }
  }
};

app.use(cors(corsOptions));
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

app.get('/api/tst', (req, res, next) => {
  ctrl.storePageView(req.hostname, req.originalUrl, req.headers["accept-language"], req.ip,
    (err, data) => {
      if (err) {
        next(err);
      }
      res.json(data);
    }
  );
});

app.post('/api/newpageview', function(req, res, next) {
  const host = req.body.host,
        path = req.body.path;
  ctrl.storePageView(host, path, req.headers['accept-language'], req.ip,
    (err, data) => {
      if (err) {
        next(err);
      }
      res.json(data);
    }
  );
});
//

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Node.js listening on port ' + listener.address().port);
});

module.exports = app;
