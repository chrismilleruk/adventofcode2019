const { executeProgramAsGenerator } = require('../lib/intCodeComputer');

async function paintingRobot(programBuffer, onMove) {
  /* 
  You'll need to build a new emergency hull painting robot. The robot needs to be able 
  to move around on the grid of square panels on the side of your ship, detect the color 
  of its current panel, and paint its current panel black or white. (All of the panels are 
  currently black.)

  The Intcode program will serve as the brain of the robot. The program uses input instructions
  to access the robot's camera: provide 0 if the robot is over a black panel or 1 if the robot 
  is over a white panel. Then, the program will output two values:

  First, it will output a value indicating the color to paint the panel the robot is over: 
    0 means to paint the panel black, and 1 means to paint the panel white.
  Second, it will output a value indicating the direction the robot should turn: 
    0 means it should turn left 90 degrees, and 1 means it should turn right 90 degrees.
  After the robot turns, it should always move forward exactly one panel. The robot starts facing up.
  */
  const panels = new Map();
  const state = {
    coord: [0, 0], // x, y
    dir: 0
  };
  const dirMap = [
    [0, 1], // Up
    [1, 0], // Right
    [0, -1], // Down
    [-1, 0], // Left
  ];

  const program = executeProgramAsGenerator(programBuffer, inputFn);
  let iterator = {done:false};
  while (!iterator.done) {
    let panel = getPanel(state.coord);

    iterator = await program.next();
    if (iterator.done) break;
    // First, it will output a value indicating the color to paint the panel the robot is over: 
    // 0 means to paint the panel black, and 1 means to paint the panel white.
    panel.color = iterator.value;/*?*/
    panel.coats += 1;

    iterator = await program.next();
    if (iterator.done) break;
    // Second, it will output a value indicating the direction the robot should turn: 
    // 0 means it should turn left 90 degrees, and 1 means it should turn right 90 degrees.
    state.dir += (iterator.value === 0) ? 3 : 1;
    state.dir %= 4;

    // Advance
    const delta = dirMap[state.dir];
    state.coord[0] += delta[0];
    state.coord[1] += delta[1];

    if (!!onMove) { onMove(panel, state); }
  }

  return panels;

  function getPanel(coord) {
    let key = String(coord);
    let panel = panels.get(key);
    if (!panel) {
      panel = {
        coord: [...coord],
        color: 0,
        coats: 0
      };
      panels.set(key, panel);
    }
    return panel;
  }

  function inputFn() {
    let panel = getPanel(state.coord);
    return panel.color;
  }
}

module.exports = { paintingRobot };
