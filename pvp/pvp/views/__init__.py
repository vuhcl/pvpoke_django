from django.shortcuts import render
from django.views.decorators.http import require_GET
from django.http import HttpRequest
from django.http import HttpResponse
from django_htmx.middleware import HtmxDetails

class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails

@require_GET
def index(request: HtmxHttpRequest) -> HttpResponse:
    battle = {
        "src": "battle",
        "name": "Battle",
        "description": "Simulate a battle between two custom Pokemon."
        }
    rankings = {
        "src": "rankings",
        "name": "Rankings",
        "description": "Explore the rankings, movesets, and counters for the top Pokemon in each league."
        }
    team_builder = {
        "src": "team",
        "name": "Team Builder",
        "description": "Build your own team and see their type matchups and potential counters."
    }
    return render(request,'index.html', {"items": [battle, rankings, team_builder]})
