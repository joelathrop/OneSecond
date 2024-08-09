let music;

let allPlaylists = [];

let playlistsURL = 'https://api.music.apple.com/v1/me/library/playlists?limit=100';

document.addEventListener('DOMContentLoaded', () => {
    music = sessionStorage.getItem('music');
    fetchUserPlaylists(music);
});

/**
 * Makes sure user is authorized to fetch library playlists
 *
 * @param music - MusicKit Instance
 */
function fetchUserPlaylists(music) {
    console.log('Fetching user playlists...');
    const musicUserToken = music.musicUserToken;
    // document.getElementById('searchInput').style.display = 'inline';

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
    });
}