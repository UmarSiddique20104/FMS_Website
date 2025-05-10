import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import { tagDriverSchema } from '../../utils/schemas';
import useToast from '../../hooks/useToast';
import LoadingButton from '../../components/LoadingButton';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useGetDriverAllWithoutPaginationQuery } from '../../services/driverSlice';
import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
import {
  useAddTagDriverMutation,
  useGetAllTagDriverQuery,
} from '../../services/tagDriverSlice';
import { stationOptions } from '../../constants/Data';
import { customStyles } from '../../constants/Styles';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';

const TagVehicleForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { showErrorToast, showSuccessToast } = useToast();
  const [formValues, setFormValues] = useState({
    ...tagDriverSchema,
    station: user?.station,
  });

  const [AddTagDriver, { isLoading }] = useAddTagDriverMutation();

  // Track whether the station is selected
  const [isStationSelected, setIsStationSelected] = useState(false);
  const { data: GetAllTagDriver } = useGetAllTagDriverQuery();

  const { data: drivers, isLoading: driverLoading } =
    useGetDriverAllWithoutPaginationQuery({
      companyId: user?.companyId,
      station: formValues?.station,
    });
  // console.log('drivers', drivers);

  useEffect(() => {
    // Enable driver and vehicle select dropdowns if station is selected

    if (formValues.station) {
      setIsStationSelected(true);
    } else {
      setIsStationSelected(false);
    }
  }, [formValues.station]);

  const { data: vehicles, isLoading: vehicleLoading } =
    useGetVehicleByCompanyIdQuery({
      companyId: user?.companyId,
      station: formValues?.station,
    });

  const driverLoadOptions = (inputValue, callback) => {
    if (!inputValue) {
      callback([]);
      return;
    }

    // Ensure drivers and GetAllTagDriver are defined and are arrays
    if (
      drivers?.data &&
      Array.isArray(drivers.data) &&
      GetAllTagDriver?.data &&
      Array.isArray(GetAllTagDriver.data)
    ) {
      // console.log('Drivers Data:', drivers.data);
      // console.log('TagDriver Data:', GetAllTagDriver.data);

      // Map the tagged driver IDs correctly using driverId
      const taggedDriverIds = GetAllTagDriver.data.map((tag) => tag.driverId);
      // console.log('Tagged Driver IDs:', taggedDriverIds);

      // Filter out drivers who are tagged
      const availableDrivers = drivers.data.filter(
        (driver) => !taggedDriverIds.includes(driver.employeeId),
      );

      // console.log('Available Drivers:', availableDrivers);

      // Filter based on the input value and map to the select options format
      const filteredOptions = availableDrivers
        .filter((driver) =>
          driver.name.toLowerCase().includes(inputValue.toLowerCase()),
        )
        .map((driver) => ({
          value: driver.id,
          label: `${driver.employeeId}-${driver.name}`,
        }));

      // console.log('Filtered Options:', filteredOptions);

      callback(filteredOptions);
    } else {
      // console.log('Data not ready or not an array');
      callback([]);
    }
  };

  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  //To Autoload the data in the dropdown ++
  useEffect(() => {
    if (
      drivers?.data &&
      Array.isArray(drivers.data) &&
      GetAllTagDriver?.data &&
      Array.isArray(GetAllTagDriver.data)
    ) {
      const taggedDriverIds = GetAllTagDriver.data.map((tag) => tag.driverId);

      const availableDrivers = drivers.data.filter(
        (driver) => !taggedDriverIds.includes(driver.employeeId),
      );

      const options = availableDrivers.map((driver) => ({
        value: driver.id,
        label: `${driver.employeeId}-${driver.name}`,
      }));

      setDriverOptions(options);
    }
  }, [drivers, GetAllTagDriver]);

  useEffect(() => {
    if (
      vehicles?.data &&
      Array.isArray(vehicles.data) &&
      GetAllTagDriver?.data &&
      Array.isArray(GetAllTagDriver.data)
    ) {
      const taggedVehicleIds = GetAllTagDriver.data.map((tag) => tag.vehicleId);

      const availableVehicles = vehicles.data.filter(
        (vehicle) => !taggedVehicleIds.includes(vehicle.registrationNo),
      );

      const options = availableVehicles.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.registrationNo,
      }));

      setVehicleOptions(options);
    }
  }, [vehicles, GetAllTagDriver]);

  useEffect(() => {
    // console.log('GetAllTagDriver:', GetAllTagDriver);
  }, [GetAllTagDriver]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const handleFocus = () => {
    if (!isStationSelected) {
      alert('Please select a station first.');
    } else {
      setMenuIsOpen(true);
    }
  };

  const handleBlur = () => {
    setMenuIsOpen(false);
  };

  const vehicleLoadOptions = (inputValue, callback) => {
    if (
      vehicles?.data &&
      Array.isArray(vehicles.data) &&
      GetAllTagDriver?.data &&
      Array.isArray(GetAllTagDriver.data)
    ) {
      const taggedVehicleIds = GetAllTagDriver.data.map((tag) => tag.vehicleId);

      const availableVehicles = vehicles.data.filter(
        (vehicle) => !taggedVehicleIds.includes(vehicle.registrationNo),
      );

      // Map to the select options format
      const options = availableVehicles.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.registrationNo,
      }));

      callback(options); // Ensure this sends the options back for rendering
    } else {
      callback([]);
    }
  };

  const handleChange = (selectedOption, name) => {
    if (name === 'station') {
      setFormValues((prevState) => ({
        ...prevState,
        [name]: selectedOption.value,
        driverId: null,
        vehicleId: null,
      }));
    } else {
      setFormValues((prevState) => ({
        ...prevState,
        [name]: selectedOption.value,
      }));
    }
  };

  const handleSelectChange = (fieldName, selectedOption) => {
    setFormValues((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption?.label,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      ...formValues,
      companyId: parseInt(user?.companyId),
    };

    try {
      await AddTagDriver(formData).unwrap();
      showSuccessToast('Driver Tagged Successfully!');
      navigate(-1);
    } catch (err) {
      let errorMessage = 'An error has occurred while adding driver';
      if (err?.data?.error?.details.length > 0) {
        errorMessage = err?.data?.error?.details
          .map((detail) => detail.message)
          .join(', ');
      } else if (!!err?.data?.message) {
        errorMessage = err?.data?.message;
      }
      console.log('!!!', errorMessage);

      showErrorToast(errorMessage);
    }
  };
  let adminRole =
    user?.Role?.roleName === 'Maintenance Admin' ||
    user?.Role?.roleName === 'companyAdmin';
  let stationRole =
    user?.Role?.roleName === 'regionalAdmin' ||
    user?.Role?.roleName === 'fuelOfficer';

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Tag Driver"
          pageNameprev="Vehicle Assigned" //show the name on top heading
          pagePrevPath="vehicle-tagged" // add the previous path to the navigation
        />

        <div className=" gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-md text-black dark:text-white">
                  Tag Driver to Vehicle Form
                </h3>
              </div>
              <div className="p-7">
                <form action="#" onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/3">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor="station"
                      >
                        Station
                      </label>
                      {adminRole && (
                        <div className="relative">
                          <Select
                            styles={customStyles}
                            options={stationOptions}
                            className="mb-3 w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            name="station"
                            id="station"
                            onChange={(selectedOption) =>
                              handleChange(selectedOption, 'station')
                            }
                            value={
                              formValues.station
                                ? {
                                    value: formValues.station,
                                    label: formValues.station,
                                  }
                                : null
                            }
                            placeholder="Select Station"
                            readOnly
                          />
                        </div>
                      )}
                      {stationRole && (
                        <div className="relative">
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                            type="text"
                            name="station"
                            id="station"
                            value={formValues?.station}
                            readOnly
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor=""
                      >
                        Select Driver
                      </label>
                      <div className="relative">
                        <Select
                          styles={customStyles}
                          className="mb-3 w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          options={driverOptions} // Use the preloaded driver options
                          value={
                            formValues.driverId
                              ? {
                                  value: formValues.driverId,
                                  label: formValues.driverId,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange('driverId', selectedOption)
                          }
                          isLoading={driverLoading}
                          isDisabled={!isStationSelected || driverLoading}
                          placeholder="Select a Driver..."
                          isClearable
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-md font-medium text-black dark:text-white"
                        htmlFor=""
                      >
                        Select Vehicle ..
                      </label>
                      <div className="relative">
                        <Select
                          styles={customStyles}
                          className="mb-3 w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          options={vehicleOptions} // Use the preloaded options
                          value={
                            formValues.vehicleId
                              ? {
                                  value: formValues.vehicleId,
                                  label: formValues.vehicleId,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange('vehicleId', selectedOption)
                          }
                          isLoading={vehicleLoading}
                          isDisabled={!isStationSelected || vehicleLoading}
                          placeholder="Select a Vehicle..."
                          isClearable
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mr-5">
                    <div className="flex justify-end gap-4.5">
                      <button
                        className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white "
                        type="button"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </button>
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

export default TagVehicleForm;
