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

interface User {
    id: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    staffId: string;
    email?: string;
    phoneNumber?: string;
    staff?: {
        staffId: number;
        effectiveFrom: string;
        effectiveUntil: string;
        userId: number;
        staffType: number;
        lga: number;
        supervisor: number;
        isActive: string;
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
        staff_type: {
            typeId: number;
            typeName: string;
            duration: string | null;
            deleted_at: string | null;
        };
    };
}

interface Supervisor {
    staffId: number;
    firstName: string;
    lastName: string;
}

interface LGA {
    lgaId: number;
    lgaName: string;
}

interface StaffType {
    typeId: number;
    typeName: string;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [lgaFilter, setLgaFilter] = useState("");
    const [staffTypeFilter, setStaffTypeFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [otherNames, setOtherNames] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [supervisor, setSupervisor] = useState("");
    const [lga, setLga] = useState("");
    const [staffType, setStaffType] = useState("");
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [lgas, setLgas] = useState<LGA[]>([]);
    const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, supervisorsResponse, lgasResponse, staffTypesResponse] = await Promise.all([
                    api.get('/users'),
                    api.get('/supervisors'),
                    api.get('/lgas'),
                    api.get('/staff-types')
                ]);
                
                const sortedData = usersResponse.data.sort((a: User, b: User) => 
                    a.firstName.localeCompare(b.firstName)
                );
                setUsers(sortedData);
                setFilteredUsers(sortedData);
                setSupervisors(supervisorsResponse.data);
                setLgas(lgasResponse.data);
                setStaffTypes(staffTypesResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...users];
        if (searchTerm) {
            filtered = filtered.filter((user) =>
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (lgaFilter) {
            filtered = filtered.filter((user) => 
                user.staff?.lga === Number(lgaFilter)
            );
        }
        if (staffTypeFilter) {
            filtered = filtered.filter((user) => 
                user.staff?.staffType === Number(staffTypeFilter)
            );
        }
        setFilteredUsers(filtered);
        setCurrentPage(0);
    }, [searchTerm, lgaFilter, staffTypeFilter, users]);

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

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setOtherNames(user.otherNames || "");
            setEmail(user.email || "");
            setPhoneNumber(user.phoneNumber || "");
            setSupervisor(user.staff?.supervisor.toString() || "");
            setLga(user.staff?.lga.toString() || "");
            setStaffType(user.staff?.staffType.toString() || "");
        } else {
            setEditingUser(null);
            setFirstName("");
            setLastName("");
            setOtherNames("");
            setEmail("");
            setPhoneNumber("");
            setSupervisor("");
            setLga("");
            setStaffType("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleOpenViewModal = (user: User) => {
        setViewingUser(user);
        setOpenViewModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFirstName("");
        setLastName("");
        setOtherNames("");
        setEmail("");
        setPhoneNumber("");
        setSupervisor("");
        setLga("");
        setStaffType("");
        setEditingUser(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingUser(null);
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            setError('First name and last name are required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newUser: User;
            if (editingUser) {
                const response = await api.put(`/users/${editingUser.staffId}/edit`, {
                    firstName,
                    lastName,
                    otherNames,
                    email,
                    phoneNumber,
                    staff: {
                        supervisor,
                        lga,
                        staffType
                    }
                });
                
                if (response.status >= 200 && response.status < 300) {
                    newUser = response.data;
                    if (!newUser.staffId || !newUser.firstName) {
                        throw new Error('Invalid response format: missing staffId or firstName');
                    }
                    const updatedUsers = [...users.map(d => 
                        d.staffId === editingUser.staffId ? newUser : d
                    )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                    
                    setUsers(updatedUsers);
                    setFilteredUsers([...updatedUsers].filter(d =>
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/users', {
                    firstName,
                    lastName,
                    otherNames,
                    email,
                    phoneNumber,
                    staff: {
                        supervisor,
                        lga,
                        staffType
                    }
                });
                
                if (response.status >= 200 && response.status < 300) {
                    newUser = response.data;
                    if (!newUser.staffId || !newUser.firstName) {
                        throw new Error('Invalid response format: missing staffId or firstName');
                    }
                    const updatedUsers = [...users, newUser].sort((a, b) => 
                        a.firstName.localeCompare(b.firstName)
                    );
                    
                    setUsers(updatedUsers);
                    setFilteredUsers([...updatedUsers].filter(d => 
                        d.firstName.toLowerCase().includes(searchTerm.toLowerCase())
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
                (editingUser ? 'Failed to update user' : 'Failed to add user')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/users/${userToDelete.staffId}/delete`);
            
            if (response.status >= 200 && response.status < 300) {
                const updatedUsers = [...users.filter(d => 
                    d.staffId !== userToDelete.staffId
                )].sort((a, b) => a.firstName.localeCompare(b.firstName));
                
                setUsers(updatedUsers);
                setFilteredUsers([...updatedUsers].filter(d => 
                    d.firstName.toLowerCase().includes(searchTerm.toLowerCase())
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
                'Failed to delete user'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedUsers = filteredUsers.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="List of Users">
            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add User
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        variant="outlined"
                        label="Search by Name, Email or Phone"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
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
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Staff Type Filter</InputLabel>
                        <Select
                            value={staffTypeFilter}
                            onChange={(e) => setStaffTypeFilter(e.target.value)}
                            label="Staff Type Filter"
                        >
                            <MenuItem value="">All Staff Types</MenuItem>
                            {staffTypes.map((type) => (
                                <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
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
                                    Staff Name
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
                                    Staff Type
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
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.staffId}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {user.firstName} {user.lastName} {user.otherNames}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{user.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{user.phoneNumber}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{user.staff?.staff_type.typeName}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenViewModal(user)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenModal(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleOpenDeleteDialog(user)}
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
                count={filteredUsers.length}
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
                        {editingUser ? 'Edit User' : 'Add New User'}
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
                            <InputLabel>Supervisor</InputLabel>
                            <Select
                                value={supervisor}
                                onChange={(e) => setSupervisor(e.target.value)}
                                label="Supervisor"
                                disabled={isSubmitting}
                            >
                                <MenuItem value="">Select Supervisor</MenuItem>
                                {supervisors.map((sup) => (
                                    <MenuItem key={sup.staffId} value={sup.staffId}>{sup.firstName} {sup.lastName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>LGA</InputLabel>
                            <Select
                                value={lga}
                                onChange={(e) => setLga(e.target.value)}
                                label="LGA"
                                disabled={isSubmitting}
                            >
                                <MenuItem value="">Select LGA</MenuItem>
                                {lgas.map((lga) => (
                                    <MenuItem key={lga.lgaId} value={lga.lgaId.toString()}>{lga.lgaName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Staff Type</InputLabel>
                            <Select
                                value={staffType}
                                onChange={(e) => setStaffType(e.target.value)}
                                label="Staff Type"
                                disabled={isSubmitting}
                            >
                                <MenuItem value="">Select Staff Type</MenuItem>
                                {staffTypes.map((type) => (
                                    <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
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
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingUser ? 'Updating...' : 'Adding...') : (editingUser ? 'Update' : 'Add')}
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
                        User Details
                    </Typography>
                    <Typography><strong>Name:</strong> {viewingUser?.firstName} {viewingUser?.lastName} {viewingUser?.otherNames}</Typography>
                    <Typography><strong>Email:</strong> {viewingUser?.email}</Typography>
                    <Typography><strong>Phone:</strong> {viewingUser?.phoneNumber}</Typography>
                    <Typography><strong>Staff Type:</strong> {viewingUser?.staff?.staff_type.typeName}</Typography>
                    <Typography><strong>LGA:</strong> {lgas.find(l => l.lgaId === viewingUser?.staff?.lga)?.lgaName}</Typography>
                    <Typography><strong>Supervisor:</strong> {supervisors.find(s => s.staffId === viewingUser?.staff?.supervisor)?.firstName} {supervisors.find(s => s.staffId === viewingUser?.staff?.supervisor)?.lastName}</Typography>
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
                        Are you sure you want to delete the user "{userToDelete?.firstName}"? This action cannot be undone.
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

export default Users;