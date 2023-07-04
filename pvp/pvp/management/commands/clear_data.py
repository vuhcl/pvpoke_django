from django.core.management.base import BaseCommand, CommandError
from pvp.models import Format, Pokemon, FastMove, ChargedMove, Ranking

class Command(BaseCommand):
    help = 'Clear data objects'

    def handle(self, *args, **options):
        Format.objects.all().delete()
        Pokemon.objects.all().delete()
        FastMove.objects.all().delete()
        ChargedMove.objects.all().delete()
        Ranking.objects.all().delete()