import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
//@ts-ignore
const socket = io(import.meta.env.VITE_BASE_URL);
export default function NotificationIcon() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    notificationCount: 0,
    allNotifications: [],
  });
  const dropdownRef = useRef(null);
  //@ts-ignore
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    socket.emit('addUser', user.id);
    socket.emit('notifications', { userId: user.id });
  }, [user]);

  useEffect(() => {
    socket.on('getNotifications', (data) => {
      setNotifications(data);
    });
  }, [socket]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleNotificationClick = async (notification) => {
    console.log(notification);
    socket.emit(
      'updateNotificationStatus',
      {
        notificationId: notification.id,
        isRead: true,
      },
      (response) => {
        if (response.success) {
          socket.emit('notifications', { userId: user.id });
        } else {
          console.error(response.message);
        }
      },
    );

    if (notification.title == 'Daily Maintenance') {
      navigate('/daily-maintenance/view', {
        state: {
          registrationNo: notification.details.registrationNo,
          id: notification.details.requestId,
        },
      });
    } else if (notification.title == 'Periodic Maintenance') {
      // @ts-ignore
      const BASE_URL = import.meta.env.VITE_BASE_URL;

      const response = await fetch(
        `${BASE_URL}/api/v1/periodic/${notification.details.requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      const data = result.data;
      navigate(notification.details.path, {
        state: {
          data,
        },
      });
    } else {
      navigate(notification.details.path);
    }

    setIsOpen(false);
  };

  const getLabelStyle = (title) => {
    switch (title?.toLowerCase()) {
      case 'emergency maintenance':
        return 'bg-[#DA1E28]';
      case 'daily maintenance':
      case 'periodic maintenance':
        return 'bg-[#FF832B]';
      case 'fueling':
        return 'bg-[#288FEB]';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'rejected':
        return 'text-[#DA1E28]';
      case 'approved':
        return 'text-[#24A148]';
      case 'pending':
        return 'text-[#FF9900]';
      default:
        return 'text-gray-500';
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    // @ts-ignore
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  console.log(notifications);

  return (
    <div className="flex items-center gap-3 2xsm:gap-7">
      <div
        ref={dropdownRef}
        className="relative cursor-pointer"
        onClick={toggleDropdown}
      >
        <svg
          className="w-8 h-8 text-black animate-wiggle"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 21 21"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.585 15.5H5.415A1.65 1.65 0 0 1 4 13a10.526 10.526 0 0 0 1.5-5.415V6.5a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.085c0 1.907.518 3.78 1.5 5.415a1.65 1.65 0 0 1-1.415 2.5zm1.915-11c-.267-.934-.6-1.6-1-2s-1.066-.733-2-1m-10.912 3c.209-.934.512-1.6.912-2s1.096-.733 2.088-1M13 17c-.667 1-1.5 1.5-2.5 1.5S8.667 18 8 17"
          />
        </svg>
        <div className="px-1 bg-red-600 rounded-full text-center text-white text-sm absolute -top-3 -end-2">
        {notifications?.notificationCount > 99 ? '99+' : notifications?.notificationCount}

          <div className="absolute top-0 start-0 rounded-full -z-10 animate-ping bg-red-600 w-full h-full"></div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-100 max-h-[400px] overflow-auto bg-slate-50 rounded-md shadow-xl">
            {notifications?.allNotifications.length === 0 ? (
              <div className="text-center text-gray-500 py-2">
                No notifications
              </div>
            ) : (
              <div className="max-w-lg mx-auto px-2.5">
                {notifications?.allNotifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-2.5 justify-between items-start p-5 mb-[14px] ${notification.isRead ? 'bg-slate-200' : 'bg-white'}  shadow-md rounded-md`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between w-full">
                      <div
                        className={`px-2.5 py-1 rounded-lg text-sm font-semibold text-white ${getLabelStyle(notification.title)}`}
                      >
                        {notification.title == 'Emergency Maintenance'
                          ? 'E. Maintenance'
                          : notification.title}
                      </div>
                      <div
                        className={`text-sm font-bold capitalize ${getStatusStyle(notification?.details?.status)}`}
                      >
                        {notification?.details?.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm flex flex-col items-start gap-[10px]">
                        <p className="text-gray-700 text-start text-sm ">
                          {notification.message}
                        </p>
                        <p className="text-[#6F8EBB] text-xs">
                          {timeAgo(notification?.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}