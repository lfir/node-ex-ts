import geoip from 'geoip-lite';
import mongoose from 'mongoose';
import StatusCodeError from '../exception/statusCodeError';
import { ESearchOptions } from './searchOptions.enum';
import { INewPageView, IUpdPageView } from './pageView.interface';
import { ISearchOptions } from './searchOptions.interface';

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
    let norm = path.replace(/\.html$|(?<=.+)\/$/, '');
    norm = norm.replace(/^\/index$/, '/');
    return norm.toLowerCase();
  }

  storePageView = (
    host: string, path: string, accLangs?: string, ip?: string
  ): Promise<mongoose.Document> => {
    const geo: geoip.Lookup = geoip.lookup(ip);
    console.log('Event ip:', ip);
    console.log('Event geoip object:', geo);
    let newPageViewInfo: INewPageView = {
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
    queryParams: ISearchOptions
  ): boolean => {
    return Object.keys(queryParams).includes('from') &&
      Object.keys(queryParams).includes('to') &&
      (Object.keys(queryParams).length === 2);
  }

  static isOptionLimit = (
    queryParams: ISearchOptions
  ): boolean => {
    return Object.keys(queryParams).includes('limit') &&
      (Object.keys(queryParams).length === 1);
  }

  static isOptionFromToAndLimit = (
    queryParams: ISearchOptions
  ): boolean => {
    const params = Object.keys(queryParams);
    return params.includes('from') && params.includes('to') &&
      params.includes('limit') && (params.length === 3);
  }

  static getChosenOptions = (
    queryParams: ISearchOptions
  ): ESearchOptions => {
    let options: ESearchOptions;
    if (AnalyticsController.isOptionFromTo(queryParams)) {
      options = ESearchOptions.FromTo;
    } else if (AnalyticsController.isOptionLimit(queryParams)) {
      options = ESearchOptions.Limit;
    } else if (AnalyticsController.isOptionFromToAndLimit(queryParams)) {
      options = ESearchOptions.FromToAndLimit;
    } else if (Object.keys(queryParams).length === 0) {
      options = ESearchOptions.NoOptions;
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
    queryParams: ISearchOptions
  ): Promise<mongoose.Document[]> => {
    let retrievedPageViews: mongoose.Document[];
    switch (AnalyticsController.getChosenOptions(queryParams)) {
      case ESearchOptions.NoOptions:
        retrievedPageViews = await this.PageView.find();
        break;
      case ESearchOptions.FromTo:
        retrievedPageViews = await this.searchBetweenDates(queryParams.from, queryParams.to);
        break;
      case ESearchOptions.Limit:
        retrievedPageViews = await this.PageView.find().limit(Number(queryParams.limit));
        break;
      case ESearchOptions.FromToAndLimit:
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
    operation: string, queryParams: { id?: string }, newPageView?: IUpdPageView
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
    queryParams: { id?: string }, newPageView: IUpdPageView
  ): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('upd', queryParams, newPageView);
  }
  
  deletePageView = (queryParams: { id?: string }): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('del', queryParams);
  }
}
