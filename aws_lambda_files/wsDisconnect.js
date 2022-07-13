let AWS = require("aws-sdk");

/* get document client to handle DynamoDB tables */
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    /* get connection ID from event */
    let connId = event.requestContext.connectionId;
    console.log("Disconnecting client with ID: " + connId);

    /* parameters for deleting connection ID from DynamoDB */
    let params = {
        TableName: "WebSocketsClients",
        Key: {
            ConnectionID: connId
        }
    };

    /* delete connection ID so that no data is sent to this client after they disconnect */
    try {
        await documentClient.delete(params).promise();
        console.log("Connection ID deleted.");

        return {
            statusCode: 200,
            body: "Client disconnected. ID: " + connId
        };
    }
    catch (err) {
        console.log("Error disconnecting client with ID: " + connId + ": " + JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
};

