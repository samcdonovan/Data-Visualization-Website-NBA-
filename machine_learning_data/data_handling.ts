const syntheticData = require('./synthetic/data/synthetic_data.json');

const moment = require('moment'); /* moments for handling dates and timestamps */
const filesystem = require('fs'); /* filesystem for saving to local files */
let AWS = require("aws-sdk");

/* configure AWS */
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

/* document client for handling DynamoDB tables */
let documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Uploads prediction data to the DynamoDB prediction table
 */
function uploadPredictions() {
    let teamNames: string[] = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Chicago Bulls", "Philadelphia 76ers"];

    /* loop through every team name */
    for (let i: number = 0; i < teamNames.length; i++) {

        /* get prediction data for current team in local file */
        let predictionData = require('./prediction_data/' + teamNames[i].replace(" ", "_") + '_predictions.json');
        let startDates = ['05-07-2021', '01-06-2021', '19-06-2021', '16-05-2021	', '20-06-2021'];

        let team: string = predictionData.team.S;
        let mean: number[] = predictionData.mean;
        let upper: number[] = predictionData.quantiles["0.9"];
        let lower: number[] = predictionData.quantiles["0.1"];
        let dates = [];

        dates[0] = moment(startDates[0], "DD-MM-YYYY").add(2, 'days').format("DD-MM-YYYY");

        /* create dates for prediction data, for chart plotting */
        for (let j = 1; j < mean.length; j++)
            dates[j] = moment(dates[j - 1], "DD-MM-YYYY").add(2, 'days').format("DD-MM-YYYY");

        /* params for insertion into PredictionData */
        let params = {
            TableName: "PredictionData",
            Item: {
                team: team,
                mean: mean,
                upper: upper,
                lower: lower,
                dates: dates
            }
        };

        uploadToDb(params); /* upload params to DB */
    }
}

/**
 * Helper function for uploading to DynamoDB table
 * @param params, insertion params
 * @returns result of the promise for the documentClient put
 */
function uploadToDb(params) {
    return new Promise<string>((resolve, reject) => {
        documentClient.put(params, (err, data) => {
            if (err) {
                console.log(JSON.stringify(params));
                reject("Unable to add match: " + JSON.stringify(err));
            }
            else {
                resolve("Match added to table with id: " + params.Item);
            }
        })
    });
}

uploadPredictions();

/**
 * Returns all rows in MatchStats for the specified team
 * @param teamName, name of the team
 * @returns promise for the table query
 */
async function getTeamData(teamName: string) {

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
 * Packages the data retrieved from the DB into a more
 * appropriate format
 * @param data, the data to be formatted 
 * @returns JSON object containing the newly formatted data
 */
async function getMatchData(data) {

    const items = data.Items;

    let scoreDifferences = [];
    let timestamps = [];
    let matchDates = [];

    for (let i = 0; i < items.length; i++) {
        scoreDifferences[i] = items[i].score_difference;
        timestamps[i] = items[i].timestamp;
        matchDates[i] = items[i].match_date;
    }

    let formattedData = {
        team_name: items.team,
        timestamps: timestamps,
        match_dates: matchDates,
        score_differences: scoreDifferences
    };

    return formattedData;
}

/**
 * Writes the train, test and actual data for each team into local files
 */
async function writeDataToFiles() {
    let data;
    let numericalData;
    let trainingAmount: number;
    let trainTarget: number[] = [], testTarget: number[] = [];
    let actualTarget: number[] = [];

    /* setup JSON data objects for local files */
    let trainData = {
        start: 0,
        target: []
    };
    let actualData = {
        start: 0,
        target: []
    };
    let testData = {
        start: 0,
        target: []
    };

    let teamNames: string[] = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Chicago Bulls", "Philadelphia 76ers"];

    /* loop through each team name */
    for (let i: number = 0; i < teamNames.length; i++) {
        data = await getTeamData(teamNames[i]);
        numericalData = await getMatchData(data); /* get numerical data from DynamoDB */

        trainData.start = numericalData.match_dates[0];
        actualData.start = numericalData.match_dates[0];
        trainingAmount = numericalData.score_differences.length - 100;

        /* fill training target and actual target with all elements from 0 to length - 100 */
        for (let j: number = 0; j < trainingAmount; j++) {
            trainTarget[j] = numericalData.score_differences[j];
            actualTarget[j] = numericalData.score_differences[j];
        }

        trainData.target = trainTarget;

        testData.start = numericalData.match_dates[trainingAmount];

        /* fill test target and actual target with last 100 elements */
        for (let j: number = trainingAmount, k = 0; j < numericalData.score_differences.length; j++, k++) {
            actualTarget[j] = numericalData.score_differences[j];
            testTarget[k] = numericalData.score_differences[j];
        }

        testData.target = testTarget;
        actualData.target = actualTarget;

        /* save all data to local files */
        saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_train.json", trainData);
        saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_test.json", testData);
        saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_data.json", actualData);
    }
}

/**
 * Saves the train portion of the synthetic data into a local file
 */
function getSyntheticTrain() {

    let target: number[] = [];

    /* loop from the start to the last 100 items */
    for (let i = 0; i < syntheticData.target.length - 100; i++)
        target[i] = syntheticData.target[i];

    /* package into appropriate format for SageMaker */
    let trainData = {
        start: syntheticData.start,
        target: target
    };

    /* save file locally */
    saveFile("./synthetic/data/synthetic_train.json", trainData);
}

/**
 * Saves the test portion of the synthetic data into a local file
 */
function getSyntheticTest() {
    let target: number[] = [];

    /* loop from 400 to the end of the synthetic data */
    for (let i = 400, j = 0; i < syntheticData.target.length; i++, j++)
        target[j] = syntheticData.target[i];

    /* add 400 hours to the synthetic data start time */
    let testData = {
        start: moment(syntheticData.start).add(400, 'hours'),
        target: target
    };

    saveFile("./synthetic/data/synthetic_test.json", testData);
}

/**
 * Saves stringified JSON file to local filesystem
 * @param filePath, the file path of the JSON file
 * @param data, the data to be saved to the file 
 */
function saveFile(filePath: string, data) {

    filesystem.writeFile(filePath, JSON.stringify(data), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log(filePath + " has been saved.");
    });
}

