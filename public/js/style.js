document.addEventListener('DOMContentLoaded', () => {
    const normalModeButton = document.getElementById('normalModeButton');
    const challengeModeButton = document.getElementById('challengeModeButton');

    if (normalModeButton) {
        normalModeButton.addEventListener('mouseover', () => {
            normalModeButton.textContent = '10 seconds, unlimited guesses';
        });

        normalModeButton.addEventListener('mouseout', () => {
            normalModeButton.textContent = 'Normal';
        });
    }

    if (challengeModeButton) {
        challengeModeButton.addEventListener('mouseover', () => {
            challengeModeButton.textContent = '3 seconds, one guess';
        });

        challengeModeButton.addEventListener('mouseout', () => {
            challengeModeButton.textContent = 'Challenge';
        });
    }
});