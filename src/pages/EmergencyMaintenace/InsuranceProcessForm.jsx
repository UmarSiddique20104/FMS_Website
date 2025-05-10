import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useToast from '../../hooks/useToast';
import { FaChartSimple } from 'react-icons/fa6';
import MultipleUploadWidget2 from '../../components/MultiUploadRestrict';
import MultipleUploadWidget from '../../components/MultipleUploadWidget';

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

const InsuranceProcessForm = () => {
  const SERVEY_COMPLETED = 'survey completed';
  const SERVEY_APPOINTED = 'surveyor appointed';
  const REPAIR_APPROVED = 'repair approved';
  const REPAIR_REJECTED = 'repair rejected';
  const SERVEY_LODGE = 'insurance lodge';
  const DONE_ISPECTTION = 'inspection done';

  // Hooks should be defined at the top level and not conditionally
  const { showErrorToast, showSuccessToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  const [estimatedCostImage, setEstimatedCostImage] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [UpdateEmergencyRequest, { isLoading: updateLoading }] =
    useUpdateEmergencyRequestMutation();

  const [insuranceValue, setInsuranceValue] = useState({
    surveyorName: '',
    surveyorNumber: '',
    remarks: '',
  });

  useEffect(() => {

    if (EmergencyData?.data?.emergencyMaintenanceInsurance[0]) {
      setInsuranceValue({
        surveyorName:
          EmergencyData?.data?.emergencyMaintenanceInsurance[0]?.surveyorName ||
          '',
        surveyorNumber:
          EmergencyData?.data?.emergencyMaintenanceInsurance[0]
            ?.surveyorNumber || '',
        remarks:
          EmergencyData?.data?.emergencyMaintenanceInsurance[0]?.remarks || '',
      });
    }
   
    console.log(insuranceValue)
  }, [EmergencyData]);

  const handleSubmit = async () => {
    if (
      !insuranceValue.surveyorName ||
      !insuranceValue.surveyorNumber ||
      !insuranceValue.remarks
    ) {
      showErrorToast('Please fill all the fields');
      return;
    }

    try {
      const updatedFormData = {
        ...EmergencyData?.data,
        insuranceDetails: {
          id: EmergencyData?.data?.insuranceDetails?.id || null,
          surveyorName: insuranceValue.surveyorName,
          surveyorNumber: insuranceValue.surveyorNumber,
          remarks: insuranceValue.remarks,
        },
        status: SERVEY_APPOINTED,
      };

      await UpdateEmergencyRequest({
        id,
        formData: updatedFormData,
      }).unwrap();
      showSuccessToast('Request Processed Successfully!');
      navigate(-1);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleSubmitByCompanyAdminAfterSavourAppionted = async () => {
    try {
      if (!estimatedCost || estimatedCost <= 0) {
        showErrorToast('Estimated Cost is required');
        return;
      }
      if (!estimatedCostImage) {
        showErrorToast('Estimated Cost Image is required');
        return;
      }
      const updatedFormData = {
        ...EmergencyData?.data,
        estimatedCost: estimatedCost,
        estimatedCostImage: estimatedCostImage,
        status: SERVEY_COMPLETED,
      };
      // console.log(updatedFormData)
      await UpdateEmergencyRequest({
        id,
        formData: updatedFormData,
      }).unwrap();
      showSuccessToast('Request Processed Successfully!');
      navigate(-1);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleChangeStatus = async (status) => {
    try {
      const updatedFormData = {
        ...EmergencyData?.data,
        status: status,
      };
      await UpdateEmergencyRequest({
        id,
        formData: updatedFormData,
      }).unwrap();
      showSuccessToast('Request Processed Successfully!');
      navigate(-1);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleApprove = async () => {
    return handleChangeStatus(REPAIR_APPROVED);
  };
  const handleRejectApprve = async () => {
    return handleChangeStatus(REPAIR_REJECTED);
  };

  const handleRejectInsurance = async () => {
    try {
      const updatedFormData = {
        ...EmergencyData?.data,
        sendForInsurance: false,
        rejectedByInsurace: true,
        status: 'approved',
      };
      await UpdateEmergencyRequest({
        id,
        formData: updatedFormData,
      }).unwrap();
      showSuccessToast('Request Processed Successfully!');
      navigate(-1);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleDelete = (indexToDelete, setImgUrls) => {
    setImgUrls((prevUrls) =>
      prevUrls.filter((url, index) => index !== indexToDelete),
    );
  };

  console.log(EmergencyData?.data?.estimatedCostImage)
  return (
    <DefaultLayout>
      {isLoading && <div>Loading...</div>}
      <h2 className="text-title-xl font-semibold text-[#422AFB] dark:text-white">
        Insurance Process Form
      </h2>
      <div className="flex justify-end items-end mb-4 gap-3">
        <Link
          to="/emergency-maintenance"
          className="btn h-[30px] bg-primary text-white   min-h-[30px] text-sm border-slate-200 hover:bg-opacity-70 dark:text-white dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md"
        >
          Emergency & Insurance Maintenance
        </Link>
      </div>

      <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        <div className="flex justify-between items-end p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Information</h2>
        </div>

        <div className="flex p-5 bg-brand-primary gap-5">
          <div className="flex flex-col gap-1 w-3/5">
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

              <div className="flex flex-col gap-5 w-full">
                <div className="flex justify-between w-full items-end py-6 border-b border-t mt-5 border-gray-200">
                  <h2 className="text-xl font-bold">Insurance Details </h2>
                </div>
                {user?.Role?.roleName === 'insuranceAdmin' ? (
                  <>
                    <div className="w-full  ">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="surveyorName"
                      >
                        Surveyor Name
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          disabled={
                            EmergencyData?.data?.status === SERVEY_LODGE
                              ? false
                              : true
                          }
                          name="surveyorName"
                          placeholder="Enter Surveyor Name"
                          value={insuranceValue?.surveyorName}
                          onChange={(e) =>
                            setInsuranceValue({
                              ...insuranceValue,
                              surveyorName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="w-full  ">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="surveyorNumber"
                      >
                        Surveyor Number
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="phone"
                          name="surveyorNumber"
                          min={0}
                          placeholder="Enter Surveyor Number"
                          disabled={ 
                            EmergencyData?.data?.status === SERVEY_LODGE
                              ? false
                              : true
                          }
                          value={insuranceValue?.surveyorNumber}
                          onChange={(e) =>
                            setInsuranceValue({
                              ...insuranceValue,
                              surveyorNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="w-full  ">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="remarks"
                      >
                        Add Remarks For insurance
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full rounded border border-stroke bg-gray py-3 pl-4 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="remarks"
                          id="remarks"
                          disabled={
                            EmergencyData?.data?.status === SERVEY_LODGE
                              ? false
                              : true
                          }
                          rows={6}
                          placeholder="Enter Remarks"
                          value={insuranceValue?.remarks}
                          onChange={(e) =>
                            setInsuranceValue({
                              ...insuranceValue,
                              remarks: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                     {EmergencyData?.data?.status  !== "insurance lodge" &&
                     
                     <div className="relative pt-4">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="remarks"
                      >
                        Estimated Cost By Admin
                      </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="number"
                          name="estimatedCost" 
                          placeholder="Enter Estimated Cost"
                          disabled={  true }
                          value={EmergencyData?.data?.estimatedCost}
                         
                        />
                      </div>}
                      {
                        console.log("value={EmergencyData?.data?.estimatedCost" ,EmergencyData?.data)
                      }

                    
                      {EmergencyData?.data?.estimatedCostImage && 
 
                        EmergencyData?.data?.estimatedCostImage?.length != 0 && (
 
                          <div className="pt-4">
                            <label
                              className="mb-3 block text-md font-medium text-black dark:text-white"
                              htmlFor="estimatedCostImage"
                            >
                              Estimated Cost Receipt Images
                            </label>
                            <ul>
                              {EmergencyData?.data?.estimatedCostImage.map(
                                (url, index) => (
                                  <li key={url}>
                                    <div className="relative   bg-white m-2 p-2">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={index}
                                      >
                                        <img
                                          src={url}
                                          alt={`Estimated Cost Image ${index + 1}`}
                                          className="object-contain h-full w-full"
                                        />
                                      </a>
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-md font-semibold">Surveyor Name:</p>
                      <p className="text-md mb-5 font-normal">
                        {
                          EmergencyData?.data?.emergencyMaintenanceInsurance[0]
                            ?.surveyorName
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-md font-semibold">Surveyor Number:</p>
                      <p className="text-md mb-5 font-normal">
                        {
                          EmergencyData?.data?.emergencyMaintenanceInsurance[0]
                            ?.surveyorNumber
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-md font-semibold">Surveyor Remarks:</p>
                      <p className="text-md mb-5 font-normal">
                        {
                          EmergencyData?.data?.emergencyMaintenanceInsurance[0]
                            ?.remarks
                        }
                      </p>
                    </div>
                  </>
                )}

                {(user?.Role?.roleName === 'companyAdmin' ||
                  user?.Role?.roleName === 'supervisor') &&
                  EmergencyData?.data?.status === SERVEY_APPOINTED && (
                    <>
                      <div className="w-full  ">
                        <label
                          className="mb-3 block text-md font-medium text-black dark:text-white"
                          htmlFor="estimatedCost"
                        >
                          Enter Estimated Cost
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="number"
                            name="estimatedCost"
                            placeholder="Enter Estimated Cost"
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="w-full pe-10 pt-10">
                          <div className="relative">
                            <MultipleUploadWidget
                              setImgUrls={setEstimatedCostImage}
                              id="emergencyReceiptImgWidget"
                            />

                            <ul className="list-disc pl-5">
                              {estimatedCostImage?.map((url, index) => (
                                <>
                                  <li key={url}>
                                    <div className="relative border border-gray-300 bg-white m-2 p-2">
                                      <button
                                        onClick={() =>
                                          handleDelete(
                                            index,
                                            setEstimatedCostImage,
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
                      </div>
                      <ButtoMain
                        clicked={handleSubmitByCompanyAdminAfterSavourAppionted}
                        text="Submit"
                        bg="bg-primary"
                      />
                    </>
                  )}
                {(user?.Role?.roleName === 'companyAdmin' ||
                  user?.Role?.roleName === 'supervisor') &&
                  (EmergencyData?.data?.status === SERVEY_COMPLETED ||
                    EmergencyData?.data?.status === REPAIR_APPROVED ||
                    EmergencyData?.data?.status === DONE_ISPECTTION) && (
                    <div>
                      <p className="text-md font-semibold">Estimated Cost:</p>
                      <p className="text-md mb-5 font-normal">
                        {EmergencyData?.data?.estimatedCost}
                      </p>
                    </div>
                  )}

                {(EmergencyData?.data?.status === SERVEY_COMPLETED ||
                  EmergencyData?.data?.status === DONE_ISPECTTION ||
                  EmergencyData?.data?.status === 'satisfaction note issued' ||
                  EmergencyData?.data?.status === 'completed') && (
                  <>
                 {user?.Role?.roleName !== "insuranceAdmin"&& <>

                    <div className="w-full  ">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="estimatedCost"
                      >
                        Enter Estimated Cost
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          disabled={true}
                          name="estimatedCost"
                          placeholder="Enter Estimated Name"
                          value={EmergencyData?.data?.estimatedCost}
                        />
                      </div>
                    </div>
                    <div>
                      {EmergencyData?.data?.estimatedCostImage &&
                        EmergencyData?.data?.estimatedCostImage.length > 0 && (
                          <ul>
                            {EmergencyData?.data?.estimatedCostImage.map(
                              (url, index) => (
                                <li key={url}>
                                  <div className="relative   bg-white m-2 p-2">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      key={index}
                                    >
                                      <img
                                        src={url}
                                        alt={`Estimated Cost Image ${index + 1}`}
                                        className="object-contain h-full w-full"
                                      />
                                    </a>
                                  </div>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  </>}
                  </>
                )}

                {EmergencyData?.data?.status === SERVEY_LODGE &&
                  user?.Role?.roleName === 'insuranceAdmin' && (
                    <div className=" flex  justify-start items-center  gap-5">
                      <ButtoMain
                        clicked={handleRejectInsurance}
                        text="Reject"
                        bg="bg-danger"
                      />
                      <ButtoMain
                        clicked={handleSubmit}
                        text="Submit"
                        bg="bg-primary"
                      />
                    </div>
                  )}

                {EmergencyData?.data?.status === SERVEY_COMPLETED &&
                  user?.Role?.roleName === 'insuranceAdmin' && (
                    <>
                      <div className="flex  gap-5 justify-end">
                        <ButtoMain
                          clicked={handleRejectApprve}
                          text="Reject Insurance"
                          bg="bg-danger"
                        />
                        <ButtoMain
                          clicked={handleApprove}
                          text="Approve  Insurance"
                          bg="bg-primary"
                        />
                      </div>
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
      </div>
    </DefaultLayout>
  );
};

export default InsuranceProcessForm;

const ButtoMain = ({ clicked, bg, text }) => {
  return (
    <div className="flex justify-end gap-4.5">
      <div
        className={`flex justify-center cursor-pointer rounded border
                       border-stroke py-2 px-6 font-medium  text-white  ${bg}`}
        onClick={clicked}
      >
        {text}
      </div>
    </div>
  );
};
