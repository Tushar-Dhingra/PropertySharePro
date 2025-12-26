/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import type { Property } from '../types';
import { Search, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export const Properties: React.FC = () => {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    // Search and filter state
    const [search, setSearch] = useState('');
    const [areaZone, setAreaZone] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [uploadedBy, setUploadedBy] = useState('');
    const [minRent, setMinRent] = useState('');
    const [maxRent, setMaxRent] = useState('');
    const [page, setPage] = useState(1);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const [sort, setSort] = useState('');

    // Fetch properties with filters
    const { data: propertiesData, isLoading } = useQuery({
        queryKey: ['properties', search, areaZone, propertyType, uploadedBy, minRent, maxRent, page, sort],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (areaZone) params.append('areaZone', areaZone);
            if (propertyType) params.append('type', propertyType);
            if (uploadedBy) params.append('uploadedBy', uploadedBy);
            if (minRent) params.append('minRent', minRent);
            if (maxRent) params.append('maxRent', maxRent);
            if (sort) params.append('sort', sort);
            params.append('page', page.toString());

            const response = await api.get(`/properties?${params.toString()}`);
            return response.data;
        },
    });

    // Fetch users for filter (Admin only)
    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        },
        enabled: isAdmin,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/properties/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            setIsDeleteModalOpen(false);
            setSelectedProperty(null);
        },
    });

    const handleDelete = () => {
        if (selectedProperty) {
            deleteMutation.mutate(selectedProperty._id);
        }
    };

    const handleCopyLink = (id: string) => {
        const link = `${window.location.origin}/properties/${id}`;
        navigator.clipboard.writeText(link);
        // TODO: Show toast notification
    };

    const clearFilters = () => {
        setSearch('');
        setAreaZone('');
        setPropertyType('');
        setUploadedBy('');
        setMinRent('');
        setMaxRent('');
        setPage(1);
        setSort('');
    };

    const handleSort = (field: string) => {
        if (sort.startsWith(field)) {
            if (sort.endsWith(':asc')) {
                setSort(`${field}:desc`);
            } else {
                setSort('');
            }
        } else {
            setSort(`${field}:asc`);
        }
    };

    const getSortIcon = (field: string) => {
        if (!sort.startsWith(field)) return '↑↓';
        return sort.endsWith(':asc') ? '↑' : '↓';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
                        <p className="text-slate-600 mt-1">Manage your property listings</p>
                    </div>
                    <Button onClick={() => window.location.href = '/upload'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by property name or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={areaZone} onChange={(e) => setAreaZone(e.target.value)}>
                            <option value="">All Zones</option>
                            <option value="North Zone">North Zone</option>
                            <option value="South Zone">South Zone</option>
                            <option value="East Zone">East Zone</option>
                            <option value="West Zone">West Zone</option>
                            <option value="Central Zone">Central Zone</option>
                            <option value="Suburban">Suburban</option>
                        </Select>

                        <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Office">Office</option>
                            <option value="Shop">Shop</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Land">Land</option>
                            <option value="PG">PG</option>
                            <option value="Hostel">Hostel</option>
                        </Select>

                        {isAdmin && (
                            <Select value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)}>
                                <option value="">All Employees</option>
                                {usersData?.data?.map((user: any) => (
                                    <option key={user._id} value={user._id}>
                                        {user.username}
                                    </option>
                                ))}
                            </Select>
                        )}

                        <Input
                            type="number"
                            placeholder="Min Rent"
                            value={minRent}
                            onChange={(e) => setMinRent(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Max Rent"
                            value={maxRent}
                            onChange={(e) => setMaxRent(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Properties Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                            <p className="mt-4 text-slate-600">Loading properties...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Image
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                                                onClick={() => handleSort('propertyName')}
                                            >
                                                Property {getSortIcon('propertyName')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                                                onClick={() => handleSort('location')}
                                            >
                                                Location {getSortIcon('location')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                                                onClick={() => handleSort('rentAmount')}
                                            >
                                                Rent {getSortIcon('rentAmount')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                                                onClick={() => handleSort('type')}
                                            >
                                                Type {getSortIcon('type')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                                                onClick={() => handleSort('uploadedAt')}
                                            >
                                                Upload Date {getSortIcon('uploadedAt')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {propertiesData?.data?.map((property: Property) => (
                                            <tr key={property._id} className="hover:bg-slate-50">
                                                <td className="px-3.5 py-4 whitespace-nowrap">
                                                    <img
                                                        src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
                                                        alt="Property"
                                                        className="w-16 h-12 object-cover rounded-lg"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">{property.propertyName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-900 max-w-xs truncate">{property.location}</div>
                                                    <div className="text-xs text-slate-500">{property.areaZone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">₹{property.rentAmount.toLocaleString()}</div>
                                                    <div className="text-xs text-slate-500">per month</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                                                        {property.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        {new Date(property.uploadedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        {typeof property.uploadedBy === 'object' ? property.uploadedBy.username : 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleCopyLink(property._id)}
                                                            className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                            title="Copy Link"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => window.location.href = `/properties/${property._id}/edit`}
                                                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProperty(property);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
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

                        {/* Pagination */}
                        {propertiesData?.pages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-slate-600">
                                    Showing {propertiesData.count} of {propertiesData.total} properties
                                </p>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= propertiesData.pages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Property Stats at the bottom */}
                <div className="mt-8">
                    <PropertyStats />
                </div>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Delete Property"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            Are you sure you want to delete <strong>{selectedProperty?.propertyName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
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

const PropertyStats: React.FC = () => {
    const { data: stats } = useQuery({
        queryKey: ['property-stats'],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: any }>('/properties/stats');
            return response.data.data;
        },
    });

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-slate-900">{stats.totalProperties}</p>
                    <p className="text-sm text-slate-500 mt-1">Total Properties</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.residentialCount}</p>
                    <p className="text-sm text-slate-500 mt-1">Residential</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-orange-600">{stats.commercialCount}</p>
                    <p className="text-sm text-slate-500 mt-1">Commercial</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-primary-600">₹{Math.round(stats.avgRent).toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-1">Avg. Rent</p>
                </CardContent>
            </Card>
        </div>
    );
};
