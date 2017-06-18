const http = require('http');
const helper = require('think-helper');
const querystring = require('querystring');
const Readable = require('stream').Readable;
const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

/**
 * default mock args
 */
const defaultArgs = {
  method: 'GET',
  httpVersion: '1.1'
}

module.exports = function(reqArgs, app){
  if(helper.isString(reqArgs)){
    if (reqArgs[0] === '{') {
      reqArgs = JSON.parse(reqArgs);
    }else if (/^\w+\=/.test(reqArgs)) {
      reqArgs = querystring.parse(reqArgs);
    }else{
      reqArgs = {url: reqArgs};
    }
  }
  let req = null;
  //has request in reqArgs
  if(reqArgs.req){
    req = Object.assign({}, reqArgs.req);
    delete reqArgs.req;
  }else{
    req = new IncomingMessage(new Readable());
  }
  let res = null;
  if(reqArgs.res){
    res = reqArgs.res;
    delete reqArgs.res;
  }else{
    res = new ServerResponse(req);
  }
  const args = Object.assign({}, defaultArgs, reqArgs);
  for(let name in args){
    req[name] = args[name];
  }
  //rewrite end method, exit process when invoke end method
  res.end = msg => {
    console.log(msg);
    process.exit();
  }
  if(!app) return {req, res};
  let fn = app.callback();
  return fn(req, res);
}