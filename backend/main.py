from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import emailer
import scheduler_manager

app = FastAPI()

# Allow React (localhost:5173) to talk to FastAPI (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body model for scheduling
class ScheduleRequest(BaseModel):
    run_at: str  # datetime string e.g. "2026-03-15T09:00:00"


@app.get("/recipients")
def get_recipients():
    recipients  = emailer.build_recipients()
    sent_emails = emailer.load_sent_emails()
    for r in recipients:
        r["sent"] = r["email"] in sent_emails
    return recipients


@app.get("/sent")
def get_sent():
    sent = emailer.load_sent_emails()
    return [{"email": k, "message_id": v} for k, v in sent.items()]

@app.get("/preview")
def get_preview():
    return {"html": emailer.EMAIL_BODY}

@app.post("/send")
def send_emails():
    logs    = []
    results = emailer.run_emailer(log_callback=lambda msg: logs.append(msg))
    sent    = sum(1 for r in results if r.get("result") == "sent")
    skipped = sum(1 for r in results if r.get("result") == "skipped")
    failed  = sum(1 for r in results if r.get("result", "").startswith("failed"))
    return {"logs": logs, "sent": sent, "skipped": skipped, "failed": failed}


@app.post("/schedule")
def schedule_emails(body: ScheduleRequest):
    run_at = datetime.fromisoformat(body.run_at)
    if run_at <= datetime.now():
        return {"error": "Please pick a future date and time."}
    scheduler_manager.schedule_job(run_at, emailer.run_emailer)
    return {"scheduled_for": run_at.isoformat()}


@app.get("/schedule")
def get_schedule():
    job = scheduler_manager.get_scheduled_job()
    if not job:
        return {"scheduled": False}
    return {"scheduled": True, "run_at": job.next_run_time.isoformat()}


@app.delete("/schedule")
def cancel_schedule():
    cancelled = scheduler_manager.cancel_job()
    return {"cancelled": cancelled}

@app.delete("/sent")
def clear_sent():
    open(emailer.SENT_FILE, "w").close()
    return {"cleared": True}