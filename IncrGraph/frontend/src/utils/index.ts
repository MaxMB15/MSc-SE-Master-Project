import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, Method } from "axios";
import Cookies from "js-cookie";

const apiURL = import.meta.env.VITE_API_URL;

interface UseAxiosRequestOptions<T> {
    method: Method;
    route: string;
    data?: T;
    headers?: { [key: string]: string };
    useJWT?: boolean;
}

export const useAxiosRequest = <TRequest, TResponse>() => {
    const [response, setResponse] = useState<TResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const combineUrl = (baseURL: string, route: string): string => {
        if (baseURL.endsWith("/")) {
            baseURL = baseURL.slice(0, -1);
        }
        return `${baseURL}${route.startsWith("/") ? "" : "/"}${route}`;
    };

    const sendRequest = useCallback(
        async (options: UseAxiosRequestOptions<TRequest>) => {
            setLoading(true);

            const config: AxiosRequestConfig<TRequest> = {
                method: options.method,
                url: combineUrl(apiURL, options.route),
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    ...(options.useJWT && {
                        Authorization: `JWT ${Cookies.get("token_access")}`
                    }),
                    ...options.headers
                },
                ...(options.method !== "GET" && { data: options.data })
            };

            try {
                const result = await axios.request<TResponse>(config);
                setResponse(result.data);
            } catch (error) {
                let errorMessage: string = "An unknown error occurred"; // Default error message
                if (axios.isAxiosError(error)) {
                    // Now we can safely extract error information
                    if (
                        error.response &&
                        error.response.data &&
                        typeof error.response.data.message === "string"
                    ) {
                        // Use the error message from the response if available and is a string
                        errorMessage = error.response.data.message;
                    } else if (typeof error.message === "string") {
                        // Fallback to Axios error message
                        errorMessage = error.message;
                    }
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { response, error, loading, sendRequest, setResponse };
};
export const isLoggedIn = () => {
    return true;
};

