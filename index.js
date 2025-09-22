const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

// Africastalking setup (optional, for SMS/Payments if needed)
const africastalking = require("africastalking")({
  apiKey: "YOUR_API_KEY",
  username: "YOUR_USERNAME"
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// USSD entry endpoint
app.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "";
  const textArray = text.split("*");
  const userInput = textArray[textArray.length - 1]; // latest input

  // Menu logic
  if (text === "") {
    // First screen
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
    // ✅ Save to Postgres
    const [choice, clerkId, patientName, patientAge] = textArray;

    pool.query(
      "INSERT INTO entries (clerk_id, patient_name, patient_age, phone_number) VALUES ($1, $2, $3, $4)",
      [clerkId, patientName, patientAge, phoneNumber],
      (err, result) => {
        if (err) {
          console.error("DB Error:", err);
        } else {
          console.log("Data saved successfully");
        }
      }
    );

    response = `END Data entry completed ✅`;
  } else if (text === "2") {
    // Example: show number of records from DB
    pool.query("SELECT COUNT(*) FROM entries", (err, result) => {
      if (err) {
        console.error(err);
        response = `END Error fetching records`;
      } else {
        const count = result.rows[0].count;
        response = `END You have submitted ${count} records.`;
      }
      res.set("Content-Type", "text/plain");
      res.send(response);
    });
    return; // stop here so we don’t send twice
  } else {
    response = `END Invalid choice.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`USSD app running on port ${PORT}`));
