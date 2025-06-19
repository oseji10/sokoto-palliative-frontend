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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from "react";
import { IconEdit, IconEye } from '@tabler/icons-react';
// import Router from 'next/navigation';
import { useRouter, useSearchParams } from 'next/navigation';

const PricelistProducts = () => {
    const [pricelist, setPricelist] = useState(null); // Store the entire pricelist object
    
    const [pricelistproducts, setPricelistProducts] = useState<PricelistProduct[]>([]);
    const [filteredPricelistProducts, setFilteredPricelistProducts] = useState<PricelistProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedPricelistProduct, setSelectedPricelistProduct] = useState<Pharmacist | null>(null);
    const [pricelistproductName, setPricelistProductName] = useState("");
    const [file, setFile] = useState(null);
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    // const { pricelistId } = router.query;
    // const [id, setId] = useState(null);
    const searchParams = useSearchParams();
    const pricelistId = searchParams.get('pricelistId');

    const [landedCost, setLandedCost] = useState('');
    const [hospitalMarkup, setHospitalMarkup] = useState('');
    const [supplierMarkup, setSuppliermarkup] = useState('');
    const [consultantMarkup, setConsultantMarkup] = useState('');
    const [bankCharges, setBankCharges] = useState('');
    const [otherCharges, setOtherCharges] = useState('');

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelists/${pricelistId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log(data);
                setPricelist(data); // Set the whole pricelist object
                setPricelistProducts(data.pricelist_products); // Set the products array
                setFilteredPricelistProducts(data.pricelist_products); // Initially, show all products
            } catch (error) {
                console.error("Error fetching pricelistproducts:", error);
            }
        };

        fetchData();
    }, [pricelistId]);



      // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drugs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // console.log("JJ", data)
        setProducts(data);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    };

    fetchProducts();
  }, []);





    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = pricelistproducts.filter((product) => {
            // Assuming you want to search through product name or product id
            return product?.productId?.productName.toLowerCase().includes(value) 
                //    product?.uploadedBy?.email?.toLowerCase().includes(value);
        });

        setFilteredPricelistProducts(filtered);
        setCurrentPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const paginatedPricelistProducts = filteredPricelistProducts.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    const handleOpenDetailsModal = (pricelistproduct) => {
        setSelectedPricelistProduct(pricelistproduct);
        setOpenDetailsModal(true);
    };

    const handleOpenEditModal = (pricelistproduct) => {
        setSelectedPricelistProduct(pricelistproduct);
        setPricelistProductName(pricelistproduct?.uploadedBy?.email || "");
        setOpenEditModal(true);
    };

    const handleCloseDetailsModal = () => setOpenDetailsModal(false);
    const handleCloseEditModal = () => setOpenEditModal(false);
    const handleCloseAddModal = () => setOpenAddModal(false);
    const handleCloseBulkUploadModal = () => setOpenBulkUploadModal(false);

    const handleEditPricelistProduct = async () => {
        const updatedData = {
            ...selectedPricelistProduct,
            productName: pricelistproductName,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelistproducts/${selectedPricelistProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                const updatedProducts = pricelistproducts.map(product => product.id === updatedProduct.id ? updatedProduct : product);
                setPricelistProducts(updatedProducts);
                setFilteredPricelistProducts(updatedProducts);
                handleCloseEditModal();
            } else {
                console.error('Error updating pricelistproduct');
            }
        } catch (error) {
            console.error('Error updating pricelistproduct:', error);
        }
    };

    const handleAddPricelistProduct = async () => {
        const pricelistproductData = {
            productId: selectedProduct, // Add any required fields
            pricelistId,
            landedCost,
            hospitalMarkup,
            supplierMarkup,
            consultantMarkup,
            bankCharges,
            // otherCharges,
        };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelist_products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(pricelistproductData),
            });
      
            if (response.ok) {
              const newPricelistProducts = await response.json();
              setPricelistProducts([...pricelistproducts, newPricelistProducts]);
              setFilteredPricelistProducts([...pricelistproducts, newPricelistProducts]);
              handleCloseAddModal();
                router.refresh();
            } else {
              console.error('Error adding price');
            }
          } catch (error) {
            console.error('Error adding price:', error);
          }

          
        handleCloseAddModal();
        router.refresh();
    };

    const handleBulkUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricelist_products/upload_file`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully!');
                setFile(null); // Reset the file state
                handleCloseBulkUploadModal();
                router.refresh();
            } else {
                console.error('Error uploading file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
<DashboardCard title="Drugs Prices">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button variant="contained" onClick={() => setOpenAddModal(true)} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    Add Pricelist Product
                </Button>
                <Button variant="contained" onClick={() => setOpenBulkUploadModal(true)} disableElevation color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    Bulk Upload Pricelist
                </Button>
                <TextField
                    variant="outlined"
                    label="Search by Product ID or Uploaded By"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                />
            </Box>

            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table aria-label="simple table" sx={{ whiteSpace: "nowrap", mt: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Product ID</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Product Details</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Price To Patient</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Status</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Date Created</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Action</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPricelistProducts.map((pricelistproduct) => (
                            <TableRow key={pricelistproduct.id}>
                                <TableCell><Typography sx={{ fontSize: "15px", fontWeight: "500" }}>{pricelistproduct?.productId?.shortName}</Typography></TableCell>
                                <TableCell><Typography sx={{ fontSize: "15px", fontWeight: "500" }}>{pricelistproduct?.productId?.productName} {pricelistproduct?.productId?.productDescription} {pricelistproduct?.productId?.formulation}</Typography></TableCell>
                                <TableCell>
                                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                                    {`₦${(
  (Number(pricelistproduct?.landedCost) || 0) + 
  (Number(pricelistproduct?.supplierMarkup) || 0) +
  (Number(pricelistproduct?.hospitalMarkup) || 0) +
  (Number(pricelistproduct?.consultantMarkup) || 0) +
  (Number(pricelistproduct?.bankCharges) || 0)
).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}


                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        sx={{
                                            px: "4px",
                                            backgroundColor: pricelistproduct.status === "inactive" ? "error.main" : "success.main",
                                            color: "#fff",
                                        }}
                                        size="small"
                                        label={pricelistproduct?.status || "N/A"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography>{new Date(pricelistproduct.createdAt).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconEye 
                                        style={{ cursor: 'pointer', marginRight: '8px' }} 
                                        onClick={() => handleOpenDetailsModal(pricelistproduct)} 
                                    />
                                    <IconEdit 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleOpenEditModal(pricelistproduct)} 
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <TablePagination
                component="div"
                count={filteredPricelistProducts.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        {/* </DashboardCard> */}

          {/* Modal for Adding Price List */}
<Modal open={openAddModal} onClose={handleCloseAddModal}>
  <Box 
    sx={{ 
      ...modalStyle, 
      maxHeight: '80vh', // Set max height to 80% of the viewport height
      overflowY: 'auto' // Enable vertical scrolling
    }}
  >
    <Typography variant="h6" mb={2}>Add Price List</Typography>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="product-label">Product Name</InputLabel>
      <Select
        labelId="hospital-label"
        value={selectedProduct}
        label="Select Hospital"
        onChange={(e) => setSelectedProduct(e.target.value)}
      >
        {products.map((product) => (
          <MenuItem key={product.id} value={product.id}>
            {product.productName} {product.productDescription}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Landed Cost"
      value={landedCost}
      onChange={(e) => setLandedCost(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    />

    {/* <TextField
      fullWidth
      label="Landed Cost"
      value={landedCost}
      onChange={(e) => setLandedCost(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    /> */}

    <TextField
      fullWidth
      label="Hospital Markup"
      value={hospitalMarkup}
      onChange={(e) => setHospitalMarkup(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    />

    <TextField
      fullWidth
      label="Supplier Markup"
      value={supplierMarkup}
      onChange={(e) => setSuppliermarkup(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    />

    <TextField
      fullWidth
      label="Consultant Markup"
      value={consultantMarkup}
      onChange={(e) => setConsultantMarkup(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    />

    <TextField
      fullWidth
      label="Bank Charges"
      value={bankCharges}
      onChange={(e) => setBankCharges(e.target.value)}
      sx={{ mb: 2 }}
      type='number'
    />

    {/* <TextField
    type='number'
      fullWidth
      label="Other Charges"
      value={otherCharges}
      onChange={(e) => setOtherCharges(e.target.value)}
      sx={{ mb: 2 }}
    /> */}

    <Button variant="contained" color="primary" onClick={handleAddPricelistProduct}>
      Add Pricing
    </Button>
  </Box>
</Modal>

            {/* Modal for Bulk Upload */}
            <Modal open={openBulkUploadModal} onClose={handleCloseBulkUploadModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" mb={2}>Bulk Upload Price List</Typography>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ marginBottom: '16px' }}
                    />
                    <Button variant="contained" color="primary" onClick={handleBulkUpload} disabled={!file}>
                        Upload
                    </Button>
                </Box>
            </Modal>

            {/* Modal for Viewing Details */}
            <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" mb={2}>Product Details</Typography>
                    <Typography><strong>Product ID:</strong> {selectedPricelistProduct?.productId?.shortName}</Typography>
                    <Typography><strong>Product Name:</strong> {selectedPricelistProduct?.productId?.productName} {selectedPricelistProduct?.productId?.productDescription} {selectedPricelistProduct?.productId?.formulation}</Typography>
                    {/* <Typography><strong>Landed Cost:</strong>  {selectedPricelistProduct?.landedCost !== undefined ? `₦${selectedPricelistProduct?.landedCost?.toFixed(2)}` : 'N/A'}</Typography> */}
                    {/* <Typography><strong>Supplier Markup:</strong>  {selectedPricelistProduct?.supplierMarkup !== undefined ? `₦${selectedPricelistProduct?.supplierMarkup.toFixed(2)}` : 'N/A'}</Typography> */}
                    {/* <Typography><strong>Hospital Markup:</strong>  {selectedPricelistProduct?.hospitalMarkup !== undefined ? `₦${selectedPricelistProduct?.hospitalMarkup.toFixed(2)}` : 'N/A'}</Typography>
                    <Typography><strong>Consultant Markup:</strong>  {selectedPricelistProduct?.consultantMarkup !== undefined ? `₦${selectedPricelistProduct?.consultantMarkup.toFixed(2)}` : 'N/A'}</Typography>
                    <Typography><strong>Bank Charges:</strong>  {selectedPricelistProduct?.bankCharges !== undefined ? `₦${selectedPricelistProduct.bankCharges.toFixed(2)}` : 'N/A'}</Typography> */}
                    {/* <Typography><strong>Other Charges:</strong>  {selectedPricelistProduct?.otherCharges !== undefined ? `₦${selectedPricelistProduct.otherCharges.toFixed(2)}` : 'N/A'}</Typography> */}
                    <Typography><strong>Status:</strong> {selectedPricelistProduct?.status}</Typography>
                    <Typography><strong>Date Created:</strong> {selectedPricelistProduct?.createdAt}</Typography>
                </Box>
            </Modal>

            {/* Modal for Editing */}
            <Modal open={openEditModal} onClose={handleCloseEditModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" mb={2}>Edit Price List</Typography>
                    <TextField
                        fullWidth
                        label="Product Name"
                        value={pricelistproductName}
                        onChange={(e) => setPricelistProductName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleEditPricelistProduct}>
                        Save Changes
                    </Button>
                </Box>
            </Modal>
        </DashboardCard>
    );
};

export default PricelistProducts;
