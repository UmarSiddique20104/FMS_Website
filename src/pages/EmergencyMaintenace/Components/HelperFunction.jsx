import DetailItem from "./DetailsField";

// Utility function to format date and time
export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `Date: ${date.toLocaleDateString()}, Time: ${date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    )}`;
  };
  
  // Utility function to get background color based on service type
  export  const getBackgroundColor = (serviceType) => {
    switch (serviceType) {
      case 'Repair':
        return '#f0f8ff';
      case 'Maintenance':
        return '#f5fffa';
      case 'Inspection':
        return '#fffacd';
      default:
        return '#f0f4f7';
    }
  };
  
   
  
  // Reusable component for media items (images/videos)
 export const MediaItem = ({ items, label, isVideo = false }) => (
    <div>
      <p className="text-md font-semibold py-5">{label}:</p>
      <div className="flex flex-wrap gap-5">
      {items.length > 0 ? (
        items.map((item, index) => (
          <a href={item} target="_blank" rel="noopener noreferrer" key={index}>
            {isVideo ? (
              <video
                className="w-48 h-48 object-contain mb-4"
                controls
                src={item}
              />
            ) : (
              <img
                className="w-48 h-48 object-contain mb-4"
                src={item}
                alt={label}
              />
            )}
          </a>
        ))
      ) : (
        <p className="text-md font-normal">No {label.toLowerCase()} found.</p>
      )}
     

      </div>
    </div>
  );
  export const InsuranceDetail = ({ insuranceData }) => (
    <>
      <DetailItem label="Surveyor Name" value={insuranceData?.surveyorName} />
      <DetailItem label="Surveyor Number" value={insuranceData?.surveyorNumber} />
      <DetailItem label="Surveyor Remarks" value={insuranceData?.remarks} />
    </>
  );