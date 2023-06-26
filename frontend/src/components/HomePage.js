import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { Grid, Typography } from '@material-ui/core'
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';

import LoginPage from './LoginPage';
import SoundWave from './SoundWave';
import MusicCard from './MusicCard';
import Jump from './Jump';
import Spinner from './Spinner';
import AccountError from './AccountError';
import DeviceError from './DeviceError';
import SpotifyPlayer from './SpotifyPlayer';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceId: '',
            player: null,
            isMuted: false,
            song: {},
            track: null,
            isPlaying: false,
            renderMusicCard: false,
            volume: 0,
            resume: false
        };


        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.handleMute = this.handleMute.bind(this);
        this.handleJump = this.handleJump.bind(this);
        this.setPlayer = this.setPlayer.bind(this);
        this.getCurrentTrack = this.getCurrentTrack.bind(this);
        this.handleResume = this.handleResume.bind(this);
        this.getCurrentSong();
    };


    componentDidMount() {
        this.props.handleLoading(false);
        this.interval = setInterval(() => {
            this.getCurrentSong();
        }, 1000);

        if (this.state.isPlaying) {
            this.setState({ renderMusicCard: true });
        }
    };

    componentWillUnmount() {
        clearInterval(this.interval);
        this.setState({ isPlaying: false })
    }

    getCurrentSong() {
        if (this.state.player) {
            const artistString = (artists) => {
                let s = '';
                for (const [i, artist] of artists.entries()) {
                    if (i > 0) {
                        s += ' , ';
                    }
                    const name = artist.name;
                    s += name;
                }
                return s;
            }
            this.state.player.getCurrentState().then(state => {
                if (!state && !this.state.loading) {
                    console.error('User is not playing music through the Web Playback SDK');
                    this.setState({ renderMusicCard: false, isPlaying: false });
                    return;
                }

                if (state) {
                    if (state.paused && !this.state.loading) {
                        this.setState({ renderMusicCard: false, isPlaying: false });
                        return
                    }

                    if (!state.paused && !this.state.isPlaying) {
                        this.setState({ isPlaying: true });
                    }

                    if (!state.paused) {
                        this.setState({ renderMusicCard: true })
                    }


                    let {
                        current_track,
                        next_tracks
                    } = state.track_window;

                    if (current_track) {
                        let { id, name, artists, duration_ms, album } = current_track;

                        this.setState({
                            song: {
                                title: name,
                                artist: artistString(artists),
                                duration: duration_ms,
                                time: state.position,
                                image_url: album.images[0].url,
                                is_playing: state.paused,
                                id: id
                            }
                        })
                    }
                }
            });
        }
    };


    handleMute() {
        const isMuted = this.state.isMuted && this.state.volume == 0;
        const volume = isMuted ? 1 : 0;

        this.state.player.setVolume(volume);
        this.setState({
            isMuted: !isMuted,
            volume: volume
        });
    }


    setPlayer(player, device_id, volume) {
        this.setState({
            player: player,
            deviceId: device_id,
            volume: volume
        });
    }

    handleJump() {
        this.getCurrentTrack();
        this.setState({ renderMusicCard: true, loading: true, resume: true })
    }

    handleResume(resume) {
        this.setState({ resume: resume })
    }

    getCurrentTrack() {
        fetch('/spotify/current-track')
            .then(res => res.ok ? res.json() : {})
            .then(data => {
                this.setState({
                    track: data,
                    isPlaying: !this.state.isPlaying,
                })
                this.props.handleLoading(false)
            })
    }

    renderHomePage() {
        if (isMobile) {
            return <DeviceError />
        } else {
            const { resume, track, isMuted } = this.state;
            return (
                <Grid container spacing={1}>
                    <Grid item xs={12} align="center">
                        <SpotifyPlayer resume={resume} track={track} handleResume={this.handleResume} handleAccountError={this.props.handleAccountError} setPlayer={this.setPlayer} isMuted={isMuted} handleMute={this.handleMute} />
                        {this.renderJump()}

                    </Grid>
                </Grid>
            )
        }
    }

    renderJump() {
        if (this.state.isPlaying) {
            return (
                <Grid container spacing={1}>
                    <Grid item xs={12} align="center">
                        <SoundWave />
                        <Typography variant="h1" component="h1">
                            JUUMMP
                        </Typography>
                        {this.state.renderMusicCard ? <MusicCard {...this.state.song} handleAccountError={this.props.handleAccountError} isMuted={this.state.isMuted} handleMute={this.handleMute} /> : null}
                    </Grid>
                </Grid>
            )
        } else {
            return <Jump isPlaying={this.state.isPlaying} handleJump={this.handleJump} />
        }



    }

    render() {
        if (this.props.loading && !this.state.player) {
            return <Spinner />;
        }
        if (this.props.accountError) {
            return <AccountError />;
        }

        return (
            <Router>
                <Switch>
                    <Route exact path='/' render={
                        () => {
                            if (this.props.loading) {
                                return <Spinner />;
                            }
                            return this.props.spotifyAuthenticated && !this.props.accountError ? this.renderHomePage()
                                : <LoginPage handleLogin={this.props.handleLogin} />
                        }
                    }
                    />
                </Switch>
            </Router>
        );
    };
};