import { useEffect, useState } from "react"
import { sendEmails, getSchedule, postSchedule, deleteSchedule } from "../api"

export default function Schedule() {
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState(null)
  const [scheduleInfo, setScheduleInfo] = useState(null)
  const [runAt, setRunAt]         = useState("")
  const [schedMsg, setSchedMsg]   = useState(null)

  useEffect(() => {
    getSchedule().then(res => setScheduleInfo(res.data))
  }, [])

  function handleSendNow() {
    setSending(true)
    setResult(null)
    sendEmails()
      .then(res => setResult(res.data))
      .finally(() => setSending(false))
  }

  function handleSchedule() {
    if (!runAt) return
    postSchedule(runAt)
      .then(res => {
        if (res.data.error) {
          setSchedMsg({ error: true, text: res.data.error })
        } else {
          setSchedMsg({ error: false, text: `Scheduled for ${res.data.scheduled_for}` })
          setScheduleInfo({ scheduled: true, run_at: res.data.scheduled_for })
        }
      })
  }

  function handleCancel() {
    deleteSchedule().then(() => {
      setScheduleInfo({ scheduled: false })
      setSchedMsg({ error: false, text: "Schedule cancelled." })
    })
  }

  return (
    <div>
      <h2>Run & Schedule</h2>

      {/* Send Now */}
      <section style={section}>
        <h3>Send Now</h3>
        <button onClick={handleSendNow} disabled={sending}>
          {sending ? "Sending..." : "Send Emails Now"}
        </button>
        {result && (
          <div style={{ marginTop:"12px" }}>
            <p>Sent: {result.sent} | Skipped: {result.skipped} | Failed: {result.failed}</p>
            <pre style={logBox}>{result.logs.join("\n")}</pre>
          </div>
        )}
      </section>

      {/* Schedule */}
      <section style={section}>
        <h3>Schedule for Later</h3>
        <input
          type="datetime-local"
          value={runAt}
          onChange={e => setRunAt(e.target.value)}
          style={{ marginRight:"8px" }}
        />
        <button onClick={handleSchedule}>Schedule</button>
        {schedMsg && (
          <p style={{ color: schedMsg.error ? "red" : "green", marginTop:"8px" }}>
            {schedMsg.text}
          </p>
        )}
      </section>

      {/* Current Schedule Status */}
      <section style={section}>
        <h3>Current Schedule</h3>
        {scheduleInfo?.scheduled ? (
          <>
            <p>Scheduled for: <strong>{scheduleInfo.run_at}</strong></p>
            <button onClick={handleCancel} style={{ color:"red" }}>Cancel Schedule</button>
          </>
        ) : (
          <p style={{ color:"#888" }}>No schedule set.</p>
        )}
      </section>
    </div>
  )
}

const section = { border:"1px solid #ddd", borderRadius:"8px", padding:"16px", marginBottom:"16px" }
const logBox   = { background:"#111", color:"#0f0", padding:"12px", borderRadius:"6px", fontSize:"12px", maxHeight:"200px", overflowY:"auto" }