import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, companyName) {
    if (!confirm(`Are you sure you want to delete ${companyName}?`)) return;
    
    try {
      setLoading(true);
      
      // First check if the company has any associated jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', id);
        
      if (jobsError) throw jobsError;
      
      if (jobs && jobs.length > 0) {
        toast.error(`Cannot delete company that has ${jobs.length} job listings. Remove the job listings first.`);
        return;
      }
      
      // Now delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Company deleted successfully');
      // Refresh the company list
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error(error.message || 'Error deleting company');
    } finally {
      setLoading(false);
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffdde2]"></div>
      </div>
    );
  }

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