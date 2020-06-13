import mongoose from 'mongoose';
import geoip from 'geoip-lite';
import StatusCodeError from '../exception/statusCodeError';


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

  storePageView = (
    host: string, path: string, accLangs?: string, ip?: string
  ): Promise<mongoose.Document> => {
    const geo: geoip.Lookup = geoip.lookup(ip);
    console.log('Event ip:', ip);
    console.log('Event geoip object:', geo);
    let newPageViewInfo: {
      host: string, path: string, language?: string, country?: string
    } = {
      host: host,
      path: AnalyticsController.normalizePath(path),
    };

    if (accLangs) {
      newPageViewInfo.language = AnalyticsController.normalizeLanguage(accLangs);
    }
    if (geo) {
      newPageViewInfo.country = geo.country.toLowerCase();
    }
    const newPageView = (new this.PageView(newPageViewInfo)).save();
    return newPageView;
  }

  static searchQueryError = (): StatusCodeError => {
    return new StatusCodeError('Invalid search query.', 400);
  }
  
  static pageViewNotFoundError = (): StatusCodeError => {
    const msg = 'No records were found in the database matching ' +
                'the criteria provided.'
    return new StatusCodeError(msg, 404);
  }
  
  static validateIdSearchQuery = (queryParams: { id?: string }): void => {
    if (!queryParams.id || (Object.keys(queryParams).length !== 1)) {
      throw AnalyticsController.searchQueryError();
    }
  }
  
  static validateRetrievedRecords = (
    pageViews: mongoose.Document | mongoose.Document[]
  ): void => {
    if (!pageViews || (Array.isArray(pageViews) && !pageViews.length)) {
      throw AnalyticsController.pageViewNotFoundError();
    }
  };

  static isOptionFromTo = (
    queryParams: { limit?: string, from?: string, to?: string }
  ): boolean => {
    return (Object.keys(queryParams).includes('from') &&
      Object.keys(queryParams).includes('to')) &&
      !Object.keys(queryParams).includes('limit');
  }

  static isOptionLimit = (
    queryParams: { limit?: string, from?: string, to?: string }
  ): boolean => {
    return !(Object.keys(queryParams).includes('from') ||
      Object.keys(queryParams).includes('to')) &&
      Object.keys(queryParams).includes('limit');
  }

  static isOptionFromToAndLimit = (
    queryParams: { limit?: string, from?: string, to?: string }
  ): boolean => {
    return (Object.keys(queryParams).includes('from') &&
      Object.keys(queryParams).includes('to')) &&
      Object.keys(queryParams).includes('limit');
  }

  static getChosenOptions = (
    queryParams: { limit?: string, from?: string, to?: string }
  ): ChosenOptions => {
    let options: ChosenOptions;
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

  searchBetweenDates = (
    from: string, to: string
  ): mongoose.DocumentQuery<mongoose.Document[], mongoose.Document, {}> => {
    const fromDate = new Date(from + 'T00:00:00Z'),
      toDate = new Date(to + 'T23:59:59Z');
    return this.PageView.find({ date: { '$gte': fromDate, '$lte': toDate } });
  }
  
  retrievePageViews = async (
    queryParams: { limit?: string, from?: string, to?: string }
  ): Promise<mongoose.Document[]> => {
    let retrievedPageViews: mongoose.Document[];
    switch (AnalyticsController.getChosenOptions(queryParams)) {
      case ChosenOptions.NoOptions:
        retrievedPageViews = await this.PageView.find();
        break;
      case ChosenOptions.FromTo:
        retrievedPageViews = await this.searchBetweenDates(queryParams.from, queryParams.to);
        break;
      case ChosenOptions.Limit:
        retrievedPageViews = await this.PageView.find().limit(Number(queryParams.limit));
        break;
      case ChosenOptions.FromToAndLimit:
        retrievedPageViews = await this.searchBetweenDates(queryParams.from, queryParams.to)
          .limit(Number(queryParams.limit));
        break;
      default:
        throw AnalyticsController.searchQueryError();
    }
    AnalyticsController.validateRetrievedRecords(retrievedPageViews);
    return retrievedPageViews;
  }

  retrieveOrUpdateOrDeletePageView = async (
    operation: string, queryParams: { id?: string }, newPageView?: mongoose.Document
  ): Promise<mongoose.Document> => {
    AnalyticsController.validateIdSearchQuery(queryParams);
    const id = queryParams.id;
    let resultPageView: mongoose.Document;
    if (operation === 'get') {
      resultPageView = await this.PageView.findById(id);
    } else if (operation === 'upd') {
      resultPageView = await this.PageView.findByIdAndUpdate(id, newPageView, { new: true });
    } else if (operation === 'del') {
      resultPageView = await this.PageView.findByIdAndRemove(id);
    }
    AnalyticsController.validateRetrievedRecords(resultPageView);
    return resultPageView;
  }
  
  retrievePageView = (queryParams: { id?: string }): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('get', queryParams);
  }
  
  updatePageView = (
    queryParams: { id?: string }, newPageView: mongoose.Document
  ): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('upd', queryParams, newPageView);
  }
  
  deletePageView = (queryParams: { id?: string }): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('del', queryParams);
  }
}
