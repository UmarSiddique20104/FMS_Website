
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { useGetEmergencyrequestQuery } from '../../../services/emergencySlice';
import BreadcrumbNav from '../../../components/Breadcrumbs/BreadcrumbNav';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

const Modal = ({ data, title, categoryField }) => {
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
              <th className="px-4 py-2">Registration No</th>
              <th className="px-4 py-2">Driver Name</th>
              <th className="px-4 py-2">Station</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">APL Card No</th>
              <th className="px-4 py-2">Created At</th>
           
              <th className="px-4 py-2">View</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.registrationNo}</td>
                <td className="border px-4 py-2">{item.driverName}</td>
                <td className="border px-4 py-2">{item.station}</td>
                <td className="border px-4 py-2">{capitalizeFirstLetter(item.status)}</td>
                <td className="border px-4 py-2">{item.aplCardNo}</td>
                <td className="border px-4 py-2">
                  {
                    formatDateTime(item.created_at)
                  } 
                </td>
                <td className="border px-4 py-2 "   > 
                <IoEyeOutline  onClick={()=>navigate(`/Emergency-Maintenance/view/${item?.id}`)} style={{ fontSize: '20px' }}  className='hover:text-primary cursor-pointer'/>
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
 

function EmergencyDashboard() {
  const {
    data: emergencyData,
    error: emergencyError,
    isLoading: emergencyLoading,
  } = useGetEmergencyrequestQuery({
    page: 1,
    limit: 1000,
  });

  const [vendorTypeData, setVendorTypeData] = useState([]);
  const [stations, setStations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [vendorTypeSelectedStation, setVendorTypeSelectedStation] = useState('');
  const [vendorTypeSelectedStatus, setVendorTypeSelectedStatus] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategoryField, setModalCategoryField] = useState('');
  const { user } = useSelector((state) => state.auth);
 
 


  // State for date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (emergencyData && emergencyData.data) {
      let Station  =[]
      const uniqueStations = ['All', ...new Set(emergencyData.data.map(item => item.station))];
      const uniqueStatuses = ['All', ...new Set(emergencyData.data.map(item => item.status))];
      if(user?.station ){
        
        const filterStation = uniqueStations.filter((station) => station === user?.station)
      
        Station= filterStation
      }else{
        Station = uniqueStations
      }
   
      setStations(Station);
      setStatuses(uniqueStatuses);
    }
  }, [emergencyData]);

  // useEffect(() => {
    
  //   if (emergencyData && emergencyData.data) {
  //     const filteredVendorTypeData = emergencyData.data.filter(item => { 
  //       const createdAt = new Date(item.created_at);  
  //       const isWithinDateRange =
  //         (!fromDate || createdAt >= new Date(fromDate)) &&
  //         (!toDate || createdAt <= new Date(toDate));
        
  //       return (
  //         (vendorTypeSelectedStation === '' || item.station === vendorTypeSelectedStation || vendorTypeSelectedStation === 'All') &&
  //         (vendorTypeSelectedStatus === '' || item.status === vendorTypeSelectedStatus || vendorTypeSelectedStatus === 'All') &&
  //         isWithinDateRange
  //       );
  //     });

  //     // Count status occurrences
  //     const vendorTypeCounts = filteredVendorTypeData.reduce((acc, item) => {
  //       const status = item.status ? item.status : 'Unknown';
  //       if (!acc[status]) {
  //         acc[status] = { count: 0, items: [] };
  //       }
  //       acc[status].count++;
  //       acc[status].items.push(item);
  //       return acc;
  //     }, {});

  //     const formattedVendorTypeData = Object.entries(vendorTypeCounts).map(
  //       ([status, { count, items }]) => ({
  //         status: status,
  //         value: count,
  //         items,
  //       }),
  //     );

  //     setVendorTypeData(formattedVendorTypeData);
  //   }
  // }, [emergencyData, vendorTypeSelectedStation, vendorTypeSelectedStatus, fromDate, toDate]);
  useEffect(() => {
    if (emergencyData && emergencyData.data) {
      const filteredVendorTypeData = emergencyData.data.filter(item => {
       
        if (user?.station && item.station !== user.station) {
         
          return false; 
        }
   
        const createdAt = new Date(item.created_at);  
        const isWithinDateRange =
          (!fromDate || createdAt >= new Date(fromDate)) &&
          (!toDate || createdAt <= new Date(toDate));
   
        return (
          (vendorTypeSelectedStation === '' || item.station === vendorTypeSelectedStation || vendorTypeSelectedStation === 'All') &&
          (vendorTypeSelectedStatus === '' || item.status === vendorTypeSelectedStatus || vendorTypeSelectedStatus === 'All') &&
          isWithinDateRange
        );
      });
   
      const vendorTypeCounts = filteredVendorTypeData.reduce((acc, item) => {
        const status = item.status ? item.status : 'Unknown';
        if (!acc[status]) {
          acc[status] = { count: 0, items: [] };
        }
        acc[status].count++;
        acc[status].items.push(item);
        return acc;
      }, {});
   
      const formattedVendorTypeData = Object.entries(vendorTypeCounts).map(
        ([status, { count, items }]) => ({
          status: status,
          value: count,
          items,
        })
      );
  
      setVendorTypeData(formattedVendorTypeData);
    }
  }, [emergencyData, vendorTypeSelectedStation, vendorTypeSelectedStatus, fromDate, toDate, user?.station]);
  
  const handleVendorTypeStationChange = (e) => {
    setVendorTypeSelectedStation(e.target.value);
  };

  const handleVendorTypeStatusChange = (e) => {
    setVendorTypeSelectedStatus(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FF9', '#F95F62'];

  const handlePieClick = (data, title, categoryField) => {
    setModalData(data.items);
    setModalTitle(title);
    setModalCategoryField(categoryField);
    document.getElementById('my_modal_3').showModal();
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { status, value } = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
          <p className="label font-semibold">{`${capitalizeFirstLetter(status)} : ${value}`}</p>
        </div>
      );
    }
    return null;
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const handleRemoveFilterDate = () => {
    setFromDate("")
    setToDate("")
  }

  return (
    <DefaultLayout>
      <BreadcrumbNav
        pageName="Emergency & Insurance Maintenance Dashboard"
        pageNameprev="Emergency & Insurance Maintenance"
        pagePrevPath="Emergency-Maintenance"
      />

      <div className="flex flex-col items-center mt-10 bg-white rounded-lg shadow-lg p-5 w-full">
        <div className="flex w-full space-x-4">
          <div className="  bg-white rounded-lg shadow-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold pe-4"> Queries</h2>
              <div className="flex space-x-5">
                <select
                  className="border rounded p-2"
                  value={vendorTypeSelectedStation}
                  onChange={handleVendorTypeStationChange}
                >
                  <option value="" disabled>Select Station</option>
                  {stations.map((station, index) => (
                    <option key={index} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded p-2"
                  value={vendorTypeSelectedStatus}
                  onChange={handleVendorTypeStatusChange}
                >
                  <option value="" disabled>Select Status</option>
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>
                      {capitalizeFirstLetter(status)}
                    </option>
                  ))}
                </select>
               
                <input
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  className="border rounded p-2"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  className="border rounded p-2"
                />
                <div onClick={handleRemoveFilterDate}  className='border py-2 px-3 cursor-pointer rounded-lg bg-slate-100'>
                  Remove Date Filter

                </div>


              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={vendorTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data, index) =>
                    handlePieClick(
                      data.payload,
                      data.payload.status,
                      'vendorType',
                    )
                  }
                >
                  {vendorTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap justify-center space-x-4">
              {vendorTypeData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span
                    className="block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  ></span>
                  <p className="text-sm font-medium text-black">{capitalizeFirstLetter(entry.status)}</p>
                  <p className="ml-2 text-sm font-medium text-black">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal
        data={modalData}
        title={modalTitle}
        categoryField={modalCategoryField}
      />
    </DefaultLayout>
  );
}

export default EmergencyDashboard;

 