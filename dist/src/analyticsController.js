var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const geoip = require('geoip-lite'), mng = require('mongoose'), server = require('../server'), Schema = mng.Schema;
const schema = new Schema({
    host: { type: String, required: true },
    path: { type: String, required: true },
    language: { type: String },
    country: { type: String },
    date: { type: Date, default: Date.now }
});
const PageView = mng.model('PageView', schema);
exports.normalizeLanguage = (accLangs) => {
    let endCharPos = accLangs.length;
    let nonLetterCharPos = accLangs.search(/[^a-z]/);
    if (nonLetterCharPos > -1) {
        endCharPos = nonLetterCharPos;
    }
    return accLangs.substring(0, endCharPos);
};
exports.normalizePath = (path) => {
    let norm = path.replace(/\.html$|\/$/, '');
    norm = norm.replace(/^\/index$/, '/');
    return norm.toLowerCase();
};
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
};
exports.searchQueryError = () => {
    let err = new Error('Invalid search query.');
    //err.statusCode = 400;
    return err;
};
exports.pageViewNotFoundError = () => {
    let err = new Error('No records were found in the database matching the criteria provided.');
    //err.statusCode = 404;
    return err;
};
exports.validateIdSearchQuery = (queryParams) => {
    if (!queryParams.id || (Object.keys(queryParams).length !== 1)) {
        throw this.searchQueryError();
    }
};
exports.validateRetrievedRecords = (pageViews) => {
    if (!pageViews || (Array.isArray(pageViews) && !pageViews.length)) {
        throw this.pageViewNotFoundError();
    }
};
const noOptions = '', fromTo = 'fromTo', limit = 'limit', fromToAndLimit = 'fromToAndLimit';
exports.isOptionFromTo = (queryParams) => {
    return !queryParams.limit && queryParams.from && queryParams.to;
};
exports.isOptionLimit = (queryParams) => {
    return !(queryParams.from || queryParams.to) && queryParams.limit;
};
exports.isOptionFromToAndLimit = (queryParams) => {
    return queryParams.limit && queryParams.from && queryParams.to;
};
exports.getChosenOptions = (queryParams) => {
    let options;
    if (this.isOptionFromTo(queryParams)) {
        options = fromTo;
    }
    else if (this.isOptionLimit(queryParams)) {
        options = limit;
    }
    else if (this.isOptionFromToAndLimit(queryParams)) {
        options = fromToAndLimit;
    }
    else if (Object.keys(queryParams).length === 0) {
        options = noOptions;
    }
    return options;
};
exports.searchBetweenDates = (queryParams) => {
    const from = new Date(queryParams.from + 'T00:00:00Z'), to = new Date(queryParams.to + 'T23:59:59Z');
    return PageView.find({ date: { '$gte': from, '$lte': to } });
};
exports.retrievePageViews = (queryParams) => __awaiter(this, void 0, void 0, function* () {
    let retrievedPageViews;
    switch (this.getChosenOptions(queryParams)) {
        case noOptions:
            retrievedPageViews = yield PageView.find();
            break;
        case fromTo:
            retrievedPageViews = yield this.searchBetweenDates(queryParams);
            break;
        case limit:
            retrievedPageViews = yield PageView.find().limit(Number(queryParams.limit));
            break;
        case fromToAndLimit:
            retrievedPageViews = yield this.searchBetweenDates(queryParams)
                .limit(Number(queryParams.limit));
            break;
        default:
            throw this.searchQueryError();
    }
    this.validateRetrievedRecords(retrievedPageViews);
    return retrievedPageViews;
});
exports.retrieveOrUpdateOrDeletePageView = (queryParams, newPageView, operation) => __awaiter(this, void 0, void 0, function* () {
    this.validateIdSearchQuery(queryParams);
    const id = queryParams.id;
    let resultPageView;
    if (operation === 'get') {
        resultPageView = yield PageView.findById(id);
    }
    else if (operation === 'upd') {
        resultPageView = yield PageView.findByIdAndUpdate(id, newPageView, { new: true });
    }
    else if (operation === 'del') {
        resultPageView = yield PageView.findByIdAndRemove(id);
    }
    this.validateRetrievedRecords(resultPageView);
    return resultPageView;
});
exports.retrievePageView = (queryParams) => {
    return this.retrieveOrUpdateOrDeletePageView(queryParams, null, 'get');
};
exports.updatePageView = (queryParams, newPageView) => {
    return this.retrieveOrUpdateOrDeletePageView(queryParams, newPageView, 'upd');
};
exports.deletePageView = (queryParams) => {
    return this.retrieveOrUpdateOrDeletePageView(queryParams, null, 'del');
};
//# sourceMappingURL=analyticsController.js.map