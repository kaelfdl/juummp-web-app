const loadSpotifyWebPlayer = () => {
    const existingSpotifyPlayer = document.getElementById('spotify-web-player');

    const getUserPlaybackInfo = (token) => {
        fetch('https://api.spotify.com/v1/me/player', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(error => console.log(error));
    };

    const transferUserPlayback = (token, device_id) => {
        return fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                play: true,
                device_ids: [device_id]
            })
        })
    }

    const play = (token, device_id, spotify_uri) => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                context_uri: spotify_uri,
                device_id: device_id
            })
        });
    };

    const setVolume = (device_id, volume_percent) => {
        fetch('/spotify/set-volume', {
            method: 'PUT',
            body: JSON.stringify({
                device_id: device_id,
                volume_percent: volume_percent
            })
        });
    };

    const enableSpotifyPlayer = (callback) => {
        fetch('/spotify/enable-spotify-player')
        .then(res => res.json())
        .then(data => {
            callback(data.token)
        });
    };

    
    const waitForSpotifyWebPlaybackSDKToLoad = () => {
        return new Promise(resolve => {
            if (window.Spotify) {
                resolve(window.Spotify);
            } else {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve(window.Spotify);
                };
            }
        });
    };

    const checkPlayerState = (player, callback) => {
        // Playback status updates
        player.addListener('player_state_changed', state => { 
            callback(player, state)
        });
    }

    if (!existingSpotifyPlayer) {
        const script = document.createElement('script');
        script.id = 'spotify-web-player';
        script.async = false;
        script.defer = true;
        script.src = 'https://sdk.scdn.co/spotify-player.js';

        document.body.appendChild(script);

        script.onload = () => {
            window.onSpotifyWebPlaybackSDKReady = () => {};

            waitForSpotifyWebPlaybackSDKToLoad().then((spotify) => {
                enableSpotifyPlayer(token => {
                    const player = new spotify.Player({
                        name: 'Web Playback SDK Quick Start Player',
                        getOAuthToken: cb => {
                            cb(token);
                        }
                    });
                
                    // Error handling
                    player.addListener('initialization_error', ({ message }) => { console.error(message); });
                    player.addListener('authentication_error', ({ message }) => { console.error(message); });
                    player.addListener('account_error', ({ message }) => { console.error(message); });
                    player.addListener('playback_error', ({ message }) => { console.error(message); });
                
                   
                
                    // Ready
                    player.addListener('ready', ({ device_id }) => {
                        console.log('Ready with Device ID', device_id);
                        transferUserPlayback(token, device_id)
                        .then(() => {
                            play(token, device_id, 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')
                        })
                        setVolume(device_id, 50);
                    });
                
                    // Not Ready
                    player.addListener('not_ready', ({ device_id }) => {
                        console.log('Device ID has gone offline', device_id);
                    });
                
                    checkPlayerState(player, (player, state) => {
                        console.log(state)
                        if (state.paused) {
                            // player.resume().then(() => console.log('resuming'))
                        }
                    });

                    // Connect to the player!
                    player.connect()
                });
            });
        };
    };
};

export default loadSpotifyWebPlayer;