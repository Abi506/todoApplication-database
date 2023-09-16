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

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (date !== undefined) {
    const myDate = new Date(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log(`formatted-Date${formattedDate}`);
    const result = isValid(formattedDate);
    if (result === true) {
      request.date = formattedDate;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  next();
  //middleware end bracket
  console.log(`status:${status}`);
  console.log(`priority:${priority}`);
};

app.get("/todos/", checkRequest, async (request, response) => {
  const { status = "", priority = "", search_q = "", category = "" } = request;
  console.log(`priority in get:${priority}`);
  console.log(`status in get:${status}`);
  const requestQueries = `
    SELECT id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate FROM todo
    WHERE todo LIKE '%${search_q}%' AND category LIKE '%${category}%' AND status LIKE'%${status}%' AND priority LIKE'%${priority}';
    `;
  const detailsArray = await data.all(requestQueries);
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
module.exports = app;
