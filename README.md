<div align="center">

# 🔮 FinTwin

### Don't just track your money. Stress-test it.

A digital twin of your personal finances that simulates job loss, medical bills, cost hikes and market crashes, and shows you the *range* of futures that could follow.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Angular](https://img.shields.io/badge/Angular-frontend-DD0031?logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Socket.IO-339933?logo=nodedotjs&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST-092E20?logo=django&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-Monte%20Carlo-013243?logo=numpy&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-fan%20chart-F9A03C?logo=d3dotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## 💡 The idea

Most finance apps answer one question: **"What happened to my money?"**

FinTwin tries to answer a different one: **"What could happen to my finances if something changes?"**

You enter your income, expenses, savings and debt. FinTwin turns that into a virtual copy of your finances (the *twin*). Then you hit it with a shock, such as *"my income stops for 6 months"*, and it runs a **Monte Carlo simulation**: hundreds of slightly different possible futures, drawn together as a **fan chart**.

> We are **not** predicting what *will* happen. We are showing what *could* happen under a given scenario, so people can prepare before a crisis, not after.

### Why this exists

A fresher losing a job is hard. Someone with EMIs, school fees, medical costs and a household to run faces a much bigger problem. Work is changing, and income feels less predictable than it used to. Being able to see the impact *in advance* is useful.

---

## ✨ What FinTwin does

- 🧬 **Builds a digital twin** of a user's financial profile (income, expenses, savings, debt)
- ⚡ **Applies shock scenarios** to the twin, not to the real data
- 🎲 **Runs a Monte Carlo simulation** (500 futures over 24 months)
- 📈 **Draws a fan chart** where each line is one possible future
- 🚨 **Shows risk**: probability of going below zero, and when it typically happens
- 🔁 **Keeps the twin in sync** when the user updates their profile

### Planned scenarios

All four use the **same engine**. Only the parameters change.

| Scenario | What changes in the simulation |
|---|---|
| 💼 Job Loss | Income drops (to 0 or a % of normal) for N months, then resumes |
| 🏥 Medical Emergency | One-time lump-sum expense |
| 🏠 Rent / Cost-of-Living Hike | Monthly expenses rise by a % from the shock point |
| 📉 Market Crash / Investment Loss | One-time % cut to savings/investments |

---

## 🧠 How the simulation works

Real life is noisy. Nobody spends exactly the same amount every month. So instead of one calculation, FinTwin runs many:

1. Start from the user's savings.
2. Each month, randomize expenses with a **Normal distribution** (mean = 1.0×, std dev = 0.1×).
3. Apply the shock (for example, income = 0 for the first 6 months).
4. Record the balance. Repeat for **24 months**.
5. Repeat the whole thing **500 times**.

The result is a 500 × 24 grid of balances: 500 possible futures. The early months are tightly packed; later months spread out because small random changes add up. That spread is the **fan** in the fan chart.

```python
import numpy as np

def monte_carlo(income, expenses, savings, shock_months=6, n_sims=500, months=24):
    paths = np.zeros((n_sims, months))
    for i in range(n_sims):
        balance = savings
        for m in range(months):
            monthly_expense = expenses * np.random.normal(1, 0.1)
            monthly_income = 0 if m < shock_months else income
            balance += monthly_income - monthly_expense
            paths[i, m] = balance
    return paths  # shape: (500, 24)
```

> ⚠️ **Honest limits:** the variation is a simplified assumption, not calibrated against real economic data. Outputs are *illustrative ranges*, not financial advice.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A[Angular<br/>dashboard + D3 fan chart] -- Socket.IO event --> B[Node.js<br/>real-time relay]
    B -- REST / HTTP --> C[Django REST API]
    C --> D[NumPy<br/>Monte Carlo engine]
    D --> C
    C -- JSON result --> B
    B -- Socket.IO event --> A
    C --- E[(Database)]
```

**Flow:** `Angular → Node.js → Django → NumPy → Django → Node.js → Angular`

| Layer | Job | What it does *not* do |
|---|---|---|
| **Angular** | UI, forms, scenario picker, fan chart | No simulation maths |
| **Node.js + Socket.IO** | Real-time relay between browser and backend | **Does not run the simulation** |
| **Django REST** | API, data models, calls the engine, stores results | No real-time delivery |
| **NumPy** | Monte Carlo computation | Nothing else |

Why three layers? Each does one job: Python is best for the numerical work, Node for live updates, Angular for a structured UI.

### Planned socket events

| Event | Direction | Payload |
|---|---|---|
| `update_profile` | Angular → Node | `{ userId, income, expenses, savings, debt }` |
| `twin_updated` | Node → Angular | `{ status, timestamp }` |
| `run_simulation` | Angular → Node | `{ userId, scenario, severity }` |
| `simulation_progress` | Node → Angular | `{ percent }` *(optional)* |
| `simulation_result` | Node → Angular | `{ paths, stats }` |

Results are emitted only to the **requesting client**, not broadcast to everyone.

---

## 🧰 Tech stack

| Area | Tools |
|---|---|
| Frontend | Angular, Angular Material, D3.js, socket.io-client |
| Real-time layer | Node.js, Express, Socket.IO, Axios, CORS, dotenv |
| Backend | Django, Django REST Framework |
| Simulation | Python, NumPy (Pandas optional for summaries) |
| Database | SQLite for development, PostgreSQL optional |
| Optional later | Celery + Redis (background jobs), JWT auth |

---

## 🚦 Project status

> **Current progress: core simulation logic implemented; full-stack integration in progress.**

- [x] Monte Carlo simulation logic (standalone Python/NumPy)
- [x] Django REST endpoint for simulation
- [ ] Django models (user profile, simulation runs)
- [x] Node.js Socket.IO server
- [x] Node ↔ Django integration (Axios)
- [x] Angular profile form
- [x] Angular scenario picker
- [x] Fan chart component (drawn with SVG for now)
- [x] Results view (survival time, risk probability)
- [ ] Authentication

---

## 📁 Planned structure

```
fintwin/
├── client/          # Angular app (forms, scenario picker, D3 fan chart)
├── node-server/     # Express + Socket.IO relay
│   ├── server.js
│   ├── socketHandlers.js
│   └── djangoClient.js
├── backend/         # Django project + DRF API + simulation engine
├── docs/            # diagrams, screenshots, report
└── README.md
```

---

## 🚀 Getting started

> The scaffold is still being set up, so these steps are the intended workflow and will be updated as each part lands.

```bash
git clone https://github.com/<your-username>/fintwin.git
cd fintwin

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install django djangorestframework numpy
python manage.py runserver        # http://localhost:8000

# Node relay (new terminal)
cd node-server
npm install
npm start                         # http://localhost:4000

# Frontend (new terminal)
cd client
npm install
ng serve                          # http://localhost:4200
```

---

## 🤝 Contributing

This is a team project that is open to ideas. To keep things smooth:

1. **Pick a task** from the Issues tab (or open one).
2. **Create a branch** from `main`: `feature/<short-name>` or `fix/<short-name>`.
3. **Commit small and often**, with clear messages (`add scenario picker form`).
4. **Open a Pull Request** and ask a teammate to review it before merging.
5. **Never push directly to `main`.**

### Suggested split

| Area | Owner |
|---|---|
| Angular + D3 fan chart | _TBD_ |
| Node.js + Socket.IO | _TBD_ |
| Django + simulation engine | _TBD_ |

### Good first issues

- Add input validation to the financial profile form
- Add a fifth scenario preset
- Write unit tests for the Monte Carlo function
- Add a "reset twin" button
- Improve fan chart colours and labels

---

## 🔭 Future scope

- Live bank/account sync instead of manual entry
- Compare multiple scenarios side by side
- Rule-based recommendations from simulation output (for example, "build a 2-month buffer")
- Mobile version
- Calibrating variation using real economic data

---

## ⚠️ Disclaimer

FinTwin is an academic project. Its simulations rely on simplified assumptions and are **not financial advice**.

---

<div align="center">

*We don't predict one future. We help users understand the possibilities.*

⭐ Star the repo if you like the idea.

</div>
