export default class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.volume = 0.5;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Define sound paths - assuming files will be in 'audio/' folder
        const soundFiles = {
            'flip': 'audio/flip.mp3',
            'match': 'audio/match.mp3',
            'mismatch': 'audio/mismatch.mp3',
            'win': 'audio/win.mp3'
        };

        for (const [key, path] of Object.entries(soundFiles)) {
            this.sounds[key] = new Audio(path);
            this.sounds[key].volume = this.volume;
        }

        // Load settings from localStorage
        const storedMuted = localStorage.getItem('memory-game-muted');
        if (storedMuted !== null) {
            this.muted = storedMuted === 'true';
        }

        const storedVolume = localStorage.getItem('memory-game-volume');
        if (storedVolume !== null) {
            this.volume = parseFloat(storedVolume);
            this.updateVolume(this.volume);
        }

        this.initialized = true;
    }

    play(soundName) {
        if (this.muted) return;
        if (this.sounds[soundName]) {
            // Clone the node to allow overlapping sounds (e.g. rapid flipping)
            // or just reset current time. Resetting current time is better for memory, 
            // but cloning is better for rapid fire. Let's try simple reset first.
            const sound = this.sounds[soundName];
            sound.pause();
            sound.currentTime = 0;
            sound.play().catch(e => console.warn(`Could not play sound ${soundName}:`, e));
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('memory-game-muted', this.muted);
        return this.muted;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.updateVolume(this.volume);
        localStorage.setItem('memory-game-volume', this.volume);
    }

    updateVolume(vol) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = vol;
        });
    }
}
