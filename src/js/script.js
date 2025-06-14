// Selectors

let selectedStarter = null;
let selectedBoss = null;
const mainScreen = document.getElementById('mainScreen')
const battleScreen = document.getElementById("battleScreen");
const playerNameEl = document.getElementById("player-name");
const playerHpEl = document.getElementById("player-hp");
const enemyNameEl = document.getElementById("enemy-name");
const enemyHpEl = document.getElementById("enemy-hp");
const battleLogEl = document.getElementById("battle-log");
const moveButtonsDiv = document.getElementById("move-buttons");

//
//Fetching

function getSpriteURL(name, isBack = false) {
  const formatted = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = isBack
    ? "https://play.pokemonshowdown.com/sprites/ani-back/"
    : "https://play.pokemonshowdown.com/sprites/ani/";
  return `${base}${formatted}.gif`;
}

async function fetchPokemonMoves(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const data = await res.json();

    const validMoves = await getValidMoves(data.moves);

    return validMoves;

  } catch (err) {
    console.error(`Error fetching moves for ${name}:`, err);
    return [];
  }
}

async function getValidMoves(moveList) {
    const selected = []

    while (selected.length < 4 && moveList.length > 0) {
        const random = moveList.splice(Math.floor(Math.random() * moveList.length), 1)[0]
        
        try {
        const res = await fetch(random.move.url);
        const moveData = await res.json(); 

            if (
                    moveData.power &&
                    moveData.accuracy &&
                    (moveData.damage_class.name === "physical" || moveData.damage_class.name === "special")
                ) 
                {
                    selected.push({
                    name: moveData.name.replace(/-/g, " "),
                    power: moveData.power,
                    accuracy: moveData.accuracy / 100,
                    critChance: 0.1,
                    type: moveData.type.name
                    });
                }
        } catch(e) {
            continue;
        }
    }
    return selected
}
//Displays
//
function clearDisplay() {
    mainScreen.innerHTML = '';
    setTimeout(choosePokemonMenu, 2000)
}

function showStarterScreen() {
    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("starterScreen").classList.remove("hidden");
}

function showBattleScreen() {
  document.getElementById("mainScreen").classList.add("hidden");
  document.getElementById("battleScreen").classList.remove("hidden");
}

function updateHUD(player, enemy) {

    //HP Text
    playerHpEl.textContent = player.hp
    enemyHpEl.textContent = enemy.hp

    //HP Animation

    const playerHpBar = document.getElementById("player-hp-bar");
    const enemyHpBar = document.getElementById("enemy-hp-bar");

    const playerPercent = (player.hp / player.maxHp) * 100;
    const enemyPercent = (enemy.hp / enemy.maxHp) * 100;

    playerHpBar.style.width = `${playerPercent}%`;
    enemyHpBar.style.width = `${enemyPercent}%`;


    playerHpBar.className = "h-2 rounded " + getHPColor(playerPercent);
    enemyHpBar.className = "h-2 rounded " + getHPColor(enemyPercent);
}

function getHPColor(percent) { 
  if (percent > 50) return "bg-green-500";
  if (percent > 20) return "bg-yellow-500";
  return "bg-red-500";
}

function disableButtons() {
    const buttons = moveButtonsDiv.querySelectorAll("button");
    buttons.forEach((btn) => btn.disabled === true )
}

function logBattle(message) {
    battleLogEl.innerHTML += `<p>${message}</p>`;
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
}
//Displays
//
//
//Pokemon Creation//
class Pokemon {
    constructor(name, hp, maxHp, type, moves) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.type = type;
        this.moves = moves;
    }
}

class Boss extends Pokemon {
    constructor(name, hp, maxHp, type, moves,difficulty) {
        super(name,hp,maxHp,type,moves);
        this.difficulty = difficulty;
    }
}
        //Starters
        // const blaziken = new Pokemon("Blaziken", 100, 100, "Fire/Fighting", 
        //     [
        //         {name: "Flamethrower", power: 25, accuracy: 0.9, critChance: 0.1},
        //         {name: "Double Kick", power: 15, accuracy: 1.0, critChance: 0.2}
        //     ])
        // const sceptile = new Pokemon("Sceptile", 100, 100, "Grass", 
        //     [
        //         {name: "Leaf Blade", power: 22, accuracy: 1.0, critChance: 0.25},
        //         {name: "Quick Attack", power: 12, accuracy: 1.0, critChance: 0.1}
        //     ])
        // const swampert = new Pokemon("Swampert", 100, 100, "Water/Ground", 
        //     [
        //         {name: "Muddy Water", power: 24, accuracy: 0.85, critChance: 0.15},
        //         {name: "Earthquake", power: 30, accuracy: 0.75, critChance: 0.2}
        //     ])

        //Bosses

        // const kyogre = new Boss("Kyogre", 100, 100, "Water", 
        //     [
        //         { name: "Hydro Pump", power: 30, accuracy: 0.8, critChance: 0.1},
        //         { name: "Surf", power: 20, accuracy: 1.0, critChance: 0.15}
        //     ], "easy")
        // const groudon = new Boss("Groudon", 100, 100, "Ground", 
        //     [
        //         { name: "Earth Power", power: 28, accuracy: 0.9, critChance: 0.15},
        //         { name: "Eruption", power: 25, accuracy: 0.85, critChance: 0.2}
        //     ], "medium")
        // const rayquaza = new Boss("Rayquaza", 100, 100, "Flying/Dragon", 
        //     [
        //         { name: "Dragon Pulse", power: 25, accuracy: 0.95, critChance: 0.2},
        //         { name: "Hyper Beam", power: 35, accuracy: 0.7, critChance: 0.3}
        //     ], "hard")
//Pokemon Creation//
//
//Pre-Battle
async function selectStarter(name) {
    const moves = await fetchPokemonMoves(name);
    if (!moves.length) return;

    selectedStarter = new Pokemon(name, 100, 100, "unknown", moves);

    document.getElementById("player-sprite").src = getSpriteURL(name, true)

    document.getElementById("starterScreen").classList.add("hidden")
    document.getElementById("difficultyScreen").classList.remove("hidden")
}

async function selectDifficulty(level) {

    let bossName

    if (level === "easy") {
        bossName = 'Kyogre'
    }
    else if (level === "medium") {
        bossName = 'Groudon'
    }
    else if (level === "hard") {
        bossName = 'Rayquaza'
    }

    const moves = await fetchPokemonMoves(bossName)
    if (!moves.length) return;

    selectedBoss = new Boss(bossName, 100, 100, "unknown", moves, level);

    document.getElementById("enemy-sprite").src = getSpriteURL(bossName);

    scaleDifficulty(selectedBoss);
    document.getElementById("difficultyScreen").classList.add("hidden");
    setupBattle(selectedStarter, selectedBoss)
}
//Pre-Battle
//
//Execute Moves//
function performMove(attacker, defender, move, logFn = console.log, updateFn = () => {}) {

    if (!move || typeof move.power !== "number") {
        console.error("Invalid move or move power!");
        return;
    }

    logFn(`${attacker.name} used ${move.name}!`)

    //Accuracy Check
    if (Math.random() > move.accuracy) {
        logFn("Missed!");
        updateFn();
        return;
    }

    //Crit check
    const isCrit = Math.random() < move.critChance;
    const damage = isCrit ? move.power * 1.5 : move.power;
    defender.hp = Math.max(0, defender.hp - damage);

    //Log move
    logFn(isCrit ? `It's a critical hit! ${damage.toFixed(1)} DMG!` : `Normal hit: ${damage} DMG!`)
    logFn(`${defender.name} has ${defender.hp}/${defender.maxHp} HP remaining.`)
    updateFn();

}
//Execute Moves//
//
//
//Stats// 
function scaleDifficulty(enemy) {
    if (enemy.difficulty === "medium") {
        enemy.moves.forEach(move => move.power += 5)
    } 
    else if (enemy.difficulty === "hard") {
        enemy.moves.forEach(move => {
            move.power += 5;
            move.critChance += 0.15;
        })
    }
};
//Stats//
//
//
//Battle//
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function playerTurn() {
    const move = blaziken.moves[0]
    performMove(blaziken, kyogre, move);
}

function handlePlayerTurn(move, player, enemy) {
    performMove(player,enemy,move, logBattle, () => updateHUD(player, enemy))

    if (enemy.hp <= 0) {
        logBattle(`${enemy.name} has fainted! You win!`);
        disableButtons();
        return;
    }

    setTimeout(() => {
        const enemyMove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
        performMove(enemy, player, enemyMove, logBattle, () => updateHUD(player,enemy));

        if (player.hp <= 0) {
            logBattle(`${player.name} has fainted! You lose!`);
            disableButtons();
        }
    }, 1000)
}

function enemyTurn() {
    const move = kyogre.moves[Math.floor(Math.random() * kyogre.moves.length)]
    performMove(kyogre, blaziken, move);
}

function setupBattle(playerPokemon, bossPokemon) {
    // Battle Screen Display
    document.getElementById('mainScreen').classList.add('hidden')
    battleScreen.classList.remove('hidden')

    //Update HUD
    playerNameEl.textContent = playerPokemon.name
    playerHpEl.textContent = playerPokemon.hp

    enemyNameEl.textContent = bossPokemon.name
    enemyHpEl.textContent = bossPokemon.hp

    //Clear move display
    battleLogEl.innerHTML = '<p>The battle has begun!</p>'
    moveButtonsDiv.innerHTML = ""

    //Move Buttons
    playerPokemon.moves.map((move) => {
        const btn = document.createElement("button");
        btn.textContent = move.name;
        btn.className = "bg-yellow-200 text-black font-bold py-2 px-4 rounded-xl shadow-inner border-4 border-black hover:brightness-90 transition-all";
        btn.addEventListener("click", () => handlePlayerTurn(move, playerPokemon, bossPokemon));
        moveButtonsDiv.appendChild(btn);
    })
}

async function startBattle() {

    while (blaziken.hp > 0 && kyogre.hp > 0) {
        playerTurn();
        await delay(1000);
        if (kyogre.hp <= 0) break;

        enemyTurn();
        await delay(1000);
    }

    console.log(blaziken.hp > 0 
        ? `Your ${blaziken.name} has defeated ${kyogre.name}! Victory!`
        : `${kyogre.name} has defeated your ${blaziken.name}... You lose.`)
}

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", () => {
    showStarterScreen();
  }, { once: true });
});
