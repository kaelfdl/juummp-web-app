from django.contrib import admin
from spotify.models import Playlist, SpotifyToken

# Register your models here.

admin.site.register(SpotifyToken)
admin.site.register(Playlist)