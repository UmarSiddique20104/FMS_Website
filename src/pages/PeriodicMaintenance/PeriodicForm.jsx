import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import { addPeriodicRequestSchema } from '../../utils/schemas';
import { useGetRolesByCompanyIdQuery } from '../../services/rolesSlice';
import useToast from '../../hooks/useToast';
import LoadingButton from '../../components/LoadingButton';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
import {
  useAddPeriodicRequestMutation,
  useGetOneVehicleDetailsQuery,
  useGetOneVehiclePeriodicTypeDetailsQuery,
  useGetPeriodicParametersQuery,
  useGetPeriodicReportsQuery,
} from '../../services/periodicSlice';
import { customStyles } from '../../constants/Styles';
import { formatDateAndTime } from '../../utils/helpers';

const PeriodicForm = () => {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const [isOdometerMalfunctioned, setIsOdometerMalfunctioned] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const [formValues, setFormValues] = useState({
    ...addPeriodicRequestSchema,
    station: user?.station,
  });
  const { data: roles } = useGetRolesByCompanyIdQuery(user?.companyId);
  const [AddPeriodicRequest, { isLoading }] = useAddPeriodicRequestMutation();
  const { data: parameters } = useGetPeriodicParametersQuery();
  const [periodicType, setPeriodicType] = useState([]);
  const [allVehicle, setAllVehicle] = useState([]);
  const { data: reports } = useGetPeriodicReportsQuery();

  useEffect(() => {
    let _periodicType = parameters?.data?.map((e) => {
      return { value: e?.id, label: e?.job };
    });
    setPeriodicType(_periodicType);
  }, [parameters?.data]);

  const {
    data: vehicles,
    isLoading: vehicleLoading,
    refetch: refetchVehicles,
  } = useGetVehicleByCompanyIdQuery({
    companyId: user?.companyId,
    station: formValues?.station,
  });

  const {
    data: vehicleDetails,
    isError: isVehicleDetailsError,
    error: vehicleDetailsError,
    refetch: refetchVehicleDetails,
  } = useGetOneVehicleDetailsQuery(formValues?.registrationNo);

  const {
    data: periodicTypeDetails,
    refetch: periodicTypeRefetch,
    isError: isPeriodicTypeDetailsError,
    error: periodicTypeDetailsError,
  } = useGetOneVehiclePeriodicTypeDetailsQuery({
    vehicleNo: formValues?.registrationNo,
    periodicType: formValues?.periodicType,
  });

  useEffect(() => {
    if (!!formValues?.registrationNo && !!formValues?.periodicType) {
      periodicTypeRefetch();
    }
  }, [formValues?.registrationNo, formValues?.periodicType]);

  const vehicleLoadOptions = (inputValue, callback) => {
    if (!inputValue) {
      callback([]);
      return;
    }

    if (vehicles && vehicles.data) {
      const filteredOptions = vehicles.data.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.registrationNo,
      }));
      callback(filteredOptions);
    } else {
      callback();
    }
  };
  useEffect(() => {
    if (vehicles?.data?.length > 0) {
      const filteredOptions = vehicles?.data.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.registrationNo,
      }));
      setAllVehicle(filteredOptions);
    }
  }, [vehicles?.data]);

  const handleNormalSelectChange = (selectedOption, name) => {
    setFormValues({
      ...formValues,
      [name]: selectedOption.value,
    });
  };

  const handleSelectChangeRegistrationNo = (fieldName, selectedOption) => {
    if (fieldName == 'registrationNo') {
      setFormValues((prevState) => ({
        ...prevState,
        registrationNo: '',
        employeeId: '',
        periodicType: '',
        meterReading: '',
        make: '',
        gbmsNo: '',
        lastDateOfChange: '',
        lastChangedMeterReading: '',
        runningDifference: '',
        dayRunningDifference: '',
        dueStatus: '',
        quantity: '',
        aplCardNo: '',
        amount: '',
        issueDate: '',
        extras: '',
        driverName: '',
      }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      ...formValues,
      companyId: parseInt(user?.companyId),
      dayRunningDifference: parseInt(formValues.dayRunningDifference),
    };

    // Validate and format date fields
    if (!formData.lastDateOfChange) {
      formData.lastDateOfChange = null; // Use null if empty
    } else {
      formData.lastDateOfChange = new Date(
        formData.lastDateOfChange,
      ).toISOString();
    }

    try {
      console.log('Submitting form data:', formData); // Log form data for debugging
      await AddPeriodicRequest(formData).unwrap();
      showSuccessToast('Periodic Request Sent Successfully!');
      navigate(-1);
    } catch (err) {
      console.error('Error submitting form:', err); // Log the error for debugging
      showErrorToast(
        'An error has occurred while sending the Periodic request',
      );
    }
  };

  // Reset specific fields when periodicType changes
  useEffect(() => {
    if (formValues.periodicType) {
      setFormValues((prevState) => ({
        ...prevState,
        lastDateOfChange: '',
        lastChangedMeterReading: '',
        runningDifference: '',
        dayRunningDifference: '',
        dueStatus: '',
        quantity: '',
        amount: '',
        extras: '',
      }));
    }
  }, [formValues.periodicType]);

  useEffect(() => {
    if (formValues.lastDateOfChange) {
      const lastChangeDate = new Date(formValues.lastDateOfChange);
      const today = new Date();
      const diffTime = Math.abs(today - lastChangeDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormValues((prevState) => ({
        ...prevState,
        dayRunningDifference: diffDays,
      }));
    }
  }, [formValues.lastDateOfChange]);

  useEffect(() => {
    setFormValues({
      ...formValues,
      driverName: vehicleDetails?.data?.name,
      gbmsNo: vehicleDetails?.data?.employeeId,
      make: vehicleDetails?.data?.make,
      meterReading: vehicleDetails?.data?.oddometerReading,
      aplCardNo: vehicleDetails?.data?.cardNumber,
    });
  }, [vehicleDetails]);

  // Updating form values when periodicTypeDetails are fetched
  useEffect(() => {
    if (periodicTypeDetails?.data?.length) {
      const lastRecord =
        periodicTypeDetails.data[periodicTypeDetails.data.length - 1];
      setFormValues((prevState) => {
        const updatedValues = {
          ...prevState,
          lastChangedMeterReading: lastRecord?.completionMeterReading || '-',
          lastDateOfChange: lastRecord?.completionDate,
        };

        // Calculate runningDifference only if both readings are available
        if (
          updatedValues.meterReading &&
          updatedValues.lastChangedMeterReading
        ) {
          const _runningDifference =
            parseFloat(updatedValues.meterReading) -
            parseFloat(updatedValues.lastChangedMeterReading);
          updatedValues.runningDifference = Math.max(
            0,
            _runningDifference,
          ).toString();
        }

        return updatedValues;
      });
    }
  }, [periodicTypeDetails]);

  useEffect(() => {
    if (
      formValues.meterReading &&
      formValues.lastChangedMeterReading &&
      !isNaN(parseFloat(formValues.meterReading)) &&
      !isNaN(parseFloat(formValues.lastChangedMeterReading))
    ) {
      const _runningDifference =
        parseFloat(formValues.meterReading) -
        parseFloat(formValues.lastChangedMeterReading);

      setFormValues((prevState) => ({
        ...prevState,
        runningDifference: Math.max(0, _runningDifference).toString(), // Ensure it's a string if you need that format
      }));
    }
  }, [formValues.meterReading, formValues.lastChangedMeterReading]);

  useEffect(() => {}, [formValues]);

  useEffect(() => {
    if (formValues.lastDateOfChange) {
      const lastChangeDate = new Date(formValues.lastDateOfChange);
      const today = new Date();
      const diffTime = Math.abs(today - lastChangeDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24) - 1);
      setFormValues({ ...formValues, dayRunningDifference: diffDays });
    }
  }, [formValues.lastDateOfChange]);

  useEffect(() => {
    const { station } = formValues;
    const resetFormValues = Object.keys(addPeriodicRequestSchema).reduce(
      (acc, key) => {
        if (key === 'station') {
          acc[key] = station;
        } else {
          acc[key] = addPeriodicRequestSchema[key];
        }
        return acc;
      },
      {},
    );
    setFormValues(resetFormValues);
  }, [formValues.station]);

  const getSelectedOption = (value, options) => {
    return options?.find((option) => option.value === value) || null;
  };

  //UseEffect For Due Status
  useEffect(() => {
    if (reports?.data) {
      const matchingReport = reports.data.find(
        (report) =>
          report.registrationNo === formValues.registrationNo &&
          report.jobId === formValues.periodicType,
      );

      if (matchingReport) {
        let dueStatus = 'Not Due';
        if (matchingReport.isDue) {
          dueStatus = 'Due';
        } else if (matchingReport.isOverdueAlert) {
          dueStatus = 'Overdue';
        } else if (matchingReport.isPreAlert) {
          dueStatus = 'Pre-Alert';
        }

        setFormValues((prevState) => ({
          ...prevState,
          dueStatus: dueStatus,
        }));
      } else {
        // If no matching report is found, you might want to reset the due status
        setFormValues((prevState) => ({
          ...prevState,
          dueStatus: 'Not Due',
        }));
      }
    }
  }, [reports, formValues.registrationNo, formValues.periodicType]);
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Periodic Maintenance Request Form"
          pageNameprev="Periodic Maintenance"
          pagePrevPath="periodic"
        />
        <div className=" gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="text-md text-black dark:text-white font-medium">
                  Periodic Maintenance Request Information
                </h3>
              </div>

              <div className="p-7">
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="station"
                    >
                      Station
                    </label>
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
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="registrationNo"
                    >
                      Vehicle Number
                    </label>
                    <div className="relative">
                      {/* <AsyncSelect
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
                      /> */}

                      <Select
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={allVehicle}
                        value={
                          formValues?.registrationNo
                            ? {
                                value: formValues?.registrationNo,
                                label: formValues?.registrationNo,
                              }
                            : null
                        }
                        onChange={(selectedOption) => {
                          handleSelectChangeRegistrationNo(
                            'registrationNo',
                            selectedOption,
                          );
                        }}
                        placeholder="Select Vehicle"
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
                        onChange={handleChangeValue}
                        value={formValues?.make}
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="current_odo"
                    >
                      Current Meter Reading (Auto)
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="currentOddometerReading"
                        id="current_odo"
                        placeholder="Odometer Reading"
                        onChange={handleChangeValue}
                        value={vehicleDetails?.data?.oddometerReading}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label className="block text-md font-medium text-black dark:text-white">
                      Odometer Malfunctioned?
                    </label>
                    <div className="mt-2">
                      <label className="inline-flex items-center mr-6">
                        <input
                          type="radio"
                          name="odometerMalfunctioned"
                          checked={isOdometerMalfunctioned}
                          onChange={() => setIsOdometerMalfunctioned(true)}
                          className="form-radio"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="odometerMalfunctioned"
                          checked={!isOdometerMalfunctioned}
                          onChange={() => setIsOdometerMalfunctioned(false)}
                          className="form-radio"
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="meterReading"
                    >
                      Current Meter Reading (Manual)
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="number"
                        name="meterReading"
                        id="meterReading"
                        placeholder="50,000 km"
                        onChange={handleChangeValue}
                        value={formValues?.meterReading}
                      />
                    </div>
                  </div>
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
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
                        placeholder="Enter Driver Name"
                        onChange={handleChangeValue}
                        value={formValues?.driverName}
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="gbmsNo"
                    >
                      Employee Id.
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="gbmsNo"
                        id="gbmsNo"
                        placeholder="Enter Driver GBMS No."
                        onChange={handleChangeValue}
                        value={formValues?.gbmsNo}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
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
                        placeholder="0203020392011"
                        value={formValues?.aplCardNo}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 md:w-1/3">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="periodicType"
                    >
                      Periodic Type
                    </label>
                    <div className="relative">
                      <Select
                        styles={customStyles}
                        className="w-full rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        options={periodicType}
                        value={getSelectedOption(
                          formValues.periodicType,
                          periodicType,
                        )}
                        onChange={(selectedOption) =>
                          handleNormalSelectChange(
                            selectedOption,
                            'periodicType',
                          )
                        }
                        placeholder="Select Periodic Type"
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="lastDateOfChange"
                    >
                      Last Date of Change
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="lastDateOfChange"
                        id="lastDateOfChange"
                        placeholder="Last Date Of Change"
                        onChange={handleChangeValue}
                        value={
                          formValues?.lastDateOfChange
                            ? formatDateAndTime(formValues.lastDateOfChange)
                            : ''
                        }
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-small text-black dark:text-white"
                      htmlFor="meterReading"
                    >
                      Last Changed Meter Reading
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="meterReading"
                        id="meterReading"
                        placeholder="Last Record Reading"
                        value={formValues?.lastChangedMeterReading}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white truncate"
                      htmlFor="runningDifference"
                      title={`Last Odo Reading  change`}
                    >
                      Odometer Running Difference
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="runningDifference"
                        id="runningDifference"
                        placeholder="Running Difference"
                        value={formValues?.runningDifference}
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="dayRunningDifference"
                    >
                      Days Since Last Change
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="dayRunningDifference"
                        id="dayRunningDifference"
                        placeholder="Days Since Last Change"
                        value={formValues?.dayRunningDifference}
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="amount"
                    >
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="number"
                        name="amount"
                        id="amount"
                        placeholder="Enter Amount"
                        onChange={handleChangeValue}
                        value={formValues.amount}
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="dueStatus"
                    >
                      Due Status
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary uneditable"
                        type="text"
                        name="dueStatus"
                        id="dueStatus"
                        placeholder="Not Due"
                        value={formValues.dueStatus}
                        disabled
                      />
                    </div>
                  </div>

                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="quantity"
                    >
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="number"
                        name="quantity"
                        id="quantity"
                        placeholder="Enter Quantity"
                        onChange={handleChangeValue}
                        value={formValues.quantity}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className=" sm:w-1/2 md:w-1/3 lg:1/4">
                    <label
                      className="mb-3 block text-md font-medium text-black dark:text-white"
                      htmlFor="extras"
                    >
                      Description
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="extras"
                        id="extras"
                        placeholder="Enter Oil Filter Type etc"
                        onChange={handleChangeValue}
                        value={formValues.extras}
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
                          onClick={handleSubmit}
                        >
                          Add
                        </button>
                      )}
                    </>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PeriodicForm;
