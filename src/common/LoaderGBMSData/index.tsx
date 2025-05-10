const LoaderGBMSData = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-700 font-semibold">
        Syncing data with GBMS. This might take a while, please wait...
      </p>
    </div>
  );
};

export default LoaderGBMSData;
