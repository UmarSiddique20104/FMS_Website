import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const NotficationModel = () => {
  const [totalResults, setTotalResults] = useState();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          redirect: 'follow',
        };

        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/activities/all-activities?status=pending`,
          requestOptions,
        )
          .then((response) => response.json())
          .then((result) => {
            console.log('=>', result);
            setTotalResults(result);
            if (result?.results > 0) {
              document.getElementById('my_modal_2').showModal();
            }
          })
          .catch((error) => console.error(error));
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [totalResults?.results]);

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path, {
      state: {
        status: 'pending',
      },
    });
  };

  return totalResults?.results && user?.Role?.roleName == 'companyAdmin' ? (
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box w-auto bg-white">
        <h3 className="font-bold text-lg"> </h3>
        <div class="w-full h-full min-w-96 overflow-y-auto flex flex-col gap-4  bg-gray-900 bg-white">
          <div className="flex justify-between">
            <h4 className="font-bold text-xl text-black">
              {totalResults?.results} Pending Requests
            </h4>
            <form method="dialog">
              <button className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 z-50">
                <IoClose />
              </button>
            </form>
          </div>
          <p class="gap-1.5 rounded-md flex items-center justify-center text-black text-lg">
            You have {totalResults?.results} new requests pending. Please open
            the Requests to review and make a decision.
          </p>
          <div className="flex flex-wrap gap-3">
            {totalResults?.data?.fuelRequest.length > 0 ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleClick('/fuel-management')}
              >
                View ({totalResults?.data?.fuelRequest.length}) Fuel Request
              </button>
            ) : (
              ''
            )}
            {totalResults?.data?.periodicMaintenance.length > 0 ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleClick('/periodic')}
              >
                View ({totalResults?.data?.periodicMaintenance.length}) P. M.
                Request
              </button>
            ) : (
              ''
            )}
            {totalResults?.data?.dailyMaintenance.length > 0 ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleClick('/daily-maintenance')}
              >
                View ({totalResults?.data?.dailyMaintenance.length}) D. M.
                Request
              </button>
            ) : (
              ''
            )}
            {totalResults?.data?.emergencyMaintenance.length > 0 ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleClick('/emergency-maintenance')}
              >
                View ({totalResults?.data?.emergencyMaintenance.length}) E. M
                Request
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </dialog>
  ) : (
    ''
  );
};

export default NotficationModel;
