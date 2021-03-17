const gallery = document.getElementById('gallery');
const searchContainer = document.querySelector('.search-container');
const apiUrl = 'https://randomuser.me/api/?inc=picture,name,email,location,cell,dob&results=12&nat=US';
const body = document.querySelector('body');
const userEmails = [];
const userNames = [];
const userObj = [];

//construct search bar
searchContainer.insertAdjacentHTML('beforeend', `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>
`);

/**
 * Fetches data from the api url
 * @param {string} url - The api url
 * @returns {object} 
 */
function fetchData(url) {
    return fetch(url)
             .then(res => res.json())
             .catch(error => console.log('Error!', error))
}

/**
 * Generates html for employee cards and modal windows
 * @param {object} data - Object passed from data fetched
 */
function generateHTML(data) {
    data.results.map(person => {
        //store emails in userEmails
        userEmails.push(person.email);
        userNames.push(`${person.name.first} ${person.name.last}`);
        userObj.push({name: `${person.name.first} ${person.name.last}`, email: person.email}); 
        
        //construct card 
        gallery.insertAdjacentHTML('beforeend', `
            <div id="${person.email}_card" class="card">
                <div class="card-img-container">
                    <img class="card-img" src="${person.picture.large}" alt="profile picture">
                </div>
                <div class="card-info-container">
                    <h3 id="name" class="card-name cap">${person.name.first} ${person.name.last}</h3>
                    <p class="card-text">${person.email}</p>
                    <p class="card-text cap">${person.location.city}, ${person.location.state}</p>
                </div>
            </div>
        `);

        //construct modal window 
        body.insertAdjacentHTML('afterbegin', `
            <div id="${person.email}_modal" class="modal-container" style="display: none">
                <div class="modal">
                    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                    <div class="modal-info-container">
                        <img class="modal-img" src="${person.picture.large}" alt="profile picture">
                        <h3 id="name" class="modal-name cap">${person.name.first} ${person.name.last}</h3>
                        <p class="modal-text">${person.email}</p>
                        <p class="modal-text cap">${person.location.city}</p>
                        <hr>
                        <p class="modal-text">${person.cell.slice(0,5)} ${person.cell.slice(6,14)}</p>
                        <p class="modal-text">${person.location.street.number} ${person.location.street.name}, ${person.location.state}, ${person.location.postcode}</p>
                        <p class="modal-text">Birthday: ${person.dob.date.slice(5, 7)}/${person.dob.date.slice(8, 10)}/${person.dob.date.slice(0, 4)} </p>
                    </div>
                </div>
            
                <div class="modal-btn-container">
                    <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                    <button type="button" id="modal-next" class="modal-next btn">Next</button>
                </div>
            </div>
        `);
        
        //event listeners for card and modal window close button
        const card = document.getElementById(`${person.email}_card`);
        const modal = document.getElementById(`${person.email}_modal`);
        const modalCloseButton = document.getElementById('modal-close-btn');

        card.addEventListener('click', () => modal.style.display = 'block');
        modalCloseButton.addEventListener('click', () => modal.style.display = 'none');
    });
}

/**
 * Adds event listeners to modal windows, called on initial page load and when search filtered
 * @param {array} someArr - Array of employees, either from original 12 fetched from api, or new set from search filter
 */
function addModalEventListeners (someArr) {
    someArr.map(email => {

        const modal = document.getElementById(`${email}_modal`);
        const modalPrevButton = modal.children[1].firstElementChild;
        const modalNextButton = modal.children[1].lastElementChild;

        modalPrevButton.addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById(`${someArr[someArr.indexOf(email) - 1]}_modal`).style.display = 'block';
        })

        modalNextButton.addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById(`${someArr[someArr.indexOf(email) + 1]}_modal`).style.display = 'block';
        })

        if (someArr.indexOf(email) === 0 && someArr.indexOf(email) === someArr.length - 1) {
            modalPrevButton.style.display = 'none';
            modalNextButton.style.display = 'none';
        } else if (someArr.indexOf(email) === someArr.length - 1) {
            modalNextButton.style.display = 'none';
        } else if (someArr.indexOf(email) === 0) {
            modalPrevButton.style.display = 'none';
        }

    })
}

//erases event listeners for prev/next buttons for all 12 users
function replaceModalBtnHTML () {
    userEmails.map(email => {
        const modal = document.getElementById(`${email}_modal`);
        modal.children[1].innerHTML = `
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        `;
    })
}

let searchList = [];

function searchFunc () {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    searchList = [];

    //first hide every card
    userEmails.forEach(email => document.getElementById(`${email}_card`).style.display = 'none');

    for (let person of userObj) {
        if (searchInput.length !== 0 && (person.name.toLowerCase().includes(searchInput))) {
            searchList.push(person.email)
        } else if (searchInput.length === 0) {
            userEmails.forEach(email => document.getElementById(`${email}_card`).style.display = 'block');
        } 
    }

    if (searchInput.length === 0) {
        searchList = userEmails;
    }

    //finally reveal cards in searchList
    searchList.forEach(email => document.getElementById(`${email}_card`).style.display = 'block');
}

//call function to fetch data
fetchData(apiUrl)
    .then(data => generateHTML(data))
    .then(() => addModalEventListeners(userEmails))

searchContainer.addEventListener('keyup', () => {
    searchFunc();
    replaceModalBtnHTML();
    addModalEventListeners(searchList);
});

//handle edge case when 'x' in the search bar is clicked
searchContainer.addEventListener('search', () => {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    if (searchInput.length === 0) {
        searchList = userEmails;
    }
    searchList.forEach(email => document.getElementById(`${email}_card`).style.display = 'block');
    replaceModalBtnHTML();
    addModalEventListeners(searchList);
})

//handle edge case where search submit button is clicked and fetches a new set of employees
document.getElementById('search-submit').addEventListener('click', (e) => e.preventDefault());
