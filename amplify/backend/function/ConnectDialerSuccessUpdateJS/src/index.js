/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var storageContactsStoreName = process.env.STORAGE_CONTACTSSTORE_NAME
var storageContactsStoreArn = process.env.STORAGE_CONTACTSSTORE_ARN

Amplify Params - DO NOT EDIT */

const { updateLastSuccess, updateLastAttempt } = require("./services/dynamodb");
exports.handler = async event => {
  // log event
  console.log("Received Event:", JSON.stringify(event, null, 2));
  const {
    Details: {
      ContactData: {
        ContactId,
        CustomerEndpoint: { Address: telephoneNumber }
      },
      Parameters: { eventName }
    }
  } = event;
  if (eventName === "updateLastAttempt") {
    await updateLastAttempt(telephoneNumber, ContactId);
  } else {
    // collect details from event
    const eventChoice = event["Details"]["Parameters"]["Choice"];

    // Choice (Mood) if...
    let choice = "Unknown";
    if (eventChoice === "1") {
      choice = "Happy";
    } else if (eventChoice === "2") {
      choice = "Sad";
    }
    await updateLastSuccess(telephoneNumber, choice);
  }
  // build response
  const response = {
    statusCode: 200,
    body: "Done"
  };
  return response;
};
