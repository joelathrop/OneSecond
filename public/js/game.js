let music;
let MUT;

let gamemode = -1;
let offset = 100;
let songCount = 0;
let prevSongCount = 0;
let playlistSize = 0;
let playTime = 1000;
let selectedPlaylistId;
let currentSong;
let currentSongId;
let correctCount = 0;
let incorrectCount = 0;

let selectedCollection;     // 0 for library, 1 for playlist

let selectedPlaylistTracks = [];
let librarySongs = [];
let songsWrong = [];

let playing;
let firstTime;
let playButtonPressed;
let guess;
let addTimeUsage = false;

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
    gamemode = parseInt(sessionStorage.getItem('gamemode'), 10);
    selectedCollection = parseInt(sessionStorage.getItem('selectedCollection'), 10);
    document.getElementById('songsWrong').style.display = 'none';
    document.getElementById('loadingMsg').style.display = 'none';
    document.getElementById('homeButton').style.display = 'none';

    document.getElementById('guessInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('guessInput').value.toLowerCase();
        filterSongs(searchTerm);
    });

    document.getElementById('addTime').addEventListener('click', () => {
        if (gamemode === 1) {
            if (!addTimeUsage) {
                playTime += 2000;
                addTimeUsage = true;
                document.getElementById('timeLabel').textContent = 'Time (seconds): ' + playTime / 1000;
            } else {
                // TODO : BULMA BUTTON SHAKE
                alert("You can't add any more time!");
            }
        } else if (gamemode === 0) {
            if (playTime < 10000) {
                playTime += 1000;
                console.log('Play time:' + playTime);
                document.getElementById('timeLabel').textContent = 'Time (seconds): ' + playTime / 1000;
            } else {
                alert("You can't add any more time!");
            }
        }
    });

    document.getElementById('giveUpButton').addEventListener('click', () => {
        if (playButtonPressed) {
            // TODO listen later logic
            document.getElementById('msg').textContent = 'That song was: ' + `${currentSong.attributes.name}`
                + ' by ' + `${currentSong.attributes.artistName}` + ". Click Play to play next song.";
            // TODO don't push or count if you already got it wrong
            // maybe another counter for incorrect guesses on normal mode?
            songsWrong.push(" " + currentSong.attributes.name);
            playTime = 1000;
            music.stop();
            songCount++;
            incorrectCount++;
            playButtonPressed = false;
            if (playlistSize === songCount) {
                endgame();
            } else {
                if (selectedCollection === 0) {
                    play(librarySongs);
                } else if (selectedCollection === 1) {
                    play(selectedPlaylistTracks);
                }
            }
        } else {
            alert('Song has not been played.');
        }
    });

    if (selectedCollection === 0) {   // library
        fetchUserLibrary();
    } else if (selectedCollection === 1) {    // playlist
        selectedPlaylistId = sessionStorage.getItem('selectedPlaylistId');
        fetchPlaylistSongs(selectedPlaylistId);
    } else {
        console.log('something bad happen');
    }
});

/**
 * Ensures user is authorized to load library
 */
function fetchUserLibrary() {
    // hide everything and tell em to wait a dam second
    document.getElementById('loadingMsg').style.display = 'inline';

    console.log('Fetching user library...');

    if (!MUT) {
        console.error('Music user token is undefined. Make sure you are authorized.');
        return;
    }

    fetchLibraryPage(libraryURL);
}

/**
 * Fetches all songs in the authorized user's Apple Music library,
 * then displays them using displayItems()
 *
 * @param url
 */
function fetchLibraryPage(url) {
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
            librarySongs.push(...data.data);
            console.log("library length: " + librarySongs.length);

            console.log(data.next);

            if (data.next) {
                let nextUrl = new URL(data.next, libraryURL).href;
                if (!nextUrl.includes('limit=')) {
                    nextUrl += '&limit=100';
                }
                fetchLibraryPage(nextUrl);
            } else {
                console.log('Finished fetching all library songs.');
                document.getElementById('loadingMsg').style.display = 'none';

                firstTime = true;
                playlistSize = librarySongs.length;
                play(librarySongs);
            }
        }).catch(error => {
        console.error('Error fetching library: ', error);
    });
}

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
 * Displays items in passed list. Each item has a listener
 * @param items
 */
function displayItems(items) {
    const itemList = document.getElementById('itemList');
    // const itemList = document.createElement('itemList');
    itemList.innerHTML = '';

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.attributes.name;
        li.setAttribute('data-id', item.id);
        li.classList.add('button', 'is-ghost', 'is-fullwidth');
        li.addEventListener('click', () => {
            if (playButtonPressed) {
                songComparator(item.id);
            }
        });
        itemList.appendChild(li);
    });
}

/**
 * Input bar filter for songs
 * @param searchTerm
 */
function filterSongs(searchTerm) {
    let filteredSongs;
    // hide songs if nothing in the search bar
    if (searchTerm.trim() === '') {
        displayItems([]);
        return;
    }

    if (selectedCollection === 0) {
        filteredSongs = librarySongs.filter(song =>
            song.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else if (selectedCollection === 1) {
        filteredSongs = selectedPlaylistTracks.filter(song =>
            song.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    displayItems(filteredSongs);
}

/**
 * Compares two songs based on ID
 * Increases the count
 * @param songId
 */
function songComparator(songId) {
    if (songId === currentSongId) {
        document.getElementById('guessInput').value = "";
        console.log('Guessed correctly');
        songCount++;
        correctCount++;     // TODO: MAKE SURE TO SHOW STATS ON THIS IN NORMAL MODE! MIGHT NOT BE 3/3 in the first second for example. Maybe first 3 seconds?
        addTimeUsage = false;
        playTime = 1000;
        guess = true;
        showSongInfo(guess, currentSong);
    } else {
        console.log('Guessed incorrectly');
        if (gamemode === 0) {
            incorrectCount++;
            guess = false;
            music.stop();
            songsWrong.push(" " + currentSong.attributes.name);
            document.getElementById('msg').textContent = 'Incorrect, try again.';
            if (selectedCollection === 0) {
                play(librarySongs);
            } else if (selectedCollection === 1) {
                play(selectedPlaylistTracks);
            }
        } else {
            songCount++;
            incorrectCount++;
            addTimeUsage = false;
            playTime = 1000;
            guess = false;
            showSongInfo(guess, currentSong);
        }
    }
}

/**
 * Prints song title and artist
 * @param guess
 * @param song
 */
function showSongInfo(guess, song) {
    // document.getElementById('listenLaterButton').style.display = 'inline';
    const songInfo = document.getElementById('msg');
    // const music = MusicKit.getInstance();
    songInfo.innerHTML = '';

    if (guess) {
        playButtonPressed = false;
        songInfo.textContent = 'Correct! That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
        updateStats();
        console.log(songCount);
        music.stop();
        if (playlistSize === songCount) {
            endgame();
        } else {
            if (selectedCollection === 0) {
                play(librarySongs);
            } else if (selectedCollection === 1) {
                play(selectedPlaylistTracks);
            }
        }
    } else {
        songInfo.textContent = 'Incorrect. That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
        music.stop();
        updateStats();
        songsWrong.push(" " + song.attributes.name);
        console.log(songCount);
        console.log(playlistSize);
        if (playlistSize === songCount) {
            endgame();
        } else {
            if (selectedCollection === 0) {
                play(librarySongs);
            } else if (selectedCollection === 1) {
                play(selectedPlaylistTracks);
            }
        }
    }
}

/**
 * Shuffles an array
 *
 * @param array
 * @returns {*} - shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Function to finish the game
 */
function endgame() {
    playing = false;
    const stats = document.getElementById('stats');
    stats.innerHTML = '';
    document.getElementById('songsWrong').style.display = 'inline';
    document.getElementById('songsWrong').textContent = "Songs you got wrong: " + songsWrong;

    stats.textContent = 'You finished! You got: ' + `${correctCount}` + '/' + `${selectedPlaylistTracks.length}` + " correct.";

    music.stop();
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

    // show addTime button/label
    document.getElementById('timeLabel').style.display = 'inline';
    document.getElementById('timeLabel').textContent = 'Time (seconds): ' + playTime / 1000;

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

    console.log(songs);

    document.getElementById('playButton').addEventListener('click', () => {
        playButtonPressed = true;
        // document.getElementById('listenLaterButton').style.display = 'none';

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