import { getStore } from "@netlify/blobs";

// CORS headers
const ALLOWED_ORIGINS = [
  'https://edf-preview.netlify.app',
  'https://elitedentalforce.com',
  'https://www.elitedentalforce.com',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://localhost:8888',
];

function getCorsHeaders(event) {
  const origin = event?.headers?.get?.('origin') || event?.headers?.origin || event?.headers?.Origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Required approvals before feedback is considered fully approved
const REQUIRED_APPROVALS = 2;

// ── Audit log helper — append-only, never deleted ──
async function auditLog(action, entry, extra = {}) {
  const audit = getStore("edf-feedback-audit");
  const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await audit.setJSON(logId, {
    logId,
    action,
    feedbackId: entry.id,
    name: entry.name,
    category: entry.category,
    page: entry.page,
    feedback: entry.feedback,
    snapshot: { ...entry, screenshot: entry.screenshot ? '[has_screenshot]' : null },
    ts: Date.now(),
    ...extra
  });
}

export default async (req, context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: getCorsHeaders(req) });

  const store = getStore("edf-feedback");
  const url = new URL(req.url);

  // GET /api/feedback?audit=true — return audit log
  if (req.method === "GET" && url.searchParams.get("audit") === "true") {
    const audit = getStore("edf-feedback-audit");
    const { blobs } = await audit.list();
    const logs = [];
    for (const blob of blobs) {
      const data = await audit.get(blob.key, { type: "json" });
      if (data) logs.push(data);
    }
    logs.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    return new Response(JSON.stringify({ audit: logs, total: logs.length }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
    });
  }

  // GET — return all feedback, with optional filters
  if (req.method === "GET") {
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const page = url.searchParams.get("page");

    const { blobs } = await store.list();
    const entries = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (!data) continue;
      if (status && data.status !== status) continue;
      if (category && data.category !== category) continue;
      if (page && data.page !== page) continue;
      entries.push(data);
    }
    entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    // Calculate stats (including new dual-approval statuses)
    const stats = {
      total: entries.length,
      pending: entries.filter(e => e.status === 'pending').length,
      inProgress: entries.filter(e => e.status === 'in-progress').length,
      devComplete: entries.filter(e => e.status === 'dev-complete').length,
      approved: entries.filter(e => e.status === 'approved').length,
      rejected: entries.filter(e => e.status === 'rejected').length,
      blocked: entries.filter(e => e.status === 'blocked').length,
      wontFix: entries.filter(e => e.status === 'wont-fix').length,
      // Legacy compat
      resolved: entries.filter(e => e.status === 'resolved' || e.status === 'approved').length,
      avgRating: entries.length ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length).toFixed(1) : 0,
      requiredApprovals: REQUIRED_APPROVALS
    };

    return new Response(JSON.stringify({ feedback: entries, stats }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
    });
  }

  // POST — save new feedback
  if (req.method === "POST") {
    const body = await req.json();
    const entry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: body.name || "Anonymous",
      category: body.category || "general",
      feedback: body.feedback || "",
      screenshot: body.screenshot || null,
      page: body.page || "/",
      url: body.url || "",
      browser: body.browser || "",
      viewport: body.viewport || "",
      ts: body.ts || Date.now(),
      status: "pending",
      developerNotes: "",
      resolvedAt: null,
      // Dual approval fields
      devCompletedBy: null,
      devCompletedAt: null,
      approvals: [],       // [{name, ts, notes}]
      rejections: [],      // [{name, ts, notes}]
      approvedAt: null,
      requiredApprovals: REQUIRED_APPROVALS
    };
    await store.setJSON(entry.id, entry);
    await auditLog("created", entry);
    return new Response(JSON.stringify({ ok: true, id: entry.id }), {
      status: 201, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
    });
  }

  // PUT — update feedback status/notes/approvals
  if (req.method === "PUT") {
    const body = await req.json();
    const { id, status: newStatus, developerNotes, action, reviewerName, reviewNotes } = body;
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: getCorsHeaders(req) });

    const existing = await store.get(id, { type: "json" });
    if (!existing) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: getCorsHeaders(req) });

    // Initialize dual-approval fields if missing (backward compat)
    if (!existing.approvals) existing.approvals = [];
    if (!existing.rejections) existing.rejections = [];
    if (!existing.requiredApprovals) existing.requiredApprovals = REQUIRED_APPROVALS;

    const oldStatus = existing.status;
    const oldNotes = existing.developerNotes;

    // ── Dual approval actions ──
    if (action === 'dev-complete') {
      // Dev marks as complete → enters review pipeline
      existing.status = 'dev-complete';
      existing.devCompletedBy = reviewerName || 'Developer';
      existing.devCompletedAt = Date.now();
      existing.approvals = [];
      existing.rejections = [];
      await store.setJSON(id, existing);
      await auditLog("dev_completed", existing, { completedBy: existing.devCompletedBy });
      return new Response(JSON.stringify({ ok: true, entry: existing }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
      });
    }

    if (action === 'approve') {
      const name = reviewerName || 'Reviewer';
      // Prevent duplicate approvals from same person
      if (existing.approvals.some(a => a.name === name)) {
        return new Response(JSON.stringify({ error: "Already approved by " + name }), {
          status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
        });
      }
      existing.approvals.push({ name, ts: Date.now(), notes: reviewNotes || '' });
      // Check if we have enough approvals
      if (existing.approvals.length >= existing.requiredApprovals) {
        existing.status = 'approved';
        existing.approvedAt = Date.now();
        existing.resolvedAt = Date.now();
      } else {
        existing.status = 'dev-complete'; // Still needs more approvals
      }
      await store.setJSON(id, existing);
      await auditLog("approval_added", existing, {
        approvedBy: name,
        approvalCount: existing.approvals.length,
        required: existing.requiredApprovals,
        fullyApproved: existing.status === 'approved'
      });
      return new Response(JSON.stringify({ ok: true, entry: existing }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
      });
    }

    if (action === 'reject') {
      const name = reviewerName || 'Reviewer';
      existing.rejections.push({ name, ts: Date.now(), notes: reviewNotes || '' });
      existing.status = 'rejected';
      existing.approvals = []; // Reset approvals on rejection
      await store.setJSON(id, existing);
      await auditLog("rejection_added", existing, { rejectedBy: name, reason: reviewNotes });
      return new Response(JSON.stringify({ ok: true, entry: existing }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
      });
    }

    // ── Standard status/notes update ──
    if (newStatus) {
      existing.status = newStatus;
      // Map legacy 'resolved' to 'dev-complete' for dual approval
      if (newStatus === 'resolved') {
        existing.status = 'dev-complete';
        existing.devCompletedBy = existing.devCompletedBy || 'Developer';
        existing.devCompletedAt = Date.now();
      }
    }
    if (developerNotes !== undefined) existing.developerNotes = developerNotes;

    await store.setJSON(id, existing);

    if (newStatus && newStatus !== oldStatus) {
      await auditLog("status_changed", existing, { oldStatus, newStatus: existing.status });
    }
    if (developerNotes !== undefined && developerNotes !== oldNotes) {
      await auditLog("notes_updated", existing, { oldNotes, newNotes: developerNotes });
    }

    return new Response(JSON.stringify({ ok: true, entry: existing }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
    });
  }

  // DELETE — archive to audit log, then remove from active store
  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: getCorsHeaders(req) });

    const existing = await store.get(id, { type: "json" });
    if (existing) {
      await auditLog("deleted", existing);
    }

    await store.delete(id);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }

  return new Response("Method not allowed", { status: 405, headers: getCorsHeaders(req) });
};

export const config = { path: "/api/feedback" };
