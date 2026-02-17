import { useEffect, useState } from "react";
import axios from "axios";
import SupplierConnectCard from "../components/SupplierConnectCard";

export default function SuppliersPage() {

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    const res = await axios.get("/api/core/suppliers");
    setSuppliers(res.data);
  };

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Suppliers
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {suppliers.map(s => (
          <SupplierConnectCard
            key={s.supplierId}
            supplier={s}
          />
        ))}

      </div>

    </div>
  );
}