#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen


CLOUDFLARE_GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql"

ACCOUNT_ID = "8ec1c8fd7f91c44b2fc8db5ee57c7374"

# This is the Web Analytics site tag from your Cloudflare beacon.
SITE_TAG = "caa49ccd47154b36993a55b7124c8528"

HOSTNAME = "greekweather.github.io"

POST_PREFIX = "/allgreeceweather/posts/"

DAYS = 7
LIMIT = 1000
TOP_POSTS = 5

OUTPUT_FILE = Path("data/top-posts.json")


def query_cloudflare(start: datetime, end: datetime) -> list[dict]:
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN")

    if not api_token:
        print("ERROR: CLOUDFLARE_API_TOKEN is not set.", file=sys.stderr)
        sys.exit(1)

    query = """
    query TopPages(
        $accountTag: String!,
        $siteTag: String!,
        $start: Time!,
        $end: Time!
    ) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          rumPageloadEventsAdaptiveGroups(
            filter: {
              siteTag: $siteTag
              requestHost: "greekweather.github.io"
              datetime_geq: $start
              datetime_leq: $end
            }
            limit: 1000
            orderBy: [count_DESC]
          ) {
            count
            dimensions {
              requestPath
            }
          }
        }
      }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "accountTag": ACCOUNT_ID,
            "siteTag": SITE_TAG,
            "start": start.isoformat().replace("+00:00", "Z"),
            "end": end.isoformat().replace("+00:00", "Z"),
        },
    }

    request = Request(
        CLOUDFLARE_GRAPHQL_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        print(f"ERROR: Cloudflare API request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    if result.get("errors"):
        print(
            "ERROR: Cloudflare GraphQL returned errors:",
            json.dumps(result["errors"], ensure_ascii=False, indent=2),
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        return (
            result["data"]["viewer"]["accounts"][0]
            ["rumPageloadEventsAdaptiveGroups"]
        )
    except (KeyError, IndexError, TypeError) as exc:
        print(
            "ERROR: Unexpected Cloudflare response:",
            json.dumps(result, ensure_ascii=False, indent=2),
            file=sys.stderr,
        )
        raise SystemExit(1) from exc


def build_top_posts(groups: list[dict]) -> list[dict]:
    posts = []

    for group in groups:
        dimensions = group.get("dimensions") or {}
        path = dimensions.get("requestPath")

        if not path or not path.startswith(POST_PREFIX):
            continue

        views = int(group.get("count") or 0)

        posts.append(
            {
                "path": path,
                "views": views,
            }
        )

    posts.sort(key=lambda post: post["views"], reverse=True)

    return posts[:TOP_POSTS]


def main() -> None:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=DAYS)

    groups = query_cloudflare(start, now)

    print(f"Cloudflare returned {len(groups)} page groups.")

    posts = build_top_posts(groups)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    output = {
        "updated_at": now.isoformat(),
        "period_days": DAYS,
        "posts": posts,
    }

    OUTPUT_FILE.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(posts)} top posts to {OUTPUT_FILE}")

    for index, post in enumerate(posts, start=1):
        print(
            f"{index}. "
            f"{post['views']} views — "
            f"{post['path']}"
        )


if __name__ == "__main__":
    main()
