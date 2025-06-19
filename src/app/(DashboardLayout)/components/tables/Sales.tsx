import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    TablePagination,
    Modal,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    IconButton,
} from '@mui/material';
import { Download, Receipt, Visibility } from '@mui/icons-material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const RequestItems = () => {
    const [requestitems, setRequestItems] = useState<RequestItem[]>([]);
    const [filteredRequestItems, setFilteredRequestItems] = useState<RequestItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [openReceiveModal, setOpenReceiveModal] = useState(false);
    const [selectedRequestItem, setSelectedRequestItem] = useState<RequestItem | null>(null); // To store requestitem details
    const [hospitals, setHospitals] = useState([]); // Contact persons from API
    const [selectedHospital, setSelectedHospital] = useState(''); // Selected contact person
    const [firstName, setFirstName] = useState('');
    const [otherNames, setOtherNames] = useState('');
    const [email, setEmail] = useState(''); // Location state
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const requestId = searchParams.get('requestId');

    const [batchNumber, setBatchNumber] = useState('');
    const [quantityDispatched, setQuantityDispatched] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const [quantityReceived, setQuantityReceived] = useState('');
    // Modal style
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 3,
        borderRadius: '8px',
    };

    // Fetch requestitems from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drug-request/one-request/${requestId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log('Fetched data:', data); // Debugging line

                // Check if data is an array
                if (Array.isArray(data)) {
                    setRequestItems(data);
                    setFilteredRequestItems(data);
                } else {
                    console.error('Expected an array but got:', data);
                }
            } catch (error) {
                console.error('Error fetching request items:', error);
            }
        };

        fetchData();
    }, [requestId]);


    const handleProductDispatch = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const dispatchData = {
            batchNumber,
            quantityDispatched,
            expiryDate,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drug-request/dispatch/${selectedRequestItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dispatchData),
            });

            if (response.ok) {
                // Handle successful response (e.g., show a message or close the modal)
                handleCloseDetailsModal(); // Close the modal after submission
                router.refresh();
            } else {
                // Handle error response
                console.error('Error dispatching request');
            }
        } catch (error) {
            console.error('Error dispatching request:', error);
        }
    };




    const handleProductReceipt = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const receiveData = {
            quantityReceived: Number(quantityReceived),
            
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drug-request/receive/${selectedRequestItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(receiveData),
            });

            if (response.ok) {
                // Handle successful response (e.g., show a message or close the modal)
                handleCloseReceiveModal(); // Close the modal after submission
                router.refresh();
            } else {
                // Handle error response
                console.error('Error dispatching request');
            }
        } catch (error) {
            console.error('Error dispatching request:', error);
        }
    };


    // Handle search functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = requestitems.filter((requestitem) =>
            `${requestitem?.requestID}`.toLowerCase().includes(value) ||
            `${requestitem?.product?.productName}`.toLowerCase().includes(value)

        );
        setFilteredRequestItems(filtered);
        setCurrentPage(0);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    // Handle modal open/close for adding a requestitem
    const handleOpenAddModal = () => setOpenAddModal(true);
    const handleCloseAddModal = () => setOpenAddModal(false);

    // Handle opening the details modal
    const handleOpenDetailsModal = (requestitem: RequestItem) => {
        setSelectedRequestItem(requestitem);
        setOpenDetailsModal(true);
    };

    // Handle opening the details modal
    const handleOpenReceiveModal = (requestitem: RequestItem) => {
        setSelectedRequestItem(requestitem);
        setOpenReceiveModal(true);
    };

    const handleCloseDetailsModal = () => setOpenDetailsModal(false);
    const handleCloseReceiveModal = () => setOpenReceiveModal(false);

    // Handle form submission for adding a requestitem
    const handleAddRequestItem = async () => {
        const requestitemData = {
            firstName,
            otherNames,
            gender,
            email,
            phoneNumber,
            hospitalId: selectedHospital,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requestitems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestitemData),
            });

            if (response.ok) {
                const newRequestItem = await response.json();
                setRequestItems([...requestitems, newRequestItem]);
                setFilteredRequestItems([...requestitems, newRequestItem]);
                handleCloseAddModal();
            } else {
                console.error('Error adding requestitem');
            }
        } catch (error) {
            console.error('Error adding requestitem:', error);
        }
    };

    const paginatedRequestItems = filteredRequestItems?.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="Requested Drugs List" sx={{ width: '90%', height: '100%', overflow: 'hidden' }}>
            <Box
                display="flex"
                justifyContent="space-between"
                mb={2}
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={{ xs: 2, sm: 0 }}
            >
                {/* <Button variant="contained" onClick={handleOpenAddModal} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Add RequestItem
          </Button> */}
                <TextField
                    variant="outlined"
                    label="Search by Request ID or Drug Name"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
            </Box>

            <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>RequestID</TableCell>
                            <TableCell>Hospital</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell>Drug Name</TableCell>
                            <TableCell>Qty Requested</TableCell>
                            <TableCell>Qty Dispatched</TableCell>
                            <TableCell>Qty Received</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Date Created</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRequestItems?.map((requestitem) => (
                            <TableRow key={requestitem.requestID}>
                                <TableCell>{requestitem?.requestID}</TableCell>
                                <TableCell>{requestitem?.productRequestId.hospital.shortName} </TableCell>
                                <TableCell>{requestitem?.product.supplier.shortName}</TableCell>
                                <TableCell>{requestitem?.product?.productName} {requestitem?.product?.productDescription}</TableCell>
                                <TableCell align="center">{requestitem?.quantityRequested}</TableCell>
                                <TableCell align="center">{requestitem?.quantityDispatched || "0"}</TableCell>
                                <TableCell align="center">{requestitem?.quantityReceived || "0"}</TableCell>
                                <TableCell>
                                    <Chip
                                        sx={{
                                            backgroundColor:
                                                requestitem.status === 'cancelled'
                                                    ? 'error.main'
                                                    : requestitem.status === 'requested'
                                                        ? 'success.main'
                                                        : requestitem.status === 'received'
                                                            ? 'primary.main'
                                                            : requestitem.status === 'dispatched'
                                                                ? 'secondary.main'
                                                                : 'secondary.main',
                                            color: '#fff',
                                        }}
                                        size="small"
                                        label={
                                            requestitem?.status == 'cancelled' ? 'CANCELLED' :
                                                requestitem?.status == 'requested' ? 'REQUESTED' :
                                                    requestitem?.status == 'received' ? 'RECEIVED' :
                                                        requestitem?.status == 'dispatched' ? 'DISPATCHED' :
                                                            'N/A'}
                                    />
                                </TableCell>
                                <TableCell align="right">{/* Date Formatting */}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleOpenDetailsModal(requestitem)}>
                                        <Visibility />
                                    </IconButton>

                                    <IconButton onClick={() => handleOpenReceiveModal(requestitem)}>
                                        <Download />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <TablePagination
                component="div"
                count={filteredRequestItems.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Modal for Adding RequestItem */}
            <Modal open={openAddModal} onClose={handleCloseAddModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" mb={2}>
                        Add RequestItem
                    </Typography>
                    <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Other Names"
                        value={otherNames}
                        onChange={(e) => setOtherNames(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="hospital-label">Select Hospital</InputLabel>
                        <Select
                            labelId="hospital-label"
                            value={selectedHospital}
                            label="Select Hospital"
                            onChange={(e) => setSelectedHospital(e.target.value)}
                        >
                            {hospitals.map((hospital) => (
                                <MenuItem key={hospital.id} value={hospital.id}>
                                    {hospital.hospitalName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleAddRequestItem}>
                        Add Request Item
                    </Button>
                </Box>
            </Modal>

            {/* Modal for RequestItem Details */}
            {selectedRequestItem && (
                <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" mb={2}>
                            {`${selectedRequestItem?.product.productName} ${selectedRequestItem?.product.productDescription}`}
                        </Typography>

                        {/* Form Fields */}
                        <form onSubmit={handleProductDispatch}>
                            <TextField
                                fullWidth
                                label="Batch Number"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Quantity Requested"
                                value={selectedRequestItem?.quantityRequested}
                                aria-disabled
                            />
                            <br /><br />
                            {/* <p>Quantity Requested: {selectedRequestItem?.quantityRequested}</p> */}

                            <TextField
                                fullWidth
                                label="Quantity To Dispatch"
                                type="number"
                                value={quantityDispatched}
                                onChange={(e) => setQuantityDispatched(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Expiry Date"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                sx={{ mb: 2 }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </form>
                    </Box>
                </Modal>
            )}





            {/* Modal for RequestItem Details */}
            {selectedRequestItem && (
                <Modal open={openReceiveModal} onClose={handleCloseReceiveModal}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" mb={2}>
                            {`${selectedRequestItem?.product.productName} ${selectedRequestItem?.product.productDescription}`}
                        </Typography>

                        {/* Form Fields */}
                        <form onSubmit={handleProductReceipt}>
                     
<p>Batch Number:<b>{selectedRequestItem?.batchNumber}</b></p>
<p>Quantity Requested: <b>{selectedRequestItem?.quantityRequested}</b></p>
<p>Quantity Dispatched: <b>{selectedRequestItem?.quantityDispatched}</b></p>
                         

                            <TextField
                                fullWidth
                                label="Quantity Being Received"
                                type="number"
                                value={quantityReceived}
                                onChange={(e) => setQuantityReceived(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />
                          
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </form>
                    </Box>
                </Modal>
            )}




        </DashboardCard>
    );
};

export default RequestItems;
