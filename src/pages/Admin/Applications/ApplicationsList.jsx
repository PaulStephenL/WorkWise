import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatuses, setUpdatingStatuses] = useState({});
  const [error, setError] = useState(null);

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // TODO: Fetch applications from API
  }, []);

  const handleStatusChange = (applicationId, newStatus) => {
    // TODO: Update application status
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3">Job Title</th>
            <th className="px-6 py-3">Applicant</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Documents</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(application => (
            <tr key={application.id}>
              <td className="px-6 py-4">{application.job_id}</td>
              <td className="px-6 py-4">{application.user_id}</td>
              <td className="px-6 py-4">
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(application.id, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td className="px-6 py-4">
                <a href={application.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>
                {application.cover_letter && (
                  <a href={application.cover_letter} target="_blank" rel="noopener noreferrer" className="ml-2">Cover Letter</a>
                )}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-500">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsList; 