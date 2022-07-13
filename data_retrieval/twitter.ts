const dotenv = require('dotenv'); /* module that reads keys from .env file */

const Twitter = require('twitter'); /* node Twitter library for retrieving Tweets */

const moment = require('moment'); /* moment library for handling dates */

import { saveTweet } from "./database"; /* import the database upload function for tweets */

dotenv.config(); /* Copy variables in file into environment variables */

/* set up the Twitter client with the Twitter developer account credentials */
let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

/**
 * Main function for retrieving Tweets related to an NBA team
 * @param teamName, the name of the team 
 */
export async function searchTweets(teamName: string) {
    try {

        /* set up parameters for the Twitter search */
        let searchParams = {
            q: teamName,
            count: 100,
            lang: "en",

        };

        /* wait for search to execute asynchronously */
        let twitterResult = await client.get('search/tweets', searchParams);

        /* output the result */
        let promiseArray: Array<Promise<string>> = [];
        twitterResult.statuses.forEach((tweet) => {
            console.log("Tweet id: " + tweet.id + ". Tweet text: " + tweet.text);
            let timestamp: number = +moment(tweet.created_at).format('X');

            /* store save data promise in array */
            promiseArray.push(saveTweet(tweet.id, tweet.text, searchParams.q, timestamp));
        });

        /* execute all of the save data promises */
        let databaseResult: Array<string> = await Promise.all(promiseArray);
        console.log("Database result: " + JSON.stringify(databaseResult));
    }
    catch (error) {
        console.log(JSON.stringify(error));
    }
};
