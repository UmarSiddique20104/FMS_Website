import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import DefaultLayout from '../../layout/DefaultLayout';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useGetFuelByCompanyIdQuery } from '../../services/fuelSlice';
import { useSelector } from 'react-redux';
import {
  useGetAllDailyReportsQuery,
  useGetChecklistDataQuery,
} from '../../services/dailySlice';
import { useGetVehicleByCompanyIdQuery } from '../../services/vehicleSlice';
import useToast from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline } from 'react-icons/io5';

const DailyMaintainceDashaboard = () => {
  const companyId = 25;
  const [fuelTypeData, setFuelTypeData] = useState([]);
  const { showErrorToast, showSuccessToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { station, status } = location.state || {};
  const { registrationNo } = location.state || {};
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    sortBy: null,
    sortOrder: null,
    station: user?.station,
  });

  const {
    data: dailyData,
    isLoading: dailyLoading,
    isError: dailyError,
  } = useGetAllDailyReportsQuery({
    station: station?.value,
  });
  // console.log(dailyData?.data?.filter((item) => item?.status !== 'No Report'));

  const [nonMaintainedVehicles, setNonMaintainedVehicles] = useState([]);
  const [maintainedVehicles, setMaintainedVehicles] = useState([]);
  const [approvedVehicles, setApprovedVehicles] = useState([]);
  const [rejectedVehicles, setRejectedVehicles] = useState([]);
  const [completedVehhicles , setCompletedVehicles] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState([]);
  const [modalData , setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  const chartData = [
    {
      name: 'Non-Maintained Vehicles',
      value: nonMaintainedVehicles?.length || 0,
    },
    { name: 'Maintained Vehicles', value: maintainedVehicles?.length || 0 },
    
  ];

  const chartColorMap = {
    'Non-Maintained Vehicles': '#FF6384',
    'Maintained Vehicles': '#36A2EB',
 
  };


  const chartData2 = [
    { name: 'Approved', value: approvedVehicles?.length || 0 },
    { name: 'Pending', value: pendingVehicles?.length || 0 },
    { name: 'Rejected', value: rejectedVehicles?.length || 0 },
    { name: 'Completed', value: completedVehhicles?.length || 0 },
  ];

  const chartColorMap2 = { 
    'Approved': '#FFCE56',
    'Pending': '#4BC0C0',
    'Rejected': '#FF6384',
    'Completed': '#36A2EB',
  };

  const handlePieClick =async (data ,data2, data3) => {
    
    let TotalVehicle =   dailyData?.data;
    if(user.station){ 
      const vehiclesInRegion = await vehicleData?.data?.filter(
        (e) => e.station === user.station,
      );
      TotalVehicle = vehiclesInRegion;
    }else{
      TotalVehicle = dailyData?.data
    }
    const TotalVehiclesInRegion = TotalVehicle;
    const filteredVehicles = await dailyData?.data?.filter((vehicle) => {

      return TotalVehiclesInRegion?.some(
        (regionVehicle) =>
          regionVehicle.vehicle.registrationNo === vehicle.vehicle.registrationNo
      );
    });
if( data?.payload.payload.name === 'Approved'){
    const approved = await filteredVehicles?.filter(
     
      (item) =>  item?.status === 'APPROVED' ,
    );
    setModalData(approved);
  }else if ( data?.payload.payload.name === 'Pending'){ 
    const pending =await filteredVehicles?.filter(
      (item) => item?.status === 'PENDING',
    );
    setModalData(pending);
  }else if ( data?.payload.payload.name === 'Rejected'){

    const rejected =await filteredVehicles?.filter(
        (item) => item?.status === 'REJECTED',
    )
    setModalData(rejected);
  }else if ( data?.payload.payload.name === 'Completed'){

    const completed =await filteredVehicles?.filter(
        (item) => item?.status === 'COMPLETED',
    ) 
    setModalData(completed);
  } else{
   
  }
 
    setModalTitle(data3);
 
    document.getElementById('my_modal_3').showModal();

  };

  const hadleFilter = () => {

    if (!startDate || !endDate) {
      showErrorToast('Please provide both From and To dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showErrorToast('From date cannot be greater than To date.');

      return;
    }
    const TotalData = dailyData?.data;


    const filteredData = TotalData.filter((item) => {
      
      if(!item?.date){
        return false; 
      }
      const date = new Date(item.time)
        .toISOString()
        .split('T')[0];
      return date >= startDate && date <= endDate;
    });
 
    const nonMaintained = filteredData?.filter(
      (item) => item?.stats === 'NOT-MAINTAINED',
    );
    const maintained = filteredData?.filter(
      (item) => item?.status === 'No Report',
    );
    const approved = filteredData?.filter(
      (item) => item?.status === 'APPROVED',
    );

    const pending = filteredData?.filter((item) => item?.status === 'PENDING');
    const rejected = filteredData?.filter(
        (item) => item?.status === 'REJECTED',
    )
    setRejectedVehicles(rejected);
    setTotalVehicles(filteredData);
    // setNonMaintainedVehicles(nonMaintained);
    // setMaintainedVehicles(maintained);
    setApprovedVehicles(approved);
    setPendingVehicles(pending);
  };

  const hadleRemoveFilter = async() => {
    let TotalVehicle =   dailyData?.data;
    if(user.station){ 
      const vehiclesInRegion = await vehicleData?.data?.filter(
        (e) => e.station === user.station,
      );
      TotalVehicle = vehiclesInRegion;
    }else{
      TotalVehicle = dailyData?.data
    }

   
   
    const TotalVehiclesInRegion = TotalVehicle;
    // console.log(TotalVehiclesInRegion)
    // console.log(dailyData?.data?.filter((item) => item?.status !== 'No Report'));
    const filteredVehicles = await dailyData?.data?.filter((vehicle) => {

      return TotalVehiclesInRegion?.some(
        (regionVehicle) =>
          regionVehicle.vehicle.registrationNo === vehicle.vehicle.registrationNo
      );
    });
    // console.log(filteredVehicles);
    // console.log(filteredVehicles?.filter((item) => item?.status !== 'No Report'));
    const nonMaintained =  await filteredVehicles?.filter(
      (item) => item?.stats === 'NOT-MAINTAINED',
    );
    const maintained = await filteredVehicles?.filter(
      (item) => item?.status === 'No Report',
    );
    const approved = await filteredVehicles?.filter(
     
      (item) =>  item?.status === 'APPROVED' ,
    );
    const pending =await filteredVehicles?.filter(
      (item) => item?.status === 'PENDING',
    );
    const rejected =await filteredVehicles?.filter(
        (item) => item?.status === 'REJECTED',
    )
    const completed =await filteredVehicles?.filter(
        (item) => item?.status === 'COMPLETED',
    )
    setRejectedVehicles(rejected);
    setCompletedVehicles(completed);

    setTotalVehicles(filteredVehicles);
    setNonMaintainedVehicles(nonMaintained);
    setMaintainedVehicles(maintained);
    setApprovedVehicles(approved);
    setPendingVehicles(pending);
  };

  useEffect(() => {
    hadleRemoveFilter();
  }, [dailyData]);

  if (isLoading || dailyLoading) return <p>Loading...</p>;
  
  return (
    <DefaultLayout>
      <BreadcrumbNav
        pageName="Maintenance Dashboard"
        pageNameprev="Daily Maintenance"
        pagePrevPath="daily-maintenance"
      />

      <div className="flex justify-center mt-10 space-x-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md p-2"
          />
        </div>
        <div className="flex gap-4 mt-5">
          <button
            onClick={hadleFilter}
            type="button"
            className="bg-primary text-white px-7  rounded-lg cursor-pointer"
          >
            Filter
          </button>
          <button
            onClick={hadleRemoveFilter}
            type="button"
            className="bg-slate-400 text-white  px-3 rounded-lg cursor-pointer"
          >
            Remove Filter
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-10 space-x-4">
        <div className="w-full bg-white rounded-lg shadow-xl border p-6 flex flex-col">
          <div className="mb-4 flex justify-between">
            <h6 className="text-xl font-semibold text-black dark:text-white">
              Maintenance Types
            </h6>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                // onClick={handlePieClick}
                onClick={(data, index) =>
                  handlePieClick(
                    data ,
                    data.payload.status,
                    'vendorType',
                  )
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColorMap[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 flex justify-end space-x-4">
            {[
              'Non-Maintained Vehicles',
              'Maintained Vehicles',
              
            ].map((type, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ backgroundColor: chartColorMap[type] }}
                ></span>
                <p className="text-sm font-medium text-black dark:text-white">
                  {type}:{' '}
                  {chartData.find((data) => data.name === type)?.value || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full  bg-white rounded-lg shadow-xl border p-6 flex flex-col">
          <div className="mb-4 flex justify-between">
            <h6 className="text-xl font-semibold text-black dark:text-white">
              Request Types
            </h6>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData2}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                // onClick={handlePieClick}
                onClick={(data, index) =>
                  handlePieClick(
                    data,
                    data ,
                    'Request Types',
                  )
                }
              >
                {chartData2.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColorMap2[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 flex justify-end space-x-4">
            {[ 'Approved',
              'Pending',
                'Rejected',
                'Completed',
            ].map((type, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ backgroundColor: chartColorMap2[type] }}
                ></span>
                <p className="text-sm font-medium text-black dark:text-white">
                  {type}:{' '}
                  
                  {chartData2.find((data) => data.name === type)?.value || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      { modalTitle!== "" && <Modal
        data={modalData}
        title={modalTitle}
       
      />}
    </DefaultLayout>
  );
};

export default DailyMaintainceDashaboard;
const Modal = ({ data, title }) => {

  
  const formatText = (text) => {
    return text
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);  
    const formattedDate = date.toLocaleDateString();  
    const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true   
    });
    
    return `Date: ${formattedDate}, Time: ${formattedTime}`;
  };
  function capitalizeFirstLetter(string) {
    string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}
const navigate = useNavigate();
  return (
    <dialog id="my_modal_3" className="modal">
      <div className="modal-box max-w-full w-auto bg-white text-black">
        <h3 className="font-bold text-lg">{title}</h3>
        <table className="table-auto w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Registration No</th>
              <th className="px-4 py-2">Station</th>
              <th className="px-4 py-2">Percentage</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Total Faults</th>
              <th className="px-4 py-2">Created At</th>
           
              <th className="px-4 py-2">View</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.id}</td>
                <td className="border px-4 py-2">{item.vehicle.registrationNo}</td>
                <td className="border px-4 py-2">{item.vehicle.station}</td>
                <td className="border px-4 py-2">{item.completionPercentage.toFixed(2)}</td>
                <td className="border px-4 py-2">{capitalizeFirstLetter(item.status)}</td>
                <td className="border px-4 py-2">{item.totalFaults}</td>
                <td className="border px-4 py-2">
                  {
                    formatDateTime(item.time)
                  } 
                </td>
                <td className="border px-4 py-2 "   > 
                <IoEyeOutline  onClick={()=>navigate('/daily-maintenance/view', {
                                  state: {
                                    registrationNo: item.vehicle.registrationNo,
                                    id: item.id,
                                  },
                                })} style={{ fontSize: '20px' }}  className='hover:text-primary cursor-pointer'/>
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};