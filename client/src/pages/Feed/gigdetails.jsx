import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gigAPI, bidAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import BidsList from '../../components/features/bidlist';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Bid form state
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({
    proposedAmount: '',
    coverLetter: '',
    deliveryTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGigDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchGigDetails = async () => {
    setLoading(true);
    try {
      const gigRes = await gigAPI.getGigById(id);
      setGig(gigRes.data);

      // If user is the owner, fetch bids
      if (gigRes.data.client._id === user._id) {
        const bidsRes = await bidAPI.getBidsForGig(id);
        setBids(bidsRes.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await bidAPI.createBid({
        gigId: id,
        proposedAmount: parseFloat(bidForm.proposedAmount),
        coverLetter: bidForm.coverLetter,
        deliveryTime: parseInt(bidForm.deliveryTime),
      });

      alert('✅ Bid submitted successfully!');
      setShowBidForm(false);
      setBidForm({ proposedAmount: '', coverLetter: '', deliveryTime: '' });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) {
      return;
    }

    try {
      await bidAPI.hireBid(bidId);
      
      // Refresh the page to show updated status
      await fetchGigDetails();
      
      alert('✅ Freelancer hired successfully! All other bids have been automatically rejected.');
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading gig details...</p>
      </div>
    );
  }

  if (error && !gig) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const isOwner = gig?.client._id === user._id;
  const isOpen = gig?.status === 'open';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gig Details */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
            <p className="text-gray-600">Posted by <span className="font-medium">{gig.client.name}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Budget</p>
            <p className="text-3xl font-bold text-primary-600">${gig.budget}</p>
          </div>
        </div>

        <div className="mb-6">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            gig.status === 'open' ? 'bg-green-100 text-green-800' :
            gig.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {gig.status.toUpperCase()}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="text-xl font-semibold mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
        </div>

        {gig.client.bio && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">About the Client</h3>
            <p className="text-gray-700">{gig.client.bio}</p>
          </div>
        )}
      </div>

      {/* Actions based on user role */}
      {!isOwner && isOpen && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          {!showBidForm ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Interested in this gig?</h2>
              <p className="text-gray-600 mb-6">Submit your proposal to the client</p>
              <Button variant="primary" size="lg" onClick={() => setShowBidForm(true)}>
                Submit a Bid
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6">Submit Your Proposal</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleBidSubmit}>
                <Input
                  label="Your Proposed Amount ($)"
                  type="number"
                  value={bidForm.proposedAmount}
                  onChange={(e) => setBidForm({ ...bidForm, proposedAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                />

                <Input
                  label="Estimated Delivery Time (days)"
                  type="number"
                  value={bidForm.deliveryTime}
                  onChange={(e) => setBidForm({ ...bidForm, deliveryTime: e.target.value })}
                  required
                  min="1"
                  placeholder="7"
                />

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={bidForm.coverLetter}
                    onChange={(e) => setBidForm({ ...bidForm, coverLetter: e.target.value })}
                    required
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Explain why you're the best fit for this project..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowBidForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="flex-1"
                  >
                    Submit Bid
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Owner view: Show bids */}
      {isOwner && (
        <BidsList 
          bids={bids} 
          gigStatus={gig.status} 
          onHire={handleHire}
        />
      )}

      {/* Not owner, gig closed */}
      {!isOwner && !isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg text-center">
          <p className="font-medium">This gig is no longer accepting bids.</p>
        </div>
      )}
    </div>
  );
};

export default GigDetail;