let currentPlanetsUrl = "https://swapi.dev/api/planets/";
let nextUrl = null;
let prevUrl = null;

const planetsBody = document.getElementById('planets-body');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const residentsModal = new bootstrap.Modal(document.getElementById('residentsModal'));


const formatNumber = (num) => {
    if (num === "unknown") return "unknown";
    return new Intl.NumberFormat('en-US').format(num);
};

const formatWater = (val) => {
    return val === "unknown" ? "unknown" : `${val}%`;
};

const getGenderIcon = (gender) => {
    if (gender === "male") return "♂️";
    if (gender === "female") return "♀️";
    return "❓";
};


async function loadPlanets(url) {
    if (!url) return;

    // Loading állapot
    loadingSpinner.classList.remove('d-none');
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    planetsBody.innerHTML = '';

    try {
        const response = await fetch(url);
        const data = await response.json();

        nextUrl = data.next;
        prevUrl = data.previous;

        data.results.forEach(planet => {
            const tr = document.createElement('tr');
            
           
            let residentsBtn = 'Nincs ismert lakos';
            if (planet.residents.length > 0) {
                residentsBtn = `<button class="btn btn-outline-info btn-sm res-btn" 
                                data-urls='${JSON.stringify(planet.residents)}'>
                                ${planet.residents.length} lakos</button>`;
            }

            tr.innerHTML = `
                <td data-label="Név">${planet.name}</td>
                <td data-label="Átmérő">${formatNumber(planet.diameter)} km</td>
                <td data-label="Éghajlat">${planet.climate}</td>
                <td data-label="Terep">${planet.terrain}</td>
                <td data-label="Felszíni víz">${formatWater(planet.surface_water)}</td>
                <td data-label="Népesség">${formatNumber(planet.population)} fő</td>
                <td data-label="Lakosok">${residentsBtn}</td>
            `;
            planetsBody.appendChild(tr);
        });

        // Eseménykezelők a lakos gombokra
        document.querySelectorAll('.res-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const urls = JSON.parse(btn.getAttribute('data-urls'));
                showResidents(urls);
            });
        });

    } catch (error) {
        console.error("Hiba történt:", error);
        alert("Nem sikerült betölteni az adatokat.");
    } finally {
        loadingSpinner.classList.add('d-none');
        nextBtn.disabled = !nextUrl;
        prevBtn.disabled = !prevUrl;
    }
}


async function showResidents(urls) {
    const resBody = document.getElementById('residents-body');
    const resTable = document.getElementById('residents-table');
    const resLoading = document.getElementById('modal-loading');

    resBody.innerHTML = '';
    resTable.classList.add('d-none');
    resLoading.classList.remove('d-none');
    residentsModal.show();

    try {
       
        const promises = urls.map(url => fetch(url).then(r => r.json()));
        const residents = await Promise.all(promises);

        residents.forEach(res => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${res.name}</td>
                <td>${res.height === "unknown" ? "unknown" : res.height / 100 + " m"}</td>
                <td>${res.mass} kg</td>
                <td>${res.skin_color}</td>
                <td>${res.hair_color}</td>
                <td>${res.eye_color}</td>
                <td>${res.birth_year}</td>
                <td class="text-center">${getGenderIcon(res.gender)}</td>
            `;
            resBody.appendChild(tr);
        });

        resLoading.classList.add('d-none');
        resTable.classList.remove('d-none');

    } catch (error) {
        console.error("Lakos hiba:", error);
        resBody.innerHTML = '<tr><td colspan="8" class="text-danger">Hiba a betöltés során!</td></tr>';
        resLoading.classList.add('d-none');
        resTable.classList.remove('d-none');
    }
}


nextBtn.addEventListener('click', () => loadPlanets(nextUrl));
prevBtn.addEventListener('click', () => loadPlanets(prevUrl));


loadPlanets(currentPlanetsUrl);
