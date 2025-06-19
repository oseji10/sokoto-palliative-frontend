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
import { Visibility } from '@mui/icons-material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from 'react';

const Stocks = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
  const [openDetailsModal, setOpenDetailsModal] = useState(false); // Details modal state
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null); // To store stock details
  const [hospitals, setHospitals] = useState([]); // Contact persons from API
  const [selectedHospital, setSelectedHospital] = useState(''); // Selected contact person
  const [firstName, setFirstName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [email, setEmail] = useState(''); // Location state
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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

  // Fetch stocks from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setStocks(data);
        setFilteredStocks(data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setHospitals(data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
  }, []);

  // Handle search functionality
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = stocks.filter((stock) =>
      `${stock?.stockName}`.toLowerCase().includes(value)
    );
    setFilteredStocks(filtered);
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

  // Handle modal open/close for adding a stock
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Handle opening the details modal
  const handleOpenDetailsModal = (stock: Stock) => {
    setSelectedStock(stock);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

  // Handle form submission for adding a stock
  const handleAddStock = async () => {
    const stockData = {
      firstName,
      otherNames,
      gender,
      email,
      phoneNumber,
      hospitalId: selectedHospital,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });

      if (response.ok) {
        const newStock = await response.json();
        setStocks([...stocks, newStock]);
        setFilteredStocks([...stocks, newStock]);
        handleCloseAddModal();
      } else {
        console.error('Error adding stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const paginatedStocks = filteredStocks?.slice(
    currentPage * recordsPerPage,
    currentPage * recordsPerPage + recordsPerPage
  );

  return (
    <DashboardCard title="Stocks List">
      <Box
        display="flex"
        justifyContent="space-between"
        mb={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={{ xs: 2, sm: 0 }}
      >
        {/* <Button variant="contained" onClick={handleOpenAddModal} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Add Stock
        </Button> */}
        <TextField
          variant="outlined"
          label="Search by Stock Name"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Stock ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell align='center'>Quantity Received</TableCell>
              <TableCell align='center'>Quantity in Stock</TableCell>
              <TableCell align="center">Date Suplied</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStocks?.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock?.stockId}</TableCell>
                <TableCell>{stock?.productId.productName} {stock?.productId.productDescription}</TableCell>
                  <TableCell align='center'>{stock?.quantityReceived}</TableCell>
                <TableCell align='center'>
                {`${(
  (Number(stock?.quantityReceived) || 0) -( 
  (Number(stock?.quantitySold) || 0) +
  (Number(stock?.quantityExpired) || 0) +
  (Number(stock?.quantityRetrieved) || 0) +
  (Number(stock?.quantityDamaged) || 0))
)}`}
                  
                </TableCell>
                <TableCell>{new Date(stock?.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      backgroundColor:
                        stock.status === 'inactive'
                          ? 'error.main'
                          : stock.status === 'active'
                          ? 'success.main'
                          : 'secondary.main',
                      color: '#fff',
                    }}
                    size="small"
                    label={stock?.status || 'N/A'}
                  />
                </TableCell>
                {/* <TableCell align="right">Date Formatting</TableCell> */}
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDetailsModal(stock)}>
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={filteredStocks.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={recordsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal for Adding Stock */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box   sx={{ 
      ...modalStyle, 
      maxHeight: '80vh', // Set max height to 80% of the viewport height
      overflowY: 'auto' // Enable vertical scrolling
    }}
  >
          <Typography variant="h6" mb={2}>
            Add Stock
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
          <Button variant="contained" color="primary" onClick={handleAddStock}>
            Add Stock
          </Button>
        </Box>
      </Modal>

      {/* Modal for Stock Details */}
      {selectedStock && (
        <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
            Drug ID: {selectedStock?.productId.shortName}<br/>
            Drug Name: {selectedStock?.productId.productName} {selectedStock?.productId.productDescription}<br/>
            Batch Number: {selectedStock?.batchNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Quantity Received:</strong> {selectedStock?.quantityReceived || "0"}
            </Typography>
            <Typography variant="body1">
              <strong>QuantitySold:</strong> {selectedStock?.quantitySold || "0"}
            </Typography>
            <Typography variant="body1">
              <strong>Quantity Retrieved:</strong> {selectedStock?.quantityRetrieved || "0"}
            </Typography>
            <Typography variant="body1">
              <strong>Quantity Damaged:</strong> {selectedStock?.quantityDamaged || "0"}
            </Typography>
            <Typography variant="body1">
              <strong>Quantity Expired:</strong> {selectedStock?.quantityExpired || "0"}
            </Typography>

            <Typography variant="body1">
              <strong>Quantity Available:</strong> <strong style={{color:'red'}}>{selectedStock?.quantityExpired || "0"}</strong>
            </Typography>

            <Typography variant="body1">
              <strong>Expiry Date:</strong> 
              {new Date(selectedStock?.expiryDate).toLocaleDateString()}
              {/* {selectedStock?.expiryDate || "0"} */}
            </Typography>
          </Box>
        </Modal>
      )}
    </DashboardCard>
  );
};

export default Stocks;
