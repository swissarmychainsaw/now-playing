import React from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './SearchSection.module.css';

const SearchSection = ({ searchTerm, onSearchChange, onSearchSubmit }) => {
  return (
    <Paper elevation={3} className={styles.searchContainer}>
      <Box 
        component="form" 
        onSubmit={onSearchSubmit}
        className={styles.searchForm}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for movies..."
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: <SearchIcon className={styles.searchIcon} />,
            className: styles.searchInput
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          className={styles.searchButton}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchSection;
