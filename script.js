const typeColor = {
    bug: "#26de81", dragon: "#ffeaa7", electric: "#fed330", fairy: "#FF0069",
    fighting: "#30336b", fire: "#f0932b", flying: "#81ecec", grass: "#00b894",
    ground: "#EFB549", ghost: "#a55eea", ice: "#74b9ff", normal: "#95afc0",
    poison: "#6c5ce7", psychic: "#a29bfe", rock: "#2d3436", water: "#0190FF"
};

const odabirPokemona = document.getElementById('pokemonList');
const player = document.getElementById('player');
const notifs = document.getElementById("notif");
const moves = document.getElementById('moves');

let pokemon1 = null;
let pokemon2 = null;
let pokemon1Moves = [];
let pokemon2Moves = [];
let playerNum = 1;
let pokemoni = [];
let selectedPokemon = null; 
let player1HP = null;
let player2HP = null;
let Player1Turn = true;
let isConfirmed = false;
let Win = false;

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path.endsWith("/") || path.endsWith("/index.html")) {
        initIndexPage();
    } else if (path.endsWith("/fight.html")) {
        initFightPage();
    }
});

window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};

function initIndexPage() {
    uzmiPokemone();
}

function initFightPage() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
        pokemoni = JSON.parse(decodeURIComponent(data));
    }
    getPokeData(pokemoni[0], pokemoni[1]);
}


async function uzmiPokemone() {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
    const data = await response.json();

    odabirPokemona.innerHTML = data.results.map((pokemon, index) => `
        <div class="pokem" id="${index + 1}">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png" loading="lazy">
            <p>${pokemon.name}</p>
        </div>
    `).join('');
    
    document.querySelectorAll(".pokem").forEach(div => {
        div.addEventListener("click", () => {
            if (isConfirmed && playerNum === 1) {
                return;
            }

            if (selectedPokemon) {
                const selectedDiv = document.getElementById(selectedPokemon);
                const confirmButton = selectedDiv.querySelector(".confirm-button");
                if (confirmButton) {
                    selectedDiv.removeChild(confirmButton);
                }
                selectedDiv.style.border = "";
            }

            selectedPokemon = div.id;
            div.style.border = "10px solid #3b4cca";
            let Button = document.createElement("button");
            Button.className = "confirm-button";
            Button.setAttribute('onclick', 'Odaberi()');
            Button.innerHTML = `Confirm`;
            div.appendChild(Button);
        });
    });

    player.innerHTML = `Player ${playerNum}`;
}

function Odaberi() {
    if (!selectedPokemon) {
        alert("Please select a Pokémon first!");
        return;
    }

    if (playerNum < 2) {
        playerNum++;
        player.innerHTML = `Player ${playerNum}`;
        pokemoni.push(selectedPokemon);
        document.getElementById(selectedPokemon).style.background = "#ffcc00";

        const selectedDiv = document.getElementById(selectedPokemon);
        const confirmButton = selectedDiv.querySelector(".confirm-button");
        if (confirmButton) {
            selectedDiv.removeChild(confirmButton); 
        }
        selectedDiv.style.border = "";

        selectedPokemon = null;
        isConfirmed = true;
    } else {
        pokemoni.push(selectedPokemon);
        let encodedArray = encodeURIComponent(JSON.stringify(pokemoni));
        window.location.href = `fight.html?data=${encodedArray}`;
    }
}

async function getPokeData(id1, id2) {
    let response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${id1}`);
    pokemon1 = await response1.json();
    let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${id2}`);
    pokemon2 = await response2.json();
    player1HP = pokemon1.stats[0].base_stat;
    player2HP = pokemon2.stats[0].base_stat;
    await uzmiMoves1(pokemon1);
    await uzmiMoves2(pokemon2);
    generate();
}

async function uzmiMoves1(data) {
    for (let i = 0; i < 4 && i < data.moves.length; i++) {
        let response = await fetch(data.moves[i].move.url);
        let moveData = await response.json();
        pokemon1Moves.push(moveData);
    }
}

async function uzmiMoves2(data) {
    for (let i = 0; i < 4 && i < data.moves.length; i++) {
        let response = await fetch(data.moves[i].move.url);
        let moveData = await response.json();
        pokemon2Moves.push(moveData);
    }
}

function generatePlayer1(data) {
    if (player1HP < 0) {
        player1HP = 0;
    }
    document.getElementById('health1').innerHTML = `${player1HP}/${data.stats[0].base_stat}`;
    document.getElementById('pokemon1-name').innerHTML = capitalize(data.name);
    document.getElementById('img1').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${data.id}.gif`;
    document.getElementById('pokemon1-health').style.width = `${player1HP / data.stats[0].base_stat * 100}%`;
}

function generatePlayer2(data) {
    if (player2HP < 0) {
        player2HP = 0;
    }
    document.getElementById('health2').innerHTML = `${player2HP}/${data.stats[0].base_stat}`;
    document.getElementById('pokemon2-name').innerHTML = capitalize(data.name);
    document.getElementById('img2').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${data.id}.gif`;
    document.getElementById('pokemon2-health').style.width = `${player2HP / data.stats[0].base_stat * 100}%`;
}

function generateMoves(data) {
    moves.innerHTML = "";
    const tooltip = document.getElementById("tooltip");

    for (let i = 0; i < data.length; i++) {
        let moveButton = document.createElement("button");
        moveButton.textContent = data[i].name;
        moveButton.style.background = typeColor[data[i].type.name] || "#ddd";
        moveButton.onmouseenter = (event) => showTooltip(event, data[i]);
        moveButton.onmousemove = (event) => moveTooltip(event);
        moveButton.onmouseleave = () => hideTooltip();
        moveButton.onclick = () => attack(data[i]);

        moves.appendChild(moveButton);
    }
}

function showTooltip(event, moveData) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = `
        <strong>${capitalize(moveData.name)}</strong><br>
        Type: ${moveData.type.name}<br>
        Power: ${moveData.power + 10}<br>
    `;
    tooltip.style.display = "block";
    moveTooltip(event);
}

function moveTooltip(event) {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY + 10 + "px";
}

function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function filterPokemon() {
    let input = document.getElementById("pokemon-select").value.toLowerCase();
    let pokemons = document.querySelectorAll(".pokem");

    pokemons.forEach(pokemon => {
        let name = pokemon.querySelector("p").textContent.toLowerCase();
        if (name.startsWith(input)) {
            pokemon.style.display = "block";
        } else {
            pokemon.style.display = "none";
        }
    });
}

function generate() {
    generatePlayer1(pokemon1);
    generatePlayer2(pokemon2);
    if (!Win) {
        if (Player1Turn) {
            notifs.innerHTML = "Player 1:";
            generateMoves(pokemon1Moves);
        } else {
            notifs.innerHTML = "Player 2:";
            generateMoves(pokemon2Moves);
        }
    } else {
        notifs.innerHTML = "Game Over!";
    }
}

let move1 = null;
let move2 = null;

async function attack(data) {
    if (Player1Turn) {
        move1 = data;
    } else {
        move2 = data;
        await UseAttack(move1, move2);
    }
    Player1Turn = !Player1Turn;
    generate();
}

pokemonImage1 = document.getElementById('img1');
pokemonImage2 = document.getElementById('img2');

async function UseAttack(move1, move2) {
    moves.innerHTML = "";
    hideTooltip();
    if (pokemon1.stats[5].base_stat == pokemon2.stats[5].base_stat) {
        let x = Math.round(Math.random());
        if (x == 0) {
            pokemon1.stats[5].base_stat += 1;
        } else {
            pokemon2.stats[5].base_stat += 1;
        }
    }
    if (pokemon1.stats[5].base_stat > pokemon2.stats[5].base_stat) {
        await ShowMove(pokemon1, move1);
        animateAttack(pokemonImage1, pokemonImage2);
        player2HP = await DoDamage(player2HP, move1);
        generatePlayer2(pokemon2);
        
        if (player2HP > 0) {
            await ShowMove(pokemon2, move2);
            animateAttack(pokemonImage2, pokemonImage1);
            player1HP = await DoDamage(player1HP, move2);
            generatePlayer1(pokemon1);
        } else {
            pokemon2.name = "Dead";
            moves.innerHTML = "Player 1 won!";
            Win = true;
        }
    } else if (pokemon1.stats[5].base_stat < pokemon2.stats[5].base_stat) {
        await ShowMove(pokemon2, move2);
        animateAttack(pokemonImage2, pokemonImage1);
        player1HP = await DoDamage(player1HP, move2);
        generatePlayer1(pokemon1);
        
        if (player1HP > 0) {
            await ShowMove(pokemon1, move1);
            animateAttack(pokemonImage1, pokemonImage2);
            player2HP = await DoDamage(player2HP, move1);
            generatePlayer2(pokemon2);
        } else {
            pokemon1.name = "Dead";
            moves.innerHTML = "Player 2 won!";
            Win = true;
        }
    }

    if (player1HP <= 0) {
        pokemon1.name = "Dead";
        moves.innerHTML = "Player 2 won!";
        Win = true;
    }

    if (player2HP <= 0) {
        pokemon2.name = "Dead";
        moves.innerHTML = "Player 1 won!";
        Win = true;
    }
}

async function ShowMove(pokemon, move) {
    notifs.innerHTML = `${capitalize(pokemon.name)} used ${move.name}!`;
    await sleep(1000);
}

async function DoDamage(pokemon, move) {
    pokemon -= move.power + 10;
    return pokemon;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateAttack(attackerImg, defenderImg) {
    let attackDistance = 300;
    let attackerMove = Math.sign(defenderImg.x - attackerImg.x) * attackDistance;
    await attackerImg.animate([
        { transform: 'translate(0,0)' },
        { transform: `translate(${attackerMove}px,${-attackerMove/5}px)` },
        { transform: 'translate(0,0)' }
    ], { duration: 500, easing: 'ease-in-out' }).finished;
}
