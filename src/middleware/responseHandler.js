const responseCode = {
  NOTFOUND: 404,
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UN_AUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  NOT_ACCEPTED: 406,
};

/* const getKeyValue = async (statusCode) => {
  Object.prototype.getValue = function (value) {
    for (let prop in this) {
      if (this.hasOwnProperty(prop)) {
        if (this[prop] === value) return prop;
      }
    }
  };
  const result = responseCode.getValue(statusCode);
  return result;
}; */

module.exports.generateResponse = async (data, token, status, Message) => {
  try {
    let response = {
      data,
      type: status,
      status,
      Message,
      token,
    };
    return response;
  } catch (err) {
    return err;
  }
};

module.exports.notFound = async (token, message) => {
  try {
    let response = {
      data: [],
      type: await getKeyValue(404),
      status: 404,
      Message: `Unable to found ${message}, Not Found..`,
      token,
    };
    return response;
  } catch (err) {
    return err;
  }
};
