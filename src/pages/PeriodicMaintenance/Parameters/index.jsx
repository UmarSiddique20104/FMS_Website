import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import ParametersTable from './ParametersTable';
import { Link } from 'react-router-dom';
import BreadcrumbNav from '../../../components/Breadcrumbs/BreadcrumbNav';

const Parameters = () => {
  return (
    <DefaultLayout>
      <BreadcrumbNav
        pageName="Add a parameter"
        pageNameprev="Periodic Maintenance" //show the name on top heading
        pagePrevPath="periodic" // add the previous path to the navigation
      />
      <ParametersTable />
    </DefaultLayout>
  );
};

export default Parameters;
