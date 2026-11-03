"""
SIP Discovery Engine - collect public posts about SIPs
-------------------------------------------------------
Sources: Play Store, App Store, Reddit (via public archives), YouTube comments, TradingQ&A.

Setup (once, inside a virtual environment):
    python3 -m venv .venv
    source .venv/bin/activate
    pip install google-play-scraper requests youtube-comment-downloader

Run:
    python scrape.py

Output:
    raw_items.csv  (source, id, date, rating, text, url, meta)

Each source runs on its own and the file is saved after every source,
so if one fails the others are kept. Takes roughly 15-25 minutes.
"""
import csv
import html
import re
import sys
import time

import requests

OUT = "raw_items.csv"
FIELDS = ["source", "id", "date", "rating", "text", "url", "meta"]
UA = {"User-Agent": "Mozilla/5.0 (student research project on SIP investor experience)"}

# ---- CONFIG ---------------------------------------------------------------
PLAY_APP_ID = "com.nextbillion.groww"
APPSTORE_ID = "1404871703"            # number after "id" in the apps.apple.com/in URL

REDDIT_SUBS = ["mutualfunds", "IndiaInvestments", "personalfinanceindia",
               "IndianStreetBets", "FIREIndia"]
REDDIT_QUERIES = ["SIP", "stopped SIP", "pause SIP", "Groww SIP", "first SIP",
                  "SIP loss", "continue SIP", "SIP negative"]
REDDIT_PAGES = 3                       # x100 items per query, per subreddit, posts and comments

YOUTUBE_URLS = [
    "https://www.youtube.com/watch?v=or3oYy6sXJ0",
    "https://www.youtube.com/watch?v=7uZ7TctzPSk",
    "https://www.youtube.com/watch?v=l-5gx7CUCSk",
    "https://www.youtube.com/watch?v=w_b8_rtiZKg",
    "https://www.youtube.com/watch?v=XhwQKOHHAQE",
    "https://www.youtube.com/watch?v=3NeW1eAqI3I",
    "https://www.youtube.com/watch?v=cogc_T4c7EA",
    "https://www.youtube.com/watch?v=qxu7CBYR864",
    "https://www.youtube.com/watch?v=RYa84D9z3aU",
]
YOUTUBE_MAX_PER_VIDEO = 500

TQNA_QUERIES = ["SIP stop", "SIP pause", "SIP loss", "first SIP", "SIP continue"]
TQNA_MAX_TOPICS = 40
# ---------------------------------------------------------------------------

rows, seen = [], set()


def add(source, item_id, date, text, url="", rating="", meta=""):
    text = re.sub(r"\s+", " ", (text or "")).strip()
    key = (source, str(item_id))
    if len(text) < 15 or key in seen or text in ("[deleted]", "[removed]"):
        return
    seen.add(key)
    rows.append({"source": source, "id": item_id, "date": date, "rating": rating,
                 "text": text, "url": url, "meta": meta})


def save():
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)


def get_json(url, params=None):
    """GET with retries on rate limits. Returns parsed JSON or None."""
    for attempt in range(3):
        try:
            r = requests.get(url, params=params, headers=UA, timeout=60)
        except requests.RequestException as e:
            print(f"   network error: {e!r}")
            time.sleep(5)
            continue
        if r.status_code == 429:
            time.sleep(10 * (attempt + 1))
            continue
        if r.status_code != 200:
            print(f"   HTTP {r.status_code} from {url.split('/')[2]}")
            return None
        try:
            return r.json()
        except ValueError:
            return None
    return None


# ---- Play Store -----------------------------------------------------------
def play_store():
    from google_play_scraper import Sort, reviews
    for sort, target in [(Sort.NEWEST, 6000), (Sort.MOST_RELEVANT, 2000)]:
        token, got = None, 0
        while got < target:
            batch, token = reviews(PLAY_APP_ID, lang="en", country="in", sort=sort,
                                   count=200, continuation_token=token)
            if not batch:
                break
            for r in batch:
                add("play_store", r["reviewId"], r["at"].isoformat(), r["content"],
                    rating=r["score"],
                    meta=f"thumbs={r.get('thumbsUpCount', 0)};version={r.get('reviewCreatedVersion')}")
            got += len(batch)
            if token is None:
                break
            time.sleep(1)


# ---- App Store (public RSS, ~500 most recent reviews) ---------------------
def app_store():
    for page in range(1, 11):
        data = get_json(f"https://itunes.apple.com/in/rss/customerreviews/page={page}"
                        f"/id={APPSTORE_ID}/sortby=mostrecent/json")
        entries = (data or {}).get("feed", {}).get("entry", [])
        if isinstance(entries, dict):
            entries = [entries]
        if not entries:
            break
        for e in entries:
            if "im:rating" not in e:          # skip the app-metadata entry
                continue
            add("app_store", e["id"]["label"], e["updated"]["label"],
                f"{e['title']['label']}. {e['content']['label']}",
                rating=e["im:rating"]["label"])
        time.sleep(1)


# ---- Reddit (public archives; Reddit blocks direct scripts) ---------------
def reddit_row(kind, d, sub):
    if kind == "submission":
        add("reddit_post", d.get("id"), d.get("created_utc"),
            f"{d.get('title', '')}. {d.get('selftext', '')}",
            url=f"https://reddit.com{d.get('permalink', '')}",
            meta=f"sub={sub};score={d.get('score')};comments={d.get('num_comments')}")
    else:
        add("reddit_comment", d.get("id"), d.get("created_utc"), d.get("body"),
            url=f"https://reddit.com{d.get('permalink', '')}",
            meta=f"sub={sub};post={d.get('link_id')};score={d.get('score')}")


def reddit_archive(kind, sub, q, use_arctic):
    """Page backwards in time through PullPush (default) or Arctic Shift.
    Returns the number of items, or None if the archive is unavailable."""
    n, before = 0, None
    for _ in range(REDDIT_PAGES):
        if use_arctic:
            endpoint = "posts" if kind == "submission" else "comments"
            field = "title" if kind == "submission" else "body"
            params = {"subreddit": sub, field: q, "limit": 100, "sort": "desc"}
            url = f"https://arctic-shift.photon-reddit.com/api/{endpoint}/search"
        else:
            params = {"q": q, "subreddit": sub, "size": 100}
            url = f"https://api.pullpush.io/reddit/search/{kind}/"
        if before:
            params["before"] = before
        data = get_json(url, params)
        if data is None or "data" not in data:
            return None
        items = data["data"] or []
        if not items:
            break
        for d in items:
            reddit_row(kind, d, sub)
        n += len(items)
        before = int(min(float(d.get("created_utc", 0)) for d in items))
        time.sleep(1.5)
    return n


def reddit():
    use_arctic = False
    for sub in REDDIT_SUBS:
        start = len(rows)
        for q in REDDIT_QUERIES:
            for kind in ("submission", "comment"):
                got = reddit_archive(kind, sub, q, use_arctic)
                if got is None and not use_arctic:
                    print("   PullPush unavailable - switching to Arctic Shift")
                    use_arctic = True
                    reddit_archive(kind, sub, q, use_arctic)
        print(f"   r/{sub}: +{len(rows) - start} items")
        save()


# ---- YouTube comments (no API key needed) ---------------------------------
def youtube():
    from youtube_comment_downloader import SORT_BY_POPULAR, YoutubeCommentDownloader
    dl = YoutubeCommentDownloader()
    for url in YOUTUBE_URLS:
        n = 0
        try:
            for c in dl.get_comments_from_url(url, sort_by=SORT_BY_POPULAR):
                add("youtube", c["cid"], c.get("time"), c.get("text"), url=url,
                    meta=f"votes={c.get('votes')}")
                n += 1
                if n >= YOUTUBE_MAX_PER_VIDEO:
                    break
        except Exception as e:
            print(f"   {url} failed: {e!r}")
        print(f"   {url}: {n} comments")
        save()


# ---- TradingQ&A (Discourse forum) -----------------------------------------
def tradingqna():
    topics = {}
    for q in TQNA_QUERIES:
        data = get_json("https://tradingqna.com/search.json", {"q": q})
        for t in (data or {}).get("topics", []):
            topics[t["id"]] = t["slug"]
        time.sleep(1)
    for tid, slug in list(topics.items())[:TQNA_MAX_TOPICS]:
        data = get_json(f"https://tradingqna.com/t/{slug}/{tid}.json")
        for p in (data or {}).get("post_stream", {}).get("posts", []):
            text = html.unescape(re.sub(r"<[^>]+>", " ", p.get("cooked") or ""))
            add("tradingqna", p["id"], p.get("created_at"), text,
                url=f"https://tradingqna.com/t/{slug}/{tid}", meta=f"topic={tid}")
        time.sleep(1)


if __name__ == "__main__":
    for name, fn in [("Play Store", play_store), ("App Store", app_store),
                     ("Reddit (archives)", reddit), ("YouTube", youtube),
                     ("TradingQ&A", tradingqna)]:
        print(f"-> {name}")
        before = len(rows)
        try:
            fn()
        except Exception as e:
            print(f"   {name} failed: {e!r}", file=sys.stderr)
        print(f"   +{len(rows) - before} items")
        save()

    counts = {}
    for r in rows:
        counts[r["source"]] = counts.get(r["source"], 0) + 1
    print("\nTotals by source:")
    for s, c in sorted(counts.items()):
        print(f"   {s:15s} {c}")
    print(f"\nDone. {len(rows)} items written to {OUT}")
