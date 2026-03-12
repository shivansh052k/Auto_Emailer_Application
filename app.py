import streamlit as st
import pandas as pd
from datetime import datetime, date, time
import emailer
import scheduler_manager

st.set_page_config(page_title="Email Automator", page_icon="📧", layout="wide")

page = st.sidebar.radio(
    "Navigation",
    ["📋 Recipients", "👁️ Email Preview", "🚀 Run & Schedule", "📊 Sent Log"]
)

# ── PAGE: RECIPIENTS ──────────────────────────────────────────
if page == "📋 Recipients":
    st.title("📋 Recipients")
    st.caption("Contacts loaded live from Google Sheet")

    with st.spinner("Loading from Google Sheet..."):
        try:
            recipients  = emailer.build_recipients()
            sent_emails = emailer.load_sent_emails()
        except Exception as e:
            st.error(f"Failed to load: {e}")
            st.stop()

    df = pd.DataFrame(recipients)
    df["Email Status"] = df["email"].apply(lambda e: "✅ Sent" if e in sent_emails else "⏳ Pending")
    df = df.rename(columns={
        "company":         "Company",
        "email":           "Email",
        "name":            "Name",
        "position":        "Position",
        "status":          "Job Status",
        "internship_link": "Job Link",
    })

    col1, col2 = st.columns(2)
    with col1:
        company_filter = st.multiselect("Filter by Company", options=sorted(df["Company"].unique()))
    with col2:
        status_filter = st.multiselect("Filter by Email Status", options=["✅ Sent", "⏳ Pending"])

    if company_filter:
        df = df[df["Company"].isin(company_filter)]
    if status_filter:
        df = df[df["Email Status"].isin(status_filter)]

    st.dataframe(df[["Company", "Name", "Email", "Position", "Job Status", "Job Link", "Email Status"]], use_container_width=True)

    total   = len(df)
    pending = (df["Email Status"] == "⏳ Pending").sum()
    sent    = (df["Email Status"] == "✅ Sent").sum()
    st.caption(f"Total: {total} | Pending: {pending} | Sent: {sent}")
    
    
# ── PAGE: EMAIL PREVIEW ───────────────────────────────────────
elif page == "👁️ Email Preview":
    st.title("👁️ Email Preview")

    with st.spinner("Loading contacts..."):
        try:
            recipients = emailer.build_recipients()
        except Exception as e:
            st.error(f"Failed to load: {e}")
            st.stop()

    options = [f"{r['name']} — {r['company']} ({r['email']})" for r in recipients]
    selected = st.selectbox("Select a recipient to preview", options)
    idx = options.index(selected)
    r   = recipients[idx]

    st.subheader(f"To: {r['email']}")
    st.caption(f"Subject: Application/Consideration for {r['status']} at {r['company']}")

    html = emailer.EMAIL_BODY.format(
        recipient_name  = r["name"],
        company_name    = r["company"],
        status          = r["status"],
        internship_link = r["internship_link"],
        position        = r["position"],
        summary         = r["summary"],
    )

    st.components.v1.html(html, height=600, scrolling=True)

# ── PAGE: RUN & SCHEDULE ──────────────────────────────────────
elif page == "🚀 Run & Schedule":
    st.title("🚀 Run & Schedule")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Run Now")
        st.caption("Send emails to all pending contacts immediately.")

        if st.button("▶ Send Emails Now", type="primary"):
            logs = []
            with st.spinner("Sending emails..."):
                results = emailer.run_emailer(log_callback=lambda msg: logs.append(msg))

            for log in logs:
                st.write(log)

            sent    = sum(1 for r in results if r.get("result") == "sent")
            skipped = sum(1 for r in results if r.get("result") == "skipped")
            failed  = sum(1 for r in results if r.get("result", "").startswith("failed"))
            st.success(f"Done! ✅ Sent: {sent} | ⏩ Skipped: {skipped} | ❌ Failed: {failed}")

    with col2:
        st.subheader("Schedule")
        st.caption("Auto-send at a specific date and time.")

        sched_date = st.date_input("Date", value=date.today())
        sched_time = st.time_input("Time", value=time(9, 0))
        run_at     = datetime.combine(sched_date, sched_time)

        job = scheduler_manager.get_scheduled_job()
        if job:
            st.info(f"⏰ Scheduled for: **{job.next_run_time.strftime('%b %d, %Y at %I:%M %p')}**")
            if st.button("❌ Cancel Scheduled Job"):
                scheduler_manager.cancel_job()
                st.success("Job cancelled.")
                st.rerun()

        if st.button("📅 Schedule Job"):
            if run_at <= datetime.now():
                st.error("Please pick a future date and time.")
            else:
                scheduler_manager.schedule_job(run_at, emailer.run_emailer)
                st.success(f"✅ Scheduled for {run_at.strftime('%b %d, %Y at %I:%M %p')}")
                st.rerun()