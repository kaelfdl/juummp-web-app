import React, { useEffect, useRef } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
      background: '#55FFF5',
      border: 0,
      borderRadius: 24,
      color: '#151515',
      height: 48,
      padding: '0 30px',
      margin: '12px',
      '&:hover': {
            backgroundColor: '#AAFFFA',
      }
    },
    buttonText: {
        fontWeight: 'bold'
    }
});

const Jump = (props) => {
    const classes = useStyles();

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Button onClick={props.handleJump} className={classes.root}>
                    <Typography variant='h6' component='h6' className={classes.buttonText}>
                        JUUMMP
                    </Typography>
                </Button>
            </Grid>
        </Grid>
    )
}

export default Jump;