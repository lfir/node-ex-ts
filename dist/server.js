var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const corsConfig = require('./src/corsConfiguration'), ctrl = require('./src/analyticsController'), oADoc = require('./src/openApiDocumentation'), dotenv = require('dotenv'), express = require('express'), mongoose = require('mongoose'), morgan = require('morgan'), path = require('path'), swaggerUi = require('swagger-ui-express'), app = express();
dotenv.config();
mongoose.connect(process.env.MONGO_URI);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(oADoc));
app.use('/public/css', express.static(path.join(__dirname, '/public/css')));
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));
app.use('/public/js', express.static(path.join(__dirname, '/public/js')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(express.json());
// Endpoints section.
// Open endpoints.
app.use(corsConfig.allowRequest);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});
app.get('/api/status', function (req, res) {
    let status = { nodejs: 'ok', mongodb: 'nok' };
    if (mongoose.connection.readyState === 1) {
        status.mongodb = status.nodejs;
    }
    res.json(status);
});
// CRUD Operations. CORS-restricted endpoints.
app.use(corsConfig.allowOrBlockRequest);
app.post('/api/newpageview', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log('req body:', req.body);
        const host = req.body.host, path = req.body.path, acl = req.headers['accept-language'], ip = req.body.ip, newPageView = yield ctrl.storePageView(host, path, acl, ip);
        console.log('stored event:', newPageView);
        res.json(newPageView);
    }
    catch (err) {
        next(err);
    }
}));
app.get('/api/pageviews', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log('req query string:', req.query);
        const pageviews = yield ctrl.retrievePageViews(req.query);
        res.json(pageviews);
    }
    catch (err) {
        next(err);
    }
}));
app.get('/api/pageview', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log('req query string:', req.query);
        const pageview = yield ctrl.retrievePageView(req.query);
        res.json(pageview);
    }
    catch (err) {
        next(err);
    }
}));
app.put('/api/pageview', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log('req query string:', req.query);
        console.log('req body:', req.body);
        const updatedPageview = yield ctrl.updatePageView(req.query, req.body);
        console.log('stored event:', updatedPageview);
        res.json(updatedPageview);
    }
    catch (err) {
        next(err);
    }
}));
app.delete('/api/pageview', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log('req query string:', req.query);
        const removedPageView = yield ctrl.deletePageView(req.query);
        res.json(removedPageView);
    }
    catch (err) {
        next(err);
    }
}));
//
const listener = app.listen(process.env.PORT || 8080, () => {
    console.log('Node.js listening on port ' + listener.address().port);
});
exports.app = app;
exports.mongoose = mongoose;
//# sourceMappingURL=server.js.map