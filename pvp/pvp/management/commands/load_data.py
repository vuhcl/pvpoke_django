from django.core.management.base import BaseCommand, CommandError
from pvp.models import Format, Pokemon, PokemonData, FastMove, ChargedMove, Move, CMove
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
        
        with open("pvp/fixtures/pokemon.json") as f:
            pokemon_data = json.load(f)
        for pokemon in pokemon_data:
            Pokemon.objects.create(
                    dex=pokemon["dex"],
                    species_name=pokemon["speciesName"],
                    species_id=pokemon["speciesId"],
                    data=PokemonData(
                        base_stats=pokemon["baseStats"],
                        types=pokemon["types"],
                        fast_moves=pokemon["fastMoves"],
                        charged_moves=pokemon["chargedMoves"],
                        elite_moves=pokemon.get("eliteMoves", []),
                        level_25CP=pokemon.get("level25CP", -1),
                        tags=pokemon.get("tags",[]),
                        default_ivs=pokemon.get("defaultIVs", {}),
                        buddy_distance=pokemon.get("buddyDistance", -1),
                        third_move_cost=pokemon.get("thirdMoveCost", 0),
                        released=pokemon.get("released",False),
                        family=pokemon.get("family", {})
                    )
                )
            
        with open("pvp/fixtures/moves.json") as f:
            move_data = json.load(f)
        for m in move_data:
            if m['energy'] == 0:
                FastMove.objects.create(
                    move_id=m["moveId"],
                    energy_gain=m["energyGain"],
                    move=Move(
                        name=m["name"],
                        abbreviation=m.get("abbreviation",m["name"]),
                        type=m.get("type","none"),
                        power=m.get("power", 0),
                        cooldown=m.get("cooldown",500),
                        archetype=m.get("archetype","General")
                        )
                )
            else:
                ChargedMove.objects.create(
                    move_id=m["moveId"],
                    energy=m["energy"],
                    move=CMove(
                        name=m["name"],
                        abbreviation=m.get("abbreviation",m["name"]),
                        type=m.get("type","none"),
                        power=m.get("power", 0),
                        cooldown=m.get("cooldown",500),
                        archetype=m.get("archetype","General"),
                        buffs=m.get("buffs", [0, 0]),
                        buff_target=m.get("buffTarget", "none"),
                        buff_self=m.get("buffsSelf", [0, 0]),
                        buff_opponent=m.get("buffsOpponent", [0, 0]),
                        buff_apply_chance=float(m.get("buffApplyChance", 0))
                        )
                    )
                    
            