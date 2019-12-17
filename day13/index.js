const { loadIntcodeFile } = require('../lib/loadIntcode');
const { playArcadeGame } = require('./arcadeGame');
const { calculatePlotExtents, preparePlotArea, plotPanels } = require('../day11/render');
const readline = require('readline');
const chalk = require('chalk');


const filename = __dirname + '/input.txt';
let CHEATMODE_ON = false;

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright('Beat the game by breaking all the blocks. What is your score after the last block is broken?'));
    console.log(chalk.green('[a] LEFT   [s] STAY   [d] RIGHT   [q] QUIT   [c] CHEAT ON/OFF'));
    // Final score: 18509

    try {
      const program = await loadIntcodeFile(filename);
      const tiles = new Map();
      let score = 0;
      const cursor = preparePlotArea(process.stdout, 45, 25, 1);
      setupInputListener(() => {
        cursor.moveTo(0, 27);
        console.log('[Q]uitting game.')
      });
      cursor.moveTo(0, -1);
      cursor.write('Score:');

      const inputFn = () => {
        if (!!CHEATMODE_ON) {
          return getBallDirFn();
        }

        return new Promise((resolve, reject) => {
          cursor.moveTo(22, -1);
          cursor.write('in');
          listen(cursor, resolve);
        });
      };

      let ballX = 0;
      let paddleX = 0;
      const getBallDirFn = () => {
        cursor.moveTo(25, -1);
        if (paddleX < ballX) {
          cursor.write('←');
          return 1;
        } else if (paddleX > ballX) {
          cursor.write('→');
          return -1;
        }
        return 0;
      }

      for await (const event of playArcadeGame(program, inputFn)) {
        switch (event.event) {
          case 'score':
            //print score
            cursor.moveTo(7, -1);
            if (event.score > score) {
              score = event.score;
            }
            cursor.write(String(event.score));
            break;
          case 'tile':
            let key = String([event.x, event.y]);
            tiles.set(key, event.tileId);
            cursor.moveTo(event.x, event.y);
            cursor.write(getTile(event.tileId));
            if (event.tileId === 3) {
              paddleX = event.x;
            }
            if (event.tileId === 4) {
              ballX = event.x;
            }
            break;
        }
      }

      cursor.close('Final score:', score);
    
      console.log('');
      closeInputListener();

    } catch (ex) {
      console.error(ex);
    }

  })();
}

function getTile(tileId) {
  // ░	▒	▓
  // 0 is an empty tile. No game object appears in this tile.
  // 1 is a wall tile. Walls are indestructible barriers.
  // 2 is a block tile. Blocks can be broken by the ball.
  // 3 is a horizontal paddle tile. The paddle is indestructible.
  // 4 is a ball tile. The ball moves diagonally and bounces off objects.
  switch (tileId) {
    case 0:
      return ' ';
    case 1:
      return '▓';
    case 2:
      return '░';
    case 3:
      return '▔';
    case 4:
      return '●';
    default:
      return '?';
  }
}

function setupInputListener(onExit) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      onExit();
      process.exit();
    } else if (key.name === 'c') {
      // toggle cheat mode
      CHEATMODE_ON = !CHEATMODE_ON;
    }
  });
}

function closeInputListener() {
  console.log('Hit [q] to exit');
}

function listen(cursor, resolve) {
  cursor.moveTo(25, -1);

  process.stdin.once('keypress', (str, key) => {
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      process.exit();
    } else {
      // The arcade cabinet has a joystick that can move left and right. The software reads the position of the joystick with input instructions:

      // If the joystick is in the neutral position, provide 0.
      // If the joystick is tilted to the left, provide -1.
      // If the joystick is tilted to the right, provide 1.
      switch(key.name) {
        case 'a':
          cursor.write('←');
          resolve(-1);
          break;
        case 's':
          cursor.write('↓');
          resolve(0);
          break;
        case 'd':
          cursor.write('→');
          resolve(1);
          break;
        default:
          cursor.write(key.name);
          listen(cursor, resolve);
      }
    }
  });
}
