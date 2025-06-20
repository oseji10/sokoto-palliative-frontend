import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    Modal,
    IconButton,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Cadre {
    cadreId: string;
    cadreName: string;
    salary: number;
}

const Cadres = () => {
    const [cadres, setCadres] = useState<Cadre[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [cadreName, setCadreName] = useState("");
    const [salary, setSalary] = useState("");
    const [editingCadre, setEditingCadre] = useState<Cadre | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cadreToDelete, setCadreToDelete] = useState<Cadre | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/cadres');
                const normalizedData = response.data.map((cadre: any) => ({
                    ...cadre,
                    salary: Number(cadre.salary),
                }));
                const sortedData = normalizedData.sort((a: Cadre, b: Cadre) => 
                    a.cadreName.localeCompare(b.cadreName)
                );
                setCadres(sortedData);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch cadres');
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (cadre?: Cadre) => {
        if (cadre) {
            setEditingCadre(cadre);
            setCadreName(cadre.cadreName);
            setSalary(cadre.salary.toString());
        } else {
            setEditingCadre(null);
            setCadreName("");
            setSalary("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCadreName("");
        setSalary("");
        setEditingCadre(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!cadreName.trim()) {
            setError('Cadre name is required');
            setIsSubmitting(false);
            return;
        }
        const salaryValue = Number(salary);
        if (!salary.trim() || isNaN(salaryValue) || salaryValue < 0) {
            setError('Salary must be a valid non-negative number');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newCadre: Cadre;
            const payload = {
                cadreName,
                salary: salaryValue,
            };
            if (editingCadre) {
                const response = await api.put(`/cadres/${editingCadre.cadreId}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newCadre = {
                        ...response.data,
                        salary: Number(response.data.salary),
                    };
                    if (!newCadre.cadreId || !newCadre.cadreName) {
                        throw new Error('Invalid response format: missing cadreId or cadreName');
                    }
                    const updatedCadres = cadres.map(c => 
                        c.cadreId === editingCadre.cadreId ? newCadre : c
                    ).sort((a, b) => a.cadreName.localeCompare(b.cadreName));
                    setCadres(updatedCadres);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/cadres', payload);
                if (response.status >= 200 && response.status < 300) {
                    newCadre = {
                        ...response.data,
                        salary: Number(response.data.salary),
                    };
                    if (!newCadre.cadreId || !newCadre.cadreName) {
                        throw new Error('Invalid response format: missing cadreId or cadreName');
                    }
                    const updatedCadres = [...cadres, newCadre].sort((a, b) => 
                        a.cadreName.localeCompare(b.cadreName)
                    );
                    setCadres(updatedCadres);
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
                (editingCadre ? 'Failed to update cadre' : 'Failed to add cadre')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (cadre: Cadre) => {
        setCadreToDelete(cadre);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setCadreToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!cadreToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/cadres/${cadreToDelete.cadreId}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedCadres = cadres.filter(c => 
                    c.cadreId !== cadreToDelete.cadreId
                ).sort((a, b) => a.cadreName.localeCompare(b.cadreName));
                setCadres(updatedCadres);
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete cadre'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatSalary = (salary: number | undefined): string => {
        if (salary == null) return 'N/A';
        return `₦${salary.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <DashboardCard title="Cadres List">
            <Box mb={2}>
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                    disabled={isLoading}
                >
                    Add Cadre
                </Button>
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
                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                    <Table
                        aria-label="cadres table"
                        sx={{
                            whiteSpace: "nowrap",
                            mt: 2
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Cadre Name
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Salary
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
                            {cadres.map((cadre) => (
                                <TableRow key={cadre.cadreId}>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {cadre.cadreName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {formatSalary(cadre.salary)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(cadre)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleOpenDeleteDialog(cadre)}
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
                    <Typography id="modal-modal-title" variant="h6" component="h2" fontWeight={600}>
                        {editingCadre ? 'Edit Cadre' : 'Add New Cadre'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Cadre Name"
                            value={cadreName}
                            onChange={(e) => setCadreName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Salary"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            error={!!error}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="number"
                            inputProps={{ min: 0, step: "0.01" }}
                        />
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
                                disabled={isSubmitting || !cadreName.trim() || !salary.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingCadre ? 'Updating...' : 'Adding...') : (editingCadre ? 'Update' : 'Add')}
                            </Button>
                        </Box>
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
                        Are you sure you want to delete the cadre "{cadreToDelete?.cadreName}"? This action cannot be undone.
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

export default Cadres;