import { useState } from 'react';
import Button from '../common/Button';

const BidsList = ({ bids, gigStatus, onHire }) => {
  const [expandedBid, setExpandedBid] = useState(null);

  const _getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      hired: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Hired' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  if (bids.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No bids yet</p>
        <p className="text-gray-500 mt-2">Waiting for freelancers to submit proposals</p>
      </div>
    );
  }

  // Separate bids by status
  const hiredBids = bids.filter(bid => bid.status === 'hired');
  const pendingBids = bids.filter(bid => bid.status === 'pending');
  const rejectedBids = bids.filter(bid => bid.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Proposals Received</h2>
        <p className="text-gray-600 mb-6">
          {pendingBids.length} pending · {hiredBids.length} hired · {rejectedBids.length} rejected
        </p>

        {/* Hired Bid (if any) */}
        {hiredBids.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-700 mb-4">✓ Hired Freelancer</h3>
            {hiredBids.map(bid => (
              <BidCard 
                key={bid._id} 
                bid={bid} 
                gigStatus={gigStatus}
                onHire={onHire}
                expandedBid={expandedBid}
                setExpandedBid={setExpandedBid}
                isHired={true}
              />
            ))}
          </div>
        )}

        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Pending Proposals</h3>
            <div className="space-y-4">
              {pendingBids.map(bid => (
                <BidCard 
                  key={bid._id} 
                  bid={bid} 
                  gigStatus={gigStatus}
                  onHire={onHire}
                  expandedBid={expandedBid}
                  setExpandedBid={setExpandedBid}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Bids */}
        {rejectedBids.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Rejected Proposals</h3>
            <div className="space-y-4 opacity-60">
              {rejectedBids.map(bid => (
                <BidCard 
                  key={bid._id} 
                  bid={bid} 
                  gigStatus={gigStatus}
                  onHire={onHire}
                  expandedBid={expandedBid}
                  setExpandedBid={setExpandedBid}
                  isRejected={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Bid Card Component
const BidCard = ({ bid, gigStatus, onHire, expandedBid, setExpandedBid, isHired, isRejected }) => {
  const isExpanded = expandedBid === bid._id;
  const canHire = gigStatus === 'open' && bid.status === 'pending';

  return (
    <div className={`border rounded-lg p-6 ${isHired ? 'border-green-300 bg-green-50' : isRejected ? 'border-gray-300' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">
              {bid.freelancer.name}
            </h4>
            {bid.status === 'pending' && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                Pending
              </span>
            )}
            {bid.status === 'hired' && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                ✓ Hired
              </span>
            )}
            {bid.status === 'rejected' && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                Rejected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{bid.freelancer.email}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">${bid.proposedAmount}</p>
          <p className="text-sm text-gray-500">{bid.deliveryTime} days</p>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="mb-4">
        <p className="text-gray-700 line-clamp-2">
          {bid.coverLetter}
        </p>
      </div>

      {/* Freelancer Skills */}
      {bid.freelancer.skills && bid.freelancer.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bid.freelancer.skills.slice(0, 5).map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedBid(isExpanded ? null : bid._id)}
        >
          {isExpanded ? 'Show Less' : 'Read Full Proposal'}
        </Button>

        {canHire && (
          <Button
            variant="success"
            size="sm"
            onClick={() => onHire(bid._id)}
          >
            🎯 Hire This Freelancer
          </Button>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h5 className="font-semibold mb-2">Full Cover Letter:</h5>
          <p className="text-gray-700 whitespace-pre-wrap">{bid.coverLetter}</p>
          
          {bid.freelancer.bio && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">About {bid.freelancer.name}:</h5>
              <p className="text-gray-700">{bid.freelancer.bio}</p>
            </div>
          )}

          {bid.freelancer.skills && bid.freelancer.skills.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">Skills:</h5>
              <div className="flex flex-wrap gap-2">
                {bid.freelancer.skills.map((skill, index) => (
                  <span key={index} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BidsList;