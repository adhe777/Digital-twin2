from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai
from logic import calculate_productivity, detect_risk, simulate_impact

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class RoutineData(BaseModel):
    sleepHours: float
    studyHours: float
    screenTime: float
    mood: int
    role: Optional[str] = "Student"

class SimulationRequest(BaseModel):
    current: RoutineData
    changes: RoutineData

@app.get("/")
def read_root():
    return {"Hello": "Digital Twin AI Service MVP"}

@app.post("/analyze")
def analyze_routine(data: RoutineData):
    score = calculate_productivity(data)
    risk = detect_risk(data)
    return {
        "productivity_score": score,
        "burnout_risk": risk
    }

@app.post("/simulate")
def run_simulation(req: SimulationRequest):
    result = simulate_impact(req.current, req.changes)
    return result

@app.post("/recommend")
def get_recommendations(data: RoutineData):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        score = calculate_productivity(data)
        
        # Use the role provided in the request, ensuring it's valid
        role = data.role.upper() if data.role and data.role.upper() in ["STUDENT", "PROFESSIONAL"] else "STUDENT"
        
        prompt = f"""
        SYSTEM CONSTRAINT (IMPORTANT):
        The user role will always be provided as a fixed value:
        ROLE = "{role}" (value: "STUDENT" or "PROFESSIONAL")
        You must follow the rules for the given role and ignore the other role completely.
        
        INPUT DATA (USE ONLY THESE):
        - Role: {role}
        - Sleep: {data.sleepHours} hours
        - Study/Work: {data.studyHours} hours
        - Screen time: {data.screenTime} hours
        - Mood level: {data.mood}/5
        - Productivity score: {score}/100
        
        ROLE-BASED RULES (STRICT):
        
        IF ROLE = "STUDENT":
        - TONE: Motivational, encouraging, academic, non-stressful.
        - TERMINOLOGY: Use "study sessions", "campus life", "exam prep", "learning focus".
        - Focus ONLY on:
          - Study consistency and quality
          - Balancing social/screen time with learning
          - Exam readiness and syllabus coverage
          - Healthy sleep for memory retention
        - Do NOT mention workplace terms (deadlines, boss, meetings, KPI).
        
        IF ROLE = "PROFESSIONAL":
        - TONE: Professional, efficient, balanced.
        - TERMINOLOGY: Use "work blocks", "productivity", "career growth", "work-life balance".
        - Focus ONLY on:
          - Work efficiency and output
          - Task prioritization
          - Stress management and burnout prevention
          - Disconnecting from work
        - Do NOT mention exams, grades, or study habits.
        
        ANALYSIS OBJECTIVES:
        - Identify productivity patterns
        - Detect inefficiencies in routine
        - Identify early burnout risk (non-medical)
        - Encourage sustainable productivity habits
        
        OUTPUT FORMAT (MANDATORY):
        Return the response in the following structure:
        
        [Brief Insight]
        - One sentence summary tailored strictly to the role.
        
        [Key Observation]
        - Highlight one specific data point (e.g., "Great consistency in sleep" or "Study hours dipped yesterday").
        
        [Actionable Recommendations]
        - 2–3 practical, role-specific suggestions.
        - For STUDENTS: Suggest study techniques (Pomodoro, active recall) or relaxation.
        - For PROFESSIONALS: Suggest blocking distractions, breaks, or boundary setting.
        
        [Motivation/Tip]
        - A short, positive closing remark.
        
        STYLE RULES:
        - Professional yet warm for students; Efficient for professionals.
        - Clear and concise language.
        - No emojis.
        - No diagnoses or predictions.
        - No content unrelated to the given role.
        """
        response = model.generate_content(prompt)
        return {"recommendations": response.text}
    except Exception as e:
        print(f"GENERATION ERROR: {str(e)}")
        return {"recommendations": "AI Service Unavailable. Tip: Sleep more and study consistent hours."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
