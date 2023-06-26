import React from 'react'
import { Grid, Typography } from '@material-ui/core';

import SoundWave from './SoundWave';

const AccountError = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <SoundWave />
                <Typography variant="h1" component="h1">
                    JUMMP
                </Typography>
                <Typography variant="h6" component="h6">
                    This feature is only available with Spotify premium
                </Typography>
            </Grid>
        </Grid>
    );
}

export default AccountError;