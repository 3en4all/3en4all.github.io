"""Regenerates the "now" card in data/status.json from public facts (Microsoft Store + GitHub commits).

Run by .github/workflows/now.yml. `python now.py test` runs the self-check.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

STATUS = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'status.json')
OWNER = '3en4all'
DAYS = 14


def get(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'status-bot', **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.status, res.read().decode('utf-8', 'replace')


def in_store(product_id):
    # Store API, not apps.microsoft.com (that page returns 403 to scripts).
    try:
        code, _ = get(f'https://storeedgefd.dsx.mp.microsoft.com/v9.0/products/{product_id}'
                      '?market=PL&locale=pl-PL&deviceFamily=Windows.Desktop')
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise  # outage: fail the run instead of dropping apps from the card
    return code == 200


def commit_count(repo, since):
    headers = {'Accept': 'application/vnd.github+json'}
    if os.environ.get('GITHUB_TOKEN'):
        headers['Authorization'] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    # shortcut: max 100 commits per repo counted, enough for a 14-day window.
    _, body = get(f'https://api.github.com/repos/{OWNER}/{repo}/commits?since={since}&per_page=100', headers)
    return len(json.loads(body))


def build_now(store_names, activity):
    """store_names: names live in the Store; activity: {repo: commits in last DAYS days}."""
    top = max(activity, key=activity.get) if activity and max(activity.values()) > 0 else None
    pl, en = [], []
    if store_names:
        pl.append('W Microsoft Store: ' + ', '.join(store_names) + '.')
        en.append('In the Microsoft Store: ' + ', '.join(store_names) + '.')
    if top:
        pl.append(f'Najwięcej zmian w ostatnich {DAYS} dniach: {top} ({activity[top]} commitów).')
        en.append(f'Most active in the last {DAYS} days: {top} ({activity[top]} commits).')
    if not pl:
        return None
    return {
        'title': 'Aplikacje 3EN w Microsoft Store' if store_names else 'Bieżące prace 3EN',
        'title_en': '3EN apps in the Microsoft Store' if store_names else 'Current 3EN work',
        'body': ' '.join(pl),
        'body_en': ' '.join(en),
    }


def main():
    with open(STATUS, encoding='utf-8') as f:
        status = json.load(f)
    since = (datetime.now(timezone.utc) - timedelta(days=DAYS)).strftime('%Y-%m-%dT%H:%M:%SZ')
    store_names = [name for name, pid in status.get('store', {}).items() if in_store(pid)]
    activity = {repo: commit_count(repo, since) for repo in status.get('repos', [])}
    now = build_now(store_names, activity)
    if not now or now == status.get('now'):
        print('no change')
        return
    status['now'] = now
    status['updated_at'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    with open(STATUS, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(status, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('updated:', now['body'])


def test():
    assert build_now([], {}) is None
    assert build_now([], {'a': 0}) is None
    n = build_now(['X', 'Y'], {'a': 2, 'b': 5})
    assert n['body'] == 'W Microsoft Store: X, Y. Najwięcej zmian w ostatnich 14 dniach: b (5 commitów).', n
    assert build_now([], {'a': 1})['title'] == 'Bieżące prace 3EN'
    print('test ok')


if __name__ == '__main__':
    test() if sys.argv[1:] == ['test'] else main()
