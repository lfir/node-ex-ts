import { Request, Response, NextFunction } from 'express';


const acAllowOrg = 'Access-Control-Allow-Origin',
  acAllowMethods = 'Access-Control-Allow-Methods',
  allowedMethods = 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  acAllowHeaders = 'Access-Control-Allow-Headers',
  allowedHeaders = 'Origin, X-Requested-With, Content-Type, Accept';

function setCommonHeaders(res: Response): void {
  res.setHeader(acAllowMethods, allowedMethods);
  res.setHeader(acAllowHeaders, allowedHeaders);
}

export const allowOrBlockRequest = (
  req: Request, res: Response, next: NextFunction
): void => {
  const reqOrg = String(req.headers['origin']);
  const inCorsWhitelist = process.env.ALLOWED_HOSTS.split(' ').includes(reqOrg);
  const allowAnyOrigin = Boolean(process.env.ALLOW_ANY_ORIGIN);
  if (inCorsWhitelist || allowAnyOrigin) {
    let origin = inCorsWhitelist ? reqOrg : '*';
    res.setHeader(acAllowOrg, origin);
    setCommonHeaders(res);
    next();
  } else {
    let err = new Error('Access denied by CORS policy.');
    err['statusCode'] = 403;
    next(err);
  }
}

export const allowRequest = (
  _req: Request, res: Response, next: NextFunction
): void => {
  res.setHeader(acAllowOrg, '*');
  setCommonHeaders(res);
  next();
}
