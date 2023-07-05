from functools import lru_cache
import math

from django import template
from ..models import ChargedMove, FastMove, Pokemon  

register = template.Library()

@lru_cache  
@register.filter  
def move_count(fm:str, cm:str) -> list[int]:
    fast_move = FastMove.objects.get(move_id=fm)
    charged_move = ChargedMove.objects.get(move_id=cm)
    first = math.ceil((charged_move.energy * 1) / fast_move.energy_gain)
    second = math.ceil((charged_move.energy * 2) / fast_move.energy_gain) - first
    third = math.ceil((charged_move.energy * 3) / fast_move.energy_gain) - first - second
    return [first, second, third]

@lru_cache
@register.filter
def charged_move_str(fm:str, cm:str) -> str:
    fast_move = FastMove.objects.get(move_id=fm)
    charged_move = ChargedMove.objects.get(move_id=cm)
    mc = move_count(fm, cm)
    cm_count = str(mc[0])
    if mc[0] > mc[1]:
        cm_count += '-'
    if (mc[2] < mc[1]) and (mc[0]==mc[1]):
        cm_count += '.'
    return f', {charged_move.name}<span class="count">{cm_count}</span>'

@lru_cache
@register.filter
def move_str(moveset: list[str]) -> str:
    fast_move = FastMove.objects.get(move_id=moveset[0])
    fm_duration = fast_move.cooldown/500
    move_str = f'<div class="moves">{fast_move.name}<span class="count fast">{int(fm_duration)}</span>'
    
    move_str += charged_move_str(moveset[0], moveset[1])
    if len(moveset) > 2:
        move_str += charged_move_str(moveset[0], moveset[2])
    move_str += '</div>'
    return move_str

@lru_cache
@register.filter
def get_pokemon(id:str) -> Pokemon:
    return Pokemon.objects.get(species_id=id)

@lru_cache
@register.filter
def type1(id:str) -> str:
    return get_pokemon(id).type1

@lru_cache
@register.filter
def type2(id:str) -> str:
    return get_pokemon(id).type2
    