var AWS = require("aws-sdk");
var credentials = new AWS.SharedIniFileCredentials({ profile: "dynamo" });

AWS.config.update({
  region: "us-west-2",
  endpoint: "https://dynamodb.us-west-2.amazonaws.com",
  credentials: credentials
});
// May need to put credentials in here once deployed
var dynamo = new AWS.DynamoDB.DocumentClient();
export { dynamo };