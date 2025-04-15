import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // TODO: Fetch companies from API
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Companies</h1>
      <Link to="/admin/companies/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Add Company
      </Link>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td className="px-6 py-4">{company.name}</td>
              <td className="px-6 py-4">{company.location}</td>
              <td className="px-6 py-4">
                <Link to={`/admin/companies/${company.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompaniesList; 