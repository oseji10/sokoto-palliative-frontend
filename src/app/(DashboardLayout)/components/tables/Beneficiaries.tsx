
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    TablePagination,
    Modal,
    IconButton,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    SelectChangeEvent,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Beneficiary {
    beneficiaryId: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    phoneNumber?: string;
    email?: string;
    employeeId: string;
    beneficiaryType: number;
    cadre: number;
    ministry: number;
    lga?: number;
    enrolledBy?: number;
    isActive?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    beneficiary_type?: {
        typeId: number;
        typeName: string;
    };
    cadre_info?: {
        cadreId: string;
        cadreName: string;
    };
    ministry_info?: {
        ministryId: string;
        ministryName: string;
    };
    lga_info?: {
        lgaId: number;
        districtId: number;
        lgaName: string;
        deleted_at?: string | null;
    };
    enrolled_by?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

interface BeneficiaryType {
    typeId: number;
    typeName: string;
}

interface Cadre {
    cadreId: string;
    cadreName: string;
}

interface Ministry {
    ministryId: string;
    ministryName: string;
}

const Beneficiaries = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState('');
    const [cadreFilter, setCadreFilter] = useState('');
    const [ministryFilter, setMinistryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otherNames, setOtherNames] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [beneficiaryType, setBeneficiaryType] = useState('');
    const [cadreId, setCadreId] = useState('');
    const [ministryId, setMinistryId] = useState('');
    const [beneficiaryTypes, setBeneficiaryTypes] = useState<BeneficiaryType[]>([]);
    const [cadres, setCadres] = useState<Cadre[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [viewingBeneficiary, setViewingBeneficiary] = useState<Beneficiary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [beneficiariesResponse, beneficiaryTypesResponse, cadresResponse, ministriesResponse] = await Promise.all([
                    api.get('/beneficiaries'),
                    api.get('/beneficiaries/types'),
                    api.get('/cadres'),
                    api.get('/ministries'),
                ]);
                const sortedData = beneficiariesResponse.data.sort((a: Beneficiary, b: Beneficiary) => 
                    a.firstName.localeCompare(b.firstName)
                );
                // Log unique cadre and ministry IDs
                const uniqueCadreIds = [...new Set(sortedData.map(b => b.cadre).filter(id => id))];
                const uniqueMinistryIds = [...new Set(sortedData.map(b => b.ministry).filter(id => id))];
                console.log('Unique Cadre IDs in Beneficiaries:', uniqueCadreIds);
                console.log('Unique Ministry IDs in Beneficiaries:', uniqueMinistryIds);
                console.log('Available Cadre IDs:', cadresResponse.data.map((c: Cadre) => c.cadreId));
                console.log('Available Ministry IDs:', ministriesResponse.data.map((m: Ministry) => m.ministryId));
                sortedData.forEach((b: Beneficiary, i: number) => {
                    if (!b.cadre || !b.ministry) {
                        console.warn(`Beneficiary at index ${i} has missing fields:`, {
                            beneficiaryId: b.beneficiaryId,
                            cadre: b.cadre,
                            ministry: b.ministry,
                        });
                    }
                    if (b.cadre && !cadresResponse.data.some((c: Cadre) => c.cadreId === b.cadre.toString())) {
                        console.warn(`Beneficiary has invalid cadre:`, { beneficiaryId: b.beneficiaryId, cadre: b.cadre });
                    }
                    if (b.ministry && !ministriesResponse.data.some((m: Ministry) => m.ministryId === b.ministry.toString())) {
                        console.warn(`Beneficiary has invalid ministry:`, { beneficiaryId: b.beneficiaryId, ministry: b.ministry });
                    }
                });
                console.log('Beneficiaries:', sortedData);
                console.log('Cadres:', cadresResponse.data);
                console.log('Ministries:', ministriesResponse.data);
                console.log('Beneficiary Types:', beneficiaryTypesResponse.data);
                setBeneficiaries(sortedData);
                setFilteredBeneficiaries(sortedData);
                setBeneficiaryTypes(beneficiaryTypesResponse.data);
                setCadres(cadresResponse.data);
                setMinistries(ministriesResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        console.log('Applying filters:', { searchTerm, beneficiaryTypeFilter, cadreFilter, ministryFilter });
        let filtered = [...beneficiaries];
        if (searchTerm) {
            filtered = filtered.filter((beneficiary) =>
                beneficiary.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (beneficiaryTypeFilter) {
            filtered = filtered.filter((beneficiary) => {
                const match = beneficiary.beneficiaryType?.toString() === beneficiaryTypeFilter;
                console.log('Beneficiary Type Filter:', {
                    beneficiaryId: beneficiary.beneficiaryId,
                    beneficiaryType: beneficiary.beneficiaryType,
                    filter: beneficiaryTypeFilter,
                    match,
                });
                return match;
            });
        }
        if (cadreFilter) {
            filtered = filtered.filter((beneficiary) => {
                if (!beneficiary.cadre) {
                    console.warn('Skipping beneficiary with undefined cadre:', beneficiary.beneficiaryId);
                    return false;
                }
                const match = beneficiary.cadre.toString() === cadreFilter;
                console.log('Cadre Filter:', {
                    beneficiaryId: beneficiary.beneficiaryId,
                    cadre: beneficiary.cadre,
                    filter: cadreFilter,
                    match,
                });
                return match;
            });
        }
        if (ministryFilter) {
            filtered = filtered.filter((beneficiary) => {
                if (!beneficiary.ministry) {
                    console.warn('Skipping beneficiary with undefined ministry:', beneficiary.beneficiaryId);
                    return false;
                }
                const match = beneficiary.ministry.toString() === ministryFilter;
                console.log('Ministry Filter:', {
                    beneficiaryId: beneficiary.beneficiaryId,
                    ministry: beneficiary.ministry,
                    filter: ministryFilter,
                    match,
                });
                return match;
            });
        }
        console.log('Filtered Beneficiaries:', filtered);
        setFilteredBeneficiaries(filtered);
        setCurrentPage(0);
    }, [searchTerm, beneficiaryTypeFilter, cadreFilter, ministryFilter, beneficiaries]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleOpenModal = (beneficiary?: Beneficiary) => {
        if (beneficiary) {
            setEditingBeneficiary(beneficiary);
            setFirstName(beneficiary.firstName);
            setLastName(beneficiary.lastName);
            setOtherNames(beneficiary.otherNames || '');
            setEmail(beneficiary.email || '');
            setPhoneNumber(beneficiary.phoneNumber || '');
            setEmployeeId(beneficiary.employeeId);
            setBeneficiaryType(beneficiary.beneficiaryType.toString());
            setCadreId(beneficiary.cadre.toString());
            setMinistryId(beneficiary.ministry.toString());
        } else {
            setEditingBeneficiary(null);
            setFirstName('');
            setLastName('');
            setOtherNames('');
            setEmail('');
            setPhoneNumber('');
            setEmployeeId('');
            setBeneficiaryType('');
            setCadreId('');
            setMinistryId('');
        }
        setError(null);
        setOpenModal(true);
    };

    const handleOpenViewModal = (beneficiary: Beneficiary) => {
        setViewingBeneficiary(beneficiary);
        setOpenViewModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFirstName('');
        setLastName('');
        setOtherNames('');
        setEmail('');
        setPhoneNumber('');
        setEmployeeId('');
        setBeneficiaryType('');
        setCadreId('');
        setMinistryId('');
        setEditingBeneficiary(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingBeneficiary(null);
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !employeeId.trim() || !beneficiaryType || !cadreId || !ministryId) {
            setError('First name, last name, employee ID, beneficiary type, cadre, and ministry are required');
            setIsSubmitting(false);
            return;
        }
        if (!cadres.some(c => c.cadreId === cadreId)) {
            setError('Invalid cadre selected');
            setIsSubmitting(false);
            return;
        }
        if (!ministries.some(m => m.ministryId === ministryId)) {
            setError('Invalid ministry selected');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                firstName,
                lastName,
                otherNames,
                email,
                phoneNumber,
                employeeId,
                beneficiaryType: Number(beneficiaryType),
                cadre: Number(cadreId),
                ministry: Number(ministryId),
            };
            console.log('Submitting payload:', payload);
            let newBeneficiary: Beneficiary;
            if (editingBeneficiary) {
                const response = await api.put(`/beneficiaries/${editingBeneficiary.beneficiaryId}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = {
                        ...response.data,
                        beneficiary_type: beneficiaryTypes.find(t => t.typeId === Number(beneficiaryType)),
                        cadre_info: cadres.find(c => c.cadreId === cadreId),
                        ministry_info: ministries.find(m => m.ministryId === ministryId),
                    };
                    console.log('Updated Beneficiary:', newBeneficiary);
                    if (!newBeneficiary.beneficiaryId || !newBeneficiary.firstName || !newBeneficiary.cadre || !newBeneficiary.ministry) {
                        throw new Error('Invalid response format: missing required fields');
                    }
                    const updatedBeneficiaries = [...beneficiaries.map(d => 
                        d.beneficiaryId === editingBeneficiary.beneficiaryId ? newBeneficiary : d
                    )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries([...updatedBeneficiaries].filter(d =>
                        (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                        (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                        (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/beneficiaries', payload);
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = {
                        ...response.data,
                        beneficiary_type: beneficiaryTypes.find(t => t.typeId === Number(beneficiaryType)),
                        cadre_info: cadres.find(c => c.cadreId === cadreId),
                        ministry_info: ministries.find(m => m.ministryId === ministryId),
                    };
                    console.log('New Beneficiary:', newBeneficiary);
                    if (!newBeneficiary.beneficiaryId || !newBeneficiary.firstName || !newBeneficiary.cadre || !newBeneficiary.ministry) {
                        throw new Error('Invalid response format: missing required fields');
                    }
                    const updatedBeneficiaries = [...beneficiaries, newBeneficiary].sort((a, b) => 
                        a.firstName.localeCompare(b.firstName)
                    );
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries([...updatedBeneficiaries].filter(d => 
                        (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                        (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                        (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Add failed');
                }
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                (editingBeneficiary ? 'Failed to update beneficiary' : 'Failed to add beneficiary')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (beneficiary: Beneficiary) => {
        setBeneficiaryToDelete(beneficiary);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setBeneficiaryToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!beneficiaryToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/beneficiaries/${beneficiaryToDelete.beneficiaryId}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedBeneficiaries = [...beneficiaries.filter(d => 
                    d.beneficiaryId !== beneficiaryToDelete.beneficiaryId
                )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                setBeneficiaries(updatedBeneficiaries);
                setFilteredBeneficiaries([...updatedBeneficiaries].filter(d => 
                    (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                    (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                    (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
                ));
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete beneficiary'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedBeneficiaries = filteredBeneficiaries.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    // Debug table for unique cadre and ministry IDs
    const uniqueCadreIds = [...new Set(beneficiaries.map(b => b.cadre).filter(id => id))];
    const uniqueMinistryIds = [...new Set(beneficiaries.map(b => b.ministry).filter(id => id))];

    return (
        <DashboardCard title="List of Beneficiaries">
            {/* Debug Table */}
            
                

            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                    disabled={isLoading}
                >
                    Add Beneficiary
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        variant="outlined"
                        label="Search by Name, Email, Phone, or Employee ID"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                        disabled={isLoading}
                    />
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Beneficiary Type Filter</InputLabel>
                        <Select
                            value={beneficiaryTypeFilter}
                            onChange={(e: SelectChangeEvent<string>) => setBeneficiaryTypeFilter(e.target.value)}
                            label="Beneficiary Type Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Beneficiary Types</MenuItem>
                            {beneficiaryTypes.map((type) => (
                                <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Cadre Filter</InputLabel>
                        <Select
                            value={cadreFilter}
                            onChange={(e: SelectChangeEvent<string>) => setCadreFilter(e.target.value)}
                            label="Cadre Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Cadres</MenuItem>
                            {cadres.map((cadre) => (
                                <MenuItem key={cadre.cadreId} value={cadre.cadreId}>{cadre.cadreName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Ministry Filter</InputLabel>
                        <Select
                            value={ministryFilter}
                            onChange={(e: SelectChangeEvent<string>) => setMinistryFilter(e.target.value)}
                            label="Ministry Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Ministries</MenuItem>
                            {ministries.map((ministry) => (
                                <MenuItem key={ministry.ministryId} value={ministry.ministryId}>{ministry.ministryName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {error && (
                <Box mb={2}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                        <Table
                            aria-label="beneficiaries table"
                            sx={{
                                whiteSpace: 'nowrap',
                                mt: 2,
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Name
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Employee ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Email
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Phone
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Beneficiary Type
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Cadre
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Ministry
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Actions
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedBeneficiaries.map((beneficiary) => (
                                    <TableRow key={beneficiary.beneficiaryId}>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {beneficiary.firstName} {beneficiary.lastName} {beneficiary.otherNames || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.employeeId}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.email || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.phoneNumber || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.beneficiary_type?.typeName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.cadre_info?.cadreName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.ministry_info?.ministryName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenViewModal(beneficiary)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenModal(beneficiary)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleOpenDeleteDialog(beneficiary)}
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    <TablePagination
                        component="div"
                        count={filteredBeneficiaries.length}
                        page={currentPage}
                        onPageChange={handleChangePage}
                        rowsPerPage={recordsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </>
            )}

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 600 },
                    maxWidth: '95%',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" fontWeight={600}>
                        {editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={firstName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Other Names"
                            value={otherNames}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherNames(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Employee ID"
                            value={employeeId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeId(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="email"
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="tel"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Beneficiary Type</InputLabel>
                            <Select
                                value={beneficiaryType}
                                onChange={(e: SelectChangeEvent<string>) => setBeneficiaryType(e.target.value)}
                                label="Beneficiary Type"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Beneficiary Type</MenuItem>
                                {beneficiaryTypes.map((type) => (
                                    <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Cadre</InputLabel>
                            <Select
                                value={cadreId}
                                onChange={(e: SelectChangeEvent<string>) => setCadreId(e.target.value)}
                                label="Cadre"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Cadre</MenuItem>
                                {cadres.map((cadre) => (
                                    <MenuItem key={cadre.cadreId} value={cadre.cadreId}>{cadre.cadreName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Ministry</InputLabel>
                            <Select
                                value={ministryId}
                                onChange={(e: SelectChangeEvent<string>) => setMinistryId(e.target.value)}
                                label="Ministry"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Ministry</MenuItem>
                                {ministries.map((ministry) => (
                                    <MenuItem key={ministry.ministryId} value={ministry.ministryId}>{ministry.ministryName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 2 }}>
                            <Button
                                onClick={handleCloseModal}
                                color="secondary"
                                disabled={isSubmitting}
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !employeeId.trim() || !beneficiaryType || !cadreId || !ministryId}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingBeneficiary ? 'Updating...' : 'Adding...') : (editingBeneficiary ? 'Update' : 'Add')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={openViewModal}
                onClose={handleCloseViewModal}
                aria-labelledby="view-modal-title"
                aria-describedby="view-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    maxWidth: '95%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography id="view-modal-title" variant="h6" component="h2" fontWeight={600}>
                        Beneficiary Details
                    </Typography>
                    <Typography><strong>Name:</strong> {viewingBeneficiary?.firstName || ''} {viewingBeneficiary?.lastName || ''} {viewingBeneficiary?.otherNames || ''}</Typography>
                    <Typography><strong>Employee ID:</strong> {viewingBeneficiary?.employeeId || 'N/A'}</Typography>
                    <Typography><strong>Email:</strong> {viewingBeneficiary?.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {viewingBeneficiary?.phoneNumber || 'N/A'}</Typography>
                    <Typography><strong>Beneficiary Type:</strong> {viewingBeneficiary?.beneficiary_type?.typeName || 'Unknown'}</Typography>
                    <Typography><strong>Cadre:</strong> {viewingBeneficiary?.cadre_info?.cadreName || 'Unknown'}</Typography>
                    <Typography><strong>Ministry:</strong> {viewingBeneficiary?.ministry_info?.ministryName || 'Unknown'}</Typography>
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button onClick={handleCloseViewModal} color="secondary" variant="outlined">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the beneficiary "{beneficiaryToDelete?.firstName} {beneficiaryToDelete?.lastName}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardCard>
    );
};

export default Beneficiaries;
