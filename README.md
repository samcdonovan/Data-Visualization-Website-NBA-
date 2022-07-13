# Data-Visualization-Website-NBA
This website allows the user to view charts displaying data about different teams that are currently playing in the NBA. The types of data that are displayed are numerical data (score difference for each match), predictions about that numerical data (score difference for future matches) and the results of sentiment analysis of Tweets (about the teams). The data for these teams was extracted from the free API service BallDontLie (https://www.balldontlie.io/#introduction). This included information about each match: mainly the scores, the team they were playing against, and the date of the match. A Twitter Developer account was required to collect the Tweets about each team for sentiment analysis. 

# Libraries/Frameworks/Services
## AWS
- Sagemaker: Machine learning with the DeepAR algorithm, used for predictions about future data
- Comprehend: Machine learning sentiment analysis tool, used to generate sentiment values for Tweets about the NBA teams
- WebSockets: For connecting multiple users to the website and updating the graph plots when new data is inserted in the database
- DynamoDB: For storing data about the teams, predictions for that data, WebSocket connection IDs, Tweets and sentiment values of those Tweets
- S3: For storing all public files for the front-end of the website, and hosting the website on a public UR
- Lambda: Used multiple Lambda triggers: on client connection, connection ID is inserted into a table; on client disconnection, connection ID is deleted from the table; when new data is inserted or deleted, it is then resent to all connected clients; when new prediction data is created, it is resent to all connected clients
## JavaScript
- Node.js
- Axios: For sending GET requests to the BallDontLie API and retrieving data
- Plotly: Plotting data in real-time on the front-end
