import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type userProp = {
    id: string
    first_name: string,
    last_name: string,
    email: string,

    isAuthenticated: boolean,
    accessToken: string,
    refreshToken: string

    updateAccessToken: (newAccessToken: string) => void
    setUser: (
        id: string,
        first_name: string,
        last_name: string,
        email: string,
        accessToken: string,
        refreshToken: string,
    ) => void
    setNullUser: () => void
}

const useUserStore = create<userProp>()(
    persist(
        (set) => ({
            id: '',
            first_name: '',
            last_name: '',
            email: '',
            // Removed password field as it's not in the type
            isAuthenticated: false,
            accessToken: '',
            refreshToken: '',

            updateAccessToken: (newAccessToken) =>
                set(
                    { accessToken: newAccessToken }
                ),

            setUser: (id, first_name, last_name, email, accessToken, refreshToken) =>
                set(
                    {
                        id, first_name, last_name, email, isAuthenticated: true, accessToken, refreshToken
                    }
                ),
            setNullUser: () =>
                set(
                    {
                       id: '', first_name: '', last_name: '', email: '',
                        isAuthenticated: false, accessToken: '', refreshToken: ''
                    }
                ),

        }),
        {
            name: 'user-storage'
        }
    )
)

export default useUserStore