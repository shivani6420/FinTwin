# Contributing to FinTwin

Thanks for helping out! FinTwin is a small team project, so we keep the process simple.

## Before you start

- Read the [README](README.md) to understand the idea and the architecture.
- Check the **Issues** tab for something to work on, or open a new issue to propose your idea.
- Comment on the issue so nobody else picks up the same task.

## Workflow

1. Fork the repo (or create a branch if you are a team member).
2. Create a branch from `main`:
   - `feature/<short-name>` for new things (e.g. `feature/scenario-picker`)
   - `fix/<short-name>` for bug fixes
3. Make your changes in small, focused commits.
4. Push your branch and open a **Pull Request** into `main`.
5. Ask a teammate to review. Merge only after at least one approval.

Please **never push directly to `main`**.

## Commit messages

Keep them short and clear, in the present tense:

- `add job loss scenario to simulation`
- `fix fan chart axis labels`
- `update README setup steps`

## Where things live

| Folder | What it is |
|---|---|
| `client/` | Angular app (forms, scenario picker, SVG fan chart) |
| `node-server/` | Express + Socket.IO real-time relay |
| `backend/` | Django REST API and the Monte Carlo engine |
| `docs/` | Diagrams, screenshots, report |

A quick reminder of how the layers fit together: the Node server only relays messages. The simulation maths lives in Django (NumPy).

## Pull request checklist

- [ ] The change does what the issue or PR description says
- [ ] The app (or the part you touched) still runs
- [ ] No secrets, `.env` files or personal data committed
- [ ] README or docs updated if behaviour changed

## Reporting bugs or suggesting ideas

Open an issue and include:

- What you expected to happen
- What actually happened
- Steps to reproduce (for bugs)
- Screenshots if it is a UI problem

## Code of Conduct

Be kind and respectful. By taking part, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## A note on scope

FinTwin is an academic project. Its simulations are simplified and are not financial advice, so please keep contributions in that spirit.
