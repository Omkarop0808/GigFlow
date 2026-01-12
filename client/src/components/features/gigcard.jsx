import { Link } from 'react-router-dom';
import Button from '../common/Button';

const GigCard = ({ gig }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'web-development': 'bg-blue-50 text-blue-700 ring-blue-200',
      'mobile-development': 'bg-green-50 text-green-700 ring-green-200',
      design: 'bg-purple-50 text-purple-700 ring-purple-200',
      writing: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
      marketing: 'bg-pink-50 text-pink-700 ring-pink-200',
      other: 'bg-gray-50 text-gray-700 ring-gray-200',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
          {gig.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 ${getCategoryColor(
            gig.category
          )}`}
        >
          {gig.category.replace('-', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="mb-5 text-sm text-gray-600 line-clamp-3">
        {gig.description}
      </p>

      {/* Meta */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Budget
          </p>
          <p className="text-3xl font-bold text-blue-600">
            ${gig.budget}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Posted by
          </p>
          <p className="text-sm font-medium text-gray-900">
            {gig.client?.name || 'Anonymous'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-xs text-gray-500">
          Posted {formatDate(gig.createdAt)}
        </span>

        <Link to={`/gig/${gig._id}`}>
          <Button variant="primary" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GigCard;
