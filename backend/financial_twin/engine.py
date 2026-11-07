import numpy as np

def run_simulation(profile, scenario, n_sims=500, months=24, sigma=0.10, seed=None):
    rng = np.random.default_rng(seed)

    income = float(profile["income"])
    expenses = float(profile["expenses"])
    emi = float(profile["emi"])
    savings = float(profile["savings"])
    investments = float(profile["investments"])

    monthly_income = np.full(months, income)
    monthly_expenses = np.full(months, expenses)
    extra_cost = np.zeros(months)

    kind = scenario["type"]
    params = scenario.get("params", {})

    if kind == "job_loss":
        monthly_income[:params["months"]] *= params.get("retain", 0) / 100

    elif kind == "cost_hike":
        monthly_expenses[params.get("at", 1) - 1:] *= 1 + params["pct"] / 100

    elif kind == "medical":
        extra_cost[params.get("at", 1) - 1] = params["lump"]

    elif kind == "market_crash":
        extra_cost[params.get("at", 1) - 1] = investments * params["pct"] / 100

    starting_balance = savings + investments

    random_factor = rng.normal(1.0, sigma, size=(n_sims, months))
    monthly_balance = (
        monthly_income
        - monthly_expenses * random_factor
        - emi
        - extra_cost
    )

    paths = np.hstack([
        np.full((n_sims, 1), starting_balance),
        starting_balance + np.cumsum(monthly_balance, axis=1)
    ])

    went_negative = (paths < 0).any(axis=1)
    first_negative = np.argmax(paths < 0, axis=1)[went_negative]

    low_point = np.percentile(paths.min(axis=1), 5)
    bands = np.percentile(paths, [5, 25, 50, 75, 95], axis=0)

    return {
        "bands": bands.round(0).tolist(),
        "sample_paths": paths[:100].round(0).tolist(),
        "stats": {
            "risk_pct": float(went_negative.mean() * 100),
            "median_first_negative_month": int(np.median(first_negative)) if first_negative.size else None,
            "low_point_p5": float(low_point),
            "median_end": float(np.median(paths[:, -1])),
            "buffer_needed": float(max(0, np.ceil(-low_point / 1000) * 1000))
        }
    }