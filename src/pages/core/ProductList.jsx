import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/api/core/products');
            // Backend returns a Page object, so we access .content
            setProducts(res.data.content || []);
        } catch (err) {
            console.error("Failed to load products", err);
        }
    };

    return (
        <div className="p-6">
            <Card className="shadow-lg border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Product Catalog</CardTitle>
                    {(userRole === 'MANAGER' || userRole === 'PROCUREMENT_OFFICER') && (
                        <Button onClick={() => {/* Open Create Modal */}}>
                            Add New Product
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b bg-slate-50">
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">SKU</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Product Name</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Category</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Price</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Description</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(product => (
                            <tr key={product.productId} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm">{product.sku}</td>
                                <td className="p-4 font-semibold">{product.name}</td>
                                <td className="p-4 text-sm">{product.category || 'Uncategorized'}</td>
                                <td className="p-4 text-sm">${product.unitPrice?.toFixed(2)}</td>
                                <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                                    {product.description || 'No description available'}
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <Button variant="outline" size="sm">View</Button>
                                    {userRole === 'PROCUREMENT_OFFICER' && (
                                        <Button variant="destructive" size="sm">Delete</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductList;