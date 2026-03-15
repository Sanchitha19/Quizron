from openai import OpenAI
from django.conf import settings
import json

# The key provided (gsk_...) is a Groq key, so we use Groq's base URL
# while maintaining the 'Grok' naming requested by the user.
client = OpenAI(
    api_key=settings.GROK_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def generate_quiz_questions(topic, num_questions, difficulty):
    prompt = f"""
Generate EXACTLY {num_questions} multiple choice quiz questions.

Topic: {topic}
Difficulty: {difficulty}

Rules:

* Each question must have 4 options
* Only one correct answer
* Provide explanation
* Return ONLY JSON

Format:

[
{{
"text": "Question",
"options": ["A","B","C","D"],
"correct_index": 0,
"explanation": "Why this answer is correct"
}}
]
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a professional quiz generator. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    text = response.choices[0].message.content

    try:
        # Clean up possible markdown wrapping
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        questions = json.loads(text)
        return questions
    except Exception:
        raise ValueError("AI returned invalid JSON")

def generate_cheatsheet(topic, difficulty, score, wrong_questions):
    wrong_section = ""
    if wrong_questions:
        wrong_section = "\n".join([
            f"- Q: {q['text']}\n  Correct: {q['correct_answer']}\n  Why: {q['explanation']}"
            for q in wrong_questions
        ])
    else:
        wrong_section = "None — perfect score!"

    prompt = f"Topic: {topic}\nDifficulty: {difficulty}\nScore: {score:.1f}%\nWrong Questions: {wrong_section}\n\nGenerate a comprehensive markdown study guide."

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()
