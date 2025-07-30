const RecommendationTabs = ({ activeTab = 'forYou', onTabChange }) => {
  const tabs = [
    { id: 'forYou', label: 'For You' },
    { id: 'oscarWinners', label: 'Oscar Winners' },
    { id: 'popular', label: 'Popular' },
    { id: 'criticsPicks', label: 'Critics\' Picks' },
  ];

  return (
    <div className="relative bg-winter-wizard/20 rounded-full p-1">
      <div className="flex space-x-1 overflow-x-auto py-1 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-capri text-white shadow-md hover:bg-dodger-blue font-semibold'
                  : 'text-ryb-blue hover:bg-maya-blue/30 hover:text-ryb-blue/90'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-ryb-yellow rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationTabs;
