import geoip from 'geoip-lite';
import mongoose from 'mongoose';
import StatusCodeError from '../exception/statusCodeError';
import { INewPageView, IPageView, IUpdPageView } from './pageView.interface';
import { ESearchOptions } from './searchOptions.enum';
import { ISearchOptions } from './searchOptions.interface';

export default class AnalyticsController {
  schema: mongoose.Schema;
  PageView: mongoose.Model<IPageView>;

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
    const nonLetterCharPos = accLangs.search(/[^a-z]/);
    if (nonLetterCharPos > -1) {
      endCharPos = nonLetterCharPos;
    }
    return accLangs.substring(0, endCharPos);
  }

  static normalizePath = (path: string): string => {
    // Remove trailing .html, / and extraneous characters from the path string.
    let norm = path.replace(/\.html$|(?<=.+)\/$|[^\w-/.]/g, '');
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
      host: host.replace(/[^\w-.]/g, ''),
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
    if (!queryParams.id || /[^\da-f]/i.test(queryParams.id) || (Object.keys(queryParams).length !== 1)) {
      throw AnalyticsController.searchQueryError();
    }
  }
  
  static validateRetrievedRecords = (pageViews: mongoose.Document | mongoose.Document[]): void => {
    if (!pageViews || (Array.isArray(pageViews) && !pageViews.length)) {
      throw AnalyticsController.pageViewNotFoundError();
    }
  }

  static validDate = (strdate: string): boolean => {
    return isFinite(Date.parse(strdate)) && /^\d{4}-\d{2}-\d{2}$/.test(strdate);
  }

  static isOptionFromTo = (queryParams: ISearchOptions): boolean => {
    return (Object.keys(queryParams).length === 2) &&
      AnalyticsController.validDate(queryParams.from) && AnalyticsController.validDate(queryParams.to);
  }

  static isOptionLimit = (queryParams: ISearchOptions): boolean => {
    return /^\d+$/.test(queryParams.limit) && (Object.keys(queryParams).length === 1);
  }

  static isOptionFromToAndLimit = (queryParams: ISearchOptions): boolean => {
    return /^\d+$/.test(queryParams.limit) && (Object.keys(queryParams).length === 3) &&
      AnalyticsController.validDate(queryParams.from) && AnalyticsController.validDate(queryParams.to);
  }

  static getChosenOptions = (queryParams: ISearchOptions): ESearchOptions => {
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

  searchBetweenDates = (from: string, to: string): mongoose.Query<IPageView[], IPageView> => {
    const fromDate = new Date(from + 'T00:00:00Z'),
      toDate = new Date(to + 'T23:59:59Z');
    return this.PageView.find({ date: { '$gte': fromDate, '$lte': toDate } });
  }
  
  retrievePageViews = async (queryParams: ISearchOptions): Promise<mongoose.Document[]> => {
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
      resultPageView = await this.PageView.findOne({ '_id': id });
    } else if (operation === 'upd') {
      resultPageView = await this.PageView.findByIdAndUpdate(id, newPageView as Object, { new: true } as Object);
    } else if (operation === 'del') {
      resultPageView = await this.PageView.findByIdAndRemove(id);
    }
    AnalyticsController.validateRetrievedRecords(resultPageView);
    return resultPageView;
  }
  
  retrievePageView = (queryParams: { id?: string }): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('get', queryParams);
  }
  
  updatePageView = (queryParams: { id?: string }, newPageView: IUpdPageView): Promise<mongoose.Document> => {
    if (newPageView.host) newPageView.host = newPageView.host.replace(/[^\w-.]/g, '');
    if (newPageView.path) newPageView.path = AnalyticsController.normalizePath(newPageView.path);
    if (newPageView.language) newPageView.language = AnalyticsController.normalizeLanguage(newPageView.language);
    if (newPageView.country) newPageView.country = newPageView.country.replace(/[^a-z]/g, '');
    if (newPageView.date && !AnalyticsController.validDate(newPageView.date)) throw AnalyticsController.searchQueryError();
    return this.retrieveOrUpdateOrDeletePageView('upd', queryParams, newPageView);
  }
  
  deletePageView = (queryParams: { id?: string }): Promise<mongoose.Document> => {
    return this.retrieveOrUpdateOrDeletePageView('del', queryParams);
  }
}
