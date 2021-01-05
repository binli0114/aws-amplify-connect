process.env.minutesBetweenSuccesses = 1440;
process.env.minutesBetweenCalls = 60;
process.env.maxAttempts = 5;
process.env.AWS_REGION = "ap-southeast-2";
const { queryDDB } = require("../src/services/dynamodb");

(async () => {
  await queryDDB();
  console.log("queryDB done");
})();
