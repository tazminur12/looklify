'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleManagement() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff',
    isActive: true
  });
  const [creating, setCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const roles = [
    { 
      value: 'Super Admin', 
      label: 'Super Admin', 
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500',
      icon: '👑',
      description: 'Full system access'
    },
    { 
      value: 'Admin', 
      label: 'Admin', 
      color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500',
      icon: '⚡',
      description: 'Manage users and content'
    },
    { 
      value: 'Staff', 
      label: 'Staff', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500',
      icon: '👨‍💼',
      description: 'Manage products and orders'
    },
    { 
      value: 'Support', 
      label: 'Support', 
      color: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500',
      icon: '🛠️',
      description: 'Customer support'
    },
    { 
      value: 'User', 
      label: 'User', 
      color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-500',
      icon: '👤',
      description: 'Limited access'
    },
  ];

  // Check if user has permission to access role management
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access Role Management.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError(null);
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));

      setEditingUser(null);
      setNewRole('');
      setShowRoleModal(false);
      setUserToUpdate(null);
      setSuccess(`Role updated successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const openRoleModal = (userData) => {
    setUserToUpdate(userData);
    setNewRole(userData.role);
    setShowRoleModal(true);
  };

  const handleBulkRoleChange = async (role) => {
    try {
      setError(null);
      const promises = selectedUsers.map(userId => 
        fetch(`/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        })
      );

      const responses = await Promise.all(promises);
      const failed = responses.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} users failed to update`);
      }

      // Update local state
      setUsers(users.map(user => 
        selectedUsers.includes(user._id) ? { ...user, role } : user
      ));

      setSelectedUsers([]);
      setShowBulkActions(false);
      setSuccess(`Successfully updated ${selectedUsers.length} users!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const openDeleteModal = (userData) => {
    setUserToDelete(userData);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/users/${userToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Remove user from local state
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setSelectedUsers(selectedUsers.filter(id => id !== userToDelete._id));

      setShowDeleteModal(false);
      setUserToDelete(null);
      setSuccess(`User "${userToDelete.name}" deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setDeleting(true);
      setError(null);

      const promises = selectedUsers.map(userId => 
        fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        })
      );

      const responses = await Promise.all(promises);
      const failed = responses.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} users failed to delete`);
      }

      // Remove deleted users from local state
      setUsers(users.filter(user => !selectedUsers.includes(user._id)));
      const deletedCount = selectedUsers.length;
      setSelectedUsers([]);
      setShowBulkActions(false);
      setSuccess(`Successfully deleted ${deletedCount} user(s)!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user._id));
  };

  const filteredUsers = users.filter(user => {
    // Exclude Customer role from display
    if (user.role === 'Customer') return false;
    
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl shadow-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Role Management
                </h1>
                <p className="text-purple-100 text-sm">
                  Manage user roles and permissions across the platform
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold">{filteredUsers.length}</div>
              <div className="text-purple-100 text-xs">Staff Users</div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span>➕</span>
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🔍 Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>
          </div>
          
          {/* Role Filter */}
          <div className="lg:w-56">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              👥 Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-40">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📊 Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">🟢 Active</option>
              <option value="inactive">🔴 Inactive</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-purple-500 hover:text-purple-700 text-xs font-medium"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-purple-600 dark:text-purple-400">Bulk actions:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkRoleChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-xs"
                >
                  <option value="">Assign Role</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                >
                  <span>🗑️</span>
                  {deleting ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300 text-xs">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-800 dark:text-green-200">
                Success
              </h3>
              <p className="text-green-700 dark:text-green-300 text-xs">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={selectAllUsers}
                    className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  👤 User Profile
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  📧 Email Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  👑 Current Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  📊 Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  🕒 Last Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {user.isActive ? (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        ) : (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg shadow-md ${getRoleColor(user.role)}`}>
                      <span className="text-sm">{roles.find(r => r.value === user.role)?.icon}</span>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg shadow-md ${
                      user.isActive 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    }`}>
                      <span className="text-sm">{user.isActive ? '🟢' : '🔴'}</span>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-900 dark:text-white font-medium">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString()}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-2 py-1 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                      >
                        <span>⚡</span>
                        Change
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        disabled={user._id === currentUser?._id || user.role === 'Super Admin'}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 py-1 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                        title={
                          user.role === 'Super Admin' 
                            ? 'Cannot delete Super Admin' 
                            : user._id === currentUser?._id 
                            ? 'Cannot delete yourself' 
                            : 'Delete User'
                        }
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Try adjusting your search or filter criteria to find users.
            </p>
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">📋</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Role Hierarchy & Permissions
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role, index) => (
            <div key={role.value} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{role.icon}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg shadow-md ${role.color}`}>
                  {role.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {role.description}
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                Level {6 - index} • Priority Access
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🔐</span>
            Detailed Permissions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="space-y-1">
              <p><strong className="text-red-600 dark:text-red-400">Super Admin:</strong> Full system access, can manage all users and settings</p>
              <p><strong className="text-orange-600 dark:text-orange-400">Admin:</strong> Can manage users, products, orders, and most system functions</p>
              <p><strong className="text-blue-600 dark:text-blue-400">Staff:</strong> Can manage products, orders, and customer support</p>
            </div>
            <div className="space-y-1">
              <p><strong className="text-green-600 dark:text-green-400">Support:</strong> Can handle customer support and basic order management</p>
              <p><strong className="text-gray-600 dark:text-gray-400">User:</strong> Limited access with basic functionality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && userToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Change User Role
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Update role for {userToUpdate.name}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Role
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm">{roles.find(r => r.value === userToUpdate.role)?.icon}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg ${getRoleColor(userToUpdate.role)}`}>
                    {userToUpdate.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {newRole !== userToUpdate.role && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <span className="text-sm">ℹ️</span>
                    <span className="font-semibold text-sm">New Role Preview:</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm">{roles.find(r => r.value === newRole)?.icon}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg ${getRoleColor(newRole)}`}>
                      {newRole}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {roles.find(r => r.value === newRole)?.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleRoleChange(userToUpdate._id, newRole)}
                disabled={newRole === userToUpdate.role}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-1">
                  <span>✅</span>
                  Update Role
                </span>
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setUserToUpdate(null);
                  setNewRole('');
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">➕</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Create New Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Create a new staff/admin account
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newUserData.isActive}
                  onChange={(e) => setNewUserData({...newUserData, isActive: e.target.checked})}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Account Active
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={async () => {
                  if (!newUserData.name || !newUserData.email || !newUserData.password) {
                    setError('Please fill all required fields');
                    setTimeout(() => setError(null), 3000);
                    return;
                  }

                  setCreating(true);
                  setError(null);

                  try {
                    const response = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: newUserData.name,
                        email: newUserData.email,
                        phone: newUserData.phone || '',
                        password: newUserData.password,
                        role: newUserData.role,
                        isActive: newUserData.isActive
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to create account');
                    }

                    setSuccess('Account created successfully!');
                    setShowCreateModal(false);
                    setNewUserData({
                      name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'Staff',
                      isActive: true
                    });
                    fetchUsers();
                    setTimeout(() => setSuccess(null), 3000);
                  } catch (err) {
                    setError(err.message);
                    setTimeout(() => setError(null), 5000);
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-1">
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Create Account</span>
                    </>
                  )}
                </span>
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUserData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'Staff',
                    isActive: true
                  });
                }}
                disabled={creating}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete User Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {userToDelete.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {userToDelete.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {userToDelete.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg ${getRoleColor(userToDelete.role)}`}>
                      <span className="text-sm">{roles.find(r => r.value === userToDelete.role)?.icon}</span>
                      {userToDelete.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Deleting this user will permanently remove their account and all associated data. This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete User</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
