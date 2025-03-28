import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase, checkAndVerifyAdminRole } from '../../../lib/supabase';
import { Briefcase, Building2, Users, LayoutDashboard, MapPin } from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    checkAdmin();
    fetchStats();
  }, []);

  async function checkAdmin() {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        navigate('/login');
        return;
      }
      
      console.log('AdminDashboard checkAdmin - User:', user?.id);
      
      if (!user) {
        // No authenticated user - redirect to login
        console.error('No authenticated user found');
        navigate('/login');
        return;
      }
      
      console.log('Checking admin role for user:', user.id);
      
      // Use the helper function for consistent admin checking
      const isAdmin = await checkAndVerifyAdminRole(user.id);
      console.log('Admin dashboard - isAdmin check result:', isAdmin);
      
      // If not admin, let's get the current role for debugging
      if (!isAdmin) {
        // Get the role directly one more time for confirmation
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile for confirmation:', profileError);
        } else {
          console.log('Profile data confirmation:', profileData);
          console.log('Role from confirmation:', profileData?.role);
          
          // Let's try a direct approach to fix the role
          if (profileData && profileData.role && profileData.role.toString().trim().toLowerCase() === 'admin') {
            // The role is admin when trimmed but not being detected properly
            console.log('Role is admin when trimmed. Attempting direct fix...');
            const { error: fixError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
            
            if (fixError) {
              console.error('Error fixing role:', fixError);
            } else {
              console.log('Successfully fixed role. Trying admin check again...');
              // Try the check one more time
              const isAdminAfterFix = await checkAndVerifyAdminRole(user.id);
              console.log('Admin check after fix:', isAdminAfterFix);
              
              if (isAdminAfterFix) {
                // Success! Continue loading the dashboard
                setLoading(false);
                return;
              }
            }
          }
        }
        
        console.error('User is not an admin, redirecting to home');
        navigate('/');
        return;
      }
      
      // User is admin, continue loading
      setLoading(false);
    } catch (error) {
      console.error('Error in admin check:', error);
      navigate('/');
    }
  }

  async function fetchStats() {
    try {
      const [jobs, companies, applications] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }),
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalJobs: jobs.count || 0,
        totalCompanies: companies.count || 0,
        totalApplications: applications.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffdde2]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-[#101d42] rounded-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 opacity-70" />
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Companies</p>
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
              </div>
              <Building2 className="h-8 w-8 opacity-70" />
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <Users className="h-8 w-8 opacity-70" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <Link
              to="/admin"
              className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-b-2 border-transparent"
            >
              <LayoutDashboard className="h-5 w-5 inline-block mr-2" />
              Overview
            </Link>
            <Link
              to="/admin/jobs"
              className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-b-2 border-transparent"
            >
              <Briefcase className="h-5 w-5 inline-block mr-2" />
              Jobs
            </Link>
            <Link
              to="/admin/companies"
              className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-b-2 border-transparent"
            >
              <Building2 className="h-5 w-5 inline-block mr-2" />
              Companies
            </Link>
            <Link
              to="/admin/applications"
              className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-b-2 border-transparent"
            >
              <Users className="h-5 w-5 inline-block mr-2" />
              Applications
            </Link>
          </nav>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<AdminOverview stats={stats} />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="applications" element={<AdminApplications />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminOverview({ stats }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Welcome to the Admin Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Manage job postings, companies, and applications from this central dashboard.
      </p>
    </div>
  );
}

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Jobs</h2>
        <button className="bg-[#101d42] text-white px-4 py-2 rounded hover:bg-opacity-90">
          Add New Job
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{job.company?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{job.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{job.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Companies</h2>
        <button className="bg-[#101d42] text-white px-4 py-2 rounded hover:bg-opacity-90">
          Add New Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded object-cover mr-4"
                />
              )}
              <h3 className="text-lg font-semibold">{company.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">{company.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {company.location}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
              <button className="text-red-600 hover:text-red-900">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(
            *,
            company:companies(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Applications</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.job?.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {application.job?.company?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                    ${application.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Update Status
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;