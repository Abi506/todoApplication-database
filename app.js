const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
app.use(express.json());
const jwt = require("jsonwebtoken");
let data = null;
const databaseIntialization = async () => {
  try {
    let dbPath = path.join(__dirname, "todoApplication.db");
    data = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at ${dbPath}`);
    });
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
};
databaseIntialization();
//creating logger
// const logger = (request, response, next) => {
//   const header = request.headers["authorization"];
//   if (header === undefined) {
//     response.status(401);
//     response.send("Invalid JWT Token");
//   } else {
//     let jwtToken = header.split(" ")[1];
//     jwt.verify(jwtToken, "My_TOKEN", async (error, payload) => {
//       if (error) {
//         response.status(401);
//         response.send("Invalid JWT Token");
//       } else {
//         next();
//       }
//     });
//   }
// };

//user get
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let getDetailsQuery = "";
  switch (true) {
    case status !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' and status='${status}'
        `;
      break;

    case priority !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%' AND priority='${priority}'
        `;
      break;
    case priority !== undefined && status !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%' AND priority='${priority}' AND status='${status}'
        `;
      break;
    case category !== undefined && status !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%' AND category='${category}' AND status='${status}'
        `;
    case category !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%' AND category='${category}';
        `;
    case category !== undefined && priority !== undefined:
      getDetailsQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' AND category='${category}' AND priority='${priority}'
        `;
    default:
      getDetailsQuery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%'
        `;
  }
  const getDetailsArray = await data.get(getDetailsQuery);
  response.send(getDetailsArray);
});

module.exports = app;
