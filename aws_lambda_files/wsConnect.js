let AWS = require("aws-sdk");

/* get document client to handle DynamoDB tables */
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    /* get connection ID from event */
    let connectionID = event.requestContext.connectionId;
    console.log("Client connected with ID: " + connectionID);

    /* parameters for storing connection ID in DynamoDB */
    let params = {
        TableName: "WebSocketsClients",
        Item: {
            ConnectionID: connectionID
        }
    };

    /* store connection ID to send data to all connected clients at front end */
    try {
        await documentClient.put(params).promise();
        console.log("Connection ID stored.");

        return {
            statusCode: 200,
            body: "Client connected with ID: " + connectionID
        };
    }
    catch (err) {
        console.log("Error: " + err)
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
};
