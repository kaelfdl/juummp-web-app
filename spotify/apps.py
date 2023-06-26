from django.apps import AppConfig


class SpotifyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'spotify'

    def ready(self):
        print('Starting scheduler...')
        from .spotify_scheduler import spotify_updater
        spotify_updater.start()