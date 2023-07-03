from django.core.paginator import Paginator
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from pvp.models import Format, Ranking, Scenario

from . import HtmxHttpRequest

def get_page_by_request(request, queryset, paginate_by=24):
    return Paginator(queryset, per_page=paginate_by).get_page(request.GET.get("page"))

@require_GET
def rankings(request: HtmxHttpRequest, format="all", cp="1500", category="overall", pnum="1") -> HttpResponse:
    format_obj = Format.objects.get(cup=format, cp=cp)
    scenario_obj = Scenario.objects.get(format=format_obj, category=category)

    if request.htmx:
        template = "ranking_table.html"
        rankings = Ranking.objects.filter(scenario=scenario_obj)
        return render(request,
                      template, {
                          "current_scenario": scenario_obj,
                          "rankings": get_page_by_request(request, rankings),
                          }
                      )
    else:
        formats = Format.objects.filter(show=True)
        template = 'rankings.html'
        return render(request,
                      template, {
                          "current_scenario": scenario_obj,
                          "formats": formats,
                          "categories": ["overall", "leads", "closers", "switches", "chargers", "attackers", "consistency"],
                          }
                      )
