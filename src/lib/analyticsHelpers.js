export const detectDeviceInfo = () => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const isMobile = /mobile|iphone|ipad|android|tablet/i.test(ua);
  const deviceType = isMobile ? "Mobile" : "Desktop";

  const deviceOs = /windows/i.test(ua)
    ? "Windows"
    : /mac os x/i.test(ua)
      ? "MacOS"
      : /android/i.test(ua)
        ? "Android"
        : /iphone|ipad|ipod/i.test(ua)
          ? "iOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown";

  const deviceBrowser = /chrome/i.test(ua)
    ? "Chrome"
    : /safari/i.test(ua) && !/chrome/i.test(ua)
      ? "Safari"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /edg/i.test(ua)
          ? "Edge"
          : /opr|opera/i.test(ua)
            ? "Opera"
            : "Other";

  return {
    device_type: deviceType,
    device_os: deviceOs,
    device_browser: deviceBrowser,
  };
};

export const getUtmParams = () => {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
  };
};

export const getReferrer = () => {
  if (typeof document === "undefined") return null;

  try {
    const ref = document.referrer;
    if (!ref) return null;
    const refUrl = new URL(ref);
    return refUrl.hostname !== window.location.hostname
      ? refUrl.hostname
      : null;
  } catch {
    return null;
  }
};

export const fetchLocation = async () => {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;
    const data = await response.json();
    return (
      [data.city, data.region, data.country_name].filter(Boolean).join(", ") ||
      null
    );
  } catch (error) {
    console.error("Analytics location lookup failed:", error);
    return null;
  }
};

export const buildAnalyticsPayload = async () => {
  const location = await fetchLocation();
  return {
    referrer: getReferrer(),
    location,
    ...detectDeviceInfo(),
    ...getUtmParams(),
  };
};
