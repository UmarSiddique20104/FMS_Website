import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import useToast from '../../hooks/useToast';

import {
  useGetAllDailyReportsQuery,
  useGetChecklistDataQuery,
  useUpdateDailyRequestMutation,
  useUpdateDailyStatusMutation,
} from '../../services/dailySlice';
import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import DailyMaintenanceRestrictedTable from './DailyMaintenanceRestrictedTable';
import { set } from 'date-fns';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'REJECTED', label: 'REJECTED' },
  { value: 'PENDING', label: 'PENDING' },
];

const DailyMaintenanceTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const station = useMemo(() => location.state?.station, [location.state]);
  const status = useMemo(() => location.state?.status, [location.state]);
  const registrationNo = useMemo(
    () => location.state?.registrationNo,
    [location.state],
  );
  const { showErrorToast, showSuccessToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [toDate, setToDate] = useState('');
  const [dropdown, setDropDown] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [statusFilter, setStatusFilter] = useState(status);
  const [statusFilterInitialState, setStatusFilterInitialState] = useState(
    status ? statusOptions[3] : statusOptions[0],
  );

  const hadleFilter = () => {
    if (!fromDate || !toDate) {
      return showErrorToast('Please provide both From and To dates.');
    }
    if (new Date(fromDate) > new Date(toDate)) {
      return showErrorToast('From date cannot be greater than To date.');
    }
    const totalData = vehicles.filter((item) => item.id > 0);
    const data = totalData.filter((item) => {
      const date = new Date(item.time).toISOString().split('T')[0];
      return date >= fromDate && date <= toDate;
    });

    setVehicles(data);
  };

  const hadleRemoveFilter = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter(null); // Reset status filter
    setStatusFilterInitialState(null); // Reset status filter initial state
    setVehicles(filteredData); // Reset vehicles to the original data
  };

  const {
    data: dailyCLData,
    isLoading,
    error,
  } = useGetChecklistDataQuery({
    registrationNo,
  });
  const {
    data: vehicleData,
    isError: vehicleError,
    isLoading: VehiclesLoading,
    refetch,
  } = useGetVehicleByCompanyIdQuery({
    companyId: user?.companyId,
    page: 1,
    limit: 1000000,
    sortBy,
    sortOrder,
    station: user?.station,
  });

  const {
    data: dailyData,
    isLoading: dailyLoading,
    isError: dailyError,
  } = useGetAllDailyReportsQuery({
    station: station?.value,
  });

  const handleSort = (field) => {};

  const [UpdateDailyStatus] = useUpdateDailyStatusMutation();

  useEffect(() => {
    if (!dailyData?.data || !vehicleData?.data) return;

    let filteredVehicles = dailyData.data
      .filter((dailyItem) =>
        vehicleData.data.some(
          (vehicle) =>
            vehicle.registrationNo === dailyItem.vehicle.registrationNo,
        ),
      )
      .map((item) => ({
        ...item,
        id: item.id,
      }));

    if (statusFilter) {
      filteredVehicles = filteredVehicles.filter(
        (item) => item.id > 0 && item.status === statusFilter?.toUpperCase(),
      );
    }

    setVehicles(filteredVehicles);
    setFilteredData(dailyData.data);
  }, [dailyData, vehicleData, statusFilter]);

  useEffect(() => {
    if (vehicles.length === 0) return;

    const totalSelected = vehicles.filter(
      (e) => e?.completionPercentage > 0,
    ).length;

    setSelectedCount((prev) => {
      if (prev !== totalSelected) {
        refetch();
      }
      return totalSelected;
    });
  }, [vehicles]);

  if (dailyLoading || VehiclesLoading) {
    return <p>Loading vehicles...</p>;
  }

  if (dailyError || vehicleError) {
    return (
      <div>Error occurred while fetching data. Please try again later.</div>
    );
  }

  const handleStatusUpdate = async (id, value) => {
    try {
      let _data = { status: value };
      await UpdateDailyStatus({ id: id, formData: _data }).unwrap();
      refetch();
      showSuccessToast('Daily Status Updated !');
    } catch (err) {
      console.log(err);
      showErrorToast('An error has occurred while Updating Status');
    }
  };

  const handleStatsUpdate = async (id, value) => {
    try {
      let _data = { stats: value };
      await UpdateDailyStatus({ id: id, formData: _data }).unwrap();
      refetch();
      showSuccessToast('Daily Stats Updated !');
    } catch (err) {
      console.log(err);
      showErrorToast('An error has occurred while Updating Status');
    }
  };

  let adminRole =
    user?.Role?.roleName === 'Maintenance Admin' ||
    user?.Role?.roleName === 'companyAdmin' ||
    user?.Role?.roleName === 'Maintenance Service Manager';
  let restrictedRole = user.Role.roleName === 'Maintenance MTO';

  const totalVehicles = vehicles.filter((item) => item.id > 0);
  const totalPages = Math.ceil(totalVehicles.length / limit);
  const currentVehicles = totalVehicles.slice((page - 1) * limit, page * limit);

  return (
    <>
      <div className="mb-5.5 flex flex-col gap-5.5">
        <div className="w-full">
          <label className="mb-3 block text-lg font-bold text-black dark:text-white">
            NON MAINTAINED VEHICLES:
          </label>
        </div>

        <div className="flex gap-4 justify-end items-end">
          <button
            onClick={() => {
              navigate('/daily-maintenance/dashboard');
            }}
            type="button"
            className="bg-primary text-white px-7 py-3 rounded-lg cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
      {adminRole && (
        <>
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row justify-start items-center pe-2">
            <div className="flex gap-5">
              <div className="flex flex-col">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate} // Bind value to state
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex flex-col">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate} // Bind value to state
                  onChange={(e) => setToDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              <div className="flex flex-col justify-end mb-0.5 me-2 min-w-[150px]">
                <Select
                  options={statusOptions}
                  value={statusFilterInitialState}
                  onChange={(e) => {
                    setStatusFilter(e.value);
                    setStatusFilterInitialState(e);
                    setPage(1); // Reset page to 1
                  }}
                  isClearable={false}
                />
              </div>
            </div>
            <div className="flex gap-5">
              <button
                onClick={hadleFilter}
                type="button"
                className="bg-primary text-white px-7 py-3 rounded-lg cursor-pointer"
              >
                Filter
              </button>
              <button
                onClick={hadleRemoveFilter}
                type="button"
                className="bg-red-400 text-white px-7 py-3 rounded-lg cursor-pointer"
              >
                Remove Filter
              </button>
            </div>
          </div>
        </>
      )}

      <div className="h-[570px] rounded-sm border border-stroke bg-white mb-2 px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto h-[530px] overflow-y-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border-b py-2 text-left">
                  <span className="flex items-center">ID </span>
                </th>
                <th className="border-b py-2 text-left">
                  Vehicle Registration No
                </th>
                <th className="border-b py-2 text-left">
                  Percentage Inspected
                </th>
                <th className="border-b py-2 ps-4 text-left">Creation time</th>
                <th className="border-b py-2 text-left">Faults</th>
                <th className="border-b py-2 text-left">Status</th>
                {adminRole && (
                  <th className="border-b py-2 text-left">Update Status</th>
                )}
                <th className="border-b py-2 text-left">Stats</th>
                <th className="border-b py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* 2024-06-06  2024-05-20*/}
              {currentVehicles?.map((e, i) => (
                <tr
                  key={i}
                  className={` hover:font-semibold ${e.totalFaults > 0 ? 'bg-red-100' : 'bg-green-100'}`}
                >
                  <td className="border-b py-2">{e.id}</td>
                  <td className="border-b py-2">{e.vehicle.registrationNo}</td>
                  <td className="border-b py-2">
                    {e.completionPercentage?.toFixed(2)}%
                  </td>
                  <td
                    className={`border-b text-center py-2  text-black font-medium`}
                  >
                    {e.time.split('T')[0]} {e.time.split('T')[1].split('.')[0]}
                  </td>

                  <td
                    className={`border-b text-center py-2 ${e.totalFaults > 0 ? 'text-red-500 font-bold' : 'text-black font-medium'}`}
                  >
                    {e.totalFaults}
                  </td>
                  <td className="border-b py-2">{e?.status}</td>

                  {adminRole && (
                    <td className="border-b py-2">
                      <div className="flex items-center justify-center space-x-3.5 relative">
                        <div
                          className="dropdown dropdown-bottom"
                          onClick={() => setDropDown(i === dropdown ? null : i)}
                        >
                          <div className="m-1 btn h-[30px] min-h-[30px] text-sm   text-black bg-white transition duration-150 ease-in-out rounded-md">
                            <HiOutlineDotsHorizontal />
                          </div>
                        </div>
                        {dropdown === i ? (
                          <div>
                            <ul className="p-2 absolute left-3 top-10  shadow menu dropdown-content z-[1]   rounded-box w-24 text-black bg-white">
                              <li
                                onClick={() => {
                                  setDropDown(null);
                                  handleStatusUpdate(e?.id, 'APPROVED');
                                }}
                              >
                                <a>Approve</a>
                              </li>
                              <li
                                onClick={() => {
                                  setDropDown(null);
                                  handleStatusUpdate(e?.id, 'REJECTED');
                                }}
                              >
                                <a>Reject</a>
                              </li>
                              <li
                                onClick={() => {
                                  setDropDown(null);
                                  handleStatusUpdate(e?.id, 'PENDING');
                                }}
                              >
                                <a>Pending</a>
                              </li>
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  )}
                  <td className="border-b py-2">
                    {e?.totalFaults > 0 ? 'NOT-MAINTAINED' : 'MAINTAINED'}
                  </td>

                  <td className="border-b py-2">
                    {e.completionPercentage > 0 && (
                      <button
                        className="rounded border-2 bg-green-400   py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/daily-maintenance/view', {
                            state: {
                              registrationNo: e.vehicle.registrationNo,
                              id: e.id,
                            },
                          });
                        }}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pagination">
        <div>
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset page to 1 when limit changes
            }}
            className="px-3 py-1 border rounded-md bg-gray-200 dark:bg-gray-800"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </>
  );
};

DailyMaintenanceTable.Layout = DefaultLayout;

export default DailyMaintenanceTable;

// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import DefaultLayout from '../../layout/DefaultLayout';
// import { useSelector } from 'react-redux';
// import Select from 'react-select';
// import useToast from '../../hooks/useToast';
// import PaginationComponent from '../../components/Pagination/Pagination';
// import {
//   useGetAllDailyReportsQuery,
//   useGetChecklistDataQuery,
//   useUpdateDailyRequestMutation,
//   useUpdateDailyStatusMutation,
// } from '../../services/dailySlice';
// import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
// import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
// import { HiOutlineDotsHorizontal } from 'react-icons/hi';
// import DailyMaintenanceRestrictedTable from './DailyMaintenanceRestrictedTable';
// const statusOptions = [
//   { value: '', label: 'All' },
//   { value: 'APPROVED', label: 'APPROVED' },
//   { value: 'REJECTED', label: 'REJECTED' },
//   { value: 'PENDING', label: 'PENDING' },
// ];

// const DailyMaintenanceTable = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const station = useMemo(() => location.state?.station, [location.state]);
//   const status = useMemo(() => location.state?.status, [location.state]);
//   const registrationNo = useMemo(
//     () => location.state?.registrationNo,
//     [location.state],
//   );
//   const { showErrorToast, showSuccessToast } = useToast();

//   const { user } = useSelector((state) => state.auth);

//   const [limit, setLimit] = useState(1000);
//   const [sortBy, setSortBy] = useState(null);
//   const [sortOrder, setSortOrder] = useState(null);
//   const [vehicles, setVehicles] = useState([]);
//   const [selectedCount, setSelectedCount] = useState(0);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const [toDate, setToDate] = useState('');
//   const [dropdown, setDropDown] = useState(null);
//   const [fromDate, setFromDate] = useState('');
//   const [statusFilter, setStatusFilter] = useState(status);
//   const [apiData , setApiData] = useState([]);
//   const [statusFilterInitialState, setStatusFilterInitialState] = useState(
//     status ? statusOptions[3] : statusOptions[0],
//   );

//   const hadleFilter = () => {
//     if (!fromDate || !toDate) {
//       return showErrorToast('Please provide both From and To dates.');
//     }
//     if (new Date(fromDate) > new Date(toDate)) {
//       return showErrorToast('From date cannot be greater than To date.');
//     }
//     const totalData = vehicles.filter((item) => item.id > 0);
//     const data = totalData.filter((item) => {
//       const date = new Date(item.time).toISOString().split('T')[0];
//       return date >= fromDate && date <= toDate;
//     });

//     setVehicles(data);
//     setApiData(data);
//   };

//   const hadleRemoveFilter = () => {
//     setFromDate('');
//     setToDate('')
//     setVehicles(filteredData);
//     setApiData(filteredData)
//   };

//   const {
//     data: dailyCLData,
//     isLoading,
//     error,
//   } = useGetChecklistDataQuery({
//     registrationNo,
//   });
//   const {
//     data: vehicleData,
//     isError: vehicleError,
//     isLoading: VehiclesLoading,
//     refetch,
//   } = useGetVehicleByCompanyIdQuery({
//     companyId: user?.companyId,
//     page:1,
//     limit:100000000,
//     sortBy,
//     sortOrder,
//     station: user?.station,
//   });

//   const {
//     data: dailyData,
//     isLoading: dailyLoading,
//     isError: dailyError,
//   } = useGetAllDailyReportsQuery({
//     station: station?.value,
//   });
//   useEffect(() => {

//     refetch();
//   }, [sortBy, sortOrder]);

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(field);
//       setSortOrder('asc');
//     }
//   };
//   const [UpdateDailyStatus] = useUpdateDailyStatusMutation();

//   useEffect(() => {
//     if (!dailyData?.data || !vehicleData?.data) return;

//     let filteredVehicles = dailyData.data
//       .filter((dailyItem) =>
//         vehicleData.data.some(
//           (vehicle) =>
//             vehicle.registrationNo === dailyItem.vehicle.registrationNo,
//         ),
//       )
//       .map((item) => ({
//         ...item,
//         id: item.id,
//       }));
//     if (statusFilter) {
//       filteredVehicles = filteredVehicles.filter(
//         (item) => item.id > 0 && item.status === statusFilter?.toUpperCase(),
//       );
//     }

//     setVehicles(filteredVehicles);
//     setApiData(filteredVehicles);
//     setFilteredData(dailyData.data);
//   }, [dailyData, vehicleData, statusFilter]);

//   useEffect(() => {
//     if (vehicles.length === 0){
//       setApiData([])
//       return;
//     }

//     // Calculate total selected vehicles
//     const totalSelected = vehicles.filter(
//       (e) => e?.completionPercentage > 0,
//     ).length;

//     setSelectedCount((prev) => {
//       if (prev !== totalSelected) {
//         refetch();
//       }
//       return totalSelected;
//     });
//   }, [vehicles]);

//   if (dailyLoading || VehiclesLoading) {
//     return <p>Loading vehicles...</p>;
//   }

//   if (dailyError || vehicleError) {
//     return (
//       <div>Error occurred while fetching data. Please try again later.</div>
//     );
//   }

//   const handleStatusUpdate = async (id, value) => {
//     try {
//       let _data = { status: value };
//       await UpdateDailyStatus({ id: id, formData: _data }).unwrap();
//       refetch();
//       showSuccessToast('Daily Status Updated !');
//     } catch (err) {
//       console.log(err);
//       showErrorToast('An error has occurred while Updating Status');
//     }
//   };
//   const handleStatsUpdate = async (id, value) => {
//     try {
//       let _data = { stats: value };
//       await UpdateDailyStatus({ id: id, formData: _data }).unwrap();
//       refetch();
//       showSuccessToast('Daily Stats Updated !');
//     } catch (err) {
//       console.log(err);
//       showErrorToast('An error has occurred while Updating Status');
//     }
//   };
//   let adminRole =
//     user?.Role?.roleName === 'Maintenance Admin' ||
//     user?.Role?.roleName === 'companyAdmin' ||
//     user?.Role?.roleName === 'Maintenance Service Manager';
//   let restrictedRole = user.Role.roleName === 'Maintenance MTO';

//   return (
//     <>
//       <div className="mb-5.5 flex flex-col gap-5.5  ">
//         <div className="w-full">
//           <label className="mb-3 block text-lg  font-bold text-black dark:text-white">
//             NON MAINTAINED VEHICLES:
//           </label>
//         </div>

//         <div className="flex gap-4   justify-end items-end">
//           <button
//             onClick={() => {
//               navigate('/daily-maintenance/dashboard');
//             }}
//             type="button"
//             className="bg-primary text-white px-7 py-3 rounded-lg cursor-pointer"
//           >
//             Dashboard
//           </button>
//         </div>
//       </div>
//       {adminRole && (
//         <>
//           <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row justify-start items-center pe-2">
//             <div className="flex gap-5">
//               <div className="flex flex-col">
//                 <label>From Date</label>
//                 <input
//                   type="date"
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="border rounded p-2"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label>To Date</label>

//                 <input
//                   type="date"
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="border rounded p-2"
//                 />
//               </div>
//               <div className="flex flex-col justify-end mb-0.5 me-2 min-w-[150px]">
//                 <Select
//                   options={statusOptions}
//                   value={statusFilterInitialState}
//                   onChange={(selectedOption) => {
//                     setStatusFilter(selectedOption.value || null);
//                     setStatusFilterInitialState(selectedOption);
//                   }}
//                   className="ml-2 border rounded w-full"
//                   placeholder="Status"
//                 />
//               </div>
//               <div>
//                 <div className="flex gap-4 mt-5">
//                   <button
//                     onClick={hadleFilter}
//                     type="button"
//                     className="bg-primary text-white px-7 py-3 rounded-lg cursor-pointer"
//                   >
//                     Filter
//                   </button>
//                   <button
//                     onClick={hadleRemoveFilter}
//                     type="button"
//                     className="bg-slate-400 text-white p-3 rounded-lg cursor-pointer"
//                   >
//                     Remove Filter
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div></div>
//           </div>

//           <div className="h-[570px] rounded-sm border border-stroke bg-white mb-2 px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
//             <div className="max-w-full overflow-x-auto h-[530px] overflow-y-auto">
//               <table className="w-full table-auto">
//                 <thead>
//                   <tr>
//                     <th
//                       className="border-b py-2 text-left"
//                       onClick={() => handleSort('id')}
//                     >
//                       <span className="flex items-center">
//                         ID{' '}
//                         <span className="ml-1">
//                           {sortBy === 'id' ? (
//                             sortOrder === 'asc' ? (
//                               <FaSortUp />
//                             ) : (
//                               <FaSortDown />
//                             )
//                           ) : (
//                             <FaSort />
//                           )}
//                         </span>
//                       </span>
//                     </th>
//                     <th className="border-b py-2 text-left">
//                       Vehicle Registration No
//                     </th>
//                     <th className="border-b py-2 text-left">
//                       Percentage Inspected
//                     </th>
//                     <th className="border-b py-2 ps-4 text-left">
//                       Creation time
//                     </th>
//                     <th className="border-b py-2 text-left">Faults</th>
//                     <th className="border-b py-2 text-left">Status</th>
//                     {adminRole && (
//                       <th className="border-b py-2 text-left">Update Status</th>
//                     )}
//                     <th className="border-b py-2 text-left">Stats</th>
//                     <th className="border-b py-2 text-left">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {/* 2024-06-06  2024-05-20*/}
//                   {vehicles
//                     .filter((item) => item.id > 0)
//                     .map((e, i) => (
//                       <tr
//                         key={i}
//                         className={` hover:font-semibold ${e.totalFaults > 0 ? 'bg-red-100' : 'bg-green-100'}`}

//                       >
//                         <td className="border-b py-2">{e.id}</td>
//                         <td className="border-b py-2">
//                           {e.vehicle.registrationNo}
//                         </td>
//                         <td className="border-b py-2">
//                           {e.completionPercentage?.toFixed(2)}%
//                         </td>
//                         <td
//                           className={`border-b text-center py-2  text-black font-medium`}
//                         >
//                           {e.time.split('T')[0]}{' '}
//                           {e.time.split('T')[1].split('.')[0]}
//                         </td>

//                         <td
//                           className={`border-b text-center py-2 ${e.totalFaults > 0 ? 'text-red-500 font-bold' : 'text-black font-medium'}`}
//                         >
//                           {e.totalFaults}
//                         </td>
//                         <td className="border-b py-2">{e?.status}</td>

//                         {adminRole && (
//                           <td className="border-b py-2">
//                             <div className="flex items-center justify-center space-x-3.5 relative">
//                               <div
//                                 className="dropdown dropdown-bottom"
//                                 onClick={() =>
//                                   setDropDown(i === dropdown ? null : i)
//                                 }
//                               >
//                                 <div className="m-1 btn h-[30px] min-h-[30px] text-sm   text-black bg-white transition duration-150 ease-in-out rounded-md">
//                                   <HiOutlineDotsHorizontal />
//                                 </div>
//                               </div>
//                               {dropdown === i ? (
//                                 <div>
//                                   <ul className="p-2 absolute left-3 top-10  shadow menu dropdown-content z-[1]   rounded-box w-24 text-black bg-white">
//                                     <li
//                                       onClick={() => {
//                                         setDropDown(null);
//                                         handleStatusUpdate(e?.id, 'APPROVED');
//                                       }}
//                                     >
//                                       <a>Approve</a>
//                                     </li>
//                                     <li
//                                       onClick={() => {
//                                         setDropDown(null);
//                                         handleStatusUpdate(e?.id, 'REJECTED');
//                                       }}
//                                     >
//                                       <a>Reject</a>
//                                     </li>
//                                     <li
//                                       onClick={() => {
//                                         setDropDown(null);
//                                         handleStatusUpdate(e?.id, 'PENDING');
//                                       }}
//                                     >
//                                       <a>Pending</a>
//                                     </li>
//                                   </ul>
//                                 </div>
//                               ) : null}
//                             </div>
//                           </td>
//                         )}
//                         <td className="border-b py-2">
//                           {e?.totalFaults > 0 ? 'NOT-MAINTAINED' : 'MAINTAINED'}
//                         </td>

//                         <td className="border-b py-2">
//                           {e.completionPercentage > 0 && (
//                             <button
//                               className="rounded border-2 bg-green-400   py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
//                               onClick={(event) => {
//                                 event.stopPropagation();
//                                 navigate('/daily-maintenance/view', {
//                                   state: {
//                                     registrationNo: e.vehicle.registrationNo,
//                                     id: e.id,
//                                   },
//                                 });
//                               }}
//                             >
//                               View
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}

//       {restrictedRole && <DailyMaintenanceRestrictedTable />}

//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded shadow-lg p-8 w-96">
//             <p>{modalMessage}</p>
//             <div className="mt-4 flex justify-end">
//               <button
//                 className="px-4 py-2 bg-blue-500 text-white rounded"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* <PaginationComponent
//         isLoading={VehiclesLoading}
//         isError={vehicleError}
//         data={apiData}
//         page={page}
//         setPage={setPage}
//         limit={limit}
//         setLimit={setLimit}
//       /> */}

// <div className="pagination">
//         <button
//           // className={`px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 ${currentPage === 1 && 'opacity-50'}`}
//           // onClick={() => handlePageChange(currentPage - 1)}
//           // disabled={currentPage === 1}
//         >
//           Previous
//         </button>
//         <span>
//           {/* Page {currentPage} of {totalPages} */}
//         </span>
//         <button
//           // className={`px-3 py-1 mx-1 border rounded-md bg-gray-200 dark:bg-gray-800 ${currentPage === totalPages && 'opacity-50'}`}
//           // onClick={() => handlePageChange(currentPage + 1)}
//           // disabled={currentPage === totalPages}
//         >
//           Next
//         </button>
//         <select
//           // value={itemsPerPage}
//           // onChange={(e) => setItemsPerPage(e.target.value)}
//           className="ms-4 border rounded-md  py-1.5 px-2"
//         >
//             <option value={10}> 10 </option>
//             <option value={20}> 20 </option>
//             <option value={30}> 30 </option>
//             <option value={100}> 50 </option>
//             <option value={100}> 100 </option>

//         </select>
//       </div>
//     </>
//   );
// };

// export default DailyMaintenanceTable;
