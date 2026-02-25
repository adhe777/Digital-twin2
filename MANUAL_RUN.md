# Manual Run Guide: Digital Twin for Personal Productivity

Follow these steps to start all components manually. Ensure you have **Node.js**, **Python 3**, and **MongoDB Shell** installed.

---

### 1. MongoDB Database
The project needs MongoDB to store user and routine data.
1. Create a folder for data if it doesn't exist (e.g., `data` in the project root).
2. Start MongoDB (adjust the path if your installation is different):
   ```bash
   mongod --dbpath "./data" --bind_ip 127.0.0.1
   ```
   *Standard Port: 27017*

---

### 2. Backend Server (Node.js)
The backend manages user authentication and routine data.
1. Open a terminal in `./server`.
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node index.js
   ```
   *Runs on: http://127.0.0.1:5002*

---

### 3. AI Service (FastAPI)
The AI service provides habit analysis and recommendations.
1. Open a terminal in `./ai-service`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the service:
   ```bash
   py main.py
   ```
   *Runs on: http://127.0.0.1:8000*

---

### 4. Frontend Client (React)
The web interface for your Digital Twin.
1. Open a terminal in `./client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Runs on: http://localhost:5173* (Standard Vite port)

---

### 📂 Port Configuration Summary
- **Frontend**: 5173
- **Backend (API)**: 5002
- **AI Service**: 8000
- **Database**: 27017
