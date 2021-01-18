const readline = require("readline");
const bluebird = require("bluebird");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const clone = (it) => JSON.parse(JSON.stringify(it));

(async () => {
    console.log("start");

    const inputCount = 8;

    let inputs = await bluebird.mapSeries(new Array(inputCount).fill(1), (it, index) => {
        return new Promise(((resolve, reject) => {
            const id = index + 1;
            rl.question(`masukan bidak ${id} (x,y): `, (input) => {
                const [x,y] = input.split(',');
                resolve({
                    x: +x,
                    y: +y,
                    is_calculated: false,
                    taken_piece: []
                });
            });
        }))
    });

    inputs = inputs.sort((a,b) => {
        if(a.y < b.y) {
            return -1;
        } else if(a.y > b.y) {
            return 1;
        } else {
            if(a.x < b.x) {
                return -1;
            } else if (a.x > b.x) {
                return 1;
            }
            return 0;
        }
    });


    inputs = inputs.map(input => {
        if(input.is_calculated) {
            return input;
        }

        input.is_calculated = true;

        let takenPiece = [];
        const uncalculated = clone(inputs.filter(it => !it.is_calculated).filter(it => !(it.x === input.x && it.y === input.y)).map(it => ({x: it.x,y: it.y})));

        let diagonalCoordinate = [];

        for(let x=input.x,y=input.y;x<=8 && y<=8;x=x+1,y=y+1) {
            diagonalCoordinate.push({x,y});
        }
        for(let x=input.x,y=input.y;x>=1 && y<=8;x=x-1,y=y+1) {
            diagonalCoordinate.push({x,y});
        }

        diagonalCoordinate = diagonalCoordinate.filter(it => {
           return !(it.x === input.x && it.y === input.y);
        });

        takenPiece = takenPiece.concat(uncalculated.filter(it => it.x === input.x));
        takenPiece = takenPiece.concat(uncalculated.filter(it => it.y === input.y));


        uncalculated.map(it => {
            const found = diagonalCoordinate.find(it2 => it2.x === it.x && it2.y === it.y);

            if(found) {
                takenPiece.push(it);
            }
        })

        takenPiece.map(it => {
            takenPiece.is_calculated = true;
        });

        input.taken_piece = takenPiece;

        takenPiece.map(it => {
            const takenP = inputs.find(it2 => it.x === it2.x && it.y === it2.y);
            takenP.is_calculated = true;
        });

        return input;
    });

    const row = new Array(8).fill(1);

    console.log("hasil");

    const havePieceTaken = inputs.filter(it => it.taken_piece.length);
    if(havePieceTaken.length) {
        console.log(havePieceTaken.map(it => `(${it.x},${it.y})`).join(', '));
    } else {
        console.log("tidak ditemukan");
    }

    console.log('   ' + row.map((i, index) => `  ${index+1} `).join(''));
    row.forEach((it, index) => {
        console.log("   " + "-".repeat(33));
        console.log(` ${8 - index} ` + row.map((i, innerIndex) => {
            const xPos = innerIndex;
            const yPos = 8 - index;

            const isExist = inputs.find(it => it.x === xPos && it.y === yPos);
            return `| ${isExist ? 'x' : ' '} `;
        }).join('') + '|');
    });

    console.log("   " + "-".repeat(33));

    if(havePieceTaken.length) {
        console.log("penjelasan");
        havePieceTaken.map(it => {
            console.log(`bidak (${it.x},${it.y}) memakan bidak ${it.taken_piece.map(it => `(${it.x},${it.y})`).join(', ')}`);
        })
    }

    setTimeout(() => {
        process.exit();
    }, 100);
})();

