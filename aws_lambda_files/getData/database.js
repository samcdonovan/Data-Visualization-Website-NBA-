let AWS = require("aws-sdk");

/* get document client to handle DynamoDB tables */
let documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Returns all of the prediction data for the current team
 * @param {string} teamName, the name of the team
 * @returns a promise from querying the PredictionData table
 */
module.exports.getPredictionData = async (teamName) => {

    let params = {
        TableName: "PredictionData",
        KeyConditionExpression: "team = :t",
        ExpressionAttributeValues: {
            ":t": teamName
        }
    };

    console.log("Params: " + JSON.stringify(params));

    return documentClient.query(params).promise();
};

/**
 * Returns all sentiment data for the specified team
 * @param {string} teamName, the name of the team
 * @returns a promise from scanning the TweetSentiment table
 */
module.exports.getSentimentData = async (teamName) => {

    let params = {
        TableName: "TweetSentiment",
        FilterExpression: "team = :t",
        ExpressionAttributeValues: {
            ":t": teamName
        }
    };

    console.log("Params: " + JSON.stringify(params));

    return documentClient.scan(params).promise();
};

/**
 * Returns all match data for the specified team
 * @param {string} teamName, the name of the team
 * @returns a promise from querying the MatchStats table
 */
module.exports.getTeamData = async (teamName) => {

    let params = {
        TableName: "MatchStats",
        KeyConditionExpression: "team = :t",
        ExpressionAttributeValues: {
            ":t": teamName
        }
    };

    console.log("Params: " + JSON.stringify(params));

    return documentClient.query(params).promise();
};


/**
 * Returns all of the connection IDs
 * @returns a promise from searching the WebSocketsClients table 
 */
module.exports.getConnectionIDs = async () => {
    let params = {
        TableName: "WebSocketsClients"
    };
    return documentClient.scan(params).promise();
};

/**
 * Deletes the connection ID for the user after they disconnect
 * @param {int} connectionID, the connection ID of the user
 * @returns a promise from deleting the connection
 */
module.exports.deleteConnectionID = async (connectionID) => {
    console.log("Deleting connection ID: " + connectionID);

    let params = {
        TableName: "WebSocketClients",
        Key: {
            ConnectionID: connectionID
        }
    };
    return documentClient.delete(params).promise();
};
