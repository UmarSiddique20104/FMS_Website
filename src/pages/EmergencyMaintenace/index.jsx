import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { Link, useNavigate } from 'react-router-dom';
import { RiAddCircleLine } from 'react-icons/ri';
import { getAllUsers } from '../../store/userSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import FilterRegionSubregionStation from './FilterRegionSubRegionStation';
import EmergencyTable from './EmergencyTable';
import { FaChartSimple } from 'react-icons/fa6';
import EmergencyTableForAdmin from './EmergencyTableForAdmin';
// import FilterRegionSubRegionStation from './FilterRegionSubRegionStation';

const   EmergencyMnt = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(getAllUsers()).then((result) => {});
  }, []);

  const { user } = useSelector((state) => state.auth);

  const Role = user?.Role?.roleName;
  console.log('Role', Role);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Emergency & Insurance Maintenance" />
      <div className="flex justify-end items-end mb-4 gap-3">
        <Link
          to="dashboard"
          className="btn h-[30px] min-h-[30px] text-sm border-slate-200 hover:bg-opacity-90 bg-primary text-white     transition duration-150 ease-in-out rounded-md"
        >
          {' '}
          <span>
            <FaChartSimple />
          </span>
          Dashboard
        </Link>

        {Role === 'regionalAdmin' && (
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/Emergency-Maintenance/add')}
          >
            Emergency Maintenance Request
          </button>
        )}
      </div>

      {Role === 'companyAdmin' ||
      Role === 'insuranceAdmin' ||
      Role === 'supervisor' ? (
        <EmergencyTableForAdmin Role={Role} />
      ) : (
        <EmergencyTable Role={Role} />
      )}
    </DefaultLayout>
  );
};

export default EmergencyMnt;
