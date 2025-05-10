
  import React from 'react' 
  
  const DetailItem = ({ label, value }) => (
    <div>
      <p className="text-md font-semibold">{label}:</p>
      <p className="text-md mb-5 font-normal">{value}</p>
    </div>
  );
  
  export default DetailItem