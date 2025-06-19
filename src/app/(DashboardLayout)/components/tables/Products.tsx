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
    FormControl,
    InputLabel,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Product {
    productId: string;
    productName: string;
    productType: number;
    cost: number;
    status: string;
    product_type: {
        typeId: number;
        typeName: string;
    };
}

interface ProductType {
    typeId: number;
    typeName: string;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [productTypeFilter, setProductTypeFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [productName, setProductName] = useState("");
    const [productType, setProductType] = useState("");
    const [cost, setCost] = useState("");
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, productTypesResponse] = await Promise.all([
                    api.get('/products'),
                    api.get('/products/types'), // Adjust to '/products/types' if that's the correct endpoint
                ]);
                // Normalize cost to number
                const normalizedProducts = productsResponse.data.map((product: any) => ({
                    ...product,
                    cost: Number(product.cost), // Convert cost to number
                    productType: Number(product.productType), // Ensure productType is a number
                }));
                const sortedData = normalizedProducts.sort((a: Product, b: Product) => {
                    const nameCompare = a.productName.localeCompare(b.productName);
                    if (nameCompare !== 0) return nameCompare;
                    return a.productType - b.productType;
                });
                setProducts(sortedData);
                setFilteredProducts(sortedData);
                setProductTypes(productTypesResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter((product) =>
                product.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (productTypeFilter) {
            filtered = filtered.filter((product) => 
                product.productType === Number(productTypeFilter)
            );
        }
        setFilteredProducts(filtered);
        setCurrentPage(0);
    }, [searchTerm, productTypeFilter, products]);

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

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductName(product.productName);
            setProductType(product.productType.toString());
            setCost(product.cost.toString());
        } else {
            setEditingProduct(null);
            setProductName("");
            setProductType("");
            setCost("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setProductName("");
        setProductType("");
        setCost("");
        setEditingProduct(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!productName.trim() || !productType || !cost.trim()) {
            setError('All fields are required');
            setIsSubmitting(false);
            return;
        }
        const costValue = Number(cost);
        if (isNaN(costValue) || costValue < 0) {
            setError('Cost must be a valid non-negative number');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newProduct: Product;
            const payload = {
                productName,
                productType: Number(productType),
                cost: costValue,
            };
            if (editingProduct) {
                const response = await api.put(`/products/${editingProduct.productId}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newProduct = {
                        ...response.data,
                        cost: Number(response.data.cost), // Normalize cost
                        productType: Number(response.data.productType), // Normalize productType
                    };
                    if (!newProduct.productId || !newProduct.productName) {
                        throw new Error('Invalid response format: missing productId or productName');
                    }
                    const updatedProducts = [...products.map(d => 
                        d.productId === editingProduct.productId ? newProduct : d
                    )].sort((a, b) => {
                        const nameCompare = a.productName.localeCompare(b.productName);
                        if (nameCompare !== 0) return nameCompare;
                        return a.productType - b.productType;
                    });
                    setProducts(updatedProducts);
                    setFilteredProducts([...updatedProducts].filter(d => 
                        d.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!productTypeFilter || d.productType === Number(productTypeFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/products', payload);
                if (response.status >= 200 && response.status < 300) {
                    newProduct = {
                        ...response.data,
                        cost: Number(response.data.cost), // Normalize cost
                        productType: Number(response.data.productType), // Normalize productType
                    };
                    if (!newProduct.productId || !newProduct.productName) {
                        throw new Error('Invalid response format: missing productId or productName');
                    }
                    const updatedProducts = [...products, newProduct].sort((a, b) => {
                        const nameCompare = a.productName.localeCompare(b.productName);
                        if (nameCompare !== 0) return nameCompare;
                        return a.productType - b.productType;
                    });
                    setProducts(updatedProducts);
                    setFilteredProducts([...updatedProducts].filter(d => 
                        d.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (!productTypeFilter || d.productType === Number(productTypeFilter))
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
                (editingProduct ? 'Failed to update product' : 'Failed to add product')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/products/${productToDelete.productId}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedProducts = [...products.filter(d => 
                    d.productId !== productToDelete.productId
                )].sort((a, b) => {
                    const nameCompare = a.productName.localeCompare(b.productName);
                    if (nameCompare !== 0) return nameCompare;
                    return a.productType - b.productType;
                });
                setProducts(updatedProducts);
                setFilteredProducts([...updatedProducts].filter(d => 
                    d.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (!productTypeFilter || d.productType === Number(productTypeFilter))
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
                'Failed to delete product'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCost = (cost: number | string | undefined): string => {
    if (cost == null) return 'N/A';
    const numCost = Number(cost);
    return isNaN(numCost) ? 'Invalid' : `₦${numCost.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

    const paginatedProducts = filteredProducts.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="Products List">
            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add Product
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        variant="outlined"
                        label="Search by Product Name"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Product Type Filter</InputLabel>
                        <Select
                            value={productTypeFilter}
                            onChange={(e) => setProductTypeFilter(e.target.value)}
                            label="Product Type Filter"
                        >
                            <MenuItem value="">All Product Types</MenuItem>
                            {productTypes.map((type) => (
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
                                    Product Name
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Product Type
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Cost
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
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
                        {paginatedProducts.map((product) => (
                            <TableRow key={product.productId}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {product.productName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {product.product_type?.typeName || 'Unknown'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {formatCost(product.cost)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {product.status}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleOpenDeleteDialog(product)}
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
                count={filteredProducts.length}
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
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Product Type</InputLabel>
                            <Select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                label="Product Type"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Product Type</MenuItem>
                                {productTypes.map((type) => (
                                    <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Cost"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="number"
                            inputProps={{ min: 0, step: "0.01" }}
                            error={!!error}
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
                                disabled={isSubmitting || !productName.trim() || !productType || !cost.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update' : 'Add')}
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
                    {"Confirm Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the product "{productToDelete?.productName}"? This action cannot be undone.
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

export default Products;