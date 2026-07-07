# BigQuery Release Notes App

A full-stack Flask and Vanilla JS application that aggregates official Google BigQuery release notes and presents them in a sleek, interactive dashboard with easy social sharing capabilities.

## 🚀 Features

- **Automated XML Ingestion:** Fetches the official Google Cloud Atom XML feed for BigQuery and parses it dynamically.
- **Smart Category Tagging:** Extracts categories (Feature, Change, Fix) from HTML nodes and renders visual badges.
- **X/Twitter Integration:** Compose and pre-populate safe tweets of any update with a single click.
- **Modern Dark UI:** Responsive design built with CSS variables, smooth skeleton states, and slide-up toast notifications.
- **Error Resiliency:** Clean client/server error boundaries handling network issues gracefully.

---

## 🛠️ Project Structure

```text
bq-releases-notes/
├── app.py                      # Flask backend & XML ingestion
├── requirements.txt            # Python dependencies
├── templates/
│   └── index.html              # Frontend shell layout
└── static/
    ├── css/
    │   └── style.css           # Styling, animations, layout
    └── js/
        └── app.js              # Client state, rendering, sharing logic
```

---

## 💻 Local Setup

### Prerequisites

- Python 3.8 or higher installed on your machine.

### Installation

1. Navigate to the project directory:
   ```bash
   cd bq-releases-notes
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the App

1. Run the Flask development server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to:
   ```text
   http://127.0.0.1:5000/
   ```

---

## 🔧 Technologies Used

- **Backend:** [Flask](https://flask.palletsprojects.com/) & [Requests](https://requests.readthedocs.io/)
- **Frontend:** Vanilla HTML5, CSS3, and JavaScript (ES6)
- **Data Source:** [Google Cloud BigQuery Release Notes RSS Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml)
