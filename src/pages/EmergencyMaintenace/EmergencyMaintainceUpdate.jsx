import React, { useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import { useNavigate, useParams } from 'react-router-dom';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useSelector } from 'react-redux';
import MultipleUploadWidget from '../../components/MultipleUploadWidget';
import ButtonMain from './ButtonMain';
import useToast from '../../hooks/useToast';

// Utility function to format date and time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `Date: ${formattedDate}, Time: ${formattedTime}`;
};

// Utility function to get background color based on service type
const getBackgroundColor = (serviceType) => {
  switch (serviceType) {
    case 'Repair':
      return '#f0f8ff'; // Light blue
    case 'Maintenance':
      return '#f5fffa'; // Mint cream
    case 'Inspection':
      return '#fffacd'; // Lemon chiffon
    default:
      return '#f0f4f7'; // Default light gray
  }
};

const EmergencyMaintainceUpdate = () => {
  const STATUS_APPROVED = 'approved';
  const navigation  = useNavigate()
  const STATUS_WAITING_FOR_COMPLETION = 'waiting for completion';
  const { id } = useParams();
  const { showErrorToast, showSuccessToast } = useToast();
  const [UpdateEmergencyRequest, { isLoading: updateLoading }] =
    useUpdateEmergencyRequestMutation();
    
  const [modalContent, setModalContent] = useState(null);
  const [emergencyReceiptImgUrls, setEmergencyReceiptImgUrls] = useState([]);
  const { user } = useSelector((state) => state.auth);
 
  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  const [
    emergencyRepairCompletionImgUrls,
    setEmergencyRepairCompletionImgUrls 
  ] = useState([]);
 
  const [serviceData, setServiceData] = useState({
    periods: '',
    location: '',
    number: '',
    date: '',
    station: '',
    supplier: '',
    name: '',
    poNumber: '',
    poDate: '',
    portalReference: '',
    billNumber: '',
    billDate: '',
    dcNumber: '',
    dcDate: '',
    sTax: '',
    fTax: '',
    remarks: '',
  });
  if (isLoading) return <div>Loading...</div>;

  const handleImageClick = (content) => {
    setModalContent(content);
  };

  const handleUdpdateCompletionImages = async () => {
    if(emergencyRepairCompletionImgUrls.length === 0){
        showErrorToast('Please upload  Receipt image');
        return;
    }
    if(emergencyReceiptImgUrls.length === 0){
        showErrorToast('Please upload  Repair Completion image');
        return;
    }
    try {
      const updatedFormData = {
        ...EmergencyData?.data,
        status: 'waiting for completion',
        emergencyRepairCompletionImgs: emergencyRepairCompletionImgUrls,
        emergencyReceiptImgs: emergencyReceiptImgUrls,
      };

       

         await UpdateEmergencyRequest({
            id,
            formData: updatedFormData,
          }).unwrap();
          navigation(-1);
      showSuccessToast('Emergency Maintenance Updated Successfully!');
      navigator
    } catch (err) {
      console?.log(err);
      showErrorToast('Failed to update Emergency Maintenance!');
    }
  };

 

  const handleDelete = (indexToDelete, setImgUrls) => {
    setImgUrls((prevUrls) =>
      prevUrls.filter((url, index) => index !== indexToDelete),
    );
  };
  return (
    <DefaultLayout>
      <BreadcrumbNav
        pageName="Emergency & Insurance Maintenance View"
        pageNameprev="Emergency & Insurance Maintenance" //show the name on top heading
        pagePrevPath="Emergency-Maintenance" // add the previous path to the navigation
      />
      <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        <div className="flex justify-between items-end p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">
          Emergency & Insurance Maintenance Information
          </h2>
        </div>

        <div className="flex p-5 bg-brand-primary gap-5">
          <div className="flex flex-col gap-1 w-3/5	">
            <div className="grid grid-cols-2 gap-1">
              <div>
                <p className="text-md font-semibold">ID:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.id}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Registration No.:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.registrationNo}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Make:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.make}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Driver Name:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.driverName}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">GBMS:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.gbmsNo}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Station:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.station}
                </p>
              </div>

              <div>
                <p className="text-md font-semibold">Current Odometer:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.meterReading}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">CE:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.ce}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">RM / OM / Name:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.rm_omorName}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Driver Statement</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.description}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Supervisor:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.emergencySupervisor}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">APL Card No.:</p>
                <p className="text-md mb-5 font-normal">
                  {EmergencyData?.data?.aplCardNo}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Created At:</p>
                <p className="text-md mb-5 font-normal">
                  {formatDateTime(EmergencyData?.data?.created_at)}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold">Updated At:</p>
                <p className="text-md mb-5 font-normal">
                  {formatDateTime(EmergencyData?.data?.updated_at)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold">Services:</h3>
              {EmergencyData?.data?.services.length > 0 ? (
                EmergencyData?.data?.services.map((service, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 rounded-lg"
                    style={{
                      backgroundColor: getBackgroundColor(service.serviceType),
                    }}
                  >
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div>
                        <p className="text-md font-semibold">Service Code:</p>
                        <p className="text-md font-normal">
                          {service?.service_code}
                        </p>
                      </div>

                      <div>
                        <p className="text-md font-semibold">Repair Cost:</p>
                        <p className="text-md font-normal">
                          {service?.repairCost}
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-semibold">Sales Tax:</p>
                        <p className="text-md font-normal">
                          {service?.sales_tax}
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-semibold">Further Tax:</p>
                        <p className="text-md font-normal">
                          {service?.further_tax}
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-semibold">Other Costs:</p>
                        <p className="text-md font-normal">
                          {service?.other_costs}
                        </p>
                      </div>

                      <div>
                        <p className="text-md font-semibold">Repair Amount:</p>
                        <p className="text-md font-normal">
                          {service?.net_value}
                        </p>
                      </div>

                      <div>
                        <p className="text-md font-semibold">Remarks:</p>
                        <p className="text-md font-normal">
                          {service?.remarks}
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-semibold">Description:</p>
                        <p className="text-md font-normal">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-md font-normal">No services found.</p>
              )}

              

              {user?.Role?.roleName === 'companyAdmin' ? (
                <div
                  className="mb-4 p-4 rounded-lg"
                  style={{ backgroundColor: '#f0f8ff' }}
                >
                  <h3 className="text-lg font-bold">Billing Details:</h3>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div>
                      <p className="text-md font-semibold">
                        Supplier Description:
                      </p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.supplierDescription}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Po Number:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.poNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Po Date:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.poDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Bill Number:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.billNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Bill Date:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.billDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Dc Number:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.dcNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Dc Date:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.dcDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Status:</p>
                      <p className="text-md font-normal">
                        {EmergencyData?.data?.status?.charAt(0).toUpperCase() +
                          EmergencyData?.data?.status?.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div>
                <p className="text-md font-semibold">Repair Request Images:</p>
                {EmergencyData?.data?.emergencyRepairRequestImgs.length > 0 &&
                  EmergencyData?.data?.emergencyRepairRequestImgs.map(
                    (item, index) => (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                      >
                        <img
                          className="w-48 h-48 object-contain mb-4"
                          src={item}
                          alt="Repair Request"
                        />
                      </a>
                    ),
                  )}
              </div>

              <div>
                <p className="text-md font-semibold">
                  Driver Statement Videos:
                </p>
                {EmergencyData?.data?.emergencyRepairStatementVideos.length >
                  0 &&
                  EmergencyData.data.emergencyRepairStatementVideos.map(
                    (item, index) => (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                      >
                        <video
                          className="w-48 h-48 object-contain mb-4"
                          controls
                          src={item}
                          alt="Driver Statement Video"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </a>
                    ),
                  )}
              </div>

 
              <div>
                <p className="text-md font-semibold">Repair Receipt Images:</p>
                {EmergencyData?.data?.emergencyReceiptImgs.length > 0 ? (
                  EmergencyData?.data?.emergencyReceiptImgs.map(
                    (item, index) => (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                      >
                        <img
                          className="w-48 h-48 object-contain mb-4"
                          src={item}
                          alt="Receipt Images"
                        />
                      </a>
                    ),
                  )
                ) : (
                  <>
                    {EmergencyData?.data?.status == 'waiting for completion' &&
                      user?.Role?.roleName === 'regionalAdmin' && (
                        <div className="w-full pe-10 pt-10">
                          <div className="relative">
                            <MultipleUploadWidget
                              setImgUrls={setEmergencyRepairCompletionImgUrls}
                              id="emergencyRepairCompletionImgWidget"
                            />

                            <ul className=" list-disc pl-5">
                              {emergencyRepairCompletionImgUrls.map(
                                (url, index) => (
                                  <>
                                    <li key={url}>
                                      <div className="relative border border-gray-300 bg-white m-2 p-2">
                                        <button
                                          onClick={() =>
                                            handleDelete(
                                              index,
                                              setEmergencyRepairCompletionImgUrls,
                                            )
                                          }
                                          className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                          &#10005;
                                        </button>

                                        <img
                                          src={url}
                                          alt={`Emergency Job Completion Images ${index + 1}`}
                                          className="object-contain h-48 w-48"
                                        />
                                      </div>
                                    </li>
                                  </>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>

              <div>
                <p className="text-md font-semibold">
                  Repair Completion Images:
                </p>
                {EmergencyData?.data?.emergencyRepairCompletionImgs.length >
                0 ? (
                  EmergencyData?.data?.emergencyRepairCompletionImgs.map(
                    (item, index) => (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                      >
                        <img
                          className="w-48 h-48 object-contain mb-4"
                          src={item}
                          alt="Completion Images"
                        />
                      </a>
                    ),
                  )
                ) : (
                  <>
                    {EmergencyData?.data?.status == 'waiting for completion' &&     user?.Role?.roleName ===    'regionalAdmin' && (
                          <>
                            <div className="w-full pe-10 pt-10">
                              <div className="relative">
                                <MultipleUploadWidget
                                  setImgUrls={setEmergencyReceiptImgUrls}
                                  id="emergencyReceiptImgWidget"
                                />

                                <ul className="list-disc pl-5">
                                  {emergencyReceiptImgUrls.map((url, index) => (
                                    <>
                                      <li key={url}>
                                        <div className="relative border border-gray-300 bg-white m-2 p-2">
                                          <button
                                            onClick={() =>
                                              handleDelete(
                                                index,
                                                setEmergencyReceiptImgUrls,
                                              )
                                            }
                                            className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white rounded-full p-1"
                                          >
                                            &#10005;
                                          </button>
                                          <img
                                            src={url}
                                            alt={`Emergency Receipt Image ${index + 1}`}
                                            className="object-contain h-48 w-48"
                                          />
                                        </div>
                                      </li>
                                    </>
                                  ))}
                                </ul>
                              </div>
                             
                            </div>
                          </>
                        )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-2 flex flex-col flex-auto h-[100vh]">
            <div className="h-[5vh] font-bold border-b-2 border-black flex justify-center items-center">
            Emergency & Insurance Maintenance Logs
            </div>
            <div className="max-h-[95vh] overflow-y-auto">
              {EmergencyData?.data?.emergencyMaintenanceLogs.length > 0 ? (
                EmergencyData?.data?.emergencyMaintenanceLogs.map((e, i) => {
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
        {EmergencyData?.data?.emergencyRepairCompletionImgs.length === 0 && EmergencyData?.data?.status == 'waiting for completion' &&     user?.Role?.roleName ===    'regionalAdmin' && (
            <div className='p-10 flex justify-end items-center'>

            <ButtonMain
              clicked={handleUdpdateCompletionImages}
              bg="bg-primary"
              text="Update Completion Images"
            />
            </div>
        )
        }
        {modalContent && (
          <Modal content={modalContent} onClose={() => setModalContent(null)} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default EmergencyMaintainceUpdate;
