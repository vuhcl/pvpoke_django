from functools import lru_cache
import math

from django import template
from ..models import ChargedMove, FastMove, Pokemon  

register = template.Library()

@lru_cache
@register.filter
def get_fast_move(id:str) -> FastMove:
    return FastMove.objects.get(move_id=id)

@lru_cache
@register.filter
def get_charged_move(id:str) -> ChargedMove:
    return ChargedMove.objects.get(move_id=id)

@register.filter
def n_move_count(fast_move:FastMove, charged_move:ChargedMove, n:int):
    if n == 0:
        return 0
    if n == 1:
        return math.ceil(charged_move.energy / fast_move.energy_gain)
    total_count = math.ceil((charged_move.energy * n) / fast_move.energy_gain)
    for i in range(n):
        total_count -= n_move_count(fast_move, charged_move, n-1)
    return  total_count
    
@lru_cache
@register.filter  
def move_count(fm:str, cm:str) -> list[int]:
    fast_move = get_fast_move(fm)
    charged_move = get_charged_move(cm)
    return [n_move_count(fast_move, charged_move, n+1) for n in range(3)]

@lru_cache
@register.filter
def charged_move_str(fm:str, cm:str) -> str:
    charged_move = get_charged_move(cm)
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
    fast_move = get_fast_move(moveset[0])
    move_str = f'<div class="moves">{fast_move.name}<span class="count fast">{int(fast_move.turns)}</span>'
    
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

@lru_cache
@register.filter
def name(id:str) -> str:
    return get_pokemon(id).species_name

@lru_cache
@register.filter
def rating(rating:int) -> str:
    if rating == 500:
        return "tie"
    elif 250 < rating < 500:
        return "close-loss"
    elif rating <= 250:
        return "loss"
    elif 500 < rating < 750:
        return "close-win"
    else:
        return "win"

@lru_cache
@register.simple_tag    
def get_fast_move_info(move:FastMove, pokemon:Pokemon):
    if move.type==pokemon.type1 or move.type==pokemon.type2:
        stab_mul = 1.2
    else:
        stab_mul = 1
    if pokemon.is_shadow:
        shadow = 1.2
    else:
        shadow = 1
    name = move.name
    if pokemon.has_elite_moves:
        if pokemon.is_elite(move):
            name += "*"
    if pokemon.has_legacy_moves:
        if pokemon.is_legacy(move):
            name += "†"
                     
    return {
        "name": name,
        "dmg": stab_mul * shadow * move.power,
        "dpt": stab_mul * shadow * move.dpt,
        "ept": move.ept,
        "turns": move.turns
    }

@lru_cache
@register.simple_tag
def get_charged_move_info(move:ChargedMove, pokemon:Pokemon):
    archetype = move.archetype
    if move.type==pokemon.type1 or move.type==pokemon.type2:
        stab_mul = 1.2
    else:
        stab_mul = 1
        if move.type=="normal":
            descriptor = "Neutral"
        else:
            descriptor = "Coverage"
        if archetype=="High Energy":
            if descriptor=="Coverage":
                archetype = "High Energy Coverage"  
        elif archetype=="General":
            archetype = descriptor
        else:
            archetype = descriptor + " " + move.archetype
    if pokemon.is_shadow:
        shadow = 1.2
    else:
        shadow = 1
    dmg = stab_mul * shadow * move.power
    name = move.name
    if pokemon.has_elite_moves:
        if pokemon.is_elite(move):
            name += "*"
    if pokemon.has_legacy_moves:
        if pokemon.is_legacy(move):
            name += "†"
    return {
        "name": name,
        "dmg": dmg,
        "cost": move.energy,
        "dpe": dmg / move.energy,
        "archetype": archetype
    }
    
@lru_cache
@register.simple_tag
def move_cycle_info(fast_move:FastMove, charged_move:ChargedMove, pokemon:Pokemon):
    fm_info = get_fast_move_info(fast_move, pokemon)
    cm_info = get_charged_move_info(charged_move, pokemon)
    fast_dmg = n_move_count(fast_move, charged_move, 1) * fm_info.dmg
    total_dmg = fast_dmg + cm_info.dmg
    cycle_duration = (n_move_count(fast_move, charged_move, 1) * fast_move.turns) + 1
    return {
        "fast_move_count": [n_move_count(fast_move, charged_move, n+1) for n in range(3)],
        "time_first": n_move_count(fast_move, charged_move, 1) * fast_move.turns,
        "fast_dmg": n_move_count(fast_move, charged_move, 1) * fm_info.dmg,
        "charged_dmg": cm_info.dmg,
        "total_dmg": total_dmg,
        "duration": cycle_duration, 
        "total_dpt": total_dmg/cycle_duration
    }