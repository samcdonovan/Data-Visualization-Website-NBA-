let AWS = require("aws-sdk");

let db = require('database'); /* import DB functions */

/**
 * Sends the given message to all connected clients
 * @param {JSON} message, object containing the data to be sent back to the clients
 * @param {string} domainName, the domain name for the websocket
 * @param {string} stage, the stage for the websocket
 * @returns an array containing promises from sending the message back to the clients
 */
module.exports.getSendMessagePromises = async (message, domainName, stage) => {

    /* get connection IDs for all connected clients from the WebSocketsClients table */
    let clientIdArray = (await db.getConnectionIDs()).Items;
    console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));

    /* create API Gateway management class */
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: domainName + '/' + stage
    });

    /* try to send message to connected clients */
    let msgPromiseArray = clientIdArray.map(async item => {
        try {
            console.log("Sending message '" + JSON.stringify(message) + "' to: " + item.ConnectionID);

            /* create parameters for API Gateway */
            let apiMsg = {
                ConnectionId: item.ConnectionID,
                Data: JSON.stringify(message)
            };

            /* wait for API Gateway to execute and log result */
            await apigwManagementApi.postToConnection(apiMsg).promise();
            console.log("Message '" + message + "' sent to: " + item.ConnectionID);

        } catch (err) {
            console.log("Failed to send message to: " + item.ConnectionID);

            /* delete connection ID from database */
            if (err.statusCode == 410) {
                try {
                    await db.deleteConnectionID(item.ConnectionID);
                }
                catch (err) {
                    console.log("ERROR deleting connectionID: " + JSON.stringify(err));
                    throw err;
                }
            }
            else {
                console.log("UNKNOWN ERROR: " + JSON.stringify(err));
                throw err;
            }
        }
    });

    return msgPromiseArray;
};


