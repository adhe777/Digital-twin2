def calculate_productivity(data):
    # MVP Formula: Mood 1-5 scale
    # Productivity = (Study * 10) - (ScreenTime * 2) + (Sleep * 2) + (Mood * 5)
    # Max approx: (12*10) - (0) + (10*2) + (5*5) = 120 + 20 + 25 = 165
    
    raw_score = (data.studyHours * 10) - (data.screenTime * 2) + (data.sleepHours * 2) + (data.mood * 5)
    
    # Normalize approx range -20 to 165 -> 0 to 100
    normalized = ((raw_score + 20) / 185) * 100
    return max(0, min(100, round(normalized)))

def detect_risk(data):
    # Simple Rule Based
    if data.sleepHours < 6 and data.mood < 3:
        return "High"
    if data.studyHours > 10 or data.screenTime > 8:
        return "Medium"
    return "Low"

def simulate_impact(current, changes):
    new_score = calculate_productivity(changes)
    old_score = calculate_productivity(current)
    improvement = new_score - old_score
    new_risk = detect_risk(changes)
    
    return {
        "original_score": old_score,
        "new_score": new_score,
        "improvement": improvement,
        "new_risk": new_risk
    }
