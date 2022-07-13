/* axios will handle HTTP requests to web service */
const axios = require('axios');
const predictions = require('synthetic_predictions.json');

/* my student ID to get unique synthetic data */
let studentID = 'M00521789';

/* synthetic data URL */
let url = 'https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/';

/* authentication details for Plotly */
const PLOTLY_USERNAME = 'samcdonovan';
const PLOTLY_KEY = 'KeNXeNkDds8Ns0b85fni';

/* initialize Plotly with user details */
let plotly = require('plotly')(PLOTLY_USERNAME, PLOTLY_KEY);

exports.handler = async (event) => {
    try {

        /* retrieve synthetic data */
        let yValues = (await axios.get(url + studentID)).data.target;

        /* add hourly values to array for x axis */
        let xValues = [];
        for (let i = 0; i < yValues.length; ++i) {
            xValues.push(i);
        }

        /* call function to plot data */
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

/**
 * Function to plot synthetic data
 * @param {string} studentID, my student ID
 * @param {int[]} xValues, the X axis values 
 * @param {double[]} yValues, the Y axis values 
 * @returns a promise for plotting the chart
 */
async function plotData(studentID, xValues, yValues) {

    /* data structure containing the synthetic data */
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

    /* create hourly X axis valeus for the predictions */
    let predictionX = [];
    for (let i = yValues.length; i < yValues.length + predictions.mean.length; ++i) {
        predictionX.push(i);
    }

    /* data structure containing the prediction data */
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

    /* data structure containing the lower quantile predictions */
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

    /* data structure containing the upper quantile predictions */
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

    /* layout details for the chart */
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