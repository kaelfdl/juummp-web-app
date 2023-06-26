import React, { Component } from 'react';
import { render } from 'react-dom';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

import HomePage from './HomePage';
import NavBar from './NavBar';
import Spinner from './Spinner';


let theme = createMuiTheme({
    shadows: ['none'],
    typography: {
      fontFamily: [
        'Rubik',
        'sans-serif'
      ].join(','),
    },
});

theme = responsiveFontSizes(theme);

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spotifyAuthenticated: false,
            loading: true,
            accountError: false,
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleLoading = this.handleLoading.bind(this);
        this.handleAccountError = this.handleAccountError.bind(this);
    };

    componentDidMount() {
        this.checkAuth();
    }

    checkAuth() {
        fetch('/spotify/is-authenticated')
        .then(res => res.json())
        .then(data => {
            this.setState({
                spotifyAuthenticated: data.status,
            });
            this.handleLoading(false);
        });
    };


    handleLogin() {
        this.handleLoading(true);
        fetch('/spotify/is-authenticated')
        .then(res => res.json())
        .then(data => {
            this.setState({spotifyAuthenticated: data.status, expiry: data.expiry});
            if (!data.status) {
                fetch('/spotify/get-auth-url')
                .then(res => res.json())
                .then(data => {
                    window.location.replace(data.url);
                });
            }
        });
    }


    handleLogout() {
        this.handleLoading(true);
        fetch('/spotify/logout', {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            this.setState({
                spotifyAuthenticated: data.status,
                accountError: false,
            })
            this.handleLoading(false);
        });
    }

    handleLoading(state) {
        this.setState({loading: state ? true : false})
    }

    handleAccountError() {
        this.setState({ accountError: true })
    } 

    renderMobileDeviceView() {
            
    }

    render() {
        if (this.state.loading) {
            return <Spinner/>;
        }
        
        return (
            <ThemeProvider theme={theme} >
                {this.state.spotifyAuthenticated ? <NavBar handleLogout={this.handleLogout}/> : null}
                
                <div className="center">
                    <HomePage {...this.state} handleAccountError={this.handleAccountError} handleLoading={this.handleLoading} handleAuth={this.checkAuth} handleLogin={this.handleLogin} />
                </div>
            </ThemeProvider>
        )
    };
};

const appDiv = document.getElementById('app');
render(<App />, appDiv);