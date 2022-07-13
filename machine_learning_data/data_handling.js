var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var syntheticData = require('./synthetic/data/synthetic_data.json');
var moment = require('moment'); /* moments for handling dates and timestamps */
var filesystem = require('fs'); /* filesystem for saving to local files */
var AWS = require("aws-sdk");
/* configure AWS */
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
/* document client for handling DynamoDB tables */
var documentClient = new AWS.DynamoDB.DocumentClient();
/**
 * Uploads prediction data to the DynamoDB prediction table
 */
function uploadPredictions() {
    var teamNames = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Chicago Bulls", "Philadelphia 76ers"];
    /* loop through every team name */
    for (var i = 0; i < teamNames.length; i++) {
        /* get prediction data for current team in local file */
        var predictionData = require('./prediction_data/' + teamNames[i].replace(" ", "_") + '_predictions.json');
        var startDates = ['05-07-2021', '01-06-2021', '19-06-2021', '16-05-2021	', '20-06-2021'];
        var team = predictionData.team.S;
        var mean = predictionData.mean;
        var upper = predictionData.quantiles["0.9"];
        var lower = predictionData.quantiles["0.1"];
        var dates = [];
        dates[0] = moment(startDates[0], "DD-MM-YYYY").add(2, 'days').format("DD-MM-YYYY");
        /* create dates for prediction data, for chart plotting */
        for (var j = 1; j < mean.length; j++)
            dates[j] = moment(dates[j - 1], "DD-MM-YYYY").add(2, 'days').format("DD-MM-YYYY");
        /* params for insertion into PredictionData */
        var params = {
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
    return new Promise(function (resolve, reject) {
        documentClient.put(params, function (err, data) {
            if (err) {
                console.log(JSON.stringify(params));
                reject("Unable to add match: " + JSON.stringify(err));
            }
            else {
                resolve("Match added to table with id: " + params.Item);
            }
        });
    });
}
uploadPredictions();
/**
 * Returns all rows in MatchStats for the specified team
 * @param teamName, name of the team
 * @returns promise for the table query
 */
function getTeamData(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var params;
        return __generator(this, function (_a) {
            params = {
                TableName: "MatchStats",
                KeyConditionExpression: "team = :t",
                ExpressionAttributeValues: {
                    ":t": teamName
                }
            };
            console.log("Params: " + JSON.stringify(params));
            return [2 /*return*/, documentClient.query(params).promise()];
        });
    });
}
;
/**
 * Packages the data retrieved from the DB into a more
 * appropriate format
 * @param data, the data to be formatted
 * @returns JSON object containing the newly formatted data
 */
function getMatchData(data) {
    return __awaiter(this, void 0, void 0, function () {
        var items, scoreDifferences, timestamps, matchDates, i, formattedData;
        return __generator(this, function (_a) {
            items = data.Items;
            scoreDifferences = [];
            timestamps = [];
            matchDates = [];
            for (i = 0; i < items.length; i++) {
                scoreDifferences[i] = items[i].score_difference;
                timestamps[i] = items[i].timestamp;
                matchDates[i] = items[i].match_date;
            }
            formattedData = {
                team_name: items.team,
                timestamps: timestamps,
                match_dates: matchDates,
                score_differences: scoreDifferences
            };
            return [2 /*return*/, formattedData];
        });
    });
}
/**
 * Writes the train, test and actual data for each team into local files
 */
function writeDataToFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var data, numericalData, trainingAmount, trainTarget, testTarget, actualTarget, trainData, actualData, testData, teamNames, i, j, j, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trainTarget = [], testTarget = [];
                    actualTarget = [];
                    trainData = {
                        start: 0,
                        target: []
                    };
                    actualData = {
                        start: 0,
                        target: []
                    };
                    testData = {
                        start: 0,
                        target: []
                    };
                    teamNames = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
                        "Chicago Bulls", "Philadelphia 76ers"];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < teamNames.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getTeamData(teamNames[i])];
                case 2:
                    data = _a.sent();
                    return [4 /*yield*/, getMatchData(data)];
                case 3:
                    numericalData = _a.sent(); /* get numerical data from DynamoDB */
                    trainData.start = numericalData.match_dates[0];
                    actualData.start = numericalData.match_dates[0];
                    trainingAmount = numericalData.score_differences.length - 100;
                    /* fill training target and actual target with all elements from 0 to length - 100 */
                    for (j = 0; j < trainingAmount; j++) {
                        trainTarget[j] = numericalData.score_differences[j];
                        actualTarget[j] = numericalData.score_differences[j];
                    }
                    trainData.target = trainTarget;
                    testData.start = numericalData.match_dates[trainingAmount];
                    /* fill test target and actual target with last 100 elements */
                    for (j = trainingAmount, k = 0; j < numericalData.score_differences.length; j++, k++) {
                        actualTarget[j] = numericalData.score_differences[j];
                        testTarget[k] = numericalData.score_differences[j];
                    }
                    testData.target = testTarget;
                    actualData.target = actualTarget;
                    /* save all data to local files */
                    saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_train.json", trainData);
                    saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_test.json", testData);
                    saveFile("./machine_learning/prediction_data/" + teamNames[i].replace(" ", "_") + "_data.json", actualData);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Saves the train portion of the synthetic data into a local file
 */
function getSyntheticTrain() {
    var target = [];
    /* loop from the start to the last 100 items */
    for (var i = 0; i < syntheticData.target.length - 100; i++)
        target[i] = syntheticData.target[i];
    /* package into appropriate format for SageMaker */
    var trainData = {
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
    var target = [];
    /* loop from 400 to the end of the synthetic data */
    for (var i = 400, j = 0; i < syntheticData.target.length; i++, j++)
        target[j] = syntheticData.target[i];
    /* add 400 hours to the synthetic data start time */
    var testData = {
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
function saveFile(filePath, data) {
    filesystem.writeFile(filePath, JSON.stringify(data), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log(filePath + " has been saved.");
    });
}
