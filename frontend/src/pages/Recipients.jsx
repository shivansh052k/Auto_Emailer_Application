import { useEffect, useState } from "react"
import { getRecipients } from "../api"

export default function Recipients() {
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    getRecipients()
      .then(res => setRecipients(res.data))
      .catch(err => setError("Failed to load recipients"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error)   return <p style={{ color:"red" }}>{error}</p>

  return (
    <div>
      <h2>Recipients ({recipients.length})</h2>
      <table style={{ borderCollapse:"collapse", width:"100%" }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Company</th>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.name}</td>
              <td style={td}>{r.company}</td>
              <td style={td}>{r.email}</td>
              <td style={td}>
                <span style={{ color: r.sent ? "green" : "orange" }}>
                  {r.sent ? "Sent" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th = { border:"1px solid #ddd", padding:"8px", background:"#f5f5f5", textAlign:"left" }
const td = { border:"1px solid #ddd", padding:"8px" }