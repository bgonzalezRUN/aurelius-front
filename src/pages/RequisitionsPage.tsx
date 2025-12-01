import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import RequisitionList from '../components/RequisitionList';
import RequisitionModal from '../components/RequisitionModal';

import Restricted from '../components/Restricted';
import { PlusIcon, Search } from 'lucide-react';
import type { Requisition } from '../types';

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingRequisition, setEditingRequisition] =
    useState<Requisition | null>(null);
  const [projectName, setProjectName] = useState('');

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRequisition(null);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col p-10">
        {/* Botón crear */}
        <div className="flex justify-end items-center mb-10">
          <Restricted permission="create:requisition">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center overflow-hidden rounded-lg shadow border border-[#01687d] group"
            >
              <div className="bg-[#01687d] text-white px-3 py-2 flex items-center justify-center group-hover:bg-[#01687d] transition">
                <span className="text-lg font-bold">
                  <PlusIcon />
                </span>
              </div>
              <span className="px-5 py-2 text-[#01687d] font-medium group-hover:bg-gray-50 transition">
                Nueva requisición
              </span>
            </button>
          </Restricted>
        </div>

        <main className="flex-1 p-8 bg-[#f5f5f5] rounded-xl shadow-sm">
          <div className="max-w-7xl mx-auto w-full">
            {/* Cabecera */}
            <div className="flex justify-between items-end mb-8">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold text-[#01687d]">
                  Listado de requisiciones
                </h1>

                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Buscar"
                    className="w-full bg-white drop-shadow-lg rounded-lg pl-10 pr-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#01687d]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <h2 className="text-xl font-bold text-[#01687d]">
                  Centro de costos CC-1002
                </h2>
              </div>
            </div>

            {/* Lista */}
            <RequisitionList />
          </div>
        </main>
        {/* {requisitions.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`px-2 py-2 rounded-lg shadow ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#01687d] text-white hover:bg-[#02566a]'
              }`}
            >
              <ChevronLeft />
            </button>

            <span className="text-lg font-semibold text-[#01687d]">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`px-2 py-2 rounded-lg shadow ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#01687d] text-white hover:bg-[#02566a]'
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        )} */}
      </div>
      {showModal && (
        <RequisitionModal
          open={showModal}
          onClose={handleCloseModal}
          editingRequisition={editingRequisition}
        />
      )}
    </div>
  );
}
