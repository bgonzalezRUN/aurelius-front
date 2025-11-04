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
  type BackendPayload,
  type Requisition,
} from "../api/requisitionService";

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [projectName, setProjectName] = useState("");
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);

  useEffect(() => {
    fetchAllRequisitions();
  }, []);

  const fetchAllRequisitions = async () => {
    try {
      const data = await getRequisitions();
      setRequisitions(data);
    } catch (err) {
      console.error(err);
      window.location.href = "/";
    }
  };

  const handleSearch = async () => {
    try {
      if (!projectName.trim()) {
        fetchAllRequisitions();
        return;
      }
      const data = await searchRequisitionsByProject(projectName);
      setRequisitions(data);
    } catch (err) {
      console.error(err);
      window.location.href = "/";
    }
  };

  const handleSave = async (data: BackendPayload) => {
    await createRequisition(data);
    await fetchAllRequisitions();
    setShowModal(false);
  };

  const handleSelectRequisition = async (reqId: string) => {
    try {
      const data = await getRequisitionById(reqId);
      setSelectedRequisition(data);
    } catch (error) {
      console.error(error);
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Requisiciones</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nueva Requisición
          </button>
        </div>

        {/* Búsqueda */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Buscar por nombre de proyecto..."
            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Buscar
          </button>
        </div>

        {/* Lista */}
        <RequisitionList
          onSelect={handleSelectRequisition}
          filteredRequisitions={requisitions}
        />
      </main>

      {/* Modales */}
      <RequisitionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

      <RequisitionDetailModal
        open={!!selectedRequisition}
        requisition={selectedRequisition}
        onClose={() => setSelectedRequisition(null)}
      />
    </div>
  );
}
