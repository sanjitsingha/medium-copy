const BLOCKED_TAGS = /<\/?(script|iframe|object|embed|base|form|input|button|textarea|select|option|meta|link|style)[^>]*>/gi;
const EVENT_HANDLERS = /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JAVASCRIPT_URLS = /\s+(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;
const DATA_URLS = /\s+src\s*=\s*(['"])\s*data:(?!image\/(?:png|jpeg|jpg|gif|webp);base64,)[\s\S]*?\1/gi;

export function sanitizeHtml(html = "") {
  return String(html)
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JAVASCRIPT_URLS, "")
    .replace(DATA_URLS, "");
}
