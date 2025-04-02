import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Save, Trash } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  
  // Function to get default deadline date (30 days from now)
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30); // Set default deadline to 30 days from now
    return tomorrow.toISOString().split('T')[0];
  }
  
  const [job, setJob] = useState({
    title: '',
    description: '',
    company_id: '',
    location: '',
    type: '',
    qualifications: '',
    salary_range: '',
    deadline: getTomorrowDate() // Initialize with default deadline
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCompanies();
    if (id !== 'new') {
      fetchJobDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }

  // Function to handle qualifications as an array
  function formatQualificationsToArray(qualificationsString) {
    if (!qualificationsString) return [];
    // Split by new lines or commas, filter empty items, and trim whitespace
    return qualificationsString
      .split(/[\n,]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  // Function to handle converting array to string for the textarea
  function formatQualificationsToString(qualificationsArray) {
    if (!qualificationsArray || !Array.isArray(qualificationsArray)) return '';
    return qualificationsArray.join('\n');
  }

  async function fetchJobDetails() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the date for the date input (YYYY-MM-DD)
        if (data.deadline) {
          data.deadline = new Date(data.deadline).toISOString().split('T')[0];
        }
        
        // Convert qualifications array to string for textarea
        if (data.qualifications && Array.isArray(data.qualifications)) {
          data.qualifications = formatQualificationsToString(data.qualifications);
        }
        
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    
    try {
      // Create a job object with only the fields that exist in the database
      const jobData = {
        title: job.title,
        description: job.description,
        company_id: job.company_id,
        location: job.location,
        type: job.type,
        // Convert qualifications string to array
        qualifications: formatQualificationsToArray(job.qualifications),
        salary_range: job.salary_range || '',
        deadline: job.deadline // Required field
      };
      
      // Add created_at for new jobs only if we're creating a new job
      if (id === 'new') {
        jobData.created_at = new Date().toISOString();
      }

      if (id === 'new') {
        // Create new job
        await supabase
          .from('jobs')
          .insert([jobData]);
        
        setSuccess('Job created successfully!');
        // Navigate back to jobs list
        setTimeout(() => {
          navigate('/admin/jobs');
        }, 1500);
      } else {
        // Update existing job
        await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', id);
        
        setSuccess('Job updated successfully!');
        // Navigate back to jobs list
        setTimeout(() => {
          navigate('/admin/jobs');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSaving(false);
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#101d42]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{id === 'new' ? 'Create Job' : 'Edit Job'}</h1>
        </div>
        
        {id !== 'new' && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </button>
        )}
      </div>
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={job.title}
              onChange={(e) => setJob({...job, title: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <select
              required
              value={job.company_id}
              onChange={(e) => setJob({...job, company_id: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={6}
              value={job.description}
              onChange={(e) => setJob({...job, description: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              required
              value={job.location}
              onChange={(e) => setJob({...job, location: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select
              required
              value={job.type}
              onChange={(e) => setJob({...job, type: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            >
              <option value="">Select type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <input
              type="text"
              value={job.salary_range || ''}
              onChange={(e) => setJob({...job, salary_range: e.target.value})}
              placeholder="e.g. $50,000 - $70,000"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
            <input
              type="date"
              value={job.deadline || getTomorrowDate()}
              onChange={(e) => setJob({...job, deadline: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Required field - applications must be submitted before this date.
            </p>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
            <textarea
              rows={4}
              value={job.qualifications || ''}
              onChange={(e) => setJob({...job, qualifications: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#101d42]"
              placeholder="Enter each qualification on a new line or separate with commas"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Enter one qualification per line (or separate with commas). These will be stored as a list.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-4 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#101d42] text-white px-6 py-2 rounded hover:bg-opacity-90 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobDetails; 