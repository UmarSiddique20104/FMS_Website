import { CiEdit } from 'react-icons/ci';
import { IoEyeOutline } from 'react-icons/io5';
import { RiDeleteBinLine } from 'react-icons/ri';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import useToast from '../../hooks/useToast';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteModal from '../../components/DeleteModal';
import {
  useGetEmergencyrequestQuery,
  useDeleteEmergencyRequestMutation,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import { FaSearch } from 'react-icons/fa';
import Select from 'react-select';
import { exportToPDF } from '../../components/ExportPDFCSV/ExportPDFCSV';
import ExcelJS from 'exceljs';
import { IoIosSend } from 'react-icons/io';
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

const EmergencyTableForAdmin = ({ Role }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showButton, setShowButton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { data, refetch } = useGetEmergencyrequestQuery({
    page,
    limit,
    searchTerm,
    // sortBy,
    // sortOrder,
    // station: user?.station,
    isAccidental: user?.Role?.roleName === 'sendForInsurance' ? true : false,
  });

  const handleSearch = (e) => {
    const { value } = e.target;

    if (value.trim() !== '') {
      // Check if the value is not empty or just whitespace
      setSearchTerm(value);
      refetch(); // Call the API when there's a valid search term
    } else {
      setSearchTerm(''); // Clear the search term if the input is empty
    }
  };

  const { showErrorToast, showSuccessToast } = useToast();
  const [UpdateEmergencyRequest, { isLoading: updateLoading }] =
    useUpdateEmergencyRequestMutation();
  const onDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // Delete the item from the data
      const newData = packageData.filter((item) => item.id !== id);
      setPackageData(newData);
    }
  };

  const [DeleteVehicle] = useDeleteEmergencyRequestMutation();
  const [deleteId, setDeleteId] = useState(null);

  const deleteVehicle = async (id) => {
    try {
      await DeleteVehicle(id).unwrap();
      window.location.reload();
      showSuccessToast('Emergency Maintaince Vehicle Deleted Successfully!');
    } catch (err) {
      console?.log(err);
      showErrorToast(`An error has occurred while deleting vehicle`);
    }
  };

  const [status, setStatus] = useState();

  const handleStatusChange = async (id, newStatus) => {
    const filerData = data?.data.filter((e) => e.id === id);
    const response = {
      ...filerData[0],
      status: newStatus,
    };

    await UpdateEmergencyRequest({
      id,
      formData: response,
    }).unwrap();

    refetch();
    window.location.reload();

    setStatus(newStatus);
    showSuccessToast('Status Updated Successfully');
  };

  const sendToGBMS = async (id) => {
    try {
      const requestOptions = {
        method: 'GET',
        redirect: 'follow',
      };

      // Using async/await for the fetch call
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/emergency-creation/submit-to-gbms/${id}`,
        requestOptions,
      );
      const result = await response.json();

      // Check if the response is successful
      if (result.success) {
        showSuccessToast('Record Saved Successfully');
        window.location.reload();
      } else {
        console.error('Failed to save the record:', result);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleNavigation = (id, status) => {
    if (Role === 'companyAdmin' || Role === 'supervisor') {
      if (status === 'inspection done') {
        navigate(`/InsuranceProcessForm/final-process/${id}`);
      } else {
        navigate(`/Emergency-Maintenance/process-admin/${id}`);
      }
    } else {
      navigate(`process-regional/${id}`);
    }
  };
  const handleInsuranceNavigation = (id) => {
    navigate(`/InsuranceProcessForm/view/${id}`);
  };

  const handleNavigationViewByAdmin = (id, status) => {
    if (status === 'surveyor appointed') {
      navigate(`/InsuranceProcessForm/view/${id}`);
    } else if (status === 'satisfaction note issued') {
      navigate(`/InsuranceProcessForm/final-process/${id}`);
    } else if (status === 'completed') {
      navigate(`/Emergency-Maintenance/view-admin/${id}`);
    } else {
      navigate(`/Emergency-Maintenance/view-admin/${id}`);
    }
  };

  const handleAdminViewNavigation = (id, status) => {
    if (Role === 'insuranceAdmin') {
      navigate(`/Emergency-Maintenance/view-insurance/${id}`);
    } else {
      navigate(`/Emergency-Maintenance/view-admin/${id}`);
    }
  };
  const [allData, setAllData] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [statusFilterState, setStatusFilterState] = useState(null);
  const [statusFilterInitialState, setStatusFilterInitialState] = useState(
    allStatus[0],
  );

  useEffect(() => {
    if (data) {
      setAllData(data.data);
      setFilteredData(data.data);
      const uniqueStatuses = Array.from(
        new Set(data.data.map((e) => e.status)),
      );

      const statusOptions = [
        { value: 'all', label: 'Select All' }, // Add this line for the "Select All" option
        // ...uniqueStatuses.map((status) => ({
        //   value: status,
        //   label: status.charAt(0).toUpperCase() + status.slice(1),
        // })),
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'completed', label: 'Completed' },
        { value: 'waiting for completion', label: 'Waiting For Completion' },
        { value: 'lnsurance lodge', label: 'Insurance Lodge' },
        { value: 'repair approved', label: 'Repair Approved' },
        { value: 'repair rejected', label: 'Repair Rejected' },
        { value: 'repair completed', label: 'Repair Completed' },
        { value: 'inspection done', label: 'Inspection Done' },
        {
          value: 'statisfiaction note issued',
          label: 'Statisfiaction Note Issued',
        },
      ];

      setAllStatus(statusOptions);
      ClearFilters();
    }
  }, [data]);

  useEffect(() => {
    filterData();
  }, [statusFilterState]);

  const filterData = () => {
    let filtered = [...allData];

    if (statusFilterState) {
      if (statusFilterState === 'all') {
        filtered = allData;
      } else {
        filtered = filtered.filter((item) => item.status === statusFilterState);
      }
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };
  const ClearFilters = () => {
    setFilteredData(allData);
    setStartDate(null);
    setEndDate(null);
    setStatusFilterState('all');
  };
  const exportPDF = (data) => {
    const columnsToFilter = [
      'id',
      'registrationNo',
      'meterReading',
      'driverName',
      'gbmsNo',
      'ce',
      'rm_omorName',
      'emergencySupervisor',
      'description',
      'estimatedCost',
      'Statisfaction Remarks',
      'created_at',
      'supplierCode',
      'poNumber',
      'poDate',
      'billNumber',
      'billDate',
      'dcNumber',
      'dcDate',
      'documentDate',
      'remarks',
      'status',
    ];
    const columnsToPrint = [
      'Request ID',
      'Vehicle No.',
      'Meter Reading',
      'Driver Name',
      'GBMS No.',
      'CE',
      'RMO Name',
      'Emergency Supervisor',
      'Description',
      'Estimated Cost',
      'statisFactionRemarks',
      'Created At',
      'Supplier Code',
      'PO Number',
      'PO Date',
      'Bill Number',
      'Bill Date',
      'DC Number',
      'DC Date',
      'Document Date',
      'Remarks',
      'Status',
    ];
    exportToPDF(
      filteredData,
      columnsToFilter,
      columnsToPrint,
      'Emergency Maintaince Requests',
    );
  };
  const exportToCsv = async (data) => {
    if (data.length === 0) {
      console.error('No data provided.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fuel Requests');

    const columnsToFilter = [
      'id',
      'registrationNo',
      'meterReading',
      'driverName',
      'gbmsNo',
      'ce',
      'rm_omorName',
      'emergencySupervisor',
      'description',
      'estimatedCost',
      'Statisfaction Remarks',
      'created_at',
      'supplierCode',
      'poNumber',
      'poDate',
      'billNumber',
      'billDate',
      'dcNumber',
      'dcDate',
      'documentDate',
      'remarks',
      'status',
    ];
    const columnsToPrint = [
      'Request ID',
      'Vehicle No.',
      'Meter Reading',
      'Driver Name',
      'GBMS No.',
      'CE',
      'RMO Name',
      'Emergency Supervisor',
      'Description',
      'Estimated Cost',
      'statisFactionRemarks',
      'Created At',
      'Supplier Code',
      'PO Number',
      'PO Date',
      'Bill Number',
      'Bill Date',
      'DC Number',
      'DC Date',
      'Document Date',
      'Remarks',
      'Status',
    ];

    const rows = [];

    filteredData.forEach((obj, index) => {
      const values = columnsToFilter.map((key) => {
        let value = obj[key];
        if (key === 'created_at') {
          const date = new Date(value);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          value = `${day}-${month}-${year} ${hours}:${minutes}`;
        }
        return value;
      });
      rows.push([index + 1, ...values]); // Adding serial number
    });

    worksheet.addRow(columnsToPrint); // Add header row
    rows.forEach((row) => worksheet.addRow(row)); // Add data rows

    // Freeze the first row and make it bold
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 13 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Set specific column widths
    worksheet.getColumn(3).width = 12; // Vehicle No.
    worksheet.getColumn(4).width = 20; // Driver
    worksheet.getColumn(5).width = 10; // GBMS-NO
    worksheet.getColumn(10).width = 10; // Req-type
    worksheet.getColumn(15).width = 20; // Card Number
    worksheet.getColumn(16).width = 10; // Fuel Type
    worksheet.getColumn(19).width = 16; // Created At

    // Setting the width for the Serial Number column
    worksheet.getColumn(1).width = 10; // Serial Number

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, 'Fuel_Requests_Data.xlsx');
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Fuel_Requests_Data.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(
          'Your browser does not support downloading files. Please try another browser.',
        );
      }
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Adjust the number of items per page as needed
  const [currentData, setCurrentData] = useState([]);

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  useEffect(() => {
    // Update the current data slice whenever currentPage or filteredData changes
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentData(filteredData?.slice(startIndex, endIndex));
  }, [currentPage, filteredData, itemsPerPage]);

  // Function to handle page changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const filterByDate = () => {
    if (!startDate || !endDate) {
      showErrorToast('Please select a date range');
      return;
    }

    if (startDate > endDate) {
      showErrorToast('Start date should be less than end date');
      return;
    }

    // Convert startDate and endDate to Date objects without time
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0); // Set time to the start of the day
    end.setHours(23, 59, 59, 999); // Set time to the end of the day

    // Filter the data based on the date range
    const filtered = allData.filter((item) => {
      const itemDate = new Date(item.created_at); // Adjust if your date is in a different format or property
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  };

  const location = useLocation();
  useEffect(() => {
    const status = location?.state?.status;
    if (status) {
      setStatusFilterState(status);
      setStatusFilterInitialState(allStatus[1]);
    }
  }, []);

  return (
    <>
      <div className="flex justify-between mb-2">
        <div className="flex justify-between items-center">
          <div className="ml-7 mr-auto relative text-gray-600 w-90">
            <input
              className="rounded-full border border-slate-300 bg-white h-12 px-5 pr-16 text-md focus:outline-none focus:border-slate-400 w-full dark:border-slate-600 dark:bg-boxdark dark:text-slate-300 dark:focus:border-slate-400"
              type="text"
              name="search"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button type="submit" className="absolute right-0 top-0 mt-4 mr-5">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center pt-4">
        <div className="flex flex-wrap space-x-4">
          <div className="flex gap-4">
            <div className="flex-1 min-w-[150px]">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="p-2 border rounded w-full bg-white"
                placeholderText="Select From Date"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="p-2 border rounded w-full bg-white"
                placeholderText="Select To Date"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Select
                options={allStatus}
                onChange={(selectedOption) =>
                  setStatusFilterState(selectedOption?.value || null)
                }
                className="ml-1 border rounded w-full"
                placeholder="Status"
              />
            </div>
            <div className="flex justify-center">
              <div className="flex-1 min-w-[130px]   ">
                <span
                  onClick={filterByDate}
                  className="btn h-[23px]  text-sm border-slate-200 hover:bg-blue-400 bg-primary text-white     transition duration-150 ease-in-out rounded-md"
                >
                  Filter By Date
                </span>
              </div>
              <div className="flex-1    ">
                <span
                  onClick={ClearFilters}
                  className="btn h-[23px]  text-sm border-slate-200 hover:bg-red-400 bg-danger text-white     transition duration-150 ease-in-out rounded-md"
                >
                  Clear Filter
                </span>
              </div>
              {/* <div className="flex-1 min-w-[150px]">
              <div
                onClick={exportPDF}
                className="btn h-[23px]  text-sm border-slate-200 hover:bg-opacity-90 bg-primary text-white     transition duration-150 ease-in-out rounded-md"
              >
                Export PDF
              </div>
            </div> */}
              <div className="flex-1  w-[130px]">
                <div
                  onClick={exportToCsv}
                  className="btn h-[23px]  text-sm border-slate-200 hover:bg-opacity-90 bg-primary text-white     transition duration-150 ease-in-out rounded-md"
                >
                  Export Excel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white my-2 px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto scroll-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  S.No.
                </th>
                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Station
                </th>

                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Reg No
                </th>

                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Current Oddometer
                </th>
                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Status
                </th>
                {(Role === 'companyAdmin' ||
                  Role === 'supervisor' ||
                  Role === 'insuranceAdmin') && (
                  <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                    Update Status
                  </th>
                )}
                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Created At
                </th>

                <th className="w-auto items-center flex-1 py-4 px-3 text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData?.map((e, key) => (
                <tr className="py-3" key={key}>
                  {console.log('e', currentData?.length)}
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {e?.id}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {e?.station}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {e?.registrationNo}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {e?.meterReading}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {e?.status?.charAt(0)?.toUpperCase() +
                        e?.status?.slice(1)}
                    </p>
                  </td>

                  {
                    <td className="border-b border-[#eee] py-4 text-center px-4 dark:border-strokedark">
                      <div>
                        <p className="font-medium flex justify-center text-black dark:text-white">
                          {e?.status === 'completed' &&
                          e?.sendForInsurance === false &&
                          e?.sendGBMS === true ? (
                            'Sent GBMS'
                          ) : e?.status === 'completed' ? (
                            <>
                              {e?.sendGBMS === false &&
                              e?.sendForInsurance === false ? (
                                <button
                                  onClick={() => sendToGBMS(e.id)}
                                  className="rounded border-2 bg-gray flex items-center justify-center py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                                  title="Send To GBMS"
                                >
                                  <IoIosSend className="text-lg" />
                                  GBMS
                                </button>
                              ) : (
                                ''
                              )}
                            </>
                          ) : null}

                          {e?.status === 'repair approved' ? (
                            <select
                              value={e?.status}
                              onChange={(event) =>
                                handleStatusChange(e.id, event.target.value)
                              }
                              className="ml-2 border rounded px-2 py-1"
                            >
                              <option value="repair approved" disabled>
                                Repair Approved{' '}
                              </option>
                              <option value="inspection done">
                                Done Inspection
                              </option>
                            </select>
                          ) : null}
                          {e?.status === 'pending' ||
                          e?.status === 'approved' ||
                          e?.status === 'rejected' ? (
                            <select
                              value={e?.status}
                              onChange={(event) =>
                                handleStatusChange(e.id, event.target.value)
                              }
                              className="ml-2 border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                            </select>
                          ) : null}

                          {e?.sendForInsurance === true &&
                          e?.sendGBMS === false &&
                          e?.status === 'completed' ? (
                            <>
                              <button
                                onClick={() => sendToGBMS(e.id)}
                                className="rounded border-2 bg-gray flex items-center justify-center py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                                title="Send To GBMS"
                              >
                                <IoIosSend className="text-lg" />
                                GBMS
                              </button>
                            </>
                          ) : e?.sendForInsurance === true &&
                            e?.sendGBMS === true &&
                            e?.status === 'completed' ? (
                            'Sent GBMS'
                          ) : null}
                        </p>
                      </div>
                    </td>
                  }

                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {formatDateTime(e?.created_at)}
                    </p>
                  </td>

                  {Role !== 'insuranceAdmin' ? (
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        {/* {Role === 'companyAdmin' && */}
                        <div>
                          {showButton &&
                            ((e?.status === 'approved' &&
                              Role != 'regionalAdmin') ||
                              e?.status === 'pending') &&
                            e?.sendGBMS === false && (
                              <>
                                <button
                                  onClick={() =>
                                    handleNavigation(e.id, e?.status)
                                  }
                                  className="hover:text-primary"
                                  title="Process"
                                >
                                  <HiOutlineClipboardDocumentList
                                    style={{ fontSize: '20px' }}
                                  />
                                </button>
                              </>
                            )}

                          {((e?.status === 'waiting for completion' &&
                            e?.sendGBMS === false) ||
                            (e?.status === 'completed' &&
                              e?.sendGBMS === false) ||
                            e?.status === 'insurance lodge' ||
                            e?.status === 'surveyor appointed' ||
                            e?.status === 'surveyor completed' ||
                            e?.status === 'repair approved' ||
                            e?.status === 'inspection done' ||
                            e?.status === 'repair completed') &&
                            e?.sendGBMS === false && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/Emergency-Maintenance/process-admin/${e.id}`,
                                  )
                                }
                                className="hover:text-primary"
                                title="View"
                              >
                                <HiOutlineClipboardDocumentList
                                  style={{ fontSize: '20px' }}
                                />
                              </button>
                            )}
                        </div>

                        {
                          <button
                            onClick={() =>
                              handleAdminViewNavigation(e.id, e.status)
                            }
                            className="hover:text-primary"
                            title="View"
                          >
                            <IoEyeOutline style={{ fontSize: '20px' }} />
                          </button>
                        }

                        {(Role != 'supervisor' || Role != 'regionalAdmin') && (
                          <>
                            <button
                              onClick={() => {
                                document
                                  .getElementById('delete_modal')
                                  .showModal();
                                setDeleteId(e?.id);
                              }}
                              title="Delete"
                            >
                              <RiDeleteBinLine style={{ fontSize: '20px' }} />
                            </button>
                            <DeleteModal
                              deleteModule="Vehicle"
                              Id={e?.id}
                              handleDelete={() => deleteVehicle(deleteId)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  ) : (
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark  ">
                      <button
                        onClick={() => handleInsuranceNavigation(e.id)}
                        className="hover:text-primary"
                        title="View"
                      >
                        <HiOutlineClipboardDocumentList
                          style={{ fontSize: '20px' }}
                        />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination">
        <button
          className={`px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 ${currentPage === 1 && 'opacity-50'}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={`px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 ${currentPage === totalPages && 'opacity-50'}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="ms-4 border rounded-md  py-1.5 px-2"
        >
          <option value={10}> 10 </option>
          <option value={20}> 20 </option>
          <option value={30}> 30 </option>
          <option value={100}> 50 </option>
          <option value={100}> 100 </option>
        </select>
      </div>
    </>
  );
};

export default EmergencyTableForAdmin;
