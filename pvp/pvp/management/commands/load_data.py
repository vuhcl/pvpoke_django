from django.core.management.base import BaseCommand, CommandError
from pvp.models import Format, Pokemon, FastMove, ChargedMove, Tag
import json

class Command(BaseCommand):
    help = 'Load JSON data'

    def handle(self, *args, **options):
        Format.objects.all().delete()
        Pokemon.objects.all().delete()
        FastMove.objects.all().delete()
        ChargedMove.objects.all().delete()
        with open("pvp/fixtures/formats.json") as f:
            format_data = json.load(f)
        for format in format_data:
            if format["showFormat"]:
                Format.objects.create(title=format["title"], cup=format.get("cup"), cp=format["cp"], meta=format["meta"])
            
        with open("pvp/fixtures/moves.json") as f:
            move_data = json.load(f)
        for m in move_data:
            if m['energy'] == 0:
                FastMove.objects.create(
                    name=m["name"],
                    move_id=m["moveId"],
                    abbreviation=m.get("abbreviation", None),  
                    energy_gain=m["energyGain"],
                    type=m.get("type","none"),
                    power=m.get("power", 0),
                    cooldown=m.get("cooldown",500),
                    archetype=m.get("archetype","General")
                    )
            else:
                ChargedMove.objects.create(
                    name=m["name"],
                    move_id=m["moveId"],
                    energy=m["energy"],
                    abbreviation=m.get("abbreviation", None),
                    type=m.get("type","none"),
                    power=m.get("power", 0),
                    cooldown=m.get("cooldown",500),
                    archetype=m.get("archetype","General"),
                    buffs=m.get("buffs", None),
                    buff_target=m.get("buffTarget", None),
                    buff_self=m.get("buffsSelf", None),
                    buff_opponent=m.get("buffsOpponent", None),
                    buff_apply_chance=float(m.get("buffApplyChance", 0))
                )
        
        with open("pvp/fixtures/pokemon.json") as f:
            pokemon_data = json.load(f)
        for pokemon in pokemon_data:
            fm = [FastMove.objects.get(move_id=m) for m in pokemon["fastMoves"]]
            cm = [ChargedMove.objects.get(move_id=m) for m in pokemon["chargedMoves"]]
            Pokemon.objects.create(
                    dex=pokemon["dex"],
                    species_name=pokemon["speciesName"],
                    species_id=pokemon["speciesId"],
                    base_stats=pokemon["baseStats"],
                    types=pokemon["types"],
                    fast_moves=fm,
                    charged_moves=cm,
                    elite_moves=pokemon.get("eliteMoves", None),
                    level_25CP=pokemon.get("level25CP", None),
                    tags=[Tag(x) for x in pokemon.get("tags", [])],
                    default_ivs=pokemon.get("defaultIVs", None),
                    buddy_distance=pokemon.get("buddyDistance", None),
                    third_move_cost=pokemon.get("thirdMoveCost", 0),
                    released=pokemon.get("released", False),
                    family=pokemon.get("family", None)
                )
                    
            