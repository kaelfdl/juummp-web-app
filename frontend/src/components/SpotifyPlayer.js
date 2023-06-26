import React, { Component } from 'react';
import loadSpotifyWebPlayer from '../hooks/loadSpotifyWebPlayer';

class SpotifyPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceId: '',
            volume: 1,
            name: 'Spotify Web Player',
            token: '',
            isInitializing: false,
            currentUri: '',
            repeat: 'context'
        }
        this.enableSpotifyPlayer();
    }

    async componentDidMount() {
        if (!window.onSpotifyWebPlaybackSDKReady) {
            window.onSpotifyWebPlaybackSDKReady = this.initializePlayer;
          } else {
            this.initializePlayer();
          }
          await loadSpotifyWebPlayer();
    }

    componentDidUpdate() {
        

        const {token, isInitializing, deviceId} = this.state;
        
        const resume = this.props.resume;


        if (this.player && !isInitializing && !this.props.isPlaying && this.props.track && resume) {
            const {playlist_id, track_number, progress, track_count} = this.props.track;
            const uri = `spotify:playlist:${playlist_id}`

            this.play(token, deviceId, uri, progress, track_number)
            .then(() => {
                console.log('playing')
            })
                this.props.handleResume(false)
        }
        
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.disconnect();
        }
    }

    play = (token, device_id, spotify_uri, position_ms=0, track_number=0) => {
        return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                context_uri: spotify_uri,
                offset: {
                    position: track_number,
                },
                position_ms: position_ms,
                device_id: device_id
            })
        });
    };

    enableSpotifyPlayer = (cb) => {
        fetch('/spotify/enable-spotify-player')
        .then(res => res.json())
        .then(data => {
            if (cb) {
                cb(data.token);
            }
            
            this.setState({token: data.token});
        });
    };

    modifyPlayerConfig = (player, device_id) => {
        player.getVolume().then(volume => {
            let volume_percentage = volume * 100;
            this.props.setPlayer(player, device_id, volume_percentage);
        });
    }

    initializePlayer = () => {

        const {name, volume} = this.state;
        
        this.setState({ isInitializing: true });
        this.player = new window.Spotify.Player({
            getOAuthToken: (cb) => this.enableSpotifyPlayer(cb),
            name,
            volume
        });

        // Error handling
        this.player.on('initialization_error', ({ message }) => { console.error(message); });
        this.player.on('authentication_error', ({ message }) => { console.error(message); });
        this.player.on('account_error', ({ message }) => {  console.error(message); this.props.handleAccountError(); });
        this.player.on('playback_error', ({ message }) => { console.error(message); });
    
        // Playback status updates
        this.player.addListener('player_state_changed', state => {
            if (state) {
                if (state.paused && this.state.isPlaying && state.track_window.next_tracks.length == 0) {
                    this.player.resume().then(()=> console.log('resuming'))
                }
                if (state.paused && !this.state.isPlaying) {
                    this.setState({isPlaying: false})
                }
            }  
        });

    
        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            
            this.setState({ 
                deviceId: device_id,
                isInitializing: false,
            });

            this.modifyPlayerConfig(this.player, device_id)
        });
    
        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device has gone offline');
        });

        this.player.connect();
    }

    render() {
        return null;
    }

};

export default SpotifyPlayer;