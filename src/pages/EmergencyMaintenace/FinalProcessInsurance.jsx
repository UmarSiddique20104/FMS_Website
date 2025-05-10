import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useToast from '../../hooks/useToast';
import {
  CustomSelect,
  InputField,
  EmergencyComponent,
  CustomTextArea,
} from './EmergencyComponent';
import { customStyles } from '../../constants/Styles';
import ButtonMain from './ButtonMain';
import MultipleUploadWidget from '../../components/MultipleUploadWidget';

// Utility function to format date and time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return `Date: ${date.toLocaleDateString()}, Time: ${date.toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  )}`;
};

// Utility function to get background color based on service type
const getBackgroundColor = (serviceType) => {
  switch (serviceType) {
    case 'Repair':
      return '#f0f8ff';
    case 'Maintenance':
      return '#f5fffa';
    case 'Inspection':
      return '#fffacd';
    default:
      return '#f0f4f7';
  }
};

// Reusable component for displaying details
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-md font-semibold">{label}:</p>
    <p className="text-md mb-5 font-normal">{value}</p>
  </div>
);

// Component for displaying each service detail
const ServiceDetail = ({ service }) => (
  <div
    className="mb-4 p-4 rounded-lg"
    style={{ backgroundColor: getBackgroundColor(service.serviceType) }}
  >
    <div className="grid grid-cols-2 gap-1">
      <DetailItem label="Service Code" value={service?.service_code} />
      <DetailItem label="Repair Cost" value={service?.repairCost} />
      <DetailItem label="Sales Tax" value={service?.sales_tax} />
      <DetailItem label="Further Tax" value={service?.further_tax} />
      <DetailItem label="Other Costs" value={service?.other_costs} />
      <DetailItem label="Repair Amount" value={service?.net_value} />
      <DetailItem label="Remarks" value={service?.remarks} />
      <DetailItem label="Description" value={service?.description} />
    </div>
  </div>
);

// Reusable component for media items (images/videos)
const MediaItem = ({ items, label, isVideo = false }) => (
  <div>
    <p className="text-md font-semibold py-5">{label}:</p>
    {items.length > 0 ? (
      items.map((item, index) => (
        <a href={item} target="_blank" rel="noopener noreferrer" key={index}>
          {isVideo ? (
            <video
              className="w-48 h-48 object-contain mb-4"
              controls
              src={item}
            />
          ) : (
            <img
              className="w-48 h-48 object-contain mb-4"
              src={item}
              alt={label}
            />
          )}
        </a>
      ))
    ) : (
      <p className="text-md font-normal">No {label.toLowerCase()} found.</p>
    )}
  </div>
);

// Insurance details component
const InsuranceDetail = ({ insuranceData }) => (
  <>
    <DetailItem label="Surveyor Name" value={insuranceData?.surveyorName} />
    <DetailItem label="Surveyor Number" value={insuranceData?.surveyorNumber} />
    <DetailItem label="Surveyor Remarks" value={insuranceData?.remarks} />
  </>
);

const FinalProcessInsurance = () => {
  const { showErrorToast, showSuccessToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  const [UpdateEmergencyRequest] = useUpdateEmergencyRequestMutation();

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
        updatedFormData.status = 'satisfaction note issued';
        updatedFormData.emergencyReceiptImgs = emergencyReceiptImgUrls;
        updatedFormData.emergencyRepairCompletionImgs =
          emergencyRepairCompletionImgUrls;
      }

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          redirect: 'follow',
        };

        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/emergency-creation/supplier`,
          requestOptions,
        )
          .then((response) => response.json())
          .then((result) => {
            const supplier = result?.data;
             

            const formatSupplierCode = supplier.map((supplier) => {
              return {
                value: supplier.supplier_id,
                label: supplier.supplier_id + ' - ' + supplier.name,
              };
            });
            setSupplierCode(formatSupplierCode);
            setSupplierData(supplier);
          })
          .catch((error) => console.error(error));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);
  const handleSupplierChange = (option) => {
    const selectedSupplier = supplierData.find(
      (supplier) => supplier.supplier_id === option,
    );
    setSelectedSupplier(selectedSupplier); 
  };

  const [emergencyReceiptImgUrls, setEmergencyReceiptImgUrls] = useState([]);

  const [
    emergencyRepairCompletionImgUrls,
    setEmergencyRepairCompletionImgUrls,
  ] = useState([]);
  const handleDelete = (indexToDelete, setImgUrls) => {
    setImgUrls((prevUrls) =>
      prevUrls.filter((url, index) => index !== indexToDelete),
    );
  };

  return (
    <DefaultLayout>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-title-xl font-semibold text-[#422AFB] dark:text-white">
            Insurance Process Form
          </h2>
          <div className="flex justify-end items-end mb-4 gap-3">
            <Link
              to="/emergency-maintenance"
              className="btn h-[30px] text-sm border-slate-200 hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md bg-primary text-white"
            >
              Emergency & Insurance Maintenance
            </Link>
          </div>

          <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-end p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Information</h2>
            </div>

            <div className="flex p-5 bg-brand-primary">
              <div className="flex flex-col gap-1 w-3/5">
                <div className="grid grid-cols-2 gap-1">
                  <DetailItem label="ID" value={EmergencyData?.data?.id} />
                  <DetailItem
                    label="Registration No."
                    value={EmergencyData?.data?.registrationNo}
                  />
                  <DetailItem label="Make" value={EmergencyData?.data?.make} />
                  <DetailItem
                    label="Driver Name"
                    value={EmergencyData?.data?.driverName}
                  />
                  <DetailItem
                    label="GBMS"
                    value={EmergencyData?.data?.gbmsNo}
                  />
                  <DetailItem
                    label="Station"
                    value={EmergencyData?.data?.station}
                  />
                  <DetailItem
                    label="Current Odometer"
                    value={EmergencyData?.data?.meterReading}
                  />
                  <DetailItem label="CE" value={EmergencyData?.data?.ce} />
                  <DetailItem
                    label="RM / OM / Name"
                    value={EmergencyData?.data?.rm_omorName}
                  />
                  <DetailItem
                    label="Driver Statement"
                    value={EmergencyData?.data?.description}
                  />
                  <DetailItem
                    label="Supervisor"
                    value={EmergencyData?.data?.emergencySupervisor}
                  />
                  <DetailItem
                    label="APL Card No."
                    value={EmergencyData?.data?.aplCardNo}
                  />
                  <DetailItem
                    label="Created At"
                    value={formatDateTime(EmergencyData?.data?.created_at)}
                  />
                  <DetailItem
                    label="Updated At"
                    value={formatDateTime(EmergencyData?.data?.updated_at)}
                  />
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-bold">Services:</h3>
                  {EmergencyData?.data?.services?.length > 0 ? (
                    EmergencyData.data.services.map((service, index) => (
                      <ServiceDetail key={index} service={service} />
                    ))
                  ) : (
                    <p className="text-md font-normal">No services found.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <MediaItem
                    label="Repair Request Images"
                    items={EmergencyData?.data?.emergencyRepairRequestImgs}
                  />
                  <MediaItem
                    label="Driver Statement Videos"
                    items={EmergencyData?.data?.emergencyRepairStatementVideos}
                    isVideo
                  />

                  {user?.Role?.roleName === 'companyAdmin' &&
                  (EmergencyData?.data?.status ===
                    'satisfaction note issued' ||
                    EmergencyData?.data?.status === 'completed') ? (
                    <>
                      <MediaItem
                        label="Emergency Job Completion Images"
                        items={
                          EmergencyData?.data?.emergencyRepairCompletionImgs
                        }
                      />
                      <MediaItem
                        label="Repair Receipt Images"
                        items={EmergencyData?.data?.emergencyReceiptImgs}
                      />
                    </>
                  ) : null}
                </div>

                <div className="py-6 border-t mt-5">
                  <h2 className="text-xl font-bold">Insurance Details</h2>
                  <InsuranceDetail
                    insuranceData={
                      EmergencyData?.data?.emergencyMaintenanceInsurance[0]
                    }
                  />
                  <DetailItem
                    label="Estimated Cost"
                    value={EmergencyData?.data?.estimatedCost}
                  />
                  {EmergencyData?.data?.estimatedCostImage &&
                      <MediaItem
                      label="Estimated Cost Receipt Images"
                      items={EmergencyData?.data?.estimatedCostImage}
                    />
                  }
                </div>
              </div>

              <div className="border-2 flex flex-col flex-auto h-[100vh]">
                <div className="h-[5vh] font-bold border-b-2 border-black flex justify-center items-center">
                Emergency & Insurance Maintenance Logs
                </div>
                <div className="max-h-[95vh] overflow-y-auto">
                  {EmergencyData?.data?.emergencyMaintenanceLogs.length > 0 ? (
                    EmergencyData?.data?.emergencyMaintenanceLogs.map(
                      (e, i) => {
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
                      },
                    )
                  ) : (
                    <div>No Logs Found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {(user?.Role?.roleName === 'companyAdmin' || user?.Role?.roleName === 'supervisor') &&
          (EmergencyData?.data?.status === 'satisfaction note issued' ||
            EmergencyData?.data?.status === 'completed') ? (
            <>
              <div className="flex justify-between items-end p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Billing Details</h2>
              </div>
              <div className="flex p-5 bg-brand-primary">
                <div className="flex flex-col gap-1 w-4/5">
                  <div className="grid grid-cols-2 gap-1">
                    <DetailItem
                      label="Supplier Code"
                      value={EmergencyData?.data?.supplierCode}
                    />
                    <DetailItem
                      label="Supplier Description"
                      value={EmergencyData?.data?.supplierDescription}
                    />
                    <DetailItem
                      label="PO Number"
                      value={EmergencyData?.data?.poNumber}
                    />
                    <DetailItem
                      label="PO Date"
                      value={EmergencyData?.data?.poDate}
                    />
                    <DetailItem
                      label="Bill Number"
                      value={EmergencyData?.data?.billNumber}
                    />
                    <DetailItem
                      label="Bill Date"
                      value={EmergencyData?.data?.billDate}
                    />
                    <DetailItem
                      label="DC Number"
                      value={EmergencyData?.data?.dcNumber}
                    />
                    <DetailItem
                      label="DC Date"
                      value={EmergencyData?.data?.dcDate}
                    />
                    <DetailItem
                      label="Document date"
                      value={EmergencyData?.data?.documentDate}
                    />
                    <DetailItem
                      label="Remarks"
                      value={EmergencyData?.data?.description}
                    />
                    <DetailItem
                      label="Satisfaction Remarks"
                      value={EmergencyData?.data?.remarks}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {(user?.Role?.roleName === 'companyAdmin' || user?.Role?.roleName === 'supervisor') &&
          EmergencyData?.data?.status === 'inspection done' ? (
            <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <div className="flex justify-between items-end p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold"> Add Billing Details</h2>
              </div>

              <div>
                <div className="grid lg:grid-cols-4  md:grid-cols-2   gap-5 border px-4 py-6 mb-8">
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
              </div>

              <div className="px-4">
                <CustomTextArea
                  label="Statisfaction Remarks"
                  placeholder="Enter your remarks here"
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

              <div className="flex  justify-around    py-10">
                <div>
                  <p className="text-md font-semibold ">
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
                      {EmergencyData?.data?.status === 'inspection done' &&
                         (user?.Role?.roleName === 'companyAdmin' || user?.Role?.roleName === 'supervisor')  && (
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
                      {EmergencyData?.data?.status == 'inspection done' &&
                        (user?.Role?.roleName === 'companyAdmin' || user?.Role?.roleName === 'supervisor') && (
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

              <div className=" flex justify-end items-end py-10 pe-10">
                <ButtonMain
                  clicked={handleSubmit}
                  text="Submit"
                  bg={'bg-primary'}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </DefaultLayout>
  );
};

export default FinalProcessInsurance;
