import React, { useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { formatDateAndTime } from '../../utils/helpers';
import Modal from '../../components/EmergencyModal'; // Import Modal
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useGetPeriodicRequestQuery } from '../../services/periodicSlice';

const PeriodicView = () => {
  const location = useLocation();
  const { data } = location.state;
  const { data: periodicData, refetch } = useGetPeriodicRequestQuery(data?.id);

  const [isActive, setIsActive] = useState(true); // Default value for is_active
  const [showDeletedAt, setShowDeletedAt] = useState(false); // Default value for showDeletedAt
  const [modalContent, setModalContent] = useState(null); // State for modal content


  const handleChangeIsActive = () => {
    setIsActive(!isActive);
  };

  const toggleDeletedAt = () => {
    setShowDeletedAt(!showDeletedAt);
  };

  const handleImageClick = (content) => {
    setModalContent(content);
  };

  const vendorInfo =
  periodicData?.data?.vendorType === 'Indoor'
      ? periodicData?.data?.indoorVendorName
      : periodicData?.data?.vendorType === 'Outdoor'
        ? `${periodicData?.data?.outdoorVendorName} - ${periodicData?.data?.outdoorVendorReason}`
        : '';

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Periodic Maintenance Completion Form"
          pageNameprev="Periodic Maintenance" //show the name on top heading
          pagePrevPath="periodic" // add the previous path to the navigation
        />
        <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
          <div className="flex justify-between items-end p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">
              Periodic Maintenance Information
            </h2>
          </div>

          <div className="flex p-5 bg-brand-primary">
            <div className="flex flex-col gap-1 w-3/5">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <p className="text-md font-semibold">Periodic Id:</p>
                  <p className="text-md mb-5 font-normal">{periodicData?.data?.id}</p>
                </div>
                <div>
                  <p className="text-md font-semibold">Approval Status:</p>
                  <p className="text-md mb-5 font-normal">{periodicData?.data?.status}</p>
                </div>
                <div>
                  <p className="text-md font-semibold">Station:</p>
                  <p className="text-md mb-5 font-normal">{periodicData?.data?.station}</p>
                </div>
                <div>
                  <p className="text-md font-semibold">Registration No.:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.registrationNo}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Make:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.make || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Request Created at:</p>
                  <p className="text-md mb-5 font-normal">
                    {formatDateAndTime(periodicData?.data?.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Periodic Category:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.periodicType?.job || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">
                    Last changed Odometer reading:
                  </p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.lastChangedMeterReading || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">
                    Current Odometer Reading:
                  </p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.meterReading}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">
                    Odometer Running Difference:
                  </p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.runningDifference || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">
                    Days Since Last Change:
                  </p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.dayRunningDifference || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Quantity:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.quantity || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Requested Amount:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.amount || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">
                    Completion Meter Reading:
                  </p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.completionMeterReading || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Date of Completion:</p>
                  <p className="text-md mb-5 font-normal">
                    {formatDateAndTime(periodicData?.data?.completionDate) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Supervisor Name:</p>
                  <p className="text-md mb-5 font-normal">
                    {periodicData?.data?.completionSupervisor || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-md font-semibold">Vendor Type:</p>
                  <p className="text-md mb-5 font-normal">{periodicData?.data?.vendorType}</p>
                </div>
                <div>
                  <p className="text-md font-semibold">Vendor Info:</p>
                  <p className="text-md mb-5 font-normal">{vendorInfo}</p>
                </div>
                <div></div>
                {periodicData?.data?.completionMeterImage && (
                  <div>
                    <p className="text-md font-semibold">
                      Image of Odometer when completed:
                    </p>
                    <p className="text-md mb-5 font-normal">
                      <img
                        src={periodicData?.data?.completionMeterImage}
                        alt="Odometer"
                        className="w-48 h-48 object-contain cursor-pointer"
                        onClick={() =>
                          handleImageClick(periodicData?.data?.completionMeterImage)
                        }
                      />
                    </p>
                  </div>
                )}
                {periodicData?.data?.completionItemImage && (
                  <div>
                    <p className="text-md font-semibold">
                      Image of Periodic Item:
                    </p>
                    <p className="text-md mb-5 font-normal">
                      <img
                        src={periodicData?.data?.completionItemImage}
                        alt="Periodic Item"
                        className="w-48 h-48 object-contain cursor-pointer"
                        onClick={() =>
                          handleImageClick(periodicData?.data?.completionItemImage)
                        }
                      />
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-2 flex flex-col flex-auto h-[100vh]">
              <div className="h-[5vh] font-bold border-b-2 border-black flex justify-center items-center p-5">
                Periodic Maintenance Logs
              </div>
              <div className="max-h-[95vh] overflow-y-auto">
                {periodicData?.data?.PeriodicMaintenanceLog.length > 0 ? (
                  periodicData?.data?.PeriodicMaintenanceLog.map((e, i) => {
                    const createdAt = new Date(e.created_at);
                    const date = createdAt.toISOString().slice(0, 10);
                    const time = createdAt.toTimeString().slice(0, 5);
                    const formattedDateTime = `${date}, Time: ${time}`;

                    return (
                      <div
                        key={i}
                        className="h-auto border border-dashed text-sm p-2"
                      >
                        <div>
                          <strong>Employee Name:</strong> {e?.changedBy}
                        </div>
                        <div>
                          <strong>Activity:</strong> {e?.log}
                        </div>
                        <div>
                          <strong>Date:</strong> {formattedDateTime}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>No Logs Found</div>
                )}
              </div>
            </div>
          </div>
          {modalContent && (
            <Modal
              content={modalContent}
              onClose={() => setModalContent(null)}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PeriodicView;
