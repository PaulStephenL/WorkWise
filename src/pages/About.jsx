import React from 'react';
import { Users, Target, Briefcase, Award } from 'lucide-react';

function About() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-[#101d42] rounded-lg p-8 mb-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">About WorkWise</h1>
        <p className="text-lg">
          Connecting talented professionals with their dream careers since 2025
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h2>
            <p className="text-gray-600">
              To revolutionize the way people find and secure their dream jobs by providing
              a seamless, transparent, and efficient job search platform that connects the
              right talent with the right opportunities.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h2>
            <p className="text-gray-600">
              To become the world's most trusted and innovative job portal, empowering
              millions of professionals to build meaningful careers and helping companies
              find exceptional talent.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Users className="h-12 w-12 text-[#101d42] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
          <p className="text-gray-600">
            Smart algorithms to match candidates with their perfect roles
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Target className="h-12 w-12 text-[#101d42] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Targeted Search</h3>
          <p className="text-gray-600">
            Advanced filters to find exactly what you're looking for
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Briefcase className="h-12 w-12 text-[#101d42] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Quality Jobs</h3>
          <p className="text-gray-600">
            Verified employers and high-quality job listings
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Award className="h-12 w-12 text-[#101d42] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
          <p className="text-gray-600">
            Resources and tools for professional development
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              role: 'CEO & Founder',
              image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            },
            {
              name: 'Michael Chen',
              role: 'Head of Technology',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            },
            {
              name: 'Emily Rodriguez',
              role: 'Head of Operations',
              image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
            },
          ].map((member) => (
            <div key={member.name} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-[#798478]">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;