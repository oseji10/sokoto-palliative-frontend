// import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// import Cookies from 'js-cookie'

// type Props = {
//   description?: string;
//   children: JSX.Element | JSX.Element[];
//   title?: string;
// };

// const PageContainer = ({ title, description, children }: Props) => {
//   const router = useRouter();
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string>('');
//   const [name, setName] = useState<string>('');

//   useEffect(() => {
//     const authToken = Cookies.get('authToken');
//     if (!authToken || authToken === 'null' || authToken === 'undefined') {
//       router.push('/'); // Redirect if not authenticated
//     } else {
//       setToken(authToken);
//       setRole(Cookies.get('role') || '');
//       setName(Cookies.get('name') || '');
//     }
//   }, [router]);

//   return (
//     <HelmetProvider>
//       <div>
//         <Helmet>
//           <title>{title}</title>
//           <meta name="description" content={description} />
//         </Helmet>
//         {children}
//       </div>
//     </HelmetProvider>
//   );
// };

// export default PageContainer;
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';

type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const [name, setName] = useState<string>('');

  const refreshToken = async () => {
    try {
      await api.post('/refresh', {}, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      router.push('/');
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get(`/user`, { withCredentials: true });
        setIsAuthenticated(true);
        setRole(response.data.role || '');
        setName(response.data.firstName || '');
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && error.config && !error.config.__isRetryRequest) {
          error.config.__isRetryRequest = true;
          const refreshed = await refreshToken();
          if (refreshed) {
            return api(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [router]);

  if (!isAuthenticated) {
    return null; // Prevent rendering until auth is checked
  }

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Helmet>
        {children}
      </div>
    </HelmetProvider>
  );
};

export default PageContainer;