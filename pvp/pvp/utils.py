import math
from pvp.models import FastMove, ChargedMove

def get_move_count(fast_move, charged_move):
    first = math.ceil((charged_move.energy * 1) / fast_move.energy_gain)
    second = math.ceil((charged_move.energy * 2) / fast_move.energy_gain) - first
    third = math.ceil((charged_move.energy * 3) / fast_move.energy_gain) - first - second
    return [first, second, third]

def get_charged_move_str(fast_move:FastMove, charged_move:ChargedMove):
    move_count = get_move_count(fast_move, charged_move)
    cm_count = str(move_count[0])
    if move_count[0] > move_count[1]:
        cm_count += '-'
    if (move_count[2] < move_count[1]) and (move_count[0]==move_count[1]):
        cm_count += '.'
    return f', {charged_move.move.name}<span class="count">{cm_count}</span>'

def get_move_str(moveset):
    fast_move = FastMove.objects.get(move_id=moveset[0])
    fm_duration = fast_move.move.cooldown/500
    move_str = f'<div class="moves">{fast_move.move.name}<span class="count fast">{int(fm_duration)}</span>'
    
    charged_move_1 = ChargedMove.objects.get(move_id=moveset[1])
    move_str += get_charged_move_str(fast_move, charged_move_1)
    if len(moveset) > 2:
        charged_move_2 = ChargedMove.objects.get(move_id=moveset[2])
        move_str += get_charged_move_str(fast_move, charged_move_2)
    move_str += '</div>'
    return move_str