/**
 * API utility module.
 * Centralizes all backend HTTP calls so components don't need to know
 * the base URL or duplicate axios configuration.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Sensor ────────────────────────────────────────────────────────
export const fetchLatestSensor = () =>
  api.get('/api/sensor/latest').then((r) => r.data);

export const fetchSensorHistory = (range = '24h', date = null) =>
  api.get('/api/sensor/history', { params: { range, date } }).then((r) => r.data);

// ─── AI Diagnosis ──────────────────────────────────────────────────
export const submitDiagnosis = (imageFile) => {
  const form = new FormData();
  form.append('file', imageFile);
  return api
    .post('/api/diagnose', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const fetchDiagnosisHistory = (filter = 'all', limit = 50) =>
  api
    .get('/api/diagnose/history', { params: { filter, limit } })
    .then((r) => r.data);

export const fetchDiagnosisDetail = (id) =>
  api.get(`/api/diagnose/${id}`).then((r) => r.data);

// ─── Pump / Watering ───────────────────────────────────────────────
export const togglePump = (action = 'on', durationSeconds = 10) =>
  api
    .post('/api/pump/toggle', null, {
      params: { action, duration_seconds: durationSeconds },
    })
    .then((r) => r.data);

export const fetchPumpStatus = () =>
  api.get('/api/pump/status').then((r) => r.data);

export const fetchWateringHistory = (limit = 50) =>
  api
    .get('/api/watering/history', { params: { limit } })
    .then((r) => r.data);

// ─── Alerts ────────────────────────────────────────────────────────
export const fetchAlerts = (unreadOnly = false, limit = 100) =>
  api
    .get('/api/alerts', { params: { unread_only: unreadOnly, limit } })
    .then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get('/api/alerts/unread-count').then((r) => r.data);

export const markAlertRead = (alertId) =>
  api.patch(`/api/alerts/${alertId}/read`).then((r) => r.data);

export const markAllAlertsRead = () =>
  api.patch('/api/alerts/read-all').then((r) => r.data);

// ─── Settings ──────────────────────────────────────────────────────
export const fetchSettings = () =>
  api.get('/api/settings').then((r) => r.data);

export const updateSettings = (data) =>
  api.put('/api/settings', data).then((r) => r.data);

// ─── Legacy (backward compat) ──────────────────────────────────────
export const legacyPredict = (imageFile) => {
  const form = new FormData();
  form.append('file', imageFile);
  return api
    .post('/predict', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

// ─── Image URL helper ──────────────────────────────────────────────
export const getImageUrl = (relativePath) =>
  `${API_BASE}/${relativePath}`;

export default api;
