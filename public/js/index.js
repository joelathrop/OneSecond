let songCount = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let music;
        let selectedPlaylistTracks;
        let allPlaylists = [];
        let currentSongId = null;
        let currentSong = null;
        let selectedPlaylistId = null;
        let playing = false;
        let firstTime = false;
        let guess = false;
        const developerToken = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdaVEZCWjRVNDUifQ.eyJpYXQiOjE3MjA4OTk3MTQsImV4cCI6MTczNjQ1MTcxNCwiaXNzIjoiMzNWODU3Tjc0NCJ9.zzlR2GUb829Brq-i_Y5l8RZNLjae34NC0Q4oexSpbZo7igEjc7jrbUOgU5OufcQGRJp5vxWUAiDmoMJh49YCww';

        document.addEventListener('DOMContentLoaded', () => {
            MusicKit.configure({
                developerToken: developerToken,
                app: {
                    name: 'MusicKit Example',
                    build: '1978.4.1'
                }
            });

            // TODO: RIGHT SPOT???
            // document.getElementById('guessInput').style.display = 'none';
            // document.getElementById('homeButton').style.display = 'none';

            setTimeout(() => {
                music = MusicKit.getInstance();

                if (!music) {
                    console.error('Failed to initialize MusicKit instance.');
                    return;
                }

                document.getElementById('authorizeButton').addEventListener('click', () => {
                    music.authorize().then((musicUserToken) => {
                        console.log(`Authorized, music user token: ${musicUserToken}`);
                        document.getElementById('fetchLibraryButton').style.display = 'inline'; // Show fetch library button
                        document.getElementById('fetchPlaylistsButton').style.display = 'inline'; // Show fetch playlists button
                        document.getElementById('unauthorizeButton').style.display = 'inline'; // Show unauthorize button
                    }).catch((error) => {
                        console.error('Authorization error:', error);
                    });
                });

                document.getElementById('fetchLibraryButton').addEventListener('click', () => {
                    fetchUserLibrary(music);
                });

                document.getElementById('fetchPlaylistsButton').addEventListener('click', () => {
                    fetchUserPlaylists(music);
                    showPage('page2');
                });

                document.getElementById('searchInput').addEventListener('input', () => {
                    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                    filterPlaylists(searchTerm);
                });

                document.getElementById('homeButton2').addEventListener('click', () => {
                    reset();
                    showPage('page1');
                })

                document.getElementById('homeButton3').addEventListener('click', () => {
                    reset();
                    showPage('page1');
                })

                document.getElementById('unauthorizeButton').addEventListener('click', () => {
                    music.unauthorize();
                    console.log('User has been unauthorized.');
                    document.getElementById('fetchLibraryButton').style.display = 'none'; // Hide fetch library button
                    document.getElementById('fetchPlaylistsButton').style.display = 'none';
                    document.getElementById('unauthorizeButton').style.display = 'none'; // Hide unauthorize button
                });
            }, 1000); // 2-second delay, adjust as needed
        });

        function reset() {
            songCount = 0;
            correctCount = 0;
            incorrectCount = 0;
            allPlaylists = [];
            currentSongId = null;
            currentSong = null;
            selectedPlaylistId = null;
            playing = false;
            firstTime = false;
            guess = false;

            // what is the difference between textContent and innerHTML
            // and what is the difference between innerHTML and innerText
            document.getElementById('songList').textContent = '';
            document.getElementById('itemList').textContent = '';
            document.getElementById('statsList').textContent = '';
        }

        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        }

        function fetchUserLibrary(music) {
            console.log('Fetching user library...');
            const musicUserToken = music.musicUserToken;

            if (!musicUserToken) {
                console.error('Music user token is undefined. Make sure you are authorized.');
                return;
            }

            const url = 'https://api.music.apple.com/v1/me/library/songs?limit=20';

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
                    displayItems(data.data);
                })
                .catch(error => {
                    console.error('Error fetching library: ', error);
                })
        }

        function fetchUserPlaylists(music) {
            console.log('Fetching user playlists...');
            const musicUserToken = music.musicUserToken;

            if (!musicUserToken) {
                console.error('Music user token is undefined. Make sure you are authorized.');
                return;
            }

            const url = 'https://api.music.apple.com/v1/me/library/playlists?limit=100';

            fetchPlaylistsPage(url);
        }

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
                        displayItems(allPlaylists);
                    }
                })
                .catch(error => {
                    console.error('Error fetching playlists:', error);
                });
        }

        function fetchPlaylistSongs(playlistId) {
            const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

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
                return response.json(); // Parse JSON response
                })
                .then(data => {
                    if (data.data) {
                        selectedPlaylistTracks = data.data;
                        console.log('Tracks in the playlist:', selectedPlaylistTracks);
                        firstTime = true;
                        play(selectedPlaylistTracks);
                    } else {
                        console.error('No tracks found in the playlist response:', data);
                    }
                })
            .catch(error => {
                console.error('Error fetching playlist songs:', error);
            });
        }

        function displayItems(items) {
            const itemList = document.getElementById('itemList');
            itemList.innerHTML = ''; // Clear existing items

            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.attributes.name;
                li.setAttribute('data-id', item.id);
                li.addEventListener('click', () => {
                    if (!playing) {
                        selectedPlaylistId = item.id;
                        console.log(`Selected playlist:`, item);
                        fetchPlaylistSongs(selectedPlaylistId);

                        itemList.innerHTML = '';
                        showPage('page3');
                    } else {
                        songComparator(item.id);
                    }
                });
                itemList.appendChild(li);
            });
        }

        function displaySongs(songs) {
            const songList = document.getElementById('songList');

            if (!songList) {
                console.error('Element with ID "songList" not found.');
                return;
            }

            songList.innerHTML = ''; // Clear existing songs

            songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = `${song.attributes.name} by ${song.attributes.artistName}`;
                songList.appendChild(li);
            });
        }

        function showSongInfo(guess, song) {
            const songInfo = document.getElementById('songList');
            songInfo.innerHTML = '';

            if (guess) {
                songInfo.textContent = 'Correct! That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
                play(selectedPlaylistTracks);
            } else {
                songInfo.textContent = 'Incorrect. That song was: ' + `${song.attributes.name} by ${song.attributes.artistName}` + '. Click Play to play next song.';
                play(selectedPlaylistTracks);
            }
        }

        function songComparator(songId) {
            if (songId === currentSongId) {
                console.log('Guessed correctly');
                songCount++;
                correctCount++;
                guess = true;
            } else {
                console.log('Guessed incorrectly');
                guess = false;
                incorrectCount++;
            }
            showSongInfo(guess, currentSong);
        }

        function filterPlaylists(searchTerm) {
            const filteredPlaylists = allPlaylists.filter(playlist =>
                playlist.attributes.name.toLowerCase().includes(searchTerm)
            );
            displayItems(filteredPlaylists);
        }

        function filterSongs(searchTerm) {
            // hide songs if nothing in the search bar
            // TODO: Also want to limit shown songs to if 2 or 3+ characters match.
            // BUT, can't do this because what if the song is only 1 or 2 characters?
            if (searchTerm.trim() === '') {
                displayItems([]);
                return;
            }

            const filteredSongs = selectedPlaylistTracks.filter(song =>
                song.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            displayItems(filteredSongs);
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function playSong(songId) {
            const music = MusicKit.getInstance();

            music.setQueue({ song: songId }).then(queue => {
                console.log('Playback queue set:', queue);
                music.play().then(() => {
                    console.log('Playback started');
                    currentSongId = songId;
                    setTimeout(() => {
                        music.pause();
                        console.log('Playback paused');
                    }, 3000);
                }).catch(error => {
                    console.error('Error starting playback:', error);
                });
            }).catch(error => {
                console.error('Error setting playback queue:', error);
            });
        }

        function endgame() {
            const stats = document.getElementById('statsList');
            stats.innerHTML = '';

            stats.textContent = 'You finished! You got: ' + `${correctCount}` + '/' + `${incorrectCount + correctCount}` + " correct.";
        }

        function play(songs) {
            playing = true;

            // clear screen
            document.getElementById('searchInput').style.display = 'none';
            document.getElementById('authorizeButton').style.display = 'none';
            document.getElementById('unauthorizeButton').style.display = 'none';
            document.getElementById('fetchLibraryButton').style.display = 'none';
            document.getElementById('fetchPlaylistsButton').style.display = 'none';

            displayItems([]);

            // show guess bar / home button
            // document.getElementById('homeButton').addEventListener('click', () => {
            //     // TODO: GO BACK TO WHERE ALL THE BUTTONS ARE, RESET PLAYING QUEUES, SONG LISTS AND SUCH
            // });
            // document.getElementById('homeButton').style.display = 'inline';

            document.getElementById('guessInput').addEventListener('input', () => {
                const searchTerm = document.getElementById('guessInput').value.toLowerCase();
                filterSongs(searchTerm);
            });
            document.getElementById('guessInput').style.display = 'inline';

            // shuffle songs
            if (firstTime) {
                songs = shuffleArray(songs);
                firstTime = false;
            }

            console.log(songs);

            document.getElementById('playButton').addEventListener('click', () => {
                if (songCount < songs.length) {
                    currentSong = songs[songCount];
                    playSong(songs[songCount].id);
                } else {
                    endgame();
                }
            });
        }