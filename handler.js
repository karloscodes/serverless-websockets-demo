const helper = require('./helper');

module.exports.wsConnectionHandler = (event, context, callback) => {
  console.log(event);

  if (event.requestContext.routeKey === '$connect') {
    const userId = event.queryStringParameters.userId;
    const connectionId = event.requestContext.connectionId;

    helper.storeConnection({ userId, connectionId })
      .then(() => {
        callback(null, { statusCode: 200, body: `welcome ${userId}` });
      })
      .catch((error) => {
        console.log(error);
        callback(null, JSON.stringify(error));
      });
  } else if (event.requestContext.routeKey === '$disconnect') {
    const connectionId = event.requestContext.connectionId;

    helper.deleteConnection({ connectionId })
      .then(() => {
        callback(null, { statusCode: 200, body: 'bye!' });
      })
      .catch((error) => {
        console.log(error);
        callback(null, {
          statusCode: 500,
          body: JSON.stringify(error)
        });
      });
  }
};

module.exports.wsDefaultHandler = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    body: 'wsDefaultHandler'
  });
};

module.exports.wsSendMessageHandler = (event, context, callback) => {
  console.log(event);

  helper.sendMessage(event).then(() => {
    callback(null, { statusCode: 200, body: 'message sent' })
  }).catch((error) => {
    console.log(error);
    callback(null, JSON.stringify(error));
  });
}
