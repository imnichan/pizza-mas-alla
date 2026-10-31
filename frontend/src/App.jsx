import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Banknote, 
  CreditCard, 
  Minus, 
  Plus, 
  QrCode, 
  Receipt, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  Trash2, 
  Wifi 
} from 'lucide-react';

const money = (amount) => `$${Number(amount || 0).toFixed(2)} MXN`;

export default function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [categoria, setCategoria] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Cargar productos desde la base de datos PostgreSQL (PB-01)
  const cargarProductos = () => {
    setCargando(true);
    setErrorMsg('');
    axios.get('http://localhost:5000/api/productos')
      .then((respuesta) => {
        setProductos(respuesta.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al conectar con la API:', error);
        setErrorMsg(error.response?.data?.error || 'Error al conectar con el servidor backend/Base de Datos.');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Agregar producto al carrito (PB-01)
  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id);
      if (existe) {
        return actual.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });
  }

  // Modificar cantidad o eliminar item (PB-01, PB-04)
  function cambiarCantidad(id, nuevaCantidad) {
    setCarrito((actual) =>
      actual
        .map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
        .filter((item) => item.cantidad > 0)
    );
  }

  // Cálculos automáticos (PB-02, PB-04)
  const subtotal = useMemo(() => {
    return carrito.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0);
  }, [carrito]);

  const total = subtotal; // Espacio listo para aplicar cupones/descuentos en el futuro

  // Enviar y guardar la venta en PostgreSQL (PB-05, PB-06)
  function procesarVenta() {
    if (!carrito.length || procesando) return;

    setProcesando(true);
    const datosVenta = {
      subtotal,
      total,
      metodoPago,
      productos: carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad
      }))
    };

    axios.post('http://localhost:5000/api/ventas', datosVenta)
      .then((respuesta) => {
        alert(`¡Venta Registrada Exitosamente!\n\nFolio: ${respuesta.data.folio}\nFecha: ${new Date(respuesta.data.fecha).toLocaleString()}`);
        setCarrito([]);
        setProcesando(false);
      })
      .catch((error) => {
        console.error('Error al registrar la venta:', error);
        alert(error.response?.data?.error || 'Ocurrió un error al procesar la venta en la base de datos.');
        setProcesando(false);
      });
  }

  // Filtrado de productos por categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria = categoria === 'Todos' || (producto.categoria || 'Pizzas') === categoria;
      const coincideBusqueda = `${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoria, busqueda]);

  return (
    <main className="min-h-screen bg-[#111315] text-zinc-100 font-sans antialiased">
      {/* ENCABEZADO PRINCIPAL */}
      <header className="border-b border-zinc-800 bg-[#17191b]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
              <Receipt className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-orange-400 sm:text-3xl">
                PizzaMásAllá <span className="font-normal text-zinc-500">| Terminal Táctil POS</span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500">Punto de venta · Selección y registro de pedidos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="rounded-lg border-2 border-emerald-500/40 px-3 py-2 text-base font-black tracking-wide text-emerald-300">
              CAJA ABIERTA
            </span>
            <span className="text-zinc-600">•</span>
            <Wifi className="size-4 text-zinc-400" />
            <span className="text-zinc-400">PostgreSQL Conectado</span>
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL GRID */}
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        
        {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS */}
        <section aria-labelledby="menu-heading">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Menú Vigente</p>
              <h2 id="menu-heading" className="text-2xl font-semibold">Elige tus productos</h2>
            </div>
            <label className="relative block sm:w-72">
              <span className="sr-only">Buscar productos</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en el menú..."
                className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />
            </label>
          </div>

          {/* FILTROS DE CATEGORÍA */}
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            {['Todos', 'Pizzas', 'Bebidas', 'Complementos'].map((item) => (
              <button
                key={item}
                onClick={() => setCategoria(item)}
                className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
                  categoria === item
                    ? 'border-orange-500 bg-orange-500 text-zinc-950'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* MENSAJES DE CARGA O ERROR */}
          {cargando && (
            <div className="p-12 text-center text-orange-400">
              <p className="text-lg font-medium">Cargando catálogo desde la Base de Datos...</p>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
              <p className="mb-4 text-sm font-semibold">{errorMsg}</p>
              <button
                onClick={cargarProductos}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-400"
              >
                Reintentar Conexión
              </button>
            </div>
          )}

          {/* REJILLA DE TARJETAS DE PRODUCTOS */}
          {!cargando && !errorMsg && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {productosFiltrados.map((producto) => (
                <article
                  key={producto.id}
                  className="group flex min-h-64 flex-col rounded-2xl border-2 border-zinc-700 bg-[#1a1d1f] p-5 transition hover:-translate-y-0.5 hover:border-orange-500/50"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                      {producto.categoria || 'Menú'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100">{producto.nombre}</h3>
                  <p className="mt-2 text-sm leading-5 text-zinc-500">{producto.descripcion}</p>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                    <span className="text-xl font-bold text-emerald-400">{money(producto.precio)}</span>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="inline-flex h-14 items-center gap-2 rounded-lg bg-orange-500 px-5 text-base font-black text-[#17100a] transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <Plus className="size-5" />
                      Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!cargando && !errorMsg && !productosFiltrados.length && (
            <p className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-zinc-500">
              No se encontraron productos registrados en esta categoría.
            </p>
          )}
        </section>

        {/* SECCIÓN DERECHA: PANEL LATERAL DE VENTA Y COMANDA */}
        <aside className="lg:sticky lg:top-6 lg:h-fit" aria-labelledby="sale-heading">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1a1d1f] shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Comanda Activa
                </p>
                <h2 id="sale-heading" className="mt-1 text-xl font-semibold">Detalle de Venta</h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <ShoppingBag className="size-5" />
              </div>
            </div>

            {/* LISTA DE ITEMS SELECCIONADOS */}
            <div className="max-h-80 overflow-y-auto px-5">
              {carrito.length ? (
                <div className="divide-y divide-zinc-800">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.nombre}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {money(item.precio)} c/u · Subtotal {money(Number(item.precio) * item.cantidad)}
                        </p>
                      </div>

                      {/* CONTROLES TÁCTILES GRANDES */}
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Reducir ${item.nombre}`}
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                          className="flex size-11 items-center justify-center rounded-lg border-2 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
                        >
                          <Minus className="size-5" />
                        </button>
                        <span className="w-7 text-center text-lg font-black">{item.cantidad}</span>
                        <button
                          aria-label={`Aumentar ${item.nombre}`}
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                          className="flex size-11 items-center justify-center rounded-lg border-2 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
                        >
                          <Plus className="size-5" />
                        </button>
                        <button
                          aria-label={`Eliminar ${item.nombre}`}
                          onClick={() => cambiarCantidad(item.id, 0)}
                          className="ml-1 flex size-11 items-center justify-center rounded-lg border-2 border-transparent text-zinc-500 hover:border-red-500/40 hover:text-red-400"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-3 size-10 text-zinc-700" />
                  <p className="text-sm text-zinc-500">El carrito está vacío</p>
                  <p className="mt-1 text-xs text-zinc-600">Selecciona productos del menú para comenzar</p>
                </div>
              )}
            </div>

            {/* DESGLOSE MONETARIO Y SELECTOR DE PAGO */}
            <div className="border-t border-zinc-800 bg-[#17191b] p-5">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-3xl font-extrabold text-emerald-400">{money(total)}</span>
              </div>

              {/* SELECTOR TÁCTIL DE MÉTODO DE PAGO */}
              <div className="mt-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-300">
                  <CreditCard className="size-5 text-orange-400" />
                  Método de Pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Efectivo')}
                    className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 text-xs font-black transition ${
                      metodoPago === 'Efectivo'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <Banknote className="size-6" />
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Tarjeta de Débito/Crédito')}
                    className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 text-xs font-black transition ${
                      metodoPago === 'Tarjeta de Débito/Crédito'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <CreditCard className="size-6" />
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Transferencia')}
                    className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 text-xs font-black transition ${
                      metodoPago === 'Transferencia'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <QrCode className="size-6" />
                    QR / Transf.
                  </button>
                </div>
              </div>

              {/* BOTÓN CONFIRMAR VENTA */}
              <button
                disabled={!carrito.length || procesando}
                onClick={procesarVenta}
                className="mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-lg bg-emerald-600 text-xl font-black text-emerald-950 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                <ShieldCheck className="size-6" />
                {procesando ? 'Procesando Venta...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}