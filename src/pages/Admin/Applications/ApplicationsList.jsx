import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatuses, setUpdatingStatuses] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching applications from Supabase...');
      
      // First, let's check if we can access the applications table at all
      const { count, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking applications count:', countError);
        setError(`Database access error: ${countError.message}`);
        toast.error(`Database access error: ${countError.message}`);
        return;
      }
      
      console.log(`Found ${count} applications in the database`);
      
      // Now fetch the full application data with a simpler query first
      const { data, error } = await supabase
        .from('applications')
        .select('id, status, created_at, user_id, job_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        setError(`Error fetching applications: ${error.message}`);
        toast.error(`Failed to load applications: ${error.message}`);
        throw error;
      }
      
      console.log('Applications data:', data);
      
      if (!data || data.length === 0) {
        console.log('No applications found in the response');
        toast.error('No applications found in the database');
        setApplications([]);
        return;
      }
      
      console.log(`Successfully loaded ${data.length} applications`);
      
      // Now fetch the related data for each application
      const enrichedApplications = await Promise.all(
        data.map(async (application) => {
          // Fetch job details
          let jobDetails = null;
          if (application.job_id) {
            const { data: jobData, error: jobError } = await supabase
              .from('jobs')
              .select('id, title, company_id')
              .eq('id', application.job_id)
              .single();
            
            if (!jobError && jobData) {
              jobDetails = jobData;
              
              // Fetch company details if we have a company_id
              if (jobData.company_id) {
                const { data: companyData, error: companyError } = await supabase
                  .from('companies')
                  .select('id, name')
                  .eq('id', jobData.company_id)
                  .single();
                
                if (!companyError && companyData) {
                  jobDetails.companies = companyData;
                }
              }
            }
          }
          
          // Fetch user profile details
          let profileDetails = null;
          if (application.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')  // Select all fields to ensure we get everything we need
              .eq('id', application.user_id)
              .single();
            
            if (!profileError && profileData) {
              console.log('Profile data loaded:', profileData);
              profileDetails = profileData;
            } else {
              console.error('Error loading profile:', profileError);
            }
          }
          
          // Return enriched application data
          return {
            ...application,
            jobs: jobDetails,
            profiles: profileDetails
          };
        })
      );
      
      setApplications(enrichedApplications);
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    if (!applicationId) {
      toast.error('Application ID is missing');
      return;
    }

    try {
      setUpdatingStatuses(prev => ({ ...prev, [applicationId]: true }));
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      
      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatuses(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusColors[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <button 
          onClick={() => {
            toast.success('Refreshing applications...');
            fetchApplications();
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error loading applications</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-500">No applications found.</p>
          <div className="mt-4">
            <button 
              onClick={fetchApplications}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map(application => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {application.jobs?.title || 'Unknown Job'}
                    {application.jobs?.companies && (
                      <div className="text-sm text-gray-500">
                        {application.jobs.companies.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {application.profiles?.name || 'Unknown User'}
                    {application.profiles?.email && (
                      <div className="text-sm text-gray-500">
                        {application.profiles.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <span className={getStatusBadgeClass(application.status)}>
                        {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Unknown'}
                      </span>
                      <select
                        value={application.status || ''}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          handleStatusChange(application.id, newStatus);
                        }}
                        className={`mt-1 p-2 text-sm border rounded w-full ${updatingStatuses[application.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={updatingStatuses[application.id]}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {updatingStatuses[application.id] && (
                        <div className="mt-1 text-xs text-gray-500">Updating...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/admin/applications/${application.id}`}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList; 