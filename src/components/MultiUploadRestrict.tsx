import { useState } from 'react';
import CloudinaryUploadWidgetMultiple from './CloudinaryUploadWidgetMultiple';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';

export default function MultipleUploadWidget2({ setImgUrls, id,type }) {
 
  const [cloudName] = useState('hzxyensd5');
  const [uploadPreset] = useState('aoh4fpwm');
   
  const [uwConfig] = useState({
    cloudName,
    uploadPreset,
    showAdvancedOptions: true,
    sources: ['local', 'url'],
    multiple: true,  
    maxImageWidth: 2000,
    theme: 'blue',
    clientAllowedFormats: [type],  
  });

  const cld = new Cloudinary({ cloud: { cloudName } });

  return (
    <div className="App">
      <CloudinaryUploadWidgetMultiple
        uwConfig={uwConfig}
        setImgUrls={setImgUrls}
        id={id}
      />
    </div>
  );
}
