import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../lib/axios';
import NavbarAdmin from '../component/NavbarAdmin';
import toast from 'react-hot-toast';
import RegisterPaymentModal from '../component/RegisterPaymentModal';

export default function CustomerAccountPage() {
  const { id } = useParams();
  const customerId = id;

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
  const [interestPercentage, setInterestPercentage] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  const fetchData = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        axios.get(`/api/customers/${customerId}`, authHeader),
        axios.get('/api/sales', { params: { customerId }, ...authHeader }),
      ]);
      setCustomer(cRes.data || null);
      setSales(sRes.data || []);
    } catch (err) {
      console.error('Error cargando cuenta', err);
      toast.error('No se pudo cargar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [customerId]);

  // TOTAL de todas las ventas
  const totalCuenta = sales.reduce((acc, s) => acc + (Number(s.total || 0)), 0);

  useEffect(() => {
    if (interestPercentage === '' || isNaN(interestPercentage)) {
      setFinalAmount(totalCuenta);
      return;
    }
    
    const interest = parseFloat(interestPercentage);
    if (interest >= 0) {
      const amountWithInterest = totalCuenta * (1 + interest / 100);
      setFinalAmount(amountWithInterest);
    } else {
      setFinalAmount(totalCuenta);
    }
  }, [interestPercentage, totalCuenta]);

  const openPayment = (sale) => { 
    setSelectedSale(sale); 
    setShowPaymentModal(true); 
  };
  
  const onPaymentSaved = () => { 
    setShowPaymentModal(false); 
    setSelectedSale(null); 
    fetchData(); 
  };

  const handleFullPayment = async () => {
    if (!window.confirm(`¿Confirmar pago completo de ${finalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}?`)) {
      return;
    }
    if (!window.confirm('⚠️ ¿ESTÁ SEGURO?\n\nAl confirmar el pago completo, se borrará todo el historial de ventas de esta cuenta y se creará una nueva cuenta en ceros.\n\nEsta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`/api/customers/${customerId}/sales`, authHeader);
      
      toast.success(`Pago completo registrado por ${finalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}. Historial borrado.`);
      setShowFullPaymentModal(false);
      setInterestPercentage('');
      setSales([]);
    } catch (err) {
      console.error('Error borrando historial de ventas', err);
      toast.error('No se pudo borrar el historial de ventas');
    }
  };

  const openFullPaymentModal = () => {
    setShowFullPaymentModal(true);
    setInterestPercentage('');
    setFinalAmount(totalCuenta);
  };

  // --- Nuevo: ver detalle de venta ---
  const openSaleDetail = async (saleId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`/api/sales/${saleId}`, authHeader);
      setSaleDetail(res.data);
      setShowSaleDetail(true);
    } catch (err) {
      console.error('Error obteniendo detalle de venta', err);
      toast.error('No se pudo cargar el detalle de la venta');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      <NavbarAdmin />
      <div className="max-w-5xl mx-auto p-6">
        <Link to="/cuentas" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Volver a clientes
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cuenta del cliente</h1>

        {loading && <div className="text-gray-500">Cargando...</div>}

        {!loading && customer && (
          <>
            {/* Info del Cliente */}
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{customer.nombre}</h2>
                  <div className="text-sm text-gray-500">{customer.email} · {customer.telefono}</div>
                </div>
              </div>
            </div>

            {/* Total de Cuenta */}
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de la Cuenta</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {Number(totalCuenta).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Suma total de todas las ventas
                  </p>
                </div>
                
                <button 
                  onClick={openFullPaymentModal}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg"
                >
                  💰 Confirmar Pago
                </button>
              </div>
            </div>

            {/* Historial de Ventas */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold mb-4 text-lg">Historial de Ventas</h3>
              
              <div className="space-y-3">
                {sales.length === 0 ? (
                  <div className="text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    No tiene ventas registradas
                  </div>
                ) : (
                  sales.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-lg">Venta #{s.id}</div>
                        <div className="text-sm text-gray-600">
                          {s.items && s.items.length > 0 ? `${s.items.length} items` : 'Sin items especificados'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Total:</span> {Number(s.total).toLocaleString('es-AR', { style:'currency', currency:'ARS' })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openSaleDetail(s.id)} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                          Ver venta
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {!loading && !customer && (
          <div className="text-gray-500">Cliente no encontrado</div>
        )}
      </div>

      {/* Modal Pago Individual */}
      {showPaymentModal && selectedSale && (
        <RegisterPaymentModal 
          sale={selectedSale} 
          customer={customer} 
          onClose={() => setShowPaymentModal(false)} 
          onSaved={onPaymentSaved} 
        />
      )}

      {/* Modal Confirmar Pago con Interés */}
      {showFullPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Confirmar Pago</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Total de la cuenta:</div>
              <div className="text-xl font-bold text-blue-600">
                {Number(totalCuenta).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interés (%)</label>
              <input 
                type="number" 
                value={interestPercentage} 
                onChange={e => setInterestPercentage(e.target.value)} 
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">Monto final:</div>
              <div className="text-xl font-bold text-green-600">
                {Number(finalAmount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowFullPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={handleFullPayment}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Venta */}
      {showSaleDetail && saleDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detalle de Venta #{saleDetail.id}</h3>
            
            <div className="mb-4">
              <p><span className="font-medium">Fecha:</span> {new Date(saleDetail.created_at).toLocaleString()}</p>
              <p><span className="font-medium">Total:</span> {Number(saleDetail.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
              {saleDetail.on_credit && (
                <>
                  <p><span className="font-medium">Pagado:</span> {Number(saleDetail.paid_amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                  <p><span className="font-medium">Pendiente:</span> {Number(saleDetail.outstanding_amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                </>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="space-y-2">
                {saleDetail.items && saleDetail.items.map((it, index) => {
                  // Usar los campos correctos que vienen del backend
                  const nombre = it.nombre || 'Item sin nombre';
                  const precioUnitario = it.precio_unitario || it.unit_price || 0;
                  const cantidad = it.qty || 0;
                  const subtotal = it.line_total || (precioUnitario * cantidad);

                  return (
                    <li key={it.id || index} className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium">{nombre}</div>
                      <div className="text-sm text-gray-600">
                        {cantidad} x {Number(precioUnitario).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                      <div className="text-sm text-gray-800 font-semibold">
                        Subtotal: {Number(subtotal).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setShowSaleDetail(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 text-white">
          Cargando detalle...
        </div>
      )}
    </div>
  );
}
