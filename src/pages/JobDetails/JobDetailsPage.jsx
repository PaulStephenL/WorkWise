import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    fetchUserAndRole();
  }, [id]);

  useEffect(() => {
    // Check application only after we have user info
    if (user && id) {
      checkApplication();
    }
  }, [user, id]);

  async function fetchUserAndRole() {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        return;
      }
      
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user role from profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user role:', profileError);
        } else if (profileData) {
          setUserRole(profileData.role || 'user');
        }
      }
    } catch (error) {
      console.error('Error fetching user and role:', error);
    }
  }

  async function fetchJob() {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkApplication() {
    try {
      if (!user || !id) return;

      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setHasApplied(!!data);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  }

  async function handleApply() {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Prevent admin users from applying
      if (userRole === 'admin') {
        setError("Admin users cannot apply for jobs");
        return;
      }

      setApplying(true);
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: id,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;
      setHasApplied(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffdde2]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8 text-white">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <span className="flex items-center">
                <Briefcase className="h-5 w-5 mr-1" />
                {job.company?.name}
              </span>
              <span className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {job.salary_range && (
            <div className="flex items-center text-[#798478] font-semibold">
              <DollarSign className="h-5 w-5 mr-1" />
              {job.salary_range}
            </div>
          )}
        </div>

        <div className="prose max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <p className="whitespace-pre-wrap">{job.description}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Qualifications</h2>
          <ul className="space-y-2">
            {job.qualifications.map((qualification, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-1" />
                <span>{qualification}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="text-center">
          {hasApplied ? (
            <div className="inline-block px-6 py-3 bg-green-100 text-green-800 rounded-md font-medium">
              <CheckCircle className="inline-block h-5 w-5 mr-2" />
              You have already applied for this job
            </div>
          ) : userRole === 'admin' ? (
            <div className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 text-center">
              Admin users cannot apply for jobs
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#101d42] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101d42] disabled:opacity-50"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetailsPage; 