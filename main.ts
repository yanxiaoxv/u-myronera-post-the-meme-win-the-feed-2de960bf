/**
 * Post the Meme, Win the Feed — entry program (Node 22).
 *
 * Copies POST.json from the repository root to /output. That is all
 * it has to do: the house reads the post itself through FxTwitter's
 * public read and writes its counts to /output/post.counts.json after
 * the runs. POST.json must name the post's address as a JSON object
 * {"url": "https://x.com/<user>/status/<id>"} — a placeholder URL
 * fails the checks below on purpose, so the real post must be live
 * before this program runs for real. With MAKEFUN_OUTPUT_DIR unset
 * or set to an empty string, it writes to /output (an empty value
 * counts as unset).
 *
 * Rewritten in the build session that posted the meme: the copy is
 * byte-for-byte the same as the starter's, and the read-back now also
 * pins the URL's shape — x.com host, a handle, and a digits-only
 * status id — so a malformed hand-in fails here, in the open, rather
 * than at grading time.
 */

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const src = join(process.cwd(), "POST.json");
const dst = join(outDir, "POST.json");
// The source must be the repository's own POST.json: a missing file
// means the post has not been published yet, and copying nothing
// would silently produce an invalid entry.
copyFileSync(src, dst);
// The copy must be whole: a short write would hand the house a
// truncated file, so compare sizes before trusting the copy.
const srcSize = statSync(src).size;
const dstSize = statSync(dst).size;
if (dstSize !== srcSize) {
  throw new Error(`POST.json copy is incomplete: ${dstSize} of ${srcSize} bytes`);
}
// Read back what actually landed on disk: a bad copy must fail
// loudly here, not at grading time.
const written = JSON.parse(readFileSync(dst, "utf-8")) as unknown;
if (
  typeof written !== "object" ||
  written === null ||
  typeof (written as { url?: unknown }).url !== "string" ||
  !(written as { url: string }).url.startsWith("https://x.com/")
) {
  throw new Error("POST.json does not name an X post URL");
}
const url = (written as { url: string }).url;
const m = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/(\d+)$/.exec(url);
if (!m) {
  throw new Error(`POST.json url is not a plain post address: ${url}`);
}
console.log(
  `POST.json copied to ${dst} (${statSync(dst).size} bytes, status id ${m[1]})`,
);
