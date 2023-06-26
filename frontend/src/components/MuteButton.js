import React from 'react';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VolumeMuteRoundedIcon from '@material-ui/icons/VolumeMuteRounded';
import VolumeUpRoundedIcon from '@material-ui/icons/VolumeUpRounded';

const useStyles = makeStyles({
    root: {
        color: '#939393',
        fontSize: 40,
    }
})



export default function MuteButton(props) {
    const classes = useStyles();

    return (
        <IconButton onClick={props.handleMute}>
            { props.isMuted ? 
                <VolumeMuteRoundedIcon className={classes.root}/>
                :
                <VolumeUpRoundedIcon className={classes.root}/>
            }
            
        </IconButton>
    );
}