const AWS = require("aws-sdk");
const cFlowID = process.env.cFlowID;
const sNum = process.env.sourcePhoneNumber;
const region = process.env.AWS_REGION;
const currentConnectQueue = process.env.queue;
const connectInstanceId = process.env.instance;
async function callOutbound(callingItem) {
  const connect = new AWS.Connect({ apiVersion: "2017-08-08", region });

  const { telephoneNumber: formatted, organisation, firstName } = callingItem;
  console.log(`Attempting Call: ${formatted}`);
  let hiMessage = "hi";
  if (firstName) {
    hiMessage = `hi ${firstName}`;
  }
  let promptMessage =
    "How are you feeling today? Press 1 for Happy, press 2 if you would like to talk.";
  if (organisation) {
    promptMessage = `${hiMessage}. We are calling you on behalf of ${organisation}. ${promptMessage}`;
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
    await connect.startOutboundVoiceContact(connectParams).promise();
  } catch (error) {
    console.error(error);
  }
}

async function GetConnectMetric() {
  const connect = new AWS.Connect({
    apiVersion: "2017-08-08",
    region
  });

  const params = {
    InstanceId: connectInstanceId,
    Filters: {
      Queues: [currentConnectQueue],
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
  GetConnectMetric,
  callOutbound
};
