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
    Modal
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from "react";
import Link from 'next/link';
// import Modal from '@mui/material';
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

const Pricelists = () => {
    const [pricelists, setPricelists] = useState<Pricelist[]>([]);
    const [filteredPricelists, setFilteredPricelists] = useState<Pricelist[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [pricelistId, setPricelistId] = useState("");
    const [pricelistName, setPricelistName] = useState("");
    const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedPricelist, setSelectedPricelist] = useState<Pharmacist | null>(null);
    // Set how many records you want per page
    // const token = Cookies.get('token'); // Retrieve the token from cookies
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
    // Fetch pricelists from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelists`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                setPricelists(data); // Update state with the fetched data
                setFilteredPricelists(data); // If you want to filter or manipulate the data later
            } catch (error) {
                console.error("Error fetching pricelists:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only once after component mounts


    // Handle search functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = pricelists.filter((pricelist) => {
            const pricelistName = `${pricelist?.pricelistName}`.toLowerCase();
            return (
                pricelistName.includes(value)
            );
        });

        setFilteredPricelists(filtered);
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
    const paginatedPricelists = filteredPricelists.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );



      // Handle modal open/close for adding a pricelist
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Handle opening the details modal
  const handleOpenDetailsModal = (pricelist: pricelist) => {
    setSelectedPricelist(pricelist);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

  // Handle form submission for adding a pricelist
  const handleAddPriceList = async () => {
    const pricelistData = {
      pricelistId,
      pricelistName,
      
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricelistData),
      });

      if (response.ok) {
        const newpricelist = await response.json();
        setPricelists([...pricelists, newpricelist]);
        setFilteredPricelists([...pricelists, newpricelist]);
        handleCloseAddModal();
      } else {
        console.error('Error adding pricelist');
      }
    } catch (error) {
      console.error('Error adding pricelist:', error);
    }
  };

    return (
        <DashboardCard title="Pricelist List">
            <Box display="flex" justifyContent="space-between" mb={2}>
            <Button variant="contained" onClick={handleOpenAddModal} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Add Pricelist
        </Button>
        
                &nbsp;
                <TextField
                    variant="outlined"
                    label="Search by Pricelist Name"
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
                                    List ID
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Pricelist Name
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            <TableCell >
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Date Added
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Action
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPricelists.map((pricelist) => (
                            <TableRow key={pricelist.id}>

                                <TableCell>
                                    <Typography>
                                        {pricelist.pricelistId}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {pricelist.pricelistName}
                                    </Typography>
                                </TableCell>




                                


                                <TableCell>
                                    <Chip
                                        sx={{
                                            px: "4px",
                                            backgroundColor:
                                                pricelist.status === "inactive"
                                                    ? "error.main"

                                                    : pricelist.status === "active"
                                                        ? "success.main"
                                                        : !pricelist.status
                                                            ? "secondary.main"
                                                            : "secondary.main",
                                            color: "#fff",
                                        }}
                                        size="small"
                                        label={pricelist?.status || "N/A"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                    <Typography variant="h6">{new Date(pricelist?.createdAt).toLocaleDateString()}</Typography>
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                       <Link
                                       href={`/pricelists/pricelists_products?pricelistId=${pricelist.id}`}
                                       >
                                       View
                                       </Link> 
                                        {/* {pricelist?.status} */}
                                    </Typography>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Pagination component */}
            <TablePagination
                component="div"
                count={filteredPricelists.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Modal for Adding Price List */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Add Price List
          </Typography>
          <TextField
            fullWidth
            label="Pricelist ID"
            value={pricelistId}
            onChange={(e) => setPricelistId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Pricelist Name"
            value={pricelistName}
            onChange={(e) => setPricelistName(e.target.value)}
            sx={{ mb: 2 }}
          />
         
          <Button variant="contained" color="primary" onClick={handleAddPriceList}>
            Add pricelist
          </Button>
        </Box>
      </Modal>


        </DashboardCard>
    );
};

export default Pricelists;
