from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from functools import lru_cache
import math

class Move(models.Model):
    name = models.CharField()
    move_id = models.CharField()
    abbreviation = models.CharField(null=True)
    type = models.CharField()
    power = models.IntegerField()
    cooldown = models.IntegerField()
    archetype = models.CharField(null=True)
    class Meta:
        abstract = True
        
class FastMove(Move):
    energy_gain = models.IntegerField()
    def __str__(self):
        return self.name 
    
class ChargedMove(Move):
    move_id = models.CharField()
    energy = models.IntegerField()
    buffs = models.JSONField(null=True, blank=True)
    target = models.TextChoices("target", "self opponent both")
    buff_target = models.CharField(null=True, blank=True, choices=target.choices)
    buff_self = models.JSONField(null=True, blank=True)
    buff_opponent = models.JSONField(null=True, blank=True)
    buff_apply_chance = models.FloatField(null=True, blank=True)
    def __str__(self):
        return self.name 
    
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
    elite_moves = ArrayField(base_field=models.CharField(), blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    level_25CP = models.PositiveIntegerField(null=True, blank=True)
    base_stats = models.JSONField()
    types = ArrayField(base_field=models.CharField(blank=True, default="none"), size=2)
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
    show = models.BooleanField(default=True)
    
    def __str__(self) -> str:
        return self.title
    
    @lru_cache
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse("rankings", kwargs={"cup": self.cup, "cp": self.cp})
    
class Scenario(models.Model):
    category = models.CharField()
    format = models.ForeignKey(Format, on_delete=models.CASCADE)
    
    def __str__(self) -> str:
        return self.category.capitalize()
    
    def get_absolute_url(self):
        from django.urls import reverse
        return self.format.get_absolute_url()+self.category
    
@lru_cache    
def get_move_count(fast_move:FastMove, charged_move:ChargedMove) -> list[int]:
    first = math.ceil((charged_move.energy * 1) / fast_move.energy_gain)
    second = math.ceil((charged_move.energy * 2) / fast_move.energy_gain) - first
    third = math.ceil((charged_move.energy * 3) / fast_move.energy_gain) - first - second
    return [first, second, third]

@lru_cache
def get_charged_move_str(fast_move:FastMove, charged_move:ChargedMove) -> str:
    move_count = get_move_count(fast_move, charged_move)
    cm_count = str(move_count[0])
    if move_count[0] > move_count[1]:
        cm_count += '-'
    if (move_count[2] < move_count[1]) and (move_count[0]==move_count[1]):
        cm_count += '.'
    return f', {charged_move.name}<span class="count">{cm_count}</span>'

@lru_cache
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
    
class Ranking(models.Model):
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    pokemon = models.ForeignKey(Pokemon, on_delete=models.CASCADE)
    position = models.PositiveSmallIntegerField()
    score = models.FloatField()
    matchups = models.ManyToManyField(
        Pokemon,
        through="Matchup", 
        through_fields=("pokemon", "opponent"), 
        blank=True,
        related_name="+"
        )
    counters = models.ManyToManyField(
        Pokemon, 
        through="Counter",
        through_fields=("pokemon", "opponent"),
        blank=True,
        related_name="+"
        )
    moves = models.JSONField(null=True, blank=True)
    moveset = ArrayField(base_field=models.CharField(), blank=True)
    scores = ArrayField(base_field=models.FloatField())
    stats = models.JSONField(null=True, blank=True)
    
    @property
    def move_str(self) -> str:
        return get_move_str(self.moveset)    
        
class Matchup(models.Model):
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(500)])
    pokemon = models.ForeignKey(Ranking, on_delete=models.CASCADE)
    opponent = models.ForeignKey(Pokemon, on_delete=models.CASCADE)

class Counter(models.Model):
    rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(500)])
    pokemon = models.ForeignKey(Ranking, on_delete=models.CASCADE)
    opponent = models.ForeignKey(Pokemon, on_delete=models.CASCADE)
              