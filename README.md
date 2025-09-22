📱 USSD Data Collection Service (Node.js + PostgreSQL + Africastalking)

This project implements a USSD service for data clerks to register and view entries (patients) using Africastalking’s USSD gateway.
Data is stored in PostgreSQL (Neon cloud-hosted DB), accessed via a Node.js + Express server, and deployed on Vercel.

🚀 Features

Menu-driven USSD flow

Clerk can register patient details

View submitted entries (count)

Data stored in PostgreSQL

Deployed on Vercel, accessible via Africastalking callback URL

📋 Prerequisites

Before starting, make sure you have:

Node.js
 (v18+ recommended)

Git

A Neon
 Postgres account

An Africastalking
 developer account

A free Vercel
 account

🛠️ Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/ussd-service.git
cd ussd-service

2. Initialize Node.js Project

If starting fresh:

npm init -y

3. Install Required Packages
npm install express body-parser pg africastalking


For local dev testing:

npm install --save-dev nodemon

4. Setup Database (Neon PostgreSQL)
a. Create Database

Log in to Neon

Create a new project → new database named ussd_db

b. Get Connection String

Copy the connection string from Neon Dashboard:

postgres://<USER>:<PASSWORD>@ep-xxxxxxx-pooler.c-2.us-east-1.aws.neon.tech/ussd_db?sslmode=require


⚠️ Remove &channel_binding=require if it’s in the URL (Node pg does not support it).

c. Create Tables

Connect via terminal:

psql "postgres://<USER>:<PASSWORD>@ep-xxxxxxx-pooler.c-2.us-east-1.aws.neon.tech/ussd_db?sslmode=require"


Inside psql, run:

CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    clerk_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_age INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


(Optional: create a clerks table if you want strict clerk validation.)

5. Project Structure
ussd-service/
│── index.js        # Main Express server
│── db.js           # Database connection
│── package.json

6. Database Connection (db.js)
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;

7. Express Server (index.js)
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

// Africastalking setup (optional, if you want SMS/Payments later)
const africastalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY || "dummy",
  username: process.env.AT_USERNAME || "sandbox"
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// USSD endpoint
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
        if (err) {
          console.error("DB Error:", err);
          response = `END Error saving entry`;
        } else {
          response = `END Data entry completed ✅`;
        }
        res.set("Content-Type", "text/plain");
        res.send(response);
      }
    );
    return;
  } else if (text === "2") {
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
    return;
  } else {
    response = `END Invalid choice.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// Run locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`USSD app running on port ${PORT}`));

8. Environment Variables

In .env.local (or Vercel Environment Variables):

DATABASE_URL=postgres://<USER>:<PASSWORD>@ep-xxxxxx-pooler.c-2.us-east-1.aws.neon.tech/ussd_db?sslmode=require
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=sandbox   # or your AT username

9. Run Locally
node index.js


Or with hot-reload:

npx nodemon index.js


Test with curl:

curl -X POST http://localhost:3000/ussd \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=12345&phoneNumber=+254700000000&text="

🔗 10. Deploy to Vercel

Push your project to GitHub

Connect repo to Vercel

Set Environment Variables in Vercel (DATABASE_URL, AT_API_KEY, AT_USERNAME)

Deploy

After deployment, note your endpoint:
https://your-app-name.vercel.app/ussd

📡 11. Configure Africastalking

Log in to Africastalking Sandbox

Add a new USSD service

Set callback URL to your deployed endpoint:

https://your-app-name.vercel.app/ussd


Now when you dial the sandbox USSD code, it will hit your endpoint.

🧪 12. Testing

Dial the USSD sandbox code provided in AT (like *384*123#)

Register an entry (clerk → patient name → patient age)

Then choose option 2 to view submitted entries

Verify in Postgres:

SELECT * FROM entries;

✅ Troubleshooting

DB Error: ENOTFOUND base → Fix DATABASE_URL, remove channel_binding=require

Foreign key violation → Insert clerk into clerks table first, or drop FK

AT default message “network experiencing issues” → Ensure /ussd route exists and is public on Vercel

No entries shown → Check your Postgres with SELECT * FROM entries;

📌 Next Steps / Improvements

Add proper clerk registration flow

Show actual patient details (paginated) instead of just counts

Add SMS confirmation after saving an entry

Add authentication for clerks

👨‍💻 Built with ❤️ using Node.js, Express, PostgreSQL (Neon), and Africastalking USSD.