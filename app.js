const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
let format = require("date-fns/format");
let isValid = require("date-fns/isValid");
let data = null;
const databaseIntialization = async () => {
  try {
    let dbpath = path.join(__dirname, "todoApplication.db");
    data = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at ${dbpath}`);
    });
  } catch (error) {
    console.log(`database error ${error.message}`);
  }
};
databaseIntialization();

const checkRequest = (request, response, next) => {
  const { search_q, status, priority, category, date } = request.query;
  if (status !== undefined) {
    const statusValues = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusValues.includes(status)) {
      request.status = status;
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (priority !== undefined) {
    const priorityValues = ["HIGH", "MEDIUM", "LOW"];
    if (priorityValues.includes(priority)) {
      request.priority = priority;
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }

  //middleware end bracket
  console.log(`status:${status}`);
  console.log(`priority:${priority}`);
};

app.get("/todos/", checkRequest, async (request, response) => {
  const { status = "", priority = "" } = request;
  console.log(`priority in get:${priority}`);
  console.log(`status in get:${status}`);
  const requestQueries = `
    SELECT * FROM todo
    WHERE status LIKE'%${status}%' AND priority LIKE'%${priority}';
    `;
  const detailsArray = await data.get(requestQueries);
  //   response.send({
  //     id: detailsArray.id,
  //     todo: detailsArray.todo,
  //     priority: detailsArray.priority,
  //     status: detailsArray.status,
  //     category: detailsArray.category,
  //     dueDate: detailsArray.due_date,
  //   });
  response.send(detailsArray);
  response.end();
});
