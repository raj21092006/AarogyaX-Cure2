import os

from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
from google import genai


load_dotenv()

assistant_bp = Blueprint("assistant", __name__)


# ============================================================
# GEMINI CLIENT
# ============================================================

API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if API_KEY:
    client = genai.Client(api_key=API_KEY)


# ============================================================
# AI HEALTH ASSISTANT
# ============================================================

@assistant_bp.route("/", methods=["POST"])
def ask_assistant():

    try:
        data = request.get_json() or {}

        message = data.get("message")
        language = data.get("language", "English")

        if not message:
            return jsonify({
                "status": "error",
                "message": "Message is required"
            }), 400

        if not client:
            return jsonify({
                "status": "error",
                "message": "Gemini API key is not configured"
            }), 500

        system_instruction = """
You are AarogyaX Cure AI Health Assistant.

Your job is to provide general health information and safe guidance.

Rules:
1. Do not claim to diagnose a disease.
2. Do not prescribe medicines or dosages.
3. If symptoms appear serious or life-threatening, advise the user
   to seek emergency medical help immediately.
4. Keep answers simple and understandable.
5. Encourage consultation with a qualified doctor when appropriate.
6. Never pretend to be a doctor.
7. Respond in the language requested by the user.
"""

        prompt = f"""
{system_instruction}

Preferred language:
{language}

User question:
{message}

Give a helpful, concise and safe response.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        answer = response.text

        return jsonify({
            "status": "success",
            "message": "AI response generated successfully",
            "assistant": {
                "response": answer,
                "language": language
            }
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": "Failed to generate AI response",
            "error": str(e)
        }), 500