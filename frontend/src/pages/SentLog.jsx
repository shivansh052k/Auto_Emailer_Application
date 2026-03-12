import { useEffect, useState } from "react"
import { getSent, clearSent } from "../api"

export default function SentLog() {
  const [sent, setSent]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getSent()
      .then(res => setSent(res.data))
      .catch(() => setError("Failed to load sent log"))
      .finally(() => setLoading(false))
  }, [])

  function handleClear() {
    clearSent().then(() => setSent([]))
  }

  if (loading) return <p>Loading...</p>
  if (error)   return <p style={{ color:"red" }}>{error}</p>

  return (
    <div>
      <h2>Sent Log ({sent.length})</h2>
      <button onClick={handleClear} style={{ color:"red", marginBottom:"12px" }}>
        Clear Sent Log
      </button>
      {sent.length === 0 ? (
        <p style={{ color:"#888" }}>No emails sent yet.</p>
      ) : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <thead>
            <tr>
              <th style={th}>Email</th>
              <th style={th}>Message ID</th>
            </tr>
          </thead>
          <tbody>
            {sent.map((s, i) => (
              <tr key={i}>
                <td style={td}>{s.email}</td>
                <td style={td}>{s.message_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const th = { border:"1px solid #ddd", padding:"8px", background:"#f5f5f5", textAlign:"left" }
const td = { border:"1px solid #ddd", padding:"8px" }
