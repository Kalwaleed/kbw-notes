// Mailpit helper: poll the local SMTP capture for the latest message addressed
// to a given email and pull the verification URL out of the body. Used to
// complete the magic-link flow end-to-end inside tests without a real inbox.

const POLL_INTERVAL_MS = 250
const POLL_TIMEOUT_MS = 10_000

type MailpitMessage = {
  ID: string
  Subject: string
  Created: string
  To: { Address: string }[]
}

type MailpitMessageDetail = {
  ID: string
  Text: string
  HTML: string
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`mailpit fetch failed: ${res.status} ${res.statusText} ${url}`)
  return res.json() as Promise<T>
}

export async function clearMailpit(mailpitUrl: string): Promise<void> {
  const res = await fetch(`${mailpitUrl}/api/v1/messages`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) {
    throw new Error(`mailpit clear failed: ${res.status} ${res.statusText}`)
  }
}

// Snapshot the IDs of all messages currently addressed to `toAddress`. Used
// before triggering a fresh magic-link send so the polling loop can wait for a
// genuinely new message (timestamp-based matching is unreliable when multiple
// messages land within the same second).
export async function snapshotMessageIds(
  mailpitUrl: string,
  toAddress: string,
): Promise<Set<string>> {
  const list = await fetchJSON<{ messages: MailpitMessage[] }>(
    `${mailpitUrl}/api/v1/messages?limit=200`,
  )
  return new Set(
    list.messages
      .filter((m) => m.To.some((t) => t.Address.toLowerCase() === toAddress.toLowerCase()))
      .map((m) => m.ID),
  )
}

export async function waitForNewMessage(
  mailpitUrl: string,
  toAddress: string,
  excludeIds: Set<string>,
): Promise<MailpitMessageDetail> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const list = await fetchJSON<{ messages: MailpitMessage[] }>(
      `${mailpitUrl}/api/v1/messages?limit=200`,
    )
    const match = list.messages.find(
      (m) =>
        !excludeIds.has(m.ID) &&
        m.To.some((t) => t.Address.toLowerCase() === toAddress.toLowerCase()),
    )
    if (match) {
      return fetchJSON<MailpitMessageDetail>(`${mailpitUrl}/api/v1/message/${match.ID}`)
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw new Error(`Mailpit timeout: no new message for ${toAddress} within ${POLL_TIMEOUT_MS}ms`)
}

// Supabase magic-link emails embed a verification URL with the token_hash
// query param. Pull it out and return the parsed token + redirect target.
export function extractMagicLink(message: MailpitMessageDetail): {
  fullUrl: string
  tokenHash: string
} {
  const body = message.HTML || message.Text || ''
  const match = body.match(/https?:\/\/[^\s"'<>]*\/auth\/v1\/verify\?[^\s"'<>]+/)
  if (!match) {
    throw new Error('No magic link URL found in email body')
  }
  const url = new URL(match[0])
  const tokenHash = url.searchParams.get('token')
  if (!tokenHash) {
    throw new Error(`Magic link URL missing token param: ${url.toString()}`)
  }
  return { fullUrl: url.toString(), tokenHash }
}
