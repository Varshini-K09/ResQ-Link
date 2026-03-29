// // import { useEffect } from "react";

// // export default function Track() {
// //   useEffect(() => {
// //     window.location.replace("http://localhost:5050"); // forces navigation
// //   }, []);

// //   return <div>Redirecting to map...</div>;
// // }


// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import { useLocation } from "react-router-dom";

// export default function Track() {
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   const role = params.get("role") || "victim"; // default victim
//   const appId = params.get("id") || null;

//   const [socket, setSocket] = useState(null);
//   const [victimInfo, setVictimInfo] = useState(null);
//   const [showDriverInfo, setShowDriverInfo] = useState(false);

//   const mapFrameRef = useRef();

//   useEffect(() => {
//     const s = io("http://localhost:5050");
//     setSocket(s);

//     // register role & id
//     s.emit("register-role", { role, id: appId });

//     if (role === "victim") {
//       // watch geolocation and send to server
//       if (navigator.geolocation) {
//         const watchId = navigator.geolocation.watchPosition(
//           (pos) => {
//             const latitude = pos.coords.latitude;
//             const longitude = pos.coords.longitude;

//             s.emit("send-location", { victimId: appId, latitude, longitude });
//           },
//           (err) => console.error("Geolocation error:", err),
//           { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
//         );

//         return () => navigator.geolocation.clearWatch(watchId);
//       } else alert("Geolocation not supported in your browser");
//     }

//     if (role === "driver") {
//       // listen for victim location updates
//       s.on("victim-location", (data) => {
//         setVictimInfo(data);
//       });
//     }

//     return () => {
//       s.disconnect();
//     };
//   }, [role, appId]);

//   return (
//     <div
//       style={{
//         width: "100vw",
//         height: "100vh",
//         margin: 0,
//         padding: 0,
//         overflow: "hidden",
//         position: "relative",
//       }}
//     >
//       {/* Full-screen map */}
//       <iframe
//         ref={mapFrameRef}
//         src="http://localhost:5050"
//         title="Live Map"
//         allow="geolocation"
//         style={{ width: "100%", height: "100%", border: "none" }}
//       />

//       {/* --- Victim UI --- */}
//       {role === "victim" && !showDriverInfo && (
//         <button
//           onClick={() => setShowDriverInfo(true)}
//           style={{
//             position: "absolute",
//             bottom: "30px",
//             right: "30px",
//             padding: "12px 25px",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "10px",
//             cursor: "pointer",
//             fontSize: "16px",
//             boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
//           }}
//         >
//           Drivers
//         </button>
//       )}

//       {role === "victim" && showDriverInfo && (
//         <div
//           style={{
//             position: "absolute",
//             top: "0",
//             left: "0",
//             width: "100%",
//             height: "100%",
//             background: "#f0f4f8",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             textAlign: "center",
//             zIndex: 10,
//           }}
//         >
//           <h2>Victim Tracking Active</h2>
//           <p>Your live address will be visible to the driver soon.</p>
//           <button
//             onClick={() => setShowDriverInfo(false)}
//             style={{
//               marginTop: "20px",
//               padding: "12px 25px",
//               backgroundColor: "#28a745",
//               color: "white",
//               border: "none",
//               borderRadius: "10px",
//               cursor: "pointer",
//               fontSize: "16px",
//               boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
//             }}
//           >
//             Back to Map
//           </button>
//         </div>
//       )}

//       {/* --- Driver UI --- */}
//       {role === "driver" && (
//         <div
//           style={{
//             position: "absolute",
//             top: "16px",
//             right: "16px",
//             width: 320,
//             background: "rgba(255,255,255,0.95)",
//             padding: 12,
//             borderRadius: 10,
//             boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
//             zIndex: 10,
//           }}
//         >
//           <h4 style={{ margin: 0 }}>Driver Panel</h4>
//           {victimInfo ? (
//             <>
//               <p style={{ margin: "8px 0 4px 0" }}>
//                 <strong>Victim:</strong> {victimInfo.victimId}
//               </p>
//               <p style={{ margin: "4px 0" }}>
//                 <strong>Address:</strong> {victimInfo.address || "Unknown"}
//               </p>
//               <p style={{ margin: "4px 0", fontSize: 12, color: "#555" }}>
//                 Lat: {victimInfo.latitude}, Lon: {victimInfo.longitude}
//               </p>
//             </>
//           ) : (
//             <p>Waiting for victim location...</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

export default function Track() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "victim"; // default victim
  const appId = params.get("id") || null;

  const [socket, setSocket] = useState(null);
  const [victimInfo, setVictimInfo] = useState(null);
  const [victimCount, setVictimCount] = useState(0);
  const [showDriverInfo, setShowDriverInfo] = useState(false);

  const mapFrameRef = useRef();

  useEffect(() => {
    const s = io("http://localhost:5050");
    setSocket(s);

    // Register role & ID
    s.emit("register-role", { role, id: appId });

    if (role === "victim") {
      // Watch geolocation and send to server
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;

            s.emit("send-location", { victimId: appId, latitude, longitude });
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } else alert("Geolocation not supported in your browser");
    }

    if (role === "driver") {
      // Listen for victim location updates
      s.on("victim-location", (data) => {
        setVictimInfo(data);
      });

      // Listen for total victims count
      s.on("victim-count", (count) => {
        setVictimCount(count);
      });
    }

    return () => {
      s.disconnect();
    };
  }, [role, appId]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Full-screen map */}
      <iframe
        ref={mapFrameRef}
        src="http://localhost:5050"
        title="Live Map"
        allow="geolocation"
        style={{ width: "100%", height: "100%", border: "none" }}
      />

      {/* --- Victim UI --- */}
      {role === "victim" && !showDriverInfo && (
        <button
          onClick={() => setShowDriverInfo(true)}
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            padding: "12px 25px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          Drivers
        </button>
      )}

      {role === "victim" && showDriverInfo && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "#f0f4f8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <h2>Victim Tracking Active</h2>
          <p>Your live address will be visible to the driver soon.</p>
          <button
            onClick={() => setShowDriverInfo(false)}
            style={{
              marginTop: "20px",
              padding: "12px 25px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            Back to Map
          </button>
        </div>
      )}

      {/* --- Driver UI --- */}
      {role === "driver" && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: 320,
            background: "rgba(255,255,255,0.95)",
            padding: 12,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          <h4 style={{ margin: 0 }}>Driver Panel</h4>
          <p>
            <strong>Victims Logged In:</strong> {victimCount}
          </p>

          {victimInfo ? (
            <>
              <p style={{ margin: "8px 0 4px 0" }}>
                <strong>Victim ID:</strong> {victimInfo.victimId}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Phone:</strong> {victimInfo.phone || "Unknown"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Address:</strong> {victimInfo.address || "Unknown"}
              </p>
              <p style={{ margin: "4px 0", fontSize: 12, color: "#555" }}>
                Lat: {victimInfo.latitude}, Lon: {victimInfo.longitude}
              </p>
            </>
          ) : (
            <p>Waiting for victim location...</p>
          )}
        </div>
      )}
    </div>
  );
}
