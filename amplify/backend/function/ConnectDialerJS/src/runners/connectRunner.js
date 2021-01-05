const { GetConnectMetric } = require("../services/amazonConnect");

(async () => {
  const metric = await GetConnectMetric(
    "arn:aws:connect:ap-southeast-2:822193256404:instance/2340bf9d-dd66-4012-ac40-88133523a749/queue/a91e9879-6284-41e4-8697-04863352ed1a",
    "2340bf9d-dd66-4012-ac40-88133523a749"
  );
  console.log(`Connect Metric ${JSON.stringify(metric, undefined, 2)}`);
})();
