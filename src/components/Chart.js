import React from 'react';
import './Chart.css';

const Chart = ({ title }) => {
  return (
    <div className="chart">
      <h3>{title}</h3>
      <div className="chart-content">
        {/* Aqui você pode adicionar os gráficos */}
      </div>
    </div>
  );
};

export default Chart;
