import React from 'react';
import JobCard from './JobCard';

function JobList({ jobs, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffdde2] mx-auto"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-700">
        <p>No jobs found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default JobList; 