"""Post queued comments on videos that have gone public.

Reads pending-comments.json (written by youtube_upload.py). For each entry whose video is now
public, posts the comment as the channel and removes the entry. Entries for videos that are still
private stay queued; entries whose video was deleted are dropped. Pinning is not possible through
the API: pin the comment in Studio or the YouTube app.

Env (from GitHub secrets, never printed): YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_SHORTS,
YT_REFRESH_EXPLAINED. The refresh tokens need the youtube.force-ssl scope.
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

PENDING = "pending-comments.json"
TOKENS = {"shorts": "YT_REFRESH_SHORTS", "explained": "YT_REFRESH_EXPLAINED"}


def say(line: str) -> None:
    print(line)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(line + "\n")


def client(channel: str):
    creds = Credentials(token=None, refresh_token=os.environ[TOKENS[channel]],
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        token_uri="https://oauth2.googleapis.com/token")
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def main() -> None:
    if not os.path.exists(PENDING):
        print("nothing queued"); return
    pending = json.load(open(PENDING, encoding="utf-8"))
    keep, failed, clients = [], False, {}
    for e in pending:
        try:
            yt = clients.setdefault(e["channel"], client(e["channel"]))
            items = yt.videos().list(part="status", id=e["videoId"]).execute().get("items", [])
            if not items:
                say(f"- {e['videoId']}: video no longer exists; comment dropped"); continue
            if items[0]["status"]["privacyStatus"] != "public":
                print(f"{e['videoId']}: not public yet"); keep.append(e); continue
            yt.commentThreads().insert(part="snippet", body={"snippet": {
                "videoId": e["videoId"],
                "topLevelComment": {"snippet": {"textOriginal": e["comment"]}}}}).execute()
            say(f"- Comment posted on https://youtu.be/{e['videoId']} ({e['channel']}). Pin it in Studio.")
        except HttpError as err:
            say(f"- **{e['videoId']}: comment failed:** {err.resp.status} {err._get_reason()}")
            keep.append(e); failed = True
    with open(PENDING, "w", encoding="utf-8") as f:
        json.dump(keep, f, indent=2, ensure_ascii=False)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
