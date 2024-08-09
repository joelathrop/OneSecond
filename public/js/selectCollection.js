// let music = sessionStorage.getItem('music');
let fetchLibraryButton;
let fetchPlaylistsButton;
let selectedCollection = -1;    // 0 for library, 1 for playlist

document.addEventListener('DOMContentLoaded', () => {
    fetchLibraryButton = document.getElementById('fetchLibraryButton');
    fetchPlaylistsButton = document.getElementById('fetchPlaylistsButton');

    if (fetchLibraryButton) {
        fetchLibraryButton.addEventListener('click', () => {
            selectedCollection = 0;
            sessionStorage.setItem('selectedCollection', selectedCollection);

            window.location.href = '/game';
        });
    }

    if (fetchPlaylistsButton) {
        fetchPlaylistsButton.addEventListener('click', () => {
            selectedCollection = 1;
            sessionStorage.setItem('selectedCollection', selectedCollection);

            window.location.href = '/selectPlaylist';
        });
    }
});