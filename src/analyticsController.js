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
    const newPageView = await (new PageView(newPageViewInfo)).save();
    return newPageView; 
  } catch (err) {
    throw err;
  }
}

const noOptions      = '',
      fromTo         = 'fromTo',
      limit          = 'limit',
      fromToAndLimit = 'fromToAndLimit';

exports.isOptionFromTo = (queryParams) => {
  return !queryParams.limit && queryParams.from && queryParams.to;
}

exports.isOptionLimit = (queryParams) => {
  return !(queryParams.from || queryParams.to) && queryParams.limit;
}

exports.isOptionsFromToAndLimit = (queryParams) => {
  return queryParams.limit && queryParams.from && queryParams.to; 
}

exports.getChosenOptions = (queryParams) => {
  let options;
  if (this.isOptionFromTo(queryParams)) {
    options = fromTo;      
  } else if (this.isOptionLimit(queryParams)) {
      options = limit;
    } else if (this.isOptionsFromToAndLimit(queryParams)) {
        options = fromToAndLimit;         
      } else if (Object.keys(queryParams).length === 0) {
        options = noOptions;
      }
  return options;
}

exports.searchBetweenDates = (queryParams) => {
  const fromDateParts = queryParams.from.split('-').map(dp => Number(dp)),
        toDateParts = queryParams.to.split('-').map(dp => Number(dp)),
        from = new Date(fromDateParts[0], (fromDateParts[1] - 1), fromDateParts[2]).setHours(0, 0, 0),
        to = new Date(toDateParts[0], (toDateParts[1] - 1), toDateParts[2]).setHours(23, 59, 59);
  return PageView.find({ date: { '$gte': from, '$lte': to } });
}

exports.retrievePageViews = async (queryParams) => {
  try {
    let retrievedPageViews;
    switch(this.getChosenOptions(queryParams)) {
      case noOptions:
        retrievedPageViews = await PageView.find();
        break;
      case fromTo:
        retrievedPageViews = await this.searchBetweenDates(queryParams);
        break;
      case limit:
        retrievedPageViews = await PageView.find()
                                     .limit(Number(queryParams.limit));
        break;
      case fromToAndLimit:
        retrievedPageViews = await this.searchBetweenDates(queryParams)
                                     .limit(Number(queryParams.limit));
        break;
      default:
        let err = new Error('Invalid search query.');
        err.statusCode = 400; 
        throw err;
    }
    return retrievedPageViews;
  } catch (err) {
    throw err;
  }
}
