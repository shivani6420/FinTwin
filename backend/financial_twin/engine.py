import numpy as np

SIMS = 500
MONTHS = 24
SCENARIOS = {"job", "med", "hike", "crash"}


def run_simulation(data):
    earn = float(data["earn"])
    spend = float(data["spend"])
    loan = float(data["loan"])
    saved = float(data["saved"])
    cut = float(data.get("cut", 0))
    add = float(data.get("add", 0))
    keep = max(0.0, float(data.get("keep", 0)))
    key = data["scenario"]
    value = float(data["value"])
    seed = int(data.get("seed", 7))

    if key not in SCENARIOS:
        raise ValueError("unknown scenario")
    if min(earn, spend, loan, saved, cut, add, value) < 0:
        raise ValueError("numbers cannot be negative")

    rng = np.random.default_rng(seed)
    start = saved + add
    income = np.full(MONTHS, earn)
    expense = np.full(MONTHS, max(0.0, spend - cut))
    lump = np.zeros(MONTHS)

    if key == "job":
        income[: int(value)] = min(keep, earn)
    elif key == "hike":
        expense = expense * (1 + value / 100)
    elif key == "med":
        lump[0] = value
    elif key == "crash":
        lump[0] = start * value / 100

    noise = 1 + 0.1 * rng.standard_normal((SIMS, MONTHS))
    monthly = income - expense * noise - loan - lump
    paths = np.hstack([np.full((SIMS, 1), start), start + np.cumsum(monthly, axis=1)])

    below = paths < 0
    went_negative = below.any(axis=1)
    first = np.sort(np.argmax(below, axis=1)[went_negative])
    mins = np.sort(paths.min(axis=1))
    low = mins[int(0.05 * SIMS)]
    tough, likely, lucky = np.percentile(paths, [10, 50, 90], axis=0)

    return {
        "tough": tough.round(0).tolist(),
        "likely": likely.round(0).tolist(),
        "lucky": lucky.round(0).tolist(),
        "paths": paths[::12].round(0).tolist(),
        "risk": float(went_negative.mean() * 100),
        "medianFirstNegative": int(first[len(first) // 2]) if first.size else None,
        "buffer": float(max(0, np.ceil(-low / 1000) * 1000)),
        "minBalance": float(paths.min()),
        "maxBalance": float(paths.max()),
        "endLikely": float(likely[-1]),
        "sims": SIMS,
        "months": MONTHS,
    }



