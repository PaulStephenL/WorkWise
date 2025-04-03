import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import SearchSection from './SearchSection';
import JobList from './JobList';
import StatusMessage from '../../components/ui/StatusMessage';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { jobs, loading, error, fetchJobs } = useJobs();

  useEffect(() => {
    fetchJobs();
  }, [user, fetchJobs]); // Refetch when user changes

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <SearchSection 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      {error && (
        <div className="mb-6">
          <StatusMessage 
            type="error" 
            message={`Error loading jobs: ${error}`} 
          />
        </div>
      )}
      
      <JobList 
        jobs={filteredJobs} 
        loading={loading} 
      />
    </div>
  );
}

export default HomePage; 