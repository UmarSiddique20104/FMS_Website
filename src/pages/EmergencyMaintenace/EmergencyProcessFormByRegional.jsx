import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import useToast from '../../hooks/useToast';
import { useGetVehicleByCompanyIdQuery, useGetVehicleQuery } from '../../services/vehicleSlice';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import LoadingButton from '../../components/LoadingButton';
import Select from 'react-select';
import {
  stationOptions,
  vendorType,
  indoorVendorName,
  serviceType,
} from '../../constants/Data';
import AsyncSelect from 'react-select/async';
import { customStyles } from '../../constants/Styles';
import MultipleUploadWidget from '../../components/MultipleUploadWidget';
import {
  addEmergencyRequestSchema,
  addNewFormSchema,
} from '../../utils/schemas';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import {
  CustomSelect,
  InputField,
  EmergencyComponent, 
} from './EmergencyComponent';
 

const EmergencyProcessFormByRegional = () => {
  const [serviceValues, setServiceValues] = useState({});
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [supplierData, setSupplierData] = useState([]);
  const [supplierCode, setSupplierCode] = useState([]);
  const [seletedSupplier, setSelectedSupplier] = useState();
  const { showErrorToast, showSuccessToast } = useToast();
  const { user } = useSelector((state) => state.auth); 
  const [allServices, setAllServices] = useState([]);
  const [formSevivces, setFormServices] = useState([]);

  const [formValues, setFormValues] = useState({
    ...addEmergencyRequestSchema,
  });
   
  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  const { data:vehicleDetails,   } = useGetVehicleQuery(EmergencyData?.data?.registrationNo);
  
  const [UpdateEmergencyRequest, { isLoading: updateLoading }] =
    useUpdateEmergencyRequestMutation();
  const [
    emergencyRepairCompletionImgUrls,
    setEmergencyRepairCompletionImgUrls,
  ] = useState([]);
  const [emergencyReceiptImgUrls, setEmergencyReceiptImgUrls] = useState([]);

  useEffect(() => {
    if (EmergencyData) {
      let eData = EmergencyData?.data;
    
      setFormValues({
        ...formValues,
        station: eData?.station,
        registrationNo: eData?.registrationNo,
        driverName: eData?.driverName,
        aplCardNo: eData?.aplCardNo,
        make: eData?.make,
        gbmsNo: eData?.gbmsNo,
        ce: eData?.ce, 
        meterReading: eData?.meterReading,
        rm_omorName: eData?.rm_omorName,
        description: eData?.description,
        emergencyRepairRequestImgs: eData?.emergencyRepairRequestImgs,
        emergencyRepairStatementVideos: eData?.emergencyRepairStatementVideos,
        emergencySupervisor: eData?.emergencySupervisor,
        emergencyReceiptImgs: eData?.emergencyReceiptImgs,
        emergencyRepairCompletionImgs: eData?.emergencyRepairCompletionImgs,
       
        status: eData?.status,
      });
       
      setFormServices(eData?.services || []);

      setEmergencyRepairCompletionImgUrls(
        eData?.emergencyRepairCompletionImgs || [],
      );
      setEmergencyReceiptImgUrls(eData?.emergencyReceiptImgs || []);
    }
  }, [EmergencyData]);

  const { data: vehicles, isLoading: vehicleLoading } =
    useGetVehicleByCompanyIdQuery({
      companyId: user?.companyId,
      station: formValues?.station,
    });
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleDelete = (indexToDelete, setImgUrls) => {
    setImgUrls((prevUrls) =>
      prevUrls.filter((url, index) => index !== indexToDelete),
    );
  };
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrorMessages = await Validator(); 
    if (newErrorMessages.length > 0) {
      const filteredMessages = newErrorMessages.filter((msg) => msg !== '');
      if (filteredMessages.length !== 0) {
        showErrorToast(filteredMessages[0]);
        return;
      }
    }

    
    if (newErrorMessages.every((msg) => msg === '')) {
      
   

      if(allServices?.length == 0 && emergencyRepairCompletionImgUrls?.length == 0 && emergencyReceiptImgUrls?.length == 0    ){
        showErrorToast('Nothing to update');
        return;
      }
      let updatedFormServices = [];

      if(allServices?.length !== 0){
          updatedFormServices = formSevivces.map((formService, index) => {
          const service = allServices[index];
        
           return {
             ...formService,
             odometerReading: EmergencyData?.data?.meterReading, 
             description: service.description ? service.description : '',
             repairCost: service.serviceValue ,
             service_code: service.serviceCode,
             sales_tax: service.salesTax,
             further_tax: service.futhurTax,
             other_costs: service.otherCosts,
             net_value: service.netValue,
             value: service.serviceValue,
             remarks: service.remarks,
             project: service.project,
             code: service.location,
           };
         });
   
        
         if (allServices.length > formSevivces.length) {
           const baseFields = {
             id: null,
             emergencyMaintenanceId: formSevivces[0]?.emergencyMaintenanceId,  
             vendorType: formSevivces[0]?.vendorType,  
             indoorVendorName: formSevivces[0]?.indoorVendorName, 
             outdoorVendorName: formSevivces[0]?.outdoorVendorName, 
             outdoorVendorReason: formSevivces[0]?.outdoorVendorReason,  
             serviceType: formSevivces[0]?.serviceType,  
             value: formSevivces[0]?.serviceValue,  
             odometerReading: EmergencyData?.data?.meterReading,  
           };
   
           const remainingServices = allServices
             .slice(formSevivces.length)
             .map((service) => ({
               ...baseFields, 
               description: service.description ? service.description : '',
               repairCost: service.serviceValue,
               service_code: service.serviceCode,
               sales_tax: service.salesTax,
               further_tax: service.futhurTax,
               other_costs: service.otherCosts,
               net_value: service.netValue,
               value: service.serviceValue,
               remarks: service.remarks,
               project: service.project,
               code: service.location,
             }));
   
           updatedFormServices.push(...remainingServices);
         }
      }

     
      const updatedFormData = {
        ...formValues,
        services: updatedFormServices?.length > 0 ? updatedFormServices : formSevivces,  
        emergencyRepairCompletionImgs: emergencyRepairCompletionImgUrls,
        emergencyReceiptImgs: emergencyReceiptImgUrls,
      };
       
 

      try {
 
        await UpdateEmergencyRequest({
          id,
          formData: updatedFormData,
        }).unwrap();
        showSuccessToast('Request Processed Successfully!');
        navigate(-1);
      } catch (err) {
        console.log(err);
        showErrorToast(
          'An error has occurred while updating emergency Maintenance Request',
        );
      }
    }
  };

  const areAllFieldsFilled = () => {
    const requiredFields = [
      'station',
      'registrationNo',
      'aplCardNo',
      'make',
      'ce',
      'meterReading',
      'rm_omorName',
      'description',
      'emergencyRepairRequestImgs',
      'emergencyRepairStatementVideos',
      'emergencySupervisor',
      'emergencyReceiptImgs',
      'emergencyRepairCompletionImgs',
    ];

    return true;
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Emergency & Insurance Maintenance Process Form"
          pageNameprev="Emergency & Insurance Maintenance"
          pagePrevPath="Emergency-Maintenance"
        />
        <div className=" gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form action="#" onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="station"
                      >
                        Station
                      </label>
                      <div className="relative">
                        <Select
                          styles={customStyles}
                          className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          options={stationOptions}
                          value={
                            formValues?.station
                              ? {
                                  value: formValues?.station,
                                  label: formValues?.station,
                                }
                              : null
                          }
                          isDisabled
                        />
                      </div>
                    </div>
                   

                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="registrationNo"
                      >
                        Vehicle Number
                      </label>
                      <div className="relative">
                        <AsyncSelect
                          styles={customStyles}
                          className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          value={
                            formValues.registrationNo
                              ? {
                                  value: formValues.registrationNo,
                                  label: formValues.registrationNo,
                                }
                              : null
                          }
                          isDisabled
                        />
                      </div>
                    </div>

                    <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="make"
                      >
                        Make
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="make"
                          id="make"
                          placeholder="Make"
                          onChange={handleChange}
                          value={formValues.make}
                          disabled
                        />
                      </div>
                    </div>

                    <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="meterReading"
                      >
                        Current Odometer Reading
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="meterReading"
                          id="meterReading"
                          placeholder="50,000 km"
                          onChange={handleChange}
                          value={formValues.meterReading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/1 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="driverName"
                      >
                        Driver Name
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="driverName"
                          id="driverName"
                          placeholder="Driver Name"
                          onChange={handleChange}
                          value={formValues.driverName}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/1 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="gbmsNo"
                      >
                        GBMS No.
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="gbmsNo"
                          id="gbmsNo"
                          placeholder="GBMS No."
                          onChange={handleChange}
                          value={formValues.gbmsNo}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="aplCardNo"
                      >
                        APL Card No.
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="aplCardNo"
                          id="aplCardNo"
                          placeholder="APL Card No."
                          onChange={handleChange}
                          value={formValues.aplCardNo}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="ce"
                      >
                        CE
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="ce"
                          id="ce"
                          placeholder="Enter CE"
                          onChange={handleChange}
                          value={formValues.ce}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="rm_omorName"
                      >
                        RM/OMOR Controller
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                          type="text"
                          name="rm_omorName"
                          id="rm_omorName"
                          placeholder="Enter RM/OMOR Name"
                          onChange={handleChange}
                          value={formValues.rm_omorName}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencySupervisor"
                      >
                        Emergency Supervisor Name
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="emergencySupervisor"
                          id="emergencySupervisor"
                          placeholder="Supervisor Name"
                          onChange={handleChange}
                          value={formValues?.emergencySupervisor}
                        />
                      </div>
                    </div>
                    

                    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="description"
                      >
                        Driver Statement
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full rounded border border-stroke bg-gray py-3 pl-4 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="description"
                          id="description"
                          rows={6}
                          placeholder="Enter Statement"
                          onChange={handleChange}
                          value={formValues.description}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                 
                  <EmergencyComponent
                    setAllServices={setAllServices}
                    formValues={EmergencyData?.data}
                  />

                  
                 
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyRepairRequestImgWicdget"
                      >
                        Emergency Repair Images
                      </label>
                      <div className="relative">
                      <ul className="list-disc pl-5">
                    {formValues.emergencyRepairRequestImgs?.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Emergency Repair Image ${index + 1}`}
                            className="object-contain h-48 w-48 mb-4"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>

                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyRepairStatementVideos"
                      >
                        Driver Statement Videos
                      </label>
                      <div className="relative">
                        <ul className="list-disc pl-5">
                          {formValues.emergencyRepairStatementVideos?.map(
                            (url, index) => (
                              <li key={index}>
                                <video
                                  src={url}
                                  controls
                                  className="object-contain h-48 w-48"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyRepairCompletionImgWidget"
                      >
                        Emergency Completion Images
                      </label>
                      <div className="relative">
                         {
                          formValues?.status !== "waiting for completion" ?
                          <MultipleUploadWidget
                          setImgUrls={setEmergencyRepairCompletionImgUrls}
                          id="emergencyRepairCompletionImgWidget"
                        /> : null
                         }

                        <ul className="list-disc pl-5">
                          {emergencyRepairCompletionImgUrls.map(
                            (url, index) => (
                              <>
                              {
                                formValues?.status !== "waiting for completion" ?
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
                              </li>:
                              <li key={url}>
                                <img
                                  src={url}
                                  alt={`Emergency Job Completion Images ${index + 1}`}
                                  className="object-contain h-48 w-48"
                                />
                              </li>
                              }
                              </>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyReceiptImgWidget"
                      >
                        Emergency Receipt Images
                      </label>
                      <div className="relative">
                        {
                          formValues?.status !== "waiting for completion" ? 
                          <MultipleUploadWidget
                          setImgUrls={setEmergencyReceiptImgUrls}
                          id="emergencyReceiptImgWidget"
                        /> : null
                        }
                       
                        <ul className="list-disc pl-5">
                          {emergencyReceiptImgUrls.map((url, index) => (
                            <>
                            {
                              formValues?.status !== "waiting for completion" ? 
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
                            </li> :
                            <li key={url}>
                              <img
                                src={url}
                                alt={`Emergency Receipt Image ${index + 1}`}
                                className="object-contain h-48 w-48"
                              />
                            </li>
                            }
                            </>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mr-5">
                    <div className="flex justify-end gap-4.5">
                      <div
                        className="flex cursor-pointer justify-center rounded border border-stroke py-2 px-6 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </div>
                      {areAllFieldsFilled() &&
                      EmergencyData?.data?.status == 'waiting for completion' ? (
                        updateLoading ? (
                          <LoadingButton
                            btnText="Completing..."
                            isLoading={updateLoading}
                          />
                        ) : (
                          <button
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                            type="submit"
                          >
                            Complete
                          </button>
                        )
                      ) : updateLoading ? (
                        <LoadingButton
                          btnText="Updating..."
                          isLoading={updateLoading}
                        />
                      ) : (
                        <button
                          type="submit"
                          className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                        >
                          Update Record
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmergencyProcessFormByRegional;
  const CustomTextArea = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-3 block text-md font-medium text-black dark:text-white">
          {label}
        </label>
      )}
      <textarea
        className="w-full rounded border border-stroke bg-gray p-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};
 