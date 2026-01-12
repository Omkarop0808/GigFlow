import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gigAPI } from '../../services/api';
import { setGigs, setLoading, setError } from '../../store/gigSlice';
import GigCard from '../../components/features/gigcard';
import Input from '../../components/common/Input';

const Feed = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const dispatch = useDispatch();
  const { gigs, loading, error } = useSelector((state) => state.gigs);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' },
  ];

  const fetchGigs = async () => {
    dispatch(setLoading(true));
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;

      const response = await gigAPI.getGigs(params);
      dispatch(setGigs(response.data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  useEffect(() => {
    fetchGigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Gigs</h1>
        <p className="text-gray-600">Find your next opportunity</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading gigs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Gigs Grid */}
      {!loading && !error && (
        <>
          {gigs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No gigs found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;