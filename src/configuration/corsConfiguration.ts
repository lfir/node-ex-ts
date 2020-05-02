const acAllowOrg = 'Access-Control-Allow-Origin',
  acAllowMethods = 'Access-Control-Allow-Methods',
  allowedMethods = 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  acAllowHeaders = 'Access-Control-Allow-Headers',
  allowedHeaders = 'Origin, X-Requested-With, Content-Type, Accept';

function setCommonHeaders(res): void {
  res.setHeader(acAllowMethods, allowedMethods);
  res.setHeader(acAllowHeaders, allowedHeaders);
}

export const allowOrBlockRequest = (req, res, next): void => {
  const inCorsWhitelist = process.env.ALLOWED_HOSTS.split(' ').includes(req.headers['origin']);
  const allowAnyOrigin = Boolean(process.env.ALLOW_ANY_ORIGIN);
  if (inCorsWhitelist || allowAnyOrigin) {
    let origin = inCorsWhitelist ? req.headers['origin'] : '*';
    res['setHeader'](acAllowOrg, origin);
    setCommonHeaders(res);
    next();
  } else {
    let err = new Error('Access denied by CORS policy.');
    err['statusCode'] = 403;
    next(err);
  }
}

export const allowRequest = (_req, res, next): void => {
  res.setHeader(acAllowOrg, '*');
  setCommonHeaders(res);
  next();
}
