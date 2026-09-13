document.addEventListener("DOMContentLoaded", function () {
    // 1. Ambil Elemen DOM
    const timeDisplay = document.getElementById("timeDisplay");
    const phaseBadge = document.getElementById("phaseBadge");
    const instructionText = document.getElementById("instructionText");
    const progressCircle = document.getElementById("progressCircle");

    const btnStart = document.getElementById("btnStart");
    const btnPause = document.getElementById("btnPause");
    const btnReset = document.getElementById("btnReset");

    const workDurationInput = document.getElementById("workDuration");
    const restDurationInput = document.getElementById("restDuration");

    // Keliling lingkaran SVG (2 * PI * r) => r = 95
    const circumference = 2 * Math.PI * 95;
    progressCircle.style.strokeDasharray = `${circumference}`;

    // Status Timer
    let timerInterval = null;
    let isRunning = false;
    let currentPhase = "work"; // 'work' atau 'rest'
    let totalSeconds = 20 * 60;
    let remainingSeconds = totalSeconds;

    // Helper: Format angka 00
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }

    // Update Tampilan Timer dan Progress Ring
    function updateDisplay() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timeDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;

        // Hitung persentase progres untuk animasi lingkaran SVG
        const progress = remainingSeconds / totalSeconds;
        const offset = circumference - (progress * circumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    // Beralih antara Fase Kerja dan Istirahat
    function switchPhase() {
        if (currentPhase === "work") {
            currentPhase = "rest";
            totalSeconds = parseInt(restDurationInput.value) || 20;
            remainingSeconds = totalSeconds;

            phaseBadge.textContent = "Fase Istirahat Mata";
            phaseBadge.className = "phase-badge rest";
            progressCircle.style.stroke = "#22c55e";
            instructionText.textContent = "🟢 Waktunya istirahat! Alihkan pandangan ke benda sejauh 20 kaki (6 meter).";

            // Bunyi notifikasi jika didukung browser
            playNotificationSound();
        } else {
            currentPhase = "work";
            totalSeconds = (parseInt(workDurationInput.value) || 20) * 60;
            remainingSeconds = totalSeconds;

            phaseBadge.textContent = "Fase Bekerja";
            phaseBadge.className = "phase-badge work";
            progressCircle.style.stroke = "#0284c7";
            instructionText.textContent = "🔵 Kembali bekerja di depan layar. Jaga jarak pandang tetap ideal.";

            playNotificationSound();
        }

        updateDisplay();
    }

    // Notifikasi suara sederhana menggunakan Web Audio API
    function playNotificationSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nada D5
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log("Audio API tidak didukung atau diblokir.");
        }
    }

    // Jalankan Timer
    function startTimer() {
        if (isRunning) return;

        isRunning = true;
        btnStart.disabled = true;
        btnPause.disabled = false;
        workDurationInput.disabled = true;
        restDurationInput.disabled = true;

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateDisplay();
            } else {
                switchPhase();
            }
        }, 1000);
    }

    // Jeda Timer
    function pauseTimer() {
        if (!isRunning) return;

        isRunning = false;
        clearInterval(timerInterval);
        btnStart.disabled = false;
        btnPause.disabled = true;
    }

    // Reset Timer ke Posisi Awal
    function resetTimer() {
        pauseTimer();
        currentPhase = "work";
        totalSeconds = (parseInt(workDurationInput.value) || 20) * 60;
        remainingSeconds = totalSeconds;

        phaseBadge.textContent = "Fase Bekerja";
        phaseBadge.className = "phase-badge work";
        progressCircle.style.stroke = "#0284c7";
        instructionText.textContent = "Fokus bekerja di depan layar. Timer akan memberi peringatan saat waktunya istirahat.";

        workDurationInput.disabled = false;
        restDurationInput.disabled = false;

        updateDisplay();
    }

    // Event Listener Tombol
    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnReset.addEventListener("click", resetTimer);

    // Event Listener Input Pengaturan Kustom
    workDurationInput.addEventListener("change", function () {
        if (!isRunning && currentPhase === "work") {
            resetTimer();
        }
    });

    restDurationInput.addEventListener("change", function () {
        if (!isRunning && currentPhase === "rest") {
            totalSeconds = parseInt(restDurationInput.value) || 20;
            remainingSeconds = totalSeconds;
            updateDisplay();
        }
    });

    // Inisialisasi Tampilan Awal
    updateDisplay();
});
