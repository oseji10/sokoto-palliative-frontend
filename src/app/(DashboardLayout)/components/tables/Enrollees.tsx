import {
    Typography, Box,
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
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
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
    beneficiaryType: number;
    lga: number;
    beneficiary_type?: {
        typeId: number;
        typeName: string;
    };
    lga_info?: {
        lgaId: number;
        lgaName: string;
    };
}

interface BeneficiaryType {
    typeId: number;
    typeName: string;
}

interface LGA {
    lgaId: number;
    lgaName: string;
}

const Beneficiaries = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState("");
    const [lgaFilter, setLgaFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [otherNames, setOtherNames] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [beneficiaryType, setBeneficiaryType] = useState("");
    const [lga, setLga] = useState("");
    const [beneficiaryTypes, setBeneficiaryTypes] = useState<BeneficiaryType[]>([]);
    const [lgas, setLgas] = useState<LGA[]>([]);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [viewingBeneficiary, setViewingBeneficiary] = useState<Beneficiary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [beneficiariesResponse, beneficiaryTypesResponse, lgasResponse] = await Promise.all([
                    api.get('/beneficiaries'),
                    api.get('/beneficiaries/types'),
                    api.get('/lgas'),
                ]);
                const sortedData = beneficiariesResponse.data.sort((a: Beneficiary, b: Beneficiary) => 
                    a.firstName.localeCompare(b.firstName)
                );
                setBeneficiaries(sortedData);
                setFilteredBeneficiaries(sortedData);
                setBeneficiaryTypes(beneficiaryTypesResponse.data);
                setLgas(lgasResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...beneficiaries];
        if (searchTerm) {
            filtered = filtered.filter((beneficiary) =>
                beneficiary.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (beneficiaryTypeFilter) {
            filtered = filtered.filter((beneficiary) => 
                beneficiary.beneficiaryType === Number(beneficiaryTypeFilter)
            );
        }
        if (lgaFilter) {
            filtered = filtered.filter((beneficiary) => 
                beneficiary.lga === Number(lgaFilter)
            );
        }
        setFilteredBeneficiaries(filtered);
        setCurrentPage(0);
    }, [searchTerm, beneficiaryTypeFilter, lgaFilter, beneficiaries]);

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
            setOtherNames(beneficiary.otherNames || "");
            setEmail(beneficiary.email || "");
            setPhoneNumber(beneficiary.phoneNumber || "");
            setBeneficiaryType(beneficiary.beneficiaryType.toString());
            setLga(beneficiary.lga.toString());
        } else {
            setEditingBeneficiary(null);
            setFirstName("");
            setLastName("");
            setOtherNames("");
            setEmail("");
            setPhoneNumber("");
            setBeneficiaryType("");
            setLga("");
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
        setFirstName("");
        setLastName("");
        setOtherNames("");
        setEmail("");
        setPhoneNumber("");
        setBeneficiaryType("");
        setLga("");
        setEditingBeneficiary(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingBeneficiary(null);
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !beneficiaryType ) {
            setError('First name, last name, beneficiary type, and LGA are required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newBeneficiary: Beneficiary;
            const payload = {
                firstName,
                lastName,
                otherNames,
                email,
                phoneNumber,
                beneficiaryType: Number(beneficiaryType),
                // lga: Number(lga),
            };
            if (editingBeneficiary) {
                const response = await api.put(`/beneficiaries/${editingBeneficiary.id}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = response.data;
                    if (!newBeneficiary.beneficiaryId || !newBeneficiary.firstName) {
                        throw new Error('Invalid response format: missing id or firstName');
                    }
                    const updatedBeneficiaries = [...beneficiaries.map(d => 
                        d.beneficiaryId === editingBeneficiary.beneficiaryId ? newBeneficiary : d
                    )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries([...updatedBeneficiaries].filter(d =>
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType === Number(beneficiaryTypeFilter)) &&
                        (!lgaFilter || d.lga === Number(lgaFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/beneficiaries', payload);
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = response.data;
                    if (!newBeneficiary.beneficiaryId || !newBeneficiary.firstName) {
                        throw new Error('Invalid response format: missing id or firstName');
                    }
                    const updatedBeneficiaries = [...beneficiaries, newBeneficiary].sort((a, b) => 
                        a.firstName.localeCompare(b.firstName)
                    );
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries([...updatedBeneficiaries].filter(d => 
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType === Number(beneficiaryTypeFilter)) &&
                        (!lgaFilter || d.lga === Number(lgaFilter))
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
            const response = await api.delete(`/beneficiaries/${beneficiaryToDelete.id}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedBeneficiaries = [...beneficiaries.filter(d => 
                    d.id !== beneficiaryToDelete.id
                )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                setBeneficiaries(updatedBeneficiaries);
                setFilteredBeneficiaries([...updatedBeneficiaries].filter(d => 
                    d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (!beneficiaryTypeFilter || d.beneficiaryType === Number(beneficiaryTypeFilter)) &&
                    (!lgaFilter || d.lga === Number(lgaFilter))
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

    return (
        <DashboardCard title="List of Beneficiaries">
            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add Beneficiary
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        variant="outlined"
                        label="Search by Name, Email, or Phone"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Beneficiary Type Filter</InputLabel>
                        <Select
                            value={beneficiaryTypeFilter}
                            onChange={(e) => setBeneficiaryTypeFilter(e.target.value)}
                            label="Beneficiary Type Filter"
                        >
                            <MenuItem value="">All Beneficiary Types</MenuItem>
                            {beneficiaryTypes.map((type) => (
                                <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>LGA Filter</InputLabel>
                        <Select
                            value={lgaFilter}
                            onChange={(e) => setLgaFilter(e.target.value)}
                            label="LGA Filter"
                        >
                            <MenuItem value="">All LGAs</MenuItem>
                            {lgas.map((lga) => (
                                <MenuItem key={lga.lgaId} value={lga.lgaId.toString()}>{lga.lgaName}</MenuItem>
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

            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
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
                                    LGA
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
                            <TableRow key={beneficiary.id}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {beneficiary.firstName} {beneficiary.lastName} {beneficiary.otherNames}
                                    </Typography>
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
                                    <Typography>{beneficiary.lga_info?.lgaName || 'Unknown'}</Typography>
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
                    width: { xs: '90%', sm: 500, md: 600 },
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
                            onChange={(e) => setFirstName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Other Names"
                            value={otherNames}
                            onChange={(e) => setOtherNames(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="email"
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="tel"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Beneficiary Type</InputLabel>
                            <Select
                                value={beneficiaryType}
                                onChange={(e) => setBeneficiaryType(e.target.value)}
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
                        {/* <FormControl fullWidth>
                            <InputLabel>LGA</InputLabel>
                            <Select
                                value={lga}
                                onChange={(e) => setLga(e.target.value)}
                                label="LGA"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select LGA</MenuItem>
                                {lgas.map((lga) => (
                                    <MenuItem key={lga.lgaId} value={lga.lgaId.toString()}>{lga.lgaName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl> */}
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
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !beneficiaryType }
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
                    <Typography><strong>Name:</strong> {viewingBeneficiary?.firstName} {viewingBeneficiary?.lastName} {viewingBeneficiary?.otherNames || ''}</Typography>
                    <Typography><strong>Email:</strong> {viewingBeneficiary?.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {viewingBeneficiary?.phoneNumber || 'N/A'}</Typography>
                    <Typography><strong>Beneficiary Type:</strong> {viewingBeneficiary?.beneficiary_type?.typeName || 'Unknown'}</Typography>
                    <Typography><strong>LGA:</strong> {viewingBeneficiary?.lga_info?.lgaName || 'Unknown'}</Typography>
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
                    {"Confirm Deletion"}
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