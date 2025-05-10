import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useLocation } from 'react-router-dom';
import { useGetChecklistDataQuery } from '../../services/dailySlice';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BreadcrumbNav from '../../components/Breadcrumbs/BreadcrumbNav';
import { useNavigate, Link } from 'react-router-dom';



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

const countNotOkItems = (booleanFields, checklist) => {
  return booleanFields.reduce((acc, fieldName) => {
    return acc + (checklist[fieldName] === false ? 1 : 0);
  }, 0);
};
const DailyView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationNo,id } = location.state || {};
  console.log(id)
  const { data, isLoading, error } = useGetChecklistDataQuery({
    registrationNo,
    id,
  }); 
  const [status, setStatus] = useState('');
  const [dailyLogs, setDailyLogs] = useState([]);
  console.log(data?.data);
  const [recordDate, setRecordDate] = useState('');
 
  const booleanFields = [
    'vehicleInspection',
    'engineOil',
    'transmissionFluid',
    'coolant',
    'brakeFluid',
    'windshieldWasherFluid',
    'tireInspection',
    'headlights',
    'taillights',
    'brakeLights',
    'turnLights',
    'hazardLights',
    'brakes',
    'brakeFluidLevel',
    'battery',
    'interiorCleanliness',
    'registrationDocument',
    'insuranceDocument',
    'permitDocument',
    'firstAidKit',
    'fireExtinguisher',
    'reflectiveTriangles',
    'fuelLevel',
  ];

  const [checklist, setChecklist] = useState({});
  const [vehicleHealth, setVehicleHealth] = useState(0);

  useEffect(() => {
    const allData = data?.data?.dailyMaintenanceLog;
  
   if(allData?.length > 0) {
    
     const transformedData = allData?.map((entry) => { 
       const faultsWithReasons = Object.keys(entry).reduce((acc, key) => {
         if (!entry[key] && entry[`${key}Reason`]) {
           acc.push({ [key]: entry[`${key}Reason`] });
         }
         return acc;
       }, []);
   
       return {
         log: entry.log,
         changedBy: entry.changedBy,
         totalFaults: entry.totalFaults,
         created_at: entry.created_at,
         reasons: faultsWithReasons,
       };
     });
     setDailyLogs(transformedData);

   }
  
     
  }, [data?.data]);
  
  useEffect(() => {
    if (data) {
      const filteredData = {};
      booleanFields.forEach((field) => {
        filteredData[field] = data.data[field];
      });

      setChecklist(filteredData);
      const totalFields = booleanFields.length;
      const okFields = booleanFields.filter(
        (key) => data.data[key] === true,
      ).length;
      console.log('okFields', okFields);
      console.log('totalFields', totalFields);
      const healthPercentage = (okFields / totalFields) * 100;
      setVehicleHealth(healthPercentage.toFixed(2));
    }
    setRecordDate(data?.data?.created_at);
    setStatus(data?.data?.vehicle?.status);
  }, [data]);

  if (isLoading) return <p>Loading checklist data...</p>;
  if (error) return <p>Error loading checklist data.</p>;

  // const capitalizeFirstLetter = (string) => {
  //   return string.charAt(0).toUpperCase() + string.slice(1);
  // };

  const capitalizeFirstLetter = (fieldName) => {
    const result = fieldName.replace(/([A-Z])/g, ' $1');

    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const okItems = booleanFields.filter((fieldName) => checklist[fieldName]);
  const notOkItems = booleanFields.filter((fieldName) => !checklist[fieldName]);

  const getProgressBarColor = (percentage) => {
    const red = Math.min(255, (100 - percentage) * 2.55);
    const green = Math.min(255, percentage * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  const totalNotOkItems = countNotOkItems(booleanFields, checklist);
  console.log('totalNotOkItems', totalNotOkItems);
  console.log('data.data', recordDate);


  return (
    <DefaultLayout>
      <BreadcrumbNav
        pageName="Daily Maintenance View"
        pageNameprev="Daily Maintenance" //show the name on top heading
        pagePrevPath="daily-maintenance" // add the previous path to the navigation
      />
      <div className="mx-auto  ">
        <div className="gap-8 grid grid-cols-12">
          <div className="col-span-8  ">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row pl-5 pt-5">
                <div className="w-full">
                  <label className="mb-3 block text-xl font-bold text-black dark:text-white">
                    Vehicle: {registrationNo}
                  </label>
                  <label className="mb-3 block text-xl font-bold text-black dark:text-white">
                    Date: {recordDate?.split('T')[0]}
                  </label>
                  <label className="mb-3 block text-xl font-bold text-black dark:text-white">
                    Status: {status}
                  </label>
                  <div className="relative w-full bg-gray-200 rounded-full h-6 mb-4">
                    <div
                      className="absolute top-0 left-0 h-6 rounded-full text-center text-white flex items-center justify-center"
                      style={{
                        width: `${vehicleHealth}%`,
                        backgroundColor: getProgressBarColor(vehicleHealth),
                      }}
                    >
                      <span className="absolute right-0 pr-2">
                        {vehicleHealth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-5 p-5 bg-green-100 rounded-md">
                  <h2 className="text-lg font-semibold mb-4">OK Items</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {okItems.map((fieldName) => (
                      <div key={fieldName} className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        <label>{capitalizeFirstLetter(fieldName)}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 bg-red-100 rounded-md">
                  <h2 className="text-lg font-semibold mb-4">Not OK Items</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {notOkItems.map((fieldName) => (
                      <div key={fieldName} className="flex flex-col">
                        <div className="flex items-center">
                          <FaTimesCircle className="text-red-500 mr-2" />
                          <label>{capitalizeFirstLetter(fieldName)}</label>
                        </div>
                        <p className="text-red-500">
                          Reason: {data.data[`${fieldName}Reason`]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mr-5 mt-2">
              <div className="flex justify-end gap-4.5">
                {data?.data?.status == 'APPROVED' && (
                  <button
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium  text-white bg-primary"
                    type="button"
                    onClick={() =>
                      navigate(`/daily-maintenance/process/${registrationNo}`, {
                        state: {
                          registrationNo: registrationNo,
                          status: data.data.status,
                          ids: data.data.id,
                        },
                      })
                    }
                  >
                    Approval Form
                  </button>
                )}
                {data?.data?.dailyServices.length > 0 &&
                  data?.data?.status == 'APPROVED' && (
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium  text-white bg-primary"
                      type="button"
                      onClick={() =>
                        navigate(
                          `/daily-maintenance/process/view/${registrationNo}`,
                          {
                            state: {
                              registrationNo: registrationNo,
                              status: data.data.status,
                            },
                          },
                        )
                      }
                    >
                      View Process Form
                    </button>
                  )}
                {/* <button
                  className="rounded border border-stroke py-1 px-4 font-medium text-black dark:border-strokedark dark:text-white transition duration-150 ease-in-out hover:border-gray dark:hover:border-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate('/daily-maintenance/view', {
                      state: {
                        registrationNo: e.vehicle.registrationNo,
                        status: e.vehicle.status,
                      },
                    });
                  }}
                >
                  View
                </button> */}
              </div>
            </div>
          </div>
          <div className=" col-span-4 border-2 flex flex-col flex-auto h-[100vh]">
            <div className="h-[5vh] font-bold border-b-2 border-black flex justify-center items-center">
              Daily Maintenance Logs
            </div>
         
    
            <div className="max-h-[95vh] overflow-y-auto">
  {dailyLogs?.length > 0 ? (
    dailyLogs?.map((e, i) => {
      return (
        <div
          key={i}
          className="h-auto border border-dashed text-sm p-2 text-black"
        > 
          <div>
            <strong>Employee Name:</strong> {e?.changedBy}
          </div>
          <div className='text-black'>
            <strong className='text-black'>Activity:</strong> {e?.log}
          </div>
          <div>
            <strong>Total Faults:</strong> {e?.totalFaults}
          </div>
          <div>
            <strong>Date:</strong> {formatDateTime(e?.created_at)}
          </div>
          <div>
            {e?.reasons?.map((reason, index) => {
              const key = Object.keys(reason)[0];
              return (
                <div key={index}>
                  <strong>{capitalizeFirstLetter(key)}:</strong> {reason[key]}
                </div>
              );
            })}
          </div>
        </div>
      );
    })
  ) : (
    <div>No Logs Found</div>
  )}
</div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DailyView;
