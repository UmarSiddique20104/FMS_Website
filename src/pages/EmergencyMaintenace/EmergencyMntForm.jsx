import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import { addEmergencyRequestSchema } from '../../utils/schemas';
import { useGetRolesByCompanyIdQuery } from '../../services/rolesSlice';
import useToast from '../../hooks/useToast';
import { useAddCompanyUserMutation } from '../../services/usersSlice';
import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
import { useGetTagDriversFromVehicleQuery } from '../../services/tagDriverSlice';
import { useGetOneVehicleDetailsQuery } from '../../services/periodicSlice';
import { useAddEmergencyRequestMutation } from '../../services/emergencySlice';
import { MdDelete } from 'react-icons/md';

import LoadingButton from '../../components/LoadingButton';
import DeleteModal from '../../components/DeleteModal';
import Select from 'react-select';
import {
  stationOptions,
  vendorType,
  indoorVendorName,
} from '../../constants/Data';
import AsyncSelect from 'react-select/async';
import UploadWidget from '../../components/UploadWidget';
import { customStyles } from '../../constants/Styles';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import MultipleUploadWidget from '../../components/MultipleUploadWidget';
import MultipleUploadWidget2 from '../../components/MultiUploadRestrict';

const EmergencyMntForm = () => {
  const location = useLocation();
  const { registrationNo } = location.state || {};
  const { data: periodicVehicle, isLoading } =
    useGetOneVehicleDetailsQuery(registrationNo);

  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const [formValues, setFormValues] = useState({
    ...addEmergencyRequestSchema,
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [emergencyRepairRequestImgUrls, setEmergencyRepairRequestImgUrls] =
    useState([]);

  const [
    emergencyRepairStatementVideoUrls,
    setEmergencyRepairStatementVideoUrls,
  ] = useState([]);
  const [AddEmergencyRequest, { isLoading: emergencyLoading }] =
    useAddEmergencyRequestMutation();

  const { data: vehicles, isLoading: vehicleLoading } =
    useGetVehicleByCompanyIdQuery({
      companyId: user?.companyId,
      station: formValues?.station,
    });

  const {
    data: vehicleDetails,
    isError: isVehicleDetailsError,
    error: vehicleDetailsError,
  } = useGetOneVehicleDetailsQuery(formValues?.registrationNo);

   
 
  const vehicleLoadOptions = (inputValue, callback) => { 
   
 
    if (vehicles && vehicles.data) {
      const filteredOptions = vehicles.data
        .filter((vehicle) =>  
          !inputValue || vehicle.registrationNo.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((vehicle) => ({
          value: vehicle.id,
          label: vehicle.registrationNo,
        }));
        
      callback(filteredOptions);
    } else {
      callback([]);
    }
  };
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleNormalSelectChange = (selectedOption, name) => {
    setFormValues({
      ...formValues,
      [name]: selectedOption.value,
    });
    
 
  };

  const handleSelectChange = (fieldName, selectedOption) => {
    setFormValues((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption.label,
    }));
  };

  const handleChangeValue = (e) => {
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

  const [errors, setErrors] = useState({});
  const validationConfig = {
    station: {
      required: true,
      message: 'Station name is required.',
    },
    registrationNo: {
      required: true,
      message: 'Vehicle registration number is required.',
    },
    make: {
      required: true,
      message: 'Make is required.',
    },
    meterReading: {
      required: true,
      message: 'Current odometer reading is required.',
    },
    driverName: {
      required: true,
      message: 'Driver name is required.',
    },
    gbmsNo: {
      required: true,
      message: 'GBMS number is required.',
    },
    aplCardNo: {
      required: true,
      message: 'APL card number is required.',
    },
    ce: {
      required: true,
      message: 'CE is required.',
    },
    rm_omorName: {
      required: true,
      message: 'RM/OMOR Controller is required.',
    },
    description: {
      required: true,
      message: 'Description is required.',
    },
     

  };

  // Validate form values based on the configuration
  const validateForm = () => {
    const newErrors = {};
    for (let [key, { required, message }] of Object.entries(validationConfig)) {
      if (required && !formValues[key]) {
        newErrors[key] = message;
        setErrors(newErrors);
        showErrorToast(message); // Show only the first encountered error
        return false; // Stop validation after the first error is found
      }
    }
    setErrors({});
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
 
    if( emergencyRepairRequestImgUrls?.length === 0){ 
      showErrorToast('Emergency Repair Image is required.');
      return;
    }
    if(  emergencyRepairStatementVideoUrls?.length === 0){
      showErrorToast('Emergency Repair Driver Statement Video is required.');
      return;
    }
    
    const formData = {
      ...formValues,
      emergencyRepairRequestImgs: emergencyRepairRequestImgUrls,
      emergencyRepairStatementVideos: emergencyRepairStatementVideoUrls,
    };
 

    try {
      
      const response = await AddEmergencyRequest(formData).unwrap();
 
      showSuccessToast('Emergency Request Added Successfully!');
      navigate(-1);
    } catch (err) {
      console.log(err);
      showErrorToast(
        'An error has occurred while generating emergency Maintenance Request',
      );
    }
  };
 
  useEffect(() => {
     
    setFormValues({
      ...formValues,
      driverName: vehicleDetails?.data?.name ? vehicleDetails?.data?.name : '',
      gbmsNo: vehicleDetails?.data?.employeeId ? vehicleDetails?.data?.employeeId : '',
      make: vehicleDetails?.data?.make ? vehicleDetails?.data?.make : '',
      meterReading: vehicleDetails?.data?.oddometerReading ? vehicleDetails?.data?.oddometerReading : '',
      aplCardNo: vehicleDetails?.data?.emergency_maintenance_card ? vehicleDetails?.data?.emergency_maintenance_card : '',
      // description: vehicleDetails?.data?.description,

    });
  }, [vehicleDetails]);

  const currentDate = new Date().toISOString().slice(0, 10);
  const [dateValue, setDateValue] = useState(currentDate);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Emergency & Insurance Maintenance Form"
          pageNameprev="Emergency & Insurance Maintenance" //show the name on top heading
          pagePrevPath="Emergency-Maintenance" // add the previous path to the navigation
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
                          className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          options={stationOptions}
                          value={
                            formValues?.station
                              ? {
                                value: formValues?.station,
                                label: formValues?.station,
                              }
                              : null
                          }
                          onChange={(selectedOption) =>
                            handleNormalSelectChange(selectedOption, 'station')
                          }
                          placeholder="Select Station"
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
                      <div className="relative">
                      <AsyncSelect
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        loadOptions={vehicleLoadOptions}
                        value={
                          formValues.registrationNo
                            ? {
                                value: formValues.registrationNo,
                                label: formValues.registrationNo,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange('registrationNo', selectedOption)
                        }
                        isLoading={vehicleLoading}
                        isDisabled={vehicleLoading}
                        placeholder="Select a Vehicle..."
                        defaultOptions={vehicles && vehicles.data ? vehicles.data.map(vehicle => ({
                          value: vehicle.id,
                          label: vehicle.registrationNo,
                        })) : []}  
                      />
                    </div>

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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="make"
                          id="make"
                          placeholder="Make"
                          onChange={handleChangeValue}
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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="meterReading"
                          id="meterReading"
                          placeholder="50,000 km"
                          onChange={handleChangeValue}
                          value={formValues.meterReading}
                        // disabled
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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
                        Emergency Card No.
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="aplCardNo"
                          id="aplCardNo"
                          placeholder="APL Card No."
                          onChange={handleChange}
                          value={formValues.aplCardNo}
                       
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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="ce"
                          id="ce"
                          placeholder="Enter CE"
                          onChange={handleChange}
                          value={formValues.ce}
                        // disabled
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
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="rm_omorName"
                          id="rm_omorName"
                          placeholder="Enter RM/OMOR Name"
                          onChange={handleChange}
                          value={formValues.rm_omorName}
                        // disabled
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

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyRepairRequestImgWidget"
                      >
                        Emergency Repair Image
                      </label>
                      <div className="relative">
                        <MultipleUploadWidget
                          setImgUrls={setEmergencyRepairRequestImgUrls}
                          id="emergencyRepairRequestImgWidget"
                        />
                        {emergencyRepairRequestImgUrls.length > 0 && (
                          <div className="flex flex-wrap justify-center items-center border border-blue-200 p-4 bg-slate-200">
                            {emergencyRepairRequestImgUrls.map((url, index) => (
                              <div
                                key={index}
                                className="relative border border-gray-300 bg-white m-2 p-2"
                              >
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      index,
                                      setEmergencyRepairRequestImgUrls,
                                    )
                                  }
                                  className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  &#10005;
                                </button>
                                <img
                                  src={url}
                                  alt={`Emergency Job Image ${index + 1}`}
                                  className="object-contain h-48 w-48"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="emergencyRepairStatementVideoWidget"
                      >
                        Driver Statement Video
                      </label>
                      <div className="relative">
                        <MultipleUploadWidget2
                          setImgUrls={setEmergencyRepairStatementVideoUrls}
                           id="emergencyRepairStatementVideoWidget"
                          type={'video'}
                        />
                      {emergencyRepairStatementVideoUrls?.length > 0 && (
                        <div className="flex flex-wrap justify-center items-center border border-blue-200 p-4 bg-slate-200">
                          {emergencyRepairStatementVideoUrls?.map((url, index) => (
                            <div
                              key={index}
                              className="relative border border-gray-300 bg-white m-2 p-2"
                            >
                              <button
                                onClick={() =>
                                  handleDelete(
                                    index,
                                    setEmergencyRepairStatementVideoUrls,
                                  )
                                }
                                className="absolute top-0 right-0 z-10 mt-2 mr-2 bg-red-500 text-white rounded-full p-1"
                              >
                                &#10005;
                              </button>
                              <video
                                src={url}
                                controls
                                className="object-contain h-48 w-48"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      {/* <div className="relative">
                        <MultipleUploadWidget
                          setImgUrls={setEmergencyRepairStatementVideoUrls}
                          id="emergencyRepairStatementVideoWidget"
                        />
                        {emergencyRepairStatementVideoUrls.length > 0 && (
                          <div className="flex flex-wrap justify-center items-center border border-blue-200 p-4 bg-slate-200">
                            {emergencyRepairStatementVideoUrls.map(
                              (url, index) => (
                                <div
                                  key={index}
                                  className="relative border border-gray-300 bg-white m-2 p-2"
                                >
                                  <button
                                    onClick={() =>
                                      handleDelete(
                                        index,
                                        setEmergencyRepairStatementVideoUrls,
                                      )
                                    }
                                    className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white rounded-full p-1"
                                  >
                                    &#10005;
                                  </button>
                                  <img
                                    src={url}
                                    alt={`Emergency Job Image ${index + 1}`}
                                    className="object-contain h-48 w-48"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div> */}
                    </div>
                  </div>

                  <div className="mr-5">
                    <div className="flex justify-end gap-4.5">

                      <div
                        className="flex justify-center cursor-pointer rounded border border-stroke py-2 px-6 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white "
                        onClick={() => navigate(-1)}
                      >
                       

                        Cancel
                     
                      </div>
                      <>
                        {isLoading ? (
                          <LoadingButton
                            btnText="Adding..."
                            isLoading={isLoading}
                          />
                        ) : (
                          <button
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                            type="submit"
                            onClick={handleSubmit}
                          >
                            Save
                          </button>
                        )}
                      </>
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

export default EmergencyMntForm;
