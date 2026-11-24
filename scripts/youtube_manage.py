"""Edit or delete videos that are already uploaded.

Reads manage.json: a list of actions, run in order:
  {"channel": "shorts"|"explained", "videoId": "...", "action": "replace_text", "find": "...", "replace": "..."}
      replaces text in the description (fails if `find` isn't there); everything else is resent unchanged
  {"channel": ..., "videoId": "...", "action": "delete", "title": "<exact current title>"}
      deletes the video, only if its current title matches exactly (guards against a wrong id)
  {"channel": ..., "videoId": "...", "action": "publish", "title": "<exact current title>"}
      makes a private or scheduled video public now (drops publishAt), only if its title matches exactly
Credentials: YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_SHORTS / YT_REFRESH_EXPLAINED (never printed).
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKENS = {"shorts": "YT_REFRESH_SHORTS", "explained": "YT_REFRESH_EXPLAINED"}
SNIPPET_KEYS = ("title", "description", "tags", "categoryId", "defaultLanguage", "defaultAudioLanguage")


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
    failed = False
    for it in json.load(open("manage.json", encoding="utf-8")):
        ch, vid, act = it["channel"], it["videoId"], it["action"]
        yt = client(ch)
        found = yt.videos().list(part="snippet", id=vid).execute().get("items", [])
        if not found:
            say(f"- {vid} ({ch}): not found"); failed = True; continue
        sn = found[0]["snippet"]
        if act == "delete":
            if sn["title"] != it.get("title"):
                say(f"- {vid}: NOT deleted, title is {sn['title']!r}, manage.json says {it.get('title')!r}"); failed = True; continue
            yt.videos().delete(id=vid).execute()
            say(f"- {vid} ({ch}): deleted ({sn['title']})")
        elif act == "replace_text":
            if it["find"] not in sn.get("description", ""):
                say(f"- {vid}: {it['find']!r} not in the description, nothing changed"); failed = True; continue
            snippet = {k: sn[k] for k in SNIPPET_KEYS if k in sn}
            snippet["description"] = sn["description"].replace(it["find"], it["replace"])
            yt.videos().update(part="snippet", body={"id": vid, "snippet": snippet}).execute()
            say(f"- {vid} ({ch}): description now has {it['replace']!r} instead of {it['find']!r}")
        elif act == "publish":
            if sn["title"] != it.get("title"):
                say(f"- {vid}: NOT published, title is {sn['title']!r}, manage.json says {it.get('title')!r}"); failed = True; continue
            cur = yt.videos().list(part="status", id=vid).execute()["items"][0]["status"]
            st = {k: cur[k] for k in ("license", "embeddable", "publicStatsViewable", "selfDeclaredMadeForKids", "containsSyntheticMedia") if k in cur}
            if "selfDeclaredMadeForKids" not in st:
                st["selfDeclaredMadeForKids"] = cur.get("madeForKids", False)
            st["privacyStatus"] = "public"
            st["publishAt"] = None  # an explicit null clears a schedule; leaving it out keeps the video private until then
            yt.videos().update(part="status", body={"id": vid, "status": st}).execute()
            now = yt.videos().list(part="status", id=vid).execute()["items"][0]["status"]
            say(f"- {vid} ({ch}): privacy now {now.get('privacyStatus')}, publish at {now.get('publishAt', 'none')}")
        else:
            say(f"- unknown action {act!r}"); failed = True
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
