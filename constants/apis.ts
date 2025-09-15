import useUserStore from "@/store/userStore";
import axios from "axios";

export const baseInstance = axios.create({
    baseURL: 'http://localhost:8000'
});

// Request interceptor with debugging
baseInstance.interceptors.request.use(
    (config) => {
        const accessToken = useUserStore.getState().accessToken;
        console.log('Request interceptor - Access token:', accessToken ? 'Present' : 'Missing');
        
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with enhanced debugging
baseInstance.interceptors.response.use(
    response => {
        console.log('Response success:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        console.log('Response error:', {
            status: error.response?.status,
            url: originalRequest?.url,
            retry: originalRequest?._retry
        });
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Attempting token refresh...');
            originalRequest._retry = true;
            
            const { refreshToken, accessToken } = useUserStore.getState();
            console.log('Current tokens:', {
                hasRefreshToken: !!refreshToken,
                hasAccessToken: !!accessToken
            });
            
            if (refreshToken) {
                try {
                    console.log('Making refresh request...');
                    const response = await axios.post(
                        'http://localhost:8000/users/auth/refresh', 
                        { token: refreshToken },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    console.log('Refresh response:', response.status);
                    const newAccessToken = response.data.access_token;
                    
                    if (newAccessToken) {
                        console.log('New access token received, updating store...');
                        useUserStore.getState().updateAccessToken(newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        
                        console.log('Retrying original request...');
                        return baseInstance(originalRequest);
                    } else {
                        console.error('No access token in refresh response');
                        throw new Error('No access token received');
                    }
                    
                } catch (refreshError: any) {
                    console.error('Token refresh failed:', refreshError.response?.status, refreshError.message);
                    console.log('Clearing user data...');
                    useUserStore.getState().setNullUser();
                    
                    // Optional: redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/';
                    }
                    
                    return Promise.reject(refreshError);
                }
            } else {
                console.log('No refresh token available, clearing user data...');
                useUserStore.getState().setNullUser();
                
                // Optional: redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default baseInstance;