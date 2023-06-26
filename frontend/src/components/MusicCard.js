import React from 'react';
import { Grid, Typography, Card, LinearProgress, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuteButton from './MuteButton';

const useStyles = makeStyles({
    root: {
      background: 'transparent',
      color: '#FFFFFF',
    },
    bar: {
        backgroundColor: '#55FFF5'
    },
    colorPrimary: {
        background: 'transparent'
    }
});

export default function MusicCard(props) {
    
        const songProgress = ( props.time / props.duration ) * 100 || 0;
        const classes = useStyles();
        
        return (
            <Card className={classes.root}>
                <Grid container alignItems="center">
                    <Grid item align="center" xs={4}>
                        <img src={props.image_url} height="100%" width="100%" />
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography component="h5" variant="h5">
                            { props.title }
                        </Typography>
                        <Typography color="initial" variant="subtitle1">
                            { props.artist }
                        </Typography>
                        {props.title ? <MuteButton isMuted={props.isMuted} handleMute={props.handleMute} /> : null}
                        
                    </Grid>
                </Grid>
                <LinearProgress classes={ {
                    colorPrimary: classes.colorPrimary,
                    bar: classes.bar
                    } } variant="determinate" value={songProgress} />
            </Card>
        );
}