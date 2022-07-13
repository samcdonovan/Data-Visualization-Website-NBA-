
import { BallDontLie } from "./match_stats" /* import match stats retrieval class */
import { searchTweets } from "./twitter" /* import twitter retrieval function */

let AWS = require("aws-sdk");

/* set up AWS */
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

/**
 * Handles downloading both the numerical data and the Tweets in the same loop, for each team
 */
function downloadData() {

    let teamNames: string[] = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Chicago Bulls", "Philadelphia 76ers"];
    let teamIds: number[] = [1, 2, 3, 5, 23]; /* IDs for BallDontLie API */
    let bdl: BallDontLie = new BallDontLie(); /* initialise BallDontLie object */

    /* retrieve data */
    for (let i = 0; i < teamNames.length; i++) {

        searchTweets(teamNames[i]);
        bdl.downloadTeamMatchStats(teamIds[i]);

    }
};

downloadData();