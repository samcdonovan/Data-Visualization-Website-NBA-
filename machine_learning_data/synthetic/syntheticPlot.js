//Axios will handle HTTP requests to web service
const axios = require('axios');
const predictions = require('synthetic_predictions.json');

//The ID of the student's data that I will download
let studentID = 'M00521789';

//URL where student data is available
let url = 'https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/';

//Authentication details for Plotly
//ADD YOUR OWN AUTHENTICATION DETAILS
const PLOTLY_USERNAME = 'samcdonovan';
const PLOTLY_KEY = 'KeNXeNkDds8Ns0b85fni';

//Initialize Plotly with user details.
let plotly = require('plotly')(PLOTLY_USERNAME, PLOTLY_KEY);

exports.handler = async (event) => {
    try {

        console.log(Object.keys(predictions.quantiles));

        //console.log("Predictions: " + JSON.stringify(predictions.predictions));
        //Get synthetic data
        let yValues = (await axios.get(url + studentID)).data.target;

        //Add basic X values for plot
        let xValues = [];
        for (let i = 0; i < yValues.length; ++i) {
            xValues.push(i);
        }

        //Call function to plot data
        let plotResult = await plotData(studentID, xValues, yValues);
        console.log("Plot for student '" + studentID + "' available at: " + plotResult.url);

        return {
            statusCode: 200,
            body: "Ok"
        };
    }
    catch (err) {
        console.log("ERROR: " + err);
        return {
            statusCode: 500,
            body: "Error plotting data for student ID: " + studentID
        };
    }
};

//Plots the specified data
async function plotData(studentID, xValues, yValues) {
    //Data structure
    let studentData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: 'line',
        name: studentID,
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };
    //Add basic X values for plot
    let predictionX = [];
    for (let i = yValues.length; i < yValues.length + predictions.mean.length; ++i) {
        predictionX.push(i);
    }

    let predictionData = {
        x: predictionX,
        y: predictions.mean,
        type: "scatter",
        mode: "line",
        name: "Predictions",
        marker: {
            color: 'rgb(30, 144, 255)',
            size: 12
        }
    }

    let lowerQuantile = {
        x: predictionX,
        y: predictions.quantiles["0.1"],
        type: "scatter",
        mode: "line",
        name: "0.1%",
        marker: {
            color: 'rgb(255, 255, 0)',
            size: 12
        }
    }

    let upperQuantile = {
        x: predictionX,
        y: predictions.quantiles["0.9"],
        type: "scatter",
        mode: "line",
        name: "0.9%",
        marker: {
            color: 'rgb(0, 128, 0)',
            size: 12
        }
    }

    let data = [studentData, predictionData, lowerQuantile, upperQuantile];

    let layout = {
        title: "Synthetic Data (" + studentID + ")",
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };

    let graphOptions = {
        layout: layout,
        filename: "date-axes",
        fileopt: "overwrite"
    };

    return new Promise((resolve, reject) => {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err)
                reject(err);
            else {
                resolve(msg);
            }
        });
    });
};

exports.handler({});