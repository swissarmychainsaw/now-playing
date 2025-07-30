import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

/**
 * RecommendationTabs component for switching between different movie recommendation categories
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Callback when tab is changed
 * @param {boolean} [props.isLoading] - Whether the tab content is loading
 * @param {Object} [props.tabConfig] - Custom tab configuration
 * @returns {JSX.Element} Rendered component
 */
const RecommendationTabs = ({
  activeTab = 'forYou',
  onTabChange,
  isLoading = false,
  tabConfig = [
    { id: 'forYou', label: 'For You' },
    { id: 'oscarWinners', label: 'Oscar Winners' },
    { id: 'popular', label: 'Popular' },
    { id: 'criticsPicks', label: 'Critics\' Picks' },
  ],
}) => {
  const [tabs, setTabs] = useState(tabConfig);
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle tab change with loading state
  const handleTabChange = (tabId) => {
    if (isLoading) return; // Only prevent if already loading
    onTabChange(tabId);
  };

  // Update tabs if config changes
  useEffect(() => {
    setTabs(tabConfig);
  }, [tabConfig]);

  return (
    <div 
      className="relative bg-winter-wizard/20 rounded-full p-1"
      role="tablist"
      aria-label="Movie recommendation categories"
    >
      <div 
        className="flex space-x-1 overflow-x-auto py-1 scrollbar-hide"
        onScroll={() => {
          if (!isScrolling) {
            setIsScrolling(true);
            setTimeout(() => setIsScrolling(false), 100);
          }
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLoadingTab = isActive && isLoading;
          
          return (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => handleTabChange(tab.id)}
              disabled={isLoadingTab}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                flex items-center justify-center min-w-[100px] ${
                  isActive
                    ? 'bg-capri text-white shadow-md hover:bg-dodger-blue font-semibold'
                    : 'text-ryb-blue hover:bg-maya-blue/30 hover:text-ryb-blue/90'
                } ${isLoadingTab ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
            >
              {isLoadingTab ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {tab.label}
              {isActive && !isLoadingTab && (
                <span 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-ryb-yellow rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

RecommendationTabs.propTypes = {
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  tabConfig: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default RecommendationTabs;
