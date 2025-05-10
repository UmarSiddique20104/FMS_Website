 

import React, { useEffect, useState } from 'react';
import { customStyles } from '../../constants/Styles';
import Select from 'react-select';
import { RiDeleteBinLine } from 'react-icons/ri';
export const  EmergencyComponent = ({ setAllServices, formValues }) => {

  const [emergencyData, setEmergencyData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [stationData, setStationData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [serviceCode, setServiceCode] = useState();
  const [locationCode, setLocationCode] = useState();
  const [stationCode, setStationCode] = useState();
  const [supplierCode, setSupplierCode] = useState();
  const [serviceValues, setServiceValues] = useState({
    id:null,
    serviceCode: '',
    serviceDescription: '',
    description: '',
    project: '',
    serviceDetails: '',
    asset: '',
    assestDescription: '',
    location: '',
    locationDescription: '',
  });
  const [assestCode, setAssestCode] = useState();
  const [serviceRows, setServiceRows] = useState([createNewServiceRow()]);
  function createNewServiceRow() {
    return {
      id: null,
      serviceCode: '',
      serviceDescription: '',
      project: '',
      serviceDetails: '',
      asset: '',
      assestDescription: '',
      location: '',
      locationDescription: '',
      netValue: null,
      serviceValue: null,
      salesTax: null,
      futhurTax: null,
      description: '',
      otherCosts: null,
      remarks: '',
      supplierCode: '',
      supplierDescription: '',
    };
  }
  const addServiceRow = () => {
    setServiceRows([...serviceRows, createNewServiceRow()]);
    setAllServices([...serviceRows, createNewServiceRow()]);
  };
  const removeServiceRow = (index) => {
    const updatedRows = [...serviceRows];
    updatedRows.splice(index, 1);
    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };
  const handleServiceChange = (selectedOption, index) => {
    const updatedRows = [...serviceRows];
    const selectedService = serviceData.find(
      (service) => service.service_code === selectedOption,
    );

    updatedRows[index] = {
      ...updatedRows[index],
      serviceCode: selectedOption,
      serviceDescription: selectedService
        ?   selectedService.description + " - " + selectedService.type_description
        : '',
    };

    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };

  const handleValuesChange = (event, index) => {
    const { name, value } = event.target;
    const updatedRows = [...serviceRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [name]: value,
    };

    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };
  const handleValuesChangeLocation = (event, index) => {
    const { name, value } = event.target;
    const updatedRows = [...serviceRows];

    const selectedlcation = locationData.find(
      (location) => location.code === value,
    );

    updatedRows[index] = {
      ...updatedRows[index],
      location: value,
      locationDescription: selectedlcation ? selectedlcation.name : '',
    };

    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };
  const handleChangePrice = (e, index) => {
    const { name, value } = e.target;
    const updatedRows = [...serviceRows];

    updatedRows[index] = {
      ...updatedRows[index],
      [name]: parseFloat(value) || null,
    };

    const netValue =
      (updatedRows[index].serviceValue ||null ) +
      (updatedRows[index].salesTax || null) +
      (updatedRows[index].futhurTax || null) +
      (updatedRows[index].otherCosts || null);

    updatedRows[index].netValue = netValue;

    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };

  const projectOptions = [
    { value: 'Project 1', label: 'Project 1' },
    { value: 'Project 2', label: 'Project 2' },
    { value: 'Project 3', label: 'Project 3' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
          redirect: 'follow',
        };

        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/emergency-creation`,
          requestOptions,
        )
          .then((response) => response.json())
          .then((result) => {
            const vehicles = result?.data?.totalVehicle;
            const locations = result?.data?.totalLocation;
            const stations = result?.data?.totalStation;
            const services = result?.data?.totalGbmsService;
            const supplier = result?.data?.totalSupplier;
              console.log(services)
            const formatServiceCode = services.map((service) => {
              return {
                value: service.service_code,
                label: service.service_code + ' - ' + service.description + " - " + service.type_description, 
              };
            });
            const formatLocationCode = locations.map((location) => {
              return {
                value: location.code,
                label: location.code + ' - ' + location.name,
              };
            });

            const formatStationCode = stations.map((station) => {
              return {
                value: station.code,
                label: station.code + ' - ' + station.name,
              };
            });
            const formatSupplierCode = supplier.map((supplier) => {
              return {
                value: supplier.supplier_id,
                label: supplier.supplier_id,
              };
            });

            const formatAessstCode = vehicles.map((vehicle) => {
              return {
                value: vehicle.code,
                label: vehicle.code,
              };
            });

            setAssestCode(formatAessstCode);
            setSupplierCode(formatSupplierCode);
            setStationCode(formatStationCode);
            setServiceCode(formatServiceCode);
            setLocationCode(formatLocationCode);
            setVehicleData(vehicles);
            setLocationData(locations);
            setStationData(stations);
            setServiceData(services);
            setSupplierData(supplier);

            setEmergencyData(result?.data);
          })
          .catch((error) => console.error(error));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
         if (formValues?.services?.length) {
      const updatedServices = formValues?.services?.map((service) => {
        const selectedlcation = locationData.find(
          (location) => location.code === service.code,
        );
     
        const locationDescription = selectedlcation ? selectedlcation.name : '';
 
        return {
          id: service.id, 
          serviceCode: service.service_code,
          serviceDescription: service.description,
          project: service.project,
          serviceDetails: service.serviceDetails,
          asset: service.asset, 
          assestDescription: service.assestDescription,
          location: service.code,
          locationDescription,
          description: service.description,
          netValue:service.net_value !== null?  Number(service.net_value):null,
          serviceValue:service.value !== null? Number(service.value): null,
          salesTax:service.sales_tax !== null? Number(service.sales_tax):null,
          futhurTax: service.further_tax !== null? Number(service.further_tax):null,
          otherCosts:service.further_tax !==null? Number(service.other_costs):null,
          remarks: service.remarks,
        };
      });
     
      setServiceRows(updatedServices);
    }
  }, [formValues , locationData , serviceData]);

  const handleLocationChange = (selectedOption) => {
    const selectedLocation = locationData.find(
      (location) => location.code === selectedOption,
    );
    setServiceValues({
      ...serviceValues,
      location: selectedOption,
      locationDescription: selectedLocation ? selectedLocation.name : '',
    });
  };
  const handleSupplierChange = (selectedOption, index) => {
    const updatedRows = [...serviceRows];
    const selectedSupplier = supplierData.find(
      (supplier) => supplier.supplier_id === selectedOption,
    );
   

    updatedRows[index] = {
      ...updatedRows[index],
      supplierCode: selectedOption,
      supplierDescription: selectedSupplier ? selectedSupplier.name  : '',
    };

    setServiceRows(updatedRows);
    setAllServices(updatedRows);
  };

  const [errorMessages, setErrorMessages] = useState([]);
  const handleSubmit = (e) => {
    const newErrorMessages = [];

    serviceRows.forEach((row, index) => {
      if (!row.serviceCode) {
        newErrorMessages[index] = 'Service Code is required.';
      } else if (!row.serviceDescription) {
        newErrorMessages[index] = 'Service Description is required.';
      } else if (row.serviceValue <= 0) {
        newErrorMessages[index] = 'Service Value must be greater than 0.';
      } else if (row.salesTax < 0) {
        newErrorMessages[index] = 'Sales Tax cannot be negative.';
      } else if (row.futhurTax < 0) {
        newErrorMessages[index] = 'Further Tax cannot be negative.';
      } else if (row.otherCosts < 0) {
        newErrorMessages[index] = 'Other Costs cannot be negative.';
      } else if (!row.location) {
        newErrorMessages[index] = 'Location selection is required.';
      } else if (!row.locationDescription) {
        newErrorMessages[index] = 'Location Description is required.';
      } else {
        newErrorMessages[index] = '';
      }

       
    });

    setErrorMessages(newErrorMessages);
    // setServiceProprs()

    if (newErrorMessages.every((msg) => msg === '')) {
    }
  };

 

  return (
    <div>
      <h1 className="text-xl font-bold pb-10">Service Received Note</h1>
      
      {serviceRows.map((row, index) => (
        
        <div
          key={index}
          className="grid lg:grid-cols-1 md:grid-cols-2 grid-cols-1 gap-5 border mt-4 p-4  "
        >
         
          {index > 0 && (
            <div className="flex justify-end items-end gap-4.5">
              <span
                onClick={() => removeServiceRow(index)}
                className="  rounded mt-4   cursor-pointer"
              >
                <RiDeleteBinLine className="text-red-500 h-10 w-10 " />{' '}
              </span>
            </div>
          )}
          <div className="grid md:grid-cols-3  gap-5">
            <div className="w-full ">
              
              <CustomSelect
                important={true}
                label="Select Service Code"
                options={serviceCode}
                value={row.serviceCode}
                onChange={(option) => handleServiceChange(option, index)}
                placeholder="Select Service Code"
                customStyles={customStyles}
              />
            </div>
            <InputField
              label="Service Description"
              name="serviceDescription"
              id={`serviceDescription-${index}`}
              placeholder="Service Description"
              type="text"
              value={row.serviceDescription}
              disabled={true}
              readOnly
            />
            <div className=" ">
              <CustomSelect
                label="Select Project"
                options={projectOptions}
                value={row.project}
                onChange={(option) => {
                  handleValuesChange(
                    { target: { name: 'project', value: option } },
                    index,
                  );
                }}
                placeholder="Select Project"
                customStyles={customStyles}
              />
            </div>
          </div> 

          <div className="grid lg:grid-cols-5  md:grid-cols-3 gap-5 ">
            <InputField
              important={true}
              label="Service Value"
              name="serviceValue"
              id={`serviceValue-${index}`}
              placeholder="Enter Service Value"
              type="number"
              value={row.serviceValue}
              onChange={(e) => handleChangePrice(e, index)}
            />
            <InputField
              label="Sales Tax"
              name="salesTax"
              id={`salesTax-${index}`}
              placeholder="Enter Service Tax"
              type="number"
              value={row.salesTax}
              onChange={(e) => handleChangePrice(e, index)}
            />
            <InputField
              label="Further Tax"
              name="futhurTax"
              id={`futhurTax-${index}`}
              placeholder="Enter Further Tax"
              type="number"
              value={row.futhurTax}
              onChange={(e) => handleChangePrice(e, index)}
            />
            <InputField
              label="Other Costs"
              name="otherCosts"
              id={`otherCosts-${index}`}
              placeholder="Enter Other Costs"
              type="number"
              value={row.otherCosts}
              onChange={(e) => handleChangePrice(e, index)}
            />
            <InputField
              important={true}
              label="Net Value"
              name="netValue"
              id={`netValue-${index}`}
              placeholder="Net Value"
              type="number"
              disabled={true}
              readOnly
              value={row.netValue}
            />
          </div>
          <div>
          <div className="flex gap-5">
            <CustomTextArea
              label="Description"
              value={row.description}

              onChange={(e) => handleValuesChange({ target: { name: 'description', value: e } }, index)}
              placeholder="Enter your description here"
              rows={2}
            />
          </div>

          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="col-span-1">
              <CustomSelect
              important={true}
                label="Select Location"
                options={locationCode}
                value={row.location}
                onChange={(option) =>
                  handleValuesChangeLocation(
                    { target: { name: 'location', value: option } },
                    index,
                  )
                }
                placeholder="Select Location"
                customStyles={customStyles}
              />
            </div>
            <div className="col-span-2">
              <InputField
                label="Location Description"
                name="locationDescription"
                id={`locationDescription-${index}`}
                placeholder="Location Description"
                type="text"
                value={row.locationDescription}
                disabled={true}
                readOnly
              />
            </div>
          </div>

          <CustomTextArea
            label="Remarks"
            value={row.remarks}
            onChange={(e) =>
              handleValuesChange(
                { target: { name: 'remarks', value: e } },
                index,
              )
            }
            placeholder="Enter your remarks here"
            rows={2}
          />
        </div>
      ))}

      <div className="flex justify-start items-center gap-4.5 pb-10">
        <span
          onClick={addServiceRow}
          className="bg-blue-500 text-white p-2 rounded mt-4 px-5 cursor-pointer"
        >
          Add More
        </span>
      </div>
     
    </div>
  );
};

 

export const InputField = ({
  label,
  name,
  id,
  placeholder,
  value,
  onChange,
  disabled,
  className = '',
  important,
  type,
}) => {
  return (
    <div className={`w-full  ${className}`}>
      <label
        className={` mb-3 block text-md font-medium text-black dark:text-white ${important ? 'text-red-600' : ''}`}
        htmlFor={id}
      >
        {label}
        {important ? <span className="text-red-600">*</span> : ''}
      </label>
      <div className="relative">
        <input
          className={` w-full rounded border   py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none ${disabled ? 'uneditable  border-stroke' : 'bg-gray border-stroke'}`}
          type={type}
          name={name}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  customStyles,
  className = '',
  important,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={` mb-3 block text-md font-medium text-black ${important ? 'text-red-600' : ''}`}
        >
          {label} {important ? <span className="text-red-600">*</span> : ''}
        </label>
      )}
      <Select
        styles={customStyles}
        className="  rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
        options={options}
        value={value ? { value: value, label: value } : null}
        onChange={(selectedOption) => onChange(selectedOption.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export const CustomTextArea = ({
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};
