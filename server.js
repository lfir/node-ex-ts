const cors    = require('cors'),
      express = require('express'),
      app     = express(),
      morgan  = require('morgan');

app.use(cors());      
app.use(express.json());
app.use(express.static(__dirname + '/public/'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

// Endpoints section
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/status', function(req, res) {
  res.json({ status: 'API Lab is online.' });
});
//

// Error handling
app.use(function(err, req, res, next){
  errCode = err.status || 500;
  errMessage = err.message || 'Internal Server Error';
  res.status(errCode).type('txt').send(errMessage);
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Node.js listening on port ' + listener.address().port);
});

module.exports = app;
