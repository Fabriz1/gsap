document.addEventListener('DOMContentLoaded', () => {
    // --- PHP User Check ---
    fetch("controllo.php")
        .then(response => response.json())
        .then(result => {
            if (result.errore) {
                alert("Devi accedere per utilizzare questa funzionalità.");
                window.location.href = "../login/login.html";
            }
        })
        .catch(error => {
            console.error("Errore nel controllo sessione:", error);
        });

    // --- DOM Elements ---
    const btnShowFileMode = document.getElementById('btn-show-file-mode');
    const btnShowTextMode = document.getElementById('btn-show-text-mode');
    const fileInputSection = document.getElementById('file-input-section');
    const textInputSection = document.getElementById('text-input-section');
    
    const mobileFileInput = document.getElementById('mobile-file-input');
    const triggerFileUploadButton = document.getElementById('trigger-file-upload-button');
    const fileNameDisplay = document.getElementById('file-name-display');
    const mobileTextArea = document.getElementById('mobile-text-area');
    
    const btnProceed = document.getElementById('btn-proceed');
    const loadingOverlay = document.getElementById('loading-overlay');

    const eqBands = document.querySelectorAll('.eq-band');

    // --- Constants for EQ ---
    const MIN_PREF_VALUE = 0.0;
    const MAX_PREF_VALUE = 5.0;
    const DEFAULT_PREF_VALUE = 2.5;

    // --- State ---
    let currentInputMode = 'file';
    let selectedFile = null;
    let activeDraggedDot = null;
    let dragStartY = 0;
    let initialDotBottom = 0;

    // --- Functions ---
    function updateInputModeUI() {
        if (currentInputMode === 'file') {
            fileInputSection.classList.add('active-input-area');
            textInputSection.classList.remove('active-input-area');
            btnShowFileMode.classList.add('active');
            btnShowTextMode.classList.remove('active');
        } else {
            textInputSection.classList.add('active-input-area');
            fileInputSection.classList.remove('active-input-area');
            btnShowTextMode.classList.add('active');
            btnShowFileMode.classList.remove('active');
        }
    }
    
    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    function valueToPercentage(value, min, max) {
        if (max === min) return 0; // Avoid division by zero
        return ((value - min) / (max - min)) * 100;
    }

    function percentageToValue(percentage, min, max, trackHeight) {
        // Percentage is 0-100 from bottom
        const valueRange = max - min;
        return (percentage / 100) * valueRange + min;
    }

    function updateEqDotPosition(band, value) {
        const dot = band.querySelector('.eq-band-dot');
        const trackWrapper = band.querySelector('.eq-band-track-wrapper');
        const valueDisplay = band.querySelector('.eq-band-value-display');
        const hiddenInput = band.querySelector('.eq-hidden-input');

        const trackHeight = trackWrapper.clientHeight; // Height of the draggable area
        
        // Clamp value
        value = Math.max(MIN_PREF_VALUE, Math.min(MAX_PREF_VALUE, value));
        
        const percentage = valueToPercentage(value, MIN_PREF_VALUE, MAX_PREF_VALUE);
        
        dot.style.bottom = `${percentage}%`;
        
        const displayVal = value.toFixed(1);
        valueDisplay.textContent = displayVal;
        hiddenInput.value = displayVal;
    }
    
    function initializeEqPositions() {
        eqBands.forEach(band => {
            const hiddenInput = band.querySelector('.eq-hidden-input');
            let initialValue = parseFloat(hiddenInput.value);
            if (isNaN(initialValue)) {
                initialValue = DEFAULT_PREF_VALUE;
            }
            updateEqDotPosition(band, initialValue);
        });
    }

    function onDragStart(event) {
        activeDraggedDot = event.target.closest('.eq-band-dot');
        if (!activeDraggedDot) return;

        activeDraggedDot.classList.add('dragging');
        const trackWrapper = activeDraggedDot.closest('.eq-band-track-wrapper');

        if (event.type === 'touchstart') {
            dragStartY = event.touches[0].clientY;
        } else {
            dragStartY = event.clientY;
            event.preventDefault(); // Prevent default browser drag behavior for mouse
        }
        
        // Get initial bottom as percentage
        const currentBottomStyle = activeDraggedDot.style.bottom || '50%'; // Default to 50% if not set
        initialDotBottom = parseFloat(currentBottomStyle); // This is already a percentage

        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragging, { passive: false }); // passive:false to allow preventDefault
        document.addEventListener('touchend', onDragEnd);
    }

    function onDragging(event) {
        if (!activeDraggedDot) return;
        event.preventDefault(); // Crucial for smooth dragging, especially on touch

        const trackWrapper = activeDraggedDot.closest('.eq-band-track-wrapper');
        const trackRect = trackWrapper.getBoundingClientRect();
        const trackHeight = trackWrapper.clientHeight;

        let currentY;
        if (event.type === 'touchmove') {
            currentY = event.touches[0].clientY;
        } else {
            currentY = event.clientY;
        }

        // Calculate the Y position relative to the track's bottom
        // Lower Y means higher on screen, so higher value
        let newPointerYInTrack = trackRect.bottom - currentY;
        
        // Clamp newPointerYInTrack to be within 0 and trackHeight
        newPointerYInTrack = Math.max(0, Math.min(trackHeight, newPointerYInTrack));

        const percentage = (newPointerYInTrack / trackHeight) * 100;
        
        const band = activeDraggedDot.closest('.eq-band');
        const newValue = percentageToValue(percentage, MIN_PREF_VALUE, MAX_PREF_VALUE);
        
        updateEqDotPosition(band, newValue);
    }

    function onDragEnd() {
        if (activeDraggedDot) {
            activeDraggedDot.classList.remove('dragging');
        }
        activeDraggedDot = null;
        document.removeEventListener('mousemove', onDragging);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragging);
        document.removeEventListener('touchend', onDragEnd);
    }


    // --- Event Listeners ---
    btnShowFileMode.addEventListener('click', () => {
        currentInputMode = 'file';
        updateInputModeUI();
    });

    btnShowTextMode.addEventListener('click', () => {
        currentInputMode = 'text';
        updateInputModeUI();
    });

    triggerFileUploadButton.addEventListener('click', () => {
        mobileFileInput.click();
    });

    mobileFileInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === "application/pdf" || selectedFile.type.startsWith("text/")) {
                fileNameDisplay.textContent = `File: ${selectedFile.name}`;
            } else {
                alert("Tipo di file non supportato. Si prega di caricare PDF o TXT.");
                fileNameDisplay.textContent = "Nessun file selezionato.";
                selectedFile = null;
                mobileFileInput.value = '';
            }
        } else {
            fileNameDisplay.textContent = "Nessun file selezionato.";
        }
    });
    
    eqBands.forEach(band => {
        const dot = band.querySelector('.eq-band-dot');
        dot.addEventListener('mousedown', onDragStart);
        dot.addEventListener('touchstart', onDragStart, { passive: false }); // passive:false for touchstart too
    });


    btnProceed.addEventListener('click', () => {
        showLoading(true);

        const preferences = [];
        eqBands.forEach(band => {
            const hiddenInput = band.querySelector('.eq-hidden-input');
            preferences.push(parseFloat(hiddenInput.value));
        });

        let programData = {
            content: null,
            isBase64: false,
            mimeType: null,
            fileName: null,
            preferences: preferences,
            sourceType: currentInputMode
        };

        const proceedToLogicPage = () => {
            localStorage.setItem('programDataForLogic', JSON.stringify(programData));
            window.location.href = "../logica/logica.html";
        };

        if (currentInputMode === 'file') {
            if (!selectedFile) {
                alert("Per favore, seleziona un file.");
                showLoading(false);
                return;
            }
            programData.fileName = selectedFile.name;
            programData.mimeType = selectedFile.type;

            const reader = new FileReader();
            reader.onload = function(event) {
                programData.content = event.target.result.split(',')[1];
                programData.isBase64 = true;
                proceedToLogicPage();
            };
            reader.onerror = function(error) {
                console.error("Errore durante la lettura del file:", error);
                alert("Errore durante la lettura del file.");
                showLoading(false);
            };
            reader.readAsDataURL(selectedFile);

        } else { // text mode
            const pastedText = mobileTextArea.value.trim();
            if (!pastedText) {
                alert("Per favore, incolla del testo.");
                showLoading(false);
                return;
            }
            programData.content = pastedText;
            programData.isBase64 = false;
            programData.mimeType = 'text/plain';
            proceedToLogicPage();
        }
    });

    // --- Initial Setup ---
    updateInputModeUI();
    initializeEqPositions(); // Set initial EQ dot positions
});