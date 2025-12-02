import { useState } from 'react';
import RequisitionList from '../components/RequisitionList';
import RequisitionModal from '../components/RequisitionModal';
import Restricted from '../components/Restricted';
import { PlusIcon, Search } from 'lucide-react';

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-10">
      <Restricted permission="create:requisition">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center rounded-lg shadow border border-primaryDark group ml-auto"
        >
          <div className="bg-primaryDark text-white px-3 py-2 flex items-center justify-center group-hover:bg-primaryDark transition rounded-l-lg ">
            <span className="text-lg font-bold">
              <PlusIcon />
            </span>
          </div>
          <span className="px-5 py-2 text-primaryDark font-medium group-hover:bg-gray-50 transition rounded-lg ">
            Nueva requisición
          </span>
        </button>
      </Restricted>

      <div className="p-8 bg-grey-400 h-full rounded-xl shadow-sm">
        <div className="flex justify-between mb-6">
          <div className="flex gap-6 items-center">
            <h1 className="text-3xl font-bold text-primaryDark">
              Listado de requisiciones
            </h1>

            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Buscar"
                className="w-full bg-white drop-shadow-lg rounded-lg pl-10 pr-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryDark"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-primaryDark">
            Centro de costos CC-1002
          </h2>
        </div>

        <RequisitionList />
      </div>

      {showModal && (
        <RequisitionModal open={showModal} onClose={handleCloseModal} />
      )}
    </div>
  );
}
