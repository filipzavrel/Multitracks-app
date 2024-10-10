document.addEventListener("DOMContentLoaded", () => {
    const songSelect = document.getElementById('songSelect');
    const trackControls = document.getElementById('trackControls');
    const playSelectedButton = document.createElement('button');
    const stopSelectedButton = document.createElement('button');
    const setDefaultButton = document.createElement('button');
    const changeDefaultButton = document.createElement('button');
    let audioElements = [];
    let defaultVolumes = JSON.parse(localStorage.getItem('defaultVolumes')) || [];

    playSelectedButton.textContent = 'Přehrát vybrané';
    stopSelectedButton.textContent = 'Zastavit vybrané';
    setDefaultButton.textContent = 'Nastavit výchozí hlasitost';
    changeDefaultButton.textContent = 'Změnit výchozí hlasitost';

    trackControls.appendChild(playSelectedButton);
    trackControls.appendChild(stopSelectedButton);
    trackControls.appendChild(setDefaultButton);
    trackControls.appendChild(changeDefaultButton);

    playSelectedButton.addEventListener('click', () => {
        // Spustit nebo pozastavit vybrané stopy
        audioElements.forEach(({ audio, checkbox }) => {
            if (checkbox.checked) {
                if (audio.paused) {
                    audio.play();
                }
            }
        });
    });

    stopSelectedButton.addEventListener('click', () => {
        // Zastavit vybrané stopy
        audioElements.forEach(({ audio, checkbox }) => {
            if (checkbox.checked) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    });

    setDefaultButton.addEventListener('click', () => {
        audioElements.forEach(({ volumeControl }, index) => {
            if (defaultVolumes[index] !== undefined) {
                volumeControl.value = defaultVolumes[index];
                volumeControl.dispatchEvent(new Event('input'));
            }
        });
    });

    changeDefaultButton.addEventListener('click', () => {
        const password = prompt('Zadejte heslo pro změnu výchozí hlasitosti:');
        if (password === 'Default') { // Heslo je "Default"
            defaultVolumes = audioElements.map(({ volumeControl }) => volumeControl.value);
            localStorage.setItem('defaultVolumes', JSON.stringify(defaultVolumes));
            alert('Výchozí hlasitosti byly úspěšně uloženy.');
        } else {
            alert('Nesprávné heslo!');
        }
    });

    songSelect.addEventListener('change', () => {
        const selectedSong = songSelect.value;
        if (!selectedSong) return;

        // Načíst metadata pro vybranou píseň
        fetch(`Songs/${selectedSong}/metadata.json`)
            .then(response => response.json())
            .then(metadata => {
                loadTracks(selectedSong, metadata.tracks);
            });
    });

    function loadTracks(songName, tracks) {
        trackControls.innerHTML = ''; // Vymazání předchozích ovládacích prvků
        audioElements = []; // Vymazání předchozích zvukových prvků

        trackControls.appendChild(playSelectedButton);
        trackControls.appendChild(stopSelectedButton);
        trackControls.appendChild(setDefaultButton);
        trackControls.appendChild(changeDefaultButton);

        tracks.forEach((track, index) => {
            const audioElement = new Audio(`Songs/${songName}/${track.fileName}`);
            const volumeControl = document.createElement('input');
            const checkbox = document.createElement('input');
            const playButton = document.createElement('button');
            const stopButton = document.createElement('button');
            const trackContainer = document.createElement('div');
            const trackLabel = document.createElement('span');
            const progressBar = document.createElement('input');

            trackContainer.className = 'track-container';
            trackLabel.className = 'track-label';
            trackLabel.textContent = track.name;

            volumeControl.type = 'range';
            volumeControl.min = 0;
            volumeControl.max = 1;
            volumeControl.step = 0.01;
            volumeControl.value = defaultVolumes[index] !== undefined ? defaultVolumes[index] : 1;
            volumeControl.className = 'volume-control';

            volumeControl.addEventListener('input', () => {
                audioElement.volume = volumeControl.value;
            });

            playButton.textContent = 'Přehrát';
            playButton.className = 'play-button';
            playButton.addEventListener('click', () => {
                if (audioElement.paused) {
                    audioElement.play();
                    playButton.textContent = 'Pauza';
                } else {
                    audioElement.pause();
                    playButton.textContent = 'Přehrát';
                }
            });

            stopButton.textContent = 'Zastavit';
            stopButton.className = 'stop-button';
            stopButton.addEventListener('click', () => {
                audioElement.pause();
                audioElement.currentTime = 0;
                playButton.textContent = 'Přehrát';
            });

            checkbox.type = 'checkbox';
            checkbox.className = 'track-checkbox';

            progressBar.type = 'range';
            progressBar.min = 0;
            progressBar.max = 100;
            progressBar.value = 0;
            progressBar.className = 'progress-bar';
            progressBar.disabled = true;

            audioElement.addEventListener('timeupdate', () => {
                progressBar.value = (audioElement.currentTime / audioElement.duration) * 100;
            });

            trackContainer.appendChild(checkbox);
            trackContainer.appendChild(trackLabel);
            trackContainer.appendChild(playButton);
            trackContainer.appendChild(stopButton);
            trackContainer.appendChild(document.createTextNode(' Progress: '));
            trackContainer.appendChild(progressBar);
            trackContainer.appendChild(document.createTextNode(' Hlasitost: '));
            trackContainer.appendChild(volumeControl);
            trackControls.appendChild(trackContainer);

            audioElements.push({ audio: audioElement, checkbox: checkbox, volumeControl: volumeControl });
        });
    }
});