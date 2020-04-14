const acAllowOrg = 'Access-Control-Allow-Origin',
  acAllowMethods = 'Access-Control-Allow-Methods',
  allowedMethods = 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  acAllowHeaders = 'Access-Control-Allow-Headers',
  allowedHeaders = 'Origin, X-Requested-With, Content-Type, Accept';

function setCommonHeaders(res) {
  res.setHeader(acAllowMethods, allowedMethods);
  res.setHeader(acAllowHeaders, allowedHeaders);
}

exports.allowOrBlockRequest = (req, res, next) => {
  const inCorsWhitelist = process.env.ALLOWED_HOSTS.split(' ').includes(req.headers.origin);
  const allowAnyOrigin = Boolean(process.env.ALLOW_ANY_ORIGIN);
  if (inCorsWhitelist || allowAnyOrigin) {
    let origin = inCorsWhitelist ? req.headers.origin : '*';
    res.setHeader(acAllowOrg, origin);
    setCommonHeaders(res);
    next();
  } else {
    let err = new Error('Access denied by CORS policy.');
    err.statusCode = 403;
    next(err);
  }
}

exports.allowRequest = (req, res, next) => {
  res.setHeader(acAllowOrg, '*');
  setCommonHeaders(res);
  next();
}
