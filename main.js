let results = [];
let now = new Date();
let cdate = new Date(now.getFullYear(), now.getMonth()-1, now.getDate());

let used = [];

function update() {
    // document.getElementById("image-grid").innerHTML = "";
    const div = document.createElement("div");

    for (const data of results) {
        if (data.hdurl == null) continue;
        if (used.includes(data.title)) continue;
        
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';

        const title = data.title || 'Untitled';
        const date = data.date ? new Date(data.date).toLocaleDateString() : 'Unknown date';
        const explanation = data.explanation || 'No description available';
        const imageUrl = data.url || 'https://via.placeholder.com/1024x576';
        const hdUrl = data.hdurl || imageUrl;
        const copyright = data.copyright ? `© ${data.copyright}` : '';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative overflow-hidden';
        imgContainer.style.paddingTop = '56.25%';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = title;
        img.className = 'absolute top-0 left-0 w-full h-full object-cover';
        img.loading = 'lazy';
        imgContainer.appendChild(img);

        const content = document.createElement('div');
        content.className = 'p-4';

        const titleEl = document.createElement('h3');
        titleEl.className = 'font-bold text-lg mb-2 truncate';
        titleEl.textContent = title;

        const desc = document.createElement('p');
        desc.className = 'text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2';
        desc.textContent = explanation;

        const footer = document.createElement('div');
        footer.className = 'flex justify-between items-center';

        const downloadLink = document.createElement('a');
        downloadLink.href = hdUrl;
        downloadLink.className = 'text-primary-light dark:text-primary-dark hover:underline text-sm font-medium';
        downloadLink.textContent = 'Download HD';
        downloadLink.download = `${title.replace(/\s+/g, '-')}.jpg`;

        const dateEl = document.createElement('span');
        dateEl.className = 'text-xs text-gray-500 dark:text-gray-400';
        dateEl.textContent = date;

        if (copyright) {
            const copyrightEl = document.createElement('div');
            copyrightEl.className = 'text-xs text-gray-500 dark:text-gray-400 mt-2';
            copyrightEl.textContent = copyright;
            content.appendChild(copyrightEl);
        }

        footer.appendChild(downloadLink);
        footer.appendChild(dateEl);
        content.appendChild(titleEl);
        content.appendChild(desc);
        content.appendChild(footer);
        card.appendChild(imgContainer);
        card.appendChild(content);

        used.push(data.title);

        div.appendChild(card);
    }
    document.getElementById("image-grid").innerHTML = div.innerHTML;
    used = [];
}

function sortByDateImmutable(images, ascending = false) {
    return [...images].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getOneMonthEarlier(date) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
}

function fetchData() {
    const e = document.getElementById("image-grid");
    // e.innerHTML = "";
    // e.innerText = "Loading... please wait...";
    
    const endDate = formatDate(cdate);
    const newStartDate = getOneMonthEarlier(cdate);
    const startDate = formatDate(newStartDate);
    
    const req = new XMLHttpRequest();
    req.open("GET", `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`);
    req.onload = () => {
        if (req.status === 200) {
            const newResults = JSON.parse(req.response);
            results = [...results, ...newResults];
            results = sortByDateImmutable(results);
            cdate = newStartDate;
            update();
        } else {
            e.innerText = "Error loading data. Please try again.";
        }
    };
    req.onerror = () => {
        e.innerText = "Network error. Please check your connection.";
    };
    req.send();
}

function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more') || document.createElement('button');
    loadMoreBtn.id = 'load-more';
    loadMoreBtn.className = 'bg-primary-light dark:bg-primary-dark text-white font-bold py-2 px-6 rounded-full transition-colors mt-4 mx-auto block';
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.addEventListener('click', fetchData);
    
    if (!document.getElementById('load-more')) {
        document.body.appendChild(loadMoreBtn);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
    setupLoadMoreButton();
});