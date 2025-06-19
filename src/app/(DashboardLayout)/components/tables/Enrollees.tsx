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

interface Enrollee {
    enrolleeId: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    phoneNumber?: string;
    email?: string;
    enrolleeType: number;
    lga: number;
    enrollee_type?: {
        typeId: number;
        typeName: string;
    };
    lga_info?: {
        lgaId: number;
        lgaName: string;
    };
}

interface EnrolleeType {
    typeId: number;
    typeName: string;
}

interface LGA {
    lgaId: number;
    lgaName: string;
}

const Enrollees = () => {
    const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
    const [filteredEnrollees, setFilteredEnrollees] = useState<Enrollee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [enrolleeTypeFilter, setEnrolleeTypeFilter] = useState("");
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
    const [enrolleeType, setEnrolleeType] = useState("");
    const [lga, setLga] = useState("");
    const [enrolleeTypes, setEnrolleeTypes] = useState<EnrolleeType[]>([]);
    const [lgas, setLgas] = useState<LGA[]>([]);
    const [editingEnrollee, setEditingEnrollee] = useState<Enrollee | null>(null);
    const [viewingEnrollee, setViewingEnrollee] = useState<Enrollee | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [enrolleeToDelete, setEnrolleeToDelete] = useState<Enrollee | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrolleesResponse, enrolleeTypesResponse, lgasResponse] = await Promise.all([
                    api.get('/enrollees'),
                    api.get('/enrollees/types'),
                    api.get('/lgas'),
                ]);
                const sortedData = enrolleesResponse.data.sort((a: Enrollee, b: Enrollee) => 
                    a.firstName.localeCompare(b.firstName)
                );
                setEnrollees(sortedData);
                setFilteredEnrollees(sortedData);
                setEnrolleeTypes(enrolleeTypesResponse.data);
                setLgas(lgasResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...enrollees];
        if (searchTerm) {
            filtered = filtered.filter((enrollee) =>
                enrollee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollee.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (enrolleeTypeFilter) {
            filtered = filtered.filter((enrollee) => 
                enrollee.enrolleeType === Number(enrolleeTypeFilter)
            );
        }
        if (lgaFilter) {
            filtered = filtered.filter((enrollee) => 
                enrollee.lga === Number(lgaFilter)
            );
        }
        setFilteredEnrollees(filtered);
        setCurrentPage(0);
    }, [searchTerm, enrolleeTypeFilter, lgaFilter, enrollees]);

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

    const handleOpenModal = (enrollee?: Enrollee) => {
        if (enrollee) {
            setEditingEnrollee(enrollee);
            setFirstName(enrollee.firstName);
            setLastName(enrollee.lastName);
            setOtherNames(enrollee.otherNames || "");
            setEmail(enrollee.email || "");
            setPhoneNumber(enrollee.phoneNumber || "");
            setEnrolleeType(enrollee.enrolleeType.toString());
            setLga(enrollee.lga.toString());
        } else {
            setEditingEnrollee(null);
            setFirstName("");
            setLastName("");
            setOtherNames("");
            setEmail("");
            setPhoneNumber("");
            setEnrolleeType("");
            setLga("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleOpenViewModal = (enrollee: Enrollee) => {
        setViewingEnrollee(enrollee);
        setOpenViewModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFirstName("");
        setLastName("");
        setOtherNames("");
        setEmail("");
        setPhoneNumber("");
        setEnrolleeType("");
        setLga("");
        setEditingEnrollee(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingEnrollee(null);
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !enrolleeType ) {
            setError('First name, last name, enrollee type, and LGA are required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newEnrollee: Enrollee;
            const payload = {
                firstName,
                lastName,
                otherNames,
                email,
                phoneNumber,
                enrolleeType: Number(enrolleeType),
                // lga: Number(lga),
            };
            if (editingEnrollee) {
                const response = await api.put(`/enrollees/${editingEnrollee.id}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newEnrollee = response.data;
                    if (!newEnrollee.id || !newEnrollee.firstName) {
                        throw new Error('Invalid response format: missing id or firstName');
                    }
                    const updatedEnrollees = [...enrollees.map(d => 
                        d.id === editingEnrollee.id ? newEnrollee : d
                    )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                    setEnrollees(updatedEnrollees);
                    setFilteredEnrollees([...updatedEnrollees].filter(d =>
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!enrolleeTypeFilter || d.enrolleeType === Number(enrolleeTypeFilter)) &&
                        (!lgaFilter || d.lga === Number(lgaFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/enrollees', payload);
                if (response.status >= 200 && response.status < 300) {
                    newEnrollee = response.data;
                    if (!newEnrollee.enrolleeId || !newEnrollee.firstName) {
                        throw new Error('Invalid response format: missing id or firstName');
                    }
                    const updatedEnrollees = [...enrollees, newEnrollee].sort((a, b) => 
                        a.firstName.localeCompare(b.firstName)
                    );
                    setEnrollees(updatedEnrollees);
                    setFilteredEnrollees([...updatedEnrollees].filter(d => 
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!enrolleeTypeFilter || d.enrolleeType === Number(enrolleeTypeFilter)) &&
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
                (editingEnrollee ? 'Failed to update enrollee' : 'Failed to add enrollee')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (enrollee: Enrollee) => {
        setEnrolleeToDelete(enrollee);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setEnrolleeToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!enrolleeToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/enrollees/${enrolleeToDelete.id}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedEnrollees = [...enrollees.filter(d => 
                    d.id !== enrolleeToDelete.id
                )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                setEnrollees(updatedEnrollees);
                setFilteredEnrollees([...updatedEnrollees].filter(d => 
                    d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (!enrolleeTypeFilter || d.enrolleeType === Number(enrolleeTypeFilter)) &&
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
                'Failed to delete enrollee'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedEnrollees = filteredEnrollees.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="List of Enrollees">
            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add Enrollee
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
                        <InputLabel>Enrollee Type Filter</InputLabel>
                        <Select
                            value={enrolleeTypeFilter}
                            onChange={(e) => setEnrolleeTypeFilter(e.target.value)}
                            label="Enrollee Type Filter"
                        >
                            <MenuItem value="">All Enrollee Types</MenuItem>
                            {enrolleeTypes.map((type) => (
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
                                    Enrollee Type
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
                        {paginatedEnrollees.map((enrollee) => (
                            <TableRow key={enrollee.id}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {enrollee.firstName} {enrollee.lastName} {enrollee.otherNames}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{enrollee.email || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{enrollee.phoneNumber || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{enrollee.enrollee_type?.typeName || 'Unknown'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{enrollee.lga_info?.lgaName || 'Unknown'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenViewModal(enrollee)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenModal(enrollee)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleOpenDeleteDialog(enrollee)}
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
                count={filteredEnrollees.length}
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
                        {editingEnrollee ? 'Edit Enrollee' : 'Add New Enrollee'}
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
                            <InputLabel>Enrollee Type</InputLabel>
                            <Select
                                value={enrolleeType}
                                onChange={(e) => setEnrolleeType(e.target.value)}
                                label="Enrollee Type"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Enrollee Type</MenuItem>
                                {enrolleeTypes.map((type) => (
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
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !enrolleeType }
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingEnrollee ? 'Updating...' : 'Adding...') : (editingEnrollee ? 'Update' : 'Add')}
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
                        Enrollee Details
                    </Typography>
                    <Typography><strong>Name:</strong> {viewingEnrollee?.firstName} {viewingEnrollee?.lastName} {viewingEnrollee?.otherNames || ''}</Typography>
                    <Typography><strong>Email:</strong> {viewingEnrollee?.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {viewingEnrollee?.phoneNumber || 'N/A'}</Typography>
                    <Typography><strong>Enrollee Type:</strong> {viewingEnrollee?.enrollee_type?.typeName || 'Unknown'}</Typography>
                    <Typography><strong>LGA:</strong> {viewingEnrollee?.lga_info?.lgaName || 'Unknown'}</Typography>
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
                        Are you sure you want to delete the enrollee "{enrolleeToDelete?.firstName} {enrolleeToDelete?.lastName}"? This action cannot be undone.
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

export default Enrollees;