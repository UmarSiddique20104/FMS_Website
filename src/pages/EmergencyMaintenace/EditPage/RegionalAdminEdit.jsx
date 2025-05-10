import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { IoEllipseSharp } from 'react-icons/io5';
import { EmergencyComponent } from '../EmergencyComponent';
import CustomSelect from '../Components/CustomSelect';
import InputField from '../Components/InputField';
import BreadcrumbNav from '../../../components/Breadcrumbs/BreadcrumbNav';
import {
  addEmergencyRequestSchema,
  addNewFormSchema,
} from '../../../utils/schemas';
import { customStyles } from '../../../constants/Styles';
import { stationOptions } from '../../../constants/Data';
import LoadingButton from '../../../components/LoadingButton';
import {
  useGetOneEmergencyRequestQuery,
  useUpdateEmergencyRequestMutation,
} from '../../../services/emergencySlice';
import useToast from '../../../hooks/useToast';
import DefaultLayout from '../../../layout/DefaultLayout';
import {
  useGetVehicleByCompanyIdQuery,
  useGetVehicleQuery,
} from '../../../services/vehicleSlice';
import ServiceDetail from '../Components/ServiceDetail';
import MultipleUploadWidget from '../../../components/MultipleUploadWidget';

//  >>>>>>>>>>>>>>>>>>>>

const RegionalAdminEdit = () => {
  const [serviceValues, setServiceValues] = useState({});
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [supplierData, setSupplierData] = useState([]);
  const [supplierCode, setSupplierCode] = useState([]);
  const [seletedSupplier, setSelectedSupplier] = useState();
  const { showErrorToast, showSuccessToast } = useToast();
  const [sentForInsurance, setSentForInsurance] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [issuranceVehicleDetails, setIssuranceVehicleDetails] = useState({});
  const [billDetailsValues, setBillDetailsValues] = useState({
    poNumber: '',
    poDate: '',
    billNumber: '',
    billDate: '',
    dcNumber: '',
    dcDate: '',
    documentDate: '',
    remarks: '',
    statisFactionRemarks:""
  });

  const [allServices, setAllServices] = useState([]);
  const [formSevivces, setFormServices] = useState([]);

  const [formValues, setFormValues] = useState({
    ...addEmergencyRequestSchema,
  });
  const [formValues2, setFormValues2] = useState({
    ...addNewFormSchema,
    rows: [
      {
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
      },
    ],
  });

  const addNewRow = () => {
    setFormValues2((prevState) => ({
      ...prevState,
      rows: [
        ...prevState.rows,
        {
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
        },
      ],
    }));
  };
  const deleteRow = (index) => {
    setFormValues2((prevState) => ({
      ...prevState,
      rows: prevState.rows.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSave = () => {
    const allRowsValid = formValues2.rows.every((row) => {
      return (
        row.periods &&
        row.location &&
        row.number &&
        row.date &&
        row.station &&
        row.supplier &&
        row.name &&
        row.poNumber &&
        row.poDate &&
        row.portalReference &&
        row.billNumber &&
        row.billDate &&
        row.dcNumber && // New validation
        row.dcDate && // New validation
        row.sTax && // New validation
        row.fTax && // New validation
        row.remarks // New validation
      );
    });

    if (!allRowsValid) {
      showErrorToast(
        'All fields are required for each entry. Please fill in the missing fields.',
      );
      return;
    }

    // Proceed with save functionality here (e.g., send formValues2 to an API)
    showSuccessToast('Request Processed Successfully!');
  };

  const handleInputChange = (e, index, fieldName) => {
    const { value } = e.target || e;
    const updatedRows = [...formValues2.rows];
    updatedRows[index][fieldName] = value;

    setFormValues2((prevState) => ({
      ...prevState,
      rows: updatedRows,
    }));
  };

  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  const { data: vehicleDetails } = useGetVehicleQuery(
    EmergencyData?.data?.registrationNo,
  );

  const [accidentalDetails, setAccidentalDetails] = useState({
    isAccidental: false,
    accidentalType: '',
    additionalRemarks: '',
  });

  useEffect(() => {
    if (vehicleDetails) {
      setIssuranceVehicleDetails(vehicleDetails);
    }
  }, [vehicleDetails]);

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
        // services: eData?.services || [],
        status: eData?.status,
      });
      setAccidentalDetails({
        isAccidental: eData?.isAccidental,
        accidentalType: eData?.accidentalType,
        additionalRemarks: eData?.additional,
      });
      setSelectedSupplier({
        supplier_id: eData?.supplierCode,
        name: eData?.supplierDescription,
      });
      console.log("dddddd >>> ", eData)
      setBillDetailsValues({
        poNumber: eData?.poNumber,
        poDate: eData?.poDate,
        billNumber: eData?.billNumber,
        billDate: eData?.billDate,
        dcNumber: eData?.dcNumber,
        dcDate: eData?.dcDate,
        documentDate: eData?.documentDate,
        remarks: eData?.remarks,
        statisFactionRemarks:eData?.statisfactionRemarks
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
  const Validator = () => {
    let newErrorMessages = [];

    allServices.forEach((row, index) => {
      if (!row.serviceCode) {
        newErrorMessages[index] = 'Service Code is required.';
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
    return newErrorMessages;
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

    if(formSevivces?.status !== 'approved'){  

        if (formSevivces?.length > allServices?.length && allServices?.length > 0) {
          const filteredServices = formSevivces.filter(
            (formService) =>
              !allServices.some((allService) => allService.id === formService.id),
          );
    
          try {
            await Promise.all(
              filteredServices.map(async (item) => await deleteServices(item.id)),
            );
    
            showSuccessToast('Request Processed Successfully!');
    
            navigate(-1);
            window.location.reload();
            return;
          } catch (err) {
            console.log(err);
            showErrorToast(
              'An error has occurred while updating emergency Maintenance Request',
            );
            return;
          }
        }
    }

    if (newErrorMessages.every((msg) => msg === '')) {
      let status;

      let updatedFormServices = [];

      if (allServices?.length !== 0) {
        updatedFormServices = formSevivces.map((formService, index) => {
          const service = allServices[index];
          return {
            ...formService,
            odometerReading: EmergencyData?.data?.meterReading,
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
        services:
          updatedFormServices?.length > 0 ? updatedFormServices : formSevivces,
      };

      if(emergencyReceiptImgUrls.length !== 0){

          updatedFormData.emergencyRepairCompletionImgs =emergencyReceiptImgUrls
          updatedFormData.emergencyReceiptImgs = emergencyReceiptImgUrls
      }
 
      console.log("firs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>t",EmergencyData?.data?.status )
      if (EmergencyData?.data?.status === 'approved' || EmergencyData?.data?.status === 'inspection done' || EmergencyData?.data?.status ==="waiting for completion") {
        console.log("first" ,billDetailsValues)
        if (!billDetailsValues.billDate || !billDetailsValues.billNumber) {
          showErrorToast(
            'Please fill in all the billing details to complete the request',
          );
          return;
        }
        if (!seletedSupplier) {
          showErrorToast('Please select a supplier to complete the request');
          return;
        }
        if (!billDetailsValues.dcDate || !billDetailsValues.dcNumber) {
          showErrorToast(
            'Please fill in all the billing details to complete the request',
          );
          return;
        }
        if (!billDetailsValues.documentDate) {
          showErrorToast(
            'Please fill in all the billing details to complete the request',
          );
          return;
        }
        if (!billDetailsValues.poDate || !billDetailsValues.poNumber) {
          showErrorToast(
            'Please fill in all the billing details to complete the request',
          );
          return;
        }
        if (!billDetailsValues.remarks) {
          showErrorToast(
            'Please fill in all the billing details to complete the request',
          );
          return;
        }
        if(!billDetailsValues.statisFactionRemarks){
            showErrorToast(
                'Please fill in all the statisfaction remarks to complete the request',
              );
              return; 
        }
        if (!seletedSupplier) {
          showErrorToast('Please select a supplier to complete the request');
          return;
        }

        if(updatedFormData.emergencyReceiptImgs.length === 0){
            showErrorToast('Please select Emergency Repair Request Imges to complete the request');
            return;
        }
        if(updatedFormData.emergencyRepairCompletionImgs
            .length === 0){
            showErrorToast('Please select Emergency Repair Request Imges to complete the request');
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
        updatedFormData.statisFactionRemarks = billDetailsValues.statisFactionRemarks;
        if(EmergencyData?.data?.status === 'inspection done'){
            updatedFormData.status = "completed"
        }
      }
      if (updatedFormData?.status === 'approved') {
        updatedFormData.status = "waiting for completion"
      }

     
      console.log("updatedFormData>>>>>>>>>>",updatedFormData);
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
  const [isAccidental, setIsAccidental] = useState(false);

  const handleAccidentalChange = (event) => {
    const value = event.target.value === 'accidental';

    setIsAccidental(value);
    setAccidentalDetails({
      ...accidentalDetails,
      isAccidental: value,
      accidentalType: value ? 'accidental' : 'normal',
    });
  };

  const handleSubmitForInsurance = () => {
    if (accidentalDetails?.isAccidental) {
    }
  };

  const deleteServices = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const requestOptions = {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
      };

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/emergency/service/${id}`,
        requestOptions,
      );

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-600">
        <BreadcrumbNav
          pageName="Emergency Maintenance Process Form"
          pageNameprev="Emergency Maintenance"
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

                  {formValues?.status == 'pending'? (
                    <EmergencyComponent
                      setAllServices={setAllServices}
                      formValues={EmergencyData?.data}
                    />):(
                    <>
                    <h3 className="text-lg font-bold">Services:</h3>
                    {EmergencyData?.data?.services?.length > 0 ? (
                      EmergencyData.data.services.map((service, index) => (
                        <ServiceDetail key={index} service={service} />
                      ))
                    ) : (
                      <p className="text-md font-normal">
                        No services found.
                      </p>
                    )}
                  </>
                  )  }

                  

                  {(formValues?.status == 'approved' || formValues?.status == 'inspection done' || formValues?.status =="waiting for completion") ? (
                    <div>
                      <div className=" ">
                        <h1 className="text-xl font-bold pb-10">
                          Add Billing Details
                        </h1>
                      </div>
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
                              remarks: e.target.value,
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
                              statisFactionRemarks: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : null}

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
                          {formValues.emergencyRepairRequestImgs?.map(
                            (url, index) => (
                              <li key={index}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={url}
                                    alt={`Emergency Repair Image ${index + 1}`}
                                    className="object-contain h-48 w-48 mb-4"
                                  />
                                </a>
                              </li>
                            ),
                          )}
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

                   
                  </div>

                {(formValues.status === 'approved' || formValues.status === "inspection done" || formValues.status === "waiting for completion"  )&& <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className='w-full sm:w-1/2 md:w-1/3'>
                      <p className="text-md font-semibold ">
                        Repair Receipt Images:
                      </p>
                  
                      {formValues?.emergencyReceiptImgs.length > 0 ? (
                        formValues?.emergencyReceiptImgs.map(
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
                          {  (
                              <div className="w-full pe-10 pt-10">
                                <div className="relative">
                                  <MultipleUploadWidget
                                    setImgUrls={
                                      setEmergencyRepairCompletionImgUrls
                                    }
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

                    <div className='w-full sm:w-1/2 md:w-1/3'>
                      <p className="text-md font-semibold">
                        Repair Completion Images:
                      </p>
                      {formValues?.emergencyRepairCompletionImgs
                        .length > 0 ? (
                            formValues?.emergencyRepairCompletionImgs.map(
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
                          {  (
                              <>
                                <div className="w-full pe-10 pt-10">
                                  <div className="relative">
                                    <MultipleUploadWidget
                                      setImgUrls={setEmergencyReceiptImgUrls}
                                      id="emergencyReceiptImgWidget"
                                    />

                                    <ul className="list-disc pl-5">
                                      {emergencyReceiptImgUrls.map(
                                        (url, index) => (
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
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </>
                            )}
                        </>
                      )}
                    </div>
                  </div>}

                  <div className="mr-5">
                    <div className="flex justify-end gap-4.5">
                      { 
                        <>
                        <div
                          className="flex cursor-pointer justify-center rounded border border-stroke py-2 px-6 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                          onClick={() => navigate(-1)}
                        >
                          Cancel
                        </div>

                        <button
                            type="submit"
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                          >
                            Update Record
                           
                          </button>
                        </>

                        
                       }
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

export default RegionalAdminEdit;
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
