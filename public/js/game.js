let music;
let MUT;

let gamemode = -1;
let offset = 100;
let playlistSize;
let selectedPlaylistId;
let correctCount = 0;
let incorrectCount = 0;

let selectedCollection;

let selectedPlaylistTracks = [];

let playing;
let firstTime;

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

    document.getElementById('guessInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('guessInput').value.toLowerCase();
        filterSongs(searchTerm);
    });

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

/**
 * Dynamically updates the score while the game is in progress
 */
function updateStats() {
    document.getElementById('stats').textContent = `Score: ${correctCount} / ${incorrectCount + correctCount}` +
        "   ||   Songs in the collection: " + `${selectedPlaylistTracks.length}`;
}

/**
 * Plays the game
 *
 * @param songs - playlist songs to play
 */
function play(songs) {
    music = MusicKit.getInstance();
    playing = true;

    displayItems([]);
    updateStats();

    // document.getElementById('guessInput').style.display = 'inline';
    document.getElementById('guessInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('guessInput').value.toLowerCase();
        filterSongs(searchTerm);
    });
    // document.getElementById('stats').style.display = 'inline';

    // shuffle songs
    if (firstTime) {
        songs = shuffleArray(songs);
        firstTime = false;

        music.setQueue({items: songs}).then(queue => {
            console.log('Playback queue set', queue);
        }).catch(error => {
            console.log('Error setting playback queue', error);
        });
    }

    // show addTime button/label & give up button
    document.getElementById('timeLabel').style.display = 'inline';
    document.getElementById('timeLabel').textContent = 'Time (seconds): ' + playTime / 1000;
    // if (gamemode === 0) {
    document.getElementById('giveUpButton').style.display = 'inline';
    // }

    console.log(songs);

    document.getElementById('playButton').addEventListener('click', () => {
        playButtonPressed = true;
        document.getElementById('listenLaterButton').style.display = 'none';

        currentSong = songs[songCount];
        currentSongId = songs[songCount].id;

        console.log(currentSongId);

        if (songCount < songs.length) {
            if (prevSongCount === songCount) {
                music.play().then(() => {
                    console.log('Playback started');
                    setTimeout(() => {
                        music.stop();
                    }, playTime);
                }).catch(error => {
                    console.error('Error starting playback:', error);
                });
            } else if (prevSongCount < songCount) {
                prevSongCount++;
                music.skipToNextItem().then(() => {
                    console.log('Playback started');
                    setTimeout(() => {
                        music.stop();
                    }, playTime);
                }).catch(error => {
                    console.error('Error starting playback:', error);
                });
            } else {
                console.log('something has gone terribly wrong');
            }
        } else {
            endgame();
        }
    });
}