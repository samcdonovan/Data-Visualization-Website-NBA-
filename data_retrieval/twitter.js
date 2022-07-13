"use strict";
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
exports.__esModule = true;
exports.searchTweets = void 0;
var dotenv = require('dotenv'); /* module that reads keys from .env file */
var Twitter = require('twitter'); /* node Twitter library for retrieving Tweets */
var moment = require('moment'); /* moment library for handling dates */
var database_1 = require("./database"); /* import the database upload function for tweets */
dotenv.config(); /* Copy variables in file into environment variables */
/* set up the Twitter client with the Twitter developer account credentials */
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
});
/**
 * Main function for retrieving Tweets related to an NBA team
 * @param teamName, the name of the team
 */
function searchTweets(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams_1, twitterResult, promiseArray_1, databaseResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams_1 = {
                        q: teamName,
                        count: 100,
                        lang: "en"
                    };
                    return [4 /*yield*/, client.get('search/tweets', searchParams_1)];
                case 1:
                    twitterResult = _a.sent();
                    promiseArray_1 = [];
                    twitterResult.statuses.forEach(function (tweet) {
                        console.log("Tweet id: " + tweet.id + ". Tweet text: " + tweet.text);
                        var timestamp = +moment(tweet.created_at).format('X');
                        /* store save data promise in array */
                        promiseArray_1.push((0, database_1.saveTweet)(tweet.id, tweet.text, searchParams_1.q, timestamp));
                    });
                    return [4 /*yield*/, Promise.all(promiseArray_1)];
                case 2:
                    databaseResult = _a.sent();
                    console.log("Database result: " + JSON.stringify(databaseResult));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(JSON.stringify(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.searchTweets = searchTweets;
;
