let music;
let MUT;

let gamemode;
let selectedCollection;
let selectedPlaylist;
let selectedPlaylistId;
let selectedPlaylistTracks = [];
let firstTime;
let playlistSize;
let offset = 100;

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

    MUT = sessionStorage.getItem('MUT');
    gamemode = sessionStorage.getItem('gamemode');
    selectedCollection = parseInt(sessionStorage.getItem('selectedCollection'), 10);

    if (selectedCollection === 0) {   // library

    } else if (selectedCollection === 1) {    // playlist
        // selectedPlaylist = sessionStorage.getItem('selectedPlaylist');
        selectedPlaylistId = sessionStorage.getItem('selectedPlaylistId');
        console.log(selectedPlaylistId);

        fetchPlaylistSongs(selectedPlaylistId);
    } else {
        console.log('something bad happen');
    }
});

/**
 * Fetches the songs in the selected playlist and passes them to the play() function
 *
 * @param playlistId - Playlist's ID
 */
function fetchPlaylistSongs(playlistId) {
    const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;    // took away /tracks
    // document.getElementById('guessInput').style.display = 'inline';
    fetchPlaylistSongsPage(url);
}

function fetchPlaylistSongsPage(url) {
    console.log(url);
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': MUT
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.data.length <= 100) {  // TODO: There's gotta be a better way to do this but how
                selectedPlaylistTracks.push(...data.data);
                fetchPlaylistSongsPage(`https://api.music.apple.com/v1/me/library/playlists/${selectedPlaylistId}/tracks?offset=${offset}`);
                offset += 100;
                console.log('offset' + offset);

            } else {
                console.log('Total tracks in the playlist:', selectedPlaylistTracks.length);
                firstTime = true;
                playlistSize = selectedPlaylistTracks.length;
                play(selectedPlaylistTracks);
            }
        })
        .catch(error => {
            console.log('Error fetching playlist songs; may have reached end of playlist pagination:', error);

            console.log('Total tracks in the playlist:', selectedPlaylistTracks.length);
            firstTime = true;
            playlistSize = selectedPlaylistTracks.length;
            play(selectedPlaylistTracks);
        });
}