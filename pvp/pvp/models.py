from django.db import models
from django.contrib.postgres.fields import ArrayField
from functools import lru_cache

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
    
    @property
    def type1(self):
        return self.types[0]
    
    @property
    def type2(self):
        return self.types[1]
    
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
        return reverse("rankings", kwargs={"format": self.cup, "cp": self.cp})
    
class Scenario(models.Model):
    category = models.CharField()
    format = models.ForeignKey(Format, on_delete=models.CASCADE)
    
    def __str__(self) -> str:
        return self.category.capitalize()
    
    def get_absolute_url(self):
        from django.urls import reverse
        return self.format.get_absolute_url()+self.category