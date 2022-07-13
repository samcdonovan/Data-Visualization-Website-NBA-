

import { saveMatchData } from "./database";

/* Interface for handling Team data */
interface Team {
    id: number,
    full_name: string,
    name: string
}

/* Interface for handling Match data */
interface Match {
    date: string,
    home_team: Team,
    home_team_score: number,
    visitor_team: Team,
    visitor_team_score: number
}

/* Interface for handling data retrieved from BallDontLie */
interface BallDontLieType {
    data: Array<Match>,
    total_count: number
}

const moment = require('moment'); /* handles time/date management */

/* axios will handles HTTP requests to BallDontLie */
const axios = require('axios');

/**
 * Class that handles BallDontLie API data retrieval
 */
export class BallDontLie {

    /* base URL of BallDontLie API */
    baseUrl: string = "https://www.balldontlie.io/api/v1/games?";

    /**
     * Handles downloading data from the API and then passing it to the
     * SaveMatchData database function
     * @param team_id, the ID of the team (from BallDontLie)
     */
    async downloadTeamMatchStats(team_id: number): Promise<void> {

        /* the matches are most easily sorted by their season or year */
        let season = 2015;
        let promiseArray: Array<Promise<string>> = [];

        /* retrieve data for the 6 years from 2015 onward*/
        for (let year: number = 0; year < 6; ++year) {

            /* start with base url */
            let url: string = this.baseUrl;

            /* add current season */
            url += "seasons[]=" + (season + year);

            /* add team id */
            url += "&team_ids[]=" + team_id;
            let postseason = true;

            /* get data for both the normal season and the postseason */
            for (let i = 0; i < 2; i++) {
                postseason = !postseason;

                let newUrl = url + "&postseason=" + postseason;

                newUrl += "&per_page=100"; /* get the maximum allowed per page */

                console.log(newUrl); /* log URL */

                await new Promise(r => setTimeout(r, 10000)); /* crawl delay */

                try {

                    /* data into BallDontLie type */
                    let data: BallDontLieType = (await axios.get(newUrl)).data;

                    /* loop through every match in that data */
                    for (let match of data.data) {

                        let scoreDifference: number;
                        let isHome: boolean;
                        let teamName: string;

                        /* if the home team ID is the same as our team ID, our team is the home team,
                        otherwise it's the away team. We use this to calculate the score difference between the two teams */
                        if (match.home_team.id == team_id) {
                            scoreDifference = match.home_team_score - match.visitor_team_score;
                            isHome = true;
                            teamName = match.home_team.full_name;
                        } else {
                            scoreDifference = match.visitor_team_score - match.home_team_score;
                            isHome = false;
                            teamName = match.visitor_team.full_name;
                        }

                        let matchName = match.home_team.name + " vs. " + match.visitor_team.name; /* get the match name */

                        /* get the date of the match from the data and parse it to a more readable date using moments */
                        let matchDate = moment(match.date).format("DD-MM-YYYY");
                        let timestamp: number = +moment(match.date).format("X"); /* convert that date to a timestamp */

                        /* push the returned promise from saveMatchData into an array */
                        promiseArray.push(saveMatchData(team_id, teamName, timestamp, matchDate,
                            match.home_team_score, match.visitor_team_score, isHome, scoreDifference, matchName));
                    }

                    /* insert all matches into the MatchStats table */
                    let databaseResult: Array<string> = await Promise.all(promiseArray);
                    console.log("Matches added");
                }
                catch (err) {
                    console.error("Failed to fetch data: " + err);
                }
            }

        }
    }
}
