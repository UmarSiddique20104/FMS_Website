import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import { useParams } from 'react-router-dom';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useSelector } from 'react-redux';
import { CustomSelect, CustomTextArea, InputField } from './EmergencyComponent';
import { customStyles } from '../../constants/Styles';
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

const EmergencyMntView = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { showErrorToast, showSuccessToast } = useToast();
  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);

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

  const [modalContent, setModalContent] = useState(null);
  const [seletedSupplier, setSelectedSupplier] = useState();
  const [supplierData, setSupplierData] = useState([]);
  const [supplierCode, setSupplierCode] = useState([]);
  const [billDetailsValues, setBillDetailsValues] = useState({
    poNumber: '',
    poDate: '',
    billNumber: '',
    billDate: '',
    dcNumber: '',
    dcDate: '',
    documentDate: '',
    remarks: '',
    statisFactionRemarks: '',
  });

  const [emergencyReceiptImgUrls, setEmergencyReceiptImgUrls] = useState([]);
  const [UpdateEmergencyRequest] = useUpdateEmergencyRequestMutation();
  const [
    emergencyRepairCompletionImgUrls,
    setEmergencyRepairCompletionImgUrls,
  ] = useState([]);

  // Fetching supplier data only once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          redirect: 'follow',
        };
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/emergency-creation/supplier`,
          requestOptions,
        );
        const result = await response.json();
        const supplier = result?.data;

        const formatSupplierCode = supplier.map((supplier) => ({
          value: supplier.supplier_id,
          label: `${supplier.supplier_id} - ${supplier.name}`,
        }));

        setSupplierCode(formatSupplierCode);
        setSupplierData(supplier);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  const handleSupplierChange = (option) => {
    const selectedSupplier = supplierData.find(
      (supplier) => supplier.supplier_id === option,
    );
    setSelectedSupplier(selectedSupplier);
  };

  const handleDelete = (indexToDelete, setImgUrls) => {
    setImgUrls((prevUrls) =>
      prevUrls.filter((url, index) => index !== indexToDelete),
    );
  };

  const handleSubmit = async () => {
    try {
      const updatedFormData = { ...EmergencyData?.data };

      if (EmergencyData?.data?.status == 'inspection done') {
        if (!billDetailsValues.billDate) {
          showErrorToast(
            'Bill Date is required. Please provide the Bill Date to proceed.',
          );
          return;
        }
        if (!billDetailsValues.billNumber) {
          showErrorToast(
            'Bill Number is required. Please enter the Bill Number to proceed.',
          );
          return;
        }
        if (!seletedSupplier) {
          showErrorToast(
            'Supplier selection is required. Please choose a Supplier to proceed.',
          );
          return;
        }
        if (!billDetailsValues.dcDate) {
          showErrorToast(
            'DC Date is required. Please provide the Delivery Challan (DC) Date to proceed.',
          );
          return;
        }
        if (!billDetailsValues.dcNumber) {
          showErrorToast(
            'DC Number is required. Please enter the Delivery Challan (DC) Number to proceed.',
          );
          return;
        }
        if (!billDetailsValues.documentDate) {
          showErrorToast(
            'Document Date is required. Please provide the Document Date to proceed.',
          );
          return;
        }
        if (!billDetailsValues.poDate) {
          showErrorToast(
            'PO Date is required. Please provide the Purchase Order (PO) Date to proceed.',
          );
          return;
        }
        if (!billDetailsValues.poNumber) {
          showErrorToast(
            'PO Number is required. Please enter the Purchase Order (PO) Number to proceed.',
          );
          return;
        }
        if (!billDetailsValues.remarks) {
          showErrorToast(
            'Remarks are required. Please provide Remarks to proceed.',
          );
          return;
        }
        if (!billDetailsValues.statisFactionRemarks) {
          showErrorToast(
            'Statisfaction Remarks are required. Please provide Statisfaction Remarks to proceed.',
          );
          return;
        }
        if (emergencyReceiptImgUrls.length === 0) {
          showErrorToast('Please upload Repair Receipt Images to proceed.');
          return;
        }
        if (emergencyRepairCompletionImgUrls.length === 0) {
          showErrorToast('Please upload Repair Completion Images to proceed.');
          return;
        }
        console.log('emergencyReceiptImgUrls', seletedSupplier);
        updatedFormData.supplier = seletedSupplier.supplier_id;
        updatedFormData.supplierDescription = seletedSupplier.name;
        updatedFormData.poNumber = billDetailsValues.poNumber;
        updatedFormData.poDate = billDetailsValues.poDate;
        updatedFormData.billNumber = billDetailsValues.billNumber;
        updatedFormData.billDate = billDetailsValues.billDate;
        updatedFormData.dcNumber = billDetailsValues.dcNumber;
        updatedFormData.dcDate = billDetailsValues.dcDate;
        updatedFormData.documentDate = billDetailsValues.documentDate;
        updatedFormData.remarks = billDetailsValues.remarks;
        updatedFormData.statisFactionRemarks =
          billDetailsValues.statisFactionRemarks;
        updatedFormData.status = 'wating for completion';
        updatedFormData.emergencyReceiptImgs = emergencyReceiptImgUrls;
        updatedFormData.emergencyRepairCompletionImgs =
          emergencyRepairCompletionImgUrls;
      }
      console.log(updatedFormData);
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
                  {console.log('EmergencyData?.data?.id', EmergencyData?.data)}
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

              {EmergencyData?.data?.status == 'inspection done' &&
              user?.Role?.roleName ? (
                <div>
                  <div className=" ">
                    <h1 className="text-xl font-bold pb-10">
                      Add Billing Details
                    </h1>
                  </div>
                  <div className="border mb-4">
                    <div className="grid   md:grid-cols-2   gap-5 px-4 pt-6  ">
                      <div className="w-full ">
                        <CustomSelect
                          important={true}
                          label="Select Supplier Code"
                          options={supplierCode}
                          value={seletedSupplier?.supplier_id}
                          onChange={(option) => handleSupplierChange(option)}
                          placeholder="Select Supplier Code"
                          customStyles={customStyles}
                        />
                      </div>
                      <InputField
                        label="Supplier Description"
                        name="supplierDescription"
                        id={`supplierDescription`}
                        placeholder="Supplier Description"
                        type="text"
                        value={seletedSupplier?.name}
                        disabled={true}
                        readOnly
                      />

                      <InputField
                        label="PO Number"
                        name="poNumber"
                        id={`poNumber`}
                        placeholder="PO Number"
                        type="text"
                        value={billDetailsValues.poNumber}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            poNumber: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="PO Date"
                        name="poDate"
                        id={`poDate`}
                        placeholder="PO Date"
                        type="date"
                        value={billDetailsValues.poDate}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            poDate: e.target.value,
                          })
                        }
                      />

                      <InputField
                        label="Bill Number"
                        name="billNumber"
                        id={`billNumber`}
                        placeholder="Bill Number"
                        type="text"
                        value={billDetailsValues.billNumber}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            billNumber: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Bill Date"
                        name="billDate"
                        id={`billDate`}
                        placeholder="Bill Date"
                        type="date"
                        value={billDetailsValues.billDate}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            billDate: e.target.value,
                          })
                        }
                      />

                      <InputField
                        label="DC Number"
                        name="dcNumber"
                        id={`dcNumber`}
                        placeholder="DC Number"
                        type="text"
                        value={billDetailsValues.dcNumber}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            dcNumber: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="DC Date"
                        name="dcDate"
                        id={`dcDate`}
                        placeholder="DC Date"
                        type="date"
                        value={billDetailsValues.dcDate}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            dcDate: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Document date"
                        name="documentDate"
                        id={`documentDate`}
                        placeholder="Document date"
                        type="date"
                        value={billDetailsValues.documentDate}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            documentDate: e.target.value,
                          })
                        }
                      />

                      <CustomTextArea
                        label="Remarks"
                        placeholder="Enter your remarks here"
                        rows={5}
                        value={billDetailsValues.remarks}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            remarks: e,
                          })
                        }
                      />
                    </div>
                    <div className="gap-5 px-4 py-6 mb-8">
                      <CustomTextArea
                        label="Satisfaction Remarks"
                        placeholder="Enter your Satisfaction Remarks here"
                        rows={5}
                        value={billDetailsValues.statisFactionRemarks}
                        onChange={(e) =>
                          setBillDetailsValues({
                            ...billDetailsValues,
                            statisFactionRemarks: e,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {EmergencyData?.data?.status === 'wating for completion' ? (
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
            </div>

            <div className=" grid grid-cols-2 gap-1 w-full ">
              <div className="w-full">
                <p className="text-md font-semibold pb-10">
                  Repair Receipt Images:
                </p>

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
                    {' '}
                    {
                      <div className="w-full pe-10 ">
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
                    }
                  </>
                )}
              </div>

              <div className="w-full">
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
                    {
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
                    }
                  </>
                )}
              </div>

              {console.log(EmergencyData?.data?.status)}
            </div>
            {EmergencyData?.data?.status !== 'completed' && (
              <div className=" flex justify-end items-end pt-20 pb-10 pe-10">
                <ButtonMain
                  clicked={handleSubmit}
                  text="Submit"
                  bg={'bg-primary'}
                />
              </div>
            )}
          </div>

          <div className="border-2 flex flex-col flex-auto h-[100vh]">
            <div className="h-[5vh] font-bold border-b-2 border-black flex justify-center items-center">
              Emergency Maintenance Logs
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
        {modalContent && (
          <Modal content={modalContent} onClose={() => setModalContent(null)} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default EmergencyMntView;
