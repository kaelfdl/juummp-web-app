from os import access
from django.db import models

# Create your models here.
class SpotifyToken(models.Model):
    user = models.CharField(max_length=150, unique=True)
    access_token = models.CharField(max_length=255)
    refresh_token = models.CharField(max_length=255, default='')
    token_type = models.CharField(max_length=50)
    expires_in = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_client = models.BooleanField(default=False)


class Playlist(models.Model):
    playlist_id = models.CharField(max_length=150, unique=True)
    track_id = models.CharField(max_length=150, default='')
    track_number = models.IntegerField(default=0)
    track_count = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    progress = models.IntegerField(default=0)