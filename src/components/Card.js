import React from 'react';
import './Card.css';

const Card = ({ title, value, icon }) => {
  return (
    <div className="card">
      <div className="card-icon">
        <i className="material-icons">{icon}</i>
      </div>
      <div className="card-content">
        <h2>{value}</h2>
        <p>{title}</p>
      </div>
    </div>
  );
};

export default Card;
