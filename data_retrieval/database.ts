
let AWS = require("aws-sdk");

/* configure AWS */
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

/* get document client to handle DynamoDB tables */
let documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Returns a promise that saves the match data into the MatchStats table
 * @param teamId, the ID of the team (from the BallDontLie API)
 * @param teamName, the name of the team
 * @param timestamp, the timestamp of the match
 * @param matchDate, the actual date of the match 
 * @param homeScore, the score for the home team 
 * @param awayScore, the score for the away team 
 * @param isHome, boolean to check whether our team is home or away 
 * @param scoreDifference, the score difference for this match 
 * @param matchName, the "name" of the match e.g. Bulls vs Hawks 
 * @returns a promise that stores the match data
 */
export function saveMatchData(teamId: number, teamName: string, timestamp: number, matchDate: number,
    homeScore: number, awayScore: number, isHome: boolean, scoreDifference: number, matchName: string) {

    /* params for database insertion */
    let newMatch = {
        TableName: "MatchStats",
        Item: {
            id: teamId,
            team: teamName,
            timestamp: timestamp,
            match_date: matchDate,
            home_score: homeScore,
            visitor_score: awayScore,
            is_home: isHome,
            score_difference: scoreDifference,
            match_name: matchName
        }
    }

    return new Promise<string>((resolve, reject) => {
        documentClient.put(newMatch, (err, data) => {
            if (err) {
                console.log(JSON.stringify(newMatch));
                reject("Unable to add match: " + JSON.stringify(err));
            }
            else {
                resolve("Match added to table with id: " + newMatch.Item);
            }
        })
    });
}

/**
 * Returns a promise that saves the Tweet into the Tweets table
 * @param tweetId, the ID of the Tweet
 * @param tweetText, the text of the Tweet 
 * @param tweetTeam, the team that the Tweet is about
 * @param timestamp, the timestamp of the Tweet
 * @returns a promise from trying to put the Tweet into the Tweets table
 */
export function saveTweet(tweetId: number, tweetText: string, tweetTeam: string, timestamp: number): Promise<string> {

    /* params for database insertion */
    let newTweet = {
        TableName: "Tweets",
        Item: {
            id: tweetId,
            text: tweetText,
            team: tweetTeam,
            timestamp: timestamp
        }
    };

    return new Promise<string>((resolve, reject) => {
        documentClient.put(newTweet, (err, data) => {
            if (err) {

                reject("Unable to add Tweet: " + JSON.stringify(err));
            }
            else {
                resolve("Tweet added to table with id: " + newTweet.Item);
            }
        })
    });
}

