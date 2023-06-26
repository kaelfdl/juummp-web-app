import os
import json
import datetime
from django.shortcuts import redirect
from django.http import HttpResponseNotFound, HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView, View
from rest_framework import status
from requests import Request, post

from .util import *

from spotify.models import Playlist

# Create your views here.
class AuthURL(APIView):
    def get(self, request, format=None):
        scope = "user-read-email user-read-private streaming user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scope,
                    "response_type": "code",
                    "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
                    "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "code": code,
            "grant_type": "authorization_code",
            "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
            "client_secret": os.getenv("SPOTIFY_CLIENT_SECRET"),
            "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
        },
    ).json()

    access_token = response.get("access_token")
    refresh_token = response.get("refresh_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, refresh_token, token_type, expires_in
    )

    return redirect("frontend:")


class Logout(APIView):
    def post(self, request, format=None):
        if is_spotify_authenticated(self.request.session.session_key):
            delete_spotify_token(self.request.session.session_key)
            return Response(
                {"status": is_spotify_authenticated(self.request.session.session_key)},
                status=status.HTTP_200_OK,
            )


class IsSpotifyAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        if is_authenticated:
            expiry = get_user_token(
                self.request.session.session_key
            ).expires_in.timestamp()
        else:
            expiry = None
        return Response(
            {"status": is_authenticated, "expiry": expiry}, status=status.HTTP_200_OK
        )


class CurrentSong(APIView):
    def get(self, request, format=None):
        endpoint = "me/player/currently-playing"
        response = execute_spotify_api_request(
            self.request.session.session_key, endpoint
        )

        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")

        artist_string = parse_artist_list(item.get("artists"))

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "id": song_id,
        }

        return Response(song, status=status.HTTP_200_OK)


class EnableSpotifyPlayer(APIView):
    def get(self, request, format=None):
        if is_spotify_authenticated(self.request.session.session_key):
            access_token = get_user_token(self.request.session.session_key).access_token
            return Response({"token": access_token}, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        endpoint = "me/player/play"
        if is_spotify_authenticated(self.request.session.session_key):
            data = json.loads(request.body)
            device_id = data["device_id"]
            spotify_uri = data["uris"]
            params = {"device_id": device_id}
            data = {"uris": spotify_uri}
            execute_spotify_api_request(
                self.request.session.session_key,
                endpoint,
                put_=True,
                data=data,
                params=params,
            )
            return Response({}, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class SetVolume(APIView):
    def put(self, request, format=None):
        endpoint = "me/player/volume"
        if is_spotify_authenticated(self.request.session.session_key):
            data = json.loads(request.body)
            device_id = data["device_id"]
            volume_percent = data["volume_percent"]
            params = {
                "device_id": device_id,
                "volume_percent": volume_percent,
            }
            execute_spotify_api_request(
                self.request.session.session_key, endpoint, put_=True, params=params
            )
            return Response({}, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaylistAPI(APIView):
    playlist_id = "37i9dQZF1DXcBWIGoYBM5M"
    playlist_container = None

    def _get_playlist_tracks(self):
        if app_is_spotify_authenticated():
            endpoint = f"playlists/{self.playlist_id}/tracks"
            params = {"market": "PH"}
            response = app_execute_spotify_api_request(endpoint, params=params)
            if "error" in response or "items" not in response:
                return None

            items = response.get("items")
            return items

    def _save_playlist_track(self, next_track=False):
        items = self._get_playlist_tracks()

        if items is not None:
            playlist = Playlist.objects.filter(playlist_id=self.playlist_id)

            if playlist.exists():
                playlist = playlist[0]
                track_count = len(items)
                track_number = playlist.track_number
                if next_track:
                    if track_number >= (track_count - 1):
                        track_number = 0
                    else:
                        track_number += 1

                track = items[track_number].get("track")
                duration = track.get("duration_ms")
                track_id = track.get("id")
                playlist.track_id = track_id
                playlist.track_number = track_number
                playlist.track_count = track_count
                playlist.duration = duration
                playlist.progress = 0
                self.playlist_container = playlist
                playlist.save()
            else:
                track = items[0].get("track")
                track_count = len(items)
                duration = track.get("duration_ms")
                track_id = track.get("id")

                playlist = Playlist(
                    playlist_id=self.playlist_id,
                    track_count=track_count,
                    track_id=track_id,
                    duration=duration,
                )
                self.playlist_container = playlist
                playlist.save()

    def _update_track_progress(self):
        playlist = (
            self.playlist_container
            if self.playlist_container is not None
            else Playlist.objects.filter(playlist_id=self.playlist_id)[0]
        )
        if playlist is not None or playlist.exists():
            print(playlist.progress)

            if playlist.progress < playlist.duration:
                playlist.progress += 1000
                playlist.save()
            else:
                # playlist = Playlist.objects.filter(playlist_id=self.playlist_id)
                self._save_playlist_track(next_track=True)
        else:
            self._save_playlist_track()

    def get(self, request, format=None):
        if self.playlist_container is not None:
            playlist = self.playlist_container
        else:
            playlist = Playlist.objects.filter(playlist_id=self.playlist_id)
            

        if playlist.exists():
            playlist = playlist[0]
            playlist_id = playlist.playlist_id
            track_id = playlist.track_id
            track_number = playlist.track_number
            track_count = playlist.track_count
            duration = playlist.duration
            progress = playlist.progress

            data = {
                "playlist_id": playlist_id,
                "track_id": track_id,
                "track_number": track_number,
                "track_count": track_count,
                "duration": duration,
                "progress": progress,
            }
            
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_204_NO_CONTENT)


class Assets(View):
    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), "static", filename)

        if os.path.isfile(path):
            with open(path, "rb") as file:
                return HttpResponse(file.read(), content_type="application/javascript")
        else:
            return HttpResponseNotFound()
