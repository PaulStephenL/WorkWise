import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [application, setApplication] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch user's profile to get default values
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('default_cover_letter, default_resume_url')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
        // Pre-fill the cover letter if no existing application
        if (!application) {
          setCoverLetter(profileData.default_cover_letter || '');
        }
      }

      // Fetch job details with company information
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Check if user has already applied
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (applicationError) throw applicationError;
      setApplication(applicationData);
      if (applicationData) {
        setCoverLetter(applicationData.cover_letter || '');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    setError(null);
    setSuccess('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in to apply');

      // If there's a new resume file, upload it first
      let resume_url = null;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `applications/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        resume_url = publicUrl;
      } else if (userProfile?.default_resume_url) {
        // Use default resume if no new file is uploaded
        resume_url = userProfile.default_resume_url;
      }

      // Create or update application
      const applicationData = {
        job_id: id,
        user_id: user.id,
        cover_letter: coverLetter,
        resume_url: resume_url,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      let operation;
      if (application) {
        // If updating an existing application
        operation = supabase
          .from('applications')
          .update({
            cover_letter: coverLetter,
            resume_url: resume_url,
            status: 'pending'
          })
          .eq('id', application.id);
      } else {
        // If creating a new application
        operation = supabase
          .from('applications')
          .insert([applicationData]);
      }

      const { error: applicationError } = await operation;
      if (applicationError) throw applicationError;

      setSuccess('Application submitted successfully!');
      setApplication({ ...applicationData, id: application?.id });
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Failed to submit application');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error || 'Job not found'}
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date(job.deadline) < new Date();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Company Header */}
      <Link
        to={`/companies/${job.companies.id}`}
        className="flex items-center space-x-4 mb-8 hover:bg-gray-50 p-4 rounded-lg transition"
      >
        {job.companies.logo_url ? (
          <img
            src={job.companies.logo_url}
            alt={job.companies.name}
            className="w-16 h-16 object-contain rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xl font-bold text-gray-500">
            {job.companies.name.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{job.companies.name}</h2>
          <p className="text-gray-600">{job.companies.location}</p>
        </div>
      </Link>

      {/* Job Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {job.location}
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {job.type}
          </div>
          {job.salary_range && (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.salary_range}
            </div>
          )}
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.qualifications && job.qualifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Qualifications</h3>
            <ul className="list-disc list-inside space-y-2">
              {job.qualifications.map((qual, index) => (
                <li key={index} className="text-gray-600">{qual}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Application Form */}
        {!isDeadlinePassed ? (
          <form onSubmit={handleApply} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-md">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Why are you a good fit for this position?"
                required
              />
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                Resume
              </label>
              {application?.resume_url && (
                <div className="mb-2">
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                    View Current Resume
                  </a>
                </div>
              )}
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                {application?.resume_url ? 'Upload a new resume or keep the current one' : 'Accepted formats: PDF, DOC, DOCX'}
              </p>
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {applying ? 'Submitting...' : (application ? 'Update Application' : 'Submit Application')}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
            The application deadline for this position has passed.
          </div>
        )}
      </div>
    </div>
  );
} 