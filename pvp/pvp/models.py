from django.db import models
from dataclasses import dataclass, asdict
from dacite import from_dict
import json

"""Field that maps dataclass to django model fields."""
class DataClassField(models.CharField):
    description = "Map python dataclasses to model."

    def __init__(self, dataClass, *args, **kwargs):
        self.dataClass = dataClass
        if not kwargs.get('max_length'): 
            kwargs['max_length'] = 102400
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['dataClass'] = self.dataClass
        return name, path, args, kwargs

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        obj = json.loads(value)
        return from_dict(data_class=self.dataClass, data=obj)

    def to_python(self, value):
        if isinstance(value, self.dataClass):
            return value
        if value is None:
            return value
        obj = json.loads(value)
        return from_dict(data_class=self.dataClass, data=obj)

    def get_prep_value(self, value):
        if value is None:
            return value
        return json.dumps(asdict(value))
  
@dataclass
class PokemonData:
    base_stats: dict
    types: list[str]
    fast_moves: list[str]
    charged_moves: list[str]
    elite_moves: list[str]
    level_25CP: int
    tags: list[str]
    default_ivs: dict
    buddy_distance: int
    third_move_cost: int
    released: bool
    family: dict
    
@dataclass
class Move:
    name: str
    abbreviation: str
    type: str
    power: int
    cooldown: int
    archetype: str

@dataclass
class CMove(Move):
    buffs : list[int]
    buff_target: str
    buff_self: list[int]
    buff_opponent: list[int]
    buff_apply_chance: float    

class FastMove(models.Model):
    move_id = models.CharField()
    energy_gain = models.IntegerField()
    move = DataClassField(dataClass=Move)

class ChargedMove(models.Model):
    move_id = models.CharField()
    energy = models.IntegerField()
    move = DataClassField(dataClass=CMove)
    
class Pokemon(models.Model):
    dex = models.IntegerField()
    species_name = models.CharField()
    species_id = models.CharField()
    data = DataClassField(dataClass=PokemonData)
    
class Ranking(models.Model):
    position = models.PositiveSmallIntegerField()
    species_name = models.CharField()
    species_id = models.SlugField()
    rating = models.PositiveSmallIntegerField()
    
class Format(models.Model):
    title = models.CharField(max_length=64)
    cup = models.CharField(max_length=32)
    cp = models.PositiveSmallIntegerField()
    meta = models.CharField(max_length=32)

# class Scenario(models.Model):
#     cup = models.ForeignKey(Format, on_delete=models.CASCADE)  
#     rank = models.ForeignKey(Ranking, on_delete=models.CASCADE)
#     name = models.CharField()
#     slug = models.SlugField()
#     self_shields = models.SmallIntegerField()
#     opponent_shields = models.SmallIntegerField()
#     self_energy = models.SmallIntegerField()
#     opponent_energy = models.SmallIntegerField()
    
    
    
        
    