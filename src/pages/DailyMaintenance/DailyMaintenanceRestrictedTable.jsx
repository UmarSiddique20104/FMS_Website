import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import useToast from '../../hooks/useToast';
import { useGetDailyReportsQuery } from '../../services/dailySlice';
import {
  useGetVehicleByCompanyIdQuery,
  useGetVehicleInfoQuery,
} from '../../services/vehicleSlice'; // Import the vehicleSlice query
import { useGetAllMaintenanceTeamsQuery } from '../../services/maintenanceTeamSlice';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa6';

function DailyMaintenanceRestrictedTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showErrorToast, showSuccessToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { station, status } = location.state || {};
  const { registrationNo } = location.state || {};
  const [page, setPage] = useState(100);
  const [limit, setLimit] = useState(1000);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const[filteredData , setFilteredData] = useState([])
  const [toDate ,setToDate] = useState('')
  const [fromDate ,setFromDate] = useState('')
  const [dataDisplay ,setDataDisplay] = useState([])

  const {
    data: vehicleData,
    isError: vehicleError,
    isLoading: vehicleLoading,
    refetch,
  } = useGetVehicleByCompanyIdQuery({
    companyId: user?.companyId,
    page,
    limit,
    sortBy,
    sortOrder,
    station: user?.station,
  });

  const { data: dailyData, isLoading: dailyLoading } = useGetDailyReportsQuery({
    userId: user.id,
    station: station?.value,
  }); 

  
  const [selectedCount, setSelectedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  useEffect(() => {
    hadleRemoveFilter()
  }, [dailyData, vehicleData]);

  useEffect(() => {
    const totalSelected = vehicles.reduce(
      (acc, e) => acc + (e?.completionPercentage > 0 ? 1 : 0),
      0,
    );
    setSelectedCount(totalSelected); 
  }, [vehicles]);

  const hadleFilter = () => {
     
  
    const filteredData2 = filteredData.filter((item) => {
      const date = new Date(item.time);
      const fromDateValue = new Date(fromDate);
      const toDateValue = new Date(toDate);
 
      date.setHours(0, 0, 0, 0);
      fromDateValue.setHours(0, 0, 0, 0);
      toDateValue.setHours(0, 0, 0, 0);
  
 
      
      return date >= fromDateValue && date <= toDateValue;
    });
    
    setDataDisplay(filteredData2);
  }


  const hadleRemoveFilter = () => { 
    if (dailyData && dailyData.data && vehicleData) { 
      const filteredData = dailyData.data.filter((dailyItem) =>
        vehicleData.data.some(
          (vehicle) =>
            vehicle.registrationNo === dailyItem.vehicle.registrationNo,
        ),
      ); 
      setVehicles(filteredData);
 
    }
    setFilteredData(dailyData?.data)
    setDataDisplay(dailyData?.data)
  }
  return (
    <>
     <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row justify-start items-center pe-2">
            <div className="flex gap-5">
              <div className="flex flex-col">
                <label>From Date</label>
                <input
                  type="date"
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex flex-col">
                <label>To Date</label>

                <input
                  type="date"
                  onChange={(e) => setToDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              <div>
              <div className='flex gap-4 mt-5'> 
                <button onClick={hadleFilter} type='button' className='bg-primary text-white px-7 py-3 rounded-lg cursor-pointer'>Filter</button>
                <button  onClick={hadleRemoveFilter} type='button' className='bg-slate-400 text-white p-3 rounded-lg cursor-pointer'>Remove Filter</button>
              </div>
              </div>
            </div>
            <div>
         
          </div>
          </div>
    <div className="h-[570px] rounded-sm border border-stroke bg-white mb-2 px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto h-[530px] overflow-y-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th
                className="border-b py-2 text-left"
                onClick={() => handleSort('id')}
              >
                <span className="flex items-center">
                  ID{' '}
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
              <th className="border-b py-2 text-left">
                Vehicle Registration No
              </th>

              <th className="border-b py-2 text-left">Percentage Inspected</th>
              <th className="border-b py-2 text-left">Status</th> 
              <th className="border-b py-2 text-left">Creation Time</th> 
              <th className="border-b py-2 text-left">Faults</th> 
              <th className="border-b py-2 text-left">Stats</th> 
              <th className="border-b py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataDisplay?.filter((item) => item.id > 0)
              .map((e, i) => (
                <tr
                  key={i}
                  className={`hover:font-semibold ${e.totalFaults > 0 ? 'bg-red-100' : 'bg-green-100'}`}
               
                > 
                
                  <td className="border-b py-2">{e.id}</td>
                  <td className="border-b py-2">{e.vehicle.registrationNo}</td>
                  <td className="border-b py-2">
                    {e.completionPercentage?.toFixed(2)}%
                  </td>
                  <td className="border-b py-2">
                    {e?.status}
                  </td>
                  <td className="border-b py-2">
                    {e?.time?.split('T')[0]}  {e?.time?.split('T')[1].split('.')[0]}
                  </td>
                  <td
                    className={`border-b text-center py-2 ${e.totalFaults > 0 ? 'text-red-500 font-bold' : 'text-black font-medium'}`}
                  >
                    {
                      e.totalFaults > 0 ? e.totalFaults : '0'
                    }
                   
                  </td>  
                  <td className="border-b py-2">
                    {e?.totalFaults > 0 ? 'NOT-MAINTAINED' : 'MAINTAINED'}
                  </td>
                  {
                            console.log(e?.id)
                          }

                  <td className="border-b py-2">
                    {e.completionPercentage > 0 && (
                      <button
                        className="rounded border-2 bg-green-400   py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/daily-maintenance/view', {
                            state: {
                              registrationNo: e.vehicle.registrationNo,
                              status: e.vehicle.status,
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
    </>
  );
}

export default DailyMaintenanceRestrictedTable;
