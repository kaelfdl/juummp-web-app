import React from 'react'
import { Grid, Typography } from '@material-ui/core';

import SoundWave from './SoundWave';

const DeviceError = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <SoundWave />
                <Typography variant="h1" component="h1">
                    JUMMP
                </Typography>
                <Typography variant="subtitle2" component="subtitle2">
                    This feature is not supported on mobile devices
                </Typography>
            </Grid>
        </Grid>
    )
}

export default DeviceError;