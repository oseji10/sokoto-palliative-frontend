import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Modal
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from "react";
// import Cookies from 'js-cookie';

// Helper function to format the date
// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('en-US', {
//         weekday: 'long', // Full name of the day (e.g., Friday)
//         year: 'numeric', // 4-digit year
//         month: 'long',  // Full month name (e.g., September)
//         day: 'numeric'  // Day of the month (e.g., 18)
//     }).format(date);
// };

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10); // Set how many records you want per page
    const [open, setOpen] = useState(false); // Modal state
    const [contactPersons, setContactPersons] = useState([]); // Contact persons from API
    const [selectedContactPerson, setSelectedContactPerson] = useState('');

    const [shortName, setShortName] = useState('');
    const [supplierName, setSupplierName] = useState('');

    // const token = Cookies.get('token'); // Retrieve the token from cookies


    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%', // Increased flexibility for mobile
        maxWidth: '400px', // Still retain a reasonable size for larger screens
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 3,
        borderRadius: '8px',
    };


    // Fetch suppliers from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                setSuppliers(data); // Update state with the fetched data
                setFilteredSuppliers(data); // If you want to filter or manipulate the data later
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only once after component mounts



    // Fetch contact persons for dropdown from the API
    useEffect(() => {
        const fetchContactPersons = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setContactPersons(data);
            } catch (error) {
                console.error('Error fetching contact persons:', error);
            }
        };

        fetchContactPersons();
    }, []);

    // Handle search functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = suppliers.filter((supplier) => {
            const supplierName = `${supplier?.supplierName}`.toLowerCase();
            return (
                supplierName.includes(value)
            );
        });

        setFilteredSuppliers(filtered);
        setCurrentPage(0); // Reset to first page when search is triggered
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    // Pagination logic
    const paginatedSuppliers = filteredSuppliers.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );



    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Handle form submission for adding a patient
    const handleAddSupplier = async () => {
        const supplierData = {
            shortName,
            supplierName,
            contactPerson: selectedContactPerson,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });

            if (response.ok) {
                const newSupplier = await response.json();
                setSuppliers([...suppliers, newSupplier]); // Add new patient to the list
                setFilteredSuppliers([...suppliers, newSupplier]);
                handleClose(); // Close the modal after successful submission
            } else {
                console.error('Error adding supplier');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    return (
        <DashboardCard title="Supplier List">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    onClick={handleOpen}
                    disableElevation
                    color="primary"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Add Supplier
                </Button>
                &nbsp;
                <TextField
                    variant="outlined"
                    label="Search by Supplier Name"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                />
            </Box>

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
                                    Acronym
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Supplier
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Manufacturers
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            {/* <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Date Created
                                </Typography>
                            </TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSuppliers.map((supplier) => (
                            <TableRow key={supplier.id}>

                                <TableCell>
                                    <Typography>
                                        {supplier.shortName}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {supplier.supplierName}
                                    </Typography>
                                </TableCell>




                                <TableCell>
                                    <Typography>
                                        {/* {supplier.shortName} */}
                                    </Typography>
                                </TableCell>


                                <TableCell>
                                    <Chip
                                        sx={{
                                            px: "4px",
                                            backgroundColor:
                                                supplier.status === "inactive"
                                                    ? "error.main"

                                                    : supplier.status === "active"
                                                        ? "success.main"
                                                        : !supplier.status
                                                            ? "secondary.main"
                                                            : "secondary.main",
                                            color: "#fff",
                                        }}
                                        size="small"
                                        label={supplier?.status || "N/A"}
                                    />
                                </TableCell>
                                {/* <TableCell align="right">
                                    
                                    <Typography variant="h6">
                                        
                                    </Typography>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Pagination component */}
            <TablePagination
                component="div"
                count={filteredSuppliers.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />



            {/* Modal for Adding Drug */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        ...modalStyle,
                        maxHeight: '80vh', // Set max height to 80% of the viewport height
                        overflowY: 'auto' // Enable vertical scrolling
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Add Supplier
                    </Typography>
                    <TextField
                        fullWidth
                        label="Acronym"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Supplier Name"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />



                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Contact Person</InputLabel>
                        <Select
                            value={selectedContactPerson}
                            onChange={(e) => setSelectedContactPerson(e.target.value)}
                            required
                        >
                            {contactPersons.map((person) => (
                                <MenuItem key={person.id} value={person.id}>
                                    {person?.firstName}  {person?.otherNames}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>





                    <Box display="flex" justifyContent="flex-end" flexDirection={{ xs: 'column', sm: 'row' }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleClose}
                            sx={{ width: { xs: '100%', sm: 'auto' }, mb: { xs: 1, sm: 0 }, mr: { sm: 1 } }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddSupplier}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </DashboardCard>
    );
};

export default Suppliers;
