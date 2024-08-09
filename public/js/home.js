let music;
let loginButton;
let logoutButton;
let normalModeButton;
let challengeModeButton;
let gamemode = -1;
let MUT;

let libraryURL = 'https://api.music.apple.com/v1/me/library/songs?limit=100';
const playlistsURL = 'https://api.music.apple.com/v1/me/library/playlists?limit=100';
const developerToken = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdaVEZCWjRVNDUifQ.eyJpYXQiOjE3MjA4OTk3MTQsImV4cCI6MTczNjQ1MTcxNCwiaXNzIjoiMzNWODU3Tjc0NCJ9.zzlR2GUb829Brq-i_Y5l8RZNLjae34NC0Q4oexSpbZo7igEjc7jrbUOgU5OufcQGRJp5vxWUAiDmoMJh49YCww';

document.addEventListener('DOMContentLoaded', () => {
    MusicKit.configure({
        developerToken: developerToken,
        app: {
            name: 'MusicKit Example',
            build: '1978.4.1'
        }
    });

    loginButton = document.getElementById('authorizeButton');
    logoutButton = document.getElementById('unauthorizeButton');
    normalModeButton = document.getElementById('normalModeButton');
    challengeModeButton = document.getElementById('challengeModeButton');

    normalModeButton.style.display = 'none';
    challengeModeButton.style.display = 'none';

    setTimeout(() => {
        music = MusicKit.getInstance();
        sessionStorage.setItem('music', music);
    }, 500);

    // if (!music) {
    //     console.error('Failed to initialize MusicKit instance.');
    //     return;
    // }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            music.authorize().then((musicUserToken) => {
                MUT = musicUserToken;

                // TODO: need this?
                sessionStorage.setItem('MUT', MUT);

                normalModeButton.style.display = 'inline';
                challengeModeButton.style.display = 'inline';
            }).catch((error) => {
                console.error('Authorization error:', error);
            });
        });
    } else {
        console.log('Authorize Button failed to initialize');
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            music.unauthorize();
            console.log('User has been unauthorized.');
            normalModeButton.style.display = 'none';
            challengeModeButton.style.display = 'none';
        });
    } else {
        console.log('Unauthorize button failed to initialize');
    }

    if (normalModeButton) {
        normalModeButton.addEventListener('click', () => {
            gamemode = 0;
            console.log(gamemode);
            sessionStorage.setItem('gamemode', gamemode);
            window.location.href = '/selectCollection';
        });
    }

    if (challengeModeButton) {
        challengeModeButton.addEventListener('click', () => {
            gamemode = 1;
            console.log(gamemode);
            sessionStorage.setItem('gamemode', gamemode);
            window.location.href = '/selectCollection';
        })
    }
});