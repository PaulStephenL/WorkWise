'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the current user
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    
    getUser();
  }, []);

  useEffect(() => {
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

    fetchApplications();
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
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      
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
  const job = application.jobs;
  const company = job.companies;
  
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
              <h3 className="font-semibold line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500">{company.name}</p>
            </div>
          </div>
          <Badge className={`${statusColor} capitalize`}>
            {application.status}
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
            {job.location}
          </div>
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {job.type}
          </div>
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Applied {formatDistanceToNow(new Date(application.created_at))} ago
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Details
          </button>
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