const dotenv   = require('dotenv'),
      geoip = require('geoip-lite'),
      mongoose = require('mongoose'),
      Schema = mongoose.Schema;

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

exports.storePageView = (hostname, path, accLang, ip, done) => {
  console.log(hostname);
  console.log(path);
  console.log(accLang);
  console.log(ip);
  const geo = geoip.lookup(ip);
  console.log(geo);
  const newPageViewInfo = { host: hostname, path: path, language: accLang, country: ip };
  const newPageView = new PageView(newPageViewInfo);
  newPageView.save((err, data) => {
    done(err, data);
  }); 
}

