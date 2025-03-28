import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({
    title: '',
    description: '',
    company_id: '',
    location: '',
    type: '',
    qualifications: '',
    salary_range: '',
    deadline: ''
  });

  useEffect(() => {
    // TODO: Fetch job details
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Update job
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Title</label>
          <input
            type="text"
            value={job.title}
            onChange={(e) => setJob({...job, title: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Description</label>
          <textarea
            value={job.description}
            onChange={(e) => setJob({...job, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Location</label>
          <input
            type="text"
            value={job.location}
            onChange={(e) => setJob({...job, location: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Type</label>
          <input
            type="text"
            value={job.type}
            onChange={(e) => setJob({...job, type: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Salary Range</label>
          <input
            type="text"
            value={job.salary_range}
            onChange={(e) => setJob({...job, salary_range: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Deadline</label>
          <input
            type="date"
            value={job.deadline}
            onChange={(e) => setJob({...job, deadline: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default JobDetails; 