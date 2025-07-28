import React from 'react';
import { Button, ButtonGroup, Box } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MovieIcon from '@mui/icons-material/Movie';
import styles from './RecommendationTabs.module.css';

const RECOMMENDATION_TABS = [
  {
    id: 'for_you',
    label: 'For You',
    icon: <ThumbUpIcon className={styles.tabIcon} />
  },
  {
    id: 'oscar',
    label: 'Oscar Winners',
    icon: <EmojiEventsIcon className={styles.tabIcon} />
  },
  {
    id: 'popular',
    label: 'Popular',
    icon: <WhatshotIcon className={styles.tabIcon} />
  },
  {
    id: 'critics',
    label: 'Critics\' Picks',
    icon: <MovieIcon className={styles.tabIcon} />
  }
];

const RecommendationTabs = ({ activeTab, onTabChange }) => {
  return (
    <Box className={styles.tabsContainer}>
      <ButtonGroup 
        variant="outlined" 
        aria-label="recommendation tabs"
        className={styles.tabGroup}
      >
        {RECOMMENDATION_TABS.map((tab) => (
          <Button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.id)}
            startIcon={tab.icon}
          >
            {tab.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default RecommendationTabs;
