const AWS = require('aws-sdk');
// require('aws-sdk/clients/apigatewaymanagementapi');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_CONNECTIONS_TABLE_NAME = 'websocket-users-connections';
const USERS_CONNECTIONS_CONNECTION_ID_GSI = 'websocket-users-connections-connectionId-GSI';

module.exports.storeConnection = function createConnection({ userId, connectionId }) {
  const params = {
    TableName: USERS_CONNECTIONS_TABLE_NAME,
    Item: {
      userId,
      connectionId
    }
  };

  return dynamodb.put(params).promise();
}


module.exports.deleteConnection = function deleteConnection({ connectionId }) {

  const deleteRecord = (connectionDetails) => {
    console.log(connectionDetails);
    const params = {
      TableName: USERS_CONNECTIONS_TABLE_NAME,
      Key: { userId: connectionDetails.userId }
    };

    console.log(params);
    return dynamodb.delete(params).promise();
  };

  return getConnectionDetailsByConnId({ connectionId })
    .then(deleteRecord);
};

module.exports.sendMessage = function sendMessage(event) {
  const senderConnectionId = event.requestContext.connectionId;

  const composeMessage = (connectionDetails) => {
    const message = JSON.parse(event.body);
    const senderUserId = connectionDetails.userId;
    const recipientUserId = message.userId;
    const body = message.body;
    return { senderUserId, recipientUserId, body };
  };

  const addRecipientConnId = (composedMessage) => {
    return getConnectionDetailsByUserId({ userId: composedMessage.recipientUserId })
      .then((recipientConnectionDetails) => ({
        ...composedMessage,
        recipientConnectionId: recipientConnectionDetails.connectionId
      }));
  };

  const sendMessageToUser = (composedMessage) => {
    return sendWSMessage({
      requestContext: event.requestContext,
      connectionId: composedMessage.recipientConnectionId,
      data: { fromUserId: composedMessage.senderUserId, body: composedMessage.body }
    });
  }

  return getConnectionDetailsByConnId({ connectionId: senderConnectionId })
    .then(composeMessage)
    .then(addRecipientConnId)
    .then(sendMessageToUser);
};

function getConnectionDetailsByUserId({ userId }) {
  const params = {
    TableName: USERS_CONNECTIONS_TABLE_NAME,
    Key: {
      userId
    }
  };

  return dynamodb.get(params).promise()
    .then((result) => result.Item);
}

function getConnectionDetailsByConnId({ connectionId }) {
  const params = {
    TableName: USERS_CONNECTIONS_TABLE_NAME,
    IndexName: USERS_CONNECTIONS_CONNECTION_ID_GSI,
    KeyConditionExpression: "connectionId = :connectionId",
    ExpressionAttributeValues: {
      ":connectionId": connectionId
    }
  };

  return dynamodb.query(params).promise()
    .then((result) => result.Items[0]);
}

function sendWSMessage({ requestContext, connectionId, data }) {
  const endpoint = requestContext.domainName + '/' + requestContext.stage;
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint
  });

  const params = {
    ConnectionId: connectionId,
    Data: JSON.stringify(data)
  };

  return apigwManagementApi.postToConnection(params).promise();
}
