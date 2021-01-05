const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const tableName = "contactsStore-test";
const updateLastSuccess = async (telephoneNumber, choice) => {
  const docClient = new AWS.DynamoDB.DocumentClient({ region });

  // Now Datetime
  const now = new Date();
  const nowseconds = Math.round(now.getTime() / 1000);
  const nowisostring = now.toISOString();

  // DynamoDB update parameters
  const params = {
    TableName: tableName,
    Key: {
      telephoneNumber
    },
    UpdateExpression:
      "set successfulConnections = successfulConnections + :val, lastSuccess = :time, lastSuccessDateTime = :dttime, contactAttempts = :attempts, choice = :choice",
    ExpressionAttributeValues: {
      ":dttime": nowisostring,
      ":attempts": 0,
      ":choice": choice,
      ":time": nowseconds,
      ":val": 1
    }
  };
  console.log(JSON.stringify(params));
  const resultPromise = docClient.update(params).promise();
  const result = await resultPromise;
  console.log(result);
};
const updateLastAttempt = async (telephoneNumber, contactId) => {
  const docClient = new AWS.DynamoDB.DocumentClient({ region });

  const now = new Date();
  const nowseconds = Math.round(now.getTime() / 1000);
  const nowisostring = now.toISOString();

  const dynamoParams = {
    TableName: tableName,
    Key: {
      telephoneNumber
    },
    UpdateExpression:
      "set contactAttempts = contactAttempts + :val, lastAttempt=:lastAttempt, lastAttemptDateTime=:ladt, contactId=:contactId",
    ExpressionAttributeValues: {
      ":val": 1,
      ":lastAttempt": nowseconds,
      ":ladt": nowisostring,
      ":contactId": contactId
    }
  };
  console.log(`update DDB params: ${JSON.stringify(dynamoParams)}`);

  try {
    const result = await docClient.update(dynamoParams).promise();
    console.log(`update db result: ${JSON.stringify(result, undefined, 2)}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  updateLastAttempt,
  updateLastSuccess
};
