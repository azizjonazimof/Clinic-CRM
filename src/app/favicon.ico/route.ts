const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#2563eb"/>
  <path d="M30 14h4v36h-4z" fill="#fff"/>
  <path d="M14 30h36v4H14z" fill="#fff"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#bfdbfe" stroke-width="4"/>
</svg>`;

export function GET() {
  return new Response(icon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

