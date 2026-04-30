import PropTypes from 'prop-types';

/**
 * Admin dashboard statistics card component.
 * Displays a label, numeric value, and an icon.
 *
 * @param {{ label: string, value: number|string, icon: JSX.Element, className?: string }} props
 * @returns {JSX.Element}
 */
function StatCard({ label, value, icon, className }) {
  return (
    <div
      className={`flex items-center gap-4 bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-shadow duration-200 hover:shadow-md${className ? ` ${className}` : ''}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-ws-indigo-50 text-ws-indigo-600 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element.isRequired,
  className: PropTypes.string,
};

StatCard.defaultProps = {
  className: '',
};

export default StatCard;