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

exports.storePageView = (host, path, accLangs, ip) => {
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
    const newPageView = (new PageView(newPageViewInfo)).save();
    return newPageView; 
}

exports.searchQueryError = () => {
  let err = new Error('Invalid search query.');
  err.statusCode = 400; 
  return err;
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
  const from = new Date(queryParams.from + 'T00:00:00Z'),
        to = new Date(queryParams.to + 'T23:59:59Z');
  return PageView.find({ date: { '$gte': from, '$lte': to } });
}

exports.retrievePageViews = (queryParams) => {
    let retrievedPageViews;
    switch(this.getChosenOptions(queryParams)) {
    case noOptions:
        retrievedPageViews = PageView.find();
        break;
    case fromTo:
        retrievedPageViews = this.searchBetweenDates(queryParams);
        break;
    case limit:
        retrievedPageViews = PageView.find().limit(Number(queryParams.limit));
        break;
    case fromToAndLimit:
        retrievedPageViews = this.searchBetweenDates(queryParams)
                                    .limit(Number(queryParams.limit));
        break;
    default:
        throw this.searchQueryError();
    }
    return retrievedPageViews;
}

exports.retrievePageView = (queryParams) => {
    if (!queryParams.id || (Object.keys(queryParams).length !== 1)) {
        throw this.searchQueryError();
    }
    const id = queryParams.id;
    const pageview = PageView.findById(id);
    return pageview;
}
