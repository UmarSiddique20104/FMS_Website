import { useEffect, useState } from 'react';
import UploadWidget from '../../components/UploadWidget';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { FiUser } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { addVehicleSchema } from '../../utils/schemas';
import useToast from '../../hooks/useToast';
import { useAddCompanyUserMutation } from '../../services/usersSlice';
import LoadingButton from '../../components/LoadingButton';
import Select from 'react-select';
import {
  useGetVehicleQuery,
  useUpdateVehicleMutation,
} from '../../services/vehicleSlice';
import {
  make,
  type,
  model,
  size,
  stationOptions,
  subregion,
  region,
  fuel,
  door,
} from '../../constants/Data';
import { customStyles } from '../../constants/Styles';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showErrorToast, showSuccessToast } = useToast();
  const [formValues, setFormValues] = useState({ ...addVehicleSchema });
  const { user } = useSelector((state) => state.auth);
  const [vehicleRegImgUrl, setVehicleRegImgUrl] = useState('');
  const [UpdateVehicle, { isLoading }] = useUpdateVehicleMutation();
  const { data, isLoading: getVehicleLoading } = useGetVehicleQuery(id);

  const handleSelectChange = (selectedOption, name) => {
    setFormValues({
      ...formValues,
      [name]: selectedOption.value,
    });
  };

  const handleChangeValue = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formValues.commisionDate &&
      formValues.oddometerReading &&
      formValues.fuelType &&
      formValues.station &&
      formValues.registrationNo &&
      vehicleRegImgUrl
    ) {
      const {
        id, // Remove the id field from the destructuring assignment
        deleted_at,
        created_at,
        updated_at,
        registrationNo,
        ...updatedFormData // Exclude id from the updatedFormData
      } = formValues;
      const formData = {
        ...updatedFormData,
        registrationCertificate: vehicleRegImgUrl,
        companyId: parseInt(user?.companyId),
      };
      try {
        if (formData.isInsured === false) {
          formData.insuranceStartDate = null;
          formData.insuranceEndDate = null;
        }

        console.log(formData);
        await UpdateVehicle({ id, formData }).unwrap();
        showSuccessToast('Vehicle Updated Successfully!');
        navigate(-1);
      } catch (err) {
        console.log(err);
        showErrorToast('An error has occurred while updating vehicle');
      }
    } else {
      showErrorToast('Please fill the required fields');
    }
  };

  useEffect(() => {
    console.log(data?.data);
    setFormValues({ ...formValues, ...data?.data });
    setVehicleRegImgUrl(data?.data?.registrationCertificate);
    setIsInsured(data?.data?.isInsured);
  }, [data?.data]);

  const [isSelected, setIsSelected] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleRadioChange = (event) => {
    setIsSelected(event.target.value === 'insured');
  };

  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
  };

  const [isInsured, setIsInsured] = useState(false);

  const handleInsuranceChange = (event) => {
    const value = event.target.value === 'insured';
    setIsInsured(value);

    setFormValues({
      ...formValues,
      isInsured: value,
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Update Vehicle"
          pageNameprev="Vehicles" //show the name on top heading
          pagePrevPath="vehicles" // add the previous path to the navigation
        />

        <div className=" gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-md text-black dark:text-white">
                  Vehicle Information
                </h3>
              </div>
              <div className="p-7">
                {/*********************** INPUT FIELDS *************************************/}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      Code (Unique Key)
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="code"
                        id="reg_no"
                        placeholder="534232"
                        value={data?.data?.code}
                      />
                    </div>
                  </div>
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      Registration No.
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="registrationNo"
                        id="reg_no"
                        placeholder="534232"
                        onChange={handleChangeValue}
                        value={formValues.registrationNo}
                      />
                    </div>
                  </div>
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="current_odo"
                    >
                      Current Odometer Reading (KMs)
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="oddometerReading"
                        id="current_odo"
                        placeholder="50,000 km"
                        onChange={handleChangeValue}
                        value={formValues?.oddometerReading}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="commission_date"
                    >
                      Commission Date
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="date"
                        name="commisionDate"
                        id="commission_date"
                        placeholder="20/12/2024"
                        onChange={handleChangeValue}
                        value={formValues.commisionDate}
                      />
                    </div>
                  </div>
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      Chasis No.
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="chasisNo"
                        id="reg_no"
                        placeholder="534232"
                        // onChange={handleChangeValue}
                        value={data?.data?.chasisNo}
                      />
                    </div>
                  </div>
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      Engine No.
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="engineNo"
                        id="reg_no"
                        placeholder="534232"
                        // onChange={handleChangeValue}
                        value={data?.data?.engineNo}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      APL Card No.
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="fule_card_apl"
                        id="reg_no"
                        placeholder="534232"
                        // onChange={handleChangeValue}
                        value={data?.data?.fule_card_apl}
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="reg_no"
                    >
                      POS Card No.
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="fule_card_pos"
                        id="reg_no"
                        placeholder="534232"
                        // onChange={handleChangeValue}
                        value={data?.data?.fule_card_pos}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="emergency_maintenance_card"
                    >
                      Emergency Maintenance Card
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="emergency_maintenance_card"
                        id="emergency_maintenance_card"
                        placeholder="Enter Emergency Card Number"
                        onChange={handleChangeValue}
                        value={formValues.emergency_maintenance_card}
                      />
                    </div>
                  </div>
                </div>

                {/*********************** DROP DOWNS *************************************/}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="subregion"
                    >
                      Region
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>

                      <Select
                        styles={customStyles}
                        isDisabled
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={region}
                        value={
                          formValues.region
                            ? {
                                value: formValues.region,
                                label: formValues.region,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'region')
                        }
                        placeholder="Select Region"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="subregion"
                    >
                      Subregion
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={subregion}
                        value={
                          formValues.subRegion
                            ? {
                                value: formValues.subRegion,
                                label: formValues.subRegion,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'subRegion')
                        }
                        placeholder="Select Subregion"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="station"
                    >
                      Station
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        styles={customStyles}
                        isDisabled
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={stationOptions}
                        value={
                          formValues.station
                            ? {
                                value: formValues.station,
                                label: formValues.station,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'station')
                        }
                        placeholder="Select Station"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="make"
                    >
                      Make
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        isDisabled
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={make}
                        value={
                          formValues.make
                            ? { value: formValues.make, label: formValues.make }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'make')
                        }
                        placeholder="Select Make"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="model"
                    >
                      Model
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        isDisabled
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={model}
                        value={
                          formValues.model
                            ? {
                                value: formValues.model,
                                label: formValues.model,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'model')
                        }
                        placeholder="Select Model"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="type"
                    >
                      Type
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        isDisabled
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={type}
                        value={
                          formValues.type
                            ? { value: formValues.type, label: formValues.type }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'type')
                        }
                        placeholder="Select Type"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="size"
                    >
                      Size
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>
                      <Select
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={size}
                        value={
                          formValues.size
                            ? { value: formValues.size, label: formValues.size }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'size')
                        }
                        placeholder="Select Size"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="fuel"
                    >
                      Fuel Type
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>

                      <Select
                        isDisabled
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={fuel}
                        value={
                          formValues.fuelType
                            ? {
                                value: formValues.fuelType,
                                label: formValues.fuelType,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'fuelType')
                        }
                        placeholder="Select Fuel"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="doorType"
                    >
                      Door Type
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FiUser />
                      </span>

                      <Select
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={door}
                        value={
                          formValues.doorType
                            ? {
                                value: formValues.doorType,
                                label: formValues.doorType,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, 'doorType')
                        }
                        placeholder="Select Door"
                      />
                    </div>
                  </div>
                </div>

                <div className="py-5">
                  <h3 className="font-medium text-md text-black dark:text-white">
                    Is Insured?
                  </h3>

                  <div className="flex gap-5  py-5">
                    <label>
                      <input
                        name="isInsured"
                        type="radio"
                        value="insured"
                        className="w-5 h-5 mr-2"
                        checked={isInsured === true}
                        onChange={handleInsuranceChange}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        name="isInsured"
                        type="radio"
                        value="notInsured"
                        className="w-5 h-5 mr-2"
                        checked={isInsured === false}
                        onChange={handleInsuranceChange}
                      />
                      No
                    </label>
                  </div>

                  {isInsured && (
                    <div className="flex gap-5 pb-8 pt-2  ">
                      <div className="sm:w-1/2 md:w-1/3 lg:1/4">
                        <label
                          className="mb-3 block text-md font-medium text-black dark:text-white"
                          htmlFor="insuranceStartDate"
                        >
                          From
                          <sup style={{ color: 'red', fontSize: '15px' }}>
                            *
                          </sup>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="date"
                            name="insuranceStartDate"
                            id="insuranceStartDate"
                            value={formValues.insuranceStartDate || ''}
                            onChange={handleChangeValue}
                          />
                        </div>
                      </div>

                      <div className="sm:w-1/2 md:w-1/3 lg:1/4">
                        <label
                          className="mb-3 block text-md font-medium text-black dark:text-white"
                          htmlFor="insuranceEndDate"
                        >
                          Till
                          <sup style={{ color: 'red', fontSize: '15px' }}>
                            *
                          </sup>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="date"
                            name="insuranceEndDate"
                            id="insuranceEndDate"
                            value={formValues.insuranceEndDate || ''}
                            onChange={handleChangeValue}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="registrationCertificate"
                    >
                      Registration Certificate
                      <sup style={{ color: 'red', fontSize: '15px' }}>*</sup>
                    </label>
                    <div className="relative">
                      <UploadWidget
                        setImgUrl={setVehicleRegImgUrl}
                        id="VehicleRegImgUrlUploadWidget" // Unique identifier for this instance
                      />
                      {vehicleRegImgUrl && (
                        <div className=" flex justify-center items-center border border-blue-200 p-4 bg-slate-200">
                          <img
                            src={vehicleRegImgUrl}
                            alt="lasda"
                            className="object-contain h-48 w-48"
                          />
                        </div>
                      )}
                    </div>
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
                          btnText="Saving..."
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
                {/* </form> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default VehicleForm;
