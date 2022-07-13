

/* open websocket connection */
let connection = new WebSocket("wss://3cfofcugg6.execute-api.us-east-1.amazonaws.com/production");

/* when the connection opens, log the event */
connection.onopen = function (event) {
    console.log("Connected: " + JSON.stringify(event));
};

/* when the connection receives a new message (after a team was selected, or a table
was updated), the data from the DynamoDB tables is plotted onto charts using plotly */
connection.onmessage = function (msg) {

    let data = JSON.parse(msg.data);

    /* if the message was received because there was an update in one of the tables,
    only update the chart for that table */
    if (data.type === "UPDATE") {

        getData(data.table_name);


    } else {

        /* update the match data chart if the message specifies it */
        if (data.team_name == currentTeam && 
            (data.table_name === "MatchStats" || data.table_name === "all")) {

            plotMatchData(data);
        }

        /* update the sentiment data chart if the message specifies it */
        if (data.team_name == currentTeam && 
            (data.table_name === "TweetSentiment" || data.table_name === "all")) {
            let sentimentData = data.sentiment_data;

            plotSentiment(sentimentData);
        }
    }
}

/* if an error occurs with the Websocket connection, log the error */
connection.onerror = function (error) {
    console.log("WebSocket Error: " + JSON.stringify(error));
}

/**
 * Function for getting all of the data for the specified table
 * @param {string} tableName, the name of the table: "MatchStats", "TweetSentiment" or "all"
 */
function getData(tableName) {

    /* message to send back to server to retrieve the data for the specified table.
    if the table is "all", all data will be retrieved */
    let msgObject = {
        action: "getData",/* API gateway route */
        team_name: currentTeam,
        table_name: tableName

    };

    /* send the message to the connection*/
    connection.send(JSON.stringify(msgObject));

    /* log result */
    console.log("Message sent: " + JSON.stringify(msgObject));

}

/**
 * Main function for plotting the chart for match data 
 * as well as predictions about future matches.
 * @param {JSON} data, a JSON object containing all of the data required for plotting the chart
 */
async function plotMatchData(data) {
    let matchData = data.match_data;
    let predictedData = data.prediction_data;

    let datapointText = [];

    /* create an array containing details about each data point for the chart */
    for (let i = 0; i < matchData.match_names.length; i++) {
        datapointText[i] = matchData.match_names[i] + '<br>' + matchData.home_scores[i] + ' : ' + matchData.visitor_scores[i] + '</br>';
    }

    /* data structure containing the match data for the plotly chart */
    let actualData = {

        x: matchData.match_dates,
        y: matchData.score_differences,
        type: 'scatter',
        mode: 'lines',
        hovertemplate: '%{text}' +
            '<i>%{x}</i>',
        text: datapointText,
        name: "Score Data",
        marker: {
            color: getRgbVal(matchData.team_name),
            size: 8
        }
    };

    /* mean predicted values */
    let meanPredicted = {

        x: predictedData.dates,
        y: predictedData.mean,
        type: 'scatter',
        mode: 'lines',
        hovertemplate: '<i>%{x}</i>',
        text: predictedData.mean,
        name: "Predicted mean",
        marker: {
            color: 'rgb(30,144,255)',
            size: 8
        }
    };

    /* upper quantile (0.9%) */
    let upperPredicted = {

        x: predictedData.dates,
        y: predictedData.upper,
        type: 'scatter',
        mode: 'lines',
        hovertemplate: '<i>%{x}</i>',
        text: predictedData.mean,
        name: "Predicted upper (0.9%)",
        marker: {
            color: 'rgb(255,0,255)',
            size: 8
        }
    };

    /* lower quantile (0.1%) */
    let lowerPredicted = {

        x: predictedData.dates,
        y: predictedData.lower,
        type: 'scatter',
        mode: 'lines',
        hovertemplate: '<i>%{x}</i>',
        text: predictedData.mean,
        name: "Predicted lower (0.1%)",
        marker: {
            color: 'rgb(153,153,0)',
            size: 8
        }
    };

    let plotData = [actualData, meanPredicted, upperPredicted, lowerPredicted];

    /* data structure containing layout details for the plotly chart */
    let layout = {
        title: {
            text: "<b>" + matchData.team_name + " Score Difference Over Time</b>",
            font: {
                size: 25,
                color: 'rgb(0, 0, 0)'
            }
        },

        xaxis: {
            title: {
                text: '<b>DATE</b>',
                font: {
                    size: 25,
                    color: 'rgb(0, 0, 0)'
                },
                standoff: 25,
                automargin: true

            },
            font: {
                size: 12,
                color: 'rgb(0, 0, 0)'
            }
        },
        yaxis: {
            title: {
                text: '<b>SCORE DIFFERENCE</b>',
                font: {
                    size: 25,
                    color: 'rgb(0, 0, 0)'
                }
            },
            font: {
                size: 12,
                color: 'rgb(0, 0, 0)'
            }

        },
        hoverlabel: {
            align: 'auto'
        },
        paper_bgcolor: 'rgba(255, 255, 255, 0.8)',
        width: window.innerWidth * 0.6,
        height: 500,
        margin: {
            l: 130,
            r: 50,
            b: 150,
            t: 130,
            pad: 4
        },
        legend: {
            font: {
                size: 12
            }
        }
    };

    /* plot the chart into a div on the page */
    Plotly.newPlot('chart', plotData, layout);
    document.getElementById('chart').style.borderStyle = "solid";
    document.getElementById("chart").style.boxShadow = "5px 5px 5px " + getRgbVal(matchData.team_name);

};

/**
 * Main function for plotting the sentiment data onto a chart
 * @param {JSON} data, JSON object containing the sentiment data 
 */
async function plotSentiment(data) {

    let dates = convertToDates(data.timestamp); /* convert timestamps to dates */

    /* data structure for plotting the sentiment data onto a stacked area chart */
    let stackedAreaTraces = [

        {
            x: dates,
            y: data.negative,
            groupnorm: 'percent',
            stackgroup: 'one',
            name: "Negative"
        },
        {
            x: dates,
            y: data.neutral,
            stackgroup: 'one',

            name: "Neutral"
        },
        {
            x: dates,
            y: data.positive,
            stackgroup: 'one',
            name: "Positive"
        }
    ];

    /* data structure containing layout details for the plotly chart */
    let layout = {

        title: {

            text: "<b>Twitter Sentiment Over Time</b>",
            font: {
                size: 25,
                color: 'rgb(0, 0, 0)',
                family: "Courier New",
                weight: "bold"
            },
        },

        xaxis: {
            title: {
                text: '<b>DATE</b>',
                font: {
                    size: 25
                },
                standoff: 25,
                automargin: true

            },
            font: {
                size: 12
            }
        },
        yaxis: {
            title: {
                text: '<b>SENTIMENT (%)</b>',
                font: {
                    size: 25
                },

            },
            font: {
                size: 12
            }

        },
        hoverlabel: {
            align: 'auto'
        },
        paper_bgcolor: 'rgba(255, 255, 255, 0.8)',
        width: window.innerWidth * 0.6,
        height: 500,
        margin: {
            l: 130,
            r: 50,
            b: 100,
            t: 100,
            pad: 4
        },
        legend: {
            font: {
                size: 12
            }
        }
    }

    /* plot the chart into the div on the page */
    Plotly.newPlot('sentimentChart', stackedAreaTraces, layout);
    document.getElementById('sentimentChart').style.borderStyle = "solid";
    document.getElementById("sentimentChart").style.boxShadow = "5px 5px 5px " + getSecondaryRgb(data.team);
}

let currentTeam;

/**
 * Function called when a team is selected; responsible for 
 * @param {string} team, the current team whose data is being displayed
 */
function showData(team) {
    currentTeam = team;
    changeBackground(currentTeam);
    hideDropdown();
    document.getElementById("dropdown").style.left = "40%";
    document.getElementById("dropdown").style.top = "130px";

    if (!document.getElementById("description").classList.contains("hide"))
        document.getElementById("description").classList += " hide";

    hideDropdown();

    getData("all");
}

/**
 * Shows the team select options, simulating a dropdown menu
 */
function dropdown() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}
/**
 * Hides the select team buttons.
 * Called when the user clicks anywhere on the screen
 */
function hideDropdown() {

    let dropdownItems = document.getElementsByClassName("dropdown-links");
    let currentItem;

    /* hide every team select button */
    for (let i = 0; i < dropdownItems.length; i++) {
        currentItem = dropdownItems[i];

        if (currentItem.classList.contains('show')) {
            currentItem.classList.remove('show');
        }
    }
}

window.onclick = hideDropdown(); /* if the user clicks somewhere on the page, the dropdown buttons hide */

/**
 * Converts unix timestamps to dates for the chart
 * @param {int[]} timestamps, array containing the timestamps 
 * @returns an array containing the dates
 */
function convertToDates(timestamps) {
    let dates = [];

    for (let i = 0; i < timestamps.length; i++)
        dates[i] = new Date(timestamps[i] * 1000);


    return dates;
}

/**
 * Helper function to get the RGB value of the secondary colour of the current team
 * @param {string} team, the current team whose data is being displayed
 * @returns a string containing the RGB value
 */
function getSecondaryRgb(team) {
    let rgb;

    if (team === "Atlanta Hawks")
        rgb = 'rgba(225, 255, 255, 1)'; /* white */
    else if (team === "Boston Celtics")
        rgb = 'rgba(255, 255, 255, 1)'; /* white */
    else if (team === "76ers" || team === "Philadelphia 76ers")
        rgb = 'rgba(206, 17, 65, 1)'; /* red */
    else if (team === "Chicago Bulls")
        rgb = 'rgba(0, 0, 0, 1)'; /* black */
    else if (team === "Brooklyn Nets")
        rgb = 'rgba(0, 0, 0, 1)'; /* black */

    return rgb;
}

/**
 * Helper function to change the background colour depending on what team is currently chosen
 * @param {string} team, the current team whsoe data is being displayed
 */
function changeBackground(team) {
    //document.body.style.backgroundImage = "linear-gradient(to bottom right, " + getRgbVal(team) + ", " + getSecondaryRgb(team) + ")";
    document.getElementById("team-logo").src = "./images/" + team.toLowerCase().replace(" ", "_") + ".png";
}

/**
 * Gets the RGB for the primary colour of the current team
 * @param {string} team, the team whose data is currently being displayed 
 * @returns a string containing the RGB values for the team
 */
function getRgbVal(team) {
    let rgb;

    if (team === "Atlanta Hawks")
        rgb = 'rgba(225, 68, 52, 1)'; /* red */
    else if (team === "Boston Celtics")
        rgb = 'rgba(0, 122, 51, 1)'; /* green */
    else if (team === "76ers" || team === "Philadelphia 76ers")
        rgb = 'rgba(0, 107, 182, 1)'; /* blue */
    else if (team === "Chicago Bulls")
        rgb = 'rgba(206, 17, 65, 1)'; /* red */
    else if (team === "Brooklyn Nets")
        rgb = 'rgba(105,105,105, 1)'; /* grey */

    return rgb;
}
