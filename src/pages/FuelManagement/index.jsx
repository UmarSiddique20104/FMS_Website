import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { Link } from 'react-router-dom';
import { IoMdAddCircle } from 'react-icons/io';
import FuelApprovalTable from './FuelApprovalTable';
import { useSelector } from 'react-redux';
import { FaSearch, FaFileExport } from 'react-icons/fa';
import { MdDownload, MdOutlineCloudUpload } from 'react-icons/md';
import { exportToPDF } from '../../components/ExportPDFCSV/ExportPDFCSV';
import { SiMicrosoftexcel } from 'react-icons/si';
import { FaChartSimple } from 'react-icons/fa6';
import { FaRegFilePdf } from 'react-icons/fa6';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { useGetAllFuelQuery } from '../../services/fuelSlice';
import { stationOptions } from '../../constants/Data';
const statusOptions = [
  { value: '', label: 'All' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'REJECTED', label: 'REJECTED' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'COMPLETED', label: 'COMPLETED' },
];

const fuelTypeOptions = [
  { value: '', label: 'All' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
];

const FuelManagement = () => {
  const stationOptions2 = [{ value: 'All', label: 'All' }, ...stationOptions];
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyId, setCompanyId] = useState(25);
  const [status, setStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportsModalVisible, setIsReportsModalVisible] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sortedData, setSortedData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [requestIDFilter, setRequestIDFilter] = useState(null);
  const [statusFilterInitialState, setStatusFilterInitialState] = useState(
    statusOptions[0],
  );
  const [fuelTypeFilter, setFuelTypeFilter] = useState(null);
  const [makeFilter, setMakeFilter] = useState(null);
  const [requestTypeFilter, setRequestTypeFilter] = useState(null);
  const [stationFilter, setStationFilter] = useState(null);

  const formatDate = (date) => {
    const formattedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate(),
        ).padStart(2, '0')}`
      : '';

    return `${formattedDate}`;
  };

  const { data: fuelData, error, isLoading } = useGetAllFuelQuery(companyId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  const handleStatusChange = (e) => {
    setStatus(e);
  };

  const exportReportPdf = async (data) => {
    if (data.length === 0) {
      console.error('No data provided.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Fuel Requests Report', 14, 22);

    const columnsToFilter = [
      'id',
      'registrationNo',
      'driverName',
      'gbmsNo',
      'previousOddometerReading',
      'currentOddometerReading',
      'distance',
      'fuelAverage',
      'requestType',
      'rateOfFuel',
      'quantityOfFuel',
      'amount',
      'modeOfFueling',
      'cardNo',
      'fuelType',
      'station',
      'status',
      'created_at',
    ];

    const columnsToPrint = [
      'S.No', // Serial Number Column
      'Req.ID',
      'Vehicle No.',
      'Driver',
      'GBMS No',
      'Prev Odo',
      'Curr Odo',
      'Mileage',
      'F.Avg',
      'Req.Type',
      'Rate',
      'Litres',
      'Amount',
      'Mode',
      'Card Number',
      'Fuel Type',
      'Station',
      'Status',
      'Created At',
    ];

    // Filter data based on the date range, handle undefined dates
    const filteredData2 = data.filter((obj) => {
      console.log('startDate', startDate);
      console.log('endDate', endDate);
      const recordDate = new Date(obj.created_at);
      const formattedRecordDate = formatDate(recordDate);

      // If no startDate or endDate provided, return all records
      if (!startDate || !endDate) return true;

      return (
        formattedRecordDate >= formatDate(startDate) &&
        formattedRecordDate <= formatDate(endDate)
      );
    });
    console.log('Selected Date=>', filteredData2);
    const filteredData = await filterData(filteredData2);

    if (filteredData.length === 0) {
      console.error(
        formatDate(startDate),
        formatDate(endDate),
        'No data available for the given date range.',
      );
      return;
    }

    const rows = filteredData.map((obj, index) => {
      return columnsToFilter.map((key) => {
        let value = obj[key];
        if (key === 'created_at') {
          const date = new Date(value);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          value = `${day}-${month}-${year} ${hours}:${minutes}`; // Format the date
        }
        return value;
      });
    });

    // Adding serial numbers
    const formattedRows = rows.map((row, index) => [index + 1, ...row]);

    autoTable(doc, {
      startY: 30,
      head: [columnsToPrint], // Header row
      body: formattedRows, // Data rows
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [204, 204, 255], // Light purple color for the header
      },
    });

    doc.save('Fuel_Requests_Report.pdf');
  };

  const exportPDF = async (data) => {
    const columnsToFilter = [
      'id',
      'registrationNo',
      'driverName',
      'gbmsNo',
      'previousOddometerReading',
      'currentOddometerReading',
      'fuelAverage',
      'requestType',
      'rateOfFuel',
      'quantityOfFuel',
      'amount',
      'modeOfFueling',
      'cardNo',
      'fuelType',
      'station',
      'status',
      'created_at',
    ];
    const columnsToPrint = [
      'Request ID',
      'Vehicle No.',
      'Driver',
      'GMBS No.',
      'Prev Odo Reading',
      'Curr Odo Reading',
      'Prev Travel F.Avg',
      'Request Type',
      'Rate',
      'Litres',
      'Amount',
      'Fueling Mode',
      'Card Number',
      'Fuel Type',
      'Station',
      'Status',
      'Created At',
    ];
    await filterData(data);
    console.log(data);
    await exportToPDF(data, columnsToFilter, columnsToPrint, 'Fuel Requests');
  };

  const exportToCsv = async (data) => {
    if (data.length === 0) {
      console.error('No data provided.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fuel Requests');

    const columnsToFilter = [
      'id',
      'registrationNo',
      'driverName',
      'gbmsNo',
      'previousOddometerReading',
      'currentOddometerReading',
      'distance',
      'fuelAverage',
      'requestType',
      'rateOfFuel',
      'quantityOfFuel',
      'amount',
      'modeOfFueling',
      'cardNo',
      'fuelType',
      'station',
      'status',
      'created_at',
    ];

    const columnsToPrint = [
      'S.No', // Serial Number Column
      'Req.ID',
      'Vehicle No.',
      'Driver',
      'GBMS No',
      'Prev Odo',
      'Curr Odo',
      'Mileage',
      'F.Avg',
      'Req.Type',
      'Rate',
      'Litres',
      'Amount',
      'Mode',
      'Card Number',
      'Fuel Type',
      'Station',
      'Status',
      'Created At',
    ];

    const rows = [];

    data.forEach((obj, index) => {
      const values = columnsToFilter.map((key) => {
        let value = obj[key];
        if (key === 'created_at') {
          const date = new Date(value);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          value = `${day}-${month}-${year} ${hours}:${minutes}`;
        }
        return value;
      });
      rows.push([index + 1, ...values]); // Adding serial number
    });
    await filterData(data);
    console.log(data);
    worksheet.addRow(columnsToPrint); // Add header row
    rows.forEach((row) => worksheet.addRow(row)); // Add data rows

    // Freeze the first row and make it bold
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 13 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Set specific column widths
    worksheet.getColumn(3).width = 12; // Vehicle No.
    worksheet.getColumn(4).width = 20; // Driver
    worksheet.getColumn(5).width = 10; // GBMS-NO
    worksheet.getColumn(10).width = 10; // Req-type
    worksheet.getColumn(15).width = 20; // Card Number
    worksheet.getColumn(16).width = 10; // Fuel Type
    worksheet.getColumn(19).width = 16; // Created At

    // Setting the width for the Serial Number column
    worksheet.getColumn(1).width = 10; // Serial Number

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, 'Fuel_Requests_Data.xlsx');
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Fuel_Requests_Data.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(
          'Your browser does not support downloading files. Please try another browser.',
        );
      }
    }
  };

  const handleFileSelect = (files) => {
    const file = files[0];
    setSelectedFile(file);
    setUploadedFileName(file.name);
    setFileUploaded(true);
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const data = new Uint8Array(arrayBuffer);
      const binaryString = String.fromCharCode.apply(null, data);

      const workbook = read(binaryString, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      console.log(jsonData);

      setIsModalVisible(false);
      setFileUploaded(false);
      setUploadedFileName('');
      setSelectedFile(null);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const exportFuelCardReport = async (data) => {
    // Check if data is available
    if (!data || data.length === 0) {
      console.error('No data available for export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fuel Data');

    // Define the title text
    const title = 'Fuel Card Tagging Report';

    // Set title - ensuring it's the first thing we do
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title; // Set the title value
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add an empty row to separate title and header
    worksheet.addRow([]);

    // Define columns
    const columns = [
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Card No', key: 'cardNo', width: 30 },
      { header: 'Vehicle', key: 'registrationNo', width: 20 },
      { header: 'Gasoline', key: 'fuelType', width: 15 },
    ];
    worksheet.columns = columns;

    // Add headers
    const headerRow = worksheet.addRow(columns.map((col) => col.header));
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'bold' },
        left: { style: 'bold' },
        bottom: { style: 'bold' },
        right: { style: 'bold' },
      };
    });

    // Sort and process data
    const sortedData = [...data].sort((a, b) =>
      a.station.localeCompare(b.station),
    );
    let currentStation = '';

    sortedData.forEach((item) => {
      if (item.station !== currentStation) {
        // Add a new row for the station name
        currentStation = item.station;
        const stationRow = worksheet.addRow([currentStation, '', '', '']); // Create a row for the station name
        stationRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        };
        stationRow.getCell(1).font = { bold: true };
        worksheet.mergeCells(`A${stationRow.number}:D${stationRow.number}`); // Merge the entire row
      }

      // Add data row for each item
      worksheet.addRow({
        region: item.region,
        cardNo: item.cardNo,
        registrationNo: item.registrationNo,
        fuelType: item.fuelType,
      });
    });

    // Apply borders and conditional formatting
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        // Skip title and header rows
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // Highlight rows based on the fuel type
        const fuelTypeCell = row.getCell(4);
        if (
          fuelTypeCell.value &&
          fuelTypeCell.value.toLowerCase() === 'petrol'
        ) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC000' },
            };
          });
        }
      }
    });

    // Adjust column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;

    // Write the workbook to a buffer and create a download link
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Fuel_Card_Tagging_Report.xlsx';
    link.click();
  };

  function calculateMileage(vehicleData) {
    const {
      currentOddometerReading,
      previousOddometerReading,
      quantityOfFuel,
    } = vehicleData;
    const currentOdo = parseFloat(currentOddometerReading);
    const previousOdo = parseFloat(previousOddometerReading);
    const distanceTraveled = currentOdo - previousOdo;
    const Value = Number(distanceTraveled) ? Number(distanceTraveled) : 0;
    return Value;
  }

  function calculateAverage(vehicleData) {
    const { currentOddometerReading, previousOddometerReading } = vehicleData;
    const currentOdo = parseFloat(currentOddometerReading);
    const previousOdo = parseFloat(previousOddometerReading);
    const distanceTraveled = currentOdo - previousOdo;
    const Value = Number(distanceTraveled) ? Number(distanceTraveled) : 0;
    return Value;
  }

  const exportDailyVehicleFuelingReport = async (data) => {
    if (!data || data.length === 0) {
      console.error('No data available for export.');
      return;
    }
    console.log('Data1=>', data);

    data = data
      .filter((item) => {
        if (startDate && endDate) {
          const createdAtDate = new Date(item.created_at);
          console.log('createdAtDate', formatDate(createdAtDate));
          return (
            formatDate(createdAtDate) >= formatDate(startDate) &&
            formatDate(createdAtDate) <= formatDate(endDate)
          );
        }
        return true;
      })
      .sort((a, b) => a.station.localeCompare(b.station));

    console.log('Data2=>', data);

    const filteredData = await filterData(data);

    if (filteredData.length === 0) {
      console.error('No data available for the selected date range.');
      alert('No data available for the selected date range.');
      return;
    }
    const wsTitle = 'Nando Title';
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(wsTitle);

    const columns = [
      { header: 'Sr.No', key: 'serialNo', width: 7 },
      { header: 'Region', key: 'station', width: 15 },
      { header: 'Vehicle', key: 'registrationNo', width: 15 },
      { header: 'Fuel Card PSO', key: 'fuelCardPSO', width: 20 },
      { header: 'Fuel Card APL', key: 'fuelCardAPL', width: 20 },
      { header: 'Date', key: 'created_at', width: 20 },
      { header: 'Expenditure In Ltr', key: 'amount', width: 20 },
      { header: 'Ltr', key: 'quantityOfFuel', width: 10 },
      { header: 'Price of Fuel', key: 'rateOfFuel', width: 13 },
      { header: 'Fuel Type,(Diesel-Petrol)', key: 'fuelType', width: 20 },
      { header: 'Payment Type', key: 'modeOfFueling', width: 20 },
      { header: 'Mode', key: 'modeOfFuelingCard', width: 13 },
      { header: 'PSO', key: 'PSOcardNo', width: 20 },
      { header: 'APL', key: 'APLcardNo', width: 20 },
      {
        header: 'Current Meter Reading',
        key: 'currentOddometerReading',
        width: 25,
      },
      {
        header: 'Previous Meter Reading',
        key: 'previousOddometerReading',
        width: 25,
      },
      { header: 'Mileage ', key: 'mileage', width: 20 },
      { header: 'Avg.', key: 'fuelAverage', width: 20 },
      { header: 'Category', key: 'category', width: 20 },
    ];

    worksheet.columns = columns;
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: '000000' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'BDD6EE' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    headerRow.border = {
      top: { style: 'thick', color: { argb: '000000' } },
      left: { style: 'thick', color: { argb: '000000' } },
      bottom: { style: 'thick', color: { argb: '000000' } },
      right: { style: 'thick', color: { argb: '000000' } },
    };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const formatDateCreated = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
    };

    filteredData?.forEach((item, index) => {
      const mileage =
        item.currentOddometerReading - item.previousOddometerReading;
      const fuelAverage = mileage / item.previousFuelQuantity;
      let category = '';
      if (fuelAverage >= 9) {
        category = 'A';
      } else if (fuelAverage < 9 && fuelAverage >= 7) {
        category = 'B';
      } else if (fuelAverage < 7) {
        category = 'C';
      } else {
        category = 'Meter Faulty';
      }

      const row = worksheet.addRow({
        serialNo: index + 1,
        station: item?.vehicle?.region,
        registrationNo: item?.registrationNo,
        fuelCardPSO: item?.vehicle?.fule_card_pos || '',
        fuelCardAPL: item?.vehicle?.fule_card_apl || '',
        created_at: formatDateCreated(item?.created_at),
        amount: item.amount ? Number(item.amount).toFixed(2) : 0,
        quantityOfFuel: item?.quantityOfFuel
          ? Number(item?.quantityOfFuel).toFixed(2)
          : 0,
        rateOfFuel: item.rateOfFuel ? Number(item.rateOfFuel).toFixed(2) : 0,
        fuelType: item?.fuelType,
        modeOfFueling:
          item.modeOfFueling === 'APL' || item.modeOfFueling === 'PSO'
            ? 'Card'
            : item.modeOfFueling,
        modeOfFuelingCard:
          item.modeOfFueling.toLowerCase() !== 'cash' &&
          item.modeOfFueling.toLowerCase() !== 'credit'
            ? item.modeOfFueling
            : '',
        PSOcardNo: item?.modeOfFueling === 'PSO' ? item.cardNo : '',
        APLcardNo: item.modeOfFueling === 'APL' ? item.cardNo : '',
        currentOddometerReading: item.currentOddometerReading
          ? item.currentOddometerReading
          : 'Meter Faulty',
        previousOddometerReading: item.previousOddometerReading
          ? item.previousOddometerReading
          : 'Meter Faulty',
        mileage:
          calculateMileage(item) !== 0 ? calculateMileage(item) : '#Value',
        fuelAverage:
          calculateAverage(item) !== 0 ? calculateAverage(item) : '#Value',
        category: category,
      });

      const categoryCell = row.getCell('category');
      if (category === 'A') {
        categoryCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          font: { bold: true },
          fgColor: { argb: '92D050' },
        };
      } else if (category === 'B') {
        categoryCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          font: { bold: true },
          fgColor: { argb: 'F4B083' },
        };
      } else if (category === 'C') {
        categoryCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          font: { bold: true },
          fgColor: { argb: 'FF0000' },
        };
      } else {
        categoryCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
        };
      }

      // Set colors based on mode
      const modeCell = row.getCell('modeOfFuelingCard');
      const psoCell = row.getCell('PSOcardNo');
      const aplCell = row.getCell('APLcardNo');

      if (item.modeOfFueling === 'PSO') {
        modeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' },
        };
        psoCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' },
        };
      } else if (item.modeOfFueling === 'APL') {
        modeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '5B9BD5' },
        };
        aplCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '5B9BD5' },
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Daily_Vehicle_Fueling_Report.xlsx';
    link.click();
  };

  const exportDailyOilComparisonReport = async (data) => {
    const formatDate = (date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };
    console.log('filteredData2 Oil=>', data);

    const filteredData2 = data.filter((obj) => {
      const createdAt = new Date(obj.created_at);
      if (
        formatDate(startDate) &&
        formatDate(createdAt) < formatDate(startDate)
      )
        return false;
      if (formatDate(endDate) && formatDate(createdAt) > formatDate(endDate))
        return false;
      return true;
    });

    const filteredData = await filterData(filteredData2);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Oil Comparison Report');

    const columns = [
      { header: 'Region', key: 'station', width: 20 },
      { header: 'Region Wise Total', key: 'total', width: 25 },
    ];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange = [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = formatDate(d);
      columns.push({ header: dateString, key: dateString, width: 15 });
      dateRange.push(dateString);
    }

    worksheet.columns = columns;

    const groupedData = {};
    filteredData.forEach((obj) => {
      const date = formatDate(obj.created_at);
      const key = obj.vehicle.region;
      if (!groupedData[key]) {
        groupedData[key] = { station: obj.vehicle.region, total: 0 };
        dateRange.forEach((date) => {
          groupedData[key][date] = 0;
        });
      }
      groupedData[key][date] += parseFloat(obj.quantityOfFuel);
      groupedData[key].total += parseFloat(obj.quantityOfFuel);
    });

    Object.keys(groupedData).forEach((key) => {
      const row = worksheet.addRow(groupedData[key]);
      // Apply border and font to each cell in the row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.font = {
          name: 'Arial', // Change this to your desired font family
          size: 12,
        };
      });
    });

    // Apply custom styling to the header row
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', bold: true, size: 12 }; // Change font family here
      if (colNumber === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // Yellow
        };
      } else if (colNumber === 2) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '92D050' }, // Green
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC0C0C0' }, // Light Gray
        };
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.addRow({});
    worksheet.addRow({});
    const columnSums = { station: 'Date Wise Total' };
    dateRange.forEach((date) => {
      let columnSum = 0;
      Object.keys(groupedData).forEach((key) => {
        columnSum += groupedData[key][date];
      });
      columnSums[date] = columnSum;
    });
    columnSums.total = Object.keys(groupedData).reduce(
      (sum, key) => sum + groupedData[key].total,
      0,
    );

    const totalRow = worksheet.addRow(columnSums);

    // Apply custom styling to the last row (totals)
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Arial', bold: true, size: 12 }; // Change font family here
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' }, // Yellow for the totals row
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Daily_Oil_Comparison_Report.xlsx';
    link.click();
  };

  const exportCategoryWiseAverage = async (data) => {
    try {
      if (!data || data.length === 0) {
        console.error('No data available for export.');
        return;
      }

      // Filter data based on dates
      data = data.filter((obj) => {
        const createdAt = new Date(obj.created_at);
        if (
          formatDate(startDate) &&
          formatDate(createdAt) < formatDate(startDate)
        )
          return false;
        if (formatDate(endDate) && formatDate(createdAt) > formatDate(endDate))
          return false;
        return true;
      });

      // Filter data further
      data = await filterData(data);
      console.log(data);

      // Group data
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.station]) {
          acc[item.station] = {
            station: item.station,
            totalMileage: 0,
            totalQuantityOfFuel: 0,
            totalPrevQuantityOfFuel: 0,
            nullDataCount: 0,
          };
        }

        const mileage =
          item.currentOddometerReading - item.previousOddometerReading;

        acc[item.station].totalMileage += mileage;
        acc[item.station].totalQuantityOfFuel += parseInt(
          item.quantityOfFuel,
          10,
        );

        const prevFuelQuantity = parseInt(item.previousFuelQuantity, 10);
        if (isNaN(prevFuelQuantity)) {
          acc[item.station].nullDataCount += 1;
        } else {
          acc[item.station].totalPrevQuantityOfFuel += prevFuelQuantity;
        }

        return acc;
      }, {});

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Category Wise Average');

      const columns = [
        { header: 'Sr#', key: 'serialNo', width: 10 },
        { header: 'Station Name', key: 'station', width: 30 },
        { header: 'Total Mileage', key: 'totalMileage', width: 30 },
        { header: 'Total Litres', key: 'totalQuantityOfFuel', width: 25 },
        { header: 'Average', key: 'averageFuelAverage', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
      ];

      worksheet.columns = columns;
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];

      // Function to apply border style to each cell in a row
      const applyBorderStyle = (row) => {
        if (!row) return; // Check if row is defined
        row.eachCell((cell) => {
          cell.font = { bold: true, size: 10 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      };

      // Apply border and style to the header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, size: 14 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C5E0B3' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thick' },
          bottom: { style: 'thick' },
          right: { style: 'thick' },
        };
      });

      // Add data rows and apply styles
      Object.values(groupedData).forEach((item, index) => {
        const averageFuelAverage =
          item.totalPrevQuantityOfFuel !== 0
            ? item.totalMileage / item.totalPrevQuantityOfFuel
            : 0;

        let category = '';
        let fillColor = '';

        if (averageFuelAverage < 7) {
          category = 'C';
          fillColor = '00B0F0';
        } else if (averageFuelAverage >= 7 && averageFuelAverage < 9) {
          category = 'B';
          fillColor = 'FFFF00';
        } else {
          category = 'A';
          fillColor = '92D050';
        }

        const row = worksheet.addRow({
          serialNo: index + 1,
          station: item.station,
          totalMileage: item.totalMileage || 0,
          totalQuantityOfFuel: item.totalQuantityOfFuel,
          averageFuelAverage: item.totalMileage / item.totalQuantityOfFuel,
          category: category,
        });

        row.getCell('category').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };

        // Apply border to each cell in the row
        applyBorderStyle(row);
      });

      // Add total row
      worksheet.addRow(['']).commit(); // Blank row before total
      const totalMileage = Object.values(groupedData).reduce(
        (sum, item) => sum + (item.totalMileage || 0),
        0,
      );
      const totalQuantity = Object.values(groupedData).reduce(
        (sum, item) => sum + (item.totalQuantityOfFuel || 0),
        0,
      );

      const totalRow = worksheet.addRow([
        '',
        'Total',
        totalMileage,
        totalQuantity,
        '',
        '',
      ]);

      // Apply border to the total row
      applyBorderStyle(totalRow);

      // Add blank rows for spacing
      worksheet.addRow(['']);
      worksheet.addRow(['']);
      worksheet.addRow(['']);
      worksheet.addRow(['']);
      worksheet.addRow(['']);
      worksheet.addRow(['']);

      // Add category descriptions
      worksheet.addRow(['', 'A', '9 and above 9+']);
      const rowA = worksheet.getRow(worksheet.lastRow.number);
      rowA.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '92D050' },
      };
      rowA.getCell(2).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };

      worksheet.addRow(['', 'B', 'Below 8']);
      const rowB = worksheet.getRow(worksheet.lastRow.number);
      rowB.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
      };
      rowB.getCell(2).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };

      worksheet.addRow(['', 'C', 'Below 5']);
      const rowC = worksheet.getRow(worksheet.lastRow.number);
      rowC.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '00B0F0' },
      };
      rowC.getCell(2).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'CategoryWiseAverage.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  // >>>>>>>>>>>>milges start <<<<<<<<<<<<<<<
  const exportMileageReport = async (data) => {
    console.log('Filter One ', makeFilter);
    filterData(data);
    console.log('Filter Two ', requestTypeFilter);
    if (!data || data.length === 0) {
      console.error('No data available for export.');
      return;
    }
    console.log('stationOptions2', stationFilter);
    data = data.filter((obj) => {
      const createdAt = new Date(obj.created_at);
      if (
        formatDate(startDate) &&
        formatDate(createdAt) < formatDate(startDate)
      )
        return false;
      if (formatDate(endDate) && formatDate(createdAt) > formatDate(endDate))
        return false;
      return true;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mileage Report');

    const columns = [
      { header: 'S.No', key: 'serialNo', width: 7 },
      { header: 'Req ID', key: 'id', width: 10 },
      { header: 'Card Number', key: 'cardNo', width: 20 },
      { header: 'Name on Card', key: 'registrationNo', width: 20 },
      { header: 'Type', key: 'modeOfFueling', width: 10 },
      { header: 'Fuel Qty', key: 'quantityOfFuel', width: 12 },
      { header: 'Mileage', key: 'mileage', width: 12 },
      { header: 'Average', key: 'fuelAverage', width: 12 },
      { header: 'Make', key: 'make', width: 12 },
      { header: 'Category', key: 'category', width: 10 },
    ];
    worksheet.columns = columns;
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.station]) {
        acc[item.station] = [];
      }
      acc[item.station].push(item);
      return acc;
    }, {});
    console.log('Mul=>', groupedData);
    Object.keys(groupedData).forEach((station) => {
      // console.log('Stattion1=>', stationFilter);

      if (station === stationFilter || stationFilter == 'All') {
        const stationData = groupedData[station];
        worksheet.addRow([]);
        worksheet.addRow([
          `Station: ${station === stationFilter ? station : station}`,
        ]).font = {
          bold: true,
          size: 15,
        };
        const headerRow = worksheet.addRow(columns.map((col) => col.header));
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' },
          };
          cell.font = { bold: true };
        });
        stationData.forEach((item, index) => {
          const mileage =
            item.currentOddometerReading - item.previousOddometerReading;
          const fuelAverage = mileage / item.previousFuelQuantity;
          let category = '';
          if (fuelAverage >= 9) {
            category = 'A';
          } else if (fuelAverage < 9 && fuelAverage >= 7) {
            category = 'B';
          } else if (fuelAverage < 7) {
            category = 'C';
          }
          const row = worksheet.addRow({
            serialNo: index + 1,
            id: item.id,
            cardNo: item.cardNo,
            registrationNo: item.registrationNo,
            modeOfFueling: item.modeOfFueling,
            quantityOfFuel: item.quantityOfFuel,
            mileage: mileage,
            fuelAverage: fuelAverage,
            make: item.make,
            category: category,
          });

          const categoryCell = row.getCell('category');
          if (category === 'A') {
            categoryCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF00FF00' },
            };
          } else if (category === 'B') {
            categoryCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0000FF' },
            };
          } else if (category === 'C') {
            categoryCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' },
            };
          }
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Mileage_Report.xlsx';
    link.click();
  };

  // >>>>>>>>>>>>milges end <<<<<<<<<<<<<<<

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const makeOptions = [
    { value: '', label: 'All' },
    ...Array.from(new Set(fuelData?.data.map((item) => item.make)))
      .filter((make) => make)
      .map((make) => ({ value: make, label: make })),
  ];

  const requestTypeOptions = [
    { value: '', label: 'All' },
    ...Array.from(new Set(fuelData?.data.map((item) => item.requestType)))
      .filter((requestType) => requestType)
      .map((requestType) => ({ value: requestType, label: requestType })),
  ];

  let statusRole =
    user?.Role?.roleName === 'companyAdmin' ||
    user?.Role?.roleName === 'Maintenance Admin';

  const filterData = (data) => {
    if (data) {
      if (requestIDFilter) {
        data = data.filter((item) => {
          return item.id && item.id.toString().includes(requestIDFilter);
        });
      }

      if (fuelTypeFilter) {
        data = data.filter((item) => {
          return (
            item.fuelType &&
            item.fuelType.toLowerCase().includes(fuelTypeFilter.toLowerCase())
          );
        });
      }

      if (makeFilter) {
        data = data.filter((item) => {
          return item.make && item.make.includes(makeFilter);
        });
      }

      if (requestTypeFilter) {
        data = data.filter((item) => {
          return (
            item.requestType && item.requestType.includes(requestTypeFilter)
          );
        });
      }
      if (stationFilter) {
        data = data.filter((item) => {
          return item.station && item.station.includes(stationFilter);
        });
      }
      if (statusFilterInitialState?.value) {
        data = data.filter((item) => {
          return (
            item.status &&
            item?.status?.includes(
              statusFilterInitialState?.value.toLowerCase(),
            )
          );
        });
      }
    }
    console.log('Filters Apply', data);
    return data;
  };
  

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Fuel Management" />
      <div className="flex justify-between mb-2">
        <div className="flex justify-between items-center">
          <div className="ml-7 mr-auto relative text-gray-600 w-90">
            <input
              className="rounded-full border border-slate-300 bg-white h-12 px-5 pr-16 text-md focus:outline-none focus:border-slate-400 w-full dark:border-slate-600 dark:bg-boxdark dark:text-slate-300 dark:focus:border-slate-400"
              type="text"
              name="search"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="ml-7 flex justify-between">
          <div className="flex items-end gap-2">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="bg-primary  btn h-[30px] min-h-[30px] text-sm border-slate-200 hover:bg-opacity-70  text-white  transition duration-150 ease-in-out rounded-md"
              >
                Export
                <MdDownload />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-white text-black rounded-box w-52 border border-slate-200     "
              >
                <li>
                  <button
                    className="flex justify-between items-center"
                    onClick={() => exportPDF(sortedData)}
                  >
                    Export as PDF
                    <FaFileExport />
                  </button>
                </li>
                <li>
                  <button
                    className="flex justify-between items-center"
                    onClick={() => exportToCsv(sortedData)}
                  >
                    Export as CSV
                    <FaFileExport />
                  </button>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setIsReportsModalVisible(true)}
              className="bg-primary text-white  btn h-[30px] min-h-[30px] text-sm border-slate-200 hover:bg-opacity-70 dark:text-white dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md"
            >
              Reports
            </button>
            <Link
              to="fuel-dashboard"
              className=" bg-primary text-white  btn h-[30px] min-h-[30px] text-sm border-slate-200 hover:bg-opacity-70 dark:text-white dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-opacity-70 transition duration-150 ease-in-out rounded-md"
            >
              <span>
                <FaChartSimple />
              </span>
              Dashboard
            </Link>
            {user?.Role?.roleName === 'regionalAdmin' && (
              <Link
                to="form"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary mx-2 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:mx-2 lg:px-4"
              >
                <span>
                  <IoMdAddCircle />
                </span>
                Request Fuel
              </Link>
            )}
          </div>
        </div>
      </div>
      <FuelApprovalTable
        setSortedDataIndex={setSortedData}
        searchTerm={searchTerm}
        statusFilter={status?.value}
      />
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-xl z-10 w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Import Excel File</h2>
              <button
                onClick={() => setIsModalVisible(false)}
                className="text-gray-600 hover:text-primary text-xl mr-1"
              >
                &times;
              </button>
            </div>
            <label
              htmlFor="fileInput"
              className="h-50 w-full border border-dashed border-gray-400 rounded-md p-10 text-center cursor-pointer flex flex-col justify-center items-center"
            >
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              {fileUploaded ? (
                <SiMicrosoftexcel className="h-15 w-15 text-green-700" />
              ) : (
                <div className="flex justify-center items-center">
                  <MdOutlineCloudUpload className="h-15 w-15" />
                </div>
              )}
              <br />
              {fileUploaded ? (
                <span>{uploadedFileName}</span>
              ) : (
                <span>Click here to upload Excel file</span>
              )}
            </label>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalVisible(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {isReportsModalVisible &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-9999 ">
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6 relative max-w-[1600px] m-10">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setIsReportsModalVisible(false);
                  setStartDate(null);
                  setEndDate(null);
                  setRequestIDFilter(null);
                  setStatusFilterInitialState(null);
                  setFuelTypeFilter(null);
                  setMakeFilter(null);
                  setRequestTypeFilter(null);
                  setStationFilter(null);
                }}
              >
                ✕
              </button>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                Reports
              </h2>
              <div className="mb-4 flex space-x-4">
                <div className="flex flex-wrap gap-5 justify-start items-center  ">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300">
                      From:
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="mt-1 block w-full px-3 py-2   rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary  bg-white text-black border border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300">
                      To:
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      className="mt-1 block w-full px-3 py-2   rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary  bg-white text-black border border-black"
                    />
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Request ID:
                    </label>
                    <input
                      type="text"
                      className="p-2 border rounded w-full bg-white"
                      placeholder="Enter Request ID"
                      value={requestIDFilter || ''}
                      onChange={(e) =>
                        setRequestIDFilter(e.target.value || null)
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Status:
                    </label>
                    <Select
                      options={statusOptions}
                      value={statusFilterInitialState}
                      onChange={(selectedOption) => {
                        setStatusFilterInitialState(selectedOption);
                      }}
                      className="ml-1 border rounded w-full"
                      placeholder="Status"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Fuel Type:
                    </label>
                    <Select
                      options={fuelTypeOptions}
                      onChange={(selectedOption) =>
                        setFuelTypeFilter(selectedOption.value || null)
                      }
                      className="ml-1 border rounded"
                      placeholder="Fuel Type"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Make:
                    </label>
                    <Select
                      options={makeOptions}
                      onChange={(selectedOption) =>
                        setMakeFilter(selectedOption.value || null)
                      }
                      className="ml-1 border rounded"
                      placeholder="Make"
                    />
                  </div>
                  <div className=" last:relative text-gray-600 w-90">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Request Type:
                    </label>
                    <Select
                      options={requestTypeOptions}
                      onChange={(selectedOption) =>
                        setRequestTypeFilter(selectedOption.value || null)
                      }
                      className="ml-1 border rounded"
                      placeholder="Request Type"
                    />
                  </div>

                  {statusRole && (
                    <div className="  relative text-gray-600 w-90">
                      <label className="block text-gray-700 dark:text-gray-300">
                        Station:
                      </label>
                      <Select
                        options={stationOptions2}
                        onChange={(selectedOption) => {
                          setStationFilter(selectedOption.value || null);
                        }}
                        className="ml-1 border rounded"
                        placeholder="Station"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-start space-x-2">
                <button
                  onClick={() => exportFuelCardReport(fuelData.data)}
                  className="mt-5 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
                >
                  Fuel Card Tagging Report
                  <SiMicrosoftexcel className="ml-2" />
                </button>
                <button
                  onClick={() => exportDailyVehicleFuelingReport(fuelData.data)}
                  className="mt-5 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
                >
                  Daily Vehicle Fueling Report
                  <SiMicrosoftexcel className="ml-2" />
                </button>
                <button
                  onClick={() => exportDailyOilComparisonReport(fuelData.data)}
                  className="mt-5 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
                >
                  Daily Oil Comparison Report
                  <SiMicrosoftexcel className="ml-2" />
                </button>
                <button
                  onClick={() => exportMileageReport(fuelData.data)}
                  className="mt-5 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
                >
                  Mileage Report
                  <SiMicrosoftexcel className="ml-2" />
                </button>
                <button
                  onClick={() => exportCategoryWiseAverage(fuelData.data)}
                  className="mt-5 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
                >
                  Category Wise Average
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </DefaultLayout>
  );
};

export default FuelManagement;
