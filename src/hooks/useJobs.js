import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching jobs...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          type,
          salary_range,
          deadline,
          created_at,
          company_id,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
        throw error;
      }

      console.log('Fetched jobs:', data);
      
      if (!data || data.length === 0) {
        console.log('No jobs found in the database');
        setJobs([]);
      } else {
        // Transform the data to match the expected format
        const transformedJobs = data.map(job => ({
          ...job,
          company: job.companies
        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error in fetchJobs function:', error);
      setError(error.message || 'An error occurred while fetching jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobById = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching job with ID: ${jobId}`);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          type,
          salary_range,
          deadline,
          created_at,
          company_id,
          requirements,
          companies (
            id,
            name,
            logo_url,
            description
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job details:', error);
        setError(error.message);
        throw error;
      }

      if (!data) {
        console.log('No job found with this ID');
        setError('Job not found');
        return null;
      }

      // Transform the data to match the expected format
      const transformedJob = {
        ...data,
        company: data.companies
      };
      
      return transformedJob;
    } catch (error) {
      console.error('Error in fetchJobById function:', error);
      setError(error.message || 'An error occurred while fetching job details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToJob = useCallback(async (jobId, userId, coverLetter) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          cover_letter: coverLetter,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Error applying to job:', error);
        setError(error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in applyToJob function:', error);
      setError(error.message || 'An error occurred while applying to the job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    fetchJobById,
    applyToJob
  };
} 