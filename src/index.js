/* eslint-disable prefer-rest-params */
import url from 'url';
import cookie from 'cookie';
import autoBind from 'auto-bind';
import safeStringify from 'fast-safe-stringify';
import {
  isString,
  isObject,
  cloneDeep,
  isUndefined,
  isNull,
  isFunction,
} from 'lodash';

/* eslint-disable no-unused-vars */
export default class HiveLogger {
  constructor(config) {
    this.config = Object.assign(
      {
        logger: console,
        userFields: ['id', 'email', 'full_name'],
      },
      config,
    );

    autoBind(this);
  }

  getMetaData(req) {
    const headers = req.headers || req.header || {};
    const method = req.method || '';
    const host = req.hostname || req.host || headers.host || '';
    const protocol = req.protocol === 'https' || req.secure ? 'https' : 'http';

    const originalURL = req.originalUrl || req.url || '';
    const absoluteURL = `${protocol}://${host}${originalURL}`;
    const query = req.query || url.parse(originalURL || '', true).query;
    const cookies = cookie.parse(headers.cookie || '');
    const user = {};

    const ip = req.ip || (req.connection && req.connection.remoteAddress);
    if (ip) {
      user.ip_address = req.ip;
    }

    let body = ['GET', 'HEAD'].includes(method) ? '' : req.body;

    if (!isUndefined(body) && !isNull(body) && !isString(body)) {
      body = safeStringify(body);
    }

    if (isObject(req.user)) {
      const obj = isFunction(req.user.toObject)
        ? req.user.toObject()
        : cloneDeep(req.user);

      this.config.userFields.forEach((field) => {
        if (!isUndefined(obj[field]) && !isNull(obj[field])) {
          user[field] = obj[field];
        }
      });
    }

    return {
      request: {
        method,
        query,
        headers,
        cookies,
        body,
        url: absoluteURL,
      },
      user,
    };
  }

  /* eslint-disable prefer-destructuring */
  middleware(ctx, next) {
    const req = isObject(ctx) && isObject(ctx.request) ? ctx.request : ctx;
    const { logger } = this.config;
    const getMeta = this.getMeta;

    ctx.logger = function () {
      if (isUndefined(arguments[3]) || isNull(arguments[3])) {
        arguments[3] = {};
      }
      if (isObject(arguments[3])) {
        Object.assign(arguments[3], getMeta(req));
      }

      logger[arguments[0]](...Array.prototype.slice.call(arguments).slice(1));
    };

    ctx.log = ctx.logger;
    Object.keys(logger).forEach((key) => {
      ctx.logger[key] = function () {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(key);
        ctx.logger(...args);
      };
    });
    return next();
  }
}
