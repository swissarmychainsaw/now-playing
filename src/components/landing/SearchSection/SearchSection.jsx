import React from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './SearchSection.module.css';

const SearchSection = ({ searchTerm, onSearchChange, onSearchSubmit }) => {
  return (
    <div style={{
      backgroundImage: 'url("/images/Discover.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '3rem 2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        zIndex: 1
      }}></div>
      <Box 
        component="form" 
        onSubmit={onSearchSubmit}
        style={{ position: 'relative', zIndex: 2 }}
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
    </div>
  );
};

export default SearchSection;
