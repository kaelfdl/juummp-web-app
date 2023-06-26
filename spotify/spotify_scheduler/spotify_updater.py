from apscheduler.schedulers.background import BackgroundScheduler
from spotify.views import PlaylistAPI

def start():
    scheduler = BackgroundScheduler()
    playlist_api = PlaylistAPI()

    scheduler.add_job(playlist_api._update_track_progress, 'interval', seconds=1)
    
    scheduler.start()