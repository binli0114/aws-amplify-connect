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

const currentConnectQueue = process.env.queue;
// const minFA = process.env.minFreeAgents;
const cFlowID = process.env.cFlowID;
const connectInstanceId = process.env.instance;
const sNum = process.env.sourcePhoneNumber;
// const index = process.env.index;
const {
  queryDDB,
  updateConnectTable,
  resetMaxAttempts
} = require("./services/dynamodb");

const AWS = require("aws-sdk");
const connect = new AWS.Connect();

const handler = async event => {
  // log event
  console.log("Received Event:", JSON.stringify(event, null, 2));

  // get # of available agents
  const agentsAvailable = await GetConnectMetric(
    currentConnectQueue,
    connectInstanceId
  );
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
      const placedCalls = await callOutbound(result["Items"]);
      responseText = placedCalls;
    } else {
      console.log(`No numbers ready to call`);
      responseText = "No numbers ready to call";
    }
  }

  // reset if attempts is eq maxAttempts, reset if attempt time is older than (minutesBetweenSuccesses) 24 hours
  await resetMaxAttempts();

  // build response
  const response = {
    statusCode: 200,
    body: JSON.stringify(responseText)
  };
  return response;
};

async function callOutbound(phoneNumbers) {
  // Start outbound call for each entry and update entry in DB

  //const promises = [];
  await phoneNumbers.forEach(async item => {
    const formatted = item["telephoneNumber"];
    console.log(`Attempting Call: ${formatted}`);
    const { organisation } = item;
    let promptMessage =
      "How are you feeling today? Press 1 for Happy, press 2 if you would like to talk.";
    if (organisation) {
      promptMessage = `We are calling you on behalf of ${organisation}. ${promptMessage}`;
    }
    const connectParams = {
      DestinationPhoneNumber: formatted,
      ContactFlowId: cFlowID,
      InstanceId: connectInstanceId,
      SourcePhoneNumber: sNum,
      Attributes: {
        organisation,
        organizationPrompt: promptMessage
      }
    };

    try {
      const response = await connect
        .startOutboundVoiceContact(connectParams)
        .promise();
      console.log(response);
      console.log(`Call success for: ${response}`);
    } catch (error) {
      console.error(error);
    }

    await updateConnectTable(formatted);
  });
}

async function GetConnectMetric(queue, cID) {
  const params = {
    InstanceId: cID,
    Filters: {
      Queues: [queue],
      Channels: ["VOICE"]
    },
    Groupings: ["QUEUE"],
    CurrentMetrics: [
      {
        Name: "AGENTS_AVAILABLE",
        Unit: "COUNT"
      }
    ]
  };

  try {
    const response = await connect.getCurrentMetricData(params).promise();
    if (response["MetricResults"]) {
      return response["MetricResults"][0]["Collections"][0]["Value"];
    } else {
      return -1;
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    return -1;
  }
  //console.log(`Connect metrics response: ${JSON.stringify(response)}`);
}

module.exports = {
  handler,
  callOutbound
};
