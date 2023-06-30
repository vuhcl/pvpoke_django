from django.shortcuts import render
from django.views.decorators.http import require_GET
from django.http import HttpResponse
import json
from pvp.models import Format
from . import HtmxHttpRequest

@require_GET
def get_tab(request: HtmxHttpRequest, tab:str) -> HttpResponse:
    template = f"tabs_{tab}.html"
    return render(request, template)