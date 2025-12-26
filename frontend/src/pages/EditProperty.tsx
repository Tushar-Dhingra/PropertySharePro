import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import api from '../lib/api';
import { Building2, MapPin, DollarSign, CheckSquare } from 'lucide-react';

export const EditProperty: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        propertyName: '',
        type: '',
        location: '',
        areaZone: '',
        rentAmount: '',
        securityDeposit: '',
        maintenanceCharges: '',
        features: {
            parking: false,
            gym: false,
            security: false,
            swimmingPool: false,
            balcony: false,
            clubhouse: false,
            powerBackup: false,
            lift: false,
            intercom: false,
            gasPipeline: false,
            wifi: false,
            garden: false,
            playground: false,
            cctv: false,
            waterSupply: false,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch property details
    const { data: property, isLoading } = useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            const response = await api.get(`/properties/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });

    // Populate form data when property is loaded
    useEffect(() => {
        if (property) {
            setFormData({
                propertyName: property.propertyName,
                type: property.type,
                location: property.location,
                areaZone: property.areaZone,
                rentAmount: property.rentAmount.toString(),
                securityDeposit: property.securityDeposit.toString(),
                maintenanceCharges: property.maintenanceCharges ? property.maintenanceCharges.toString() : '',
                features: {
                    parking: property.features.parking,
                    gym: property.features.gym,
                    security: property.features.security,
                    swimmingPool: property.features.swimmingPool,
                    balcony: property.features.balcony,
                    clubhouse: property.features.clubhouse,
                    powerBackup: property.features.powerBackup,
                    lift: property.features.lift,
                    intercom: property.features.intercom,
                    gasPipeline: property.features.gasPipeline,
                    wifi: property.features.wifi,
                    garden: property.features.garden,
                    playground: property.features.playground,
                    cctv: property.features.cctv,
                    waterSupply: property.features.waterSupply,
                },
            });
        }
    }, [property]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.put(`/properties/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            navigate('/properties');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update property';
            setErrors({ submit: errorMessage });
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFeatureChange = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature as keyof typeof prev.features],
            },
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.propertyName.trim()) newErrors.propertyName = 'Property name is required';
        if (!formData.type) newErrors.type = 'Property type is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.areaZone) newErrors.areaZone = 'Area zone is required';
        if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) {
            newErrors.rentAmount = 'Valid rent amount is required';
        }
        if (!formData.securityDeposit || parseFloat(formData.securityDeposit) < 0) {
            newErrors.securityDeposit = 'Valid security deposit is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const submitData = {
            ...formData,
            rentAmount: parseFloat(formData.rentAmount),
            securityDeposit: parseFloat(formData.securityDeposit),
            maintenanceCharges: formData.maintenanceCharges ? parseFloat(formData.maintenanceCharges) : 0,
        };

        updateMutation.mutate(submitData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    <p className="mt-4 text-slate-600">Loading property details...</p>
                </div>
            </div>
        );
    }

    const featuresList = [
        { key: 'parking', label: 'Parking' },
        { key: 'gym', label: 'Gym' },
        { key: 'security', label: '24/7 Security' },
        { key: 'swimmingPool', label: 'Swimming Pool' },
        { key: 'balcony', label: 'Balcony' },
        { key: 'clubhouse', label: 'Clubhouse' },
        { key: 'powerBackup', label: 'Power Backup' },
        { key: 'lift', label: 'Lift/Elevator' },
        { key: 'intercom', label: 'Intercom' },
        { key: 'gasPipeline', label: 'Gas Pipeline' },
        { key: 'wifi', label: 'Wi-Fi' },
        { key: 'garden', label: 'Garden' },
        { key: 'playground', label: 'Playground' },
        { key: 'cctv', label: 'CCTV Surveillance' },
        { key: 'waterSupply', label: '24/7 Water Supply' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Edit Property</h1>
                    <p className="text-slate-600 mt-1">Update property details</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="h-5 w-5 mr-2 text-primary-500" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label htmlFor="propertyName" className="block text-sm font-medium text-slate-700 mb-1">
                                    Property Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="propertyName"
                                    name="propertyName"
                                    value={formData.propertyName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Luxury 3BHK Apartment"
                                    error={errors.propertyName}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                                        Property Type <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        error={errors.type}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Office">Office</option>
                                        <option value="Shop">Shop</option>
                                        <option value="Warehouse">Warehouse</option>
                                        <option value="Land">Land</option>
                                        <option value="PG">PG</option>
                                        <option value="Hostel">Hostel</option>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="areaZone" className="block text-sm font-medium text-slate-700 mb-1">
                                        Area Zone <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        id="areaZone"
                                        name="areaZone"
                                        value={formData.areaZone}
                                        onChange={handleInputChange}
                                        error={errors.areaZone}
                                    >
                                        <option value="">Select Zone</option>
                                        <option value="North Zone">North Zone</option>
                                        <option value="South Zone">South Zone</option>
                                        <option value="East Zone">East Zone</option>
                                        <option value="West Zone">West Zone</option>
                                        <option value="Central Zone">Central Zone</option>
                                        <option value="Suburban">Suburban</option>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Full Address <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 123 MG Road, Bangalore, Karnataka 560001"
                                    error={errors.location}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
                                Financial Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700 mb-1">
                                        Monthly Rent (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="rentAmount"
                                        name="rentAmount"
                                        type="number"
                                        value={formData.rentAmount}
                                        onChange={handleInputChange}
                                        placeholder="35000"
                                        error={errors.rentAmount}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="securityDeposit" className="block text-sm font-medium text-slate-700 mb-1">
                                        Security Deposit (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="securityDeposit"
                                        name="securityDeposit"
                                        type="number"
                                        value={formData.securityDeposit}
                                        onChange={handleInputChange}
                                        placeholder="105000"
                                        error={errors.securityDeposit}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="maintenanceCharges" className="block text-sm font-medium text-slate-700 mb-1">
                                        Maintenance (₹)
                                    </label>
                                    <Input
                                        id="maintenanceCharges"
                                        name="maintenanceCharges"
                                        type="number"
                                        value={formData.maintenanceCharges}
                                        onChange={handleInputChange}
                                        placeholder="3500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features & Amenities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckSquare className="h-5 w-5 mr-2 text-primary-500" />
                                Features & Amenities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {featuresList.map((feature) => (
                                    <Checkbox
                                        key={feature.key}
                                        id={feature.key}
                                        label={feature.label}
                                        checked={formData.features[feature.key as keyof typeof formData.features]}
                                        onChange={() => handleFeatureChange(feature.key)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/properties')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
