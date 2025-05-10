// MapComponent.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { IoIosArrowRoundForward } from 'react-icons/io';
// Replace with your API URL and credentials
const API_URL =
  'https://mytrakker.tpltrakker.com/TrakkerServices/Api/Home/GetSOSLastLocation/SOSUser1/SOSPassword1/03300607077/null';

const fetchVehicleData = async () => {
  try {
    const response = await axios.get(API_URL);

    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return [];
  }
};

const VehicleMap = ({ selectedStation, userStation, vehicleData }) => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const getVehicles = async () => {
      const data = await fetchVehicleData();

      let filteredVehicles;
      if (!userStation) {
        // If userStation is undefined, null, or empty, show all vehicles
        filteredVehicles = data;
      } else {
        // Otherwise, filter vehicles based on registrationNo and station
        filteredVehicles = data.filter((vehicle) => {
          const matchingVehicle = vehicleData.find(
            (vd) =>
              vd.registrationNo === vehicle.RegNo && vd.station === userStation,
          );
          return matchingVehicle;
        });
      }

      setVehicles(filteredVehicles);
    };

    getVehicles();
  }, [selectedStation, userStation, vehicleData]);

  return (
    <MapContainer
      center={[30.3753, 69.3451]} // Center of Pakistan
      zoom={5} // Zoom level to show the whole Pakistan
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {vehicles.map((vehicle) => (
        <Marker key={vehicle.RegNo} position={[vehicle.Lat, vehicle.Lng]}>
          <Popup>
            <p>{vehicle.Location}</p>
            <p>{vehicle.RegNo}</p>
            <div className="flex justify-center items-center ">
              <Link
                to={`/vehicles/view/${vehicle.RegNo}`}
                className="px-4 rounded-md ld flex py-2 border items-center justify-center hover:bg-blue-500 text-blue-600  hover:text-white"
              >
                {' '}
                <span className=" text-base font-semibo ">
                  View Details
                </span>{' '}
                <IoIosArrowRoundForward className="h-6 w-6 ps-0.5 " />{' '}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default VehicleMap;
