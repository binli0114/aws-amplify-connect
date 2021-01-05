/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var storageContactsStoreName = process.env.STORAGE_CONTACTSSTORE_NAME
var storageContactsStoreArn = process.env.STORAGE_CONTACTSSTORE_ARN

Amplify Params - DO NOT EDIT */

// collect environment variables
// const environment = process.env.ENV;
// const region = process.env.REGION;
// const storageContactsStoreName = process.env.STORAGE_CONTACTSSTORE_NAME;
// const storageContactsStoreArn = process.env.STORAGE_CONTACTSSTORE_ARN;

// const minFA = process.env.minFreeAgents;
// const index = process.env.index;
const { queryDDB } = require("./services/dynamodb");

const { GetConnectMetric, callOutbound } = require("./services/amazonConnect");

const handler = async event => {
  // log event
  console.log("Received Event:", JSON.stringify(event, null, 2));

  // get # of available agents
  const agentsAvailable = await GetConnectMetric();
  console.log(`Agents available: ${agentsAvailable}`);

  // setup response text
  let responseText = "";

  // if agents are available
  if (agentsAvailable >= 1) {
    // temp zero value for testing
    console.log(
      `Starting dialer as ${agentsAvailable} agent(s) are available:`
    );
    const result = await queryDDB();
    console.log(`DDB Query result: ${result.Count}`);
    if (result.Count > 0) {
      const pendingCallItems = result.Items;
      await pendingCallItems.forEach(async item => {
        await callOutbound(item);
      });
    } else {
      console.log(`No numbers ready to call`);
      responseText = "No numbers ready to call";
    }
  }

  // reset if attempts is eq maxAttempts, reset if attempt time is older than (minutesBetweenSuccesses) 24 hours
  //await resetMaxAttempts();

  // build response
  const response = {
    statusCode: 200,
    body: JSON.stringify(responseText)
  };
  return response;
};

module.exports = {
  handler
};
