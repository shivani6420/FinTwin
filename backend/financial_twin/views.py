from rest_framework.decorators import api_view
from rest_framework.response import Response
from .engine import run_simulation

@api_view(["POST"])
def simulate(request):
    data = request.data

    result = run_simulation(
        data["profile"],
        data["scenario"],
        n_sims=data.get("n_sims", 500),
        seed=data.get("seed")
    )

    return Response(result)