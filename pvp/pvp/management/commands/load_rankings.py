from django.core.management.base import BaseCommand
from pvp.models import Format, Pokemon, Ranking, Matchup, Counter, Scenario
import json, glob

directory = "pvp/fixtures/rankings/"

def create_ranking(item, i:int, scenario:Scenario) -> Ranking:
        ranking, created = Ranking.objects.get_or_create(
            scenario=scenario,
            pokemon=Pokemon.objects.get(species_id=item.get("speciesId")),
            position=i+1,
            score=item.get("score", 0),
            moves=item.get("moves", None),
            moveset=item.get("moveset", []),
            scores=item.get("scores", []),
            stats=item.get("stats", None)
        )
        ranking.matchups.clear()
        for match_up in item.get("matchups", []):
            m = Matchup.objects.create(
                rating=match_up.get("rating"),
                opponent=Pokemon.objects.get(species_id=match_up.get("opponent")),
                pokemon=ranking
                )
        ranking.counters.clear()
        for counter in item.get("counters", []):
            c = Counter.objects.create(
                rating=counter.get("rating"),
                opponent=Pokemon.objects.get(species_id=counter.get("opponent")),
                pokemon=ranking
                )    
        return ranking

class Command(BaseCommand):
    help = 'Load JSON rankings data'

    def handle(self, debug=True, *args, **options):
        if debug:
            formats = Format.objects.filter(cup="all")
        else:
            formats = Format.objects.filter(show=True)
                        
        for format in formats:
            for filename in glob.iglob("pvp/fixtures/rankings/{format.cup}/*/rankings-*.json"):
                k = filename.find("/rankings-")
                begin = filename[:k].rfind("/")
                category = filename[begin+1: k]
                scenario = Scenario.objects.create(category=category, format=format)
                with open(filename) as file:
                    data = json.load(file)
                for i in range(len(data)):
                    create_ranking(data[i], i, scenario)
        
    