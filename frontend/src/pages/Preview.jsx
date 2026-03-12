import { useEffect, useState } from "react"
import axios from "axios"

export default function Preview() {
  const [html, setHtml]       = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("http://localhost:8000/preview")
      .then(res => setHtml(res.data.html))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>Email Preview</h2>
      <p style={{ color:"#888", marginBottom:"16px" }}>
        Placeholders like <code style={{color:"#aaa"}}>{"{recipient_name}"}</code> and <code style={{color:"#aaa"}}>{"{company_name}"}</code> are filled in per recipient.
      </p>
      <iframe
        srcDoc={html}
        style={{ width:"100%", height:"500px", border:"1px solid #444", borderRadius:"8px", background:"white" }}
        title="Email Preview"
      />
    </div>
  )
}
