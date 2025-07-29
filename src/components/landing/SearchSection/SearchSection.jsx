import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './SearchSection.module.css';
import discoverImage from '../../../assets/images/Discover.png';

const SearchSection = ({ searchTerm = '', onSearchChange, onSearchSubmit }) => {
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearchTerm);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(e);
    }
  };

  return (
    <div 
      className={styles.container}
      style={{ backgroundImage: `url(${discoverImage})` }}
    >
      <div className={styles.overlay} />
      <Box 
        component="form"
        className={styles.searchForm}
        onSubmit={handleFormSubmit}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for movies..."
          value={localSearchTerm}
          onChange={handleInputChange}
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
