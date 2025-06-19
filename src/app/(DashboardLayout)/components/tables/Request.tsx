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
    Modal,
    MenuItem,
    InputLabel,
    FormControl,
    Select
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

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

const Requests = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
    const [suppliers, setSuppliers] = useState<Request[]>([]);
    const [hospitals, setHospitals] = useState<Request[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [requestId, setRequestId] = useState("");
    const [requestName, setRequestName] = useState("");
    const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Pharmacist | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Pharmacist | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const router = useRouter();

  const [products, setProducts] = useState([]);
//   const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  
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
    // Fetch requests from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                setRequests(data); // Update state with the fetched data
                setFilteredRequests(data); // If you want to filter or manipulate the data later
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only once after component mounts



          // Fetch suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    };

    fetchSuppliers();
  }, []);


    // Handle search functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = requests.filter((request) => {
            const requestName = `${request?.requestName}`.toLowerCase();
            return (
                requestName.includes(value)
            );
        });

        setFilteredRequests(filtered);
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
    const paginatedRequests = filteredRequests.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );



      // Handle modal open/close for adding a request
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Handle opening the details modal
  const handleOpenDetailsModal = (request: request) => {
    setSelectedRequest(request);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

  // Handle form submission for adding a request
//   const handleAddRequest = async () => {
//     const requestData = {
//       requestId,
//       requestName,
//     //   selectedSupplier
      
//     };

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drug-request/new-request`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestData),
//       });

//       if (response.ok) {
//         const newrequest = await response.json();
//         setRequests([...requests, newrequest]);
//         setFilteredRequests([...requests, newrequest]);
//         handleCloseAddModal();
//         router.refresh();
//       } else {
//         console.error('Error adding request');
//       }
//     } catch (error) {
//       console.error('Error adding request:', error);
//     }
//   };


      // Fetch products for dropdown
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


  // Fetch products based on selected supplier
  const handleSupplierChange = async (supplierId) => {
    setSelectedSupplier(supplierId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drugs/supplier/${supplierId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Add to cart functionality
  const addToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
        const cartItem = {
            product: { id: selectedProduct },
            productName: product.productName, // Include product name
            productDescription: product.productDescription, // Include product description
            quantityRequested: quantity,
            requestedBy: { id: "5d3c6bb8-7345-4963-bd94-8860edefb832" },
        };
        setCart([...cart, cartItem]);
        setQuantity(1);  // Reset quantity for next item
    } else {
        console.error('Selected product not found.');
    }
};


const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
};

  
  const handleAddRequest = async () => {
    try {
      // Format the data according to the API requirements
      const requestData = {
        productRequest: {
          hospital: { id: selectedHospital }  // Assuming you have hospitalId from state or context
        },
        productRequestItems: cart,  // Use the cart directly as the array of items
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drug-request/new-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),  // Send formatted request data
      });
      
      if (response.ok) {
        console.log("Request submitted successfully");
        setCart([]);  // Clear the cart after successful submission
        setOpenAddModal(false);
        router.refresh();
      } else {
        console.error("Error submitting request");
      }
    } catch (error) {
      console.error('Error submitting cart:', error);
    }
  };
  

    return (
        <DashboardCard title="Drug Requests">
            <Box display="flex" justifyContent="space-between" mb={2}>
            <Button variant="contained" onClick={handleOpenAddModal} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          New Request
        </Button>
        
                &nbsp;
                <TextField
                    variant="outlined"
                    label="Search by Request Name"
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
                                    Request ID
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Hospital Name
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Date Created
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
                        {paginatedRequests.map((request) => (
                            <TableRow key={request.id}>

                                <TableCell>
                                    <Typography>
                                        {request?.requestID}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {request?.hospital?.hospitalName}
                                    </Typography>
                                </TableCell>




                                


                                <TableCell>
                                    <Chip
                                        sx={{
                                            px: "4px",
                                            backgroundColor:
                                                request.status === "inactive"
                                                    ? "error.main"

                                                    : request.status === "active"
                                                        ? "success.main"
                                                        : !request.status
                                                            ? "secondary.main"
                                                            : "secondary.main",
                                            color: "#fff",
                                        }}
                                        size="small"
                                        label={request?.status || "N/A"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {/* {request?.createdAt} */}
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                       <Link
                                       href={`/requests/request-items?requestId=${request.requestID}`}
                                       >
                                       View
                                       </Link> 
                                        {/* {request?.status} */}
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
                count={filteredRequests.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

          
      {/* Modal for Adding Request */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box sx={{
           ...modalStyle, 
           maxHeight: '80vh', // Set max height to 80% of the viewport height
           overflowY: 'auto',
        }}>
          <Typography variant="h6" mb={2}>Add New Request</Typography>


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

          {/* Select Supplier */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="supplier-label">Select Supplier</InputLabel>
            <Select
              labelId="supplier-label"
              value={selectedSupplier}
              label="Select Supplier"
              onChange={(e) => handleSupplierChange(e.target.value)}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select Product */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="product-label">Select Product</InputLabel>
            <Select
              labelId="product-label"
              value={selectedProduct}
              label="Select Product"
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={!products.length}  // Disable if no products are available
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.productName} {product.productDescription}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity Input */}
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Add to Cart Button */}
          <Button fullWidth variant="contained" color="primary" onClick={addToCart}>
            Add to Cart
          </Button>

          {/* Display Cart */}
<Box mt={2}>
    <Typography variant="subtitle1">Cart:</Typography>
    {cart.map((item, index) => (
        <Box key={index} display="flex" justifyContent="space-between" mb={1}>
            <Typography>{item.productName} - {item.productDescription}</Typography>
            <Box display="flex" alignItems="center">
                <Typography>{item.quantityRequested}</Typography>
                <IconButton
                    aria-label="delete"
                    onClick={() => removeFromCart(index)}  // Call the remove function on click
                    size="small"
                    sx={{ ml: 1 }}  // Margin left for spacing
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    ))}
</Box>


          {/* Submit Cart */}
          <Button fullWidth variant="contained" color="secondary" onClick={handleAddRequest} sx={{ mt: 2 }}>
            Submit Request
          </Button>
        </Box>
      </Modal>

        </DashboardCard>
    );
};

export default Requests;
