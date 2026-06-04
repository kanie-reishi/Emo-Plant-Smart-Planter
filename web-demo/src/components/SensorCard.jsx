import React from 'react';

/**
 * SensorCard component for displaying sensor readings on the dashboard.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.label - Name of the metric (e.g., "Độ ẩm đất")
 * @param {string|number} props.value - The current value
 * @param {string} props.unit - The unit (e.g., "%", "°C")
 * @param {string} props.color - Color theme: "green", "blue", "amber", "red"
 * @param {string} props.status - Status: "normal", "warning", "critical"
 */
export default function SensorCard({ icon: Icon, label, value, unit, color, status = 'normal' }) {
  // Determine if the card should have a warning/critical highlight
  const isWarning = status === 'warning';
  const isCritical = status === 'critical';
  
  let cardClass = 'card card-sm';
  if (isCritical) {
    cardClass += ' border-red-500 shadow-red-100'; // Assuming we might add these utilities, or we just rely on inline styles for critical
  }

  // Override color if critical
  const iconColor = isCritical ? 'red' : isWarning ? 'amber' : color;

  return (
    <div 
      className={cardClass} 
      style={isCritical ? { borderColor: '#ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' } : {}}
    >
      <div className="card-header">
        <span className="card-label font-semibold">{label}</span>
        <div className={`card-icon ${iconColor}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="card-value">
        {value} <span className="text-sm font-normal text-muted">{unit}</span>
      </div>
    </div>
  );
}
