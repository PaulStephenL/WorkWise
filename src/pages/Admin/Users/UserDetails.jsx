import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    // TODO: Fetch user details
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Update user
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({...user, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({...user, email: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Role</label>
          <select
            value={user.role}
            onChange={(e) => setUser({...user, role: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserDetails; 