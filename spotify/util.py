import os
import base64
from django.utils import timezone
from datetime import timedelta

from requests import Request
from requests.api import get, post, put
from rest_framework import response

from spotify.models import SpotifyToken

from juummp.settings import store

BASE_URL = 'https://api.spotify.com/v1/'

def get_user_token(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def get_admin_token():
    admin_tokens = SpotifyToken.objects.filter(is_client=True)
    if admin_tokens.exists():
        return admin_tokens[0]
    else:
        return None

def update_or_create_user_tokens(session_id, access_token, refresh_token, token_type, expires_in):
    tokens = get_user_token(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.save(update_fields=[
            'access_token',
            'refresh_token',
            'token_type',
            'expires_in'
        ])
    else:
        token = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in
        )
        
        token.save()

def is_spotify_authenticated(session_id):
    tokens = get_user_token(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False

def refresh_spotify_token(session_id):
    refresh_token = get_user_token(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': os.getenv('SPOTIFY_CLIENT_ID') if os.getenv('SPOTIFY_CLIENT_ID') else store['SPOTIFY_CLIENT_ID'],
        'client_secret': os.getenv('SPOTIFY_CLIENT_SECRET') if os.getenv('SPOTIFY_CLIENT_SECRET') else store['SPOTIFY_CLIENT_SECRET']
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    update_or_create_user_tokens(
        session_id,
        access_token,
        refresh_token,
        token_type,
        expires_in
    )


def delete_spotify_token(session_id):
    token = get_user_token(session_id)
    token.delete()

def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False, data=None, params=None):
    access_token = get_user_token(session_id)
    if not access_token:
        return {'Error': 'Issue with request'}

    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token.access_token
    }
    if post_:
        post(BASE_URL + endpoint, headers=headers, data=data, params=params)
    
    if put_:
        put(BASE_URL + endpoint, headers=headers, data=data, params=params)
    
    response = get(BASE_URL + endpoint, headers=headers, data=data, params=params)

    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}


def app_execute_spotify_api_request(endpoint, post_=False, put_=False, data=None, params=None):
    token = get_admin_token()

    if token is None:
        access_token = app_request_access_token()
    else:
        access_token = token.access_token
    
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
    }

    if post_:
        post(BASE_URL + endpoint, headers=headers, data=data, params=params)
    
    if put_:
        put(BASE_URL + endpoint, headers=headers, data=data, params=params)
    
    response = get(BASE_URL + endpoint, headers=headers, data=data, params=params)
    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}

def app_request_access_token():
    client_id = os.getenv('SPOTIFY_CLIENT_ID') if os.getenv('SPOTIFY_CLIENT_ID') else store['SPOTIFY_CLIENT_ID']
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET') if os.getenv('SPOTIFY_CLIENT_SECRET') else store['SPOTIFY_CLIENT_SECRET']

    auth_string = client_id + ':' + client_secret
    auth_string_bytes = auth_string.encode('ascii')

    base64_bytes = base64.b64encode(auth_string_bytes)
    base64_string = base64_bytes.decode('ascii')
    headers = {
        'Authorization': 'Basic ' + base64_string
    }

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'client_credentials'
    }, headers=headers).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    return app_update_or_create_user_tokens(access_token, token_type, expires_in)

def app_update_or_create_user_tokens(access_token, token_type, expires_in):
    tokens = SpotifyToken.objects.filter(is_client=True)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    if tokens.exists():
        tokens = tokens[0]
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.save(update_fields=[
            'access_token',
            'token_type',
            'expires_in'
        ])
    else:
        token = SpotifyToken(
            user='admin',
            access_token=access_token,
            token_type=token_type,
            expires_in=expires_in,
            is_client=True
        )
        
        token.save()
    
    token = SpotifyToken.objects.filter(is_client=True)
    if token.exists():
        return token[0].access_token

def app_is_spotify_authenticated():
    tokens = get_admin_token()
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            app_request_access_token()
        return True
    else:
        app_request_access_token()
    return False

def parse_artist_list(artists):
    artist_string = ""

    for i, artist in enumerate(artists):
        if i > 0:
            artist_string += " , "
        name = artist.get('name')
        artist_string += name
    
    return artist_string