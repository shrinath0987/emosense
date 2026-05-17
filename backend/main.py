from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import anthropic
import os
import base64
import tempfile
import json
import io
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key="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")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/detect")
async def detect_emotion(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_base64 = base64.standard_b64encode(contents).decode("utf-8")
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_base64
                        }
                    },
                    {
                        "type": "text",
                        "text": 'Analyze the facial emotion. Reply in this JSON only: {"emotion": "happy/sad/angry/surprised/fearful/disgusted/neutral", "confidence": 85, "insight": "one encouraging sentence"}'
                    }
                ]
            }]
        )
        data = json.loads(response.content[0].text)
        return data
    except Exception as e:
        print(f"Error: {e}")
        return {"emotion": "neutral", "confidence": 0, "insight": "Could not detect emotion"}

@app.post("/analyze-voice")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        import whisper
        model = whisper.load_model("tiny")
        result = model.transcribe(tmp_path)
        transcript = result["text"].strip()
        os.unlink(tmp_path)

        if not transcript:
            return {"emotion": "neutral", "transcript": "", "insight": "No speech detected", "confidence": 0}

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": f'Analyze emotion in: "{transcript}". Reply in this JSON only: {{"emotion": "happy/sad/angry/surprised/fearful/neutral", "confidence": 85, "insight": "one sentence"}}'
            }]
        )
        data = json.loads(response.content[0].text)
        data["transcript"] = transcript
        return data
    except Exception as e:
        print(f"Voice error: {e}")
        return {"emotion": "neutral", "transcript": "", "insight": "Could not analyze voice", "confidence": 0}

@app.post("/music")
async def recommend_music(emotion: str = "happy"):
    try:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"Give me exactly 4 song recommendations for someone feeling {emotion}. Include 2 Tamil songs and 2 English songs. Respond with ONLY this JSON, nothing else before or after: {{\"songs\": [{{\"title\": \"Song Name\", \"artist\": \"Artist Name\", \"language\": \"Tamil\", \"vibe\": \"reason\"}}]}}"
            }]
        )
        raw = response.content[0].text.strip()
        print(f"Music raw response: {raw}")
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        if not raw.startswith("{"):
            raw = "{" + raw.split("{", 1)[1]
        data = json.loads(raw)
        return data
    except Exception as e:
        print(f"Music error: {e}")
        return {"songs": [
            {"title": "Kannaana Kanney", "artist": "D. Imman", "language": "Tamil", "vibe": "Warm and soothing"},
            {"title": "Happy", "artist": "Pharrell Williams", "language": "English", "vibe": "Upbeat and joyful"},
            {"title": "Rowdy Baby", "artist": "Yuvan Shankar Raja", "language": "Tamil", "vibe": "Fun and energetic"},
            {"title": "Believer", "artist": "Imagine Dragons", "language": "English", "vibe": "Powerful and uplifting"}
        ]}
        data = json.loads(response.content[0].text)
        return data
    except Exception as e:
        print(f"Music error: {e}")
        return {"songs": []}

@app.post("/report")
async def generate_report(data: dict):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        history = data.get("history", [])
        session_duration = data.get("duration", "Unknown")
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(buffer, pagesize=A4,
                                rightMargin=20*mm, leftMargin=20*mm,
                                topMargin=20*mm, bottomMargin=20*mm)

        def ps(name, fn='Helvetica', sz=11, ld=16, align=TA_LEFT, col='#1A1A1A', sb=0, sa=0):
            return ParagraphStyle(name, fontName=fn, fontSize=sz, leading=ld,
                                  alignment=align, textColor=colors.HexColor(col),
                                  spaceBefore=sb, spaceAfter=sa)

        story = []
        story.append(Paragraph("EmoSense", ps('t', 'Helvetica-Bold', sz=28, align=TA_CENTER, sa=4)))
        story.append(Paragraph("Emotion Analysis Report", ps('s', sz=13, align=TA_CENTER, col='#555555', sa=2)))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}", ps('d', sz=10, align=TA_CENTER, col='#888888', sa=4)))
        story.append(HRFlowable(width="100%", thickness=1, spaceAfter=16))

        dominant = "neutral"
        if history:
            from collections import Counter
            emotions = [h['emotion'] for h in history]
            counts = Counter(emotions)
            dominant = counts.most_common(1)[0][0]

            story.append(Paragraph("Session Summary", ps('sh', 'Helvetica-Bold', sz=14, sb=8, sa=6)))
            story.append(Paragraph(f"Total detections: {len(history)}", ps('b', sz=11, sa=3)))
            story.append(Paragraph(f"Dominant emotion: {dominant.upper()}", ps('b', sz=11, sa=3)))
            story.append(Paragraph(f"Session duration: {session_duration}", ps('b', sz=11, sa=3)))

            story.append(Paragraph("Emotion Breakdown", ps('sh', 'Helvetica-Bold', sz=14, sb=12, sa=6)))
            for emotion, count in counts.most_common():
                pct = round((count / len(history)) * 100)
                story.append(Paragraph(f"{emotion.capitalize()}: {count} times ({pct}%)", ps('eb', sz=11, sa=3)))

            story.append(Paragraph("Recent Detections", ps('sh', 'Helvetica-Bold', sz=14, sb=12, sa=6)))
            for i, h in enumerate(history[-10:], 1):
                story.append(Paragraph(
                    f"{i}. {h['emotion'].capitalize()} ({h['confidence']}%) — {h.get('insight', '')}",
                    ps('tl', sz=10, col='#333333', sa=3)
                ))

        ai_response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": f"Write a 3-sentence warm encouraging message for someone whose dominant emotion today was {dominant}."
            }]
        )

        story.append(Paragraph("Your Personalised Insight", ps('sh', 'Helvetica-Bold', sz=14, sb=16, sa=6)))
        story.append(Paragraph(ai_response.content[0].text, ps('ins', sz=11, col='#333333', sa=4)))
        story.append(HRFlowable(width="100%", thickness=0.5, spaceAfter=8))
        story.append(Paragraph("Generated by EmoSense", ps('ft', sz=9, align=TA_CENTER, col='#AAAAAA')))

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=emosense_report.pdf"}
        )
    except Exception as e:
        print(f"Report error: {e}")
        return {"error": str(e)}