from functools import lru_cache
from django.core.management.base import BaseCommand
from pvp.models import Format, Pokemon, Ranking, Matchup, Counter, Scenario
import json, glob

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

    def handle(self, *args, **options):
        dir = "pvp/pvp/fixtures/rankings"
        formats = Format.objects.filter(show=True)
                        
        for format in formats:
            for filename in glob.iglob(f'../{dir}/{format.cup}/*/rankings-{format.cp}.json'):
                print(filename)
                self.create_ranking_from_file(filename, format.cup, format.cp)
                
    @lru_cache()
    def create_ranking_from_file(self, file:str, cup:str, cp:int):   
        format = Format.objects.get(cup=cup, cp=cp)
        end = file.find("/rankings-")
        begin = file[:end].rfind("/")
        category = file[begin+1: end]
        scenario = Scenario.objects.create(category=category, format=format)
        obj_lst = []
        with open(file) as f:
            data = json.load(f)
        for i in range(len(data)):
            obj_lst.append(create_ranking(data[i], i, scenario))
        return obj_lst