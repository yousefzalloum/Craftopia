import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/JobsPage.css';

/**
 * JobsPage - Displays incoming jobs for artisans
 * Fetches and displays reservations from /reservations/incoming-jobs
 */
const JobsPage = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingJobId, setProcessingJobId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncomingJobs();
  }, []);

  const fetchIncomingJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest('/reservations/incoming-jobs', {
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
      pending: 'status-badge status-pending',
      confirmed: 'status-badge status-confirmed',
      completed: 'status-badge status-completed',
      cancelled: 'status-badge status-cancelled'
    };

    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {status}
      </span>
    );
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
            placeholder="🔍 Search by name, email, phone, or description..."
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
            const customerEmail = (job.customer?.email || '').toLowerCase();
            const customerPhone = (job.customer?.phone_number || '').toLowerCase();
            const description = (job.description || '').toLowerCase();
            
            return customerName.includes(query) ||
                   customerEmail.includes(query) ||
                   customerPhone.includes(query) ||
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
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td className="customer-name">{job.customer?.name || 'N/A'}</td>
                  <td className="customer-email">{job.customer?.email || 'N/A'}</td>
                  <td className="customer-phone">{job.customer?.phone_number || 'N/A'}</td>
                  <td className="job-description">{job.description || 'No description'}</td>
                  <td className="job-date">{formatDate(job.start_date)}</td>
                  <td className="job-status">{getStatusBadge(job.status)}</td>
                  <td className="job-price">${job.total_price?.toFixed(2) || '0.00'}</td>
                  <td className="job-created">{formatDate(job.createdAt)}</td>
                  <td className="job-actions">
                    {job.status === 'New' ? (
                      <div className="action-buttons">
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
    </div>
  );
};

export default JobsPage;
