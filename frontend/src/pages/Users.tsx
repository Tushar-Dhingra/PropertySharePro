import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import api from '../lib/api';
import type { User } from '../types';
import { Plus, Edit, Trash2, Key, ToggleLeft, ToggleRight } from 'lucide-react';

export const Users: React.FC = () => {
    const queryClient = useQueryClient();

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
    });

    const [newPassword, setNewPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        },
    });

    // Create user mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/users', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsAddModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            setErrors({ submit: error.response?.data?.message || 'Failed to create user' });
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`/users/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsEditModalOpen(false);
            setSelectedUser(null);
            resetForm();
        },
        onError: (error: any) => {
            setErrors({ submit: error.response?.data?.message || 'Failed to update user' });
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        },
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.patch(`/users/${id}/toggle-status`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Reset password mutation
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ id, password }: { id: string; password: string }) => {
            const response = await api.post(`/users/${id}/reset-password`, { newPassword: password });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsResetPasswordModalOpen(false);
            setSelectedUser(null);
            setNewPassword('');
        },
        onError: (error: any) => {
            setErrors({ password: error.response?.data?.message || 'Failed to reset password' });
        },
    });

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'EMPLOYEE',
        });
        setErrors({});
    };

    const handleAdd = () => {
        setIsAddModalOpen(true);
        resetForm();
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPassword = (user: User) => {
        setSelectedUser(user);
        setNewPassword('');
        setErrors({});
        setIsResetPasswordModalOpen(true);
    };

    const handleToggleStatus = (user: User) => {
        toggleStatusMutation.mutate(user._id);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!isEditModalOpen && !formData.password) newErrors.password = 'Password is required';
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (isEditModalOpen && selectedUser) {
            const updateData: any = {
                username: formData.username,
                email: formData.email,
                role: formData.role,
            };
            if (formData.password) {
                updateData.password = formData.password;
            }
            updateMutation.mutate({ id: selectedUser._id, data: updateData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleResetPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            setErrors({ password: 'Password must be at least 6 characters' });
            return;
        }

        if (selectedUser) {
            resetPasswordMutation.mutate({ id: selectedUser._id, password: newPassword });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
                        <p className="text-slate-600 mt-1">Manage employee accounts and permissions</p>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </div>

                {/* Users Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600">Loading employees...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Last Login
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {usersData?.data?.map((user: User) => (
                                        <tr key={user._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{user.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN'
                                                        ? 'bg-purple-50 text-purple-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'ACTIVE'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">
                                                    {user.lastLogin
                                                        ? new Date(user.lastLogin).toLocaleDateString()
                                                        : 'Never'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.status === 'ACTIVE' ? (
                                                            <ToggleRight className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                        disabled={user.role === 'ADMIN'}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add/Edit User Modal */}
                <Modal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                        resetForm();
                    }}
                    title={isEditModalOpen ? 'Edit Employee' : 'Add Employee'}
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                placeholder="john.doe"
                                error={errors.username}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="john.doe@propertyshare.com"
                                error={errors.email}
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <Select
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="ADMIN">Admin</option>
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password {!isEditModalOpen && <span className="text-red-500">*</span>}
                                {isEditModalOpen && <span className="text-slate-500 text-xs">(leave blank to keep current)</span>}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                error={errors.password}
                            />
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errors.submit}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEditModalOpen(false);
                                    setSelectedUser(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : isEditModalOpen
                                        ? 'Update'
                                        : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Reset Password Modal */}
                <Modal
                    isOpen={isResetPasswordModalOpen}
                    onClose={() => {
                        setIsResetPasswordModalOpen(false);
                        setSelectedUser(null);
                        setNewPassword('');
                        setErrors({});
                    }}
                    title="Reset Password"
                    size="sm"
                >
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <p className="text-slate-600">
                            Reset password for <strong>{selectedUser?.username}</strong>
                        </p>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                error={errors.password}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsResetPasswordModalOpen(false);
                                    setSelectedUser(null);
                                    setNewPassword('');
                                    setErrors({});
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedUser(null);
                    }}
                    title="Delete Employee"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => selectedUser && deleteMutation.mutate(selectedUser._id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};
