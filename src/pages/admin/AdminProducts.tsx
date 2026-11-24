import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { Plus, Search, Edit2, Trash2, X, RotateCcw } from 'lucide-react';
import { db } from '../../firebase';
import {
  siteId,
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_CATEGORIES,
  PRODUCT_BRANDS,
} from '../../constants/siteConfig';
import { DEFAULT_PRODUCTS, ProductItem, ProductVariation } from '../../constants/defaultData';
import { extractNumericPrice, formatNaira } from '../../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import ImageUpload from '../../components/admin/ImageUpload';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'price' | 'stock'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    position: 1,
    name: '',
    category: PRODUCT_CATEGORIES[0] as string,
    brand: PRODUCT_BRANDS[0] as string,
    subCategory: '',
    shortDescription: '',
    price: '',
    salePrice: '',
    stock: 0,
    imageUrl: '',
    variations: [] as ProductVariation[],
  });

  useEffect(() => {
    const path = `sites/${siteId}/products`;
    const unsub = onSnapshot(
      collection(db, 'sites', siteId, 'products'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProductItem, 'id'>),
        }));
        setProducts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.brand || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term) ||
        (p.shortDescription || '').toLowerCase().includes(term)
    );

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'position') {
        cmp = (a.position || 0) - (b.position || 0);
      } else if (sortBy === 'price') {
        const pa =
          a.variations && a.variations.length > 0
            ? extractNumericPrice(a.variations[0].salePrice || a.variations[0].price)
            : extractNumericPrice(a.salePrice || a.price);
        const pb =
          b.variations && b.variations.length > 0
            ? extractNumericPrice(b.variations[0].salePrice || b.variations[0].price)
            : extractNumericPrice(b.salePrice || b.price);
        cmp = pa - pb;
      } else if (sortBy === 'stock') {
        cmp = (a.stock || 0) - (b.stock || 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [products, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginated = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    setForm({
      position: products.length + 1,
      name: '',
      category: PRODUCT_CATEGORIES[0],
      brand: PRODUCT_BRANDS[0],
      subCategory: '',
      shortDescription: '',
      price: '',
      salePrice: '',
      stock: 10,
      imageUrl: '',
      variations: [],
    });
    setModalOpen(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditing(p);
    setFormError('');
    setForm({
      position: p.position || 0,
      name: p.name,
      category: p.category || PRODUCT_CATEGORIES[0],
      brand: p.brand || PRODUCT_BRANDS[0],
      subCategory: p.subCategory || '',
      shortDescription: p.shortDescription || '',
      price: p.price || '',
      salePrice: p.salePrice || '',
      stock: p.stock || 0,
      imageUrl: p.imageUrl || '',
      variations: p.variations ? p.variations.map((v) => ({ ...v })) : [],
    });
    setModalOpen(true);
  };

  const handleSeedDefaults = async () => {
    const path = `sites/${siteId}/products`;
    try {
      const batch = writeBatch(db);
      DEFAULT_PRODUCTS.forEach((p) => {
        batch.set(doc(db, 'sites', siteId, 'products', p.id), {
          name: p.name,
          category: p.category || '',
          brand: p.brand || '',
          subCategory: p.subCategory || '',
          price: p.price,
          salePrice: p.salePrice || '',
          stock: p.stock || 0,
          imageUrl: p.imageUrl,
          shortDescription: p.shortDescription,
          position: p.position,
          variations: p.variations || [],
        });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const addVariationRow = () => {
    setForm((prev) => ({
      ...prev,
      variations: [...prev.variations, { name: '', price: '', salePrice: '' }],
    }));
  };

  const updateVariation = (idx: number, field: keyof ProductVariation, val: string) => {
    setForm((prev) => {
      const next = [...prev.variations];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, variations: next };
    });
  };

  const removeVariation = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanVariations = form.variations
      .filter((v) => v.name.trim() && v.price.trim())
      .map((v) => ({
        name: v.name.trim(),
        price: formatNaira(v.price),
        ...(v.salePrice?.trim() ? { salePrice: formatNaira(v.salePrice) } : {}),
      }));

    if (!form.price.trim() && cleanVariations.length === 0) {
      setFormError('Please provide either a main price or at least one product variation.');
      return;
    }

    const payload = {
      position: Number(form.position) || 0,
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      subCategory: form.subCategory.trim(),
      shortDescription: form.shortDescription.trim(),
      price: formatNaira(form.price),
      salePrice: formatNaira(form.salePrice),
      stock: Number(form.stock) || 0,
      imageUrl: form.imageUrl.trim(),
      variations: cleanVariations,
    };

    const path = `sites/${siteId}/products`;
    try {
      if (editing) {
        await updateDoc(doc(db, 'sites', siteId, 'products', editing.id), payload);
      } else {
        await addDoc(collection(db, 'sites', siteId, 'products'), payload);
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editing ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/products/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'products', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-xl border border-stone-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'position' | 'price' | 'stock')
              }
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium"
            >
              <option value="position">Sort: Position</option>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Sync Full Catalog
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Pos</th>
              <th className="py-3.5 px-4">Image</th>
              <th className="py-3.5 px-4">Product & Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price Range</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-stone-400">
                  No products in database yet. Click “Sync Full Catalog” or “Add Product”.
                </td>
              </tr>
            ) : (
              paginated.map((p, index) => {
                const rowNum = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                const vars = p.variations || [];
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-bold text-stone-400 tabular-nums">
                      {rowNum}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-stone-600 tabular-nums">
                      {p.position || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <img
                        src={p.imageUrl || DEFAULT_PRODUCT_IMAGE}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-50 border border-stone-200"
                      />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-stone-900">{p.name}</p>
                      <p className="text-xs text-lime-700 font-semibold">
                        {p.brand || 'NDU PAT'} {p.subCategory ? `· ${p.subCategory}` : ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-600">
                      {p.category || 'Musical Instruments'}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {vars.length > 0 ? (
                        <div>
                          <span className="text-[11px] font-bold text-lime-700">
                            {vars.length} Options
                          </span>
                          <p className="text-xs font-semibold text-stone-700 mt-0.5">
                            {vars[0].salePrice || vars[0].price} –{' '}
                            {vars[vars.length - 1].salePrice || vars[vars.length - 1].price}
                          </p>
                        </div>
                      ) : p.salePrice ? (
                        <div>
                          <span className="font-bold text-red-600">{p.salePrice}</span>
                          <span className="block text-xs line-through text-stone-400">
                            {p.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-stone-900">{p.price}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700 tabular-nums">
                      {p.stock ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-lime-50 hover:text-lime-700 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Yamaha PSR-SX700 Keyboard"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    list="brand-options"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g., Yamaha, JBL, Shure"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                  <datalist id="brand-options">
                    {PRODUCT_BRANDS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type / Spec
                  </label>
                  <input
                    type="text"
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    placeholder="e.g., Powered Mixers"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price (₦)
                  </label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="250,000"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="220,000"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Product Variations Builder */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-stone-700">
                    Product Variations / Channel Configs (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={addVariationRow}
                    className="text-xs font-bold text-lime-700 hover:text-lime-800 cursor-pointer"
                  >
                    + Add Variation
                  </button>
                </div>

                {form.variations.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-10 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Variation name (e.g., 8-Channel)"
                      value={v.name}
                      onChange={(e) => updateVariation(idx, 'name', e.target.value)}
                      className="sm:col-span-4 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Price (₦)"
                      value={v.price}
                      onChange={(e) => updateVariation(idx, 'price', e.target.value)}
                      className="sm:col-span-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Sale Price"
                      value={v.salePrice || ''}
                      onChange={(e) => updateVariation(idx, 'salePrice', e.target.value)}
                      className="sm:col-span-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariation(idx)}
                      className="sm:col-span-1 text-red-500 hover:text-red-700 flex justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <ImageUpload
                label="Product Image"
                folder="products"
                aspect={4 / 3}
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-lime-600 hover:bg-lime-700 text-white cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Product?</h3>
            <p className="text-sm text-stone-600">
              Delete <strong>{deleteTarget.name}</strong> from the catalog?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
