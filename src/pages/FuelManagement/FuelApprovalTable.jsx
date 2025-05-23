import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { respondFuelRequestSchema } from '../../utils/schemas';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import {
  useGetFuelByCompanyIdQuery,
  useUpdateFuelRequestMutation,
  useDeleteFuelRequestMutation,
} from '../../services/fuelSlice';
import DeleteModal from '../../components/DeleteModal';
import Loader from '../../common/Loader';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import useToast from '../../hooks/useToast';
import PaginationComponent from '../../components/Pagination/Pagination';
import { RiDeleteBinLine } from 'react-icons/ri';
import { CiEdit } from 'react-icons/ci';
import { IoEyeOutline } from 'react-icons/io5';
import { stationOptions } from '../../constants/Data';

const FuelApprovalTable = ({
  searchTerm,
  setSortedDataIndex,
  statusFilter,
}) => {
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'APPROVED', label: 'APPROVED' },
    { value: 'REJECTED', label: 'REJECTED' },
    { value: 'PENDING', label: 'PENDING' },
    { value: 'COMPLETED', label: 'COMPLETED' },
  ];

  const fuelTypeOptions = [
    { value: '', label: 'All' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'cng', label: 'CNG' },
  ];
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [makeFilter, setMakeFilter] = useState(null); // New make filter state
  const [requestTypeFilter, setRequestTypeFilter] = useState(null); // New requestType filter state
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [formValues, setFormValues] = useState({ ...respondFuelRequestSchema });
  const { user } = useSelector((state) => state?.auth);
  const [DeleteFuel] = useDeleteFuelRequestMutation();
  const [deleteId, setDeleteId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const tableRef = useRef();
  const location = useLocation();
  const [statusFilterState, setStatusFilterState] = useState(null);

  const [statusFilterInitialState, setStatusFilterInitialState] = useState(
    statusOptions[0],
  );

  const [fuelTypeFilter, setFuelTypeFilter] = useState(null);
  const [stationFilter, setStationFilter] = useState(null);
  const [requestIDFilter, setRequestIDFilter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const {
    data: fuelData,
    isError,
    isLoading: isFuelLoading,
    refetch,
  } = useGetFuelByCompanyIdQuery({
    companyId: user?.companyId,
    searchTerm,
    statusFilter: statusFilterState,
    fuelTypeFilter,
    stationFilter,
    makeFilter,
    requestTypeFilter,
    station: user?.station,
  });

  useEffect(() => {
    refetch();
  }, [
    searchTerm,
    sortBy,
    sortOrder,
    statusFilterState,
    fuelTypeFilter,
    stationFilter,
    requestIDFilter,
    makeFilter,
    requestTypeFilter,
    startDate,
    endDate,
  ]);

  let [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    console.log(fuelData?.data);
    if (fuelData?.data) {
      let d = fuelData?.data.slice();

      // Apply date filters on the entire data
      if (startDate || endDate) {
        d = d.filter((item) => {
          const itemDate = new Date(item.created_at);
          const selectedStartDate = startDate
            ? new Date(startDate).setHours(0, 0, 0, 0)
            : null;
          const selectedEndDate = endDate
            ? new Date(endDate).setHours(23, 59, 59, 999)
            : null;

          if (selectedStartDate && selectedEndDate) {
            return itemDate >= selectedStartDate && itemDate <= selectedEndDate;
          } else if (selectedStartDate) {
            return itemDate >= selectedStartDate;
          } else if (selectedEndDate) {
            return itemDate <= selectedEndDate;
          }
          return false;
        });
      }

      // Apply other filters (status, fuelType, etc.)
      if (statusFilterState) {
        d = d.filter(
          (item) =>
            item.status &&
            item.status.toLowerCase() === statusFilterState.toLowerCase(),
        );
      }

      if (fuelTypeFilter) {
        d = d.filter(
          (item) =>
            item.fuelType &&
            item.fuelType.toLowerCase() === fuelTypeFilter.toLowerCase(),
        );
      }

      if (stationFilter) {
        d = d.filter(
          (item) =>
            item.station &&
            item.station.toLowerCase() === stationFilter.toLowerCase(),
        );
      }

      if (makeFilter) {
        d = d.filter(
          (item) =>
            item.make && item.make.toLowerCase() === makeFilter.toLowerCase(),
        );
      }

      if (requestTypeFilter) {
        d = d.filter(
          (item) =>
            item.requestType &&
            item.requestType.toLowerCase() === requestTypeFilter.toLowerCase(),
        );
      }

      if (requestIDFilter) {
        d = d.filter((item) => item.id === parseInt(requestIDFilter));
      }

      console.log('Filtered Data:', d);

      // Apply sorting
      d = d.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy] < b[sortBy] ? -1 : 1;
        } else {
          return a[sortBy] > b[sortBy] ? -1 : 1;
        }
      });

      // Apply pagination after filtering and sorting
      const paginatedData = d.slice((page - 1) * limit, page * limit);

      setSortedData(d);
      setSortedDataIndex(d);
    }
  }, [
    fuelData,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    statusFilterState,
    fuelTypeFilter,
    stationFilter,
    requestIDFilter,
    makeFilter,
    requestTypeFilter,
    page,
    limit,
  ]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const [updateFuelRequest, { isLoading: updateLoading }] =
    useUpdateFuelRequestMutation();

  const handleStatusUpdate = async (id, value) => {
    try {
      let _data = { status: value };
      await updateFuelRequest({ id: id, formData: _data }).unwrap();
      refetch();
      showSuccessToast('Fuel Status Updated !');
    } catch (err) {
      console.log(err);
      showErrorToast('An error has occurred while Updating Status');
    }
  };

  const handleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentData.map((item) => item.id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      await Promise.all(
        selectedRows.map((id) =>
          updateFuelRequest({ id: id, formData: { status } }).unwrap(),
        ),
      );
      refetch();
      showSuccessToast(`Selected Fuels have been ${status}!`);
      setSelectedRows([]);
    } catch (err) {
      console.log(err);
      showErrorToast('An error has occurred while updating statuses');
    }
  };

  let adminRole =
    user?.Role?.roleName === 'fuelManager' ||
    user?.Role?.roleName === 'companyAdmin';
  let regionalRole = user?.Role?.roleName === 'regionalAdmin';
  let statusRole =
    user?.Role?.roleName === 'companyAdmin' ||
    user?.Role?.roleName === 'Maintenance Admin';

  // Create make options from the fetched fuel data, including "All"
  const makeOptions = [
    { value: '', label: 'All' },
    ...Array.from(new Set(fuelData?.data.map((item) => item.make)))
      .filter((make) => make)
      .map((make) => ({ value: make, label: make })),
  ];

  // Create requestType options from the fetched fuel data, including "All"
  const requestTypeOptions = [
    { value: '', label: 'All' },
    ...Array.from(new Set(fuelData?.data.map((item) => item.requestType)))
      .filter((requestType) => requestType)
      .map((requestType) => ({ value: requestType, label: requestType })),
  ];

  useEffect(() => {
    const status = location?.state?.status;
    if (status) {
      setStatusFilterState(status);
      setStatusFilterInitialState(statusOptions[3]);
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentData, setCurrentData] = useState([]);

  const totalPages = Math.ceil(sortedData?.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentData(sortedData?.slice(startIndex, endIndex));
  }, [currentPage, sortedData, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  return (
    <>
      <div className="ml-7 mb-4 mt-4">
        <div className="flex flex-wrap space-x-4">
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
            <input
              type="text"
              className="p-2 border rounded w-full bg-white"
              placeholder="Enter Request ID"
              value={requestIDFilter || ''}
              onChange={(e) => setRequestIDFilter(e.target.value || null)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Select
              options={statusOptions}
              value={statusFilterInitialState}
              onChange={(selectedOption) => {
                console.log(selectedOption);
                setStatusFilterState(selectedOption.value || null);
                setStatusFilterInitialState(selectedOption);
              }}
              className="ml-1 border rounded w-full"
              placeholder="Status"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Select
              options={fuelTypeOptions}
              onChange={(selectedOption) =>
                setFuelTypeFilter(selectedOption.value || null)
              }
              className="ml-1 border rounded"
              placeholder="Fuel Type"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Select
              options={makeOptions}
              onChange={(selectedOption) =>
                setMakeFilter(selectedOption.value || null)
              }
              className="ml-1 border rounded"
              placeholder="Make"
            />
          </div>
        </div>

        <div className="flex gap-5">
          <div className="pt-5 relative text-gray-600 w-90">
            <Select
              options={requestTypeOptions}
              onChange={(selectedOption) =>
                setRequestTypeFilter(selectedOption.value || null)
              }
              className="ml-1 border rounded"
              placeholder="Request Type"
            />
          </div>

          {statusRole && (
            <div className="pt-5 relative text-gray-600 w-90">
              <Select
                options={stationOptions}
                onChange={(selectedOption) =>
                  setStationFilter(selectedOption.value || null)
                }
                className="ml-1 border rounded"
                placeholder="Station"
              />
            </div>
          )}
        </div>

        {adminRole && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => handleBulkStatusUpdate('approved')}
              className="bg-green-500 text-white px-3 py-1 rounded-md"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('rejected')}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Reject Selected
            </button>
          </div>
        )}
      </div>
      {isFuelLoading ? (
        <Loader />
      ) : isError ? (
        <div>Error occurred while fetching Fuels.</div>
      ) : (
        <>
          {!currentData || !currentData.length ? (
            <div>No Fuels Found!</div>
          ) : (
            <div className="h-[570px] rounded-sm border border-stroke bg-white mb-2 px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <div className="max-w-full overflow-x-auto h-[530px] overflow-y-auto">
                <table ref={tableRef} className="w-full table-auto ">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      {adminRole && (
                        <th className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.length === currentData.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th
                        className="flex-1 py-4 px-4 text-black dark:text-white cursor-pointer abc"
                        onClick={() => handleSort('id')}
                        style={{ minWidth: '140px' }}
                      >
                        <span className="flex items-center">
                          Request ID{' '}
                          <span className="ml-1">
                            {sortBy === 'id' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('registrationNo')}
                      >
                        <span className="flex items-center">
                          Vehicle No.{' '}
                          <span className="ml-1">
                            {sortBy === 'registrationNo' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('driverName')}
                      >
                        <span className="flex items-center">
                          Driver{' '}
                          <span className="ml-1">
                            {sortBy === 'driverName' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('requestType')}
                      >
                        <span className="flex items-center">
                          Request Type{' '}
                          <span className="ml-1">
                            {sortBy === 'requestType' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('rateOfFuel')}
                      >
                        <span className="flex items-center">
                          Rate{' '}
                          <span className="ml-1">
                            {sortBy === 'rateOfFuel' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('quantityOfFuel')}
                      >
                        <span className="flex items-center">
                          Litres{' '}
                          <span className="ml-1">
                            {sortBy === 'quantityOfFuel' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        <span className="flex items-center">
                          Amount{' '}
                          <span className="ml-1">
                            {sortBy === 'amount' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('fuelType')}
                      >
                        <span className="flex items-center">
                          Fuel Type{' '}
                          <span className="ml-1">
                            {sortBy === 'fuelType' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('station')}
                      >
                        <span className="flex items-center">
                          Station{' '}
                          <span className="ml-1">
                            {sortBy === 'station' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('make')}
                      >
                        <span className="flex items-center">
                          Make{' '}
                          <span className="ml-1">
                            {sortBy === 'make' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        <span className="flex items-center">
                          Date{' '}
                          <span className="ml-1">
                            {sortBy === 'created_at' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      <th
                        className="w-auto flex-1 text-center py-4 px-3 text-black dark:text-white cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <span className="flex items-center">
                          Status{' '}
                          <span className="ml-1">
                            {sortBy === 'status' ? (
                              sortOrder === 'asc' ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </span>
                        </span>
                      </th>
                      {adminRole && (
                        <th className="w-auto flex-1 text-center py-4 px-3 text-black dark:text-white">
                          Update Status
                        </th>
                      )}
                      <th className="w-auto flex items-center justify-center py-4 px-3 text-black dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData?.map((e, key) => (
                      <tr className="py-3" key={key}>
                        {adminRole && (
                          <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(e.id)}
                              onChange={() => handleRowSelection(e.id)}
                            />
                          </td>
                        )}
                        <td className="border-b border-[#eee] py-4 px-10 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.id}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.registrationNo}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.driverName}
                          </p>
                        </td>

                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.requestType}
                          </p>
                        </td>

                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark ">
                          <p className="font-medium text-black dark:text-white">
                            {e?.rateOfFuel}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.quantityOfFuel}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {(e?.rateOfFuel * e?.quantityOfFuel).toFixed(2)}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-2 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.fuelType}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.station}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white">
                            {e?.make}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark  w-180  ">
                          <p className="font-medium text-black dark:text-white">
                            {e?.created_at?.slice(0, 10)}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                          <p className="font-medium text-black dark:text-white uppercase">
                            {e?.status}
                          </p>
                        </td>

                        {adminRole && (
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <div className="flex items-center justify-center space-x-3.5">
                              <details className="dropdown dropdown-bottom ">
                                <summary className="m-1 btn h-[30px] min-h-[30px] text-sm dark:text-white dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md">
                                  <HiOutlineDotsHorizontal />
                                </summary>
                                <ul className="p-2  shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-24 text-black bg-white text-black">
                                  <li
                                    onClick={() =>
                                      handleStatusUpdate(e?.id, 'approved')
                                    }
                                  >
                                    <a>Approve</a>
                                  </li>
                                  <li
                                    onClick={() =>
                                      handleStatusUpdate(e?.id, 'rejected')
                                    }
                                  >
                                    <a>Reject</a>
                                  </li>
                                  <li
                                    onClick={() =>
                                      handleStatusUpdate(e?.id, 'pending')
                                    }
                                  >
                                    <a>Pending</a>
                                  </li>
                                </ul>
                              </details>
                            </div>
                          </td>
                        )}

                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="flex items-center justify-center space-x-3.5">
                            <button
                              onClick={() => navigate(`view/${e?.id}`)}
                              className="hover:text-primary"
                            >
                              <IoEyeOutline style={{ fontSize: '20px' }} />
                            </button>
                            {e?.status !== 'completed' && (
                              <button
                                onClick={() =>
                                  navigate(`update-fuel-request/${e?.id}`)
                                }
                                className="hover:text-primary"
                              >
                                <CiEdit style={{ fontSize: '20px' }} />
                              </button>
                            )}
                            {adminRole && (
                              <button
                                onClick={() => {
                                  setDeleteId(e?.id);
                                  document
                                    .getElementById('delete_modal')
                                    .showModal();
                                }}
                                className="hover:text-primary"
                              >
                                <RiDeleteBinLine style={{ fontSize: '20px' }} />
                              </button>
                            )}
                            <DeleteModal
                              deleteModule="Fuel"
                              handleDelete={() => DeleteFuel(deleteId)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {/* <PaginationComponent
        isLoading={isFuelLoading}
        isError={isError}
        data={fuelData}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
      /> */}
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
          className="ms-4 border rounded-md py-1.5 px-2"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </>
  );
};

export default FuelApprovalTable;
