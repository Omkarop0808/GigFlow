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
      'web-development': 'bg-blue-100 text-blue-800',
      'mobile-development': 'bg-green-100 text-green-800',
      'design': 'bg-purple-100 text-purple-800',
      'writing': 'bg-yellow-100 text-yellow-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900">{gig.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(gig.category)}`}>
          {gig.category.replace('-', ' ')}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-2xl font-bold text-blue-600">${gig.budget}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Posted by</p>
          <p className="text-sm font-medium text-gray-900">{gig.client?.name}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm text-gray-500">
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