let ws = require('websocket');
let db = require("database");

let domainName = "0o8poab280.execute-api.us-east-1.amazonaws.com";
let stage = "production";

exports.handler = async (event) => {

    console.log("Event: " + JSON.stringify(event));

    try {

        let msg;

        /* the event will contain Records if it occured because there was an update to
             the MatchStats table */
        if (event.Records !== undefined) {
            msg = {
                type: "UPDATE"
            }
            for (let record of event.Records) {
                /* if the event occured because of a new table insert or a remove, 
                set the table name to that tables name */
                if (record.eventName === "INSERT" || record.eventName === "REMOVE") {
                    let tableName = record.eventSourceARN.split(':')[5].split('/')[1];
                    if (msg.table_name === undefined)
                        msg.table_name = tableName;
                    else
                        msg.table_name = "all";
                }
            }

            /* send the name of the table that was updated back to the user */
            let sendMsgPromises = await ws.getSendMessagePromises(msg, domainName, stage);

            await Promise.all(sendMsgPromises);

        } else {

            /* set the message type to LOAD, for loading the data */
            msg = {
                type: "LOAD"
            };

            let teamName = JSON.parse(event.body).team_name;
            let tableName = JSON.parse(event.body).table_name;

            /* retrieve the match and prediction data if the event requested the MatchStats
            table or "all" tables */
            if (tableName === "MatchStats" || tableName === "all") {
                msg.match_data = await getMatchData(teamName);
                msg.prediction_data = (await db.getPredictionData(teamName)).Items[0];

            }

            /* retrieve the sentiment data if the event requested the TweetSentiment
            table or "all" tables */
            if (tableName === "TweetSentiment" || tableName === "all")
                msg.sentiment_data = await getTweetData(teamName);

            msg.table_name = tableName;
            msg.team_name = teamName;

            /* send retrieved data back to the user */
            let sendMsgPromises = await ws.getSendMessagePromises(msg, domainName, stage);

            await Promise.all(sendMsgPromises);
        }

    } catch (error) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(error) };
    }

    return { statusCode: 200, body: "Data sent successfully." };
};

/**
 * Gets the Tweet sentiment analysis data and puts it into an 
 * appropriate data structure for the front end
 * @param {string} teamName, the name of the team
 * @returns the data structure containing the data
 */
async function getTweetData(teamName) {

    /* get the sentiment data for the current team from the database */
    const tweetData = await db.getSentimentData(teamName);
    console.log("Tweet data : " + tweetData);

    const tweetItems = tweetData.Items;
    console.log("Tweet items : " + JSON.stringify(tweetItems));

    let tweetTimestamps = [];
    let positiveSentiment = [];
    let negativeSentiment = [];
    let neutralSentiment = [];

    /* put the sentiment data into simple arrays */
    for (let i = 0; i < tweetItems.length; i++) {
        tweetTimestamps[i] = tweetItems[i].timestamp;
        positiveSentiment[i] = tweetItems[i].sentiment.SentimentScore.Positive;
        negativeSentiment[i] = tweetItems[i].sentiment.SentimentScore.Negative;
        neutralSentiment[i] = tweetItems[i].sentiment.SentimentScore.Neutral;
    }

    /* put the data into a data structure for the front end */
    let sentimentData = {
        team: teamName,
        timestamp: tweetTimestamps,
        positive: positiveSentiment,
        negative: negativeSentiment,
        neutral: neutralSentiment
    };

    return sentimentData;
}

/**
 * Gets the data for each match for the current team
 * @param {string} teamName, the name of the team
 * @returns the data structure containing the match data
 */
async function getMatchData(teamName) {

    /* get the match data for the current team from the database */
    const data = await db.getTeamData(teamName);

    const items = data.Items;

    console.log("Items: " + JSON.stringify(items));

    let scoreDifferences = [];
    let timestamps = [];
    let matchDates = [];
    let homeScores = [];
    let visitorScores = [];
    let matchNames = [];

    /* put the match data into simple arrays */
    for (let i = 0; i < items.length; i++) {
        scoreDifferences[i] = items[i].score_difference;
        timestamps[i] = items[i].timestamp;
        matchDates[i] = items[i].match_date;
        homeScores[i] = items[i].home_score;
        visitorScores[i] = items[i].visitor_score;
        matchNames[i] = items[i].match_name;
    }

    /* put the data into a data structure for the front end */
    let formattedData = {
        team_name: teamName,
        timestamps: timestamps,
        match_dates: matchDates,
        score_differences: scoreDifferences,
        home_scores: homeScores,
        visitor_scores: visitorScores,
        match_names: matchNames
    };

    return formattedData;
}