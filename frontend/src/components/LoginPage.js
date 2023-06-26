import React from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
      background: '#1db954',
      border: 0,
      borderRadius: 24,
      color: 'white',
      height: 'auto',
      padding: '10px 30px',
      margin: '12px',
      '&:hover': {
            backgroundColor: '#2bde6a',
      }
    },
    buttonText: {
        fontWeight: 'bold',
    },
    noteText: {
        color: '#404040',
        fontWeight: 'lighter',
        display: 'block'
    }
});



export default function LoginPage(props) {

    const classes = useStyles();
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Typography variant="h3" component="h3">
                    Experience JUUMMP with Spotify
                </Typography>
                <Button className={classes.root} onClick={props.handleLogin}>
                    <Typography noWrap variant="h6" component="h6" className={classes.buttonText}>
                        Login with Spotify
                    </Typography>                    
                </Button>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography className={classes.noteText} variant="subtitle2" component="subtitle2">
                    *only available with Spotify premium
                </Typography>
            </Grid>
        </Grid>
    );
}