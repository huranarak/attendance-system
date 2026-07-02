// =========================================
// Smart Attendance System
// script.js
// =========================================

// ===============================
// URL ของ Google Apps Script
// (จะใส่ภายหลัง)
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycby2KS5VWIirZzhmp5ZxACHPFDwsj2yGcgF1Yj8ecFzd1kUNpAgI_xAzBdzYQGNcEqlI/exec";

// ===============================
// ตัวแปร
// ===============================
let classroom = {};
let currentLat = null;
let currentLng = null;

// ===============================
// โหลดค่าการตั้งค่าจาก Google Sheets
// ===============================
async function loadSettings() {

    try {

        const response = await fetch(API_URL + "?action=settings");

        classroom = await response.json();

        console.log(classroom);

    } catch (error) {

        console.log("ยังไม่ได้เชื่อม Google Apps Script");

    }

}

// ===============================
// อ่านตำแหน่ง GPS
// ===============================
function getLocation() {

    if (!navigator.geolocation) {

        document.getElementById("gpsStatus").innerHTML =
            "❌ อุปกรณ์ไม่รองรับ GPS";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;

            document.getElementById("gpsStatus").innerHTML =
                "🟢 พร้อมใช้งาน";

        },

        function () {

            document.getElementById("gpsStatus").innerHTML =
                "🔴 กรุณาเปิด GPS";

        }

    );

}

// ===============================
// จัดรูปแบบรหัสนักศึกษา
// ===============================
const studentInput = document.getElementById("studentID");

if (studentInput) {

    studentInput.addEventListener("input", function () {

        let value = this.value.replace(/\D/g, "");

        value = value.substring(0, 10);

        if (value.length > 9) {

            value = value.substring(0, 9) + "-" + value.substring(9);

        }

        this.value = value;

    });

}

// ===============================
// คำนวณระยะทาง
// ===============================
function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

}

// ===============================
// เช็คชื่อ
// ===============================
async function saveAttendance() {

    const fullname =
        document.getElementById("fullname").value.trim();

    const studentID =
        document.getElementById("studentID").value.trim();

    const major =
        document.getElementById("major").value;

    if (fullname === "") {

        alert("กรุณากรอกชื่อ-นามสกุล");
        return;

    }

    if (studentID === "") {

        alert("กรุณากรอกรหัสนักศึกษา");
        return;

    }

    if (major === "") {

        alert("กรุณาเลือกสาขา");
        return;

    }

    if (currentLat == null) {

        alert("กรุณาเปิด GPS");

        return;

    }

    // ยังไม่เชื่อม API
    if (!classroom.lat) {

        alert("ยังไม่ได้เชื่อม Google Sheets");

        return;

    }

    const distance = getDistance(

        currentLat,
        currentLng,

        Number(classroom.latitude),
        Number(classroom.longitude)

    );

    if (distance > Number(classroom.radius)) {

        alert(

            "❌ อยู่นอกพื้นที่\n\nระยะห่าง " +

            distance.toFixed(2) +

            " เมตร"

        );

        return;

    }

    alert(

        "✅ อยู่ในพื้นที่\n\nระยะห่าง " +

        distance.toFixed(2) +

        " เมตร"

    );

    // -----------------------------
    // ขั้นต่อไป
    // ส่งข้อมูลเข้า Google Sheets
    // -----------------------------

}

// ===============================
// เริ่มทำงาน
// ===============================
loadSettings();

getLocation();
