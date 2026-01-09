import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/JobsPage.css';

/**
 * JobsPage - Displays incoming jobs for artisans
 * Fetches and displays reservations from /reservations/artisan
 */
const JobsPage = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingJobId, setProcessingJobId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');

  useEffect(() => {
    fetchIncomingJobs();
  }, []);

  const fetchIncomingJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/reservations/artisan', {
        method: 'GET'
      });

      setJobs(data || []);
    } catch (err) {
      console.error('❌ Error fetching incoming jobs:', err);
      setError(err.message || 'Failed to load incoming jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      setProcessingJobId(jobId);
      
      await apiRequest(`/reservations/${jobId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      console.log(`✅ Job ${jobId} ${newStatus.toLowerCase()} successfully`);
      
      // Refresh jobs list to show updated status
      await fetchIncomingJobs();
    } catch (err) {
      console.error(`❌ Error updating job status:`, err);
      alert(`Failed to ${newStatus.toLowerCase()} job: ${err.message}`);
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleAccept = (jobId) => {
    handleStatusUpdate(jobId, 'Accepted');
  };

  const handleReject = (jobId) => {
    handleStatusUpdate(jobId, 'Rejected');
  };

  const handleSetPrice = (job) => {
    setSelectedJob(job);
    setProposedPrice('');
    setPriceModalOpen(true);
  };

  const handleSubmitPrice = async () => {
    if (!selectedJob || !proposedPrice) {
      alert('Please enter a valid price');
      return;
    }

    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    try {
      setProcessingJobId(selectedJob._id);
      
      // Check if this is an update (job has existing price) or initial proposal
      const isUpdate = selectedJob.agreed_price && selectedJob.agreed_price > 0;
      
      // Use the same /status endpoint for both initial and update
      await apiRequest(`/reservations/${selectedJob._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ price: proposedPrice })
      });
      
      if (isUpdate) {
        console.log(`✅ Price updated to $${proposedPrice} for job ${selectedJob._id}`);
        alert(`Price updated to $${proposedPrice}! Customer has been notified.`);
      } else {
        console.log(`✅ Price $${proposedPrice} proposed for job ${selectedJob._id}`);
        alert(`Price $${proposedPrice} proposed successfully!`);
      }
      
      setPriceModalOpen(false);
      setSelectedJob(null);
      setProposedPrice('');
      
      // Refresh jobs list
      await fetchIncomingJobs();
    } catch (err) {
      console.error('❌ Error proposing price:', err);
      alert(`Failed to propose price: ${err.message}`);
    } finally {
      setProcessingJobId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: 'status-badge status-pending',
      Price_Proposed: 'status-badge status-warning',
      Negotiating: 'status-badge status-negotiating',
      Accepted: 'status-badge status-confirmed',
      Rejected: 'status-badge status-cancelled',
      Completed: 'status-badge status-completed',
      Cancelled: 'status-badge status-cancelled'
    };

    const statusLabels = {
      Price_Proposed: 'Price Proposed'
    };

    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getJobTypeIcon = (jobType) => {
    return jobType === 'Order' ? '📦' : '🔧';
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="jobs-page">
        <div className="error-container">
          <h2>⚠️ Error Loading Jobs</h2>
          <p>{error}</p>
          <button onClick={fetchIncomingJobs} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>📋 Incoming Jobs</h1>
        <p>Manage your reservation requests</p>
      </div>

      <div className="jobs-filters">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({jobs.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Pending')}
          >
            Pending ({jobs.filter(j => j.status === 'Pending').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Price_Proposed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Price_Proposed')}
          >
            Price Proposed ({jobs.filter(j => j.status === 'Price_Proposed').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Negotiating' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Negotiating')}
          >
            Negotiating ({jobs.filter(j => j.status === 'Negotiating').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Accepted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Accepted')}
          >
            Accepted ({jobs.filter(j => j.status === 'Accepted').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Rejected')}
          >
            Rejected ({jobs.filter(j => j.status === 'Rejected').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Completed')}
          >
            Completed ({jobs.filter(j => j.status === 'Completed').length})
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by customer name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {(() => {
        let filteredJobs = filterStatus === 'all' 
          ? jobs 
          : jobs.filter(job => job.status === filterStatus);

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredJobs = filteredJobs.filter(job => {
            const customerName = (job.customer?.name || '').toLowerCase();
            const title = (job.title || '').toLowerCase();
            const description = (job.description || '').toLowerCase();
            
            return customerName.includes(query) ||
                   title.includes(query) ||
                   description.includes(query);
          });
        }

        if (filteredJobs.length === 0) {
          return (
            <div className="no-jobs">
              <div className="no-jobs-icon">📭</div>
              <h2>No {searchQuery ? 'matching' : filterStatus === 'all' ? 'incoming' : filterStatus.toLowerCase()} jobs</h2>
              <p>
                {searchQuery 
                  ? `No jobs found matching "${searchQuery}"`
                  : filterStatus === 'all' 
                    ? "You don't have any reservation requests at the moment." 
                    : `You don't have any ${filterStatus.toLowerCase()} jobs.`}
              </p>
            </div>
          );
        }

        return (
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Customer Info</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td className="job-type">
                    <span style={{ fontSize: '1.5rem' }}>{getJobTypeIcon(job.job_type)}</span>
                    <br />
                    <small>{job.job_type === 'Order' ? 'Order' : 'Request'}</small>
                  </td>
                  <td className="job-title">
                    <strong style={{ fontSize: '1rem' }}>{job.title || 'N/A'}</strong>
                    {job.reference_image && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={job.reference_image.startsWith('http') ? job.reference_image : `http://localhost:5000${job.reference_image}`}
                          alt="Reference"
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #e1e8ed' }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="customer-info">
                    <div style={{ minWidth: '150px' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#2c3e50' }}>👤 {job.customer?.name || 'N/A'}</strong>
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        📧 {job.customer?.email || 'N/A'}
                      </div>
                      {job.customer?.phone_number && (
                        <div style={{ color: '#27ae60', fontSize: '0.85rem', fontWeight: '500' }}>
                          📱 {job.customer.phone_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="job-description">
                    <div style={{ maxWidth: '250px', minWidth: '150px', whiteSpace: 'normal', wordWrap: 'break-word', fontSize: '0.9rem', color: '#34495e' }}>
                      {job.description || 'No description'}
                    </div>
                  </td>
                  <td className="job-quantity" style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{job.quantity || 1}</strong>
                  </td>
                  <td className="job-deadline">
                    {job.deadline ? formatDate(job.deadline) : '—'}
                  </td>
                  <td className="job-status">{getStatusBadge(job.status)}</td>
                  <td className="job-price">
                    {job.agreed_price && job.agreed_price > 0 ? (
                      <strong style={{ color: '#27ae60', fontSize: '1.1rem' }}>${job.agreed_price.toFixed(2)}</strong>
                    ) : (
                      <span style={{ color: '#95a5a6', fontSize: '0.85rem', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </td>
                  <td className="job-created">
                    <small>{formatDate(job.createdAt)}</small>
                  </td>
                  <td className="job-actions">
                    {job.status === 'Pending' ? (
                      <div className="action-buttons">
                        {job.job_type === 'Custom_Request' && (!job.agreed_price || job.agreed_price === 0) ? (
                          <button
                            className="btn-set-price"
                            onClick={() => handleSetPrice(job)}
                            disabled={processingJobId === job._id}
                            style={{
                              background: '#f39c12',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              marginBottom: '0.5rem',
                              width: '100%'
                            }}
                          >
                            {processingJobId === job._id ? '⏳' : '💰'} Set Price
                          </button>
                        ) : null}
                        <button
                          className="btn-accept"
                          onClick={() => handleAccept(job._id)}
                          disabled={processingJobId === job._id}
                        >
                          {processingJobId === job._id ? '⏳' : '✓'} Accept
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(job._id)}
                          disabled={processingJobId === job._id}
                        >
                          {processingJobId === job._id ? '⏳' : '✗'} Reject
                        </button>
                      </div>
                    ) : (job.status === 'Negotiating' || job.status === 'Price_Proposed') ? (
                      <div className="action-buttons">
                        <button
                          className="btn-edit-price"
                          onClick={() => {
                            setSelectedJob(job);
                            setProposedPrice(job.agreed_price?.toString() || '');
                            setPriceModalOpen(true);
                          }}
                          disabled={processingJobId === job._id}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            width: '100%',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          {processingJobId === job._id ? '⏳' : '✏️'} Edit Price
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(job._id)}
                          disabled={processingJobId === job._id}
                        >
                          {processingJobId === job._id ? '⏳' : '✗'} Reject
                        </button>
                      </div>
                    ) : (
                      <span className="no-action">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        );
      })()}

      {/* Price Proposal Modal */}
      {priceModalOpen && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>
                💰 {selectedJob.agreed_price && selectedJob.agreed_price > 0 ? 'Update Price' : 'Propose Price'}
              </h2>
              <p style={{ color: '#7f8c8d', margin: 0 }}>
                {selectedJob.agreed_price && selectedJob.agreed_price > 0 ? (
                  <>
                    Current price: <strong style={{ color: '#e67e22' }}>${selectedJob.agreed_price.toFixed(2)}</strong><br />
                    Enter new price for: <strong>{selectedJob.title}</strong>
                  </>
                ) : (
                  <>Set a price for: <strong>{selectedJob.title}</strong></>
                )}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Price ($) *
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="Enter price"
                min="1"
                step="0.01"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #3498db',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setPriceModalOpen(false);
                  setSelectedJob(null);
                  setProposedPrice('');
                }}
                disabled={processingJobId === selectedJob._id}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPrice}
                disabled={processingJobId === selectedJob._id}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {processingJobId === selectedJob._id ? '⏳ Submitting...' : '✓ Submit Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
