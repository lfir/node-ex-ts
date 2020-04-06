const geoip    = require('geoip-lite'),
      mongoose = require('mongoose'),
      Schema   = mongoose.Schema;

const schema = new Schema({
    host: { type: String, required: true },
    path: { type: String, required: true },
    language: { type: String },
    country: { type: String },
    date: { type: Date, default: Date.now } 
});

const PageView = mongoose.model('PageView', schema);

exports.normalizeLanguage = (accLangs) => {
  let endCharPos = accLangs.length;
  let nonLetterCharPos = accLangs.search(/[^a-z]/);
  if (nonLetterCharPos > -1) {
    endCharPos = nonLetterCharPos;
  }
  return accLangs.substring(0, endCharPos);
}

exports.normalizePath = (path) => {
  let norm = path.replace(/\.html$/, '');
  norm = norm.replace(/^\/index$/, '/');
  return norm.toLowerCase();
}

exports.storePageView = async (host, path, accLangs, ip) => {
  try {
    const geo = geoip.lookup(ip);
    console.log('ip:', ip);
    console.log('geo:', geo);
    const newPageViewInfo = { host: host, path: this.normalizePath(path) };
    if (accLangs) {
      newPageViewInfo.language = this.normalizeLanguage(accLangs);
    }
    if (geo) {
      newPageViewInfo.country = geo.country.toLowerCase();
    }
    const newPageView = new PageView(newPageViewInfo);
    return await newPageView.save(); 
  } catch (err) {
    throw err;
  }
}
