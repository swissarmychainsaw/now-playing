import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';

const Director = ({ director, className = '' }) => {
  if (!director) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <FaFilm className="text-blue-500 mr-2" />
      <span className="font-semibold mr-1">Director:</span>
      <Link 
        to={`/director/${director.id}`}
        className="text-blue-400 hover:text-blue-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {director.name}
      </Link>
    </div>
  );
};

export default Director;
