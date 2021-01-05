const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const tableName = "contactsStore-test";
const updateConnectTable = async (telephoneNumber, contactId) => {
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
async function queryDDB() {
  const docClient = new AWS.DynamoDB.DocumentClient({ region });
  const minutesBetweenSuccesses = parseInt(process.env.minutesBetweenSuccesses);
  const minutesBetweenCalls = parseInt(process.env.minutesBetweenCalls);
  const ma = parseInt(process.env.maxAttempts);

  // Now Datetime
  const now = new Date();
  const nowseconds = Math.round(now.getTime() / 1000);
  //var nowisostring = now.toISOString();

  const lastSuccessThreshold = nowseconds - minutesBetweenSuccesses * 60;
  const lastAttemptThreshold = nowseconds - minutesBetweenCalls * 60;

  // DynamoDB parameters
  const params = {
    TableName: tableName,
    IndexName: "Enabled-lastSuccess",
    KeyConditionExpression: "enabled = :enabled and lastSuccess < :lst",
    FilterExpression: "lastAttempt < :lat and contactAttempts < :ma",
    ExpressionAttributeValues: {
      ":enabled": "1",
      ":lst": lastSuccessThreshold,
      ":lat": lastAttemptThreshold,
      ":ma": ma
    }
  };
  console.log(`queryDDB params: ${JSON.stringify(params)}`);

  try {
    const result = await docClient.query(params).promise();
    console.log(`queryDDB result: ${JSON.stringify(result)}`);
    if (result["Count"] > 0) {
      return result;
    } else {
      return { Count: 0 };
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    return { Count: -1 };
  }
}
// Function to reset if attempts is eq maxAttempts, reset if attempt time is older than (minutesBetweenSuccesses) 24 hours
async function resetMaxAttempts() {
  const docClient = new AWS.DynamoDB.DocumentClient({ region });
  const minbs = parseInt(process.env.minutesBetweenSuccesses);
  const ma = parseInt(process.env.maxAttempts);

  // Now Datetime
  const now = new Date();
  const nowseconds = Math.round(now.getTime() / 1000);

  const lastSuccessThreshold = nowseconds - minbs * 60;
  console.log(`lastSuccessThreshold: ${lastSuccessThreshold}`);

  // Get users with a last success older than threshold

  // DynamoDB parameters
  const params = {
    TableName: tableName,
    IndexName: "Enabled-lastSuccess",
    KeyConditionExpression: "enabled = :enabled and lastSuccess < :lst",
    FilterExpression: "lastAttempt < :lst and contactAttempts >= :ma",
    ExpressionAttributeValues: {
      ":enabled": "1",
      ":lst": lastSuccessThreshold,
      ":ma": ma
    }
  };
  console.log(`resetMaxAttempts query DDB params: ${JSON.stringify(params)}`);

  try {
    const result = await docClient.query(params).promise();
    console.log(`resetMaxAttempts query DDB result: ${JSON.stringify(result)}`);
    if (result["Count"] > 0) {
      await result.Items.forEach(async item => {
        const dynamoParams = {
          TableName: tableName,
          Key: {
            telephoneNumber: item["telephoneNumber"]
          },
          UpdateExpression: "set contactAttempts = :attempts",
          ExpressionAttributeValues: {
            ":attempts": 0
          }
        };
        console.log(
          `resetMaxAttempts update DDB params: ${JSON.stringify(dynamoParams)}`
        );

        try {
          const updateResult = await docClient.update(dynamoParams).promise();
          console.log(`update result: ${updateResult}`);
        } catch (error) {
          console.error(error);
        }
      });

      return { Count: result["Count"] };
    } else {
      return { Count: 0 };
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    return { Count: -1 };
  }
}
module.exports = { updateConnectTable, queryDDB, resetMaxAttempts };
