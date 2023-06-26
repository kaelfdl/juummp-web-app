from spotify.models import Playlist
from django.urls import path

from spotify.views import AuthURL, CurrentSong, EnableSpotifyPlayer, IsSpotifyAuthenticated, Logout, PlaySong, PlaylistAPI, SetVolume, spotify_callback

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsSpotifyAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('play-song', PlaySong.as_view()),
    path('enable-spotify-player', EnableSpotifyPlayer.as_view()),
    path('set-volume', SetVolume.as_view()),
    path('logout', Logout.as_view()),
    path('current-track', PlaylistAPI.as_view()),
]