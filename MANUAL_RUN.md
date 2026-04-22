# Manual Run Guide: Digital Twin for Personal Productivity

### 🚀 Automated Startup (Recommended)
You can now start and stop the entire ecosystem using the automated batch files in the root directory:

1. **To Start**: Double-click `launch_digital_twin.bat`. This will open separate windows for MongoDB, AI Service, Backend, and Frontend.
2. **To Stop**: Double-click `quit_digital_twin.bat`. This will clean up all project-related processes.

---

### 🛠️ Step-by-Step Manual Guide
If you prefer to run components individually, follow these steps. Ensure you have **Node.js**, **Python 3**, and **MongoDB Shell** installed.

---

### 1. MongoDB Database
The project needs MongoDB to store user and routine data.
1. Create a folder for data if it doesn't exist (e.g., `data` in the project root).
2. Start MongoDB:
   ```bash
   mongod --dbpath "./data" --bind_ip 127.0.0.1
   ```
   *Standard Port: 27017*

---

### 2. AI Service (FastAPI)
The AI service provides habit analysis and recommendations.
1. Open a terminal in `./ai-service`.
2. Start the service:
   ```bash
   python main.py
   ```
   *Runs on: http://127.0.0.1:8600*

---

### 3. Backend Server (Node.js)
The backend manages user authentication and routine data.
1. Open a terminal in `./server`.
2. Start the server:
   ```bash
   npm run dev
   ```
   *Runs on: http://127.0.0.1:5604*

---

### 4. Frontend Client (React)
The web interface for your Digital Twin.
1. Open a terminal in `./client`.
2. Start the development server:
   ```bash
   npm run dev
   ```
   *Runs on: http://127.0.0.1:5673*

---

### 📂 Port Configuration Summary
- **Frontend**: 5673
- **Backend (API)**: 5604
- **AI Service**: 8600
- **Database**: 27017
