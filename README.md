🚀 BFHL Hierarchy API (Full Stack)

A full-stack Node.js application that processes hierarchical node relationships, detects cycles, and generates structured tree insights via a REST API with an interactive frontend.

---

📌 Project Overview

This project is built as part of the SRM Full Stack Engineering Challenge.

It accepts a list of node relationships (e.g., "A->B") and:

- Validates input
- Removes duplicates
- Constructs hierarchical trees
- Detects cycles
- Calculates depth
- Returns structured JSON output

---

🧠 Features

- ✅ Input validation (strict format checking)
- ✅ Duplicate edge detection
- ✅ Tree construction using graph logic
- ✅ Cycle detection using DFS
- ✅ Depth calculation for trees
- ✅ Summary generation
- ✅ REST API with JSON response
- ✅ Interactive frontend UI

---

🏗️ Tech Stack

Backend:

- Node.js
- Express.js
- CORS

Frontend:

- HTML
- CSS
- JavaScript

⚙️ API Specification

Endpoint:

POST /bfhl

Request Body:

{
  "data": ["A->B", "A->C", "B->D"]
}

Response Example:

{
  "user_id": "felixmathew_ddmmyyyy",
  "email_id": "your_email@srmist.edu.in",
  "college_roll_number": "RA231102802XXXX",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}

---

🔍 Processing Rules

- Input must follow format: "X->Y" (single uppercase letters)
- Invalid entries are stored in "invalid_entries"
- Duplicate edges stored in "duplicate_edges"
- Multi-parent nodes keep first parent only
- Cycles return:

{
  "tree": {},
  "has_cycle": true
}

- Depth = longest root-to-leaf path

---

🖥️ Frontend

- Input field to enter node relationships
- Submit button to call API
- Displays:
  - Tree structure
  - Cycles
  - Summary
- Error handling for failed API calls

---

🚀 How to Run Locally

1. Clone Repository

git clone https://github.com/FelixMathew/bfhl-hierarchy-api.git
cd bfhl-hierarchy-api

---

2. Run Backend

cd backend
npm install
node server.js

Server runs on:

http://localhost:3000

---

3. Run Frontend

Open:

frontend/index.html

---

🌐 Deployment

You can deploy using:

- Render (Backend)
- Vercel / Netlify (Frontend)

---

📊 Evaluation Notes

- API response time < 3 seconds
- Supports up to 50 nodes
- CORS enabled
- No hardcoded responses

---

👤 Author

Felix Mathew
SRM Institute of Science and Technology

---

📌 Submission Links

- 🔗 Backend API: https://bfhl-hierarchy-api.vercel.app/
- 🔗 Frontend URL: https://hierarchy-api-frontend.vercel.app/
- 🔗 GitHub Repo: https://github.com/FelixMathew/bfhl-hierarchy-api

---

⭐ Final Note

This project demonstrates:

- Strong problem-solving
- Graph-based algorithm implementation
- Full-stack development skills

---
