import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import RequisitionList from "../components/RequisitionList";
import RequisitionModal from "../components/RequisitionModal";
import RequisitionDetailModal from "../components/RequisitionDetailModal";
import {
  createRequisition,
  getRequisitionById,
  getRequisitions,
  searchRequisitionsByProject,
  signRequisition,
  updateRequisition,
  updateSubmitRequisition,
  updateValidateRequisition,
  type BackendPayload,
  type Requisition,
} from "../api/requisitionService";
import Restricted from "../components/Restricted";
import { ChevronLeft, ChevronRight, PlusIcon, Search } from "lucide-react";

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<Requisition | null>(null);
  const [editingRequisition, setEditingRequisition] =
    useState<Requisition | null>(null);
  const [projectName, setProjectName] = useState("");
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAllRequisitions();
  }, []);

  const fetchAllRequisitions = async () => {
    try {
      const data = await getRequisitions();
      setRequisitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = requisitions.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(requisitions.length / itemsPerPage);

  const handleSearch = async () => {
    try {
      if (!projectName.trim()) {
        fetchAllRequisitions();
        return;
      }
      const data = await searchRequisitionsByProject(projectName);
      setRequisitions(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendStatus = async (reqId: string) => {
    try {
      await updateSubmitRequisition(reqId);
      await fetchAllRequisitions();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado de la requisición");
    }
  };

  const handleValidateStatus = async (reqId: string) => {
    try {
      await updateValidateRequisition(reqId);
      await fetchAllRequisitions();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado de la requisición");
    }
  };

  const handleApproveStatus = async (reqId: string, user: string) => {
    try {
      await signRequisition(reqId, user);
      await fetchAllRequisitions();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado de la requisición");
    }
  };

  const handleEditRequisition = async (reqId: string) => {
    try {
      const data = await getRequisitionById(reqId);
      setEditingRequisition(data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("Error al cargar la requisición");
    }
  };

  const handleSave = async (data: BackendPayload) => {
    if (editingRequisition) {
      await updateRequisition(editingRequisition.requisitionId, data);
    } else {
      await createRequisition(data);
    }
    await fetchAllRequisitions();
    setShowModal(false);
    setEditingRequisition(null);
    setCurrentPage(1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRequisition(null);
  };

  const handleSelectRequisition = async (reqId: string) => {
    try {
      const data = await getRequisitionById(reqId);
      setSelectedRequisition(data);
    } catch (error) {
      console.error(error);
    }
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
                    onChange={(e) => setProjectName(e.target.value)}
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
            <RequisitionList
              onSelect={handleSelectRequisition}
              onEdit={handleEditRequisition}
              onSend={handleSendStatus}
              onValidate={handleValidateStatus}
              onApprove={handleApproveStatus}
              filteredRequisitions={currentItems}
            />
          </div>
        </main>
        {requisitions.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`px-2 py-2 rounded-lg shadow ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#01687d] text-white hover:bg-[#02566a]"
              }`}
            >
              <ChevronLeft />
            </button>

            <span className="text-lg font-semibold text-[#01687d]">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`px-2 py-2 rounded-lg shadow ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#01687d] text-white hover:bg-[#02566a]"
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      <RequisitionModal
        open={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingRequisition={editingRequisition}
      />

      <RequisitionDetailModal
        open={!!selectedRequisition}
        requisition={selectedRequisition}
        onClose={() => setSelectedRequisition(null)}
      />
    </div>
  );
}
