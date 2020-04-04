const dotenv   = require('dotenv'),
      geoip    = require('geoip-lite'),
      mongoose = require('mongoose'),
      Schema   = mongoose.Schema;

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const schema = new Schema({
    host: { type: String, required: true },
    path: { type: String, required: true },
    language: { type: String },
    country: { type: String },
    date: { type: Date, default: Date.now } 
});

const PageView = mongoose.model('PageView', schema);

exports.storePageView = (host, path, accLang, ip, done) => {
  const geo = geoip.lookup(ip);
  console.log('ip:', ip);
  console.log('geo:', geo);
  const newPageViewInfo = { host: host, path: path, language: accLang };
  if (geo) {
    newPageViewInfo.country = geo.country;
  }
  const newPageView = new PageView(newPageViewInfo);
  newPageView.save((err, data) => {
    done(err, data);
  }); 
}

