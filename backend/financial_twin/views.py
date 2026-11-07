from rest_framework.decorators import api_view
from rest_framework.response import Response

from .engine import run_simulation


@api_view(["POST"])
def simulate(request):
    try:
        return Response(run_simulation(request.data))
    except (KeyError, ValueError, TypeError) as e:
        return Response({"error": "Bad input: " + str(e)}, status=400)
