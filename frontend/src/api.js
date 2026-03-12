import axios from "axios"

const BASE = "http://localhost:8000"

export const getRecipients = () => axios.get(`${BASE}/recipients`)
export const getSent       = () => axios.get(`${BASE}/sent`)
export const sendEmails    = () => axios.post(`${BASE}/send`)
export const getSchedule   = () => axios.get(`${BASE}/schedule`)
export const postSchedule  = (run_at) => axios.post(`${BASE}/schedule`, { run_at })
export const deleteSchedule = () => axios.delete(`${BASE}/schedule`)
export const clearSent = () => axios.delete(`${BASE}/sent`)
