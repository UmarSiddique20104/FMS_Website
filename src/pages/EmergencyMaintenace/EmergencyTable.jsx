import { CiEdit } from 'react-icons/ci';
import { IoEyeOutline } from 'react-icons/io5';
import { RiDeleteBinLine } from 'react-icons/ri';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import useToast from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteModal from '../../components/DeleteModal';
import {
  useGetEmergencyrequestQuery,
  useDeleteEmergencyRequestMutation,
  useUpdateEmergencyRequestMutation,
} from '../../services/emergencySlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
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

const EmergencyTable = ({ Role }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showButton, setShowButton] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const { data } = useGetEmergencyrequestQuery({
    page,
    limit,
    // searchTerm,
    // sortBy,
    // sortOrder,
    station: user?.station,
  });
 
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
    setStatus(newStatus);
  };

  const handleApprovedNavigation = (id, status) => {
    navigate(`/Emergency-Maintenance/view-regionalAdmin/${id}`);
  };

  useEffect(() => {
    setFilteredData(data?.data);
  }, [data]);

  const [filteredData, setFilteredData] = useState([]);
  const [statusFilterState, setStatusFilterState] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
    console.log(data?.data);

    console.log(startDate, endDate);

    // Convert startDate and endDate to Date objects without time
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0); // Set time to the start of the day
    end.setHours(23, 59, 59, 999); // Set time to the end of the day

    // Filter the data based on the date range
    const filtered = data?.data?.filter((item) => {
      console.log(item);
      const itemDate = new Date(item.created_at); // Adjust if your date is in a different format or property
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  };
  const ClearFilters = () => {
    setFilteredData(data?.data);
    setStartDate(null);
    setEndDate(null);
    setStatusFilterState('all');
  };
  return (
    <>
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
                <th className="w-auto flex-1 py-4 px-3 text-black dark:text-white">
                  Update Status
                </th>
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

                  {e?.status === 'repair approved' ? (
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <p className="font-medium text-black dark:text-white">
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
                      </p>
                    </td>
                  ) : (
                    <td className=" flex justify-center items-center border-b border-[#eee] py-4.5 px-4 dark:border-strokedark">
                      <p className="font-medium text-black dark:text-white">
                        ---
                      </p>
                    </td>
                  )}

                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <p className="font-medium text-black dark:text-white">
                      {formatDateTime(e?.created_at)}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {/* {Role === 'companyAdmin' && */}
                      <div>
                        {showButton &&
                          (e?.status === 'pending' ||
                            e?.status === 'approved' ||
                            e?.status === 'inspection done' ||
                            e?.status === 'waiting for completion') &&
                          e?.sendGBMS === false && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(`process-regionalAdmin/${e.id}`)
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
                      </div>

                      <button
                        onClick={() =>
                          handleApprovedNavigation(e.id, e?.status)
                        }
                        className="hover:text-primary"
                        title="View"
                      >
                        <IoEyeOutline style={{ fontSize: '20px' }} />
                      </button>
                      {e?.status == 'pending' && (
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

export default EmergencyTable;
