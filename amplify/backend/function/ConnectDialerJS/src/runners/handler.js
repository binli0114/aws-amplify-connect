process.env.instance = "2340bf9d-dd66-4012-ac40-88133523a749";
process.env.sourcePhoneNumber = "+61370039616";
process.env.cFlowID = "5744ec6a-6c7b-4eb5-bcff-ba08a2835978";
process.env.queue =
  "arn:aws:connect:ap-southeast-2:822193256404:instance/2340bf9d-dd66-4012-ac40-88133523a749/queue/a91e9879-6284-41e4-8697-04863352ed1a";
process.env.AWS_REGION = "ap-southeast-2";
process.env.minutesBetweenSuccesses = 1440;
process.env.minutesBetweenCalls = 60;
process.env.maxAttempts = 5;
const { handler } = require("../index");

(async () => {
  await handler();
  console.log("done");
})();
