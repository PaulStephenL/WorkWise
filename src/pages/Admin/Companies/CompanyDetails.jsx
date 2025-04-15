import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    description: '',
    location: '',
    logo_url: ''
  });
  const [errors, setErrors] = useState({});
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setCompany(data);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!company.name) newErrors.name = 'Company name is required';
    if (!company.location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let result;
      
      if (isEditMode) {
        // Update existing company
        result = await supabase
          .from('companies')
          .update({
            name: company.name,
            description: company.description,
            location: company.location,
            logo_url: company.logo_url
          })
          .eq('id', id);
          
        if (result.error) throw result.error;
        toast.success('Company updated successfully');
      } else {
        // Create new company
        result = await supabase
          .from('companies')
          .insert([{
            name: company.name,
            description: company.description,
            location: company.location,
            logo_url: company.logo_url
          }]);
          
        if (result.error) throw result.error;
        toast.success('Company created successfully');
      }
      
      // Navigate back to companies list
      navigate('/admin/companies');
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error(error.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit' : 'Add'} Company</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => setCompany({...company, name: e.target.value})}
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={company.description}
            onChange={(e) => setCompany({...company, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
          <input
            type="text"
            value={company.location}
            onChange={(e) => setCompany({...company, location: e.target.value})}
            className={`w-full p-2 border rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="text"
            value={company.logo_url}
            onChange={(e) => setCompany({...company, logo_url: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="bg-[#101d42] text-white px-4 py-2 rounded hover:bg-opacity-90"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Company'}
          </button>
          <button 
            type="button" 
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            onClick={() => navigate('/admin/companies')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyDetails; 