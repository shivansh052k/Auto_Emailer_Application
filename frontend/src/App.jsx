import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Recipients from "./pages/Recipients"
import Preview    from "./pages/Preview"
import Schedule   from "./pages/Schedule"
import SentLog    from "./pages/SentLog"
import "./App.css"

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display:"flex", gap:"16px", padding:"16px", borderBottom:"1px solid #ddd", marginBottom:"24px" }}>
        <NavLink to="/">Recipients</NavLink>
        <NavLink to="/preview">Preview</NavLink>
        <NavLink to="/schedule">Run & Schedule</NavLink>
        <NavLink to="/sent">Sent Log</NavLink>
      </nav>

      <div style={{ padding:"0 24px" }}>
        <Routes>
          <Route path="/"        element={<Recipients />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/sent"    element={<SentLog />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
