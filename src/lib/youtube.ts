/** Pull an 11-character YouTube id from a full URL, Shorts link, or bare id. */
export function youtubeId(value: string) {
  const raw = value.trim()
  if (!raw) return ''
  if (/^[\w-]{11}$/.test(raw)) return raw
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = raw.match(pattern)
    if (match?.[1]) return match[1]
  }
  try {
    return new URL(raw).searchParams.get('v') ?? ''
  } catch {
    return ''
  }
}
