from django.shortcuts import render
from django.views.decorators.http import require_GET
from django.http import HttpResponse
import json
from pvp.models import Format
from . import HtmxHttpRequest

@require_GET
def rankings(request: HtmxHttpRequest, format="all", cp="1500", category="overall") -> HttpResponse:
    context = {"current_format": format, "current_cp": cp, "current_category": category,}
    if request.htmx:
        template = "ranking_table.html"
        with open(f"pvp/fixtures/rankings/{format}/{category}/rankings-{cp}.json") as file:
            rankings = json.load(file)
        
        context["rankings"] = rankings
    else:
        formats = Format.objects.all()
        template = 'rankings.html'
        context['formats'] = formats
        context['categories'] = ["overall", "leads", "closers", "switches", "chargers", "attackers", "consistency"]
    return render(request, template, context,)
        