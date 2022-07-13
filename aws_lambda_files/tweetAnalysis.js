let AWS = require("aws-sdk");

/* create Comprehend instance */
let comprehend = new AWS.Comprehend();

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    try {

        for (let record of event.Records) {

            /* check if a new Tweet is being inserted into the database */
            if (record.eventName === "INSERT") {

                /* retrieve relevant information */
                let tweetId = record.dynamodb.NewImage.id.N;
                let tweetText = record.dynamodb.NewImage.text.S;
                let team = record.dynamodb.NewImage.team.S;
                let timestamp = record.dynamodb.NewImage.timestamp.N;

                /* AWS Comprehend parameters */
                let params = {
                    LanguageCode: "en",
                    Text: tweetText
                };

                let result = await comprehend.detectSentiment(params).promise();
                let documentClient = new AWS.DynamoDB.DocumentClient();

                /* put results of Comprehend analysis into the TweetSentiment table */
                let databaseParams = {
                    TableName: "TweetSentiment",
                    Item: {
                        tweetID: parseInt(tweetId),
                        team: team,
                        timestamp: parseInt(timestamp),
                        sentiment: result,

                    }
                }

                /* put results of sentiment analysis into table */
                await documentClient.put(databaseParams).promise();

            }
        }
    } catch (ex) {
        console.log("Error: " + ex);
    }
};