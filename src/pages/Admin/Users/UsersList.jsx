import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // TODO: Fetch users from API
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{user.role}</td>
              <td className="px-6 py-4">
                <Link to={`/admin/users/${user.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList; 