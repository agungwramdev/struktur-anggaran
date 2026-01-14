'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CurrencyInput from '@/components/CurrencyInput';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';

interface StrukturAnggaran {
  _id: string;
  tahun_anggaran: number;
  kd_klpd: string;
  nama_klpd: string;
  kd_satker: string;
  kd_satker_str: string;
  nama_satker: string;
  belanja_operasi: number;
  belanja_modal: number;
  belanja_bbt: number;
  belanja_non_pengadaan: number;
  belanja_pengadaan: number;
  total_belanja: number;
  tahun: number;
}

interface SatkerData {
  kd_klpd: string;
  nama_klpd: string;
  kd_satker: string;
  kd_satker_str: string;
  nama_satker: string;
}

export default function StrukturAnggaranPage() {
  const [data, setData] = useState<StrukturAnggaran[]>([]);
  const [satkerList, setSatkerList] = useState<SatkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState(''); // Search term for main table
  const [satkerSearchTerm, setSatkerSearchTerm] = useState(''); // Search term for satker modal
  const [loadingSatker, setLoadingSatker] = useState(false);

  const [formData, setFormData] = useState({
    tahun_anggaran: new Date().getFullYear(),
    kd_klpd: '',
    nama_klpd: '',
    kd_satker: '',
    kd_satker_str: '',
    nama_satker: '',
    belanja_operasi: 0,
    belanja_modal: 0,
    belanja_bbt: 0,
    belanja_non_pengadaan: 0,
    belanja_pengadaan: 0,
    total_belanja: 0,
    tahun: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    if (showModal && !editingId) {
      // Reset satker list when year changes
      setSatkerList([]);
      setSatkerSearchTerm('');
      fetchSatkerData();
    }
  }, [showModal, formData.tahun_anggaran]);

  useEffect(() => {
    const total =
      formData.belanja_operasi +
      formData.belanja_modal +
      formData.belanja_bbt +
      formData.belanja_non_pengadaan;
    setFormData((prev) => ({ ...prev, total_belanja: total }));
  }, [formData.belanja_operasi, formData.belanja_modal, formData.belanja_bbt, formData.belanja_non_pengadaan]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/struktur-anggaran?tahun=${selectedYear}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSatkerData = async () => {
    try {
      setLoadingSatker(true);

      // Fetch all satker data
      const satkerResponse = await api.get(`/satker?tahun=${formData.tahun_anggaran}`);

      // Fetch used satker codes for this year (only if creating new, not editing)
      if (!editingId) {
        const usedResponse = await api.get(`/struktur-anggaran/used-satker?tahun=${formData.tahun_anggaran}`);
        const usedCodes = usedResponse.data;

        // Filter out satker that already have data
        const availableSatker = satkerResponse.data.filter(
          (satker: SatkerData) => !usedCodes.includes(satker.kd_satker)
        );

        setSatkerList(availableSatker);
      } else {
        // When editing, show all satker (including the current one)
        setSatkerList(satkerResponse.data);
      }
    } catch (error) {
      console.error('Error fetching satker data:', error);
      alert('Gagal memuat data satker');
    } finally {
      setLoadingSatker(false);
    }
  };

  const handleSatkerSelect = (satker: SatkerData) => {
    setFormData({
      ...formData,
      kd_klpd: satker.kd_klpd,
      nama_klpd: satker.nama_klpd,
      kd_satker: satker.kd_satker,
      kd_satker_str: satker.kd_satker_str,
      nama_satker: satker.nama_satker,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure all string fields are strings
      const submitData = {
        ...formData,
        kd_klpd: String(formData.kd_klpd),
        nama_klpd: String(formData.nama_klpd),
        kd_satker: String(formData.kd_satker),
        kd_satker_str: String(formData.kd_satker_str),
        nama_satker: String(formData.nama_satker),
      };

      console.log('Submitting data:', submitData);

      if (editingId) {
        await api.patch(`/struktur-anggaran/${editingId}`, submitData);
      } else {
        await api.post('/struktur-anggaran', submitData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving data:', error);
      console.error('Error response:', error.response?.data);

      // Handle specific error cases
      if (error.response?.status === 409) {
        // Conflict - satker already exists
        alert(error.response?.data?.message || 'Data untuk satker ini sudah ada untuk tahun tersebut');
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan data');
      }
    }
  };

  const handleEdit = (item: StrukturAnggaran) => {
    setEditingId(item._id);
    setFormData({
      tahun_anggaran: item.tahun_anggaran,
      kd_klpd: item.kd_klpd,
      nama_klpd: item.nama_klpd,
      kd_satker: item.kd_satker,
      kd_satker_str: item.kd_satker_str,
      nama_satker: item.nama_satker,
      belanja_operasi: item.belanja_operasi,
      belanja_modal: item.belanja_modal,
      belanja_bbt: item.belanja_bbt,
      belanja_non_pengadaan: item.belanja_non_pengadaan,
      belanja_pengadaan: item.belanja_pengadaan,
      total_belanja: item.total_belanja,
      tahun: item.tahun,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await api.delete(`/struktur-anggaran/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Gagal menghapus data');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSatkerSearchTerm('');
    setFormData({
      tahun_anggaran: new Date().getFullYear(),
      kd_klpd: '',
      nama_klpd: '',
      kd_satker: '',
      kd_satker_str: '',
      nama_satker: '',
      belanja_operasi: 0,
      belanja_modal: 0,
      belanja_bbt: 0,
      belanja_non_pengadaan: 0,
      belanja_pengadaan: 0,
      total_belanja: 0,
      tahun: new Date().getFullYear(),
    });
  };

  const filteredData = data.filter(
    (item) =>
      item.nama_satker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kd_satker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSatker = satkerList.filter(
    (item) =>
      item.nama_satker.toLowerCase().includes(satkerSearchTerm.toLowerCase()) ||
      item.kd_satker.toLowerCase().includes(satkerSearchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Struktur Anggaran
              </h1>
              <p className="text-gray-600 mt-1">Kelola data struktur anggaran</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input w-32"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiPlus /> Tambah Data
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="card">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau kode satker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Tidak ada data</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kode Satker</th>
                      <th>Nama Satker</th>
                      <th>Belanja Operasi</th>
                      <th>Belanja Modal</th>
                      <th>Belanja BBT</th>
                      <th>Total Belanja</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item._id}>
                        <td className="font-mono">{item.kd_satker}</td>
                        <td>{item.nama_satker}</td>
                        <td>{formatCurrency(item.belanja_operasi)}</td>
                        <td>{formatCurrency(item.belanja_modal)}</td>
                        <td>{formatCurrency(item.belanja_bbt)}</td>
                        <td className="font-semibold">
                          {formatCurrency(item.total_belanja)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? 'Edit' : 'Tambah'} Struktur Anggaran
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun Anggaran
                      </label>
                      <select
                        value={formData.tahun_anggaran}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tahun_anggaran: Number(e.target.value),
                            tahun: Number(e.target.value),
                          })
                        }
                        className="input"
                        required
                        disabled={editingId !== null}
                      >
                        {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - (2 - i)).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Satker
                      </label>
                      {loadingSatker ? (
                        <p className="text-gray-500">Loading data satker...</p>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="Cari satker..."
                            value={satkerSearchTerm}
                            onChange={(e) => setSatkerSearchTerm(e.target.value)}
                            className="input mb-2"
                          />
                          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                            {filteredSatker.map((satker, index) => (
                              <div
                                key={index}
                                onClick={() => handleSatkerSelect(satker)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                                  formData.kd_satker === satker.kd_satker
                                    ? 'bg-primary-50'
                                    : ''
                                }`}
                              >
                                <p className="font-semibold">{satker.nama_satker}</p>
                                <p className="text-sm text-gray-600">
                                  {satker.kd_satker} - {satker.nama_klpd}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {formData.kd_satker && (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Satker Terpilih:</h4>
                        <p className="text-sm">
                          <strong>Nama:</strong> {formData.nama_satker}
                        </p>
                        <p className="text-sm">
                          <strong>Kode:</strong> {formData.kd_satker}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput
                          label="Belanja Operasi"
                          value={formData.belanja_operasi}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              belanja_operasi: value,
                            })
                          }
                          required
                        />

                        <CurrencyInput
                          label="Belanja Modal"
                          value={formData.belanja_modal}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              belanja_modal: value,
                            })
                          }
                          required
                        />

                        <CurrencyInput
                          label="Belanja BBT"
                          value={formData.belanja_bbt}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              belanja_bbt: value,
                            })
                          }
                          required
                        />

                        <CurrencyInput
                          label="Belanja Non-Pengadaan"
                          value={formData.belanja_non_pengadaan}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              belanja_non_pengadaan: value,
                            })
                          }
                          required
                        />

                        <CurrencyInput
                          label="Belanja Pengadaan"
                          value={formData.belanja_pengadaan}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              belanja_pengadaan: value,
                            })
                          }
                          required
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Belanja
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              Rp
                            </span>
                            <input
                              type="text"
                              value={new Intl.NumberFormat('id-ID').format(formData.total_belanja)}
                              className="input pl-10 text-right bg-gray-100"
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="btn btn-secondary"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!formData.kd_satker}
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
