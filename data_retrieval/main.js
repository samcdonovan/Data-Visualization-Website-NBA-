"use strict";
exports.__esModule = true;
var match_stats_1 = require("./match_stats"); /* import match stats retrieval class */
var twitter_1 = require("./twitter"); /* import twitter retrieval function */
var AWS = require("aws-sdk");
/* set up AWS */
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
/**
 * Handles downloading both the numerical data and the Tweets in the same loop, for each team
 */
function downloadData() {
    var teamNames = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Chicago Bulls", "Philadelphia 76ers"];
    var teamIds = [1, 2, 3, 5, 23]; /* IDs for BallDontLie API */
    var bdl = new match_stats_1.BallDontLie(); /* initialise BallDontLie object */
    /* retrieve data */
    for (var i = 0; i < teamNames.length; i++) {
        (0, twitter_1.searchTweets)(teamNames[i]);
        bdl.downloadTeamMatchStats(teamIds[i]);
    }
}
;
downloadData();
