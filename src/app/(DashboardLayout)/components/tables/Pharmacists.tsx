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

const Pharmacists = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [filteredPharmacists, setFilteredPharmacists] = useState<Pharmacist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
  const [openDetailsModal, setOpenDetailsModal] = useState(false); // Details modal state
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null); // To store pharmacist details
  const [hospitals, setHospitals] = useState([]); // Hospitals from API
  const [selectedHospital, setSelectedHospital] = useState(''); // Selected contact person
  const [firstName, setFirstName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [email, setEmail] = useState(''); // Location state
  // const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
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

  // Fetch pharmacists from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacists`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setPharmacists(data);
        setFilteredPharmacists(data);
      } catch (error) {
        console.error('Error fetching pharmacists:', error);
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
    const filtered = pharmacists.filter((pharmacist) =>
      `${pharmacist?.pharmacistName}`.toLowerCase().includes(value)
    );
    setFilteredPharmacists(filtered);
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

  // Handle modal open/close for adding a pharmacist
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Handle opening the details modal
  const handleOpenDetailsModal = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

  // Handle form submission for adding a pharmacist
  const handleAddPharmacist = async () => {
    const pharmacistData = {
      firstName,
      otherNames,
      gender: selectedGender,
      email,
      phoneNumber,
      hospitalId: selectedHospital,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pharmacistData),
      });

      if (response.ok) {
        const newPharmacist = await response.json();
        setPharmacists([...pharmacists, newPharmacist]);
        setFilteredPharmacists([...pharmacists, newPharmacist]);
        handleCloseAddModal();
      } else {
        console.error('Error adding pharmacist');
      }
    } catch (error) {
      console.error('Error adding pharmacist:', error);
    }
  };

  const paginatedPharmacists = filteredPharmacists?.slice(
    currentPage * recordsPerPage,
    currentPage * recordsPerPage + recordsPerPage
  );

  const genders = [
    {id: "1", gender: "Male"},
    {id: "2", gender: "Female"}
  ];

  return (
    <DashboardCard title="Pharmacists List">
      <Box
        display="flex"
        justifyContent="space-between"
        mb={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Button variant="contained" onClick={handleOpenAddModal} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Add Pharmacist
        </Button>
        <TextField
          variant="outlined"
          label="Search by Pharmacist Name"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Pharmacist Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Hospital</TableCell>
              {/* <TableCell>Status</TableCell> */}
              <TableCell align="center">Date Added</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPharmacists?.map((pharmacist) => (
              <TableRow key={pharmacist.id}>
                <TableCell>{`${pharmacist?.firstName} ${pharmacist?.otherNames}`}</TableCell>
                <TableCell>{pharmacist?.gender}</TableCell>
                <TableCell>{pharmacist?.hospitalId?.shortName}</TableCell>
                {/* <TableCell>
                  <Chip
                    sx={{
                      backgroundColor:
                        pharmacist.status === 'inactive'
                          ? 'error.main'
                          : pharmacist.status === 'active'
                          ? 'success.main'
                          : 'secondary.main',
                      color: '#fff',
                    }}
                    size="small"
                    label={pharmacist?.status || 'N/A'}
                  />
                </TableCell> */}
                <TableCell align="center">{new Date(pharmacist.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDetailsModal(pharmacist)}>
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
        count={filteredPharmacists.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={recordsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal for Adding Pharmacist */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box   sx={{ 
      ...modalStyle, 
      maxHeight: '80vh', // Set max height to 80% of the viewport height
      overflowY: 'auto' // Enable vertical scrolling
    }}
  >
          <Typography variant="h6" mb={2}>
            Add Pharmacist
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
       <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Gender</InputLabel>
  <Select
    value={selectedGender}
    onChange={(e) => setSelectedGender(e.target.value)}  
  >
    {genders.map((gender) => (
      <MenuItem key={gender.id} value={gender.gender}>
        {gender.gender} 
      </MenuItem>
    ))}
  </Select>
</FormControl>
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            sx={{ mb: 2 }}
            type='number'
          />
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            type='email'
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
          <Button variant="contained" color="primary" onClick={handleAddPharmacist}>
            Add Pharmacist
          </Button>
        </Box>
      </Modal>

      {/* Modal for Pharmacist Details */}
      {selectedPharmacist && (
        <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              Pharmacist Details
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {`${selectedPharmacist?.firstName} ${selectedPharmacist?.otherNames}`}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {selectedPharmacist?.userId?.email}
            </Typography>
            <Typography variant="body1">
              <strong>Gender:</strong> {selectedPharmacist?.gender}
            </Typography>
            <Typography variant="body1">
              <strong>Phone Number:</strong> {selectedPharmacist?.userId?.phoneNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Hospital:</strong> {selectedPharmacist?.hospitalId?.shortName}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {selectedPharmacist?.status}
            </Typography>
          </Box>
        </Modal>
      )}
    </DashboardCard>
  );
};

export default Pharmacists;
