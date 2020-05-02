import mongoose from 'mongoose';
import geoip from 'geoip-lite';


export enum ChosenOptions {
  NoOptions,
  FromTo,
  Limit,
  FromToAndLimit
}

export default class AnalyticsController {
  schema: mongoose.Schema<any>;
  PageView: mongoose.Model<mongoose.Document, {}>;

  constructor() {
    this.schema = new mongoose.Schema({
      host: { type: String, required: true },
      path: { type: String, required: true },
      language: { type: String },
      country: { type: String },
      date: { type: Date, default: Date.now }
    });
    this.PageView = mongoose.model('PageView', this.schema);
  }

  static normalizeLanguage = (accLangs: string): string => {
    let endCharPos = accLangs.length;
    let nonLetterCharPos = accLangs.search(/[^a-z]/);
    if (nonLetterCharPos > -1) {
      endCharPos = nonLetterCharPos;
    }
    return accLangs.substring(0, endCharPos);
  }

  static normalizePath = (path: string): string => {
    let norm = path.replace(/\.html$|\/$/, '');
    norm = norm.replace(/^\/index$/, '/');
    return norm.toLowerCase();
  }

  storePageView = (host: string, path: string, accLangs: string, ip: string): Promise<mongoose.Document> => {
    const geo = geoip.lookup(ip);
    console.log('ip:', ip);
    console.log('geo:', geo);
    const newPageViewInfo = { host: host, path: AnalyticsController.normalizePath(path), language: undefined, country: undefined };
    if (accLangs) {
      newPageViewInfo.language = AnalyticsController.normalizeLanguage(accLangs);
    }
    if (geo) {
      newPageViewInfo.country = geo.country.toLowerCase();
    }
    const newPageView = (new this.PageView(newPageViewInfo)).save();
    return newPageView;
  }

  static searchQueryError = (): Error => {
    let err = new Error('Invalid search query.');
    //err.statusCode = 400;
    return err;
  }
  
  static pageViewNotFoundError = (): Error => {
    let err = new Error('No records were found in the database matching the criteria provided.');
    //err.statusCode = 404;
    return err;
  }
  
  static validateIdSearchQuery = (queryParams: { id?: string }): void => {
    if (!queryParams.id || (Object.keys(queryParams).length !== 1)) {
      throw AnalyticsController.searchQueryError();
    }
  }
  
  static validateRetrievedRecords = (pageViews): void => {
    if (!pageViews || (Array.isArray(pageViews) && !pageViews.length)) {
      throw AnalyticsController.pageViewNotFoundError();
    }
  };

  static isOptionFromTo = (queryParams): boolean => {
    return !queryParams.limit && queryParams.from && queryParams.to;
  }

  static isOptionLimit = (queryParams): boolean => {
    return !(queryParams.from || queryParams.to) && queryParams.limit;
  }

  static isOptionFromToAndLimit = (queryParams) => {
    return queryParams.limit && queryParams.from && queryParams.to;
  }

  static getChosenOptions = (queryParams) => {
    let options;
    if (AnalyticsController.isOptionFromTo(queryParams)) {
      options = ChosenOptions.FromTo;
    } else if (AnalyticsController.isOptionLimit(queryParams)) {
      options = ChosenOptions.Limit;
    } else if (AnalyticsController.isOptionFromToAndLimit(queryParams)) {
      options = ChosenOptions.FromToAndLimit;
    } else if (Object.keys(queryParams).length === 0) {
      options = ChosenOptions.NoOptions;
    }
    return options;
  }

  searchBetweenDates = (queryParams) => {
    const from = new Date(queryParams.from + 'T00:00:00Z'),
      to = new Date(queryParams.to + 'T23:59:59Z');
    return this.PageView.find({ date: { '$gte': from, '$lte': to } });
  }
  
  retrievePageViews = async (queryParams: { limit?: string, from?: string, to?: string }) => {
    let retrievedPageViews: mongoose.Document[];
    switch (AnalyticsController.getChosenOptions(queryParams)) {
      case ChosenOptions.NoOptions:
        retrievedPageViews = await this.PageView.find();
        break;
      case ChosenOptions.FromTo:
        retrievedPageViews = await this.searchBetweenDates(queryParams);
        break;
      case ChosenOptions.Limit:
        retrievedPageViews = await this.PageView.find().limit(Number(queryParams.limit));
        break;
      case ChosenOptions.FromToAndLimit:
        retrievedPageViews = await this.searchBetweenDates(queryParams)
          .limit(Number(queryParams.limit));
        break;
      default:
        throw AnalyticsController.searchQueryError();
    }
    AnalyticsController.validateRetrievedRecords(retrievedPageViews);
    return retrievedPageViews;
  }
  
}

/*
const Schema = mongoose.Schema;

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
  let norm = path.replace(/\.html$|\/$/, '');
  norm = norm.replace(/^\/index$/, '/');
  return norm.toLowerCase();
}

exports.storePageView = (host, path, accLangs, ip) => {
  const geo = geoip.lookup(ip);
  console.log('ip:', ip);
  console.log('geo:', geo);
  const newPageViewInfo = { host: host, path: this.normalizePath(path), language: undefined, country: undefined };
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
  //err.statusCode = 400;
  return err;
}

exports.pageViewNotFoundError = () => {
  let err = new Error('No records were found in the database matching the criteria provided.');
  //err.statusCode = 404;
  return err;
}

exports.validateIdSearchQuery = (queryParams) => {
  if (!queryParams.id || (Object.keys(queryParams).length !== 1)) {
    throw this.searchQueryError();
  }
}

exports.validateRetrievedRecords = (pageViews) => {
  if (!pageViews || (Array.isArray(pageViews) && !pageViews.length)) {
    throw this.pageViewNotFoundError();
  }
};

const noOptions = '',
  fromTo = 'fromTo',
  limit = 'limit',
  fromToAndLimit = 'fromToAndLimit';

exports.isOptionFromTo = (queryParams) => {
  return !queryParams.limit && queryParams.from && queryParams.to;
}

exports.isOptionLimit = (queryParams) => {
  return !(queryParams.from || queryParams.to) && queryParams.limit;
}

exports.isOptionFromToAndLimit = (queryParams) => {
  return queryParams.limit && queryParams.from && queryParams.to;
}

exports.getChosenOptions = (queryParams) => {
  let options;
  if (this.isOptionFromTo(queryParams)) {
    options = fromTo;
  } else if (this.isOptionLimit(queryParams)) {
    options = limit;
  } else if (this.isOptionFromToAndLimit(queryParams)) {
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

exports.retrievePageViews = async (queryParams) => {
  let retrievedPageViews;
  switch (this.getChosenOptions(queryParams)) {
    case noOptions:
      retrievedPageViews = await PageView.find();
      break;
    case fromTo:
      retrievedPageViews = await this.searchBetweenDates(queryParams);
      break;
    case limit:
      retrievedPageViews = await PageView.find().limit(Number(queryParams.limit));
      break;
    case fromToAndLimit:
      retrievedPageViews = await this.searchBetweenDates(queryParams)
        .limit(Number(queryParams.limit));
      break;
    default:
      throw this.searchQueryError();
  }
  this.validateRetrievedRecords(retrievedPageViews);
  return retrievedPageViews;
}

exports.retrieveOrUpdateOrDeletePageView = async (queryParams, newPageView, operation) => {
  this.validateIdSearchQuery(queryParams);
  const id = queryParams.id;
  let resultPageView;
  if (operation === 'get') {
    resultPageView = await PageView.findById(id);
  } else if (operation === 'upd') {
    resultPageView = await PageView.findByIdAndUpdate(id, newPageView, { new: true });
  } else if (operation === 'del') {
    resultPageView = await PageView.findByIdAndRemove(id);
  }
  this.validateRetrievedRecords(resultPageView);
  return resultPageView;
}

exports.retrievePageView = (queryParams) => {
  return this.retrieveOrUpdateOrDeletePageView(queryParams, null, 'get');
}

exports.updatePageView = (queryParams, newPageView) => {
  return this.retrieveOrUpdateOrDeletePageView(queryParams, newPageView, 'upd');
}

exports.deletePageView = (queryParams) => {
  return this.retrieveOrUpdateOrDeletePageView(queryParams, null, 'del');
}
*/