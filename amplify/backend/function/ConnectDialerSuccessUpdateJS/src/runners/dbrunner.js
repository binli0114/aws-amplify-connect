process.env.minutesBetweenSuccesses = 1440;
process.env.minutesBetweenCalls = 60;
process.env.maxAttempts = 5;
process.env.AWS_REGION = "ap-southeast-2";
const {
  updateLastAttempt,
  updateLastSuccess
} = require("../services/dynamodb");

(async () => {
  const telephoneNumber = "+61431393060";
  await updateLastAttempt(telephoneNumber, "test132");
  await updateLastSuccess(telephoneNumber, "VeryHappy");
  console.log("db runner test done");
})();
