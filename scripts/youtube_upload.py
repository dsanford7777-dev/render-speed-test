"""Upload one rendered video to YouTube, private, with an optional scheduled publish time.

Reads upload.json (see PRODUCTION.md, "Uploading"). Credentials come from environment
variables set from GitHub secrets, and are never printed:
  YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN

Usage: python scripts/youtube_upload.py upload.json video.mp4 [thumbnail.jpg]
"""
import json
import os
import sys
import time
from datetime import datetime, timezone

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def summary(line: str) -> None:
    print(line)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(line + "\n")


def fail(msg: str) -> None:
    summary(f"- **Failed:** {msg}")
    sys.exit(1)


def main() -> None:
    cfg_path, video = sys.argv[1], sys.argv[2]
    thumb = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
    cfg = json.load(open(cfg_path, encoding="utf-8"))

    for key in ("title", "description"):
        if not cfg.get(key):
            fail(f"upload.json needs \"{key}\"")
    if len(cfg["title"]) > 100:
        fail(f"title is {len(cfg['title'])} characters; YouTube allows 100")
    if len(cfg["description"].encode("utf-8")) > 5000:
        fail("description is over 5,000 bytes")
    if any(c in cfg["title"] + cfg["description"] for c in "<>"):
        fail("YouTube rejects < and > in titles and descriptions")

    publish_at = cfg.get("publishAt")
    if publish_at:
        when = datetime.fromisoformat(publish_at.replace("Z", "+00:00"))
        if when.tzinfo is None:
            fail("publishAt needs a time zone, e.g. 2026-11-14T22:00:00Z or 2026-11-14T16:00:00-06:00")
        if when <= datetime.now(timezone.utc):
            fail(f"publishAt {publish_at} is in the past; YouTube would publish at once")
        publish_at = when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    creds = Credentials(
        token=None,
        refresh_token=os.environ["YT_REFRESH_TOKEN"],
        client_id=os.environ["YT_CLIENT_ID"],
        client_secret=os.environ["YT_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)

    # Which channel this token belongs to. The upload scope can't read channel details,
    # so this comes from the upload response (snippet.channelId / channelTitle).
    status = {
        "privacyStatus": "private",
        "selfDeclaredMadeForKids": bool(cfg.get("madeForKids", False)),
        "embeddable": True,
        "license": "youtube",
    }
    if publish_at:
        status["publishAt"] = publish_at
    if "containsSyntheticMedia" in cfg:
        status["containsSyntheticMedia"] = bool(cfg["containsSyntheticMedia"])

    body = {
        "snippet": {
            "title": cfg["title"],
            "description": cfg["description"],
            "tags": cfg.get("tags", []),
            "categoryId": str(cfg.get("categoryId", "27")),  # 27 = Education
            "defaultLanguage": cfg.get("language", "en"),
            "defaultAudioLanguage": cfg.get("language", "en"),
        },
        "status": status,
    }

    media = MediaFileUpload(video, mimetype="video/mp4", chunksize=16 * 1024 * 1024, resumable=True)
    request = yt.videos().insert(part="snippet,status", body=body, media_body=media, notifySubscribers=True)

    response, retries = None, 0
    while response is None:
        try:
            progress, response = request.next_chunk()
            if progress:
                print(f"uploaded {int(progress.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504) and retries < 6:
                retries += 1
                time.sleep(2 ** retries)
                continue
            fail(f"YouTube refused the upload: {e.resp.status} {e._get_reason()}")

    vid = response["id"]
    snip = response.get("snippet", {})
    st = response.get("status", {})
    expect = cfg.get("channelId")
    summary("## YouTube upload")
    summary(f"- Video: https://youtu.be/{vid} (Studio: https://studio.youtube.com/video/{vid}/edit)")
    summary(f"- Channel: {snip.get('channelTitle', '?')} (`{snip.get('channelId', '?')}`)")
    summary(f"- Privacy: {st.get('privacyStatus')}; publish at: {st.get('publishAt', 'not scheduled')}")
    summary(f"- Upload status: {st.get('uploadStatus')}")

    if thumb:
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(thumb)).execute()
            summary(f"- Thumbnail set from `{os.path.basename(thumb)}`")
        except HttpError as e:
            summary(f"- **Thumbnail not set:** {e.resp.status} {e._get_reason()} (set it in Studio)")

    with open("upload-result.json", "w", encoding="utf-8") as f:
        json.dump({"videoId": vid, "channelId": snip.get("channelId"), "channelTitle": snip.get("channelTitle"),
                   "privacy": st.get("privacyStatus"), "publishAt": st.get("publishAt")}, f, indent=2)

    if expect and snip.get("channelId") != expect:
        fail(f"uploaded to channel {snip.get('channelId')}, but upload.json expected {expect}. "
             f"Delete https://studio.youtube.com/video/{vid}/edit and check the channel's token.")


if __name__ == "__main__":
    main()
