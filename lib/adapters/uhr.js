'use strict';

var buildURL = require('./../helpers/buildURL');
var createError = require('../core/createError');

/*
* uni-app request adapter
* */
module.exports = function uhrAdapter(config){
  return new Promise(function dispatchUniRequest(resolve, reject){
    var requestData = config.data;
    var requestHeaders = config.headers;
    var dataType = requestHeaders.dataType;
    var responseType = requestHeaders.responseType;

    // 发起请求
    var request = uni.request({
      url:  buildURL(config.url, config.params, config.paramsSerializer),
      data: requestData,
      header: requestHeaders,
      method: config.method.toUpperCase(),
      dataType: dataType,
      responseType: responseType,
      complete: function (res){
        var response;

        switch(errMsg){
          case 'request:ok':
            response = {
              data: res.data,
              status: res.statusCode,
              statusText: res.errMsg,
              headers: res.header,
              config: config,
              request: request
            };
            resolve(response);
            break;
          case 'request:fail':
            response = {
              data: null,
              status: -1,
              statusText: res.errMsg,
              headers: null,
              config: config,
              request: request
            };
            reject(createError(
              errMsg,
              config,
              null,
              request,
              response
            ));
            break;
          case 'request:fail abort':
          case 'request:fail timeout':
            reject(createError(
              errMsg,
              config,
              'ECONNABORTED',
              request
            ));
            break;
          default:
            reject(createError(
              errMsg,
              config,
              null,
              request
            ));
        }
        request = null;
      }
    });

    if (config.cancelToken) {
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }
        request.abort();
        reject(cancel);
        request = null;
      });
    }

  })
};
