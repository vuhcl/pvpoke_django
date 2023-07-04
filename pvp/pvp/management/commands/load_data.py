from functools import lru_cache
from django.core.management.base import BaseCommand, CommandError
from pvp.models import Format, Pokemon, FastMove, ChargedMove, Tag
import json

class Command(BaseCommand):
    help = 'Load JSON data'
    
    @lru_cache
    def open_file(self, filename):
        with open(filename) as f:
            return json.load(f)

    def handle(self, *args, **options):
        self.load_formats()
        self.load_moves()
        self.load_pokemon()
    
    @lru_cache
    def load_formats(self):
        Format.objects.create(title="Great League", cup="all", cp=1500, meta="great")
        Format.objects.create(title="Ultra League", cup="all", cp=2500, meta="ultra")
        Format.objects.create(title="Master League", cup="all", cp=10000, meta="master")
    
        format_data = self.open_file("pvp/fixtures/formats.json")
        for format in format_data:
            Format.objects.create(title=format["title"], cup=format.get("cup"), cp=format["cp"], meta=format["meta"], show=format["showFormat"])
    
    def create_move(self, m):
        if m.get('energy') == 0:
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
    
    def create_pokemon(self, pokemon):
        obj = Pokemon.objects.create(
            dex=pokemon["dex"],
            species_name=pokemon["speciesName"],
            species_id=pokemon["speciesId"],
            base_stats=pokemon["baseStats"],
            types=pokemon["types"],
            elite_moves=pokemon.get("eliteMoves", None),
            level_25CP=pokemon.get("level25CP", None),
            default_ivs=pokemon.get("defaultIVs", None),
            buddy_distance=pokemon.get("buddyDistance", None),
            third_move_cost=pokemon.get("thirdMoveCost", 0),
            released=pokemon.get("released", False),
            family=pokemon.get("family", None)
            )
        if pokemon.get("released"):
            fm = [FastMove.objects.get(move_id=move) for move in pokemon.get("fastMoves")]
            cm = [ChargedMove.objects.get(move_id=m) for m in pokemon.get("chargedMoves")]
            obj.fast_moves.set(fm)
            obj.charged_moves.set(cm)
        obj.tags.set([Tag.objects.create(tag=x) for x in pokemon.get("tags", [])])
    
    @lru_cache    
    def load_pokemon(self):
        pokemon_data = self.open_file("pvp/fixtures/pokemon.json")
        for pokemon in pokemon_data:  
            self.create_pokemon(pokemon)
              
    @lru_cache     
    def load_moves(self):
        move_data = self.open_file("pvp/fixtures/moves.json")
        for m in move_data:
            self.create_move(m)             
            