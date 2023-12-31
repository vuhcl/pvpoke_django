import json
from functools import lru_cache
from django.core.paginator import Paginator
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from pvp.models import Format, Pokemon, Scenario, FastMove

from . import HtmxHttpRequest

@lru_cache
def load_ranking_context(format="all", cp="1500", category="overall"):
    with open(f"pvp/fixtures/rankings/{format}/{category}/rankings-{cp}.json") as file:
        rankings = json.load(file)
    for i in range(len(rankings)):
        rankings[i]["position"] = i+1
    return rankings

@lru_cache
def get_moveset_at_position(format:str, cp:str, category:str, pos: int):
    item = load_ranking_context(format, cp, category)[pos-1]
    pokemon = Pokemon.objects.get(species_id=item.get('speciesId'))
    moveset = item.get("moveset")
    return pokemon, moveset

def get_page_by_request(request, queryset, paginate_by=20):
    return Paginator(queryset, per_page=paginate_by).get_page(request.GET.get("page", default=1))

@require_GET
def rankings(request: HtmxHttpRequest, format="all", cp="1500", category="overall") -> HttpResponse:
    format_obj = Format.objects.get(cup=format, cp=cp)
    scenario_obj, create = Scenario.objects.get_or_create(format=format_obj, category=category)
    rankings = load_ranking_context(format, cp, category)
    if request.htmx:
        template = "ranking_table.html"
        return render(request, template, {"rankings": get_page_by_request(request, rankings),})
    else:
        formats = Format.objects.filter(show=True)
        template = 'rankings.html'
        return render(request,
                      template, 
                      {
                          "current_scenario": scenario_obj,
                          "formats": formats,
                          "categories": ["overall", "leads", "closers", "switches", "chargers", "attackers", "consistency"],
                          }
                      )
    
@require_GET
def get_move(request: HtmxHttpRequest, format:str, cp:str, category:str, pos: int) -> HttpResponse:
    pokemon_obj, moveset = get_moveset_at_position(format, cp, category, pos)
    
    return render(request, "move_tab.html", 
                  {
                      "fast_moves": pokemon_obj.fast_moves.all(), 
                      "charged_moves": pokemon_obj.charged_moves.all(),
                      "pokemon": pokemon_obj,
                      "moveset": moveset
                      }
                  )
