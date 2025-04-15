import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState({
    name: '',
    description: '',
    location: '',
    logo_url: ''
  });

  useEffect(() => {
    // TODO: Fetch company details
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Update company
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Company</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Name</label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => setCompany({...company, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Description</label>
          <textarea
            value={company.description}
            onChange={(e) => setCompany({...company, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Location</label>
          <input
            type="text"
            value={company.location}
            onChange={(e) => setCompany({...company, location: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Logo URL</label>
          <input
            type="text"
            value={company.logo_url}
            onChange={(e) => setCompany({...company, logo_url: e.target.value})}
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

export default CompanyDetails; 