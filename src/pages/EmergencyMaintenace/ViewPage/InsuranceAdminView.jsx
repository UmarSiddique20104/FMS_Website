import React, { useEffect, useState } from 'react'; 
import { Link,  useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DefaultLayout from '../../../layout/DefaultLayout';
import DetailItem from '../Components/DetailsField';
import ServiceDetail from '../Components/ServiceDetail';
import { formatDateTime, MediaItem } from '../Components/HelperFunction';
import useToast from '../../../hooks/useToast';
import { useGetOneEmergencyRequestQuery } from '../../../services/emergencySlice';
import { refresh } from '@cloudinary/url-gen/qualifiers/artisticFilter';
 
 
const InsuranceAdminView = () => {
  const { showErrorToast, showSuccessToast } = useToast();
  const { id } = useParams(); 
  const { user } = useSelector((state) => state.auth);
  const { data: EmergencyData, isLoading } = useGetOneEmergencyRequestQuery(id);
  
  return (
    <DefaultLayout>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-title-xl font-semibold text-[#422AFB]  ">
            Emergency Request Form
          </h2>
          <div className="flex justify-end items-end mb-4 gap-3">
            <Link
              to="/emergency-maintenance"
              className="btn h-[30px] text-sm border-slate-200 hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md  bg-primary  text-white"
            >
              Back to Emergency Maintenance
            </Link>
          </div>

          <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-end p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Information</h2>
            </div>
 
            {(EmergencyData?.data?.rejectedByInsurace ||
              EmergencyData?.data?.status === 'repair rejected') && (
              <div className="flex justify-between items-end p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold p-4 bg-red-400 text-white rounded-md">
                  Status:{' '}
                  <span className=" "> Rejected By Insurance Department</span>
                </h2>
              </div>
            )}
            <div className="flex p-5 bg-brand-primary">
              <div className="flex flex-col gap-1 w-4/5">
                <div className="grid grid-cols-2 gap-1">
                  <DetailItem label="ID" value={EmergencyData?.data?.id} />
                  <DetailItem
                    label="Registration No."
                    value={EmergencyData?.data?.registrationNo}
                  />
                  <DetailItem label="Make" value={EmergencyData?.data?.make} />
                  <DetailItem
                    label="Driver Name"
                    value={EmergencyData?.data?.driverName}
                  />
                  <DetailItem
                    label="GBMS"
                    value={EmergencyData?.data?.gbmsNo}
                  />
                  <DetailItem
                    label="Station"
                    value={EmergencyData?.data?.station}
                  />
                  <DetailItem
                    label="Current Odometer"
                    value={EmergencyData?.data?.meterReading}
                  />
                  <DetailItem label="CE" value={EmergencyData?.data?.ce} />
                  <DetailItem
                    label="RM / OM / Name"
                    value={EmergencyData?.data?.rm_omorName}
                  />
                  <DetailItem
                    label="Driver Statement"
                    value={EmergencyData?.data?.description}
                  />
                  <DetailItem
                    label="Supervisor"
                    value={EmergencyData?.data?.emergencySupervisor}
                  />
                  <DetailItem
                    label="APL Card No."
                    value={EmergencyData?.data?.aplCardNo}
                  />
                  <DetailItem
                    label="Created At"
                    value={formatDateTime(EmergencyData?.data?.created_at)}
                  />
                  <DetailItem
                    label="Updated At"
                    value={formatDateTime(EmergencyData?.data?.updated_at)}
                  />
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-bold">Services:</h3>
                  {EmergencyData?.data?.services?.length > 0 ? (
                    EmergencyData.data.services.map((service, index) => (
                      <ServiceDetail key={index} service={service} />
                    ))
                  ) : (
                    <p className="text-md font-normal">No services found.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <MediaItem
                    label="Repair Request Images"
                    items={EmergencyData?.data?.emergencyRepairRequestImgs}
                  />
                  <MediaItem
                    label="Driver Statement Videos"
                    items={EmergencyData?.data?.emergencyRepairStatementVideos}
                    isVideo
                  />
                </div>
              </div>
            </div>
          </div>

          {(EmergencyData?.data?.status === 'survey completed' ||
            EmergencyData?.data?.status === 'repair approved' ||
            EmergencyData?.data?.status === 'inspection done' || 
            EmergencyData?.data?.status === 'wating for completion' ||
            EmergencyData?.data?.status === 'completed' 
        
        ) && (
            <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <div className="flex justify-between items-end p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Insurance Details</h2>
              </div>
              <div className="  p-5 bg-brand-primary">
                <InsuranceDetail
                  insuranceData={
                    EmergencyData?.data?.emergencyMaintenanceInsurance[0]
                  }
                />
                {EmergencyData?.data?.estimatedCost !== '' && (
                  <DetailItem
                    label="Estimated Cost"
                    value={EmergencyData?.data?.estimatedCost}
                  />
                )}
               
                {(EmergencyData?.data?.estimatedCostImage && EmergencyData?.data?.estimatedCostImage?.length !== 0)  && (
                   <MediaItem
                   label="Estimeted Cost Images"
                   items={EmergencyData?.data?.estimatedCostImage}
                 />
                )}
              </div>
            </div>
          )}

           
        </>
      )}
    </DefaultLayout>
  );
};

export default InsuranceAdminView;
 
 