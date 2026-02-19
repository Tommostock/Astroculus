# 🌌 Astroculus

A production-ready automated system that fetches newly released images from major space missions, scores them by scientific interest, and generates structured reports — all with zero manual input after setup.

---

## 🗂 Project Structure

```
astroculus/
├── main.py                    # Entry point — run this
├── dashboard.py               # Optional local web dashboard
├── requirements.txt
├── .env.example               # Copy to .env and configure
│
├── src/
│   ├── config.py              # All settings (env vars)
│   ├── state_manager.py       # Persistent state (last_run, images.json)
│   ├── processor.py           # Image categorization & metadata enrichment
│   ├── scorer.py              # Interest Score engine (0–100)
│   ├── report_generator.py    # Markdown daily report
│   ├── downloader.py          # Image file downloader
│   ├── email_digest.py        # Email digest generator + SMTP sender
│   └── fetchers/
│       ├── base.py            # HTTP client with retry/backoff
│       ├── apod.py            # NASA Astronomy Picture of the Day
│       ├── mars_rovers.py     # Curiosity & Perseverance latest photos
│       └── nasa_library.py    # NASA Image Library (JWST, Hubble)
│
├── data/
│   ├── images.json            # Full image dataset (all runs)
│   ├── last_run.json          # Timestamp of last successful run
│   ├── monthly_stats.json     # Mission image counts by month
│   ├── reports/               # Markdown reports by date
│   ├── digests/               # Email digests by date
│   └── downloads/             # Downloaded images organized by mission
│       ├── jwst/
│       ├── hubble/
│       ├── curiosity/
│       ├── perseverance/
│       └── apod/
│
└── logs/                      # Execution logs
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Get a free NASA API key
Visit [https://api.nasa.gov](https://api.nasa.gov) — registration takes 30 seconds.
The `DEMO_KEY` works but has lower rate limits.

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your NASA_API_KEY
```

### 4. Run
```bash
python main.py
```

### 5. Optional: Load environment from .env
```bash
export $(grep -v '^#' .env | xargs) && python main.py
```

---

## ⏰ Automated Scheduling

### Cron (Linux/macOS)
Run daily at 6:00 AM:
```cron
0 6 * * * cd /path/to/astroculus && /usr/bin/python3 main.py >> logs/cron.log 2>&1
```

Edit with: `crontab -e`

### Windows Task Scheduler
```powershell
schtasks /create /tn "Astroculus" /tr "python C:\path\to\astroculus\main.py" /sc daily /st 06:00
```

### GitHub Actions / CI (runs daily at 7am UTC)
```yaml
name: Astroculus
on:
  schedule:
    - cron: '0 7 * * *'
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt
      - run: python main.py
        env:
          NASA_API_KEY: ${{ secrets.NASA_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: astroculus-data
          path: data/
```

---

## 📊 Data Sources

| Source | API | Coverage |
|--------|-----|----------|
| NASA APOD | `api.nasa.gov/planetary/apod` | Daily astronomy image |
| Mars Curiosity | `api.nasa.gov/mars-photos` | Latest sol photos |
| Mars Perseverance | `api.nasa.gov/mars-photos` | Latest sol photos |
| NASA Image Library | `images-api.nasa.gov/search` | JWST, Hubble & general |

---

## 🧠 Interest Score (0–100)

Each image is scored across 6 dimensions:

| Component | Max Points | Signals |
|-----------|-----------|---------|
| Mission Prestige | 25 | JWST=25, Hubble=20, APOD=15, Rovers=10–12 |
| Instrument Weight | 20 | NIRCam=20, MIRI=18, NIRSpec=16, WFC3=14 |
| Science Keywords | 20 | dark matter, biosignature, exoplanet, etc. |
| Caption Richness | 15 | Length & detail of description |
| Category Bonus | 10 | Galaxy/Nebula highest; Mars Surface lower |
| Novelty Signals | 10 | "first ever", "discovery", "unprecedented" |

---

## 🗃 Output Files

| File | Contents |
|------|----------|
| `data/images.json` | Full structured dataset of all images |
| `data/last_run.json` | Timestamp — controls incremental fetching |
| `data/monthly_stats.json` | Mission activity counts by month |
| `data/reports/report_YYYY-MM-DD.md` | Daily Markdown report |
| `data/digests/digest_YYYY-MM-DD.txt` | Email-ready digest |
| `data/downloads/{mission}/{YYYY-MM}/` | Downloaded image files |

---

## 🌐 Web Dashboard

Start the local dashboard:
```bash
pip install flask
python dashboard.py
# Open http://localhost:5000
```

Features:
- Live stats (total images, missions, top score)
- Image of the Day banner
- Mission activity bar chart
- Top 12 images with thumbnails
- Auto-refreshes every 60 seconds

---

## 📧 Email Digest

Set environment variables in `.env`:
```
EMAIL_FROM=you@example.com
EMAIL_TO=recipient@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
```

Then in `main.py`, uncomment:
```python
digest.send(scored, run_date, config)
```

For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833).

---

## 🔧 Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NASA_API_KEY` | `DEMO_KEY` | NASA API key (get free at api.nasa.gov) |
| `APOD_COUNT` | `10` | APOD images to fetch per run |
| `MARS_PHOTOS_PER_SOL` | `25` | Mars photos per rover per run |
| `NASA_LIBRARY_PAGE_SIZE` | `20` | Results per page |
| `NASA_LIBRARY_MAX_PAGES` | `3` | Max pages per query |
| `DOWNLOAD_IMAGES` | `true` | Enable/disable image downloads |
| `MAX_DOWNLOAD_MB` | `50` | Skip images larger than this |
| `API_RETRY_ATTEMPTS` | `3` | Retry count on API failures |
| `API_RETRY_DELAY` | `2.0` | Backoff factor (seconds) |

---

## ✅ Design Principles

- **Idempotent**: Safe to re-run. Duplicate images are skipped by ID.
- **Atomic writes**: State files written via temp→rename to prevent corruption.
- **Graceful failure**: One failed source doesn't abort the entire run.
- **Incremental**: Only fetches images newer than the last run timestamp.
- **Modular**: Each layer (fetch / process / score / report) is independent.

---

## 🧪 First Run Behavior

On the first run (`last_run.json` doesn't exist), the monitor fetches recent images from each source within their default lookback windows (typically 10–30 images per source). Subsequent runs only fetch what's new since the last run.
