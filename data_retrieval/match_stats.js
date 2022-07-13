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
exports.BallDontLie = void 0;
var database_1 = require("./database");
var moment = require('moment'); /* handles time/date management */
/* axios will handles HTTP requests to BallDontLie */
var axios = require('axios');
/**
 * Class that handles BallDontLie API data retrieval
 */
var BallDontLie = /** @class */ (function () {
    function BallDontLie() {
        /* base URL of BallDontLie API */
        this.baseUrl = "https://www.balldontlie.io/api/v1/games?";
    }
    /**
     * Handles downloading data from the API and then passing it to the
     * SaveMatchData database function
     * @param team_id, the ID of the team (from BallDontLie)
     */
    BallDontLie.prototype.downloadTeamMatchStats = function (team_id) {
        return __awaiter(this, void 0, void 0, function () {
            var season, promiseArray, year, url, postseason, i, newUrl, data, _i, _a, match, scoreDifference, isHome, teamName, matchName, matchDate, timestamp, databaseResult, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        season = 2015;
                        promiseArray = [];
                        year = 0;
                        _b.label = 1;
                    case 1:
                        if (!(year < 6)) return [3 /*break*/, 10];
                        url = this.baseUrl;
                        /* add current season */
                        url += "seasons[]=" + (season + year);
                        /* add team id */
                        url += "&team_ids[]=" + team_id;
                        postseason = true;
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < 2)) return [3 /*break*/, 9];
                        postseason = !postseason;
                        newUrl = url + "&postseason=" + postseason;
                        newUrl += "&per_page=100"; /* get the maximum allowed per page */
                        console.log(newUrl); /* log URL */
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10000); })];
                    case 3:
                        _b.sent(); /* crawl delay */
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, axios.get(newUrl)];
                    case 5:
                        data = (_b.sent()).data;
                        /* loop through every match in that data */
                        for (_i = 0, _a = data.data; _i < _a.length; _i++) {
                            match = _a[_i];
                            scoreDifference = void 0;
                            isHome = void 0;
                            teamName = void 0;
                            /* if the home team ID is the same as our team ID, our team is the home team,
                            otherwise it's the away team. We use this to calculate the score difference between the two teams */
                            if (match.home_team.id == team_id) {
                                scoreDifference = match.home_team_score - match.visitor_team_score;
                                isHome = true;
                                teamName = match.home_team.full_name;
                            }
                            else {
                                scoreDifference = match.visitor_team_score - match.home_team_score;
                                isHome = false;
                                teamName = match.visitor_team.full_name;
                            }
                            matchName = match.home_team.name + " vs. " + match.visitor_team.name;
                            matchDate = moment(match.date).format("DD-MM-YYYY");
                            timestamp = +moment(match.date).format("X");
                            /* push the returned promise from saveMatchData into an array */
                            promiseArray.push((0, database_1.saveMatchData)(team_id, teamName, timestamp, matchDate, match.home_team_score, match.visitor_team_score, isHome, scoreDifference, matchName));
                        }
                        return [4 /*yield*/, Promise.all(promiseArray)];
                    case 6:
                        databaseResult = _b.sent();
                        console.log("Matches added");
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _b.sent();
                        console.error("Failed to fetch data: " + err_1);
                        return [3 /*break*/, 8];
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9:
                        ++year;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return BallDontLie;
}());
exports.BallDontLie = BallDontLie;
