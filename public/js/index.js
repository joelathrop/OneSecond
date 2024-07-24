let music;

let songCount = 0;
let prevSongCount = 0;
let correctCount = 0;
let incorrectCount = 0;
let playlistSize = 0;
let gamemode = -1;  // 0: NORMAL // 1: CHALLENGE
let playTime = 1000;
let offset = 100;

let currentSongId = null;
let currentSong = null;
let selectedPlaylistId = null;
let selectedPlaylist = null;

let librarySongs = [];
let selectedPlaylistTracks = [];
let allPlaylists = [];
let songsWrong = [];

let playing = false;
let playWithLibrary = false;
let firstTime = false;
let guess = false;
let addTimeUsage = false;

let libraryURL = 'https://api.music.apple.com/v1/me/library/songs?limit=100';
const playlistsURL = 'https://api.music.apple.com/v1/me/library/playlists?limit=100';
const developerToken = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdaVEZCWjRVNDUifQ.eyJpYXQiOjE3MjA4OTk3MTQsImV4cCI6MTczNjQ1MTcxNCwiaXNzIjoiMzNWODU3Tjc0NCJ9.zzlR2GUb829Brq-i_Y5l8RZNLjae34NC0Q4oexSpbZo7igEjc7jrbUOgU5OufcQGRJp5vxWUAiDmoMJh49YCww';

// TODO: Saving/loading states?

document.addEventListener('DOMContentLoaded', () => {
    MusicKit.configure({
        developerToken: developerToken,
        app: {
            name: 'MusicKit Example',
            build: '1978.4.1'
        }
    });

    // show/hide necessary buttons/headers
    document.getElementById('difficultyHeader').style.display = 'inline';
    document.getElementById('collectionHeader').style.display = 'none';
    document.getElementById('fetchLibraryButton').style.display = 'none';
    document.getElementById('fetchPlaylistsButton').style.display = 'none';
    document.getElementById('normalModeButton').style.display = 'inline';
    document.getElementById('challengeModeButton').style.display = 'inline';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('loadingMsg').style.display = 'none';

    setTimeout(() => {
        music = MusicKit.getInstance();

        if (!music) {
            console.error('Failed to initialize MusicKit instance.');
            return;
        }

        document.getElementById('authorizeButton').addEventListener('click', () => {
            music.authorize().then((musicUserToken) => {
                console.log(`Authorized, music user token: ${musicUserToken}`);
                document.getElementById('normalModeButton').style.display = 'inline';
                document.getElementById('challengeModeButton').style.display = 'inline';
                document.getElementById('unauthorizeButton').style.display = 'inline'; // Show unauthorize button
            }).catch((error) => {
                console.error('Authorization error:', error);
            });
        });

        document.getElementById('normalModeButton').addEventListener('click', () => {
            gamemode = 0;
            console.log('Game mode: ', gamemode);
            document.getElementById('difficultyHeader').style.display = 'none';
            document.getElementById('collectionHeader').style.display = 'inline';
            document.getElementById('fetchLibraryButton').style.display = 'inline';
            document.getElementById('fetchPlaylistsButton').style.display = 'inline';
            document.getElementById('normalModeButton').style.display = 'none';
            document.getElementById('challengeModeButton').style.display = 'none';
            document.getElementById('backButton').style.display = 'inline';
        });

        document.getElementById('challengeModeButton').addEventListener('click', () => {
            gamemode = 1;
            console.log('Game mode: ', gamemode);
            document.getElementById('difficultyHeader').style.display = 'none';
            document.getElementById('collectionHeader').style.display = 'inline';
            document.getElementById('fetchLibraryButton').style.display = 'inline';
            document.getElementById('fetchPlaylistsButton').style.display = 'inline';
            document.getElementById('normalModeButton').style.display = 'none';
            document.getElementById('challengeModeButton').style.display = 'none';
            document.getElementById('backButton').style.display = 'inline';
        });

        document.getElementById('fetchLibraryButton').addEventListener('click', () => {
            document.getElementById('backButton').style.display = 'none';
            playWithLibrary = true;
            window.history.pushState({}, '', '/library/play');
            router();
        });

        document.getElementById('fetchPlaylistsButton').addEventListener('click', () => {
            document.getElementById('backButton').style.display = 'none';
            window.history.pushState({}, '', '/playlists');
            router();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            filterPlaylists(searchTerm);
        });

        document.getElementById('homeButton2').addEventListener('click', () => {
            reset();
            window.history.pushState({}, '', '/');
            router();
        });

        document.getElementById('homeButton3').addEventListener('click', () => {
            reset();
            window.history.pushState({}, '', '/');
            router();
        });

        document.getElementById('backButton').addEventListener('click', () => {
            document.getElementById('difficultyHeader').style.display = 'inline';
            document.getElementById('collectionHeader').style.display = 'none';
            document.getElementById('fetchLibraryButton').style.display = 'none';
            document.getElementById('fetchPlaylistsButton').style.display = 'none';
            document.getElementById('normalModeButton').style.display = 'inline';
            document.getElementById('challengeModeButton').style.display = 'inline';

            document.getElementById('backButton').style.display = 'none';
        });

        // add a second
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
            document.getElementById('msg').textContent = 'That song was: ' + `${currentSong.attributes.name}`
                + ' by ' + `${currentSong.attributes.artistName}` + ". Click Play to play next song.";
            songsWrong.push(" " + currentSong.attributes.name);
            songCount++;
            playTime = 1000;
            music.stop();
            if (playlistSize === songCount) {
                endgame();
            } else {
                if (playWithLibrary) {
                    play(librarySongs);
                } else {
                    play(selectedPlaylistTracks);
                }
            }

            // what else to update??
        });

        document.getElementById('unauthorizeButton').addEventListener('click', () => {
            music.unauthorize();
            console.log('User has been unauthorized.');
            document.getElementById('fetchLibraryButton').style.display = 'none';
            document.getElementById('fetchPlaylistsButton').style.display = 'none';
            document.getElementById('unauthorizeButton').style.display = 'none';
        });

        window.onpopstate = router;

        router();
    }, 500);
});

/**
 * Resets all global variables, including counters, arrays, buttons,
 * search bars, and the game statistics
 */
function reset() {

    // TODO: Error here before game is over?
    if (playing && (songCount < selectedPlaylistTracks.length)) {
        const music = MusicKit.getInstance();
        music.stop();
        music.setQueue({songs: []}).then(r => {
            console.log('Playback queue reset successfully');
        }).catch((error) => {
            console.error('Failed to reset the playback queue:', error);
        });
    }

    songCount = 0;
    prevSongCount = 0;
    correctCount = 0;
    incorrectCount = 0;
    playlistSize = 0;
    gamemode = -1;
    playTime = 1000;
    offset = 100;
    librarySongs = [];
    allPlaylists = [];
    songsWrong = [];
    selectedPlaylistTracks = [];
    currentSongId = null;
    currentSong = null;
    selectedPlaylistId = null;
    selectedPlaylist = null;
    playing = false;
    playWithLibrary = false;
    firstTime = false;
    guess = false;
    addTimeUsage = false;

    // what is the difference between textContent and innerHTML
    // and what is the difference between innerHTML and innerText
    document.getElementById('songList').textContent = '';
    document.getElementById('itemList').textContent = '';
    document.getElementById('statsList').textContent = '';
    document.getElementById('songsWrong').textContent = '';

    // Ensure necessary buttons and inputs are hidden/shown
    document.getElementById('difficultyHeader').style.display = 'inline';
    document.getElementById('collectionHeader').style.display = 'none';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('authorizeButton').style.display = 'inline';
    document.getElementById('unauthorizeButton').style.display = 'inline';
    document.getElementById('normalModeButton').style.display = 'inline';
    document.getElementById('challengeModeButton').style.display = 'inline';
    document.getElementById('fetchLibraryButton').style.display = 'none';
    document.getElementById('fetchPlaylistsButton').style.display = 'none';
    document.getElementById('guessInput').style.display = 'none';
    document.getElementById('songsWrong').style.display = 'none';
    document.getElementById('loadingMsg').style.display = 'none';

    updateStats();
}


/**
 * Dynamically updates the score while the game is in progress
 */
function updateStats() {
    document.getElementById('stats').textContent = `Score: ${correctCount} / ${selectedPlaylistTracks.length}`
}

/**
 * Fetches all songs in the authorized user's Apple Music library,
 * then displays them using displayItems()
 *
 * @param music - MusicKit instance
 */
function fetchUserLibrary(music) {
    // hide everything and tell em to wait a dam second
    // TODO: HIDE TIME AND SCORE?
    document.getElementById('playButton').style.display = 'none';
    document.getElementById('guessInput').style.display = 'none';
    document.getElementById('addTime').style.display = 'none';
    document.getElementById('giveUpButton').style.display = 'none';
    document.getElementById('homeButton3').style.display = 'none';
    document.getElementById('stats').style.display = 'none';

    document.getElementById('loadingMsg').style.display = 'inline';

    console.log('Fetching user library...');
    const musicUserToken = music.musicUserToken;

    if (!musicUserToken) {
        console.error('Music user token is undefined. Make sure you are authorized.');
        return;
    }

    function fetchLibraryPage(url) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${developerToken}`,
                'Music-User-Token': musicUserToken
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
                    firstTime = true;
                    playlistSize = librarySongs.length;
                    play(librarySongs);
                }
            }).catch(error => {
            console.error('Error fetching library: ', error);
        });
    }

    fetchLibraryPage(libraryURL);
}

/**
 * Makes sure user is authorized to fetch library playlists
 *
 * @param music - MusicKit Instance
 */
function fetchUserPlaylists(music) {
    console.log('Fetching user playlists...');
    const musicUserToken = music.musicUserToken;
    document.getElementById('searchInput').style.display = 'inline';

    if (!musicUserToken) {
        console.error('Music user token is undefined. Make sure you are authorized.');
        return;
    }

    // Clear the allPlaylists array before fetching new data
    allPlaylists = [];

    fetchPlaylistsPage(playlistsURL);
}

/**
 * Fetches user's library playlists, then displays them
 * using displayItems
 *
 * @param nextUrl - API URL call
 */
function fetchPlaylistsPage(nextUrl) {
    fetch(nextUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': music.musicUserToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allPlaylists.push(...data.data);
            if (data.next) {
                fetchPlaylistsPage(data.next);
            } else {
                console.log("num of playlists: " + allPlaylists.length);
                displayItems(allPlaylists);
            }
        })
        .catch(error => {
            console.error('Error fetching playlists:', error);
        });
}

/**
 * Fetches the songs in the selected playlist and passes them to the play() function
 *
 * @param playlistId - Playlist's ID
 */
function fetchPlaylistSongs(playlistId) {
    const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;    // took away /tracks
    document.getElementById('guessInput').style.display = 'inline';
    fetchPlaylistSongsPage(url);
}

function fetchPlaylistSongsPage(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': music.musicUserToken
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
 * Displays items in passed list. Each item has a listener
 * @param items
 */
function displayItems(items) {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    // console.log(allPlaylists.toString());

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.attributes.name;
        li.setAttribute('data-id', item.id);
        li.classList.add('button', 'is-ghost', 'is-fullwidth');
        li.addEventListener('click', () => {
            if (!playing) {
                selectedPlaylist = item;
                selectedPlaylistId = item.id;
                console.log(`Selected playlist:`, item);
                showGame();
                itemList.innerHTML = '';
            } else {
                songComparator(item.id);
            }
        });
        itemList.appendChild(li);
        // itemList.append(li);
    });
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
 * Plays the game
 *
 * @param songs - playlist songs to play
 */
function play(songs) {
    if (playWithLibrary) {
        document.getElementById('playButton').style.display = 'inline';
        document.getElementById('guessInput').style.display = 'inline';
        document.getElementById('addTime').style.display = 'inline';
        document.getElementById('giveUpButton').style.display = 'inline';
        document.getElementById('homeButton3').style.display = 'inline';
        document.getElementById('loadingMsg').style.display = 'none';
        document.getElementById('stats').style.display = 'inline';
    }
    const music = MusicKit.getInstance();
    playing = true;

    // clear screen
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('authorizeButton').style.display = 'none';
    document.getElementById('unauthorizeButton').style.display = 'none';
    document.getElementById('fetchLibraryButton').style.display = 'none';
    document.getElementById('fetchPlaylistsButton').style.display = 'none';
    document.getElementById('giveUpButton').style.display = 'none';

    displayItems([]);

    document.getElementById('guessInput').style.display = 'inline';
    document.getElementById('guessInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('guessInput').value.toLowerCase();
        filterSongs(searchTerm);
    });
    document.getElementById('stats').style.display = 'inline';

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
    if (gamemode === 0) {
        document.getElementById('giveUpButton').style.display = 'inline';
    }

    console.log(songs);

    document.getElementById('playButton').addEventListener('click', () => {

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

/**
 * Input bar filter for playlists
 * @param searchTerm
 */
function filterPlaylists(searchTerm) {
    const filteredPlaylists = allPlaylists.filter(playlist =>
        playlist.attributes.name.toLowerCase().includes(searchTerm)
    );
    displayItems(filteredPlaylists);
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

    if (playWithLibrary) {
        filteredSongs = librarySongs.filter(song =>
            song.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
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
            songsWrong.push(" " + currentSong.attributes.name + "\n");
            document.getElementById('msg').textContent = 'Incorrect, try again.';
            if (playWithLibrary) {
                play(librarySongs);
            } else {
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
    const songInfo = document.getElementById('msg');
    const music = MusicKit.getInstance();
    songInfo.innerHTML = '';

    if (guess) {
        songInfo.textContent = 'Correct! That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
        updateStats();
        console.log(songCount);
        console.log(playlistSize);
        music.stop();
        if (playlistSize === songCount) {
            endgame();
        } else {
            if (playWithLibrary) {
                play(librarySongs);
            } else {
                play(selectedPlaylistTracks);
            }
        }
    } else {
        songInfo.textContent = 'Incorrect. That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
        music.stop();
        updateStats();
        songsWrong.push(" " + song.attributes.name + "\n");
        console.log(songCount);
        console.log(playlistSize);
        if (playlistSize === songCount) {
            endgame();
        } else {
            if (playWithLibrary) {
                play(librarySongs);
            } else {
                play(selectedPlaylistTracks);
            }
        }
    }
}

/**
 * Function to finish the game
 */
function endgame() {
    const stats = document.getElementById('statsList');
    stats.innerHTML = '';
    document.getElementById('songsWrong').style.display = 'inline';
    document.getElementById('songsWrong').textContent = "Songs you got wrong: " + songsWrong;

    stats.textContent = 'You finished! You got: ' + `${correctCount}` + '/' + `${selectedPlaylistTracks.length}` + " correct.";

    music.stop();
}

// Routing
const routes = {
    '/': showHome,
    '/playlists': showPlaylists,
    '/playlists/play': showGame,
    '/library/play': showGame,
};

function router() {
    const path = window.location.pathname;
    console.log(`Routing to: ${path}`);
    const route = routes[path] || showHome; // Default to home if no match
    route();
}

function showPage(pageId) {
    console.log(`Showing page: ${pageId}`);
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    // console.log(document.getElementById('page3').classList);
}

function showHome() {
    showPage('page1');
}

function showPlaylists() {
    showPage('page2');
    fetchUserPlaylists(music);
}

function showGame() {
    showPage('page3');

    if (playWithLibrary) {
        fetchUserLibrary(music);
    } else {
        fetchPlaylistSongs(selectedPlaylistId);
    }
}