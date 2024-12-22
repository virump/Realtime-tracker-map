const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position)=> {
        const{ latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        socket.emit("send-location", { latitude, longitude });
        map.setView([latitude, longitude], 16);
    },
    (error) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                break;
            default:
                console.error("An unknown error occurred.");
                break;
        }
    },
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {};

socket.on("receive-location", (data)=> {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id)=> {
    if (markers[id]) {
        map.removelayer(markers[id]);
        delete markers[id];
    }
});


