// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

// export default api;



import axios from "axios";

const getBaseURL = () => {
const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
const port = process.env.NEXT_PUBLIC_API_PORT || "5000";

if (typeof window === "undefined") {
return `${protocol}://localhost:${port}/api`;
}

let host = window.location.hostname;

// remove brackets safely
host = host.replace(/^[|]$/g, "");

if (host === "localhost" || host === "127.0.0.1") {
return `${protocol}://localhost:${port}/api`;
}

const isIPv6 = /^[0-9a-fA-F:]+$/.test(host);

if (isIPv6) {
return `${protocol}://[${host}]:${port}/api`;
}

return `${protocol}://${host}:${port}/api`;
};

const api = axios.create({
baseURL: getBaseURL(),
withCredentials: true, // 🔥 REQUIRED FOR COOKIES
});

export default api;

