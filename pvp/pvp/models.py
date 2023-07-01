from django.db import models
from django.contrib.postgres.fields import ArrayField
import math

class Move(models.Model):
    name = models.CharField()
    move_id = models.CharField()
    abbreviation = models.CharField(null=True)
    type = models.CharField()
    power = models.IntegerField()
    cooldown = models.IntegerField()
    archetype = models.CharField(null=True)
    
    def __str__(self):
        return self.name 
    class Meta:
        abstract = True

class FastMove(Move):
    energy_gain = models.IntegerField()
    
class ChargedMove(Move):
    move_id = models.CharField()
    energy = models.IntegerField()
    buffs = models.JSONField(null=True, blank=True)
    target = models.TextChoices("target", "self opponent both")
    buff_target = models.CharField(null=True, blank=True, choices=target.choices)
    buff_self = models.JSONField(null=True, blank=True)
    buff_opponent = models.JSONField(null=True, blank=True)
    buff_apply_chance = models.FloatField(null=True, blank=True)
    
class Tag(models.Model):
    tag = models.CharField()
    def __str__(self) -> str:
        return self.tag
    
class Pokemon(models.Model):
    dex = models.IntegerField()
    species_name = models.CharField()
    species_id = models.CharField()
    fast_moves = models.ManyToManyField(FastMove)
    charged_moves = models.ManyToManyField(ChargedMove)
    elite_moves = models.ManyToManyField(Move, blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, null=True)
    level_25CP = models.PositiveIntegerField(null=True, blank=True)
    base_stats = models.JSONField()
    types = models.JSONField()
    default_ivs = models.JSONField(null=True, blank=True)
    buddy_distance = models.SmallIntegerField(null=True, blank=True)
    third_move_cost = models.PositiveIntegerField(blank=True, default=0)
    released = models.BooleanField(null=True, blank=True)
    family = models.JSONField(null=True, blank=True)
    
    def __str__(self) -> str:
        return self.species_name
    
class Format(models.Model):
    title = models.CharField(max_length=64)
    cup = models.CharField(max_length=32)
    cp = models.PositiveSmallIntegerField()
    meta = models.CharField(max_length=32)
    
    def __str__(self) -> str:
        return self.title
    
class Ranking(models.Model):
    format = models.ForeignKey(Format, on_delete=models.CASCADE)
    pokemon = models.ForeignKey(Pokemon)
    position = models.PositiveSmallIntegerField()
    score = models.FloatField(max_value=100)
    matchups = models.ManyToManyField(Pokemon, through="Matchup", null=True, blank=True)
    moves = models.JSONField(null=True, blank=True)
    moveset = ArrayField(null=True, blank=True)
    scores = ArrayField()
    stats = models.JSONField(null=True, blank=True)

class Matchup(models.Model):
    rating = models.PositiveSmallIntegerField(max_value=1000)
    pokemon = models.ForeignKey(Ranking)
    opponent = models.ForeignKey(Pokemon)
    
def get_move_count(fast_move:FastMove, charged_move:ChargedMove) -> list[int]:
    first = math.ceil((charged_move.energy * 1) / fast_move.energy_gain)
    second = math.ceil((charged_move.energy * 2) / fast_move.energy_gain) - first
    third = math.ceil((charged_move.energy * 3) / fast_move.energy_gain) - first - second
    return [first, second, third]

def get_charged_move_str(fast_move:FastMove, charged_move:ChargedMove) -> str:
    move_count = get_move_count(fast_move, charged_move)
    cm_count = str(move_count[0])
    if move_count[0] > move_count[1]:
        cm_count += '-'
    if (move_count[2] < move_count[1]) and (move_count[0]==move_count[1]):
        cm_count += '.'
    return f', {charged_move.name}<span class="count">{cm_count}</span>'

def get_move_str(moveset: list[str]) -> str:
    fast_move = FastMove.objects.get(move_id=moveset[0])
    fm_duration = fast_move.cooldown/500
    move_str = f'<div class="moves">{fast_move.name}<span class="count fast">{int(fm_duration)}</span>'
    
    charged_move_1 = ChargedMove.objects.get(move_id=moveset[1])
    move_str += get_charged_move_str(fast_move, charged_move_1)
    if len(moveset) > 2:
        charged_move_2 = ChargedMove.objects.get(move_id=moveset[2])
        move_str += get_charged_move_str(fast_move, charged_move_2)
    move_str += '</div>'
    return move_str
    
    
        
    