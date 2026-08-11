import { profile } from "@/lib/profile.config";

/**
 * A permanent URL for the resume that always serves the current file.
 *
 * The Drive file id never changes (new versions are uploaded over the same
 * file), so this route streams those bytes from our own origin. Visitors get
 * eega.dev/resume.pdf instead of the Drive viewer, the link keeps working if
 * Drive sharing state ever changes by accident, and updating the Drive file
 * still propagates here without a redeploy.
 */
export const revalidate = 3600;

const DRIVE_DOWNLOAD_URL = `https://drive.usercontent.google.com/download?id=${profile.contact.resumeFileId}&export=download`;
const FILENAME = "Eega-Somasekhara-Reddy-Resume.pdf";
const PDF_MAGIC = "%PDF";

export async function GET() {
  const upstream = await fetch(DRIVE_DOWNLOAD_URL, {
    // One hour matches `revalidate`, so a fresh render never serves a stale body.
    next: { revalidate },
  });

  if (!upstream.ok) return driveFallback();

  const bytes = await upstream.arrayBuffer();
  // Drive answers with an HTML interstitial instead of the file when the share
  // state changes or a virus-scan confirmation is required. Serving that as a
  // PDF would produce a broken download, so hand the visitor to Drive instead.
  const looksLikePdf =
    new TextDecoder().decode(bytes.slice(0, PDF_MAGIC.length)) === PDF_MAGIC;
  if (!looksLikePdf) return driveFallback();

  return new Response(bytes, {
    headers: {
      "content-type": "application/pdf",
      // `inline` so it opens in the browser's own viewer; the filename is still
      // used when someone saves it.
      "content-disposition": `inline; filename="${FILENAME}"`,
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function driveFallback() {
  return Response.redirect(profile.contact.resumeViewerUrl, 307);
}
