"""Set "Altered content" = Yes and English language on videos that are already uploaded.

Reads video-flags.json: [{"channel": "shorts"|"explained", "videoId": "..."}]. For each video it
fetches the current snippet and status and sends them back with containsSyntheticMedia = true and
defaultLanguage / defaultAudioLanguage = "en". Everything else (title, tags, privacy, publishAt)
is resent unchanged, because videos.update clears any field it isn't given.
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKENS = {"shorts": "YT_REFRESH_SHORTS", "explained": "YT_REFRESH_EXPLAINED"}
SNIPPET_KEYS = ("title", "description", "tags", "categoryId", "defaultLanguage", "defaultAudioLanguage")
STATUS_KEYS = ("privacyStatus", "publishAt", "license", "embeddable", "publicStatsViewable",
               "selfDeclaredMadeForKids", "containsSyntheticMedia")


def say(line):
    print(line)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(line + "\n")


def client(channel):
    creds = Credentials(token=None, refresh_token=os.environ[TOKENS[channel]],
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        token_uri="https://oauth2.googleapis.com/token")
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def main():
    items = json.load(open("video-flags.json", encoding="utf-8"))
    failed = False
    for it in items:
        ch, vid = it["channel"], it["videoId"]
        yt = client(ch)
        found = yt.videos().list(part="snippet,status", id=vid).execute().get("items", [])
        if not found:
            say(f"- {vid}: not found on {ch}"); failed = True; continue
        v = found[0]
        snippet = {k: v["snippet"][k] for k in SNIPPET_KEYS if k in v["snippet"]}
        snippet["defaultLanguage"] = snippet["defaultAudioLanguage"] = "en"
        status = {k: v["status"][k] for k in STATUS_KEYS if k in v["status"]}
        status["containsSyntheticMedia"] = True
        r = yt.videos().update(part="snippet,status", body={"id": vid, "snippet": snippet, "status": status}).execute()
        st, sn = r["status"], r["snippet"]
        say(f"- {vid} ({ch}): altered content = {st.get('containsSyntheticMedia')}, "
            f"language = {sn.get('defaultLanguage')}/{sn.get('defaultAudioLanguage')}, "
            f"privacy = {st.get('privacyStatus')}, publishAt = {st.get('publishAt', 'none')}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
