let music;
let MUT;
let selectedPlaylist;
let selectedPlaylistId;

let allPlaylists = [];

let playlistsURL = 'https://api.music.apple.com/v1/me/library/playlists?limit=100';
const developerToken = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdaVEZCWjRVNDUifQ.eyJpYXQiOjE3MjA4OTk3MTQsImV4cCI6MTczNjQ1MTcxNCwiaXNzIjoiMzNWODU3Tjc0NCJ9.zzlR2GUb829Brq-i_Y5l8RZNLjae34NC0Q4oexSpbZo7igEjc7jrbUOgU5OufcQGRJp5vxWUAiDmoMJh49YCww';


document.addEventListener('DOMContentLoaded', () => {
    MusicKit.configure({
        developerToken: developerToken,
        app: {
            name: 'MusicKit Example',
            build: '1978.4.1'
        }
    });

    // setTimeout(() => {
        music = MusicKit.getInstance();
    //     sessionStorage.setItem('music', music);
    // }, 500);

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            filterPlaylists(searchTerm);
        });
    }

    // const gamemode = sessionStorage.getItem('gamemode');
    MUT = sessionStorage.getItem('MUT');
    fetchUserPlaylists(music);
});

/**
 * Makes sure user is authorized to fetch library playlists
 *
 * @param music - MusicKit Instance
 */
function fetchUserPlaylists(music) {
    console.log('Fetching user playlists...');

    if (!MUT) {
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
 * Displays items in passed list. Each item has a listener
 * @param items
 */
function displayItems(items) {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.attributes.name;
        li.setAttribute('data-id', item.id);
        li.classList.add('button', 'is-small', 'is-focused', 'is-dark', 'is-link');
        li.addEventListener('click', () => {
            // selectedPlaylist = item;
            selectedPlaylistId = item.id;
            // sessionStorage.setItem('selectedPlaylist', item);
            sessionStorage.setItem('selectedPlaylistId', item.id);
            console.log(`Selected playlist ID: `, item.id);
            itemList.innerHTML = '';

            window.location.href = '/game';
        });
        itemList.appendChild(li);
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