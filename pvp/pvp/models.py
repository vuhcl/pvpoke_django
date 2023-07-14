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
    
    @property
    def turns(self):
        return self.cooldown / 500
    class Meta:
        abstract = True
        
class FastMove(Move):
    energy_gain = models.IntegerField()
    def __str__(self):
        return self.name
    def __eq__(self, other):
        if isinstance(other, FastMove):
            return self.move_id == other.move_id
        elif isinstance(other, str):
            return (self.move_id == other) or (self.name == other)
    
    @property
    def dpt(self):
        return self.power / self.turns
    
    @property
    def ept(self):
        return self.energy_gain / self.turns
    
    @property
    def archetype(self):
        if self.dpt >= 3.5 and self.dpt > self.ept:
            return "Heavy Damage"
        elif self.ept >= 3.5 and self.ept > self.dpt:
            return "Fast Charge"
        elif (self.dpt >= 4 and self.ept >= 3) or (self.dpt >= 3 and self.ept >= 4):
            return "Multipurpose"
        elif (self.dpt < 3 and self.ept <= 3) or (self.dpt <= 3 and self.ept < 3):
            return "Low Quality"
        else:
            return "General"
			
    @property
    def archetype_class(self):
        class_dict = { 
                      "Fast Charge":"spam", 
                      "Heavy Damage": "nuke", 
                      "Multipurpose": "high-energy",
                      "Low Quality": "low-quality",
                      "General": "general"
                      }
        return class_dict.get(self.archetype, "general")
    
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
    def __eq__(self, other):
        if isinstance(other, ChargedMove):
            return self.move_id == other.move_id
        elif isinstance(other, str):
            return (self.move_id == other) or (self.name == other)
    
    @property
    def dpe(self):
        return self.power / self.energy
    
    @property
    def archetype(self):
        descriptor = ""
        if self.buffs:
            if self.buff_target=="self" and (self.buffs[0] > 0 or self.buffs[1] > 0):
                descriptor = "Boost"
            elif self.buff_target=="self" and (self.buffs[0] < 0 or self.buffs[1] < 0):
                if self.energy < 45:
                    return "Self-Debuff Spam"
                descriptor = "Self-Debuff"
            else:
                descriptor = "Debuff"
        if (self.energy > 60 and self.dpe > 1.5) or (self.energy > 50 and self.dpe > 1.75):
            return descriptor + " Nuke"    
        elif self.energy > 50:
            return "High Energy " + descriptor
        elif descriptor!="":
            return descriptor
        else:
            return "General"
    
    @property
    def archetype_class(self):
        if "Boost" in self.archetype:
            return "self-debuff"
        elif "Spam" in self.archetype:
            return "spam"
        elif "High Energy" in self.archetype:
            return "high-energy"
        elif "Nuke" in self.archetype:
            return "nuke"
        elif "Debuff" in self.archetype:
            return "debuff"
    
class Tag(models.Model):
    tag = models.CharField()
    def __str__(self) -> str:
        return self.tag
    
    def __eq__(self, __value: str) -> bool:
        return self.tag==__value.lower()
    
class Pokemon(models.Model):
    dex = models.IntegerField()
    species_name = models.CharField()
    species_id = models.CharField()
    fast_moves = models.ManyToManyField(FastMove)
    charged_moves = models.ManyToManyField(ChargedMove)
    elite_moves = ArrayField(base_field=models.CharField(), blank=True, null=True)
    legacy_moves = ArrayField(base_field=models.CharField(), blank=True, null=True)
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
    
    def is_elite(self, move):
        return move.move_id in self.elite_moves
    
    def is_legacy(self, move):
        return move.move_id in self.legacy_moves
    
    def has_tag(self, tag):
        return any(tag==x for x in self.tags.all())
    
    @property
    def is_shadow(self):
        return self.has_tag("shadow")
    
    @property
    def has_elite_moves(self):
        if self.elite_moves is None:
            return False
        return len(self.elite_moves) > 0
    
    @property
    def has_legacy_moves(self):
        if self.legacy_moves is None:
            return False
        return len(self.legacy_moves) > 0
    
    @property
    def type1(self):
        return self.types[0]
    
    @property
    def type2(self):
        return self.types[1]
    
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
        return self.format.title
    
    def get_absolute_url(self):
        from django.urls import reverse
        return self.format.get_absolute_url()+self.category