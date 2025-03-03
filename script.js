document.addEventListener('DOMContentLoaded', function() {
    fetch('karaoke-songs.csv')
        .then(response => response.text())
        .then(data => {
            const songs = [];
            const rows = data.split('\n');
            for (let i = 1; i < rows.length; i++) {
                const columns = rows[i].split(',');
                if (columns.length > 1) {
                    const song = {
                        title: columns[1].trim(),
                        artist: columns[2].trim(),
                        language: columns[3]?.trim() || '',
                        style: columns[4]?.trim() || ''
                    };
                    songs.push(song);
                }
            }

            function normalizeString(str) {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            }

            const itemsPerPage = 20;
            let currentPage = 1;
            let filteredSongs = songs;

            function displayPage(pageNumber) {
                const start = (pageNumber - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const songsToDisplay = filteredSongs.slice(start, end);

                const tableBody = document.querySelector('#songs-table tbody');
                tableBody.innerHTML = '';

                songsToDisplay.forEach(song => {
                    const songRow = document.createElement('tr');
                    songRow.innerHTML = `<td>${song.artist}</td><td>${song.title}</td>`;
                    tableBody.appendChild(songRow);
                });

                document.querySelector('#page-number').textContent = `Page ${pageNumber}`;
                document.querySelector('#prev').disabled = currentPage === 1;
                document.querySelector('#next').disabled = currentPage === Math.ceil(filteredSongs.length / itemsPerPage);
            }

            let timeoutId = null;
            document.querySelector('#search').addEventListener('input', function() {
                clearTimeout(timeoutId);
                const searchTerm = this.value.trim().toLowerCase();
                timeoutId = setTimeout(() => {
                    filteredSongs = songs.filter(song => 
                        normalizeString(song.artist).includes(searchTerm) || 
                        normalizeString(song.title).includes(searchTerm)
                    );
                    filteredSongs.sort((a, b) => {
                        const artistA = a.artist.toLowerCase();
                        const artistB = b.artist.toLowerCase();
                        const titleA = a.title.toLowerCase();
                        const titleB = b.title.toLowerCase();

                        if (artistA === artistB) {
                            return titleA.localeCompare(titleB);
                        }
                        return artistA.localeCompare(artistB);
                    });

                    currentPage = 1;
                    displayPage(currentPage);
                }, 300);
            });

            function filterByLetter(letter) {
                filteredSongs = songs.filter(song => normalizeString(song.artist).startsWith(letter.toLowerCase()));
                currentPage = 1;
                displayPage(currentPage);
            }

            function changePage(direction) {
                currentPage += direction;
                displayPage(currentPage);
            }

            displayPage(currentPage);

            document.querySelectorAll('#alphabet-filter button').forEach(button => {
                button.addEventListener('click', () => filterByLetter(button.textContent));
            });
        })
        .catch(error => console.error('Erreur lors du chargement du fichier CSV:', error));
});
