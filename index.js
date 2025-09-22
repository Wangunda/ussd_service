// index.js
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// USSD entry endpoint
app.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "";
  const textArray = text.split("*");

  if (text === "") {
    response = `CON Welcome to Data Collection
1. Register new entry
2. View submitted entries`;
  } else if (text === "1") {
    response = `CON Enter clerk ID:`;
  } else if (textArray.length === 2) {
    response = `CON Enter patient name:`; 
  } else if (textArray.length === 3) {
    response = `CON Enter patient age:`; 
  } else if (textArray.length === 4) {
    const [choice, clerkId, patientName, patientAge] = textArray;

    pool.query(
      "INSERT INTO entries (clerk_id, patient_name, patient_age, phone_number) VALUES ($1, $2, $3, $4)",
      [clerkId, patientName, patientAge, phoneNumber],
      (err) => {
        if (err) console.error("DB Error:", err);
      }
    );

    response = `END Data entry completed ✅`;
  } else if (text === "2") {
    pool.query("SELECT COUNT(*) FROM entries", (err, result) => {
      if (err) {
        response = `END Error fetching records`;
      } else {
        response = `END You have submitted ${result.rows[0].count} records.`;
      }
      res.set("Content-Type", "text/plain");
      res.send(response);
    });
    return;
  } else {
    response = `END Invalid choice.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// 👇 Export instead of app.listen()
module.exports = app;
