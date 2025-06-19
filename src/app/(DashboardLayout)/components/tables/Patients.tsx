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
  import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
  import { useEffect, useState } from 'react';
import { Visibility } from '@mui/icons-material';
  
  const Patients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [open, setOpen] = useState(false); // Modal state
    const [stateOfOrigin, setStateOfOrigin] = useState([]); 
    const [stateOfResidence, setStateOfResidence] = useState([]); // Contact persons from API
    const [selectedStateOfOrigin, setSelectedStateOfOrigin] = useState(''); 
    const [selectedStateOfResidence, setSelectedStateOfResidence] = useState(''); 
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otherNames, setOtherNames] = useState(''); 
    const [openDetailsModal, setOpenDetailsModal] = useState(false); // Details modal state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [diseases, setDiseases] = useState([]); 
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('');
  
  const [hospitalFileNumber, setHospitalFileNumber] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState(''); 
  
    const [hospitals, setHospitals] = useState([]); // Contact persons from API
    const [selectedHospital, setSelectedHospital] = useState('');

    // Define the modal style for mobile responsiveness
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
  
    // Fetch patients from the API
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          const data = await response.json();
          console.log(data);
          setPatients(data); // Update state with the fetched data
          setFilteredPatients(data); // If you want to filter or manipulate the data later
        } catch (error) {
          console.error('Error fetching patients:', error);
        }
      };
  
      fetchData();
    }, []);
  
    
    useEffect(() => {
      const fetchStates = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/states`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setStateOfOrigin(data);
          setStateOfResidence(data);
        } catch (error) {
          console.error('Error fetching state of origin:', error);
        }
      };
  
      fetchStates();
    }, []);


    useEffect(() => {
      const fetchDiseases = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diseases`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setDiseases(data);
        } catch (error) {
          console.error('Error fetching diseases:', error);
        }
      };
  
      fetchDiseases();
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
  
      const filtered = patients.filter((patient) => {
        const firstName = `${patient?.firstName}`.toLowerCase();
        const lastName = `${patient?.lastName}`.toLowerCase();
        const otherNames = `${patient?.otherNames}`.toLowerCase();
        const phoneNumber = `${patient?.phoneNumber}`.toLowerCase();

        return (
            firstName.includes(value) ||
            lastName.includes(value) ||
            otherNames.includes(value) ||
            phoneNumber.includes(value) 
        );
      });
  
      setFilteredPatients(filtered);
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
  
    // Handle modal open/close
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
      // Handle opening the details modal
  const handleOpenDetailsModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

    // Handle form submission for adding a patient
    const handleAddPatient = async () => {
      const patientData = {
        firstName,
        lastName,
        otherNames,
        email,
        phoneNumber,
        stateOfOrigin: selectedStateOfOrigin,
        stateOfResidence: selectedStateOfResidence,
        diseaseType: selectedDisease,
        gender: selectedGender,
        maritalStatus: selectedMaritalStatus,
        hospitalFileNumber,
        hospitalId: selectedHospital,

      };
  
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData),
        });
  
        if (response.ok) {
          const newPatient = await response.json();
          setPatients([...patients, newPatient]); // Add new patient to the list
          setFilteredPatients([...patients, newPatient]);
          handleClose(); // Close the modal after successful submission
        } else {
          console.error('Error adding patient');
        }
      } catch (error) {
        console.error('Error adding patient:', error);
      }
    };
  
    // Pagination logic
    const paginatedPatients = filteredPatients.slice(
      currentPage * recordsPerPage,
      currentPage * recordsPerPage + recordsPerPage
    );
  
    const genders = [
      {id: "1", gender: "Male"},
      {id: "2", gender: "Female"}
    ];

    const maritalStatuses = [
      {id: "1", status: "Married"},
      {id: "2", status: "Single"},
      {id: "3", status: "Divorced"},
      {id: "4", status: "Widow"},
      {id: "5", status: "Widower"},
    ]
    return (
      <DashboardCard title="Patients List">
        <Box
          display="flex"
          justifyContent="space-between"
          mb={2}
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 2, sm: 0 }}
        >
          <Button
            variant="contained"
            onClick={handleOpen}
            disableElevation
            color="primary"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Add Patient
          </Button>
          <TextField
            variant="outlined"
            label="Search by ID, Name, Phone, Email"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>
  
        {/* Table wrapper for horizontal scrolling on smaller screens */}
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Unique ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Patient Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Hospital
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Gender
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Enrolled
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                      {patient.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={600}>
                      {patient?.firstName} {patient?.lastName} {patient?.otherNames}
                    </Typography>
                  </TableCell>
  
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {patient?.hospital?.shortName} 
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {patient?.gender} 
                    </Typography>
                  </TableCell>
  
                  <TableCell>
                    <Chip
                      sx={{
                        px: '4px',
                        backgroundColor:
                          patient.status === 'inactive'
                            ? 'error.main'
                            : patient.status === 'active'
                            ? 'success.main'
                            : 'secondary.main',
                        color: '#fff',
                      }}
                      size="small"
                      label={patient?.status || 'N/A'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">{new Date(patient?.createdAt).toLocaleDateString()}</Typography>
                  </TableCell>

                  <TableCell align="center">
                  <IconButton onClick={() => handleOpenDetailsModal(patient)}>
                    <Visibility />
                  </IconButton>
                </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
  
        {/* Pagination component */}
        <TablePagination
          component="div"
          count={filteredPatients.length}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={recordsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
  
        {/* Modal for Adding Patient */}
        <Modal open={open} onClose={handleClose}>
          <Box   sx={{ 
      ...modalStyle, 
      maxHeight: '80vh', // Set max height to 80% of the viewport height
      overflowY: 'auto' // Enable vertical scrolling
    }}
  >
            <Typography variant="h6" mb={2}>
              Add Patient
            </Typography>

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

            <TextField
              fullWidth
              label="Hospital Number"
              value={hospitalFileNumber}
              onChange={(e) => setHospitalFileNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

<TextField
              fullWidth
              label="Mobile Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              sx={{ mb: 2 }}
            />

<TextField
              fullWidth
              label="Date of Birth"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              sx={{ mb: 2 }}
              type='date'
            />
  
  <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select State Of Origin</InputLabel>
  <Select
    value={selectedStateOfOrigin}
    onChange={(e) => setSelectedStateOfOrigin(e.target.value)}  // Check if this updates correctly
  >
    {stateOfOrigin.map((state) => (
      <MenuItem key={state.id} value={state.id}>
        {state.stateName} 
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select State Of Residence</InputLabel>
  <Select
    value={selectedStateOfResidence}
    onChange={(e) => setSelectedStateOfResidence(e.target.value)}  // Check if this updates correctly
  >
    {stateOfResidence.map((state) => (
      <MenuItem key={state.id} value={state.id}>
        {state.stateName} 
      </MenuItem>
    ))}
  </Select>
</FormControl>


<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Disease Type</InputLabel>
  <Select
    value={selectedDisease}
    onChange={(e) => setSelectedDisease(e.target.value)}  // Check if this updates correctly
  >
    {diseases.map((disease) => (
      <MenuItem key={disease.id} value={disease.id}>
        {disease.diseaseName} 
      </MenuItem>
    ))}
  </Select>
</FormControl>


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
  

<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Marital Status</InputLabel>
  <Select
    value={selectedMaritalStatus}
    onChange={(e) => setSelectedMaritalStatus(e.target.value)}  // Check if this updates correctly
  >
    {maritalStatuses.map((maritalStatus) => (
      <MenuItem key={maritalStatus.id} value={maritalStatus.status}>
        {maritalStatus.status} 
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
                onClick={handleAddPatient}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Modal>


       { /* Modal for Pharmacist Details */}
      {selectedPatient && (
        <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
          <Box sx={{
            ...modalStyle,
            maxHeight: '80vh', // Set max height to 80% of the viewport height
            overflowY: 'auto'
          }}>
            <Typography variant="h6" mb={2}>
              Patient Details
            </Typography>
            <Typography variant="body1">
              <strong>Patient ID:</strong> {selectedPatient?.id}
            </Typography>

            <Typography variant="body1">
              <strong>Hospital Number:</strong> {selectedPatient?.hospitalFileNumber}
            </Typography>

            <Typography variant="body1">
              <strong>Name:</strong> {`${selectedPatient?.firstName} ${selectedPatient?.lastName} ${selectedPatient?.otherNames}`}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {selectedPatient?.user?.email}
            </Typography>
            <Typography variant="body1">
              <strong>Phone Number:</strong> {selectedPatient?.user?.phoneNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Gender:</strong> {selectedPatient?.gender}
            </Typography>
            <Typography variant="body1">
              <strong>Hospital:</strong> {selectedPatient?.hospital?.shortName}
            </Typography>

            <Typography variant="body1">
              <strong>Cancer Type:</strong> {selectedPatient?.diseaseType?.diseaseName}
            </Typography>

            <Typography variant="body1">
              <strong>State of Origin:</strong> {selectedPatient?.stateOfOrigin?.stateName}
            </Typography>

            <Typography variant="body1">
              <strong>State of Residence:</strong> {selectedPatient?.stateOfResidence?.stateName}
            </Typography>

            <Typography variant="body1">
              <strong>Marital Status:</strong> {selectedPatient?.maritalStatus}
            </Typography>

            <Typography variant="body1">
              <strong>Status:</strong> {selectedPatient?.status}
            </Typography>
          </Box>
        </Modal>
      )}
      </DashboardCard>
    );
  };
  
  export default Patients;
  