import React, { useState } from 'react';
import { Box, TextField, Button, Paper, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchSection = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
      }}
    >
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ 
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchSection;
