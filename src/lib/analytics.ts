// Lightweight first-party analytics beacon.
// No cookies and no personal data: only a random per-session id kept in
// sessionStorage, the path, event name, referrer and mobile/desktop flag.

const SESSION_KEY = "mt_session"

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

/** Fire-and-forget event beacon. Never throws, never blocks the UI. */
export function track(event: string, payload?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return
    const body = JSON.stringify({
      session: getSessionId(),
      event,
      path: window.location.pathname,
      referrer: document.referrer || null,
      device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
      payload: payload ?? null,
    })
    const sent = navigator.sendBeacon
      ? navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }))
      : false
    if (!sent) {
      fetch("/api/events", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {})
    }
  } catch {
    // Analytics must never break the site.
  }
}
