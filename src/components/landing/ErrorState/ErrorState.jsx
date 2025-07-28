import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from './ErrorState.module.css';

const ErrorState = ({ error, onRetry }) => {
  return (
    <Box className={styles.errorContainer}>
      <ErrorOutlineIcon className={styles.errorIcon} />
      <Typography variant="h6" className={styles.errorMessage}>
        {error || 'Something went wrong'}
      </Typography>
      {onRetry && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onRetry}
          className={styles.retryButton}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
