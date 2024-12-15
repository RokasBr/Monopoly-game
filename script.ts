interface Tile {
    name: string;
    type: string;
    color?: string;
    price?: number;
    rent?: number[];
    houseCost?: number;
    hotelCost?: number;
    description?: string;
    amount?: number;
    rentMultiplier?: number[];
    owner ?: Player;
    houseTier?: number;
}

interface Player {
    name: string;
    position: number;
    money: number;
    figure: string;
}

const players: Player[] = [
    { name: "player-1", position: 0, money: 2000, figure: '🟢'},
    { name: "player-2", position: 0, money: 2000, figure: '🔴'}
];

let currentPlayerIndex = 0;

// roll dice
function rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
}

// update the player's position
function movePlayer(player: Player, steps: number): void {
    const currentCell = document.getElementById(player.position.toString());
    if (currentCell) {
        const playerFigure = currentCell.querySelector(`.player-figure-${player.name}`);
        if (playerFigure) {
            currentCell.removeChild(playerFigure);
        }
    }
    if(player.position + steps > tiles.length) player.money += 100;
    player.position = (player.position + steps) % tiles.length;

    const newCell = document.getElementById(player.position.toString());
    if (newCell) {
        const figureDiv = document.createElement('div');
        figureDiv.className = `player-figure player-figure-${player.name}`;
        figureDiv.textContent = player.figure;
        newCell.appendChild(figureDiv);
    }

    //for rent
    if(returnOwner(player.position) && returnOwner(player.position) != player){
        // @ts-ignore
        player.money -= tiles[player.position].rent[tiles[player.position].houseTier]
        const otherPlayer = players.filter((plr) => plr.name !== player.name)[0];
        // @ts-ignore
        otherPlayer.money += tiles[player.position].rent[tiles[player.position].houseTier];
        // @ts-ignore
        console.log('atiduodi ' + tiles[player.position].rent[tiles[player.position].houseTier])
    }

    if(tiles[player.position].type === "tax"){
        // @ts-ignore
        player.money -= tiles[player.position].amount;
    }
    updateMoney()

}



function handleDiceRoll() {
    const diceRoll = rollDice();

    // Update dice roll result in the pre-defined div
    const rollResultDisplay = document.querySelector('.dice-roll-result') as HTMLDivElement;
    if (rollResultDisplay) {
        rollResultDisplay.innerHTML = `Rolled a ${diceRoll}`;
    }

    // Move the current player
    const currentPlayer = players[currentPlayerIndex];
    movePlayer(currentPlayer, diceRoll);

    // Update turn for the next player
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Update turn display
    const turnDisplay = document.getElementById("turn-display");
    if (turnDisplay) {
        turnDisplay.textContent = `${players[currentPlayerIndex].name}'s turn`.replace('-', ' ').replace('player', 'Player');
    }
}

// Add event listener to the dice roll button
window.addEventListener("DOMContentLoaded", () => {
    assignTileValues();

    const rollDiceBtn = document.getElementById("roll-dice-btn") as HTMLDivElement;
    if (rollDiceBtn) rollDiceBtn.addEventListener("click", handleDiceRoll);
    const buyPropertyBtns = document.querySelectorAll(".buy-property-btn") as NodeListOf<HTMLElement>;
    buyPropertyBtns.forEach((button, i) => {
        button.addEventListener("click", () => handleBuyProperty(players[i]));
    });
    const buyHouseBtns = document.querySelectorAll(".buy-house-btn") as NodeListOf<HTMLElement>;
    buyHouseBtns.forEach((button, i) => {
        button.addEventListener("click", () => handleBuyHouse(players[i]));
    });
    const buyHotelBtns = document.querySelectorAll(".buy-hotel-btn") as NodeListOf<HTMLElement>;
    buyHotelBtns.forEach((button, i) => {
        button.addEventListener("click", () => handleBuyHotel(players[i]));
    });

});
function handleBuyProperty(player: Player) {
    console.log(`Player ${player.name} clicked Buy Property.`);
    console.log(returnOwner(player.position))
    if(tiles[player.position].type === "property")
    {
        if(returnOwner(player.position) === undefined) {
            // @ts-ignore
            if(tiles[player.position].houseCost <= player.money)
            {
                tiles[player.position].owner = player;
                // @ts-ignore
                player.money -= tiles[player.position].price;

                const currentTile = document.getElementById(player.position.toString())
                if (currentTile) {
                    if(player.name === "player-1") currentTile.style.border = "3px solid green";  // Example: Blue border
                    else currentTile.style.border = "4px solid red";
                }
                updateMoney()
            }
            else alert("You don't have enough money");
        }
        else alert("This property is already owned")

    }
    else alert("This is not a property")


}
function handleBuyHotel(player: Player){
    console.log(`Player ${player.name} clicked Buy Hotel.`);

    if(returnOwner(player.position) === player) {
        if(tiles[player.position].type === 'property')
        {
            // @ts-ignore
            if(tiles[player.position].houseTier === 4)
            {
                // @ts-ignore
                if(tiles[player.position].houseCost <= player.money)
                {
                    // @ts-ignore
                    tiles[player.position].houseTier++;

                    // @ts-ignore
                    player.money -= tiles[player.position].hotelCost;

                    updateMoney()
                }
                else alert("You don't have enough money");
            }
            else alert("You don't have maxed out houses, can't buy hotel");
        }
        else alert("This is not buyable property")
    }
    else alert("This property is not owned by you")
}
function handleBuyHouse(player: Player) {
    // console.log(`Player ${player.name} clicked Buy House.`);
    if(returnOwner(player.position) === player) {
        if(tiles[player.position].type === 'property')
        {
            // @ts-ignore
            if(tiles[player.position].houseTier <= 3)
            {
                // @ts-ignore
                if(tiles[player.position].houseCost <= player.money)
                {
                    // @ts-ignore
                    tiles[player.position].houseTier++;

                    // @ts-ignore
                    player.money -= tiles[player.position].houseCost;

                    updateMoney()
                }
                else alert("You don't have enough money");
            }
            else alert("You have maxed out houses, can't buy anymore");
        }
        else alert("This is not buyable property");
    }
    else alert("This property is not owned by you");


}
function updateMoney(): void {
    const moneyDivs = document.querySelectorAll('.money') as NodeListOf<HTMLElement>;
    moneyDivs.forEach((moneyDiv, i) => {
        moneyDiv.innerHTML = `Balance: ${players[i].money}`;
    })
}
function returnOwner(pos: number) : Player | undefined {

    if(tiles[pos].owner)
    {
        return tiles[pos].owner;
    }
    else{
        return undefined;
    }
}

const tiles: Tile[] = [
    {
        "name": "GO",
        "type": "special",
        "description": "Collect $200 when you pass."
    },
    {
        "name": "Mediterranean Avenue",
        "type": "property",
        "color": "brown",
        "price": 60,
        "rent": [2, 10, 30, 90, 160, 250],
        "houseCost": 50,
        "hotelCost": 50,
        "owner": players[0]
    },
    {
        "name": "Community Chest",
        "type": "special",
        "description": "Draw a Community Chest card."
    },
    {
        "name": "Baltic Avenue",
        "type": "property",
        "color": "brown",
        "price": 60,
        "rent": [4, 20, 60, 180, 320, 450],
        "houseCost": 50,
        "hotelCost": 50,
        "owner": players[0]
    },
    {
        "name": "Income Tax",
        "type": "tax",
        "amount": 200
    },
    {
        "name": "Reading Railroad",
        "type": "railroad",
        "price": 200,
        "rent": [25, 50, 100, 200]
    },
    {
        "name": "Oriental Avenue",
        "type": "property",
        "color": "lightblue",
        "price": 100,
        "rent": [6, 30, 90, 270, 400, 550],
        "houseCost": 50,
        "hotelCost": 50
    },
    {
        "name": "Chance",
        "type": "special",
        "description": "Draw a Chance card."
    },
    {
        "name": "Vermont Avenue",
        "type": "property",
        "color": "lightblue",
        "price": 100,
        "rent": [6, 30, 90, 270, 400, 550],
        "houseCost": 50,
        "hotelCost": 50
    },
    {
        "name": "Connecticut Avenue",
        "type": "property",
        "color": "lightblue",
        "price": 120,
        "rent": [8, 40, 100, 300, 450, 600],
        "houseCost": 50,
        "hotelCost": 50
    },
    {
        "name": "Jail",
        "type": "special",
        "description": "Just visiting or in jail."
    },
    {
        "name": "St. Charles Place",
        "type": "property",
        "color": "pink",
        "price": 140,
        "rent": [10, 50, 150, 450, 625, 750],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "Electric Company",
        "type": "utility",
        "price": 150,
        "rentMultiplier": [4, 10]
    },
    {
        "name": "States Avenue",
        "type": "property",
        "color": "pink",
        "price": 140,
        "rent": [10, 50, 150, 450, 625, 750],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "Virginia Avenue",
        "type": "property",
        "color": "pink",
        "price": 160,
        "rent": [12, 60, 180, 500, 700, 900],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "St. James Place",
        "type": "property",
        "color": "orange",
        "price": 180,
        "rent": [14, 70, 200, 550, 750, 950],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "Tennessee Avenue",
        "type": "property",
        "color": "orange",
        "price": 180,
        "rent": [14, 70, 200, 550, 750, 950],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "New York Avenue",
        "type": "property",
        "color": "orange",
        "price": 200,
        "rent": [16, 80, 220, 600, 800, 1000],
        "houseCost": 100,
        "hotelCost": 100
    },
    {
        "name": "Free Parking",
        "type": "special",
        "description": "No action."
    },
    {
        "name": "Kentucky Avenue",
        "type": "property",
        "color": "red",
        "price": 220,
        "rent": [18, 90, 250, 700, 875, 1050],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "Indiana Avenue",
        "type": "property",
        "color": "red",
        "price": 220,
        "rent": [18, 90, 250, 700, 875, 1050],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "Illinois Avenue",
        "type": "property",
        "color": "red",
        "price": 240,
        "rent": [20, 100, 300, 750, 925, 1100],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "B&O Railroad",
        "type": "railroad",
        "price": 200,
        "rent": [25, 50, 100, 200]
    },
    {
        "name": "Atlantic Avenue",
        "type": "property",
        "color": "yellow",
        "price": 260,
        "rent": [22, 110, 330, 800, 975, 1150],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "Ventnor Avenue",
        "type": "property",
        "color": "yellow",
        "price": 260,
        "rent": [22, 110, 330, 800, 975, 1150],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "Water Works",
        "type": "utility",
        "price": 150,
        "rentMultiplier": [4, 10]
    },
    {
        "name": "Marvin Gardens",
        "type": "property",
        "color": "yellow",
        "price": 280,
        "rent": [24, 120, 360, 850, 1025, 1200],
        "houseCost": 150,
        "hotelCost": 150
    },
    {
        "name": "Go to Jail",
        "type": "special",
        "description": "Move directly to Jail. Do not pass GO, do not collect $200."
    },
    {
        "name": "Pacific Avenue",
        "type": "property",
        "color": "green",
        "price": 300,
        "rent": [26, 130, 390, 900, 1100, 1275],
        "houseCost": 200,
        "hotelCost": 200
    },
    {
        "name": "North Carolina Avenue",
        "type": "property",
        "color": "green",
        "price": 300,
        "rent": [26, 130, 390, 900, 1100, 1275],
        "houseCost": 200,
        "hotelCost": 200
    },
    {
        "name": "Pennsylvania Avenue",
        "type": "property",
        "color": "green",
        "price": 320,
        "rent": [28, 150, 450, 1000, 1200, 1400],
        "houseCost": 200,
        "hotelCost": 200
    },
    {
        "name": "Short Line",
        "type": "railroad",
        "price": 200,
        "rent": [25, 50, 100, 200]
    },
    {
        "name": "Park Place",
        "type": "property",
        "color": "darkblue",
        "price": 350,
        "rent": [35, 175, 500, 1100, 1300, 1500],
        "houseCost": 200,
        "hotelCost": 200
    },
    {
        "name": "Luxury Tax",
        "type": "tax",
        "amount": 100
    },
    {
        "name": "Boardwalk",
        "type": "property",
        "color": "darkblue",
        "price": 400,
        "rent": [50, 200, 600, 1400, 1700, 2000],
        "houseCost": 200,
        "hotelCost": 200
    },
    {
        "name": "Luxury Tax",
        "type": "tax",
        "amount": 100
    }

];

function assignTileValues() {
    tiles.forEach((tile, index) => {
        tile.houseTier = 0;

        const cell = document.getElementById((index).toString()) as HTMLElement;
        if (cell) {
            // Clear the cell content before inserting new information
            cell.innerHTML = '';

            // Create and append the color div if the tile has a color
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color';
            if (tile.color) {
                colorDiv.style.backgroundColor = tile.color; // Set the background color
            }
            cell.appendChild(colorDiv);

            // Create and append the name div
            const nameDiv = document.createElement('div');
            nameDiv.className = 'name';
            nameDiv.textContent = tile.name; // Set the name of the tile
            cell.appendChild(nameDiv);

            // Create and append the price div if the tile has a price
            const priceDiv = document.createElement('div');
            priceDiv.className = 'price';
            if (tile.price) {
                priceDiv.textContent = `$${tile.price}`; // Set the price of the tile
            }
            else if(tile.type === "tax"){
                priceDiv.textContent = `$${tile.amount}`;
            }
            cell.appendChild(priceDiv);
        }
    });

    // Spawn player figures on the 0th cell
    const startCell = document.getElementById('0');
    if (startCell) {
        players.forEach((player) => {
            const playerFigure = document.createElement('div');
            playerFigure.className = `player-figure player-figure-${player.name.replace(' ', '-')}`;
            // console.log('player clas: ' + playerFigure.className)
            playerFigure.textContent = player.figure; // Set the player's figure (e.g., 🟢 or 🔴)
            startCell.appendChild(playerFigure);
        });
    }

    updateMoney()

}



