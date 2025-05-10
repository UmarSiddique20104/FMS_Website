import React, { useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useGetFuelRequestQuery } from '../../services/fuelSlice';
import { useParams } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { formatDateAndTime } from '../../utils/helpers';

const FuelView = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetFuelRequestQuery(id);
  console.log(data);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setZoom(1); // Reset zoom on close
  };

  const zoomIn = () => setZoom((prevZoom) => prevZoom + 0.2);
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.2));

  return (
    <>
      <DefaultLayout>
        <div className="mx-auto max-w-600">
          <BreadcrumbNav
            pageName="Fuel Request Details"
            pageNameprev="Fuel Management"
            pagePrevPath="fuel-management"
          />
          <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-end p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Fuel Request Details</h2>
            </div>

            <div className="flex p-5 bg-brand-primary">
              <div className="flex flex-col gap-1 w-3/5">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <p className="text-md font-semibold">Registration No.:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.registrationNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Vehicle Make:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.make}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Driver:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.driverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Driver ID:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.gbmsNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">
                      Previous Odometer Reading:
                    </p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.previousOddometerReading}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">
                      Current Odometer Reading (Auto):
                    </p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.currentOddometerReadingAuto}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">
                      Current Odometer Reading (Manually):
                    </p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.currentOddometerReading}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Mileage:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.distance}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Fuel Average:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.fuelAverage}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Rate of Fuel:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.rateOfFuel}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Quantity of Fuel:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.quantityOfFuel}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Last Fueling Date: </p>
                    <p className="text-md mb-5 font-normal">
                      {formatDateAndTime(data?.data?.lastCreatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">
                      Previous Quantity of Fuel:
                    </p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.previousFuelQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Amount:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Mode of Fueling:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.modeOfFueling}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Card Number:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.cardNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Fueling Date:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.currentFuelingDate?.slice(0, 10)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">
                      Request Generated at:
                    </p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.created_at?.slice(0, 10)}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Fuel Type:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.fuelType}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Request Type:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.requestType}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Station:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.station}
                    </p>
                  </div>
                  <div>
                    <p className="text-md font-semibold">Status:</p>
                    <p className="text-md mb-5 font-normal">
                      {data?.data?.status}
                    </p>
                  </div>
                  
                  {data?.data?.fuelReceipt && (
                    <div>
                      <p className="text-md font-semibold">Fueling Receipt:</p>
                      <img
                        className="w-48 h-48 object-contain cursor-pointer"
                        src={data?.data?.fuelReceipt}
                        alt="Receipt"
                        onClick={() => openModal(data?.data?.fuelReceipt)}
                      />
                    </div>
                  )}

                  {data?.data?.odometerImg && (
                    <div>
                      <p className="text-md font-semibold">Odometer Image:</p>
                      <img
                        className="w-48 h-48 object-contain cursor-pointer"
                        src={data?.data?.odometerImg}
                        alt="Odometer Image"
                        onClick={() => openModal(data?.data?.odometerImg)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="border-2 flex flex-col flex-auto h-[100vh]">
                <div className="h-10 flex justify-center items-center font-semibold border-b-2 border-black">
                  Fuel Management Logs
                </div>
                <div className="h-[95vh] overflow-y-scroll">
                  {data?.data?.FuelRequestLog.length > 0 ? (
                    data?.data?.FuelRequestLog.map((e, i) => {
                      const createdAt = new Date(e.created_at);
                      const date = createdAt.toISOString().slice(0, 10);
                      const time = createdAt.toTimeString().slice(0, 5);
                      const formattedDateTime = `Date: ${date}, Time: ${time}`;

                      return (
                        <div
                          key={i}
                          className="h-auto border border-dashed text-sm"
                        >
                          <div>{e?.log}</div>
                          <div>{formattedDateTime}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div>No Logs Found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>

      {modalIsOpen && (
        <dialog id="image_modal" className="modal justify-center" open>
          <div className="modal-box w-[700px] min-h-[800px] p-4 relative">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
                onClick={closeModal}
              >
                ✕
              </button>
            </form>
            <div className="absolute top-2 left-2 z-10 flex space-x-2 mt-3 ml-3">
              <button
                className="btn btn-sm btn-circle bg-transparent text-graydark"
                onClick={zoomIn}
              >
                <FaPlus />
              </button>
              <button
                className="btn btn-sm btn-circle bg-transparent text-graydark"
                onClick={zoomOut}
              >
                <FaMinus />
              </button>
            </div>
            <div className="mt-11 overflow-auto h-[calc(100%-3rem)] flex justify-center items-center min-w-[500px] min-h-[500px]">
              <img
                src={modalImageUrl}
                alt="Modal Content"
                className="object-contain"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default FuelView;
