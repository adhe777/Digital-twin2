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
        model = genai.GenerativeModel('gemini-1.5-flash')
        score = calculate_productivity(data)
        
        # Use the role provided in the request, ensuring it's valid
        role_raw = data.role or "Student"
        role = role_raw.upper() if role_raw.upper() in ["STUDENT", "PROFESSIONAL"] else "STUDENT"
        
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
        - Identify productivity patterns and provide a friendly, supportive daily insight.
        
        OUTPUT FORMAT (MANDATORY):
        Return ONLY a 2–3 line message.
        Tone: Friendly and supportive.
        No headers, no bullet points, just the message.
        
        Example Output:
        "You performed well today, but your sleep is low. Try getting at least 7 hours to improve focus."
        
        STYLE RULES:
        - Professional yet warm for students; Efficient for professionals.
        - Clear and concise language.
        - No emojis.
        """
        response = model.generate_content(prompt)
        # Safe text extraction
        rec_text = response.text if response and hasattr(response, 'text') else "AI Service Unavailable. Tip: Focus on consistent sleep and study hours."
        return {"recommendations": rec_text}
    except Exception as e:
        print(f"GENERATION ERROR: {str(e)}")
        return {"recommendations": "AI Service Unavailable. Tip: Sleep more and study consistent hours."}

class ChatRequest(BaseModel):
    message: str
    data: RoutineData

@app.post("/chat")
def chat_with_twin(req: ChatRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Safer role extraction
        role_raw = req.data.role or "Student"
        role = role_raw.upper() if role_raw.upper() in ["STUDENT", "PROFESSIONAL"] else "STUDENT"
        
        context_prompt = f"""
        You are "Aura", the User's Digital Twin Assistant.
        Role: {role}
        Current User Data:
        - Sleep: {req.data.sleepHours}h
        - Study/Work: {req.data.studyHours}h
        - Screen Time: {req.data.screenTime}h
        - Mood: {req.data.mood}/5
        
        TASK:
        Provide direct, factual, and data-driven answers based ONLY on the provided stats.
        If the user asks about their performance, refer to the exact numbers above.
        Be helpful and concise (under 2 sentences). Avoid generic conversational filler.
        """
        
        response = model.generate_content([context_prompt, req.message])
        # Safe text extraction
        chat_response = response.text if response and hasattr(response, 'text') else "I'm having trouble processing that right now. Let's try again in a moment."
        return {"response": chat_response}
    except Exception as e:
        print(f"CHAT ERROR: {str(e)}")
        return {"response": "I'm having trouble connecting to my brain right now, but I'm still here for you!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
