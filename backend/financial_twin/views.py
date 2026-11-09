from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .engine import run_simulation
from .models import SimulationRun

INPUT_KEYS = ("earn", "spend", "loan", "saved", "cut", "add")


def _token_response(user):
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})


@api_view(["POST"])
def register(request):
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    if len(username) < 3 or len(password) < 6:
        return Response({"error": "Username needs 3+ characters and password 6+."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({"error": "That username is taken."}, status=400)
    return _token_response(User.objects.create_user(username=username, password=password))


@api_view(["POST"])
def login(request):
    user = authenticate(username=str(request.data.get("username", "")).strip(),
                        password=str(request.data.get("password", "")))
    if user is None:
        return Response({"error": "Wrong username or password."}, status=401)
    return _token_response(user)


@api_view(["POST"])
def simulate(request):
    try:
        result = run_simulation(request.data)
    except (KeyError, ValueError, TypeError) as e:
        return Response({"error": "Bad input: " + str(e)}, status=400)

    if request.data.get("save") is True and request.user.is_authenticated:
        SimulationRun.objects.create(
            user=request.user,
            scenario=request.data["scenario"],
            value=float(request.data["value"]),
            inputs={k: request.data.get(k) for k in INPUT_KEYS},
            risk=result["risk"],
            median_first_negative=result["medianFirstNegative"],
            buffer=result["buffer"],
            end_likely=result["endLikely"],
        )
    return Response(result)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def runs(request):
    mine = SimulationRun.objects.filter(user=request.user)
    if request.method == "DELETE":
        mine.delete()
        return Response(status=204)
    return Response([
        {"id": r.id, "key": r.scenario, "value": r.value, "risk": round(r.risk),
         "ts": int(r.created_at.timestamp() * 1000)}
        for r in mine[:30]
    ])
