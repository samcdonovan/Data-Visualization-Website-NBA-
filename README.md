<h1 align="center">Data Visualisation Website (NBA)</h1>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> A price comparison website, centered around video games. Displays the price tags of a particular title from various websites.
    <br> 
</p>

## 📝 Table of Contents
- [About](#about)
- [Libraries/Frameworks/Services](#built_using)
- [Authors](#authors)

## ℹ️ About <a name = "about"></a>

This website allows the user to view charts displaying data about different teams that are currently playing in the NBA. The types of data that are displayed are numerical data (score difference for each match), predictions about that numerical data (score difference for future matches) and the results of sentiment analysis of Tweets (about the teams). The data for these teams was extracted from the free API service BallDontLie (https://www.balldontlie.io/#introduction). This included information about each match: mainly the scores, the team they were playing against, and the date of the match. A Twitter Developer account was required to collect the Tweets about each team for sentiment analysis. 

## 💻 Libraries/Frameworks/Services <a name = "built_using"></a>
## AWS
- [Sagemaker](https://aws.amazon.com/sagemaker/): Machine learning with the DeepAR algorithm, used for predictions about future data
- [Comprehend](https://aws.amazon.com/comprehend/): Machine learning sentiment analysis tool, used to generate sentiment values for Tweets about the NBA teams
- [WebSockets](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html): For connecting multiple users to the website and updating the graph plots when new data is inserted in the database
- [DynamoDB](https://aws.amazon.com/dynamodb/): For storing data about the teams, predictions for that data, WebSocket connection IDs, Tweets and sentiment values of those Tweets
- [S3](https://aws.amazon.com/s3/): For storing all public files for the front-end of the website, and hosting the website on a public UR
- [Lambda](https://aws.amazon.com/lambda/): Used multiple Lambda triggers: on client connection, connection ID is inserted into a table; on client disconnection, connection ID is deleted from the table; when new data is inserted or deleted, it is then resent to all connected clients; when new prediction data is created, it is resent to all connected clients
## JavaScript
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Axios](https://axios-http.com/): For sending GET requests to the BallDontLie API and retrieving data
- [Plotly](https://plotly.com/): Plotting data in real-time on the front-end

## ✍️ Authors <a name = "authors"></a>
- [@samcdonovan](https://github.com/samcdonovan)
