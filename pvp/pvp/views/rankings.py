from django.shortcuts import render
from django.core.paginator import Paginator
from django.views.decorators.http import require_GET
from django.http import HttpResponse
import json
from pvp.models import Format
from . import HtmxHttpRequest

def get_page_by_request(request, queryset, paginate_by=24):
    return Paginator(queryset, per_page=paginate_by).get_page(request.GET.get("page"))

@require_GET
def rankings(request: HtmxHttpRequest, format="all", cp="1500", category="overall", pnum="1") -> HttpResponse:
    context = {"current_format": format, "current_cp": cp, "current_category": category,}
    if request.htmx:
        template = "ranking_table.html"
        with open(f"pvp/fixtures/rankings/{format}/{category}/rankings-{cp}.json") as file:
            rankings = json.load(file)
        context["rankings"] = get_page_by_request(request, rankings)
    else:
        formats = Format.objects.all()
        template = 'rankings.html'
        context['formats'] = formats
        context['categories'] = ["overall", "leads", "closers", "switches", "chargers", "attackers", "consistency"]
    return render(request, template, context,)
        