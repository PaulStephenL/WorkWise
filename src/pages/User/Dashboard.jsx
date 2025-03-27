'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/application-card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Add a simple date formatting function
function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export default function UserDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current user
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          setError('You need to be logged in to view this page');
          navigate('/login');
          return;
        }
        
        if (!data.user) {
          console.error('No user found');
          setError('You need to be logged in to view this page');
          navigate('/login');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Error in getUser:', error);
        setError('Failed to authenticate user');
        navigate('/login');
      }
    }
    
    getUser();
  }, [navigate]);

  // Create a function to fetch applications so we can reuse it with the refresh button
  async function fetchApplications() {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all applications for the current user with job and company details
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          cover_letter,
          resume_url,
          created_at,
          jobs (
            id,
            title,
            description,
            location,
            type,
            salary_range,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewing':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <ApplicationsSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <button 
          onClick={fetchApplications}
          disabled={loading}
          className="px-4 py-2 bg-[#101d42] text-white rounded hover:bg-opacity-90 transition flex items-center"
        >
          {loading ? (
            <span>Refreshing...</span>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">No applications yet</h3>
          <p className="text-gray-500 mt-2">
            You haven't applied to any jobs yet. Browse available positions and submit your application!
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => window.location.href = '/jobs'}
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <ApplicationCard 
              key={application.id} 
              application={application} 
              statusColor={getStatusColor(application.status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ application, statusColor }) {
  // Check if job data exists and has the expected format
  if (!application || !application.jobs) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>Application data is incomplete</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const job = application.jobs;
  const company = job.companies || { name: 'Unknown Company', logo_url: null };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name} 
                className="w-10 h-10 object-cover rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold line-clamp-1">{job.title || 'Untitled Position'}</h3>
              <p className="text-sm text-gray-500">{company.name}</p>
            </div>
          </div>
          <Badge className={`${statusColor} capitalize`}>
            {application.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location || 'Remote'}
          </div>
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {job.type || 'Full-time'}
          </div>
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Applied {formatTimeAgo(application.created_at)}
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <a href={`/jobs/${job.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Details
          </a>
          {application.status === 'pending' && (
            <button className="text-sm text-red-600 hover:text-red-800 font-medium">
              Withdraw
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}