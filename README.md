# 📱 USSD Data Collection Service (Node.js + PostgreSQL + Africastalking)

This project implements a **USSD service** for data clerks to register and view entries (patients) using Africastalking’s USSD gateway.  
Data is stored in **PostgreSQL (Neon cloud-hosted DB)**, accessed via a **Node.js + Express server**, and deployed on **Vercel**.  

---

## 🚀 Features
- Menu-driven USSD flow
- Clerk can register patient details
- View submitted entries (count)
- Data stored in PostgreSQL
- Deployed on Vercel, accessible via Africastalking callback URL

---

## 📋 Prerequisites

Before starting, make sure you have:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/)
- A [Neon](https://neon.tech/) Postgres account
- An [Africastalking](https://africastalking.com/) developer account
- A free [Vercel](https://vercel.com/) account

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
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


7. Environment Variables

In .env.local (or Vercel Environment Variables):

DATABASE_URL=postgres://<USER>:<PASSWORD>@ep-xxxxxx-pooler.c-2.us-east-1.aws.neon.tech/ussd_db?sslmode=require

8. Run Locally
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