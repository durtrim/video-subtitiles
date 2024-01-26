document.addEventListener("DOMContentLoaded", () => {
    const videoElement: HTMLVideoElement = document.getElementById("myVideo") as HTMLVideoElement;
    const canvas: HTMLCanvasElement = document.getElementById("videoCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const subtitleText: HTMLTextAreaElement = document.getElementById("subtitleText") as HTMLTextAreaElement;
    const addSubtitleButton: HTMLButtonElement = document.getElementById("addSubtitle") as HTMLButtonElement;
    const playButton: HTMLButtonElement = document.getElementById("playButton") as HTMLButtonElement;
    const pauseButton: HTMLButtonElement = document.getElementById("pauseButton") as HTMLButtonElement;

    const video: HTMLVideoElement = document.getElementById("myVideo") as HTMLVideoElement;
    const progressBar: HTMLElement = document.getElementById("progressBar")!;
    const progress: HTMLElement = document.getElementById("progress")!;
    const scrubber: HTMLElement = document.getElementById("scrubber")!;

    let subtitles: { start: number, end: number, text: string, x: number, y: number }[] = [];
    let animationFrameId: number;

    let dpi = window.devicePixelRatio;
    let style_height = + getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let style_width = + getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

    canvas.setAttribute('height', style_height * dpi + "");
    canvas.setAttribute('width', style_width * dpi + "");

    function drawSubtitle() {
        if (context) {
            subtitles.forEach(sub => {
                if (video.currentTime >= sub.start && video.currentTime <= sub.end) {
                    context.font = '50px Arial';
                    context.fillStyle = 'white';
                    context.textBaseline = 'top';
                    context.fillText(sub.text, sub.x, sub.y);
                }
            });
        }
    }

    function updateCanvas() {
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        drawSubtitle();
        animationFrameId = requestAnimationFrame(updateCanvas);
    }
    addSubtitleButton.addEventListener("click", () => {
        try {
            subtitles = JSON.parse(subtitleText.value);
        } catch (e) {
            console.error("Invalid JSON");
        }
    });

    playButton.addEventListener("click", () => {
        video.play();
        animationFrameId = requestAnimationFrame(updateCanvas);
    });

    pauseButton.addEventListener("click", () => {
        video.pause();
        cancelAnimationFrame(animationFrameId);
    });

    video.addEventListener('timeupdate', () => {
        const progressPercent = (video.currentTime / video.duration) * 100;
        progress.style.width = progressPercent + '%';
        scrubber.style.left = progressPercent + '%';

        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        }
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        video.currentTime = (clickX / progressBar.offsetWidth) * video.duration;
    });

    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 0.00001;
        updateCanvas();
    });

});