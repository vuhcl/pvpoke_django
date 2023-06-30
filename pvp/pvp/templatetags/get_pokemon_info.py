from django import template
from pvp.models import Pokemon
from pvp import utils

register = template.Library()

@register.inclusion_tag('ranking_item.html')
def ranking_item(item, start_index, position):
    pokemon = Pokemon.objects.get(species_id=item["speciesId"])
    return {
        'type_1': pokemon.data.types[0],
        'type_2': pokemon.data.types[1],
        'data': pokemon.species_id,
        'name': pokemon.species_name,
        'move_str': utils.get_move_str(item.get('moveset')),
        'score': item.get('score'),
        'position': start_index+position-1
        }