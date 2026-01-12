import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gigAPI, bidAPI } from '../../services/api';
import { setMyGigs, setLoading } from '../../store/gigSlice';
import { setMyBids } from '../../store/bidSlice';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-gigs');
  const dispatch = useDispatch();
  const { myGigs, loading } = useSelector((state) => state.gigs);
  const { myBids } = useSelector((state) => state.bids);

  const fetchData = async () => {
    dispatch(setLoading(true));
    try {
      const [gigsRes, bidsRes] = await Promise.all([
        gigAPI.getMyGigs(),
        bidAPI.getMyBids(),
      ]);
      dispatch(setMyGigs(gigsRes.data));
      dispatch(setMyBids(bidsRes.data));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">Manage your gigs and bids</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('my-gigs')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'my-gigs'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Posted Gigs ({myGigs.length})
            </button>
            <button
              onClick={() => setActiveTab('my-bids')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'my-bids'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Bids ({myBids.length})
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* My Gigs Tab */}
          {activeTab === 'my-gigs' && (
            <div className="space-y-4">
              {myGigs.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 mb-4">You haven't posted any gigs yet</p>
                  <Link to="/post-gig">
                    <Button variant="primary">Post Your First Gig</Button>
                  </Link>
                </div>
              ) : (
                myGigs.map((gig) => (
                  <div key={gig._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {gig.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{gig.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-lg font-bold text-primary-600">
                            ${gig.budget}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
                            {gig.status}
                          </span>
                          {gig.status === 'assigned' && gig.hiredBid && (
                            <span className="text-sm text-green-700 font-medium">
                              ✓ Freelancer hired
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={`/gig/${gig._id}`}>
                        <Button variant="outline" size="sm">
                          {gig.status === 'open' ? 'View Bids' : 'View Details'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Bids Tab */}
          {activeTab === 'my-bids' && (
            <div className="space-y-4">
              {myBids.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 mb-4">You haven't submitted any bids yet</p>
                  <Link to="/feed">
                    <Button variant="primary">Browse Gigs</Button>
                  </Link>
                </div>
              ) : (
                myBids.map((bid) => (
                  <div key={bid._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {bid.gig?.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{bid.coverLetter}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-lg font-bold text-primary-600">
                            ${bid.proposedAmount}
                          </span>
                          <span className="text-sm text-gray-600">
                            {bid.deliveryTime} days delivery
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                            {bid.status === 'hired' ? '✓ Hired!' : bid.status}
                          </span>
                        </div>
                        {bid.status === 'hired' && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-green-800 text-sm font-medium">
                              🎉 Congratulations! You've been hired for this gig.
                            </p>
                          </div>
                        )}
                        {bid.status === 'rejected' && (
                          <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
                            <p className="text-gray-600 text-sm">
                              The client hired another freelancer for this gig.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;