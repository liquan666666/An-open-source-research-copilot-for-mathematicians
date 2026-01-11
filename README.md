# An Open-Source Research Copilot for Mathematicians

**An explainable research copilot for mathematicians**

An open-source research execution system designed for mathematicians.  
It helps turn vague research ideas into **executable, supervised, and explainable daily research tasks**.

> This is not a theorem prover.  
> It is a system for **doing mathematical research consistently**.

---

## Why this project?

Most existing research tools focus on:
- what a theorem says
- which papers are relevant

However, real mathematical research often struggles with:
- not knowing what to do today
- reading papers without a concrete plan
- getting stuck without structured feedback
- invisible or unmeasurable progress

**This project focuses on research execution, not just information retrieval.**

---

## Key Features

- 🎯 Research topic recommendation based on researcher profile
- 📚 arXiv-based paper search and open-access (OA) download
- ⭐ Focus papers with user-defined reading page ranges
- 🧭 Hybrid theory / computation research roadmaps
- 📅 Daily executable research tasks with Definition of Done (DoD)
- 🎚 Automatic and manual control of theory/computation task ratio
- 🔍 Fully explainable task → paper → page → source linkage

---

## Typical Workflow

1. Define your research profile (MSC, keywords, preferences)
2. Receive recommended research topics
3. Generate a research roadmap
4. Select focus papers and annotate reading ranges
5. Receive daily executable research tasks
6. Check in progress and continuously refine your research direction

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians.git
cd An-open-source-research-copilot-for-mathematicians
docker compose up --build
```

### Option 2: Local Setup (Without Docker)

**Requirements:**
- Node.js 18+
- Python 3.11+
- pip

**Steps:**
```bash
git clone https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians.git
cd An-open-source-research-copilot-for-mathematicians

# Install dependencies
cd apps/web && npm install && cd ../..
pip install --user fastapi uvicorn sqlalchemy pydantic requests

# Start services
./start-local.sh
```

**Access the application:**
- Web UI: http://localhost:3000
- API Docs: http://localhost:8000/docs
